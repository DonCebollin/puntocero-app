import { socket } from "./socket";
import { obtenerEmpleadoActual } from "./auth";

let contexto: AudioContext | null = null;
let iniciado = false;

const DURACION_AVISO = 8000;

type ItemAviso = { cantidad: number; producto: string };

type Aviso = {
    tipo: "pedido" | "listo";
    mesa: number | string;
    items: ItemAviso[];
    persistente: boolean;
};

const ICONO_CAMPANA = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>`;
const ICONO_LISTO = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path></svg>`;
const ICONO_CHECK = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>`;

function obtenerContexto() : AudioContext {
    if(!contexto) {
        const Constructor = window.AudioContext || (window as any).webkitAudioContext;
        contexto = new Constructor();
    }
    return contexto;
}

function desbloquearAudio() {
    const ctx = obtenerContexto();
    if (ctx.state === "suspended") ctx.resume();
}

function tocarSonido(tipo: "pedido" | "listo") {
    const ctx = obtenerContexto();
    if(ctx.state === "suspended") ctx.resume();
    const notas = tipo === "pedido" ? [660, 880] : [880, 660, 880];

    notas.forEach((frecuencia, i) => {
        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();
        const inicio = ctx.currentTime + i * 0.18;
        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;
        ganancia.gain.setValueAtTime(0.0001, inicio);
        ganancia.gain.exponentialRampToValueAtTime(0.4, inicio + 0.02);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);
        oscilador.start(inicio);
        oscilador.stop(inicio + 0.18);
    });
}

function vibrar() {
    if (navigator.vibrate) navigator.vibrate([200,100, 200]);
}

function obtenerContenedor(): HTMLElement {
    let contenedor = document.getElementById("avisos");
    if(!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "avisos";
        contenedor.className = "fixed top-2 inset-x-2 z-50 flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(contenedor);
    }
    return contenedor;
}

function mostrarAviso(aviso: Aviso) {
    const esPedido = aviso.tipo === "pedido";
    const acento = esPedido ? "var(--color-porcobrar, #f59e0b)" : "var(--color-libre, #10b981)";

    const tarjeta = document.createElement("div");
    tarjeta.className = `pointer-events-auto relative overflow-hidden flex items-center gap-2.5 bg-tarjeta text-texto rounded-2xl p-2 shadow-lg ${aviso.persistente ? "" : "pb-3"}`;
    tarjeta.style.border = `1px solid color-mix(in srgb, ${acento} 55%, transparent)`;

    const mesa = document.createElement("div");
    mesa.className = "shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-extrabold";
    mesa.style.background = acento;
    mesa.style.color = "#0b1220";
    mesa.textContent = String(aviso.mesa);

    const cuerpo = document.createElement("div");
    cuerpo.className = "flex-1 min-w-0 flex flex-col gap-0.5";

    const etiqueta = document.createElement("div");
    etiqueta.className = "flex items-center gap-1 text-[11px] font-extrabold tracking-wide";
    etiqueta.style.color = acento;
    const icono = document.createElement("span");
    icono.innerHTML = esPedido ? ICONO_CAMPANA : ICONO_LISTO;
    const textoEtiqueta = document.createElement("span");
    textoEtiqueta.textContent = `${esPedido ? "NUEVO PEDIDO" : "LISTO"} · MESA ${aviso.mesa}`;
    etiqueta.append(icono, textoEtiqueta);

    const productos = document.createElement("div");
    productos.className = "text-sm font-semibold truncate";
    productos.textContent = aviso.items.map((i) => `${i.cantidad}× ${i.producto}`).join(", ");

    cuerpo.append(etiqueta, productos);
    tarjeta.append(mesa, cuerpo);

    let barra: HTMLElement | null = null;

    if (aviso.persistente) {
        const boton = document.createElement("button");
        boton.className = "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center";
        boton.style.background = acento;
        boton.style.color = "#0b1220";
        boton.setAttribute("aria-label", "Entendido");
        boton.innerHTML = ICONO_CHECK;
        boton.addEventListener("click", () => tarjeta.remove());
        tarjeta.append(boton);
    } else {
        const pista = document.createElement("div");
        pista.className = "absolute inset-x-0 bottom-0 h-[3px]";
        pista.style.background = `color-mix(in srgb, ${acento} 20%, transparent)`;
        barra = document.createElement("div");
        barra.className = "h-full";
        barra.style.background = acento;
        barra.style.width = "100%";
        barra.style.transition = `width ${DURACION_AVISO}ms linear`;
        pista.append(barra);
        tarjeta.append(pista);
        tarjeta.addEventListener("click", () => tarjeta.remove());
    }

    obtenerContenedor().appendChild(tarjeta);

    if (barra) {
        void barra.offsetWidth;
        barra.style.width = "0%";
        setTimeout(() => tarjeta.remove(), DURACION_AVISO);
    }
}

export function iniciarAvisos() {
    if (iniciado) return;
    const empleado = obtenerEmpleadoActual();
    if(!empleado) return;
    iniciado = true;

    document.addEventListener("click", desbloquearAudio, {once: true});
    document.addEventListener("touchstart", desbloquearAudio, {once: true});

    if(empleado.rol === "cocina" || empleado.rol === "barra") {
        socket.on(
            `pedido:nuevo:${empleado.rol}`,
            (data: {mesaNumero?: number; items: ItemAviso[] }) => {
                tocarSonido("pedido");
                vibrar();
                mostrarAviso({
                    tipo: "pedido",
                    mesa: data.mesaNumero ?? "?",
                    items: data.items,
                    persistente: false,
                });
            }
        );
    }

    if (empleado.rol === "garzon") {
        socket.on(
            "item:listo",
            (data: { garzonId: number | null; mesaNumero: number; producto: string; cantidad: number }) => {
                if (data.garzonId !== empleado.id) return;
                tocarSonido("listo");
                vibrar();
                mostrarAviso({
                    tipo: "listo",
                    mesa: data.mesaNumero,
                    items: [{ cantidad: data.cantidad, producto: data.producto }],
                    persistente: true,
                });
            }
        );
    }
}