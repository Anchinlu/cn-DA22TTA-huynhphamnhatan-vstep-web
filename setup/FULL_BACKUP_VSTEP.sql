-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.44 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for vstep_db
CREATE DATABASE IF NOT EXISTS `vstep_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vstep_db`;

-- Dumping structure for table vstep_db.bai_hoc
CREATE TABLE IF NOT EXISTS `bai_hoc` (
  `bai_hoc_id` int NOT NULL AUTO_INCREMENT,
  `khoa_hoc_id` int DEFAULT NULL,
  `tieu_de` varchar(100) DEFAULT NULL,
  `noi_dung` text,
  PRIMARY KEY (`bai_hoc_id`),
  KEY `khoa_hoc_id` (`khoa_hoc_id`),
  CONSTRAINT `bai_hoc_ibfk_1` FOREIGN KEY (`khoa_hoc_id`) REFERENCES `khoa_hoc` (`khoa_hoc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.bai_hoc: ~0 rows (approximately)

-- Dumping structure for table vstep_db.bai_nop
CREATE TABLE IF NOT EXISTS `bai_nop` (
  `bai_nop_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `de_thi_id` int DEFAULT NULL,
  `duong_dan_tap_tin` varchar(255) DEFAULT NULL,
  `ngay_nop` datetime DEFAULT CURRENT_TIMESTAMP,
  `bai_tap_id` int DEFAULT NULL,
  `link_nop_bai` text,
  `diem` float DEFAULT NULL,
  `nhan_xet` text,
  `trang_thai_cham` enum('chua_cham','da_cham') DEFAULT 'chua_cham',
  PRIMARY KEY (`bai_nop_id`),
  KEY `user_id` (`user_id`),
  KEY `de_thi_id` (`de_thi_id`),
  KEY `bai_tap_id` (`bai_tap_id`),
  CONSTRAINT `bai_nop_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`),
  CONSTRAINT `bai_nop_ibfk_2` FOREIGN KEY (`de_thi_id`) REFERENCES `de_thi` (`de_thi_id`),
  CONSTRAINT `bai_nop_ibfk_3` FOREIGN KEY (`bai_tap_id`) REFERENCES `bai_tap` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.bai_nop: ~0 rows (approximately)
INSERT INTO `bai_nop` (`bai_nop_id`, `user_id`, `de_thi_id`, `duong_dan_tap_tin`, `ngay_nop`, `bai_tap_id`, `link_nop_bai`, `diem`, `nhan_xet`, `trang_thai_cham`) VALUES
	(1, 7, NULL, NULL, '2025-12-08 09:21:01', 5, 'https://res.cloudinary.com/dmaeuom2i/video/upload/v1765185644/o2olvucu66sto2ls436v.mp4', 10, 'Here is your feedback !!\n\n🔸️Về phát âm\n\nFun,  choose, check, quality, example, vegetables, same, realize\n\nAsk me if you have any further questions !!', 'da_cham');

-- Dumping structure for table vstep_db.bai_tap
CREATE TABLE IF NOT EXISTS `bai_tap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lop_hoc_id` int NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `mo_ta` text,
  `loai_ky_nang` varchar(50) DEFAULT NULL,
  `bai_thi_id` int DEFAULT NULL,
  `han_nop` datetime DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `kieu_nop` enum('file','link','text') DEFAULT 'text',
  `cho_phep_nop_file` tinyint(1) DEFAULT '1',
  `cho_phep_nop_text` tinyint(1) DEFAULT '1',
  `gioi_han_dung_luong` int DEFAULT '5',
  `gioi_han_so_file` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `lop_hoc_id` (`lop_hoc_id`),
  CONSTRAINT `bai_tap_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.bai_tap: ~4 rows (approximately)
INSERT INTO `bai_tap` (`id`, `lop_hoc_id`, `tieu_de`, `mo_ta`, `loai_ky_nang`, `bai_thi_id`, `han_nop`, `ngay_tao`, `kieu_nop`, `cho_phep_nop_file`, `cho_phep_nop_text`, `gioi_han_dung_luong`, `gioi_han_so_file`) VALUES
	(1, 1, 'Luyện Reading Test 1', 'Các em làm bài Reading này để ôn tập B1 nhé.', 'reading', 1, '2025-12-30 23:59:59', '2025-11-28 17:09:33', 'text', 1, 1, 5, 1),
	(2, 1, 'Viết thư cho bạn', 'Task 1: Advice to Friend. Nhớ viết đủ 120 từ.', 'writing', 1, '2025-12-31 23:59:59', '2025-11-28 17:09:33', 'text', 1, 1, 5, 1),
	(3, 3, 'Nộp bài tập tuần 1 ', 'Các em nộp bài ở đây', NULL, NULL, '2025-12-11 00:00:00', '2025-12-02 16:24:15', 'file', 1, 1, 5, 1),
	(4, 3, 'Nộp bài tuần 2', 'các em nộp bài tại đây', NULL, NULL, '2025-12-11 00:00:00', '2025-12-06 15:33:18', 'file', 1, 1, 5, 1),
	(5, 3, 'bài tập tuần 3', 'Các em nộp bài ở đây', NULL, NULL, '2025-12-10 00:00:00', '2025-12-08 08:43:25', 'file', 1, 1, 5, 1);

-- Dumping structure for table vstep_db.cau_hoi
CREATE TABLE IF NOT EXISTS `cau_hoi` (
  `cau_hoi_id` int NOT NULL AUTO_INCREMENT,
  `de_thi_id` int DEFAULT NULL,
  `noi_dung` text,
  `dap_an_dung` text,
  PRIMARY KEY (`cau_hoi_id`),
  KEY `de_thi_id` (`de_thi_id`),
  CONSTRAINT `cau_hoi_ibfk_1` FOREIGN KEY (`de_thi_id`) REFERENCES `de_thi` (`de_thi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.cau_hoi: ~0 rows (approximately)

-- Dumping structure for table vstep_db.de_thi
CREATE TABLE IF NOT EXISTS `de_thi` (
  `de_thi_id` int NOT NULL AUTO_INCREMENT,
  `bai_hoc_id` int DEFAULT NULL,
  `ten_de_thi` varchar(100) DEFAULT NULL,
  `ky_nang` varchar(50) DEFAULT NULL,
  `trinh_do` varchar(10) DEFAULT NULL,
  `mo_ta` text,
  PRIMARY KEY (`de_thi_id`),
  KEY `bai_hoc_id` (`bai_hoc_id`),
  CONSTRAINT `de_thi_ibfk_1` FOREIGN KEY (`bai_hoc_id`) REFERENCES `bai_hoc` (`bai_hoc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.de_thi: ~0 rows (approximately)

-- Dumping structure for table vstep_db.diem_so
CREATE TABLE IF NOT EXISTS `diem_so` (
  `diem_so_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `de_thi_id` int DEFAULT NULL,
  `nghe` float DEFAULT NULL,
  `doc` float DEFAULT NULL,
  `viet` float DEFAULT NULL,
  `noi` float DEFAULT NULL,
  `tong_diem` float DEFAULT NULL,
  PRIMARY KEY (`diem_so_id`),
  KEY `user_id` (`user_id`),
  KEY `de_thi_id` (`de_thi_id`),
  CONSTRAINT `diem_so_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`),
  CONSTRAINT `diem_so_ibfk_2` FOREIGN KEY (`de_thi_id`) REFERENCES `de_thi` (`de_thi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.diem_so: ~0 rows (approximately)

-- Dumping structure for table vstep_db.ket_qua_thi_thu
CREATE TABLE IF NOT EXISTS `ket_qua_thi_thu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ngay_thi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `listening_score` float DEFAULT NULL,
  `reading_score` float DEFAULT NULL,
  `writing_score` float DEFAULT NULL,
  `speaking_score` float DEFAULT NULL,
  `overall_score` float DEFAULT NULL,
  `chi_tiet_bai_lam` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ket_qua_thi_thu_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.ket_qua_thi_thu: ~0 rows (approximately)

-- Dumping structure for table vstep_db.khoa_hoc
CREATE TABLE IF NOT EXISTS `khoa_hoc` (
  `khoa_hoc_id` int NOT NULL AUTO_INCREMENT,
  `ten_khoa_hoc` varchar(100) DEFAULT NULL,
  `trinh_do` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`khoa_hoc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.khoa_hoc: ~0 rows (approximately)

-- Dumping structure for table vstep_db.lich_su_lam_bai
CREATE TABLE IF NOT EXISTS `lich_su_lam_bai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ky_nang` varchar(50) NOT NULL,
  `trinh_do` varchar(10) DEFAULT NULL,
  `diem_so` float NOT NULL,
  `thoi_gian_lam` int DEFAULT NULL,
  `ngay_lam` datetime DEFAULT CURRENT_TIMESTAMP,
  `tieu_de_bai_thi` varchar(255) DEFAULT 'Bài luyện tập',
  `bai_lam_text` text,
  `ai_feedback` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lich_su_lam_bai_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.lich_su_lam_bai: ~33 rows (approximately)
INSERT INTO `lich_su_lam_bai` (`id`, `user_id`, `ky_nang`, `trinh_do`, `diem_so`, `thoi_gian_lam`, `ngay_lam`, `tieu_de_bai_thi`, `bai_lam_text`, `ai_feedback`) VALUES
	(1, 9, 'writing', 'B1', 6.5, 15, '2025-11-27 12:09:18', 'Bài luyện tập', NULL, NULL),
	(2, 3, 'listening', 'B1', 10, 2, '2025-11-27 14:14:18', 'Bài luyện tập', NULL, NULL),
	(3, 3, 'listening', 'B1', 10, 2, '2025-11-27 14:15:58', 'Bài luyện tập', NULL, NULL),
	(4, 3, 'reading', 'B1', 0, 12, '2025-11-27 14:16:33', 'Bài luyện tập', NULL, NULL),
	(5, 3, 'reading', 'B1', 5, 10, '2025-11-27 14:26:51', 'Bài luyện tập', NULL, NULL),
	(6, 3, 'reading', 'B1', 10, 5, '2025-11-27 14:31:55', 'Bài luyện tập', NULL, NULL),
	(7, 7, 'listening', 'B1', 10, 1, '2025-11-28 15:38:30', 'Bài luyện tập', NULL, NULL),
	(8, 7, 'listening', 'B1', 10, 2, '2025-12-06 15:35:08', 'Bài luyện tập', NULL, NULL),
	(9, 7, 'reading', 'B1', 0, 3, '2025-12-06 15:35:32', 'Bài luyện tập', NULL, NULL),
	(10, 7, 'reading', 'B1', 0, 2, '2025-12-06 15:48:36', 'Bài luyện tập', NULL, NULL),
	(11, 7, 'reading', 'B1', 5, 3, '2025-12-06 15:53:14', 'Bài luyện tập', NULL, NULL),
	(12, 7, 'reading', 'B1', 0, 4, '2025-12-06 16:22:13', 'Bài luyện tập', NULL, NULL),
	(13, 7, 'reading', 'B1', 0, 3, '2025-12-06 16:32:44', 'Bài luyện tập', NULL, NULL),
	(14, 7, 'reading', 'B1', 5, 4, '2025-12-06 16:34:15', 'Bài luyện tập', NULL, NULL),
	(15, 7, 'reading', 'B1', 0, 11, '2025-12-06 16:42:03', 'Bài luyện tập', NULL, NULL),
	(16, 7, 'reading', 'B1', 0, 3, '2025-12-07 06:54:25', 'Bài luyện tập', NULL, NULL),
	(17, 7, 'reading', 'B1', 0, 4, '2025-12-07 06:57:17', 'Bài luyện tập', NULL, NULL),
	(18, 7, 'reading', 'B1', 5, 2, '2025-12-07 06:57:35', 'Bài luyện tập', NULL, NULL),
	(19, 7, 'reading', 'B1', 0, 2, '2025-12-07 07:19:14', 'Bài luyện tập', NULL, NULL),
	(20, 7, 'reading', 'B1', 0, 3, '2025-12-07 07:29:25', 'Bài luyện tập', NULL, NULL),
	(21, 10, 'listening', 'B1', 10, 2, '2025-12-09 05:37:46', 'Bài luyện tập', NULL, NULL),
	(22, 10, 'reading', 'B1', 0, 3, '2025-12-09 05:38:40', 'Bài luyện tập', NULL, NULL),
	(23, 7, 'listening', 'B1', 10, 2, '2025-12-09 06:27:21', 'Bài luyện tập', NULL, NULL),
	(24, 7, 'listening', 'B1', 10, 3, '2025-12-09 06:27:49', 'Bài luyện tập', NULL, NULL),
	(25, 7, 'reading', 'B1', 5, 15, '2025-12-09 06:32:02', 'Bài luyện tập', NULL, NULL),
	(26, 7, 'listening', 'B1', 0, 31, '2025-12-11 09:23:56', 'Đời sống - Bài nghe số 1: Cuộc sống hàng ngày', NULL, NULL),
	(27, 7, 'listening', 'B1', 10, 67, '2025-12-11 10:32:47', 'AI Reading - Daily Life: Morning Routine', NULL, NULL),
	(28, 7, 'listening', 'B1', 0, 35, '2025-12-11 10:34:27', 'AI Reading - Daily Life: Morning Routine', NULL, NULL),
	(29, 7, 'reading', 'B1', 0, 171, '2025-12-11 12:31:29', 'Reading - Daily Habits: The Benefits of Walking', NULL, NULL),
	(30, 9, 'reading', 'B1', 5, 46, '2025-12-22 03:11:45', 'Reading - Daily Habits: The Benefits of Walking', NULL, NULL),
	(31, 9, 'reading', 'B1', 5, 63, '2025-12-22 03:13:19', 'Reading - Daily Habits: Healthy Eating', NULL, NULL),
	(32, 9, 'listening', 'B1', 10, 7, '2025-12-22 03:19:14', 'Đời sống - Daily Life: Morning Routine', NULL, NULL),
	(33, 9, 'listening', 'B1', 0, 15, '2025-12-22 03:27:58', 'Đời sống - Daily Life: Morning Routine', NULL, NULL),
	(34, 7, 'writing', 'B1', 8, 9, '2025-12-22 07:05:17', 'Writing - Task 1: Email to a Friend', 'Hi Alex,\n\nThanks for your email. I’m glad to tell you about my favorite TV program. It is a reality show called “Running Man”. This program is very popular in many countries, especially in Asia.\n\nIn the show, the members and guests take part in different games and challenges. They often have to run, solve puzzles, or work in teams to complete missions. The atmosphere is always exciting and full of laughter.\n\nI like this program because it is very entertaining and helps me relax after studying. It also teaches me about teamwork and friendship. Watching it always makes me feel happy.\n\nBest wishes,\nAn Hồ', '{"score":8,"comment":"Bài viết của bạn đã đạt yêu cầu cơ bản của đề bài, thể hiện khả năng viết email và mô tả chương trình TV yêu thích một cách rõ ràng.","corrections":["I’m glad to tell you về my favorite TV program -> I’m glad to tell you about my favorite TV program","It is a reality show called \'Running Man\' -> You could add more details about why it\'s popular or what type of reality show it is","The atmosphere is always exciting and full of laughter -> Câu này có thể được viết lại để mô tả cụ thể hơn, ví dụ: \'The show has a lively atmosphere with lots of humor and exciting moments\'","It also teaches me about teamwork and friendship -> Câu này có thể được viết lại để rõ ràng hơn, ví dụ: \'Additionally, it teaches valuable lessons about teamwork, friendship, and perseverance\'"],"suggestion":"Để cải thiện, bạn nên tập trung vào việc phát triển ý tưởng và mô tả chi tiết hơn, cũng như sử dụng từ vựng và cấu trúc câu đa dạng hơn để thể hiện trình độ tiếng Anh của mình."}'),
	(35, 9, 'listening', 'B1', 10, 27, '2025-12-27 03:06:20', 'Đời sống - Daily Life: Morning Routine', NULL, NULL),
	(36, 9, 'reading', 'B1', 0, 9, '2025-12-27 03:18:09', 'Reading - Daily Habits: The Benefits of Walking', NULL, NULL),
	(37, 9, 'listening', 'B1', 0, 51, '2025-12-27 07:24:14', 'General - Listening Practice 01 - Ordering Coffee', NULL, NULL),
	(38, 9, 'reading', 'B1', 10, 30, '2025-12-27 07:27:04', 'Reading - VSTEP Reading Practice Test 01 - The Importance of Recycling', NULL, NULL);

-- Dumping structure for table vstep_db.listening_audios
CREATE TABLE IF NOT EXISTS `listening_audios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `script_content` text,
  `transcript` text,
  `part` enum('1','2','3') NOT NULL,
  `topic_id` varchar(50) DEFAULT NULL,
  `level_id` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int DEFAULT '900',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.listening_audios: ~3 rows (approximately)
INSERT INTO `listening_audios` (`id`, `title`, `script_content`, `transcript`, `part`, `topic_id`, `level_id`, `created_at`, `duration`) VALUES
	(1, 'Daily Life: Morning Routine', 'My name is John. Every morning, I usually wake up at 7 o\'clock. I do not like waking up early. After getting out of bed, I brush my teeth and wash my face. Then, I go to the kitchen to make breakfast. I usually have eggs and toast with a cup of coffee. After breakfast, I get dressed and drive to work. My office is not far, so it takes only 15 minutes.', NULL, '1', 'daily_life', 'B1', '2025-12-11 10:17:35', 600),
	(2, 'Daily Life: Weekend Plans', 'Hey Sarah, are you busy this weekend? I was thinking about going to the cinema on Saturday night. There is a new Marvel movie coming out. After the movie, we could go to that Italian restaurant near the park. On Sunday, I plan to visit my grandparents. They live in the countryside, so I will take the train early in the morning.', NULL, '1', 'daily_life', 'B1', '2025-12-11 10:17:35', 540),
	(3, 'Education: Library Rules', 'Welcome to the university library. Please listen carefully to the rules. First, you must not bring any food or drinks into the reading rooms. Water bottles are allowed if they have a lid. Second, please keep your phone on silent mode. If you need to take a call, please go to the lobby. Finally, you can borrow up to 5 books at a time for a period of two weeks.', NULL, '1', 'education', 'B1', '2025-12-11 10:17:35', 720),
	(4, 'Listening Practice 01 - Ordering Coffee', 'Man: Good morning. Can I get a medium latte, please?\r\nWoman: Sure. Would you like regular or skim milk?\r\nMan: Regular is fine. And can I have a blueberry muffin as well?\r\nWoman: I\'m afraid we\'re out of blueberry. We have chocolate chip or banana nut.\r\nMan: Oh, okay. I\'ll take the chocolate chip one then. How much is that?\r\nWoman: That comes to five dollars and fifty cents.', NULL, '1', '2', 'B1', '2025-12-27 06:12:50', 900);

-- Dumping structure for table vstep_db.listening_questions
CREATE TABLE IF NOT EXISTS `listening_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audio_id` int NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` char(1) NOT NULL,
  `explanation` text,
  PRIMARY KEY (`id`),
  KEY `audio_id` (`audio_id`),
  CONSTRAINT `listening_questions_ibfk_1` FOREIGN KEY (`audio_id`) REFERENCES `listening_audios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.listening_questions: ~9 rows (approximately)
INSERT INTO `listening_questions` (`id`, `audio_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
	(1, 1, 'What time does John wake up?', '6:00', '7:00', '8:00', '9:00', 'B', 'John says: "I usually wake up at 7 o\'clock."'),
	(2, 1, 'What does he have for breakfast?', 'Cereal and milk', 'Eggs and toast', 'Pancakes', 'Nothing', 'B', 'He eats eggs and toast with coffee.'),
	(3, 2, 'Where does the speaker want to go on Saturday?', 'To a concert', 'To the cinema', 'To the park', 'To a museum', 'B', 'He suggests going to the cinema for a new Marvel movie.'),
	(4, 2, 'How will he travel on Sunday?', 'By car', 'By bus', 'By train', 'By bike', 'C', 'He says: "I will take the train early in the morning."'),
	(5, 3, 'What is NOT allowed in the reading rooms?', 'Laptops', 'Books', 'Food', 'Water', 'C', 'The rule says: "must not bring any food or drinks".'),
	(6, 3, 'How many books can a student borrow?', '3 books', '5 books', '10 books', 'Unlimited', 'B', 'Students can borrow up to 5 books.'),
	(7, 4, 'What drink did the man order?', 'Small Latte', 'Medium Latte', 'Large Coffee', 'Hot Chocolate', 'B', NULL),
	(8, 4, 'What kind of milk did he choose?', 'Skim milk', 'Soy milk', 'Regular milk', 'Almond milk', 'C', NULL),
	(9, 4, 'Which muffin did he finally buy?', 'Blueberry', 'Banana Nut', 'Chocolate Chip', 'Strawberry', 'C', NULL);

-- Dumping structure for table vstep_db.lop_hoc
CREATE TABLE IF NOT EXISTS `lop_hoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_lop` varchar(255) NOT NULL,
  `ma_lop` varchar(20) NOT NULL,
  `giao_vien_id` int NOT NULL,
  `mo_ta` text,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_lop` (`ma_lop`),
  KEY `giao_vien_id` (`giao_vien_id`),
  CONSTRAINT `lop_hoc_ibfk_1` FOREIGN KEY (`giao_vien_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.lop_hoc: ~2 rows (approximately)
INSERT INTO `lop_hoc` (`id`, `ten_lop`, `ma_lop`, `giao_vien_id`, `mo_ta`, `ngay_tao`) VALUES
	(1, 'Luyện thi B1 Cấp tốc', 'VSTEP01', 2, 'Lớp ôn tập 4 kỹ năng dành cho người mất gốc.', '2025-11-28 16:00:14'),
	(2, 'Writing Masterclass', 'WRITE24', 2, 'Chuyên sâu kỹ năng Viết luận và Thư.', '2025-11-28 16:00:14'),
	(3, 'Ôn luyện phát âm cấp tốc', 'VS5080', 9, '🔥 Không học lan man - Chỉ học những gì sẽ thi! Đây là lớp học dành riêng cho các bạn đã có nền tảng cơ bản nhưng chưa tự tin đi thi, cần va chạm với đề thi thật.\n\nBạn sẽ nhận được gì?\n\n📚 Kho đề thi chuẩn: Tiếp cận ngân hàng đề thi sát với thực tế nhất từ các kỳ thi gần đây.\n\n⏱️ Rèn áp lực thời gian: Thi thử ngay trên lớp để làm quen với áp lực phòng thi.\n\n💡 Giải mã đề thi: Phân tích chi tiết đáp án, tại sao chọn đúng/sai.\n\n🗣️ Speaking Mock Test: Thi thử Speaking trực tiếp với giáo viên, nhận feedback ngay lập tức.\n\n⚠️ Yêu cầu: Học viên cần cam kết làm bài tập về nhà đầy đủ để đảm bảo kết quả.', '2025-11-28 16:55:19');

-- Dumping structure for table vstep_db.lop_hoc_thao_luan
CREATE TABLE IF NOT EXISTS `lop_hoc_thao_luan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lop_hoc_id` int NOT NULL,
  `user_id` int NOT NULL,
  `noi_dung` text NOT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lop_hoc_id` (`lop_hoc_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lop_hoc_thao_luan_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lop_hoc_thao_luan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.lop_hoc_thao_luan: ~0 rows (approximately)
INSERT INTO `lop_hoc_thao_luan` (`id`, `lop_hoc_id`, `user_id`, `noi_dung`, `ngay_tao`) VALUES
	(1, 3, 7, 'Chào mn', '2025-12-17 10:13:26');

-- Dumping structure for table vstep_db.mock_tests
CREATE TABLE IF NOT EXISTS `mock_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `listening_id` int DEFAULT NULL,
  `reading_ids` json DEFAULT NULL,
  `writing_ids` json DEFAULT NULL,
  `speaking_ids` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.mock_tests: ~0 rows (approximately)
INSERT INTO `mock_tests` (`id`, `title`, `description`, `listening_id`, `reading_ids`, `writing_ids`, `speaking_ids`, `created_at`, `is_active`) VALUES
	(1, 'Đề thi thử tháng 12', 'Đề tự động ngày 12/27/2025', 4, '[3, 6, 5, 2]', '[2, 5]', '[2, 5, 6]', '2025-12-27 09:58:14', 1);

-- Dumping structure for table vstep_db.nguoi_dung
CREATE TABLE IF NOT EXISTS `nguoi_dung` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `vai_tro_id` int DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `vai_tro_id` (`vai_tro_id`),
  CONSTRAINT `nguoi_dung_ibfk_1` FOREIGN KEY (`vai_tro_id`) REFERENCES `vai_tro` (`vai_tro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.nguoi_dung: ~8 rows (approximately)
INSERT INTO `nguoi_dung` (`user_id`, `ho_ten`, `email`, `mat_khau`, `vai_tro_id`, `ngay_tao`, `reset_token`, `reset_token_expiry`) VALUES
	(1, 'Test Hoc Vien', 'test@gmail.com', '123456', 2, '2025-11-11 14:30:32', NULL, NULL),
	(2, 'An Nguyễn', 'dh2594183@gmail.com', '$2b$10$DhaldGGLGw2AfCTHVt1/HuINDAzsjdkwkQ8DXLcRbOpDs3s5PV3au', 1, '2025-11-15 06:46:23', NULL, NULL),
	(3, 'An Nguyễn', 'test@example.com', '$2b$10$wp7bXs4GfLE9aKOB39efreYQCCp.3WsqcX74oPNEtLlpJCtxkuQee', 1, '2025-11-15 12:20:34', NULL, NULL),
	(7, 'An Nguyễn', '110122027@st.tvu.edu.vn', '$2b$10$r9/DXcJbdo8vvCIgT5rrWeqruUeyBt5BxXaOHaHE98cHx3F0/YUWC', 1, '2025-11-27 08:31:31', NULL, NULL),
	(8, 'Phúc Nguyễn', 'annhat134@gmail.com', '$2b$10$Kx.rpVjMaMmf9BQFGQF0KeShQWacbWb5gbsqxZh7cYCPerf38Z1oe', 1, '2025-11-27 08:33:18', NULL, NULL),
	(9, 'Anchinlu', '123456@st.tvu.edu.vn', '$2b$10$ifNcU0zQBFot1Qip7Mfv0uDkowH4hMPHle/l1ZqKeYqvz/mQ9MkeW', 2, '2025-11-27 11:58:34', NULL, NULL),
	(10, 'Lê Thanh Thiện', 'annhat957@gmail.com', '$2b$10$/JQHC7N2pAdKJn409f50OOGTAAOxsn3QUIUQ3u/hT92ISQRRtBOae', 1, '2025-12-08 10:29:30', NULL, NULL),
	(11, 'Admin', 'admin123@gmail.com', '$2b$10$XiXiAQBvK8Ig7QqalFgh6.xwgHPkFiUpEIOdN3coHnTUOj.IZ3BVa', 3, '2025-12-08 11:51:25', NULL, NULL);

-- Dumping structure for table vstep_db.phan_hoi
CREATE TABLE IF NOT EXISTS `phan_hoi` (
  `phan_hoi_id` int NOT NULL AUTO_INCREMENT,
  `bai_nop_id` int DEFAULT NULL,
  `giao_vien_id` int DEFAULT NULL,
  `noi_dung` text,
  `duong_dan_am_thanh` varchar(255) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`phan_hoi_id`),
  KEY `bai_nop_id` (`bai_nop_id`),
  KEY `giao_vien_id` (`giao_vien_id`),
  CONSTRAINT `phan_hoi_ibfk_1` FOREIGN KEY (`bai_nop_id`) REFERENCES `bai_nop` (`bai_nop_id`),
  CONSTRAINT `phan_hoi_ibfk_2` FOREIGN KEY (`giao_vien_id`) REFERENCES `nguoi_dung` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.phan_hoi: ~0 rows (approximately)

-- Dumping structure for table vstep_db.reading_passages
CREATE TABLE IF NOT EXISTS `reading_passages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `level_id` varchar(10) NOT NULL,
  `topic_id` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.reading_passages: ~6 rows (approximately)
INSERT INTO `reading_passages` (`id`, `title`, `content`, `level_id`, `topic_id`, `created_at`) VALUES
	(1, 'Daily Habits: The Benefits of Walking', 'Walking is one of the easiest and most beneficial exercises you can do. It requires no special equipment, just a good pair of shoes. Studies show that walking for 30 minutes a day can reduce the risk of heart disease and stroke. It also helps to clear your mind and reduce stress. Many people find that taking a walk in the morning gives them energy for the rest of the day.', 'B1', 'daily_life', '2025-12-11 12:04:25'),
	(2, 'Daily Habits: Healthy Eating', 'Eating healthy food is essential for a long life. You should eat plenty of fruits and vegetables every day. Try to avoid sugary drinks and fast food because they contain a lot of fat and sugar. Drinking water is also very important. Doctors recommend drinking at least 8 glasses of water daily to keep your body hydrated.', 'B1', 'daily_life', '2025-12-11 12:04:25'),
	(3, 'Education: Online Learning', 'Online learning has become very popular in recent years. Students can study from home using a computer and internet connection. This method is convenient because you do not have to travel to school. However, some students find it difficult to concentrate at home. They miss meeting their friends and teachers in person.', 'B1', 'education', '2025-12-11 12:04:25'),
	(4, 'Travel: Solo Traveling', 'Traveling alone, or solo traveling, is a unique experience. It forces you to step out of your comfort zone and make decisions by yourself. You can choose where to go and what to eat without asking anyone else. However, it can sometimes be lonely. Safety is also a major concern for solo travelers, especially in unfamiliar countries.', 'B2', 'travel', '2025-12-11 12:04:25'),
	(5, 'Tech: Artificial Intelligence', 'Artificial Intelligence (AI) is transforming the world rapidly. From self-driving cars to smart assistants like Siri and Alexa, AI is everywhere. In the future, AI could help doctors diagnose diseases more accurately and help scientists solve climate change issues. However, there are ethical concerns about AI replacing human jobs and the potential misuse of this powerful technology.', 'C1', 'technology', '2025-12-11 12:04:25'),
	(6, 'VSTEP Reading Practice Test 01 - The Importance of Recycling', 'Recycling and Our Planet\n\nRecycling is one of the best ways for people to have a positive impact on the world in which we live. Recycling is important to both the natural environment and us. We must act fast as the amount of waste we create is increasing all the time.\n\nThe amount of rubbish we create is constantly increasing because people are buying more products and ultimately creating more waste. Increasing wealth means that people are buying more products and ultimately creating more waste. New packaging and technological products are being developed, and much of these contain materials that are not biodegradable.\n\nRecycling is very important as waste has a huge negative impact on the natural environment. Harmful chemicals and greenhouse gasses are released from rubbish in landfill sites. Recycling helps to reduce the pollution caused by waste. Habitat destruction and global warming are some the affects caused by deforestation. Recycling reduces the need for raw materials so that the rainforests can be preserved.\n\nHuge amounts of energy are used when making products from raw materials. Recycling requires much less energy and therefore helps to preserve natural resources. It is essential that we recycle materials such as paper, plastic, and glass to ensure a sustainable future.', 'B1', '1', '2025-12-27 05:44:29');

-- Dumping structure for table vstep_db.reading_questions
CREATE TABLE IF NOT EXISTS `reading_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passage_id` int NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` char(1) NOT NULL,
  `explanation` text,
  PRIMARY KEY (`id`),
  KEY `passage_id` (`passage_id`),
  CONSTRAINT `reading_questions_ibfk_1` FOREIGN KEY (`passage_id`) REFERENCES `reading_passages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.reading_questions: ~13 rows (approximately)
INSERT INTO `reading_questions` (`id`, `passage_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
	(1, 1, 'What is the main benefit of walking mentioned?', 'It helps you sleep', 'It reduces heart disease risk', 'It makes you run faster', 'It cures all diseases', 'B', 'Bài đọc nói: "walking... can reduce the risk of heart disease".'),
	(2, 1, 'What equipment do you need for walking?', 'Expensive gear', 'A bicycle', 'A good pair of shoes', 'Nothing at all', 'C', 'Bài đọc nói: "requires no special equipment, just a good pair of shoes".'),
	(3, 2, 'What should you avoid eating?', 'Fruits', 'Vegetables', 'Fast food', 'Rice', 'C', 'Bài đọc khuyên: "avoid sugary drinks and fast food".'),
	(4, 2, 'How much water should you drink daily?', '2 glasses', '4 glasses', '8 glasses', '10 glasses', 'C', 'Doctors recommend "at least 8 glasses".'),
	(5, 3, 'Why is online learning convenient?', 'It is cheaper', 'No need to travel', 'Teachers are better', 'You get free computers', 'B', 'Lý do là: "you do not have to travel to school".'),
	(6, 3, 'What is a disadvantage of studying at home?', 'Too much homework', 'Hard to concentrate', 'Internet is slow', 'No books', 'B', 'Một số học sinh thấy "difficult to concentrate at home".'),
	(7, 4, 'What is a benefit of solo traveling?', 'It is cheaper', 'You make your own decisions', 'You are never lonely', 'It is safer', 'B', 'Bạn được: "choose where to go... without asking anyone else".'),
	(8, 4, 'What is a major concern mentioned?', 'Cost', 'Language barrier', 'Safety', 'Food quality', 'C', 'Bài đọc nhắc đến: "Safety is also a major concern".'),
	(9, 5, 'How can AI help doctors?', 'Perform surgery alone', 'Diagnose diseases', 'Make medicine', 'Replace nurses', 'B', 'AI giúp "diagnose diseases more accurately".'),
	(10, 5, 'Why are people worried about AI?', 'It is too expensive', 'It might replace human jobs', 'It is too slow', 'It consumes too much power', 'B', 'Lo ngại về đạo đức: "concerns about AI replacing human jobs".'),
	(11, 6, 'What is the main idea of the passage?', 'The benefits of recycling', 'How to recycle paper', 'The history of plastic', 'The dangers of pollution', 'A', NULL),
	(12, 6, 'According to the text, what can be recycled?', 'Only paper', 'Only plastic', 'Paper, plastic, and glass', 'Only glass', 'C', NULL),
	(13, 6, 'Why is recycling important?', 'It makes money', 'It saves energy and resources', 'It is a fun hobby', 'It is required by law', 'B', NULL);

-- Dumping structure for table vstep_db.slideshow
CREATE TABLE IF NOT EXISTS `slideshow` (
  `slide_id` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) NOT NULL,
  `mo_ta` text,
  `nut_cta` varchar(50) DEFAULT NULL,
  `anh_url` varchar(255) NOT NULL,
  `thu_tu` int DEFAULT '0',
  `features` json DEFAULT NULL,
  PRIMARY KEY (`slide_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.slideshow: ~4 rows (approximately)
INSERT INTO `slideshow` (`slide_id`, `tieu_de`, `mo_ta`, `nut_cta`, `anh_url`, `thu_tu`, `features`) VALUES
	(1, 'Chinh Phục Kỹ Năng Nghe', 'Luyện nghe đa dạng chủ đề học thuật và đời sống. Cải thiện kỹ năng bắt từ khóa và hiểu ý chính.', 'Luyện Nghe ngay', '/img/listening.jpg', 1, '["Bài giảng & Hội thoại VSTEP", "Luyện tập bắt từ khóa (Keyword)", "Phân tích đáp án chi tiết"]'),
	(2, 'Làm Chủ Kỹ Năng Đọc Hiểu', 'Phân tích bài đọc VSTEP phức tạp, học chiến thuật suy luận và mở rộng vốn từ vựng học thuật.', 'Bắt đầu Đọc', '/img/reading.jpg', 2, '["Ngân hàng 100+ bài đọc", "Chiến thuật Skimming & Scanning", "Giải thích từ vựng học thuật"]'),
	(3, 'Tự Tin Thể Hiện Quan Điểm', 'Thực hành 3 phần thi nói VSTEP. Ghi âm và nhận phản hồi chi tiết từ giáo viên hoặc Trợ lý AI.', 'Luyện Nói ngay', '/img/speaking.jpg', 3, '["Phòng thi ảo (Mock Speaking Test)", "Ghi âm & Tự đánh giá", "Phản hồi từ AI & Giáo viên"]'),
	(4, 'Viết Luận Chuẩn VSTEP', 'Nắm vững cấu trúc viết thư, biểu đồ và bài luận. Nhận chấm điểm và gợi ý cải thiện từ hệ thống.', 'Luyện Viết ngay', '/img/writing.jpg', 4, '["Hướng dẫn Task 1 (Viết thư/Biểu đồ)", "Phân tích bài luận Task 2", "Hệ thống chấm điểm & Gợi ý"]');

-- Dumping structure for table vstep_db.speaking_questions
CREATE TABLE IF NOT EXISTS `speaking_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part` int NOT NULL COMMENT '1: Social Interaction, 2: Solution Discussion, 3: Topic Development',
  `topic_id` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `level_id` varchar(10) DEFAULT NULL,
  `question_text` text,
  `img_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.speaking_questions: ~8 rows (approximately)
INSERT INTO `speaking_questions` (`id`, `part`, `topic_id`, `title`, `level_id`, `question_text`, `img_url`, `created_at`) VALUES
	(1, 1, 'daily_life', 'Part 1: Hobbies & Interests', NULL, 'Let’s talk about your hobbies.\n1. What do you like to do in your free time?\n2. Do you prefer spending time alone or with others?\n3. What is a new hobby you would like to take up in the future?', NULL, '2025-12-11 13:16:00'),
	(2, 1, 'travel', 'Part 1: Holidays', NULL, 'Let’s talk about holidays.\n1. How often do you go on holiday?\n2. Do you prefer relaxing holidays or active holidays?\n3. What was the best holiday you ever had?', NULL, '2025-12-11 13:16:00'),
	(3, 1, 'education', 'Part 1: Learning English', NULL, 'Let’s talk about learning languages.\n1. How long have you been learning English?\n2. What do you find most difficult about learning English?\n3. Do you think English will be important for your future career?', NULL, '2025-12-11 13:16:00'),
	(4, 2, 'daily_life', 'Part 2: Choosing a Gift', NULL, 'Situation: You are choosing a birthday gift for your best friend who loves technology. There are three options:\nA. A smart watch\nB. A wireless headphone\nC. A portable power bank.\n\nWhich option do you think is the best choice? Explain why you chose it and why you rejected the other two.', NULL, '2025-12-11 13:16:00'),
	(5, 2, 'travel', 'Part 2: Transport for Trip', NULL, 'Situation: Your class is planning a trip to the beach which is 100km away. There are three means of transport:\nA. By bus\nB. By motorbike\nC. By train.\n\nChoose the best option and explain your choice.', NULL, '2025-12-11 13:16:00'),
	(6, 3, 'education', 'Part 3: Online Learning', NULL, 'Topic: Online learning has become increasingly popular.\n\nDiscuss the benefits of online learning:\n- Convenience (Study anywhere)\n- Cost-saving (No travel cost)\n- Flexibility (Self-paced)\n\nFollow-up questions: Do you think online learning will replace traditional schools?', NULL, '2025-12-11 13:16:00'),
	(7, 3, 'technology', 'Part 3: Impact of Technology', NULL, 'Topic: Technology has changed the way people communicate.\n\nDiscuss the effects:\n- Instant connection\n- Loss of face-to-face interaction\n- Dependency on devices\n\nFollow-up questions: How has technology affected your personal relationships?', NULL, '2025-12-11 13:16:00'),
	(8, 1, '2', 'Speaking Part 1 - Hobbies and Travel', 'B1', 'Let\'s talk about your Hobbies.\n\nWhat do you like doing in your free time?\n\nDo you prefer spending your free time alone or with other people?\n\nIs there a new hobby you would like to take up in the future?\n\nLet\'s talk about Travel.\n\nDo you like traveling? Why or why not?\n\nWhich place have you visited that you liked the most?\n\nDo you prefer traveling by car or by train?', NULL, '2025-12-27 08:31:57');

-- Dumping structure for table vstep_db.tai_lieu_lop
CREATE TABLE IF NOT EXISTS `tai_lieu_lop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lop_hoc_id` int NOT NULL,
  `ten_tai_lieu` varchar(255) NOT NULL,
  `duong_dan` text NOT NULL,
  `loai_file` varchar(50) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lop_hoc_id` (`lop_hoc_id`),
  CONSTRAINT `tai_lieu_lop_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.tai_lieu_lop: ~1 rows (approximately)
INSERT INTO `tai_lieu_lop` (`id`, `lop_hoc_id`, `ten_tai_lieu`, `duong_dan`, `loai_file`, `ngay_tao`) VALUES
	(1, 3, '3 bac_Huong dan cac buoc lam bai thi tren may tinh_danh cho thi sinh.pdf', 'https://res.cloudinary.com/dmaeuom2i/image/upload/v1765188966/u84uifk1n25cxfxrieb6.pdf', 'pdf', '2025-12-08 10:16:00'),
	(2, 3, 'sample_reading.xlsx', 'https://res.cloudinary.com/dmaeuom2i/raw/upload/v1766839292/jwtubh7f3l51nunmbo8c.xlsx', 'file', '2025-12-27 12:41:31');

-- Dumping structure for table vstep_db.thanh_vien_lop
CREATE TABLE IF NOT EXISTS `thanh_vien_lop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lop_hoc_id` int NOT NULL,
  `hoc_vien_id` int NOT NULL,
  `ngay_tham_gia` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` enum('pending','approved') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lop_hoc_id` (`lop_hoc_id`,`hoc_vien_id`),
  KEY `hoc_vien_id` (`hoc_vien_id`),
  CONSTRAINT `thanh_vien_lop_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `thanh_vien_lop_ibfk_2` FOREIGN KEY (`hoc_vien_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.thanh_vien_lop: ~1 rows (approximately)
INSERT INTO `thanh_vien_lop` (`id`, `lop_hoc_id`, `hoc_vien_id`, `ngay_tham_gia`, `trang_thai`) VALUES
	(1, 1, 7, '2025-11-28 16:29:29', 'pending'),
	(2, 3, 7, '2025-11-28 16:55:37', 'approved'),
	(3, 3, 10, '2025-12-08 10:30:09', 'pending');

-- Dumping structure for table vstep_db.topics
CREATE TABLE IF NOT EXISTS `topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.topics: ~2 rows (approximately)
INSERT INTO `topics` (`id`, `name`, `slug`, `created_at`) VALUES
	(1, 'Environment', 'environment', '2025-12-27 05:25:02'),
	(2, 'Daily Life', 'daily-life', '2025-12-27 06:11:38');

-- Dumping structure for table vstep_db.tu_vung
CREATE TABLE IF NOT EXISTS `tu_vung` (
  `tu_vung_id` int NOT NULL AUTO_INCREMENT,
  `tu_vung` varchar(100) DEFAULT NULL,
  `nghia` text,
  `phat_am` varchar(100) DEFAULT NULL,
  `duong_dan_am_thanh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tu_vung_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.tu_vung: ~0 rows (approximately)

-- Dumping structure for table vstep_db.vai_tro
CREATE TABLE IF NOT EXISTS `vai_tro` (
  `vai_tro_id` int NOT NULL,
  `ten_vai_tro` varchar(50) NOT NULL,
  PRIMARY KEY (`vai_tro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.vai_tro: ~3 rows (approximately)
INSERT INTO `vai_tro` (`vai_tro_id`, `ten_vai_tro`) VALUES
	(1, 'Student'),
	(2, 'Teacher'),
	(3, 'Admin');

-- Dumping structure for table vstep_db.writing_prompts
CREATE TABLE IF NOT EXISTS `writing_prompts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_id` varchar(10) DEFAULT NULL,
  `topic_id` varchar(50) DEFAULT NULL,
  `task_type` varchar(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `question_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.writing_prompts: ~6 rows (approximately)
INSERT INTO `writing_prompts` (`id`, `level_id`, `topic_id`, `task_type`, `title`, `question_text`, `created_at`) VALUES
	(1, 'B1', 'daily_life', 'task1', 'Task 1: Email to a Friend', 'You received an email from your English friend, Alex. He asked you about your favorite TV program. Write an email (about 120 words) to Alex. In your email, you should: tell him what your favorite TV program is, describe what happens in the program, and explain why you like it.', '2025-12-11 12:42:16'),
	(2, 'B1', 'travel', 'task1', 'Task 1: Holiday Advice', 'Your friend from America is planning to visit your country next summer. Write an email giving him/her advice on: the best time to visit, places to see, and food to eat.', '2025-12-11 12:42:16'),
	(3, 'B2', 'education', 'task2', 'Task 2: Online vs Traditional Learning', 'Some people think that online learning is better than traditional classroom learning. To what extent do you agree or disagree? Write an essay of at least 250 words. Give reasons for your answer and include any relevant examples from your own knowledge or experience.', '2025-12-11 12:42:16'),
	(4, 'B2', 'technology', 'task2', 'Task 2: Impact of Social Media', 'Social media has changed the way people interact with each other. Has this become a positive or negative development? Write an essay of at least 250 words.', '2025-12-11 12:42:16'),
	(5, 'C1', 'environment', 'task2', 'Task 2: Environmental Problems', 'Environmental pollution is a serious problem in many countries. What are the causes of this problem and what solutions can you suggest? Write an essay of at least 250 words.', '2025-12-11 12:42:16'),
	(6, 'B1', '2', 'task1', 'Writing Practice 01 - Email to a Friend regarding a new hobby', 'You have received an email from your English-speaking pen friend, Alex.\n\n"I\'ve heard that you recently started a new hobby. I\'m really curious about it! Could you tell me what it is and why you decided to take it up? Also, how often do you practice it?"\n\nWrite an email to Alex answering his questions.\n\nIn your email, you should:\n\nTell him what your new hobby is.\n\nExplain why you enjoy it.\n\nSay when and how often you do it.\n\nWrite about 120 words.', '2025-12-27 07:59:40');

-- Dumping structure for table vstep_db.yeu_cau_nang_cap
CREATE TABLE IF NOT EXISTS `yeu_cau_nang_cap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `trinh_do` varchar(255) DEFAULT NULL COMMENT 'Ví dụ: IELTS 8.0, VSTEP C1...',
  `kinh_nghiem` text,
  `link_cv` varchar(500) DEFAULT NULL COMMENT 'Link Google Drive chứa CV/Chứng chỉ',
  `trang_thai` enum('pending','approved','rejected') DEFAULT 'pending',
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `yeu_cau_nang_cap_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `nguoi_dung` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table vstep_db.yeu_cau_nang_cap: ~0 rows (approximately)
INSERT INTO `yeu_cau_nang_cap` (`id`, `user_id`, `so_dien_thoai`, `trinh_do`, `kinh_nghiem`, `link_cv`, `trang_thai`, `ngay_tao`) VALUES
	(1, 10, '03821300145', 'Vstep c2', '3 năm dạy ở trung tâm ', 'https://drive.google.com/drive/folders/1c4AofB2DSrW1hNGZVQKUx_jQcGQ5cUX6?usp=drive_link', 'pending', '2025-12-22 01:40:33');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
