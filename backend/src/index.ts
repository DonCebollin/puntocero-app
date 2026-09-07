import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { verificarConexionBD } from "./config/database";
import { mesasRoutes } from "./routes/mesas.routes";

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

const PUERTO = process.env.PORT || 3000;

servidorHttp.listen(PUERTO, () => {
  console.log(`Servidor backend escuchando en el puerto ${PUERTO}`);
  verificarConexionBD();
});