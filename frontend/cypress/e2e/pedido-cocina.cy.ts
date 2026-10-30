/// <reference types="cypress" />
const API = "http://localhost:3000/api";
const password = "clave1234";
const garzon = "e2e_g" + Date.now();
const cocinero = "e2e_c" + Date.now();

function iniciarSesion(usuario: string, clave: string) {
    cy.visit("/");
    cy.get("#input-usuario").type(usuario);
    cy.get("#input-password").type(clave);
    cy.get("#btn-login").click();
    cy.get("#btn-cerrar-sesion").should("be.visible");
}

describe("Flujo del pedido: garzon a cocina", () => {
    let mesa: { id: number, numero: number};

    before(() => {
        cy.request("POST", `${API}/empleados/registro`, {
            nombre: "Garzon Prueba",
            usuario: garzon,
            password,
            rol: "garzon",
    });
        cy.request("POST", `${API}/empleados/registro`, {
            nombre: "Cocina Prueba",
            usuario: cocinero,
            password,
            rol: "cocina",
        });

        cy.request("POST", `${API}/empleados/login`, { usuario: garzon, password }).then((login) => {
            const headers = { Authorization: `Bearer ${login.body.token}` };

        cy.request({ url: `${API}/mesas`, headers }).then((res) => {
        const mesas = res.body as Array<{ id: number; numero: number; estado: string }>;
        const elegida = mesas.find((m) => m.estado === "libre") ?? mesas[0];
        mesa = { id: elegida.id, numero: elegida.numero };

        cy.request({
            method: "PATCH",
            url: `${API}/mesas/${elegida.id}/estado`,
            headers,
            body: { estado: "libre" },
            });
        });
    });
});

it("el garzón envía un pedido y cocina lo ve y lo marca como listo", () => {
    iniciarSesion(garzon, password);

    cy.get(`.mesa-btn[data-id="${mesa.id}"]`).click();
    cy.get(".btn-agregar-producto").first().click();
    cy.get("#total-pedido").should("not.have.text", "$0");
    cy.get("#btn-enviar").click();

    cy.get(`.mesa-btn[data-id="${mesa.id}"]`).should("have.attr", "data-estado", "ocupada");
    cy.get("#btn-cerrar-sesion").click();

    iniciarSesion(cocinero, password);

    cy.get("#contador").should("not.contain", "Sin pendientes");
    cy.contains("#lista-cola > div", `Mesa ${mesa.numero} ·`).should("be.visible");

    cy.get("#lista-cola > div").its("length").then((antes) => {
    cy.contains("#lista-cola > div", `Mesa ${mesa.numero} ·`).find(".btn-listo").click();
    cy.get("#lista-cola > div").should("have.length", antes - 1);
    });
  });
});
