import { describe, expect, it } from "vitest";
import { ejecutarPipeline, motorMinerales, RegistroMotores } from "./index";

describe("MotorMinerales", () => {
  it("no lanza cuando hay null y sigue con las otras categorías", () => {
    const resultado = motorMinerales.procesar([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 3, mineral_potasio: null },
      },
      {
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 1, mineral_potasio: 8 },
      },
    ]);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos).toMatchObject({
      totales: {
        mineral_magnesio: 4,
        mineral_potasio: null,
      },
    });
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });
});

describe("ejecutarPipeline", () => {
  it("corre motores en paralelo desde el registro", async () => {
    const registro = new RegistroMotores();
    registro.registrar(motorMinerales);
    const resultado = await ejecutarPipeline(
      registro,
      [
        { id: "a", tipoCultivo: "lechuga", variables: { mineral_hierro: 2 } },
        { id: "b", tipoCultivo: "tomate", variables: { mineral_hierro: 5 } },
      ],
      [{ origenId: "a", destinoId: "b" }],
    );
    expect(resultado.conteoPorTipo).toEqual({ lechuga: 1, tomate: 1 });
    expect(resultado.motores[0]?.nombre).toBe("minerales");
  });
});
