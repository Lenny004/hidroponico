import { PASOS_ONBOARDING } from "@hidroponico/tipos-compartidos";
import { usarInterfaz } from "../store/usarInterfaz";

export default function OnboardingCultivo() {
  const visible = usarInterfaz((estado) => estado.onboardingVisible);
  const cerrar = usarInterfaz((estado) => estado.cerrarOnboarding);
  if (!visible) {
    return null;
  }

  return (
    <aside className="onboarding" aria-label="Cómo empezar">
      <div className="onboarding__cabecera">
        <h2 className="onboarding__titulo">Cómo empezar</h2>
        <button type="button" className="onboarding__cerrar" onClick={cerrar}>
          Entendido
        </button>
      </div>
      <ol className="onboarding__pasos">
        {PASOS_ONBOARDING.map((paso, indice) => (
          <li key={paso.id} className="onboarding__paso">
            <span className="onboarding__numero">{indice + 1}</span>
            <div>
              <p className="onboarding__paso-titulo">{paso.titulo}</p>
              <p className="onboarding__paso-detalle">{paso.detalle}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
