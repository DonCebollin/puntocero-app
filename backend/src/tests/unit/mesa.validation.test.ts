import { describe, expect, it } from "vitest";
import { actualizarEstadoSchema, crearMesaSchema } from "../../validations/mesa.validation"; 
import { date } from "zod";

const camposConError = ( r: {
    success: boolean;
    error?: { issues: readonly { path: readonly PropertyKey[] }[]};
}) => (r.success || !r.error ? [] : r.error.issues.map((i) => i.path[0]));

describe("Validacion de mesas - Pruebas Unitarias", () => {
    it("debe aceptar una mesa con numero y zona positivos", () => {
        const resultado = crearMesaSchema.safeParse({ numero: 5, zona_id: 2});

        expect(resultado.success).toBe(true);
        expect(resultado).toMatchObject({ data: { numero: 5}});
        expect(resultado).toMatchObject({ data: {zona_id: 2}});
    });

    it("debe rechazar un numero de mesa igual a cero", () => {
        const resultado = crearMesaSchema.safeParse({ numero: 0, zona_id: 2});
        const campos = camposConError(resultado);

        expect(resultado.success).toBe(false);
        expect(campos).toContain("numero");
        expect(campos).not.toContain("zona_id");
    });

    it("debe rechazar un estado de mesa que no existe", () => {
        const resultado = actualizarEstadoSchema.safeParse({ estado: "Cerrada"});
        const campos = camposConError(resultado);

        expect(resultado.success).toBe(false);
        expect(campos).toContain("estado");
        expect(campos).toHaveLength(1);
    });
});