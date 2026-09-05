# Convenciones del repositorio

## Idioma

- Dominio, nombres de campos, comentarios de negocio y JSDoc de dominio: **español**.
- Identificadores técnicos de librerías (React, Prisma, etc.) se dejan en inglés cuando son API externa.

## Git

- Commits **pequeños y descriptivos**. Un tema por commit.
- No subir cambios exagerados (refactors masivos, scaffolding + feature + docs en un solo commit).
- **No** incluir coautor de Cursor ni de ninguna IA en mensajes, trailers `Co-authored-by`, ni metadatos de commit.
- No hacer push salvo que se pida de forma explícita.

## Documentación de código (cuando exista)

Toda API pública de dominio, motores y orquestación lleva JSDoc en español: propósito, parámetros, valor de retorno y casos `null`.

## Alcance de trabajo

- No adelantar fases del [roadmap](roadmap.md).
- No implementar los tres motores de una vez.
- Antes de programar agregación de minerales, mostrar el plan de [reglas-negocio.md](reglas-negocio.md) y esperar confirmación.
- Si algo es ambiguo, preguntar. No asumir en silencio.

## Calidad

Aplicar [PRINCIPIOS.md](PRINCIPIOS.md) en cada microproceso cuando se escriba código: una responsabilidad, validación de entrada, sin secretos en el repo, fallos que no tumben el pipeline completo por un `null`.
