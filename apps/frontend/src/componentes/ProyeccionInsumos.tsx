import {
  HORIZONTES_PROYECCION,
  avisoMasaElemental,
  caudalNftDeReserva,
  contrastarReservaConDeposito,
  formatearHolgura,
  formatearMedida,
  formatearParInsumos,
  proyectarInsumos,
  volumenDeposito,
} from "@hidroponico/tipos-compartidos";
import { usarGrafoConstruccion } from "../store/usarGrafoConstruccion";
import FormularioDeposito from "./FormularioDeposito";

export default function ProyeccionInsumos() {
  const nodos = usarGrafoConstruccion((estado) => estado.nodos);
  const deposito = usarGrafoConstruccion((estado) => estado.deposito);
  const cultivos = nodos.map((nodo) => nodo.data.cultivo);
  const dia = proyectarInsumos(cultivos, 1);
  const volumen = volumenDeposito(deposito);
  const contraste = contrastarReservaConDeposito(dia.reservaL, volumen.netoL);
  const caudal = caudalNftDeReserva(dia.reservaL, deposito);

  return (
    <section className="proyeccion">
      <p className="proyeccion__titulo">Proyección de insumos</p>
      <p className="proyeccion__total">
        Reserva: {formatearParInsumos(dia.reservaL, dia.masaTanqueMg)}
      </p>
      <p className="proyeccion__ayuda">{avisoMasaElemental()}</p>
      <ul className="proyeccion__lista">
        {HORIZONTES_PROYECCION.map((horizonte) => {
          const dato = proyectarInsumos(cultivos, horizonte.dias);
          return (
            <li
              key={horizonte.id}
              className={`proyeccion__fila proyeccion__fila--${horizonte.id}`}
            >
              <p className="proyeccion__horizonte">{horizonte.etiqueta}</p>
              <p className="proyeccion__valores">
                Agua a reponer:{" "}
                {dato.reposicionL == null
                  ? "— L"
                  : formatearMedida(dato.reposicionL, "L")}
                {" · sales "}
                {dato.masaReposicionMg == null
                  ? "— mg"
                  : formatearMedida(dato.masaReposicionMg, "mg")}
              </p>
            </li>
          );
        })}
      </ul>
      {dia.omitidos > 0 ? (
        <p className="proyeccion__aviso">
          {dia.omitidos} cultivo(s) sin dato completo; no entran en el total.
        </p>
      ) : null}
      <FormularioDeposito />
      <p className="proyeccion__valores">
        Bruto: {volumen.brutoL == null ? "—" : formatearMedida(volumen.brutoL, "L")}
        {" · neto "}
        {volumen.netoL == null ? "—" : formatearMedida(volumen.netoL, "L")}
        {volumen.pesoKg == null ? "" : ` · ~${formatearMedida(volumen.pesoKg, "kg")}`}
      </p>
      <p
        className={
          contraste.estado === "excede" ? "proyeccion__aviso" : "proyeccion__ayuda"
        }
      >
        {contraste.estado === "sin_deposito"
          ? "Mide el tanque para contrastar con la reserva química."
          : contraste.estado === "reserva_incompleta"
            ? "Faltan litros en algún cultivo; no se compara con el neto."
            : contraste.estado === "excede"
              ? `La reserva no cabe: ${formatearHolgura(contraste.holguraL)}.`
              : `La reserva cabe: ${formatearHolgura(contraste.holguraL)}.`}
      </p>
      <p className="proyeccion__valores">
        Caudal NFT:{" "}
        {caudal.entregado_Lph == null
          ? "—"
          : formatearMedida(caudal.entregado_Lph, "L/h")}{" "}
        entregados ({caudal.recirculaciones_h}×/h)
        {caudal.etiqueta_Lph == null
          ? ""
          : ` · etiqueta ~${formatearMedida(caudal.etiqueta_Lph, "L/h")}`}
      </p>
    </section>
  );
}
