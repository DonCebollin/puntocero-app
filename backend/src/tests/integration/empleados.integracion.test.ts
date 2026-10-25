import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll} from "vitest";
import request from "supertest";
import express from "express";
import { empleadosRoutes } from "../../routes/empleados.routes";
import { crearEmpleado } from "../../models/Empleado";
import { pool } from "../../config/database";

const app = express();
app.use(express.json());
app.use("/api/empleados", empleadosRoutes());

const usuario = "test_" + Date.now();
const password = "clave1234";

beforeAll(async () => {
    await crearEmpleado("Empleado test", usuario, password, "garzon");
});

afterAll(async() => {
    await pool.query("DELETE FROM empleados WHERE usuario = ?", [usuario]);
    await pool.end();
});

//lo ideal seria que el beforeall y afterall esten en un archivo aparte y yo solo los llame
describe("POST /api/empleados/login", () => {
    it("devuelve 200 con token y empleado si las credenciales son correctas", async () => {
        const res = await request(app)
        .post("/api/empleados/login")
        .send({ usuario, password });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.empleado.usuario).toBe(usuario);
    });

    it("devuelve 401 si la contraseña es incorrecta", async () => {
        const res = await request(app)
        .post("/api/empleados/login")
        .send({ usuario, password: "otraclave999"});

        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
        expect(res.body.token).toBeUndefined();
    });
});