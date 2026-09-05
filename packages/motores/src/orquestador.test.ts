import { describe, expect, it } from "vitest";
import {
  ejecutarPipeline,
  motorInsumos,
  motorMinerales,
  motorOxigeno,
  motorPlagas,
  RegistroMotores,
} from "./index";

describe("MotorMinerales", () => {
  it("dosifica mg = mg/L × L y no lanza si una categoría queda null", () => {
    const resultado = motorMinerales.procesar([
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, mineral_potasio: null, cantidad_sol: 4 },
      },
      {
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 48.6, mineral_potasio: 235, cantidad_sol: 4 },
      },
    ]);
    expect(resultado.exitoso).toBe(true);
    const totales = resultado.datos.totales as Record<string, number | null>;
    expect(totales.mineral_magnesio).toBeCloseTo(388.8);
    expect(totales.mineral_potasio).toBeNull();
    expect(resultado.advertencias.length).toBeGreaterThan(0);
  });
});

describe("MotorOxigeno", () => {
  it("no suma mg/L: usa el mínimo del tanque o null si falta un dato", () => {
    const incompleto = motorOxigeno.procesar([
      { id: "a", tipoCultivo: "lechuga", variables: { oxigeno: 6 } },
      { id: "b", tipoCultivo: "lechuga", variables: { oxigeno: null } },
    ]);
    expect(incompleto.exitoso).toBe(true);
    expect(incompleto.datos).toMatchObject({ totales: { oxigeno: null } });

    const mixto = motorOxigeno.procesar([
      { id: "a", tipoCultivo: "lechuga", variables: { oxigeno: 6 } },
      { id: "b", tipoCultivo: "tomate", variables: { oxigeno: 5 } },
    ]);
    expect(mixto.datos).toMatchObject({ totales: { oxigeno: 5 } });
    expect(mixto.advertencias.length).toBeGreaterThan(0);
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

describe("MotorInsumos", () => {
  it("suma litros incluido 0 y deja null si falta un dato", () => {
    const completo = motorInsumos.procesar([
      { id: "a", tipoCultivo: "lechuga", variables: { cantidad_sol: 4 } },
      { id: "b", tipoCultivo: "lechuga", variables: { cantidad_sol: 0 } },
    ]);
    expect(completo.datos).toMatchObject({ totales: { cantidad_sol: 4 } });

    const incompleto = motorInsumos.procesar([
      { id: "a", tipoCultivo: "lechuga", variables: { cantidad_sol: 4 } },
      { id: "b", tipoCultivo: "tomate", variables: { cantidad_sol: null } },
    ]);
    expect(incompleto.exitoso).toBe(true);
    expect(incompleto.datos).toMatchObject({ totales: { cantidad_sol: null } });
    expect(incompleto.advertencias.length).toBeGreaterThan(0);
  });
});

describe("ejecutarPipeline", () => {
  it("corre motores en paralelo desde el registro", async () => {
    const registro = new RegistroMotores();
    registro.registrar(motorMinerales);
    registro.registrar(motorOxigeno);
    registro.registrar(motorPlagas);
    registro.registrar(motorInsumos);
    const resultado = await ejecutarPipeline(
      registro,
      [
        {
          id: "a",
          tipoCultivo: "lechuga",
          variables: { mineral_hierro: 1, oxigeno: 6, cantidad_sol: 4 },
        },
        {
          id: "b",
          tipoCultivo: "tomate",
          variables: { mineral_hierro: 2, oxigeno: 6, cantidad_sol: 8 },
        },
      ],
      [{ origenId: "a", destinoId: "b" }],
    );
    expect(resultado.conteoPorTipo).toEqual({ lechuga: 1, tomate: 1 });
    expect(resultado.motores.map((motor) => motor.nombre)).toEqual([
      "minerales",
      "oxigeno",
      "plagas",
      "insumos",
    ]);
    expect(resultado.motores.find((motor) => motor.nombre === "insumos")?.grupos[0]?.datos).toMatchObject(
      { totales: { cantidad_sol: 12 } },
    );
    const minerales = resultado.motores.find((motor) => motor.nombre === "minerales")
      ?.grupos[0]?.datos.totales as Record<string, number | null> | undefined;
    const oxigeno = resultado.motores.find((motor) => motor.nombre === "oxigeno")
      ?.grupos[0]?.datos.totales as Record<string, number | null> | undefined;
    expect(minerales?.mineral_hierro).toBe(20);
    expect(oxigeno?.oxigeno).toBe(6);
  });
});
