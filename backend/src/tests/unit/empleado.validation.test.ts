import { describe, expect, it } from "vitest"
import { registroSchema, loginSchema } from "../../validations/empleado.validation"

const base = {
    nombre: "Ana Perez",
    usuario: "ana",
    password: "clave123",
    rol: "garzon",
};

function camposConError(datos: object) {
    const resultado = registroSchema.safeParse({ ...base, ...datos });
    return resultado.success ? [] : resultado.error.issues.map((e) => e.path[0]);
}

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
            usuario: " ",
            password: "123",
            rol: "garzon",
        });
        const campos = resultado.success ? [] : resultado.error.issues.map((e) => e.path[0]);

        expect(resultado.success).toBe(false);
        expect(campos).contain("usuario");
        expect(campos).contain("password");
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
        expect(campos).contain("rol");
        expect(campos).toHaveLength(1);
    });

    it("debe rechazar un usuario con espacios, solo numeros o solo caracteres especiales", () => {
        expect(camposConError({ usuario: "ana perez" })).contain("usuario");
        expect(camposConError({ usuario: "1322423" })).contain("usuario");
        expect(camposConError({ usuario: "@@@@" })).contain("usuario");
    });

    it("debe rechazar una contraseña con espacios, sin letras o sin numeros", () => {
        expect(camposConError({ password: "clave 123" })).contain("password");
        expect(camposConError({ password: "145233242" })).contain("password");
        expect(camposConError({ password: "clavesola" })).contain("password");
    });

    it("debe rechazar numeros en el nombre y dejar un solo espacio entre palabras", () => {
        const conNumeros = camposConError({ nombre: "Ana 123"});
        const resultado = registroSchema.safeParse({ ...base, nombre: "  Ana       Perez"});

        expect(conNumeros).contain("nombre");
        expect(resultado.success).toBe(true);
        expect(resultado.success && resultado.data.nombre).toBe("Ana Perez");
    });

    it("debe rechazar un login con usuario o contraseña vacios", () => {
        const sinUsuario = loginSchema.safeParse({ usuario: "", password: "clave123" });
        const sinPassword = loginSchema.safeParse({ usuario: "ana", password: "" });
        const sinNada = loginSchema.safeParse({ usuario: "", password: "" });

        expect(sinUsuario.success).toBe(false);
        expect(sinPassword.success).toBe(false);
        expect(sinNada.success ? 0 : sinNada.error.issues.length).toBe(2);
    });

    it("debe guardar el usuario en minusculas", () => {
        const resultado = registroSchema.safeParse({ ...base, usuario: "Ana" });

        expect(resultado.success).toBe(true);
        expect(resultado.success && resultado.data.usuario).toBe("ana");
        expect(resultado.success && resultado.data.nombre).toBe("Ana Perez");
    });
});