<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Database connection parameters
$host = 'localhost';
$dbname = 'studex';
$user = 'root';
$password = 'root';
$port = '3306';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $user,
        $password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password-confirm'] ?? '';

    if (empty($name) || empty($email) || empty($password) || empty($password_confirm)) {
        $error = "All fields are required.";
    } elseif ($password !== $password_confirm) {
        $error = "Passwords do not match.";
    } else {
        try {
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = "This email is already registered.";
            } else {
                // Hash the password
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                // Insert new user into the database
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
                $result = $stmt->execute([$name, $email, $hashed_password]);

                if ($result) {
                    header("Location: login.php");
                    exit();
                } else {
                    $error = "Registration error. Please try again.";
                }
            }
        } catch (PDOException $e) {
            $error = "Database error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Регистрация | StudEX</title>
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;700&display=swap" rel="stylesheet"/>
    <style>
        body {
            font-family: \'Geologica\', sans-serif;
            background-color: #F9F9FC;
            color: #18316A;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .login-container {
            background: #fff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            max-width: 400px;
            width: 100%;
        }
        .login-container h2 {
            text-align: center;
            margin-bottom: 24px;
            font-weight: 700;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 0.95rem;
        }
        .btn-primary {
            width: 100%;
            padding: 12px;
            background-color: #1495FF;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-primary:hover {
            background-color: #0E7ACC;
        }
        .switch-link {
            text-align: center;
            margin-top: 16px;
        }
        .switch-link a {
            color: #1495FF;
            text-decoration: underline;
        }
        .error-message {
            color: red;
            text-align: center;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>

<div class="login-container">
    <h2>Регистрация</h2>
    <?php if (isset($error)): ?>
        <div class="error-message">
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>
    <form action="register.php" method="POST">
        <div class="form-group">
            <label for="name">Имя</label>
            <input type="text" id="name" name="name" required placeholder="Иван Иванов">
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="example@mail.ru">
        </div>
        <div class="form-group">
            <label for="password">Пароль</label>
            <input type="password" id="password" name="password" required placeholder="••••••••">
        </div>
        <div class="form-group">
            <label for="password-confirm">Подтвердите пароль</label>
            <input type="password" id="password-confirm" name="password-confirm" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn-primary">Зарегистрироваться</button>
    </form>
    <div class="switch-link">
        Уже есть аккаунт? <a href="login.php">Войти</a>
    </div>
</div>

</body>
</html>