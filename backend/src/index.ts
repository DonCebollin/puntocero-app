import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";

import { verificarConexionBD } from "./config/database";
import { mesasRoutes } from "./routes/mesas.routes";
import { zonasRoutes } from "./routes/zonas.routes";
import { empleadosRoutes } from "./routes/empleados.routes";
import { productosRoutes } from "./routes/productos.routes";
import { pedidosRoutes } from "./routes/pedidos.routes";

dotenv.config();

const app = express();
const servidorHttp = http.createServer(app);

const io = new Server(servidorHttp, {
    cors : { origin: "*"},
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API Punto Cero funcionando correctamente" });
});

app.use("/api/mesas", mesasRoutes(io));
app.use("/api/zonas", zonasRoutes());
app.use("/api/empleados", empleadosRoutes());
app.use("/api/productos", productosRoutes());
app.use("/api/pedidos", pedidosRoutes(io));
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

const PUERTO = process.env.PORT || 3000;

servidorHttp.listen(PUERTO, () => {
  console.log(`Servidor backend escuchando en el puerto ${PUERTO}`);
  verificarConexionBD();
});