import { z } from "zod";

export const registroSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    usuario: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    password : z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol: z.enum(["garzon" , "cocina" , "barra"]),
});

export const loginSchema = z.object({
    usuario: z.string().min(1),
    password: z.string().min(1),
});