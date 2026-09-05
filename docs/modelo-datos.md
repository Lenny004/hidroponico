# Modelo de datos — nodo de cultivo

Nomenclatura de dominio en **español**, alineada al boceto original (`mineral_magnesio`, `cantidad_sol`, etc.).

## Propuesta de 15 variables (no confirmada)

El boceto habla de «15 categorías / 15 subnodos» pero solo lista 4 minerales. Esta lista es una **interpretación**, no un dato del dueño del producto. **No implementarla como definitiva** hasta confirmarla. Ver [asunciones](asunciones.md).

12 minerales + oxígeno + solución + pH = 15:

```ts
interface NodoCultivo {
  id: string;
  tipoCultivo: string;
  variables: {
    // Macronutrientes
    mineral_nitrogeno?: number | null;
    mineral_fosforo?: number | null;
    mineral_potasio?: number | null;
    mineral_calcio?: number | null;
    mineral_magnesio?: number | null;
    mineral_azufre?: number | null;
    // Micronutrientes
    mineral_hierro?: number | null;
    mineral_manganeso?: number | null;
    mineral_zinc?: number | null;
    mineral_cobre?: number | null;
    mineral_boro?: number | null;
    mineral_molibdeno?: number | null;
    // Ambientales
    oxigeno?: number | null;
    cantidad_sol?: number | null;
    ph?: number | null;
  };
  plagas?: string[] | null;
  solucion_plagas?: string | null;
  comentarios?: string | null;
}
```

Campos extra del canvas (solo grafo de construcción): posición `x`/`y`, color, ícono.

## Catálogo mínimo de cultivos (MVP)

Al menos 10 tipos, cada uno con ícono/color:

1. Lechuga
2. Tomate
3. Albahaca
4. Espinaca
5. Fresa
6. Apio
7. Acelga
8. Pepino
9. Menta
10. Rúcula

`CultivoNodeFactory` copiará valores por defecto según `tipoCultivo` cuando exista catálogo de plantillas.

## Íconos (uso libre)

Preferencia: **Open Crop Icons** (`openfarmcc/open-crop-icons`), licencia CC0. No instalar aún.

## Persistencia (Fase 6)

- `nodos`: id, tipo, variables JSONB, plagas, comentarios, metadatos.
- `aristas`: origen, destino, categoría de enlace (si aplica).

El grafo persistido es distinto del grafo de construcción. No mezclar ambos modelos en el mismo store del cliente sin una frontera explícita.
