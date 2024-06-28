-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-06-2024 a las 08:10:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.3.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `confeccionesbenito`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulos`
--

CREATE TABLE `articulos` (
  `id_articulos` int(11) NOT NULL,
  `familia` int(11) NOT NULL,
  `subfamilia` int(11) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `marca` varchar(250) NOT NULL,
  `precio` float NOT NULL,
  `imagen` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `articulos`
--

INSERT INTO `articulos` (`id_articulos`, `familia`, `subfamilia`, `nombre`, `marca`, `precio`, `imagen`) VALUES
(1, 0, 0, ' camiseta', ' Braulio', 12, ''),
(2, 0, 0, ' camiseta', ' Braulio', 12, ''),
(3, 0, 0, ' camiseta', ' Braulio', 12, ''),
(4, 0, 0, ' camiseta', ' Braulio', 12, ''),
(5, 0, 0, 'braguitas unicor', ' unicornio', 6.25, ''),
(6, 4, 3, 'falda', 'Adidas', 6.34, 'https://api.twilio.com/2010-04-01/Accounts/ACddff475ba4f23ef6e4bd65c2708424ba/Messages/MM0373847167832ae7006693533d89c2cf/Media/ME270f1c6615d8822b03dac3d29e63432c'),
(7, 4, 3, 'falda', 'Adidas', 6.34, 'https://api.twilio.com/2010-04-01/Accounts/ACddff475ba4f23ef6e4bd65c2708424ba/Messages/MM858124d0d7e46b5b3a5544459a858708/Media/ME4c34f9ba57909f258b7eb4c94369c7b1'),
(8, 4, 4, 'zapatillas', ' Adidas', 25.64, 'https://api.twilio.com/2010-04-01/Accounts/ACddff475ba4f23ef6e4bd65c2708424ba/Messages/MMf6685a3e4423c7bf3e160784d8b44186/Media/ME991c0446b2f6e61b4c29525664b00213'),
(9, 6, 5, 'deportivas', ' Nike', 36.85, 'C:\\phpxampp\\htdocs\\confecciones-benito-back\\imagenes\\imagen-12b0d8ea-a8ad-4bf3-b2d7-ba3d2ebe8224');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `familia`
--

CREATE TABLE `familia` (
  `id_familia` int(11) NOT NULL,
  `familia` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `familia`
--

INSERT INTO `familia` (`id_familia`, `familia`) VALUES
(1, 'Confirm'),
(2, 'Confecciones, Benito, camiseta, Braulio, 12.59,'),
(3, 'Confecciones'),
(4, 'Mujer'),
(5, 'Julián'),
(6, 'Hombre');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subfamilia`
--

CREATE TABLE `subfamilia` (
  `id_subfamilia` int(11) NOT NULL,
  `familia` int(11) NOT NULL,
  `subfamilia` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `subfamilia`
--

INSERT INTO `subfamilia` (`id_subfamilia`, `familia`, `subfamilia`) VALUES
(1, 0, ' Benito'),
(2, 0, 'lencería'),
(3, 4, 'ropa'),
(4, 4, 'zapatos'),
(5, 6, 'zapatos');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `articulos`
--
ALTER TABLE `articulos`
  ADD PRIMARY KEY (`id_articulos`);

--
-- Indices de la tabla `familia`
--
ALTER TABLE `familia`
  ADD PRIMARY KEY (`id_familia`);

--
-- Indices de la tabla `subfamilia`
--
ALTER TABLE `subfamilia`
  ADD PRIMARY KEY (`id_subfamilia`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `articulos`
--
ALTER TABLE `articulos`
  MODIFY `id_articulos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `familia`
--
ALTER TABLE `familia`
  MODIFY `id_familia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `subfamilia`
--
ALTER TABLE `subfamilia`
  MODIFY `id_subfamilia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
