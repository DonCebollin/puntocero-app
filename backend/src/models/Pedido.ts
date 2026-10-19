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
    listo: number
}

export interface Pedido {
    id: number;
    mesa_id: number,
    creado_en: string;
    items: ItemPedido[];
}

export interface ItemPendiente {
    id: number;
    pedido_id: number;
    producto: string;
    cantidad: number;
    mesa_id: number;
    mesa_numero: number;
    creado_en: string;
    garzon: string | null;
}

export async function crearPedido(mesaId: number, items: ItemPedidoEntrada[], empleadoId: number | null = null): Promise<number> {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [resultadoPedido] = await conexion.query<ResultSetHeader>(
            "INSERT INTO pedidos (mesa_id, empleado_id) VALUES (?, ?)",
            [mesaId, empleadoId]
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
        "SELECT id, producto, estacion, cantidad, precio, listo FROM items_pedido WHERE pedido_id = ?",
        [id]
    );

    return { ...pedido, items } as Pedido;
}

export async function obtenerPedidosPorMesa(mesaId: number): Promise<Pedido[]> {
    const [filasPedidos] = await pool.query<RowDataPacket[]>(
"SELECT id, mesa_id, creado_en FROM pedidos WHERE mesa_id = ? AND cerrado = FALSE ORDER BY creado_en ASC",        [mesaId]
    );

    const pedidos: Pedido[] = [];
        for (const fila of filasPedidos) {
    const [items] = await pool.query<RowDataPacket[]>(
        "SELECT id, producto, estacion, cantidad, precio, listo FROM items_pedido WHERE pedido_id = ?"  ,
        [fila.id]
    );
    pedidos.push({ ...fila, items } as Pedido);
}
    return pedidos;
}

export async function cerrarCuentaMesa(mesaId: number): Promise<number> {
    const [items] = await pool.query<RowDataPacket[]>(
        `SELECT ip.cantidad, ip.precio
    FROM items_pedido ip
    JOIN pedidos p ON p.id = ip.pedido_id
    WHERE p.mesa_id = ? AND p.cerrado = FALSE`,
    [mesaId]
    );

    const total = items.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0);
    
    await pool.query(
        "UPDATE pedidos SET cerrado = TRUE WHERE mesa_id = ? AND cerrado = FALSE",
        [mesaId]
    );

    return total;

}

export async function obtenerItemsPendientes(estacion: "cocina" | "barra"): Promise<ItemPendiente[]>{
        const[fila] = await pool.query<RowDataPacket[]>(
            `SELECT ip.id, ip.pedido_id, ip.producto, ip.cantidad,
                p.mesa_id, m.numero AS mesa_numero,
                p.creado_en, e.nombre AS garzon
        FROM items_pedido ip
        JOIN pedidos p ON p.id = ip.pedido_id
        JOIN mesas m ON m.id = p.mesa_id
        LEFT JOIN empleados e ON e.id = p.empleado_id
        WHERE ip.estacion = ? AND ip.listo = FALSE AND p.cerrado = FALSE            ORDER BY p.creado_en ASC, ip.id ASC`,
        [estacion]
        );
        return fila as ItemPendiente[];
}

export async function marcarItemListo(itemId: number) {
    const [filas] = await pool.query<RowDataPacket[]>(
        `SELECT ip.id, ip.pedido_id, ip.estacion, p.mesa_id
        FROM items_pedido ip
        JOIN pedidos p ON p.id = ip.pedido_id
        WHERE ip.id = ?`,
        [itemId]
    );
    const item = filas[0];
    if(!item) return null;

    await pool.query("UPDATE items_pedido SET listo = TRUE WHERE id = ?", [itemId]);
    return item;
}