import { Request, Response } from "express";
import * as MesaModel from "../models/Mesa";
import { Server } from "socket.io";
import { crearMesaSchema, actualizarEstadoSchema } from "../validations/mesa.validation";

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
            const resultado = actualizarEstadoSchema.safeParse(req.body);
            if(!resultado.success) {
                return res.status(400).json({error: resultado.error.issues});
            }
            
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
            const resultado = crearMesaSchema.safeParse(req.body);
            if(!resultado.success) {
                return res.status(400).json({ error: resultado.error.issues});
            }

            try {
                const { numero, zona_id } = resultado.data;

                 const yaExiste = await MesaModel.existeNumeroMesa(numero);
                if (yaExiste) {
                    return res.status(409).json({ error: `Ya existe una mesa con el número ${numero}.` });
                }
                
                const id = await MesaModel.crearMesa(numero, zona_id);
                const mesaCreada = await MesaModel.obtenerMesasPorId(id);

               
                io.emit("mesa:actualizada", mesaCreada);
                res.status(201).json(mesaCreada);
        } catch (error) {
                console.error(error);
            res.status(500).json({ error: "Error al crear la mesa" });
            }
        },

        async eliminar(req: Request, res: Response) {
            try {
                const { id } = req.params;

                await MesaModel.eliminarMesa(Number(id));
                io.emit("mesa:eliminada", Number(id));
                res.status(204).send();

            } catch (error: any) {
                console.error(error);
                if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ error: "No se puede eliminar: esta mesa tiene pedidos registrados." });
            }
                res.status(500).json({ error: "Error al eliminar la mesa" });
            }
        },
    }
}
