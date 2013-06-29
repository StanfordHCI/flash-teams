-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 20, 2013 at 06:18 PM
-- Server version: 5.5.16
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `eventick_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_eventresponse`
--

CREATE TABLE IF NOT EXISTS `tbl_eventresponse` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Event_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `IsFavorite` bit(1) NOT NULL,
  `IsAttending` bit(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

--
-- Dumping data for table `tbl_eventresponse`
--

INSERT INTO `tbl_eventresponse` (`ID`, `Event_ID`, `User_ID`, `IsFavorite`, `IsAttending`) VALUES
(11, 2, 1, '1', '1'),
(13, 2, 2, '1', '1'),
(14, 3, 2, '1', '1'),
(16, 3, 1, '1', '1'),
(17, 4, 1, '0', '1'),
(18, 6, 1, '1', '0');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_events`
--

CREATE TABLE IF NOT EXISTS `tbl_events` (
  `Event_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Event_name` varchar(100) NOT NULL,
  `Event_Details` longtext NOT NULL,
  `Event_pic` varchar(100) NOT NULL,
  `Event_place` varchar(100) NOT NULL,
  `Event_From` datetime NOT NULL,
  `Event_To` datetime NOT NULL,
  `Created_By` int(11) NOT NULL,
  `Created_Date` datetime NOT NULL,
  PRIMARY KEY (`Event_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `tbl_events`
--

INSERT INTO `tbl_events` (`Event_ID`, `Event_name`, `Event_Details`, `Event_pic`, `Event_place`, `Event_From`, `Event_To`, `Created_By`, `Created_Date`) VALUES
(2, 'Chal bhag ja', 'asdsadsadsadsadsadasd', '1920x1200_fifa_10.jpg', 'Boston', '2013-04-02 00:00:00', '2013-04-10 00:00:00', 1, '2013-04-20 00:00:00'),
(3, 'Bagur Billa', 'asdsadsadsadsadsadsdasad', '1920x1200_fifa_10.jpg', 'Columbus', '2013-04-19 00:00:00', '2013-04-25 00:00:00', 2, '2013-04-01 00:00:00'),
(4, 'test', 'some test event', '155651_460208447389533_1001419808_n.jpg', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 1, '0000-00-00 00:00:00'),
(6, 'test3233', 'sasadsadsdasadsad', '155651_460208447389533_1001419808_n.jpg', '', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 7, '0000-00-00 00:00:00'),
(9, 'Mein hon na', 'sasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsadsasadsad', '155651_460208447389533_1001419808_n.jpg', '', '2013-04-23 00:00:00', '2013-04-14 00:00:00', 0, '2013-04-20 17:31:08'),
(10, 'Entertaining', 'asdasdsadsadsadsasad', '', '', '2013-04-11 00:00:00', '2013-04-25 00:00:00', 0, '2013-04-20 17:31:48'),
(11, 'Hello world', 'sdasadsdasadsadsadsaddsa', '155651_460208447389533_1001419808_n.jpg', 'California', '2013-04-11 00:00:00', '2013-04-09 00:00:00', 0, '2013-04-20 18:08:05');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE IF NOT EXISTS `tbl_users` (
  `User_ID` int(11) NOT NULL AUTO_INCREMENT,
  `User_Name` varchar(100) NOT NULL,
  PRIMARY KEY (`User_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`User_ID`, `User_Name`) VALUES
(0, 'Tony'),
(1, 'Jason Tam'),
(2, 'Imran Khan'),
(7, 'Barker');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
