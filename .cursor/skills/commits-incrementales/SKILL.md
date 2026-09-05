---
name: commits-incrementales
description: Prepares small Spanish git commits for Hidropónico without Cursor co-author trailers and without pushing unless asked. Use when the user asks to commit, crear un commit, or revisar git status.
---

# Commits incrementales

Solo commitear si el usuario lo pide. Nunca push salvo petición explícita.

## Pasos

1. `git status`, `git diff`, `git log` (estilo del repo).
2. Excluir secretos (`.env`, credenciales).
3. Agrupar por tema. Si el diff es grande, **varios commits**, no uno solo.
4. Mensaje en 1–2 frases, foco en el porqué. Sin trailers.

## Prohibido

- `Co-authored-by: Cursor` u otro coautor de IA (en ningún sitio).
- Commits que mezclan docs + scaffolding + features.
- `--no-verify`, force push, amend de commits ajenos o ya publicados.

## Ejemplo

```text
docs: registrar asunciones abiertas del modelo de 15 variables
```
