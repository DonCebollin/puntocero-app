import "dotenv/config";
import { describe, it, expect} from "vitest";
import request from "supertest";
import express from "express";
import { empleadosRoutes } from "../../routes/empleados.routes";
import { prepararEmpleadoDePrueba } from "./general.helper";

const app = express();
app.use(express.json());
app.use("/api/empleados", empleadosRoutes());

const { usuario, password } = prepararEmpleadoDePrueba();

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