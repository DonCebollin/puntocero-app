-- Esquema inicial de la base de datos Punto Cero
-- Ejecutar una vez en MySQL antes de levantar el backend:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS puntocero CHARACTER SET utf8mb4;
USE puntocero;

CREATE TABLE IF NOT EXISTS mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL,
  sector ENUM('terraza', 'interior', 'barra') NOT NULL,
  estado ENUM('libre', 'ocupada', 'por_cobrar') NOT NULL DEFAULT 'libre'
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

-- Datos de ejemplo: 16 mesas físicas según lo definido en la propuesta
-- (7 en terraza, 9 en interior), más el sector de barra.
INSERT INTO mesas (numero, sector) VALUES
  (1, 'terraza'), (2, 'terraza'), (3, 'terraza'), (4, 'terraza'),
  (5, 'terraza'), (6, 'terraza'), (7, 'terraza'),
  (8, 'interior'), (9, 'interior'), (10, 'interior'), (11, 'interior'),
  (12, 'interior'), (13, 'interior'), (14, 'interior'), (15, 'interior'), (16, 'interior');