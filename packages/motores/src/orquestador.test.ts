import { describe, expect, it } from "vitest";
import {
  ejecutarPipeline,
  motorMinerales,
  motorOxigeno,
  motorPlagas,
  RegistroMotores,
} from "./index";

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

describe("MotorOxigeno", () => {
  it("suma oxigeno y deja null si falta un dato", () => {
    const resultado = motorOxigeno.procesar([
      { id: "a", tipoCultivo: "lechuga", variables: { oxigeno: 4 } },
      { id: "b", tipoCultivo: "lechuga", variables: { oxigeno: null } },
    ]);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos).toMatchObject({ totales: { oxigeno: null } });
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });
});

describe("MotorPlagas", () => {
  it("une plagas del grupo y no lanza si hay null", () => {
    const resultado = motorPlagas.procesar([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: {},
        plagas: ["Pulgón"],
        solucion_plagas: "jabón",
      },
      {
        id: "b",
        tipoCultivo: "tomate",
        variables: {},
        plagas: ["pulgón", "Araña"],
        solucion_plagas: "jabón",
      },
    ]);
    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos).toMatchObject({
      plagas: ["Pulgón", "Araña"],
      solucion_plagas: ["jabón"],
    });
  });

  it("invalida plagas del grupo si un nodo no las tiene", () => {
    const resultado = motorPlagas.procesar([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: {},
        plagas: ["Pulgón"],
        solucion_plagas: "jabón",
      },
      { id: "b", tipoCultivo: "tomate", variables: {}, plagas: null },
    ]);
    expect(resultado.datos).toMatchObject({ plagas: null });
    expect(resultado.advertencias.some((texto) => texto.includes("plagas"))).toBe(true);
  });
});

describe("ejecutarPipeline", () => {
  it("corre motores en paralelo desde el registro", async () => {
    const registro = new RegistroMotores();
    registro.registrar(motorMinerales);
    registro.registrar(motorOxigeno);
    registro.registrar(motorPlagas);
    const resultado = await ejecutarPipeline(
      registro,
      [
        { id: "a", tipoCultivo: "lechuga", variables: { mineral_hierro: 2, oxigeno: 1 } },
        { id: "b", tipoCultivo: "tomate", variables: { mineral_hierro: 5, oxigeno: 3 } },
      ],
      [{ origenId: "a", destinoId: "b" }],
    );
    expect(resultado.conteoPorTipo).toEqual({ lechuga: 1, tomate: 1 });
    expect(resultado.motores.map((motor) => motor.nombre)).toEqual([
      "minerales",
      "oxigeno",
      "plagas",
    ]);
  });
});
