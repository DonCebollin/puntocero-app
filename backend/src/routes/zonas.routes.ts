import { Router } from "express";
import { obtenerZonas } from "../models/Zona";

export function zonasRoutes(): Router {
  const router = Router();
  router.get("/", async (req, res) => {
    try {
      const zonas = await obtenerZonas();
      res.json(zonas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener zonas" });
    }
  });
  return router;
}