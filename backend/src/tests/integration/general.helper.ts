import "dotenv/config";
import { beforeAll, afterAll, vi } from "vitest";
import { Jwt } from "jsonwebtoken";
import type { Server } from "socket.io";
import { crearEmpleado } from "../../models/Empleado";
import { RolEmpleado } from "../../models/Empleado";
import { pool } from "../../config/database";
import  jwt  from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "clave_por_defecto_insegura";

export function prepararEmpleadoDePrueba(rol: RolEmpleado = "garzon") {
    const usuario = "test_" + Date.now();
    const password = "clave1234";

    beforeAll(async () => {
        await crearEmpleado("Empleado test", usuario, password, rol);
    });

    afterAll(async () => {
        await pool.query("DELETE FROM empleados WHERE usuario = ?", [usuario]);
        await pool.end();
    });

    return { usuario, password };
}

export function crearTokenDePrueba(rol: RolEmpleado = "garzon", id = 1) {
    return jwt.sign({ id, usuario: `prueba_${rol}`, rol }, JWT_SECRET);
}

export function crearIoFalso() {
    return { emit: vi.fn() } as unknown as Server;
}