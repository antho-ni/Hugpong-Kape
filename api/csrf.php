<?php
require __DIR__ . '/bootstrap.php';

respond(200, ['token' => csrf_token()]);
