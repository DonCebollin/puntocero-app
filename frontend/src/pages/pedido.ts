
import { obtenerProductos, crearPedido, actualizarEstadoMesa, obtenerPedidosPorMesa, Producto, Mesa } from "../services/api";


export async function renderPantallaPedido(
    contenedor: HTMLElement,
    mesa: Mesa,
    alVolver: () => void
): Promise<void> {
    contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie p-4">
    <div class="flex items-center gap-3 mb-4">
        <button id="btn-volver" class="text-gray-400 hover:text-white text-sm">← Volver</button>
        <h1 class="text-xl font-bold text-white">Pedido — Mesa ${mesa.numero}</h1>
    </div>

    <div class="flex gap-2 mb-4">
        <button id="tab-cocina" class="tab-btn bg-libre text-white text-sm font-semibold px-4 py-2 rounded-lg">Cocina</button>
        <button id="tab-barra" class="tab-btn bg-tarjeta text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg">Barra</button>
    </div>

    <div id="lista-productos" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"></div>

    <div class="bg-tarjeta rounded-lg p-4">
        <h2 class="text-white font-semibold mb-3">Pedido actual</h2>
        <div id="lista-pedido" class="space-y-2 mb-3"></div>
    <div class="flex justify-between items-center border-t border-gray-700 pt-3">
        <span class="text-gray-300">Total</span>
        <span id="total-pedido" class="text-white text-xl font-bold">$0</span>
    </div>
        <button id="btn-enviar" class="bg-libre text-white font-semibold w-full py-2 rounded-lg mt-4 hover:opacity-90 transition">
        Enviar Pedido
        </button>
    </div>
    </div>
`;

    const listaProductos = contenedor.querySelector("#lista-productos") as HTMLElement;
    const listaPedido = contenedor.querySelector("#lista-pedido") as HTMLElement;
    const totalPedido = contenedor.querySelector("#total-pedido") as HTMLElement;
    const btnVolver = contenedor.querySelector("#btn-volver") as HTMLButtonElement;
    const btnEnviar = contenedor.querySelector("#btn-enviar") as HTMLButtonElement;
    const tabCocina = contenedor.querySelector("#tab-cocina") as HTMLButtonElement;
    const tabBarra = contenedor.querySelector("#tab-barra") as HTMLButtonElement;

    btnVolver.addEventListener("click", alVolver);

    const productos = await obtenerProductos();

    const pedidosAnteriores = await obtenerPedidosPorMesa(mesa.id);
        if (pedidosAnteriores.length > 0) {
            const resumenAnterior = document.createElement("div");
            resumenAnterior.className = "bg-tarjeta rounded-lg p-4 mb-4";
    const todosLosItems = pedidosAnteriores.flatMap((p: any) => p.items);
    const totalAnterior = todosLosItems.reduce((acc: number, item: any) => acc + Number(item.precio) * item.cantidad, 0);

    resumenAnterior.innerHTML = `
            <h2 class="text-white font-semibold mb-2">Ya pedido en esta mesa</h2>
            ${todosLosItems.map((item: any) => `
        <div class="flex justify-between text-sm text-gray-300">
            <span>${item.cantidad}x ${item.producto}</span>
            <span>$${(Number(item.precio) * item.cantidad).toLocaleString("es-CL")}</span>
        </div>
    `).join("")}
        <div class="flex justify-between text-sm text-gray-400 border-t border-gray-700 mt-2 pt-2">
            <span>Subtotal ya pedido</span>
            <span>$${totalAnterior.toLocaleString("es-CL")}</span>
        </div>
    `;
    contenedor.querySelector(".min-h-screen")!.insertBefore(
    resumenAnterior,
    contenedor.querySelector("#tab-cocina")!.parentElement
    );
}
    const pedidoActual = new Map<number, number>();
    let estacionActiva: "cocina" | "barra" = "cocina";

function pintarProductos() {
    const filtrados = productos.filter((p) => p.estacion === estacionActiva);
    listaProductos.innerHTML = filtrados
        .map(
        (p) => `
        <div class="bg-tarjeta rounded-lg p-3 flex justify-between items-center">
        <div>
            <p class="text-white text-sm font-medium">${p.nombre}</p>
            <p class="text-gray-400 text-xs">$${Number(p.precio).toLocaleString("es-CL")}</p>
        </div>
            <button data-id="${p.id}" class="btn-agregar-producto bg-libre text-white w-8 h-8 rounded-full font-bold">+</button>
        </div>`
    )
    .join("");
    
    listaProductos.querySelectorAll<HTMLButtonElement>(".btn-agregar-producto").forEach((btn) => {
        btn.addEventListener("click", () =>{
            const id = Number(btn.dataset.id);
            pedidoActual.set(id, (pedidoActual.get(id) || 0) + 1);
            pintarPedido();
        });
    });
}

function pintarPedido() {
    if (pedidoActual.size === 0) {
        listaPedido.innerHTML = `<p class="text-gray-500 text-sm">Sin productos aún</p>`;
        totalPedido.textContent = "$0";
        return;
    }
    let total = 0;
    listaPedido.innerHTML = Array.from(pedidoActual.entries())
        .map(([id, cantidad]) => {
        const producto = productos.find((p) => p.id === id)!;
        const subtotal = Number(producto.precio) * cantidad;
        total += subtotal;
        return `<div class="flex justify-between items-center text-sm">
        <div class="flex items-center gap-2">
            <button data-id="${id}" class="btn-restar bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 rounded-full text-xs">−</button>
            <span class="text-gray-300">${cantidad}x ${producto.nombre}</span>
        </div>
        <span class="text-white">$${subtotal.toLocaleString("es-CL")}</span>
    </div>`;

    })
    .join("");
    totalPedido.textContent = `$${total.toLocaleString("es-CL")}`;


listaPedido.querySelectorAll<HTMLButtonElement>(".btn-restar").forEach((btn) => {
    btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const cantidadActual = pedidoActual.get(id) || 0;
        if (cantidadActual <= 1) {
            pedidoActual.delete(id);
        } else {
            pedidoActual.set(id, cantidadActual - 1);
        }
        pintarPedido();
        });
    });
}

tabCocina.addEventListener("click", () => {
    estacionActiva = "cocina";
    tabCocina.className = "tab-btn bg-libre text-white text-sm font-semibold px-4 py-2 rounded-lg";
    tabBarra.className = "tab-btn bg-tarjeta text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg";
    pintarProductos();
});

tabBarra.addEventListener("click", () => {
    estacionActiva = "barra";
    tabBarra.className = "tab-btn bg-libre text-white text-sm font-semibold px-4 py-2 rounded-lg";
    tabCocina.className = "tab-btn bg-tarjeta text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg";
    pintarProductos();
});

btnEnviar.addEventListener("click", async () => {
    if(pedidoActual.size === 0) {
        alert("Agrega al menos un producto antes de enviar");
        return;
    }
    const items = Array.from(pedidoActual.entries()).map(([producto_id, cantidad]) => ({ producto_id, cantidad}));

    try{
        await crearPedido(mesa.id, items);
        if(mesa.estado === "libre"){
            await actualizarEstadoMesa(mesa.id, "ocupada");
        }
        alert("Pedido enviado correctamente");
        alVolver();
    }catch (error: any) {
        alert(error.message);
    }
});

pintarProductos();
pintarPedido();
}
