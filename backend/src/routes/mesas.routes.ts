import { Router } from "express";
import { Server } from "socket.io";
import { crearMesasController } from "../controller/mesas.controller";
import { verificarToken, verificarRol } from "../middleware/auth.middleware";
export function mesasRoutes(io: Server): Router {
    const router = Router();
    const controller = crearMesasController(io);

    router.get("/", verificarToken, controller.listar);
    router.patch("/:id/estado", verificarToken, controller.actualizarEstado);
    router.post("/", verificarToken, verificarRol("administrador"),controller.crear);
    router.delete("/:id", verificarToken, verificarRol("administrador"), controller.eliminar);
    
    return router;
}