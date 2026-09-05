import type { SVGProps } from "react";

type PropsIcono = SVGProps<SVGSVGElement>;

function SvgBase({ children, ...props }: PropsIcono) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function IconoLechuga(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M16 6c3 2 5 4 5 8 0 2-1 3-2 4 3 0 5 2 5 5 0 3-3 6-8 6s-8-3-8-6c0-3 2-5 5-5-1-1-2-2-2-4 0-4 2-6 5-8Z" fill="currentColor" />
    </SvgBase>
  );
}

export function IconoTomate(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <circle cx="16" cy="18" r="8" fill="currentColor" />
      <path d="M16 8c2 2 5 3 7 3-2 1-4 2-7 3-3-1-5-2-7-3 2 0 5-1 7-3Z" fill="#2e7d32" />
    </SvgBase>
  );
}

export function IconoAlbahaca(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M16 28V10" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14c-5-1-8-5-8-8 6 1 8 4 8 8Z" fill="currentColor" />
      <path d="M16 18c5-1 8-5 8-8-6 1-8 4-8 8Z" fill="currentColor" />
      <path d="M16 22c-5 0-8-3-8-7 5 1 8 3 8 7Z" fill="currentColor" />
    </SvgBase>
  );
}

export function IconoEspinaca(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M8 24c2-8 6-14 8-16 2 2 6 8 8 16-4-2-12-2-16 0Z" fill="currentColor" />
      <path d="M16 8v16" stroke="#0b1220" strokeWidth="1.5" />
    </SvgBase>
  );
}

export function IconoFresa(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M16 28c6-2 8-8 8-12 0-5-3-8-8-8s-8 3-8 8c0 4 2 10 8 12Z" fill="currentColor" />
      <path d="M10 10c2-4 4-5 6-6 2 1 4 2 6 6-4-1-8-1-12 0Z" fill="#2e7d32" />
    </SvgBase>
  );
}

export function IconoApio(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M12 28V8c0-2 1-4 2-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 28V7c0-2 1-3 2-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 28V9c0-2 1-3 2-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </SvgBase>
  );
}

export function IconoAcelga(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M7 22c3-9 6-14 9-16 3 2 6 7 9 16-6-3-12-3-18 0Z" fill="currentColor" />
      <path d="M16 8v16" stroke="#f59e0b" strokeWidth="2" />
    </SvgBase>
  );
}

export function IconoPepino(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <rect x="8" y="10" width="16" height="14" rx="7" fill="currentColor" />
      <path d="M12 15h2M16 18h2M20 15h1" stroke="#0b1220" strokeWidth="1.5" strokeLinecap="round" />
    </SvgBase>
  );
}

export function IconoMenta(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M16 26V12" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14c-6-6-10-6-11-5 2 6 7 8 11 8Z" fill="currentColor" />
      <path d="M16 16c6-6 10-6 11-5-2 6-7 8-11 8Z" fill="currentColor" />
    </SvgBase>
  );
}

export function IconoRucula(props: PropsIcono) {
  return (
    <SvgBase {...props}>
      <path d="M16 28c0-8 8-12 8-18 0-3-2-6-8-7-6 1-8 4-8 7 0 6 8 10 8 18Z" fill="currentColor" />
    </SvgBase>
  );
}

export const ICONOS_CULTIVO = {
  lechuga: IconoLechuga,
  tomate: IconoTomate,
  albahaca: IconoAlbahaca,
  espinaca: IconoEspinaca,
  fresa: IconoFresa,
  apio: IconoApio,
  acelga: IconoAcelga,
  pepino: IconoPepino,
  menta: IconoMenta,
  rucula: IconoRucula,
} as const;
