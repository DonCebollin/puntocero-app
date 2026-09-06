-- Esquema inicial de la base de datos Punto Cero
-- Ejecutar una vez en MySQL antes de levantar el backend:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS puntocero CHARACTER SET utf8mb4;
USE puntocero;

CREATE TABLE IF NOT EXISTS zonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL,
  zona_id INT NOT NULL,
  estado ENUM('libre', 'ocupada', 'por_cobrar') NOT NULL DEFAULT 'libre',
  FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

CREATE TABLE IF NOT EXISTS items_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto VARCHAR(150) NOT NULL,
  estacion ENUM('cocina', 'barra') NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio DECIMAL(10, 2) NOT NULL,
  observacion VARCHAR(255),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

INSERT INTO zonas (nombre) VALUES ('Terraza'), ('Interior'), ('Salón Trasero'), ('Barra');

-- 21 mesas físicas: 7 terraza, 9 interior, 5 salón trasero
INSERT INTO mesas (numero, zona_id) VALUES
  (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1),
  (8, 2), (9, 2), (10, 2), (11, 2), (12, 2), (13, 2), (14, 2), (15, 2), (16, 2),
  (17, 3), (18, 3), (19, 3), (20, 3), (21, 3);