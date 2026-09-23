import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

//*Pool de conexiones a MySQL. Utilizamos un pool en vez de
//una sola conexion debido a que varios dispositivos (garzones, caja, etc) van a consultar
//la base de datos al mismo tiempo
export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "puntocero",
    waitForConnections: true,
    connectionLimit: 12,
    queueLimit: 0,
});

export async function verificarConexionBD(): Promise<void> {
    try {
        const conexion = await pool.getConnection();
        console.log("Conexion a MySQL establecida correctamente.");
        conexion.release();
    } catch (error) {
        console.error("Error al conectar con MySql: ", error);
    }  
}