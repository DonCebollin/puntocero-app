import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "node:console";

const JWT_SECRET = process.env.JWT_SECRET || "clave_por_defecto_insegura";

export interface PayloadToken {
    id: number;
    usuario: string;
    rol: "garzon" | "cocina" | "barra" | "administrador";
}

//le agrega un campo "empleado" al tipo request, para poder
//guardar ahi los datos del usuario autenticado y usarlos despues

declare global {
    namespace Express {
        interface Request {
            empleado?: PayloadToken;
        }
    }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as PayloadToken;
        req.empleado = payload;
        next();
    }catch (error) {
        return res.status(401).json({ error: "Token invalido o expirado"});
    }
}

export function verificarRol(...rolesPermitidos: PayloadToken["rol"][]){
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.empleado) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if(!rolesPermitidos.includes(req.empleado.rol)) {
            return res.status(403).json({ error: "No tienes permiso para realizar esta accion"});
        }

        next();
    };
}