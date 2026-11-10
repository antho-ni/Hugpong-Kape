<?php
require __DIR__ . '/bootstrap.php';
$staff = require_staff($database);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $reportDate = (string)($_GET['report_date'] ?? gmdate('Y-m-d'));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $reportDate)) {
        respond(400, ['error' => 'Choose a valid report date.']);
    }
    $products = $database->query('SELECT id, name, price, stock FROM products WHERE active = 1 ORDER BY name')->fetchAll(PDO::FETCH_ASSOC);
    $sales = $database->query('
        SELECT sales.id, sales.subtotal, sales.discount, sales.total, sales.payment_method, sales.status, sales.created_at,
               customer.name AS customer_name, customer.email AS customer_email,
               cashier.name AS cashier_name, cashier.email AS cashier_email
        FROM sales
        LEFT JOIN users customer ON customer.id = sales.user_id
        LEFT JOIN users cashier ON cashier.id = sales.staff_id
        ORDER BY sales.id DESC
        LIMIT 50
    ')->fetchAll(PDO::FETCH_ASSOC);
    $saleItems = $database->query('
        SELECT sale_items.sale_id, sale_items.product_id, sale_items.quantity, sale_items.unit_price,
               products.name AS product_name
        FROM sale_items
        LEFT JOIN products ON products.id = sale_items.product_id
        WHERE sale_items.sale_id IN (SELECT id FROM sales ORDER BY id DESC LIMIT 50)
        ORDER BY sale_items.id
    ')->fetchAll(PDO::FETCH_ASSOC);
    $itemsBySale = [];
    foreach ($saleItems as $item) {
        $itemsBySale[(string)$item['sale_id']][] = $item;
    }
    foreach ($sales as &$sale) {
        $sale['items'] = $itemsBySale[(string)$sale['id']] ?? [];
    }
    unset($sale);
    $shiftQuery = $database->prepare('SELECT id, opened_at, opening_cash FROM shifts WHERE staff_id = :staff AND closed_at IS NULL ORDER BY id DESC LIMIT 1');
    $shiftQuery->execute(['staff' => $staff['id']]);
    $shift = $shiftQuery->fetch(PDO::FETCH_ASSOC) ?: null;
    $summaryQuery = $database->prepare("SELECT COUNT(*) AS transactions, COALESCE(SUM(subtotal), 0) AS gross_sales, COALESCE(SUM(total), 0) AS revenue, COALESCE(SUM(discount), 0) AS discounts FROM sales WHERE status = 'completed' AND date(created_at) = :report_date");
    $summaryQuery->execute(['report_date' => $reportDate]);
    $summary = $summaryQuery->fetch(PDO::FETCH_ASSOC);
    $paymentQuery = $database->prepare("SELECT payment_method, COUNT(*) AS transactions, COALESCE(SUM(total), 0) AS total FROM sales WHERE status = 'completed' AND date(created_at) = :report_date GROUP BY payment_method ORDER BY payment_method");
    $paymentQuery->execute(['report_date' => $reportDate]);
    $payments = $paymentQuery->fetchAll(PDO::FETCH_ASSOC);
    $refundQuery = $database->prepare("SELECT COUNT(*) AS transactions, COALESCE(SUM(total), 0) AS total FROM sales WHERE status = 'refunded' AND date(created_at) = :report_date");
    $refundQuery->execute(['report_date' => $reportDate]);
    $refunds = $refundQuery->fetch(PDO::FETCH_ASSOC);
    $productQuery = $database->prepare("SELECT products.name, SUM(sale_items.quantity) AS quantity, SUM(sale_items.quantity * sale_items.unit_price) AS total FROM sale_items JOIN sales ON sales.id = sale_items.sale_id JOIN products ON products.id = sale_items.product_id WHERE sales.status = 'completed' AND date(sales.created_at) = :report_date GROUP BY sale_items.product_id ORDER BY quantity DESC, products.name LIMIT 10");
    $productQuery->execute(['report_date' => $reportDate]);
    $report = ['date' => $reportDate, 'summary' => $summary, 'payments' => $payments, 'refunds' => $refunds, 'top_products' => $productQuery->fetchAll(PDO::FETCH_ASSOC)];
    respond(200, ['products' => $products, 'sales' => $sales, 'shift' => $shift, 'summary' => $summary, 'report' => $report]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Method not allowed.']);
require_csrf();
$body = request_body();
$action = $body['action'] ?? '';

if ($action === 'open_shift') {
    $cash = max(0, (int)($body['opening_cash'] ?? 0));
    $query = $database->prepare('INSERT INTO shifts (staff_id, opened_at, opening_cash) VALUES (:staff, :opened, :cash)');
    $query->execute(['staff' => $staff['id'], 'opened' => gmdate('c'), 'cash' => $cash]);
    audit($database, $staff['id'], 'shift_opened');
    respond(201, ['ok' => true]);
}
if ($action === 'restock') {
    $productId = (int)($body['product_id'] ?? 0);
    $quantity = (int)($body['quantity'] ?? 0);
    $reason = trim((string)($body['reason'] ?? ''));
    if (!$productId || $quantity < 1 || $quantity > 10000 || $reason === '') {
        respond(400, ['error' => 'Choose a product, enter a quantity from 1 to 10,000, and provide a reason.']);
    }
    $product = $database->prepare('SELECT id FROM products WHERE id = :id AND active = 1');
    $product->execute(['id' => $productId]);
    if (!$product->fetch()) {
        respond(404, ['error' => 'Product not found.']);
    }
    $database->beginTransaction();
    $database->prepare('UPDATE products SET stock = stock + :quantity WHERE id = :id')->execute(['quantity' => $quantity, 'id' => $productId]);
    $database->prepare('INSERT INTO stock_movements (product_id, staff_id, type, quantity, reason, created_at) VALUES (:product, :staff, "stock_in", :quantity, :reason, :created)')->execute([
        'product' => $productId,
        'staff' => $staff['id'],
        'quantity' => $quantity,
        'reason' => $reason,
        'created' => gmdate('c'),
    ]);
    audit($database, $staff['id'], 'inventory_restocked');
    $database->commit();
    respond(200, ['ok' => true]);
}
if ($action === 'close_shift') {
    $cash = max(0, (int)($body['closing_cash'] ?? 0));
    $query = $database->prepare('UPDATE shifts SET closed_at = :closed, closing_cash = :cash WHERE id = :id AND staff_id = :staff AND closed_at IS NULL');
    $query->execute(['closed' => gmdate('c'), 'cash' => $cash, 'id' => $body['shift_id'] ?? 0, 'staff' => $staff['id']]);
    if ($query->rowCount() !== 1) respond(404, ['error' => 'Open shift not found.']);
    audit($database, $staff['id'], 'shift_closed');
    respond(200, ['ok' => true]);
}
if ($action === 'refund') {
    $saleId = (int)($body['sale_id'] ?? 0);
    $reason = trim((string)($body['reason'] ?? ''));
    if (!$saleId || $reason === '') respond(400, ['error' => 'Sale and refund reason are required.']);
    $database->beginTransaction();
    $sale = $database->prepare("SELECT id, total, status FROM sales WHERE id = :id");
    $sale->execute(['id' => $saleId]);
    $row = $sale->fetch(PDO::FETCH_ASSOC);
    if (!$row || $row['status'] !== 'completed') { $database->rollBack(); respond(409, ['error' => 'This sale cannot be refunded.']); }
    $database->prepare("UPDATE sales SET status = 'refunded' WHERE id = :id")->execute(['id' => $saleId]);
    $items = $database->prepare('SELECT product_id, quantity FROM sale_items WHERE sale_id = :sale');
    $items->execute(['sale' => $saleId]);
    $restore = $database->prepare('UPDATE products SET stock = stock + :quantity WHERE id = :id');
    foreach ($items as $item) {
        $restore->execute(['quantity' => $item['quantity'], 'id' => $item['product_id']]);
    }
    $database->prepare('INSERT INTO refunds (sale_id, staff_id, amount, reason, created_at) VALUES (:sale, :staff, :amount, :reason, :created)')->execute(['sale' => $saleId, 'staff' => $staff['id'], 'amount' => $row['total'], 'reason' => $reason, 'created' => gmdate('c')]);
    audit($database, $staff['id'], 'sale_refunded');
    $database->commit();
    respond(200, ['ok' => true]);
}
if ($action === 'checkout') {
    $items = is_array($body['items'] ?? null) ? $body['items'] : [];
    $payment = $body['payment_method'] ?? '';
    $customerId = trim((string)($body['user_id'] ?? ''));
    $discountPercent = (int)($body['discount_percent'] ?? 0);
    if (!in_array($discountPercent, [0, 10, 20, 30], true)) respond(400, ['error' => 'Choose a valid discount option.']);
    if (!$items || !in_array($payment, ['cash', 'gcash', 'card'], true)) respond(400, ['error' => 'Add an item and choose a payment method.']);
    $shift = $database->prepare('SELECT id FROM shifts WHERE staff_id = :staff AND closed_at IS NULL ORDER BY id DESC LIMIT 1');
    $shift->execute(['staff' => $staff['id']]);
    $shiftId = $shift->fetchColumn();
    if (!$shiftId) respond(409, ['error' => 'Open a cashier shift before checkout.']);
    if ($customerId !== '') {
        $customer = $database->prepare("SELECT id FROM users WHERE id = :id AND role = 'user' AND verification_status = 'approved'");
        $customer->execute(['id' => $customerId]);
        if (!$customer->fetch()) respond(400, ['error' => 'Choose an approved student account or leave the customer blank.']);
    }
    $database->beginTransaction();
    $subtotal = 0;
    $validated = [];
    foreach ($items as $item) {
        $product = $database->prepare('SELECT id, name, price, stock FROM products WHERE id = :id AND active = 1');
        $product->execute(['id' => (int)($item['id'] ?? 0)]);
        $row = $product->fetch(PDO::FETCH_ASSOC);
        $quantity = max(1, (int)($item['quantity'] ?? 0));
        if (!$row || $row['stock'] < $quantity) { $database->rollBack(); respond(409, ['error' => 'A product is unavailable or out of stock.']); }
        $subtotal += $row['price'] * $quantity;
        $validated[] = [$row, $quantity];
    }
    $discount = (int)floor($subtotal * $discountPercent / 100);
    $total = $subtotal - $discount;
    $sale = $database->prepare('INSERT INTO sales (staff_id, shift_id, user_id, subtotal, discount, total, payment_method, created_at) VALUES (:staff, :shift, :user, :subtotal, :discount, :total, :payment, :created)');
    $sale->execute(['staff' => $staff['id'], 'shift' => $shiftId, 'user' => $customerId ?: null, 'subtotal' => $subtotal, 'discount' => $discount, 'total' => $total, 'payment' => $payment, 'created' => gmdate('c')]);
    $saleId = $database->lastInsertId();
    foreach ($validated as [$product, $quantity]) {
        $database->prepare('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)')->execute([$saleId, $product['id'], $quantity, $product['price']]);
        $database->prepare('UPDATE products SET stock = stock - :quantity WHERE id = :id')->execute(['quantity' => $quantity, 'id' => $product['id']]);
    }
    if ($customerId !== '') {
        $card = $database->prepare('SELECT stamps FROM stamp_cards WHERE user_id = :id');
        $card->execute(['id' => $customerId]);
        $stamps = (int)($card->fetchColumn() ?: 0);
        if ($stamps < 9) {
            $next = $stamps + 1;
            $database->prepare('INSERT INTO stamp_cards (user_id, stamps, updated_at) VALUES (:id, :stamps, :updated) ON CONFLICT(user_id) DO UPDATE SET stamps = excluded.stamps, reward_redeemed = 0, updated_at = excluded.updated_at')->execute(['id' => $customerId, 'stamps' => $next, 'updated' => gmdate('c')]);
            $database->prepare('INSERT INTO purchase_stamps (user_id, staff_id, created_at) VALUES (?, ?, ?)')->execute([$customerId, $staff['id'], gmdate('c')]);
        }
    }
    audit($database, $staff['id'], 'sale_completed');
    $database->commit();
    respond(201, ['sale_id' => $saleId, 'subtotal' => $subtotal, 'discount' => $discount, 'total' => $total]);
}
respond(400, ['error' => 'Unknown POS action.']);
