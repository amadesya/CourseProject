CREATE DATABASE IF NOT EXISTS smartfix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartfix;

-- 1. Пользователи
CREATE TABLE Users (
    Id          INT AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,         
    Role        ENUM('Client', 'Technician', 'Admin') NOT NULL DEFAULT 'Client',
    IsVerified  BOOLEAN NOT NULL DEFAULT FALSE,
    Phone       VARCHAR(30) NULL,
    Avatar      TEXT NULL
);

-- 2. Услуги
CREATE TABLE Services (
    Id          INT AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(150) NOT NULL,
    Description TEXT NULL,
    Price       DECIMAL(10,2) NOT NULL
);

-- 3. Заявки на ремонт
CREATE TABLE RepairRequests (
    Id                INT AUTO_INCREMENT PRIMARY KEY,
    ClientId          INT NOT NULL,
    TechnicianId      INT NULL,
    Device            VARCHAR(150) NOT NULL,
    IssueDescription  TEXT NOT NULL,
    Status            ENUM('New', 'InProgress', 'Ready', 'Closed', 'Rejected') NOT NULL DEFAULT 'New',
    CreatedAt         DATE NOT NULL,

    FOREIGN KEY (ClientId)     REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (TechnicianId) REFERENCES Users(Id) ON DELETE SET NULL,

    INDEX idx_status (Status),
    INDEX idx_technician (TechnicianId),
    INDEX idx_client (ClientId),
    INDEX idx_created (CreatedAt DESC)
);

-- 4. Комментарии к заявкам
CREATE TABLE Comments (
    Id              INT AUTO_INCREMENT PRIMARY KEY,
    RepairRequestId INT NOT NULL,
    Author          VARCHAR(100) NOT NULL,
    Text            TEXT NOT NULL,
    Date            VARCHAR(16) NOT NULL,   -- формат "2025-10-25 10:00"

    FOREIGN KEY (RepairRequestId) REFERENCES RepairRequests(Id) ON DELETE CASCADE,
    INDEX idx_request (RepairRequestId)
);

-- ТЕСТОВЫЕ ДАННЫЕ

-- Пользователи
INSERT INTO Users (Name, Email, PasswordHash, Role, IsVerified, Phone, Avatar) VALUES
('Администратор',        'admin@smartfix.com',      '123456', 'Admin',      TRUE,  '+7 (999) 111-22-33', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80 M30 30 L70 70 M70 30 L30 70" stroke="white" stroke-width="5" fill="%23235347"/></svg>'),
('Иван Петров',          'ivan@smartfix.com',       '123456', 'Technician', TRUE,  '+7 (921) 555-44-33', NULL),
('Сергей Сидоров',       'sergey@smartfix.com',     '123456', 'Technician', TRUE,  NULL, NULL),
('Анна Кузнецова',       'anna@client.com',         '123456', 'Client',     TRUE,  '+7 (911) 123-45-67', NULL),
('Пётр Иванов',          'petr@client.com',         '123456', 'Client',     TRUE,  NULL, NULL);

-- Услуги
INSERT INTO Services (Name, Description, Price) VALUES
('Диагностика устройства',          'Полная проверка всех компонентов устройства на наличие неисправностей.', 1000),
('Замена экрана',                   'Установка нового дисплейного модуля.', 5000),
('Замена аккумулятора',             'Установка новой батареи.', 2500),
('Чистка от пыли и влаги',          'Профессиональная чистка внутренних компонентов.', 1500),
('Обновление ПО',                   'Установка последней версии операционной системы и программ.', 1200);

-- Заявки
INSERT INTO RepairRequests (ClientId, Device, IssueDescription, Status, TechnicianId, CreatedAt) VALUES
(4, 'iPhone 13 Pro',         'Разбит экран, не реагирует на касания в верхней части.',                  'InProgress', 2, '2025-10-25'),
(5, 'MacBook Pro 16"',       'Ноутбук сильно греется и шумит даже при небольшой нагрузке.',            'Ready',      3, '2025-10-24'),
(4, 'Apple Watch Series 7',  'Часы перестали включаться после падения.',                                'New',       NULL, '2025-10-26'),
(5, 'Samsung Galaxy S22',    'Быстро разряжается аккумулятор.',                                         'New',        2, '2025-10-28'),
(4, 'iPad Air',              'Не работает кнопка "Домой".',                                             'InProgress', 3, '2025-10-24'),
(4, 'Google Pixel 8',        'Камера не фокусируется.',                                                 'New',        2, '2025-11-04'),
(5, 'Dell XPS 15',           'Проблемы с Wi-Fi модулем.',                                               'InProgress', 3, '2025-11-18'),
(5, 'Sony WH-1000XM5',       'Один наушник не работает.',                                               'New',        2, '2025-11-18'),
(4, 'Nintendo Switch',       'Не заряжается.',                                                          'Ready',      3, '2025-11-25'),
(5, 'GoPro Hero 10',         'Не записывает видео, ошибка карты памяти.',                               'New',       NULL, '2025-11-28');

-- Комментарии
INSERT INTO Comments (RepairRequestId, Author, Text, Date) VALUES
(1, 'Анна Кузнецова',  'Сдала телефон утром.',                                 '2025-10-25 10:00'),
(1, 'Иван Петров',     'Принял в работу. Требуется замена дисплейного модуля. Запчасть заказана.', '2025-10-25 11:30'),
(2, 'Сергей Сидоров',  'Диагностика завершена. Произведена чистка и замена термопасты. Ноутбук готов к выдаче.', '2025-10-26 15:00');
