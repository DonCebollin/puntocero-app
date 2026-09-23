import { pool } from "../config/database";
import { RowDataPacket } from "mysql2";

export interface Zona {
    id: Number;
    nombre: string;
}

export async function obtenerZonas(): Promise<Zona[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nombre FROM zonas ORDER BY id"
    );
    return filas as Zona[];
}

