-- Grafo persistido: nodos de cultivo y aristas DAG.

CREATE TABLE "nodos" (
    "id" TEXT NOT NULL,
    "tipoCultivo" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "plagas" JSONB,
    "solucion_plagas" TEXT,
    "comentarios" TEXT,
    "posicionX" DOUBLE PRECISION,
    "posicionY" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aristas" (
    "id" TEXT NOT NULL,
    "origenId" TEXT NOT NULL,
    "destinoId" TEXT NOT NULL,
    "categoria" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aristas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "aristas_origenId_destinoId_key" ON "aristas"("origenId", "destinoId");

ALTER TABLE "aristas" ADD CONSTRAINT "aristas_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "nodos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "aristas" ADD CONSTRAINT "aristas_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "nodos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
