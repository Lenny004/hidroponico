# Modelo de datos — nodo de cultivo

Nomenclatura de dominio en **español**, alineada al boceto original (`mineral_magnesio`, `cantidad_sol`, etc.).

## Variables del boceto (confirmadas)

Campos numéricos (ml): `mineral_magnesio`, `mineral_potasio`, `mineral_manganeso`, `mineral_hierro`, `oxigeno`, `cantidad_sol`.

Texto / listas: `plagas`, `solucion_plagas`, `comentarios`.

La lista de 15 categorías se descartó. Ver [asunciones.md](asunciones.md).

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
