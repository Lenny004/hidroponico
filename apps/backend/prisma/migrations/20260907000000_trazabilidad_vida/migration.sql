-- Trazabilidad de vida por nodo (etapa e inicio YYYY-MM-DD).

ALTER TABLE "nodos" ADD COLUMN "etapa_vida" TEXT;
ALTER TABLE "nodos" ADD COLUMN "iniciado_en" TEXT;
