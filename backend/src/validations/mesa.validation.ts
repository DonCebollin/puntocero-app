import { z } from "zod";

export const crearMesaSchema = z.object({
    numero: z.number().int().positive(),
    zona_id: z.number().int().positive(),
});

export const actualizarEstadoSchema = z.object({
    estado: z.enum(["libre", "ocupada", "por_cobrar"]),
});