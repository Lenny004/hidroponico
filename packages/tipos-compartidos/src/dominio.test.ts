import { describe, expect, it } from "vitest";
import { aristaCreariaCiclo } from "./grafo-dag";
import { idsComponenteConexa } from "./componente-conexa";
import { crearNodoDesdePlantilla } from "./factory-nodo";
import { CLAVES_VARIABLES_CULTIVO } from "./nodo-cultivo";
import { agregarCategoriaEnGrupo, agregarCategoriasPorGrupos } from "./agregar-grupos";
import { conteoPorTipo } from "./conteo-por-tipo";
import { normalizarPlagas, parsearNumeroONull } from "./parsear-valores";

describe("aristaCreariaCiclo", () => {
  it("rechaza un bucle sobre el mismo nodo", () => {
    expect(aristaCreariaCiclo([], "a", "a")).toBe(true);
  });

  it("rechaza C→A cuando ya existe A→B→C", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "b", destinoId: "c" },
    ];
    expect(aristaCreariaCiclo(aristas, "c", "a")).toBe(true);
  });

  it("permite A→C cuando solo existe A→B", () => {
    const aristas = [{ origenId: "a", destinoId: "b" }];
    expect(aristaCreariaCiclo(aristas, "a", "c")).toBe(false);
  });

  it("permite un diamante acíclico y rechaza el cierre del ciclo", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "a", destinoId: "c" },
      { origenId: "b", destinoId: "d" },
      { origenId: "c", destinoId: "d" },
    ];
    expect(aristaCreariaCiclo(aristas, "b", "c")).toBe(false);
    expect(aristaCreariaCiclo(aristas, "d", "a")).toBe(true);
  });
});

describe("idsComponenteConexa", () => {
  it("agrupa nodos unidos sin importar la dirección de la arista", () => {
    const aristas = [
      { origenId: "a", destinoId: "b" },
      { origenId: "c", destinoId: "d" },
    ];
    expect(idsComponenteConexa(aristas, "b").sort()).toEqual(["a", "b"]);
    expect(idsComponenteConexa(aristas, "c").sort()).toEqual(["c", "d"]);
  });
});

describe("crearNodoDesdePlantilla", () => {
  it("crea un nodo con las variables del boceto en null", () => {
    const nodo = crearNodoDesdePlantilla("lechuga", "n1");
    expect(nodo?.tipoCultivo).toBe("lechuga");
    expect(CLAVES_VARIABLES_CULTIVO).toHaveLength(6);
    for (const clave of CLAVES_VARIABLES_CULTIVO) {
      expect(nodo?.variables[clave]).toBeNull();
    }
  });

  it("rechaza un tipo que no está en el catálogo", () => {
    expect(crearNodoDesdePlantilla("banano", "n1")).toBeNull();
  });
});

describe("parsearNumeroONull", () => {
  it("trata vacío e inválido como null, no como 0", () => {
    expect(parsearNumeroONull("")).toBeNull();
    expect(parsearNumeroONull("  ")).toBeNull();
    expect(parsearNumeroONull("abc")).toBeNull();
  });

  it("acepta 0 explícito y decimales con coma", () => {
    expect(parsearNumeroONull("0")).toBe(0);
    expect(parsearNumeroONull("12,5")).toBe(12.5);
  });
});

describe("normalizarPlagas", () => {
  it("devuelve null si no queda ningún nombre", () => {
    expect(normalizarPlagas([])).toBeNull();
    expect(normalizarPlagas(["  ", ""])).toBeNull();
    expect(normalizarPlagas(null)).toBeNull();
  });

  it("elimina duplicados conservando el primero", () => {
    expect(normalizarPlagas(["Pulgón", "pulgón", "Araña"])).toEqual([
      "Pulgón",
      "Araña",
    ]);
  });
});

describe("agregarCategoriaEnGrupo", () => {
  it("suma cuando todos tienen número, incluido 0", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { mineral_magnesio: 10 } },
      { id: "b", tipoCultivo: "lechuga", variables: { mineral_magnesio: 0 } },
    ];
    expect(agregarCategoriaEnGrupo(nodos, "mineral_magnesio")).toEqual({
      categoria: "mineral_magnesio",
      total: 10,
      invalidadoPorNull: false,
    });
  });

  it("deja el grupo en null si un nodo no tiene el dato", () => {
    const nodos = [
      { id: "a", tipoCultivo: "lechuga", variables: { mineral_potasio: 4 } },
      { id: "b", tipoCultivo: "tomate", variables: { mineral_potasio: null } },
    ];
    expect(agregarCategoriaEnGrupo(nodos, "mineral_potasio").total).toBeNull();
  });
});

describe("agregarCategoriasPorGrupos", () => {
  it("no mezcla minerales distintos y sigue si una categoría queda null", () => {
    const nodos = [
      {
        id: "a",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 1, mineral_potasio: 5 },
      },
      {
        id: "b",
        tipoCultivo: "lechuga",
        variables: { mineral_magnesio: 2, mineral_potasio: null },
      },
      {
        id: "c",
        tipoCultivo: "tomate",
        variables: { mineral_magnesio: 9, mineral_potasio: 9 },
      },
    ];
    const aristas = [{ origenId: "a", destinoId: "b" }];
    const grupos = agregarCategoriasPorGrupos(nodos, aristas, [
      "mineral_magnesio",
      "mineral_potasio",
    ]);
    const grupoAb = grupos.find((grupo) => grupo.idsNodos.includes("a"));
    const grupoC = grupos.find((grupo) => grupo.idsNodos.includes("c"));
    expect(
      grupoAb?.categorias.find((item) => item.categoria === "mineral_magnesio")?.total,
    ).toBe(3);
    expect(
      grupoAb?.categorias.find((item) => item.categoria === "mineral_potasio")?.total,
    ).toBeNull();
    expect(
      grupoC?.categorias.find((item) => item.categoria === "mineral_potasio")?.total,
    ).toBe(9);
  });
});

describe("conteoPorTipo", () => {
  it("cuenta nodos sin recorrer a mano", () => {
    const nodos = [
      { id: "1", tipoCultivo: "lechuga", variables: {} },
      { id: "2", tipoCultivo: "lechuga", variables: {} },
      { id: "3", tipoCultivo: "tomate", variables: {} },
    ];
    expect(conteoPorTipo(nodos)).toEqual({ lechuga: 2, tomate: 1 });
  });
});
