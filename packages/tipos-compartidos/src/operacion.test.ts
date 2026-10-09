import { describe, expect, it } from "vitest";
import { crearNodoDesdePlantilla } from "./factory-nodo";
import { DEPOSITO_VACIO } from "./deposito";
import { alertasOperacion, calendarioOperativo, type MedicionOperativa } from "./operacion";

describe("operación real del cultivo", () => {
  it("crea tareas diarias y una revisión de cosecha por nodo", () => {
    const tomate = crearNodoDesdePlantilla("tomate", "tomate-1")!;
    tomate.iniciado_en = "2026-08-01";
    const tareas = calendarioOperativo([tomate], new Date(2026, 9, 8));

    expect(tareas.map((tarea) => tarea.tipo)).toEqual(
      expect.arrayContaining(["ph", "oxigeno", "reposicion", "cosecha"]),
    );
    expect(tareas.find((tarea) => tarea.tipo === "cosecha")?.fechaObjetivo).toBe("2026-10-20");
  });

  it("detecta O₂ bajo y una reserva que no cabe", () => {
    const tomate = crearNodoDesdePlantilla("tomate", "tomate-1")!;
    const medicion: MedicionOperativa = {
      id: "m-1",
      fecha: "2026-10-08",
      ph: 6,
      oxigeno_mgL: 4,
      volumen_L: 2,
      notas: null,
    };
    const alertas = alertasOperacion(
      [tomate],
      {
        ...DEPOSITO_VACIO,
        largo_cm: 10,
        ancho_cm: 10,
        alto_liquido_cm: 10,
      },
      [medicion],
    );

    expect(alertas.map((alerta) => alerta.id)).toEqual(
      expect.arrayContaining(["oxigeno-bajo", "volumen-medido-insuficiente", "reserva-excede-deposito"]),
    );
  });
});
