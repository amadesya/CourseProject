-- SmartFix clean UTF-8 initialization script

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS smartfix
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE smartfix;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------
-- TABLE: __efmigrationshistory
-- ------------------------------

DROP TABLE IF EXISTS `__efmigrationshistory`;

CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `__efmigrationshistory` VALUES
('20251119165002_InitialCreate','9.0.0'),
('20251120122311_InitialCreate','9.0.0'),
('20251123201509_AddRejectedStatus','9.0.0'),
('20251123201653_AddRejectedStatusSafe','9.0.0'),
('20251123204949_InitialComments3NF','9.0.0');


-- ------------------------------
-- TABLE: Users
-- ------------------------------

DROP TABLE IF EXISTS `Users`;

CREATE TABLE `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Role` int NOT NULL DEFAULT '0',
  `IsVerified` tinyint(1) NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB
  AUTO_INCREMENT=20
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Users` VALUES
(2,'Иван Петров','ivan@smartfix.com','$2a$11$5wN9eFFwc3A8oHUTAgoBPid8QWIFagDycJAvItLMmQZ',1,1,'+7 (921) 555-44-33',NULL),
(3,'Сергей Сидоров','sergey@smartfix.com','$2a$11$5wN9eFFwc3A8oHUTAgoBPid8QWIFagDycJAvItLMmQZ',1,1,NULL,NULL),
(4,'Анна Кузнецова','anna@client.com','$2a$11$5wN9eFFwc3A8oHUTAgoBPid8QWIFagDycJAvItLMmQZ',0,1,'+7 (911) 123-45-67',NULL),
(5,'Пётр Иванов','petr@client.com','$2a$11$5wN9eFFwc3A8oHUTAgoBPid8QWIFagDycJAvItLMmQZ',0,1,NULL,NULL),
(6,'Алексей Иванов','alex@example.com','$2a$11$fii2vHs2TaoDlfnwzAfoFucBEGy.lCJDDmXOv3UJVnFlelgIvku9y',0,0,'+7 (999) 123-45-67',NULL),
(7,'Виталий Каспер','vk@gmail.com','$2a$11$MROnKva9hlOxMLn/QqCEBeczCswnHER5DX3W3FqPfaNL3/Mky9EqK',1,0,NULL,'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0o362T1379/j1Zds27e78tCBvQfv2IMMuzHqMP4vHQTyMWOssrUAAAAASUVORK5CYII=');


-- ------------------------------
-- TABLE: RepairRequests
-- ------------------------------

DROP TABLE IF EXISTS `RepairRequests`;

CREATE TABLE `RepairRequests` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ClientId` int NOT NULL,
  `TechnicianId` int DEFAULT NULL,
  `Device` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `IssueDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Status` enum('New','InProgress','Ready','Closed','Rejected') NOT NULL,
  `CreatedAt` date NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_status` (`Status`),
  KEY `idx_technician` (`TechnicianId`),
  KEY `idx_client` (`ClientId`),
  KEY `idx_created` (`CreatedAt` DESC),
  CONSTRAINT `RepairRequests_ibfk_1` FOREIGN KEY (`ClientId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `RepairRequests_ibfk_2` FOREIGN KEY (`TechnicianId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB
  AUTO_INCREMENT=11
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `RepairRequests` VALUES
(1,4,7,'Samsung A52','Заменить аккумулятор','InProgress','2025-10-25'),
(2,5,2,'MacBook Pro 16"','Ноутбук сильно греется и шумит даже при небольшой нагрузке.','Ready','2025-10-24'),
(3,4,2,'Apple Watch Series 7','Часы перестали включаться после падения.','InProgress','2025-10-26'),
(5,9,7,'Телефон Poco','Срочность: Стандартная. Проблема: Отличный телефон','InProgress','2025-11-23'),
(6,9,7,'Телефон Poco X3 Pro','Срочность: Стандартная. Проблема: Разбит внутри и ему очень грустно. Развеселите его','InProgress','2025-11-23');


-- ------------------------------
-- TABLE: Comments
-- ------------------------------

DROP TABLE IF EXISTS `Comments`;

CREATE TABLE `Comments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RepairRequestId` int NOT NULL,
  `UserId` int NOT NULL,
  `Text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_request` (`RepairRequestId`),
  KEY `idx_user` (`UserId`),
  CONSTRAINT `Comments_ibfk_1` FOREIGN KEY (`RepairRequestId`) REFERENCES `RepairRequests` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `Comments_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB
  AUTO_INCREMENT=6
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Comments` VALUES
(1,1,4,'Сдала телефон утром.','2025-10-25 10:00:00'),
(2,1,2,'Принял в работу. Требуется замена дисплейного модуля. Запчасть заказана.','2025-10-25 11:30:00'),
(3,2,3,'Диагностика завершена. Произведена чистка и замена термопасты. Ноутбук готов к выдаче.','2025-10-26 15:00:00'),
(4,1,4,'11111','2025-12-07 19:26:34'),
(5,1,8,'ыфвв','2025-12-07 20:03:12');


-- ------------------------------
-- TABLE: Services
-- ------------------------------

DROP TABLE IF EXISTS `Services`;

CREATE TABLE `Services` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Price` decimal(65,30) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB
  AUTO_INCREMENT=11
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Services` VALUES
(1,'Диагностика устройства','Полная проверка всех компонентов устройства на наличие неисправностей.',1000.000000000000000000000000000000),
(2,'Замена экрана','Установка нового дисплейного модуля.',5000.000000000000000000000000000000),
(3,'Замена аккумулятора','Установка новой батареи.',2500.000000000000000000000000000000),
(4,'Чистка от пыли и влаги','Профессиональная чистка внутренних компонентов.',1500.000000000000000000000000000000),
(5,'Обновление ПО','Установка последней версии операционной системы и программ.',1200.000000000000000000000000000000);

SET FOREIGN_KEY_CHECKS = 1;
