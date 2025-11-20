-- База данных: SmartFix

CREATE DATABASE IF NOT EXISTS smartfix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartfix;

-- 1. Таблица ролей пользователей
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 2. Таблица пользователей
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    surname VARCHAR(100),
    name VARCHAR(100),
    lastname VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 3. Таблица услуг
CREATE TABLE Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Таблица статусов заявок
CREATE TABLE RequestStatuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 5. Таблица заявок на ремонт
CREATE TABLE Requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    master_id INT NULL,
    service_id INT NOT NULL,
    status_id INT NOT NULL,
    device_model VARCHAR(100),
    problem_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completion_date DATETIME NULL,
    FOREIGN KEY (client_id) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (master_id) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES Services(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES RequestStatuses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_requests_status (status_id),
    INDEX idx_requests_master (master_id),
    INDEX idx_requests_client (client_id)
);

-- 6. Таблица комментариев мастеров
CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    master_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES Requests(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (master_id) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- 7. Таблица истории изменений заявок
DROP TABLE IF EXISTS RequestHistory;

CREATE TABLE RequestHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    changed_by INT NULL,        
    old_status_id INT NULL,
    new_status_id INT NULL,
    old_master_id INT NULL,
    new_master_id INT NULL,
    change_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment VARCHAR(255) NULL,
    FOREIGN KEY (request_id) REFERENCES Requests(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (old_status_id) REFERENCES RequestStatuses(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (new_status_id) REFERENCES RequestStatuses(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (old_master_id) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (new_master_id) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- 8. Заполнение базовых данных

INSERT INTO Roles (name, description) VALUES
('Admin', 'Администратор системы'),
('Master', 'Мастер по ремонту'),
('Client', 'Клиент сервиса');

INSERT INTO RequestStatuses (name) VALUES
('Новая'),
('В работе'),
('Ожидание запчастей'),
('Завершена'),
('Отменена');
