import { Router } from "express";
import { Server } from "socket.io";
import { crearMesasController } from "../controller/mesas.controller";

export function mesasRoutes(io: Server): Router {
    const router = Router();
    const controller = crearMesasController(io);

    router.get("/", controller.listar);
    router.patch("/:id/estado", controller.actualizarEstado);
    router.post("/", controller.crear);
    
    return router;
}