import { renderToString } from './core/ssr';
import { getTemplates, getTemplate } from './core/templates';
import { getThemes } from './core/themes';
import { getFonts } from './core/renderer/fonts';
import { parseSyntax } from './core/parser';
import { parseOptions } from './core/options';

const PORT = 3000;

function html(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Infographics</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4">
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    textarea:focus { outline: none; }
    .preview-area svg { max-width: 100%; height: auto; }
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">
${content}
</body>
</html>`;
}

function homePage(): string {
  return html(`
  <div class="flex flex-col h-screen" x-data="editor()">
    <header class="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur shrink-0">
      <h1 class="text-lg font-semibold tracking-tight">Infographics</h1>
      <div class="flex items-center gap-3">
        <select x-model="selectedTheme" @change="render()" class="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm">
          <option value="">Default Theme</option>
          ${getThemes().map((t) => `<option value="${t}">${t}</option>`).join('\n          ')}
        </select>
        <select x-model="selectedTemplate" @change="applyTemplate()" class="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm max-w-[220px]">
          <option value="">Select Template</option>
          ${getTemplates().map((t) => `<option value="${t}">${t}</option>`).join('\n          ')}
        </select>
        <button @click="exportSVG()" class="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded hover:bg-gray-700">SVG</button>
        <button @click="exportPNG()" class="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded hover:bg-gray-700">PNG</button>
      </div>
    </header>
    <div class="flex flex-1 min-h-0">
      <div class="w-1/2 border-r border-gray-800 flex flex-col">
        <div class="px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider font-medium">Syntax Editor</div>
        <textarea
          x-model="syntax"
          @input.debounce.500ms="render()"
          class="flex-1 w-full resize-none bg-gray-900 p-4 font-mono text-sm leading-relaxed text-gray-200 placeholder-gray-600"
          placeholder="Enter infographic syntax here..."
          spellcheck="false"
        ></textarea>
      </div>
      <div class="w-1/2 flex flex-col">
        <div class="px-4 py-2 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider font-medium">Preview</div>
        <div class="flex-1 overflow-auto p-6 bg-gray-950 flex items-start justify-center preview-area">
          <div id="preview" x-html="svgContent" class="max-w-full"></div>
        </div>
      </div>
    </div>
  </div>
  <script>
    function editor() {
      return {
        syntax: '',
        svgContent: '',
        selectedTheme: '',
        selectedTemplate: '',
        async render() {
          if (!this.syntax.trim()) { this.svgContent = ''; return; }
          try {
            const res = await fetch('/api/render', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ syntax: this.syntax }),
            });
            if (res.ok) this.svgContent = await res.text();
          } catch (e) { console.error(e); }
        },
        applyTemplate() {
          if (this.selectedTemplate) {
            this.syntax = 'template: ' + this.selectedTemplate + '\\n\\n' + this.syntax;
            this.render();
          }
        },
        exportSVG() {
          const svg = document.querySelector('#preview svg');
          if (!svg) return;
          const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'infographic.svg';
          a.click();
        },
        async exportPNG() {
          if (!this.syntax.trim()) return;
          try {
            const res = await fetch('/api/render-png', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ syntax: this.syntax }),
            });
            if (res.ok) {
              const data = await res.json();
              const a = document.createElement('a');
              a.href = data.url;
              a.download = 'infographic.png';
              a.click();
            }
          } catch (e) { console.error(e); }
        },
      };
    }
  </script>`);
}

function templatesPage(): string {
  return html(`
  <div class="min-h-screen p-8" x-data="{ templates: [] }" x-init="
    fetch('/api/templates').then(r => r.text()).then(h => $refs.list.innerHTML = h)
  ">
    <h1 class="text-2xl font-semibold mb-6">Templates</h1>
    <div x-ref="list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
  </div>`);
}

async function handleRender(syntax: string): Promise<Response> {
  try {
    const svg = await renderToString(syntax);
    return new Response(svg, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (e: any) {
    return new Response(`<div class="text-red-400 p-4">Error: ${escapeHtml(e.message)}</div>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

async function handleRenderPng(syntax: string): Promise<Response> {
  try {
    const svg = await renderToString(syntax);
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    return Response.json({ url: dataUrl });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

function handleTemplates(): Response {
  const templates = getTemplates();
  const html = templates.map((t) => `
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition"
         hx-get="/api/templates/${encodeURIComponent(t)}"
         hx-target="closest div"
         hx-swap="innerHTML"
    >
      <div class="text-sm font-medium truncate">${escapeHtml(t)}</div>
      <div class="mt-2 text-xs text-gray-500"></div>
    </div>`).join('\n');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function handleTemplatePreview(name: string): Response {
  const template = getTemplate(name);
  if (!template) {
    return new Response('<div class="text-gray-500 text-sm">Template not found</div>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new Response(`<div class="text-sm text-gray-400">Preview: ${escapeHtml(name)}</div>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function handleThemes(): Response {
  const themes = getThemes();
  const html = `<ul class="text-sm space-y-1">${themes.map((t) => `<li class="px-2 py-1 rounded hover:bg-gray-800">${escapeHtml(t)}</li>`).join('\n')}</ul>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function handleFonts(): Response {
  const fonts = getFonts();
  const html = `<ul class="text-sm space-y-1">${fonts.map((f) => `<li class="px-2 py-1 rounded hover:bg-gray-800">${escapeHtml(f.fontFamily)}</li>`).join('\n')}</ul>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function handleParse(syntax: string): Response {
  try {
    const result = parseSyntax(syntax);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function readBody(req: Request): Promise<any> {
  const text = await req.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    // Static files
    if (path.startsWith('/')) {
      const file = Bun.file(`./src/public${path}`);
      if (await file.exists()) {
        const ext = path.slice(path.lastIndexOf('.'));
        return new Response(file, { headers: { 'Content-Type': MIME[ext] || 'application/octet-stream' } });
      }
    }

    // Page routes
    if (req.method === 'GET' && path === '/') {
      return new Response(homePage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (req.method === 'GET' && path === '/templates') {
      return new Response(templatesPage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // API routes
    if (req.method === 'POST' && path === '/api/render') {
      const body = await readBody(req);
      return handleRender(body.syntax || '');
    }
    if (req.method === 'POST' && path === '/api/render-png') {
      const body = await readBody(req);
      return handleRenderPng(body.syntax || '');
    }
    if (req.method === 'GET' && path === '/api/templates') {
      return handleTemplates();
    }
    if (req.method === 'GET' && path.startsWith('/api/templates/')) {
      const name = decodeURIComponent(path.slice('/api/templates/'.length));
      return handleTemplatePreview(name);
    }
    if (req.method === 'POST' && path === '/api/parse') {
      const body = await readBody(req);
      return handleParse(body.syntax || '');
    }
    if (req.method === 'GET' && path === '/api/themes') {
      return handleThemes();
    }
    if (req.method === 'GET' && path === '/api/fonts') {
      return handleFonts();
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Infographics server running at http://localhost:${server.port}`);
