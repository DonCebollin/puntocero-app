CREATE DATABASE IF NOT EXISTS puntocero CHARACTER SET utf8mb4;
USE puntocero;

CREATE TABLE zonas (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nombre (nombre)
);

CREATE TABLE mesas (
  id INT NOT NULL AUTO_INCREMENT,
  numero INT NOT NULL,
  zona_id INT NOT NULL,
  estado ENUM('libre', 'ocupada', 'por_cobrar') NOT NULL DEFAULT 'libre',
  PRIMARY KEY (id),
  KEY zona_id (zona_id),
  CONSTRAINT mesas_ibfk_1 FOREIGN KEY (zona_id) REFERENCES zonas (id)
);

CREATE TABLE empleados (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('garzon', 'cocina', 'barra', 'administrador') NOT NULL DEFAULT 'garzon',
  PRIMARY KEY (id),
  UNIQUE KEY usuario (usuario)
);

CREATE TABLE productos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  categoria ENUM('comida', 'bebida') NOT NULL,
  estacion ENUM('cocina', 'barra') NOT NULL,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
);

CREATE TABLE pedidos (
  id INT NOT NULL AUTO_INCREMENT,
  mesa_id INT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  cerrado TINYINT(1) NOT NULL DEFAULT 0,
  empleado_id INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY mesa_id (mesa_id),
  CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (mesa_id) REFERENCES mesas (id)
);

CREATE TABLE items_pedido (
  id INT NOT NULL AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  producto VARCHAR(150) NOT NULL,
  estacion ENUM('cocina', 'barra') NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio DECIMAL(10, 2) NOT NULL,
  observacion VARCHAR(255) DEFAULT NULL,
  listo TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY pedido_id (pedido_id),
  CONSTRAINT items_pedido_ibfk_1 FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
);

INSERT INTO zonas (id, nombre) VALUES
  (1, 'Terraza'),
  (2, 'Interior'),
  (3, 'Salón Trasero'),
  (4, 'Barra');

INSERT INTO mesas (id, numero, zona_id, estado) VALUES
  (2, 2, 1, 'libre'),
  (3, 3, 1, 'libre'),
  (4, 4, 1, 'libre'),
  (5, 5, 1, 'libre'),
  (6, 6, 1, 'libre'),
  (7, 7, 1, 'libre'),
  (8, 8, 2, 'libre'),
  (9, 9, 2, 'libre'),
  (10, 10, 2, 'libre'),
  (11, 11, 2, 'libre'),
  (12, 12, 2, 'libre'),
  (13, 13, 2, 'libre'),
  (14, 14, 2, 'libre'),
  (15, 15, 2, 'libre'),
  (16, 16, 2, 'libre'),
  (17, 17, 3, 'libre'),
  (18, 18, 3, 'libre'),
  (19, 19, 3, 'libre'),
  (20, 20, 3, 'libre'),
  (21, 21, 3, 'libre'),
  (22, 1, 1, 'libre');

INSERT INTO productos (id, nombre, precio, categoria, estacion, disponible) VALUES
  (1, 'Pastel de Jaiba Remadora', 12500.00, 'comida', 'cocina', 1),
  (2, 'Ceviche Mixto', 11000.00, 'comida', 'cocina', 1),
  (3, 'Pizza Napolitana', 9500.00, 'comida', 'cocina', 1),
  (4, 'Empanadas de Pino (2 un.)', 6000.00, 'comida', 'cocina', 1),
  (5, 'Sushi Variado', 10500.00, 'comida', 'cocina', 1),
  (6, 'Sandwich Barros Luco', 7500.00, 'comida', 'cocina', 1),
  (7, 'Carne Asada', 13000.00, 'comida', 'cocina', 1),
  (8, 'Papaya Sour', 5500.00, 'bebida', 'barra', 1),
  (9, 'Ponche de Papaya', 4500.00, 'bebida', 'barra', 1),
  (10, 'Pisco Sour', 5000.00, 'bebida', 'barra', 1),
  (11, 'Mojito', 5500.00, 'bebida', 'barra', 1),
  (12, 'Cerveza Artesanal', 4000.00, 'bebida', 'barra', 1),
  (13, 'Copa de Vino', 4500.00, 'bebida', 'barra', 1);