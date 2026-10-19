export interface Empleado {
    id: number;
    nombre: string;
    usuario: string;
    rol: "garzon" | "cocina" | "barra" | "administrador";
}
const almacen = import.meta.env.DEV ? sessionStorage : localStorage;

const CLAVE_TOKEN = "puntocero_token";
const CLAVE_EMPLEADO = "puntocero_empleado";

export function guardarSesion(token: string, empleado: Empleado): void {
    almacen.setItem(CLAVE_TOKEN, token);
    almacen.setItem(CLAVE_EMPLEADO, JSON.stringify(empleado));
}

export function obtenerToken(): string | null {
    return almacen.getItem(CLAVE_TOKEN);
}

export function obtenerEmpleadoActual(): Empleado | null {
    const datos = almacen.getItem(CLAVE_EMPLEADO);
    return datos ? JSON.parse(datos) : null;
}

export function cerrarSesion(): void {
    almacen.removeItem(CLAVE_TOKEN);
    almacen.removeItem(CLAVE_EMPLEADO);
}

export function haySesionActiva(): boolean {
    return obtenerToken() !== null;
}