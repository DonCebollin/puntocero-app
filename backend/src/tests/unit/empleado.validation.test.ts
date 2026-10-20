import { describe, expect, it } from "vitest"
import { registroSchema } from "../../validations/empleado.validation"
import { date } from "zod";

describe("Validacion de empleados - Pruebas Unitarias", () => {
    it("debe aceptar un registro con todos los datos validos", () => {
        const resultado = registroSchema.safeParse({
            nombre: "Ana Perez",
            usuario: "ana",
            password: "clave123",
            rol: "garzon"
        });

        expect (resultado.success).toBe(true);
        expect (resultado).toMatchObject({ data: { usuario: "ana"}});
        expect (resultado).toMatchObject({ data: {rol: "garzon"}});
    });

    it("debe rechazar un usuario y una contraseña demasiado cortos", () => {
        const resultado = registroSchema.safeParse({
            nombre: "Ana Perez",
            usuario: "an",
            password: "123",
            rol: "garzon",
        });
        const campos = resultado.success ? [] : resultado.error.issues.map((e) => e.path[0]);

        expect(resultado.success).toBe(false);
        expect(campos).toContain("usuario");
        expect(campos).toContain("password");
    });

    it("debe rechazar el rol administrador en el registro", () => {
        const resultado = registroSchema.safeParse({
            nombre: "Ana Perez",
            usuario: "ana",
            password: "clave123",
            rol: "administrador",
        });

        const campos = resultado.success ? [] : resultado.error.issues.map((e) => e.path[0]);
        expect(resultado.success).toBe(false);
        expect(campos).toContain("rol");
        expect(campos).toHaveLength(1);
    });
});