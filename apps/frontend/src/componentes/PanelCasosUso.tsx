import {
  CATALOGO_CASOS_USO,
  type IdCasoUso,
} from "@hidroponico/tipos-compartidos";
import type { LucideIcon } from "lucide-react";
import {
  Bug,
  Droplets,
  FlaskConical,
  HeartPulse,
  Landmark,
  Beaker,
} from "lucide-react";
import { usarInterfaz } from "../store/usarInterfaz";

const ICONOS: Record<IdCasoUso, LucideIcon> = {
  sanidad: Bug,
  agroservicio: Landmark,
  minerales: FlaskConical,
  oxigeno: Droplets,
  nutricion: HeartPulse,
  insumos: Beaker,
};

export default function PanelCasosUso() {
  const casoUso = usarInterfaz((estado) => estado.casoUso);
  const setCasoUso = usarInterfaz((estado) => estado.setCasoUso);

  return (
    <section className="panel-casos" aria-label="Casos de uso">
      <p className="panel-casos__kicker">Casos de uso</p>
      <p className="panel-casos__ayuda">
        Elige el lente: sanidad, extensión en El Salvador, tanque o cosecha humana.
      </p>
      <div className="panel-casos__rejilla">
        {CATALOGO_CASOS_USO.map((caso) => {
          const Icono = ICONOS[caso.id];
          const activo = casoUso === caso.id;
          return (
            <button
              key={caso.id}
              type="button"
              className={activo ? "caso-uso caso-uso--activo" : "caso-uso"}
              title={caso.ayuda}
              aria-pressed={activo}
              onClick={() => setCasoUso(caso.id)}
            >
              <Icono className="caso-uso__icono" strokeWidth={2.1} aria-hidden />
              <span className="caso-uso__titulo">{caso.titulo}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
