import { Router } from "express";
import { Server } from "socket.io";
import { crearPedidosController } from "../controller/pedidos.controller";
import { verificarToken } from "../middleware/auth.middleware";

export function pedidosRoutes(io: Server): Router {
    const router = Router();
    const controller = crearPedidosController(io);

    router.post("/", verificarToken, controller.crear);
    router.get("/:id", verificarToken, controller.obtener);

    return router;
}