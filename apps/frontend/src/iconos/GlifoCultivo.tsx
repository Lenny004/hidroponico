import { iconoDeCultivo } from "./glifos-cultivo";

export default function GlifoCultivo({
  tipoCultivo,
  color,
  tamano = "catalogo",
}: {
  tipoCultivo: string;
  color: string;
  tamano?: "catalogo" | "nodo" | "ficha" | "lista" | "chip";
}) {
  const Icono = iconoDeCultivo(tipoCultivo);
  return (
    <span
      className={`glifo-cultivo glifo-cultivo--${tamano}`}
      style={{ borderColor: color, color }}
      aria-hidden
    >
      <Icono className="glifo-cultivo__icono" strokeWidth={2} />
    </span>
  );
}
