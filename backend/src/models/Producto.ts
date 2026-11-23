import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader} from "mysql2";

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
    return filas.map((f) => ({ ...f, disponible: Boolean(f.disponible) })) as Producto[];
}

export async function actualizarDisponibilidad(id: number, disponible: boolean): Promise<Producto | null> {
    const [resultado] = await pool.query<ResultSetHeader>(
        "UPDATE productos SET disponible = ? WHERE id = ?",
        [disponible, id]
    );
    if (resultado.affectedRows === 0) return null;

    const [filas] = await pool.query<RowDataPacket[]>(
        "SELECT id, nombre, precio, categoria, estacion, disponible FROM productos WHERE id = ?",
        [id]
    );
    if (!filas[0]) return null;
    return { ...filas[0], disponible: Boolean(filas[0].disponible) } as Producto;
}