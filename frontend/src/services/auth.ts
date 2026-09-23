export interface Empleado {
    id: string;
    nombre: string;
    usuario: string;
    rol: "garzon" | "cocina" | "barra" | "administrador";
}

const CLAVE_TOKEN = "puntocero_token";
const CLAVE_EMPLEADO = "puntocero_empleado";

export function guardarSesion(token: string, empleado: Empleado): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_EMPLEADO, JSON.stringify(empleado));
}

export function obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerEmpleadoActual(): Empleado | null {
    const datos = localStorage.getItem(CLAVE_EMPLEADO);
    return datos ? JSON.parse(datos) : null;
}

export function cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_EMPLEADO);
}

export function haySesionActiva(): boolean {
    return obtenerToken() !== null;
}