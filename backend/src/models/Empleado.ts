import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { bytes } from "node:stream/consumers";
import { bytesSync } from "node:stream/iter";

export type RolEmpleado = "garzon" | "cocina" | "barra" | "administrador";

export interface Empleado {
    id: Number,
    nombre: string,
    usuario: string,
    rol: RolEmpleado;
}

//Los roles que un empleado puede elegir libremente al registrarse
//administrador queda afuera a proposito

export const ROLES_REGISTRO_PUBLICO: RolEmpleado[] = ["garzon", "cocina", "barra"];

export async function crearEmpleado(
    nombre: string,
    usuario: string,
    password: string,
    rol: RolEmpleado
): Promise<number>{
 const passwordHash = await bcrypt.hash(password, 10);

 const [resultado] = await pool.query<ResultSetHeader>(
    "INSERT INTO empleados (nombre, usuario, password_hash, rol) VALUES (?, ?, ?, ?)",
    [nombre, usuario, passwordHash, rol]
 );
 return resultado.insertId;
}

export async function existeUsuario(usuario: string): Promise<boolean> {
    const [filas] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM empleados WHERE usuario = ?",
        [usuario]
    );
    return filas.length > 0;    
}

//Trae al empleado con su hash, nunca se devuelve hacia el frontend

export async function obtenerEmpleadoPorUsuarioConHash(usuario: string) {
    const [filas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nombre, usuario, password_hash, rol FROM empleados WHERE usuario = ?",
        [usuario]
    );
    return filas[0] || null;
}

export async function verificarPassword(
    passwordIngresada : string,
    passwordHash: string
): Promise<boolean> {
    return bcrypt.compare(passwordIngresada, passwordHash);
}
