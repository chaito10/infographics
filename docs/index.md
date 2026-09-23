# infographics docs

A server-rendered infographic generator built with **Bun** and **TypeScript**. It renders infographics from a lightweight syntax into SVG and PNG, ships with reusable templates, themes, and fonts, and includes a live preview editor.

## Features

- Live preview editor with debounced rendering
- Built-in templates, themes, and fonts
- Server-side rendering to SVG and PNG
- API endpoints for render, parse, templates, themes, and fonts

## Getting started

Prerequisites: [Bun](https://bun.sh) (>= 1.x).

```bash
bun install
bun run dev    # start the server with file watching
```

Open http://localhost:3000 and start editing infographic syntax in the editor.

## Scripts

| Script        | Description                        |
|---------------|------------------------------------|
| `bun run dev` | Start the server with file watching |
| `bun run build` | Start the server                 |
| `bun run typecheck` | Type-check with `tsc --noEmit` |

## Docs structure

```
docs/
└── index.md   # this overview
```

## Continuous integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies and runs the type checker on every push and pull request.