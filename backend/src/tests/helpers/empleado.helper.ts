import "dotenv/config";
import { beforeAll, afterAll } from "vitest";
import { crearEmpleado } from "../../models/Empleado";
import { pool } from "../../config/database";

export function prepararEmpleadoDePrueba(rol: "garzon" | "cocina" | "barra" = "garzon") {
    const usuario = "test_" + Date.now();
    const password = "clave1234";

    beforeAll(async() => {
        await crearEmpleado("Empleado test", usuario, password, rol);
    });

    afterAll(async() => {
        await pool.query("DELETE FROM empleados WHERE usuario = ?", [usuario]);
        await pool.end();
    });
    
    return { usuario, password };
}