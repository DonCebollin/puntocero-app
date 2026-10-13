import { Router } from "express";
import { Server } from "socket.io";
import { crearPedidosController } from "../controller/pedidos.controller";
import { verificarToken, verificarRol } from "../middleware/auth.middleware";

export function pedidosRoutes(io: Server): Router {
    const router = Router();
    const controller = crearPedidosController(io);

    router.post("/", verificarToken, controller.crear);
    router.get("/mesa/:mesaId", verificarToken, controller.obtenerPorMesa);
    router.get("/pendientes/:estacion", verificarToken, verificarRol("cocina", "barra", "administrador"), controller.pendientes);
    router.patch("/items/:id/listo", verificarToken, verificarRol("cocina", "barra", "administrador"), controller.marcarListo);
    router.get("/:id", verificarToken, controller.obtener);

    return router;
}