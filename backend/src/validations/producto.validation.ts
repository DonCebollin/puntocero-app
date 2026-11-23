import { z } from "zod";

export const disponibilidadSchema = z.object({
    disponible: z.boolean(),
});