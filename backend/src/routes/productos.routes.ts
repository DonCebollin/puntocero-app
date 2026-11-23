import { Router } from "express";
import { Server } from "socket.io";
import { crearProductosController } from "../controller/productos.controller";
import { verificarToken, verificarRol } from "../middleware/auth.middleware";

export function productosRoutes(io: Server): Router {
    const router = Router();
    const controller = crearProductosController(io);

    router.get("/", verificarToken, controller.listar);
    router.patch("/:id/disponibilidad", verificarToken, verificarRol("administrador"), controller.actualizarDisponibilidad);

    return router;
}