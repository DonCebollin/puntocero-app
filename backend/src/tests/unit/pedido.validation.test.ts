import { describe, expect, it } from "vitest";
import { crearPedidoSchema } from "../../validations/pedido.validation";
import { rmSync } from "node:fs";
import { error } from "node:console";

describe("Validacion de pedidos - Pruebas Unitarias", () =>{
    it("debe tener un pedido con mesa y producto validos", () => {
        const resultado = crearPedidoSchema.safeParse({
            mesa_id: 1,
            items: [{ producto_id: 3, cantidad: 2}],
        });

        expect(resultado.success).toBe(true);
        expect(resultado).toMatchObject({ data: { mesa_id: 1 }});
        expect(resultado).toMatchObject({ data: { items: [{ producto_id: 3, cantidad: 2}] } });
    });

    it("debe rechazar un pedido sin productos", () => {
        const resultado = crearPedidoSchema.safeParse({ mesa_id: 1, items: []});
        const errores = resultado.success ? [] : resultado.error.issues;

        expect (resultado.success).toBe(false);
        expect(errores.map((e) => e.path[0])).toContain("items");
        expect(errores.map((e) => e.message)).toContain("El pedido debe tener al menos 1 producto");
    });

    it("debe rechazar un producto con cantidad cero", () => {
        const resultado = crearPedidoSchema.safeParse({
            mesa_id: 1,
            items: [{ producto_id: 3, cantidad: 0}],
        });
        const errores = resultado.success ? [] : resultado.error.issues;

        expect(resultado.success).toBe(false);
        expect(errores.map((e) => e.path)).toContainEqual(["items", 0, "cantidad"]);
        expect(errores).toHaveLength(1);
    })
})