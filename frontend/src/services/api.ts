import { BACKEND_URL } from "./config";
import { obtenerToken, cerrarSesion } from "./auth";

export interface Mesa {
    id: number;
    numero: number;
    zona_id: number;
    zona_nombre: string,
    estado: "libre" | "ocupada" | "por_cobrar";
}

function headersConToken(): HeadersInit {
  const token = obtenerToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

//Revisa si la respuesta fue un 401 (Token invalido), de ser asi cierra 
//sesion local automaticamente.

async function manejarRespuesta(respuesta: Response) {
  if (respuesta.status === 401) {
    cerrarSesion();
    window.location.reload();
    throw new Error("Sesion expirada, inicia sesion de nuevo");
  }
  if(!respuesta.ok) {
    const data = await respuesta.json().catch(() => ({}));
    throw new Error(data.error || "Ocurrio un error inesperado");
  }
  return respuesta.json();
}

export async function obtenerMesas(): Promise<Mesa[]> {
    const respuesta = await fetch(`${BACKEND_URL}/api/mesas`);
    if(!respuesta.ok) throw new Error("No se pudo obtener el listado de mesas");
    return respuesta.json();
}

export async function actualizarEstadoMesa(
  id: number,
  estado: Mesa["estado"]
): Promise<Mesa> {
  const respuesta = await fetch(`${BACKEND_URL}/api/mesas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!respuesta.ok) throw new Error("No se pudo actualizar la mesa");
  return respuesta.json();
}

export interface Zona {
  id: number;
  nombre: string;
}

export async function obtenerZonas(): Promise<Zona[]> {
  const respuesta = await fetch(`${BACKEND_URL}/api/zonas`);
  if (!respuesta.ok) throw new Error("No se pudieron obtener las zonas");
  return respuesta.json();
}

export async function crearMesa(numero: number, zona_id: number): Promise<Mesa> {
  const respuesta = await fetch(`${BACKEND_URL}/api/mesas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero, zona_id }),
  });
  if (!respuesta.ok) throw new Error("No se pudo crear la mesa");
  return respuesta.json();
}

export async function eliminarMesa(id: number): Promise<void> {
  const respuesta = await fetch(`${BACKEND_URL}/api/mesas/${id}`, { method: "DELETE" });
  if (!respuesta.ok) {
    const data = await respuesta.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo eliminar la mesa");
  }
}
