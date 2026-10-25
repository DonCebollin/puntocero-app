import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import { pedidosRoutes } from "../../routes/pedidos.routes";

const io = { emit: vi.fn() } as unknown as Server;

const app = express();
app.use(express.json());
app.use("/api/pedidos", pedidosRoutes(io));

const token = jwt.sign(
    {id: 1, usuario: "cocinero", rol: "cocina"},
    process.env.JWT_SECRET || "clave_por_defecto_insegura"
);

describe("rutas de pedidos para cocina y barra", () => {
    it("devuelve 400 si la estacion de pendientes es invalida", async() => {
        const res = await request(app)
        .get("/api/pedidos/pendientes/terraza")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Estacion invalida");
    expect(Array.isArray(res.body)).toBe(false);
    });

    it("devuelve 400 si el id del item a marcar listo es inválido", async () => {
        const res = await request(app)
        .patch("/api/pedidos/items/abc/listo")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Id invalido");
    expect(io.emit).not.toHaveBeenCalled();
    });
});