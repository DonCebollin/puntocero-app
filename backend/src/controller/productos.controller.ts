import { Request, Response } from "express";
import { Server } from "socket.io";
import * as ProductoModel from "../models/Producto";
import { disponibilidadSchema } from "../validations/producto.validation";

export function crearProductosController(io: Server) {
    return {
        listar: async (req: Request, res: Response) => {
            try {
                const productos = await ProductoModel.obtenerProductos();
                res.json(productos);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error al obtener los productos" });
            }
        },

        actualizarDisponibilidad: async (req: Request, res: Response) => {
            try {
                const id = Number(req.params.id);
                const resultado = disponibilidadSchema.safeParse(req.body);
                if (!resultado.success) {
                    res.status(400).json({ error: "El campo disponible debe ser verdadero o falso" });
                    return;
                }

                const producto = await ProductoModel.actualizarDisponibilidad(id, resultado.data.disponible);
                if (!producto) {
                    res.status(404).json({ error: "Producto no encontrado" });
                    return;
                }

                io.emit("producto:actualizado", { id: producto.id, disponible: producto.disponible });
                res.json(producto);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error al actualizar la disponibilidad" });
            }
        },
    };
}