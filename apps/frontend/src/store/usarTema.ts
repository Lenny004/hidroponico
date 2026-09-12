import { create } from "zustand";

export type TemaInterfaz = "claro" | "oscuro";

export const CLAVE_TEMA = "hidroponico-tema";

/** Color de fondo del lienzo 3D; debe coincidir con `--color-lienzo` en `index.css`. */
export const COLOR_LIENZO: Record<TemaInterfaz, string> = {
  oscuro: "#1c1a14",
  claro: "#f3efe6",
};

function leerTemaGuardado(): TemaInterfaz | null {
  try {
    const valor = localStorage.getItem(CLAVE_TEMA);
    if (valor === "claro" || valor === "oscuro") {
      return valor;
    }
  } catch {
    /* localStorage puede fallar en modo privado */
  }
  return null;
}

function preferenciaSistema(): TemaInterfaz {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "claro";
  }
  return "oscuro";
}

/**
 * Aplica el tema al documento (`data-tema` y `color-scheme`).
 * @param tema - `"claro"` o `"oscuro"`.
 */
export function aplicarTemaEnDocumento(tema: TemaInterfaz): void {
  const raiz = document.documentElement;
  raiz.setAttribute("data-tema", tema);
  raiz.style.colorScheme = tema === "claro" ? "light" : "dark";
}

/**
 * Resuelve el tema inicial: preferencia guardada, si no la del sistema, si no oscuro.
 * @returns Tema a pintar en el primer render.
 */
export function resolverTemaInicial(): TemaInterfaz {
  return leerTemaGuardado() ?? preferenciaSistema();
}

type EstadoTema = {
  tema: TemaInterfaz;
  setTema: (tema: TemaInterfaz) => void;
  alternarTema: () => void;
};

export const usarTema = create<EstadoTema>((set, get) => ({
  tema: resolverTemaInicial(),
  setTema: (tema) => {
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      /* ignore */
    }
    aplicarTemaEnDocumento(tema);
    set({ tema });
  },
  alternarTema: () => {
    get().setTema(get().tema === "oscuro" ? "claro" : "oscuro");
  },
}));

aplicarTemaEnDocumento(usarTema.getState().tema);
