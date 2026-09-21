import { pool } from "../config/database";
import { RowDataPacket } from "mysql2";

export interface Producto {
    id: number,
    nombre: string,
    precio: number,
    categoria: "comida" | "bebida";
    estacion: "cocina" | "barra";
    disponible: boolean;
}

export async function obtenerProductos(): Promise<Producto[]> {
    const [filas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nombre, precio, categoria, estacion, disponible FROM productos ORDER BY estacion, nombre ASC"
    );
    return filas as Producto[];
}
