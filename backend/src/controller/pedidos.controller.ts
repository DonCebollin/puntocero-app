import { Request, Response } from "express";
import { Server } from "socket.io";
import * as PedidoModel from "../models/Pedido";
import { crearPedidoSchema } from "../validations/pedido.validation";

export function crearPedidosController(io: Server) {
  return {
    async crear(req: Request, res: Response) {
      const resultado = crearPedidoSchema.safeParse(req.body);
      if (!resultado.success) {
        return res.status(400).json({ error: resultado.error.issues });
      }

      try {
        const { mesa_id, items } = resultado.data;

        const pedidoId = await PedidoModel.crearPedido(mesa_id, items);
        const pedido = await PedidoModel.obtenerPedidoPorId(pedidoId);

        if (!pedido) {
          return res.status(500).json({ error: "El pedido se creó pero no se pudo recuperar" });
        }

        const itemsCocina = pedido.items.filter((item) => item.estacion === "cocina");
        const itemsBarra = pedido.items.filter((item) => item.estacion === "barra");

        if (itemsCocina.length > 0) {
          io.emit("pedido:nuevo:cocina", { pedidoId: pedido.id, mesaId: pedido.mesa_id, items: itemsCocina });
        }
        if (itemsBarra.length > 0) {
          io.emit("pedido:nuevo:barra", { pedidoId: pedido.id, mesaId: pedido.mesa_id, items: itemsBarra });
        }

        res.status(201).json(pedido);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el pedido" });
      }
    },
    
    async obtener(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const pedido = await PedidoModel.obtenerPedidoPorId(Number(id));

            if(!pedido) {
                return res.status(404).json({ error: "Pedido no encontrado"});
            }

            res.json(pedido);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener el pedido"});
        }
    }
  }
}