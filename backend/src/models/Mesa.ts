import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export type EstadoMesa = "libre" | "ocupada" | "por_cobrar"; //todos los estados posibles de las mesas

export interface Mesa {
    id: Number;
    numero: Number;
    zona_id: Number;
    zona_nombre: string;
    estado: EstadoMesa;
}

export async function obtenerMesas(): Promise<Mesa[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT m.id, m.numero, m.zona_id, z.nombre AS zona_nombre, m.estado
    FROM mesas m
    JOIN zonas z ON z.id = m.zona_id
    ORDER BY z.id, m.numero ASC`
    );
    return filas as Mesa[];
}

export async function obtenerMesasPorId(id: number): Promise<Mesa | null> {
    const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT m.id, m.numero, m.zona_id, z.nombre AS zona_nombre, m.estado
    FROM mesas m
    JOIN zonas z ON z.id = m.zona_id
    WHERE m.id = ?`,
    [id]
    );
    return (filas[0] as Mesa) || null;
}

export async function actualizarEstadoMesa (
    id: number,
    estado: EstadoMesa,
): Promise<void> {
    await pool.query<ResultSetHeader>(
        "UPDATE mesa SET estado = ? WHERE id = ?",
        [estado, id]
    );
}   