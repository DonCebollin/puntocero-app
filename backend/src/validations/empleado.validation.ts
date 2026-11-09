import { z } from "zod";

export const registroSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .regex(/^\p{L}+(\s+\p{L}+)*$/u, "El nombre solo puede tener letras y espacios")
        .transform((valor) => valor.replace(/\s+/g, " ")),
    usuario: z
        .string()
        .regex(/^(?=.*[A-Za-z])[\w.-]{3,20}$/, "Usuario de 3 a 20 caracteres, sin espacios, solo letras, números, . _ -, y al menos una letra")
        .transform((valor) => valor.toLowerCase()),
    password: z
        .string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/, "Contraseña de 8 a 64 caracteres, sin espacios, con al menos una letra y un número"),
    rol: z.enum(["garzon", "cocina", "barra"]),
});

export const loginSchema = z.object({
    usuario: z.string().min(1),
    password: z.string().min(1),
});