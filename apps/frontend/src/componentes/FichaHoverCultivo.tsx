import {
  fichaHoverDesdeNodo,
  formatearMedida,
  type FichaHoverCultivo as DatosFicha,
} from "@hidroponico/tipos-compartidos";
import GlifoCultivo from "../iconos/GlifoCultivo";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";

function textoOVacio(valor: number | null, unidad: string): string {
  return valor == null ? "—" : formatearMedida(valor, unidad);
}

export default function FichaHoverCultivo({ ficha }: { ficha: DatosFicha }) {
  return (
    <article className="ficha-hover" style={{ borderColor: ficha.color }}>
      <p className="ficha-hover__cabecera">{ficha.nombre}</p>
      <div className="ficha-hover__radar">
        {ficha.minerales.map((mineral) => (
          <div
            key={mineral.clave}
            className={`ficha-hover__punto ficha-hover__punto--${mineral.simbolo.toLowerCase()}`}
          >
            <p className="ficha-hover__simbolo">{mineral.simbolo}</p>
            <p className="ficha-hover__valor">{textoOVacio(mineral.concentracion, "mg/L")}</p>
            <p className="ficha-hover__masa">{textoOVacio(mineral.masaMg, "mg")}</p>
          </div>
        ))}
        <div className="ficha-hover__centro">
          <GlifoCultivo tipoCultivo={ficha.tipoCultivo} color={ficha.color} tamano="ficha" />
          <p className="ficha-hover__litros">{textoOVacio(ficha.litros, "L")} reserva</p>
          {ficha.reposicionDiaL != null ? (
            <p className="ficha-hover__reposicion">
              {textoOVacio(ficha.reposicionDiaL, "L")}/día
            </p>
          ) : null}
        </div>
      </div>
      <p className="ficha-hover__consumo">
        Minerales en el tanque: {textoOVacio(ficha.masaTotalMg, "mg")}
      </p>
      <p className="ficha-hover__pie">
        O₂ {textoOVacio(ficha.oxigeno, "mg/L")}
        {ficha.etiquetaFamilia ? ` · ${ficha.etiquetaFamilia}` : ""}
        {ficha.dias_cosecha != null ? ` · ${ficha.dias_cosecha} d` : ""}
      </p>
    </article>
  );
}

export function FichaHoverDeNodo({ idNodo }: { idNodo: string }) {
  const nodo = usarGrafoConstruccion((estado) =>
    estado.nodos.find((item) => item.id === idNodo),
  );
  if (!nodo) {
    return null;
  }
  return <FichaHoverCultivo ficha={fichaHoverDesdeNodo(nodo.data.cultivo)} />;
}
