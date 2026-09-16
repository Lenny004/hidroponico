# Interfaz de usuario

Referencia visual: boceto de tablero (catálogo + diseño 3D + ficha HerbaZest + cálculos + casos de uso). El grafo de construcción sigue siendo un DAG; el lienzo se ve en **Three.js** (tubos NFT).

## Layout

| Zona | Contenido |
|------|-----------|
| **Barra superior** | Buscar / filtrar y 4 botones play: minerales, oxígeno, pipeline completo, plagas. |
| **Panel izquierdo** | `PanelCultivo`: catálogo para arrastrar a un orificio. |
| **Diseño 3D** | Mitad izquierda del centro: tubos NFT, Agregar / Quitar / Resetear, zoom (− / +) y ancla para que la cámara no se mueva. |
| **Trazabilidad** | Mitad derecha del centro: al seleccionar un cultivo se carga su ficha (minerales del tanque, vitaminas % VD, minerales de energía) con enlace a [HerbaZest](https://www.herbazest.com/es). Debajo, la ficha editable del nodo. |
| **Cálculos (hamburguesa)** | Columna derecha plegable: resultados del pipeline, proyección de insumos, plantados y árbol Patricia. |
| **Casos de uso** | Franja inferior izquierda: sanidad vegetal, Agroservicio SV (CENTA/MAG), minerales, oxígeno, nutrición humana e insumos. Cambian el lente del consolidado; no son motores nuevos. |
| **Consolidado al día** | Franja inferior derecha: media aritmética y ponderado (por gramos cosechados) frente al valor diario de un adulto (FDA). |
| **Barra de estado** | Mensajes, nodos/aristas y estado de la BD. |

## Interacciones

- Arrastrar un cultivo del panel a un orificio crea un nodo (`CultivoNodeFactory`) con su receta (mg/L y litros).
- Click en un cultivo del tubo (o del catálogo al plantarlo) carga trazabilidad + perfil nutricional.
- Conectar nodos con el modelo de cadena NFT; el grafo permanece acíclico.
- Play o recálculo automático → resultados en el menú hamburguesa.
- Elegir un caso de uso cambia el consolidado (plagas, extensión SV, tanque o cosecha humana).

## Botones play (Fase 3–4)

1. Motor minerales
2. Motor oxígeno
3. Pipeline completo
4. Motor plagas

Vitaminas y % de nutrición humana **no** pasan por el pipeline: son un catálogo educativo (USDA + VD FDA) para factibilidad de cosecha.
