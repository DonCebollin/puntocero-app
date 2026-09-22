import { pool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ItemPedidoEntrada {
    producto_id: number;
    cantidad: number;
}

export interface ItemPedido {
    id: number;
    producto: string,
    estacion: "cocina" | "barra";
    cantidad: number;
    precio: number;
}

export interface Pedido {
    id: number;
    mesa_id: number,
    creado_en: string;
    items: ItemPedido[];
}

export async function crearPedido(mesaId: number, items: ItemPedidoEntrada[]): Promise<number> {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [resultadoPedido] = await conexion.query<ResultSetHeader>(
            "INSERT INTO pedidos (mesa_id) VALUES (?)",
            [mesaId]
        );
        const pedidoId = resultadoPedido.insertId;

        for(const item of items) {
            const [filasProducto] = await conexion.query<RowDataPacket[]>(
                "SELECT nombre, precio, estacion FROM productos WHERE id = ?",
                [item.producto_id]
            );
            const producto = filasProducto[0];

            if(!producto) {
                throw new Error(`El producto con id ${item.producto_id} no existe`);
            }

            await conexion.query(
                "INSERT INTO items_pedido (pedido_id, producto, estacion, cantidad, precio) VALUES (?, ?, ?, ?, ?)",
                [pedidoId, producto.nombre, producto.estacion, item.cantidad, producto.precio]  
            );
        }
        await conexion.commit();
        return pedidoId;
    } catch (error) {
        await conexion.rollback();
        throw error;
    }finally{
        conexion.release();
    }
}

export async function obtenerPedidoPorId(id: number): Promise<Pedido | null > {
    const [filasPedido] = await pool.query<RowDataPacket[]>(
        "SELECT id, mesa_id, creado_en FROM pedidos WHERE id = ?",
        [id]
    );
    const pedido = filasPedido[0];
    if (!pedido) return null;

    const [items] = await pool.query<RowDataPacket[]>(
        "SELECT id, producto, estacion, cantidad, precio FROM items_pedido WHERE pedido_id = ?",
        [id]
    );

    return { ...pedido, items } as Pedido;
}