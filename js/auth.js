// Эмуляция базы данных пользователей
const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [
    {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MZHbjS2X6AJR6dY1Jb7R6eIffYIlyO2" // password: "admin123"
    }
];

// Сохранение пользователей в localStorage
function saveUsers() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
}

// Проверка авторизации
function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        // Обновляем кнопки в навигации
        const authButtons = document.getElementById('authButtons');
        if (authButtons) {
            authButtons.innerHTML = `
                <span style="margin-right: 10px;">${user.name}</span>
                <button class="btn-primary" onclick="logout()">Выйти</button>
            `;
        }
        return true;
    }
    return false;
}

// Перенаправление если пользователь не авторизован
function requireAuth() {
    if (!checkAuth() && !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Перенаправление если пользователь авторизован
function redirectIfAuth() {
    if (checkAuth() && (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html'))) {
        window.location.href = 'dashboard.html';
    }
}

// Вход пользователя
function login(email, password) {
    const user = usersDB.find(u => u.email === email);
    
    if (user && password === 'demo123') { // Демо-режим с фиксированным паролем
        sessionStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        }));
        return true;
    }
    
    if (user && bcrypt.compareSync(password, user.password)) {
        sessionStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email
        }));
        return true;
    }
    
    return false;
}

// Регистрация пользователя
function register(name, email, password) {
    if (usersDB.some(u => u.email === email)) {
        return { success: false, message: "Этот email уже зарегистрирован" };
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        id: usersDB.length + 1,
        name,
        email,
        password: hashedPassword
    };
    
    usersDB.push(newUser);
    saveUsers();
    
    return { success: true };
}

// Выход пользователя
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Обработчики форм
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации при загрузке страницы
    if (window.location.pathname.includes('dashboard.html')) {
        requireAuth();
    } else if (window.location.pathname.includes('login.html') || 
               window.location.pathname.includes('register.html')) {
        redirectIfAuth();
    } else {
        checkAuth();
    }
    
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (login(email, password)) {
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('errorMessage').textContent = 'Неверный email или пароль';
            }
        });
    }
    
    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;
            
            if (password !== passwordConfirm) {
                document.getElementById('errorMessage').textContent = 'Пароли не совпадают';
                return;
            }
            
            const result = register(name, email, password);
            if (result.success) {
                window.location.href = 'login.html';
            } else {
                document.getElementById('errorMessage').textContent = result.message;
            }
        });
    }
    
    // Кнопка выхода
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

// Для демонстрации используем простую реализацию bcrypt
const bcrypt = {
    hashSync: (password, salt) => {
        return password + salt; // В реальном приложении используйте библиотеку bcryptjs
    },
    compareSync: (password, hash) => {
        return password + '10' === hash; // Упрощенная проверка для демо
    }
};