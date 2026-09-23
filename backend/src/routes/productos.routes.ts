import { Router } from "express";
import { obtenerProductos } from "../models/Producto";
import { verificarToken } from "../middleware/auth.middleware";

export function productosRoutes(): Router {
    const router = Router();

    router.get("/", verificarToken, async (req, res) => {
        try {
            const productos = await obtenerProductos();
            res.json(productos);
        }catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener los productos"});
        }
    });

    return router;
}