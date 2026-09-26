import { io, Socket} from "socket.io-client";
import { BACKEND_URL } from "./config";

//Conexion socket.io
export const socket: Socket = io(BACKEND_URL || undefined, {
    autoConnect: true,
    reconnection: true,
});

socket.on("connect", () => {
    console.log("Conectado al servidor en tiempo real: ",socket.id);
});