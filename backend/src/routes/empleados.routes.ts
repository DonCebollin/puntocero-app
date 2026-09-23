import { Router } from "express";
import { empleadoController } from "../controller/empleados.controller";

export function empleadosRoutes(): Router {
    const router = Router();

    router.post("/registro", empleadoController.registrar);
    router.post("/login", empleadoController.login);

    return router;
}