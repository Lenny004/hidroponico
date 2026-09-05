import { iconoDeCultivo } from "./glifos-cultivo";

export default function GlifoCultivo({
  tipoCultivo,
  color,
  tamano = "catalogo",
}: {
  tipoCultivo: string;
  color: string;
  tamano?: "catalogo" | "nodo";
}) {
  const Icono = iconoDeCultivo(tipoCultivo);
  const esNodo = tamano === "nodo";
  return (
    <span
      className={
        esNodo
          ? "flex size-16 items-center justify-center rounded-2xl border-2 bg-panel shadow-lg"
          : "flex size-10 items-center justify-center rounded-xl border-2 bg-lienzo"
      }
      style={{ borderColor: color, color }}
      aria-hidden
    >
      <Icono className={esNodo ? "size-8" : "size-5"} strokeWidth={2} />
    </span>
  );
}
