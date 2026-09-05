# Interfaz de usuario

Referencia visual: editor de nodos tipo **n8n**. Librería prevista: **React Flow** (`@xyflow/react`). No instalar en este paso.

## Layout

| Zona | Contenido |
|------|-----------|
| **Barra superior** | Dos inputs de texto (buscar / filtrar) y 4 botones tipo play: 3 motores individuales + 1 central resaltado (pipeline completo). |
| **Panel izquierdo** | Selector «Cultivo» y grilla de ≥10 íconos/colores para arrastrar al canvas. |
| **Canvas** | Grafo de construcción: nodos circulares de color, aristas, resaltado al seleccionar o al pertenecer al mismo grupo. |
| **Panel de detalle** | Se abre al hacer click en un nodo. Edita el `NodoCultivo` completo. |
| **Barra inferior** | Estado: progreso de simulación, mensajes del pipeline. |

## Interacciones del MVP (Fase 1+)

- Arrastrar un cultivo del panel al lienzo crea un nodo (`CultivoNodeFactory`) con los ml de su plantilla.
- Mover nodos.
- Conectar nodos con líneas; rechazar ciclos.
- Highlight de selección y de grupo conectado.
- Click → panel de detalle editable (Fase 2).

## Botones play (Fase 3–4)

1. Motor minerales
2. Motor oxígeno
3. Motor plagas
4. Pipeline completo (agrega minerales + oxígeno + pH total + resumen)

No cablear estos botones hasta existir el bus y al menos un motor.
