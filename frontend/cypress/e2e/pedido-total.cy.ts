/// <reference types="cypress" />
export {};
const API = "http://localhost:3000/api";
const password = "clave1234";
const garzon = "e2e_t" + Date.now();
const cocinero = "e2e_k" + Date.now();
const aNumero = (texto: string) => Number(texto.replace(/\D/g, ""));

const contar = ($body: JQuery<HTMLElement>, texto: string) =>
    $body.find("span.rounded-full").filter((_, el) => el.textContent?.trim() === texto).length;

function iniciarSesion(usuario: string, clave: string) {
    cy.visit("/");
    cy.get("#input-usuario").type(usuario, {delay: 100});
    cy.get("#input-password").type(clave, {delay: 100});
    cy.get("#btn-login").click();
    cy.get("#btn-cerrar-sesion").should("be.visible");
}

describe("Cierre de cuenta: pedido listo, total y mesa libre", () => {
    let mesa = { id: 0, numero: 0};
    let totalEsperado = 0;
    let cantidadItems = 0;

    before(() => {
    cy.request("POST", `${API}/empleados/registro`, {
        nombre: "Garzon Total",
        usuario: garzon,
        password,
        rol: "garzon",
    });

    cy.request("POST", `${API}/empleados/registro`, {
        nombre: "Cocina Total",
        usuario: cocinero,
        password,
        rol: "cocina",
    });

    cy.request("POST", `${API}/empleados/login`, { usuario: garzon, password }).then((loginGarzon) => {
        cy.request("POST", `${API}/empleados/login`, { usuario: cocinero, password }).then((loginCocina) => {
        const hg = { Authorization: `Bearer ${loginGarzon.body.token}` };
        const hc = { Authorization: `Bearer ${loginCocina.body.token}` };

    cy.request({ url: `${API}/mesas`, headers: hg }).then((resMesas) => {
        const mesas = resMesas.body as Array<{ id: number; numero: number; estado: string }>;
        const elegida = mesas.find((m) => m.estado === "libre") ?? mesas[0];
        mesa = { id: elegida.id, numero: elegida.numero };

        cy.request({ url: `${API}/productos`, headers: hg }).then((resProductos) => {
            const productos = resProductos.body as Array<{ id: number }>;
            const items = productos.slice(0, 2).map((p, i) => ({ producto_id: p.id, cantidad: i === 0 ? 2 : 1 }));

            cy.request({ method: "POST", url: `${API}/pedidos`, headers: hg, body: { mesa_id: mesa.id, items } });
            cy.request({ method: "PATCH", url: `${API}/mesas/${mesa.id}/estado`, headers: hg, body: { estado: "ocupada" } });

            cy.request({ url: `${API}/pedidos/mesa/${mesa.id}`, headers: hg }).then((resPedidos) => {
            const pedidos = resPedidos.body as Array<{
                items: Array<{ id: number; precio: number | string; cantidad: number; listo: boolean | number }>;
            }>;
            const todos = pedidos.flatMap((p) => p.items);
            cantidadItems = todos.length;
              totalEsperado = todos.reduce((acc, it) => acc + Number(it.precio) * it.cantidad, 0);

            todos
                .filter((it) => !it.listo)
                .forEach((it) => {
                    cy.request({ method: "PATCH", url: `${API}/pedidos/items/${it.id}/listo`, headers: hc });
                        });
                    });
                });
            });
        });
    });
});

it("el garzón verifica que todo esté listo, cierra la cuenta y la mesa queda libre", () => {
    iniciarSesion(garzon, password);

    cy.get(`.mesa-btn[data-id="${mesa.id}"]`).should("have.attr", "data-estado", "ocupada").click();
    cy.contains("Ya pedido en esta mesa").should("be.visible");

    cy.get("body").should(($body) => {
        expect(contar($body, "Pendiente")).to.eq(0);
        expect(contar($body, "Listo")).to.eq(cantidadItems);
    });

    cy.contains("span", "Subtotal ya pedido")
        .next()
        .should(($subtotal) => {
        expect(aNumero($subtotal.text())).to.eq(totalEsperado);
    });

    cy.get("#btn-cerrar-cuenta").click();
    cy.get("#btn-confirmar-confirm").click();

    cy.contains("Cuenta cerrada. Total cobrado:")
        .invoke("text")
        .should((texto) => {
        expect(aNumero(texto)).to.eq(totalEsperado);
    });

    cy.get(`.mesa-btn[data-id="${mesa.id}"]`).should("have.attr", "data-estado", "libre");
    });
});
