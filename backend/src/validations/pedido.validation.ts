import { z } from "zod";

export const crearPedidoSchema = z.object({
    mesas_id: z.number().int().positive,
    items: z
      .array(
        z.object({
            producto_id: z.number().int().positive(),
            cantidad: z.number().int().positive(),
        })
      )
      .min(1, "El pedido debe tener al menos 1 producto"),
});