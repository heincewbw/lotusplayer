-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: mysql-41815-0.cloudclusters.net    Database: LotusPlayer
-- ------------------------------------------------------
-- Server version	8.0.25

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player`
--

LOCK TABLES `Player` WRITE;
/*!40000 ALTER TABLE `Player` DISABLE KEYS */;
INSERT INTO `Player` VALUES (1,'Jon','2026-05-22 05:27:55.372'),(3,'Willy','2026-05-22 05:28:00.127'),(4,'Hendra','2026-05-22 05:28:02.253'),(5,'Heince','2026-05-22 05:35:59.052'),(6,'Hangkim','2026-05-22 05:36:04.969'),(7,'Ayung','2026-05-22 05:36:12.870'),(8,'Rudi','2026-05-22 05:36:16.743'),(9,'Dindin','2026-05-22 05:36:23.520'),(10,'Junfat','2026-05-22 05:37:20.227'),(12,'Suhanda','2026-05-26 14:59:06.683'),(13,'Awi','2026-05-31 21:45:25.774'),(14,'Phillip','2026-05-31 21:48:25.676'),(15,'Sapta','2026-06-01 16:12:42.902'),(16,'DEALER','2026-06-02 08:10:41.201');
/*!40000 ALTER TABLE `Player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Session`
--

DROP TABLE IF EXISTS `Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Session_createdBy_fkey` (`createdBy`),
  CONSTRAINT `Session_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Session`
--

LOCK TABLES `Session` WRITE;
/*!40000 ALTER TABLE `Session` DISABLE KEYS */;
INSERT INTO `Session` VALUES (1,'2026-05-17',NULL,'cmpghajz80000n0w1xsv9cata','2026-05-22 05:41:47.951'),(2,'2026-05-19',NULL,'cmpghajz80000n0w1xsv9cata','2026-05-22 05:43:45.107'),(3,'2026-05-20',NULL,'cmpghajz80000n0w1xsv9cata','2026-05-22 05:45:21.978'),(4,'2026-05-25',NULL,'cmpgk2fnf0000csw1vs5ntjpo','2026-05-26 23:25:03.962'),(5,'2026-05-31',NULL,'cmpgk2fnf0000csw1vs5ntjpo','2026-05-31 21:48:03.501'),(6,'2026-06-01',NULL,'cmpghajz80000n0w1xsv9cata','2026-06-01 16:17:06.253');
/*!40000 ALTER TABLE `Session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SessionEntry`
--

DROP TABLE IF EXISTS `SessionEntry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SessionEntry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionId` int NOT NULL,
  `playerId` int NOT NULL,
  `rowNumber` int NOT NULL,
  `ambil` int NOT NULL,
  `sisa` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SessionEntry_sessionId_fkey` (`sessionId`),
  KEY `SessionEntry_playerId_fkey` (`playerId`),
  CONSTRAINT `SessionEntry_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SessionEntry_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SessionEntry`
--

LOCK TABLES `SessionEntry` WRITE;
/*!40000 ALTER TABLE `SessionEntry` DISABLE KEYS */;
INSERT INTO `SessionEntry` VALUES (1,1,3,1,0,2100),(2,1,5,2,3200,0),(3,1,6,3,3600,0),(4,1,10,4,800,0),(5,1,1,5,0,5500),(6,2,6,1,0,5750),(7,2,9,2,0,750),(8,2,10,3,0,3250),(9,2,3,4,2750,0),(10,2,1,5,7000,0),(11,3,3,1,2900,0),(12,3,6,2,5100,0),(13,3,9,3,700,0),(14,3,1,4,0,5400),(15,3,10,5,0,3300),(16,4,1,1,2500,0),(17,4,12,2,1500,0),(18,4,5,3,0,2750),(19,4,3,4,850,0),(20,4,4,5,0,2100),(28,5,6,1,24000,0),(29,5,1,2,0,2600),(30,5,10,3,5500,0),(31,5,3,4,0,8200),(32,5,9,5,0,20500),(33,5,13,6,0,2200),(34,5,14,7,4000,0),(45,6,5,1,0,5500),(46,6,9,3,2600,0),(47,6,3,4,1500,0),(48,6,15,5,0,3600),(49,6,6,6,5000,0);
/*!40000 ALTER TABLE `SessionEntry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('cmpghajz80000n0w1xsv9cata','admin@lotus.com','$2b$12$MD01UCXkgktQT3dOC1z4s.6w8V.5eSWwWJBhbJJj3jBo24PVHsHM.','2026-05-22 05:27:53.252','admin'),('cmpgk2fnf0000csw1vs5ntjpo','input@lotus.com','$2b$12$/RrdSlVyGFe/MuLKgT1f1OZQ8Sabq0MAkGjewXRanF0hQpirKVswq','2026-05-22 06:45:33.243','input');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 14:22:18
