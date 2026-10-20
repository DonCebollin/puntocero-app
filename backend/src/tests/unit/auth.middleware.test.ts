import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { verificarRol, verificarToken } from "../../middleware/auth.middleware";



const SECRETO = process.env.JWT_SECRET || "clave_por_defecto_insegura";

const crearRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

describe("Middleware de autenticacion - Pruebas Unitarias", () => {
    it("debe responder si la peticion no trae token", () => {
        const req = { headers: {} } as unknown as Request;
        const res = crearRes();
        const next = vi.fn();

    verificarToken(req, res as unknown as Response, next as NextFunction);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenLastCalledWith( { error: "Token no proporcionado"});
        expect(next).not.toHaveBeenCalled();
    });

    it("Debe continuar y guardar al empleado si el token es valido", () => {
        const token = jwt.sign({ id: 1, usuario: "ana", rol: "garzon" }, SECRETO);
        const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
        const res = crearRes();
        const next = vi.fn();

        verificarToken(req, res as unknown as Response, next as NextFunction);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.empleado).toMatchObject({ id: 1, usuario: "ana", rol: "garzon" });
        expect(res.status).not.toHaveBeenCalled();
    });
    
    it("debe responder 403 si el rol del empleado no está permitido", () => {
    const req = {
        empleado: { id: 2, usuario: "pedro", rol: "cocina" },
    } as unknown as Request;
    const res = crearRes();
    const next = vi.fn();

    verificarRol("administrador")(req, res as unknown as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
        error: "No tienes permiso para realizar esta accion",
    });
    expect(next).not.toHaveBeenCalled();
    });
});
