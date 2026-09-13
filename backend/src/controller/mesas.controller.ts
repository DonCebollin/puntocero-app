import { Request, Response } from "express";
import * as MesaModel from "../models/Mesa";
import { Server } from "socket.io";

export function crearMesasController(io: Server) {
    return {
        async listar(req: Request, res: Response) {
            try{
            const mesas = await MesaModel.obtenerMesas();
            res.json(mesas);
        }catch(error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener las mesas"});
            }
        },

        

        async actualizarEstado(req: Request, res: Response) {
            try{
                const { id } = req.params;
                const { estado } = req.body;

                await MesaModel.actualizarEstadoMesa(Number(id), (estado));
                const mesaActualizada = await MesaModel.obtenerMesasPorId(Number(id));

                io.emit("mesa:actualizada", mesaActualizada);
                res.json(mesaActualizada);
            } catch (error){
                console.error(error);
                res.status(500).json({ error: "Error al actualizar la mesa"})
            }
        },
        
        async crear(req: Request, res: Response) {
            try {
                const { numero, zona_id } = req.body;
                const id = await MesaModel.crearMesa(numero, zona_id);

                const mesaCreada = await MesaModel.obtenerMesasPorId(id);
                io.emit("mesa:actualizada", mesaCreada);
                res.status(201).json(mesaCreada);
        } catch (error) {
                console.error(error);
            res.status(500).json({ error: "Error al crear la mesa" });
            }
        },
    }

    
}