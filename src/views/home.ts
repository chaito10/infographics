import { layout } from './layout';
import { getTemplates } from '../core/templates/registry';
import { getThemes } from '../core/themes/registry';

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#18181b" rx="12"/>
  <text x="300" y="200" text-anchor="middle" fill="#52525b" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500">
    Write some DSL syntax and click Render to preview
  </text>
</svg>`;

export function home(initialSvg?: string): string {
  const templates = getTemplates();
  const themes = getThemes();
  const svg = initialSvg || DEFAULT_SVG;

  const templateCategories: Record<string, string[]> = {};
  for (const t of templates) {
    const prefix = t.split('-').slice(0, 2).join('-');
    const cat = templateCategories[prefix] || [];
    cat.push(t);
    templateCategories[prefix] = cat;
  }

  const quickInsertSnippets: Array<{ label: string; snippet: string }> = [
    {
      label: 'List',
      snippet: `infographic list-row-simple-horizontal\ndata\n  title My List\n  lists\n    - label Item One\n      desc First item\n    - label Item Two\n      desc Second item\n    - label Item Three\n      desc Third item`,
    },
    {
      label: 'Timeline',
      snippet: `infographic sequence-timeline-simple\ndata\n  title My Timeline\n  steps\n    - label Step One\n      desc Completed initial setup\n    - label Step Two\n      desc Built core features\n    - label Step Three\n      desc Ready for launch`,
    },
    {
      label: 'Grid',
      snippet: `infographic list-grid-compact-card\ndata\n  title Feature Grid\n  lists\n    - label Fast\n      desc Optimized for speed\n    - label Secure\n      desc Built-in encryption\n    - label Scalable\n      desc Handles any load`,
    },
    {
      label: 'Hierarchy',
      snippet: `infographic hierarchy-tree-tech-style-capsule-item\ndata\n  title Team Structure\n  tree\n    - label CEO\n      - label CTO\n        - label Frontend\n          - label Alice\n          - label Bob\n        - label Backend\n          - label Charlie`,
    },
    {
      label: 'Relation',
      snippet: `infographic relation-network-icon-badge\ndata
  title Network
  nodes
    - label Server
    - label Client
    - label Database
    - label Cache
  edges
    - from Client
      to Server
    - from Server
      to Database
    - from Server
      to Cache`,
    },
  ];

  const templateOptionsHtml = templates
    .map((t) => `<option value="${t}">${t}</option>`)
    .join('\n            ');

  const themeOptionsHtml = themes
    .map((t) => `<option value="${t}">${t}</option>`)
    .join('\n            ');

  const quickInsertHtml = quickInsertSnippets
    .map(
      (s) =>
        `<button class="chip" hx-on:click="document.getElementById('dsl-input').value = \`${s.snippet.replace(/`/g, '\\`')}\`; document.getElementById('dsl-input').dispatchEvent(new Event('input'))">${s.label}</button>`,
    )
    .join('\n          ');

  const content = `
  <div x-data="{ showDropdown: false }" class="flex flex-col h-screen">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="flex items-center gap-3">
        <div class="logo-icon">I</div>
        <span class="text-sm font-semibold text-zinc-200">Infographic Editor</span>
        <span class="text-xs text-zinc-600 font-mono">v1.0</span>
      </div>
      <div class="flex items-center gap-3">
        <select
          id="template-select"
          class="select-styled"
          style="min-width: 200px;"
        >
          <option value="">Select template...</option>
          ${templateOptionsHtml}
        </select>
        <select
          id="theme-select"
          class="select-styled"
          style="min-width: 120px;"
        >
          ${themeOptionsHtml}
        </select>
        <div class="w-px h-5 bg-zinc-800"></div>
        <a href="/templates" class="btn btn-ghost btn-sm">Templates</a>
        <button
          id="render-btn"
          class="btn btn-primary btn-sm"
          hx-post="/api/render"
          hx-include="#dsl-input"
          hx-trigger="click"
          hx-target="#preview-area"
          hx-swap="innerHTML"
          hx-indicator="#render-indicator"
        >
          <span id="render-indicator" class="htmx-indicator"><span class="spinner" style="width:14px;height:14px;border-width:1.5px;"></span></span>
          Render
        </button>
      </div>
    </div>

    <!-- Split Pane -->
    <div class="split-pane">
      <!-- Editor Pane -->
      <div class="pane-editor">
        <!-- Editor header -->
        <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">DSL Editor</span>
          <div class="flex items-center gap-2">
            <button
              class="btn btn-ghost btn-sm"
              style="font-size:11px;padding:3px 8px;"
              onclick="document.getElementById('dsl-input').value = ''; document.getElementById('dsl-input').dispatchEvent(new Event('input'))"
            >Clear</button>
            <button
              class="btn btn-ghost btn-sm"
              style="font-size:11px;padding:3px 8px;"
              onclick="navigator.clipboard.writeText(document.getElementById('dsl-input').value)"
            >Copy</button>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 relative">
          <textarea
            id="dsl-input"
            class="editor-textarea"
            spellcheck="false"
            placeholder="Enter your infographic DSL syntax here..."
            hx-post="/api/render"
            hx-trigger="input changed delay:800ms"
            hx-include="#dsl-input"
            hx-target="#preview-area"
            hx-swap="innerHTML"
            hx-indicator="#render-indicator"
          >infographic list-row-simple-horizontal
data
  title Hello Infographic
  lists
    - label First Item
      desc Description one
    - label Second Item
      desc Description two
    - label Third Item
      desc Description three</textarea>
        </div>

        <!-- Bottom bar: quick inserts -->
        <div class="border-t border-zinc-800 px-4 py-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-zinc-600 mr-1">Quick insert:</span>
            ${quickInsertHtml}
          </div>
        </div>
      </div>

      <!-- Preview Pane -->
      <div class="pane-preview">
        <div id="preview-area" class="preview-container">
          ${svg}
        </div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="status-bar">
      <div class="flex items-center gap-3">
        <span id="status-text">Ready</span>
        <span id="render-indicator-status" class="htmx-indicator flex items-center gap-1">
          <span class="spinner" style="width:10px;height:10px;border-width:1px;"></span>
          Rendering...
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span id="char-count">0 chars</span>
        <span class="text-zinc-700">|</span>
        <span>UTF-8</span>
      </div>
    </div>
  </div>

  <!-- Template dropdown logic -->
  <script>
    document.addEventListener('alpine:init', () => {
      // Update character count
      const textarea = document.getElementById('dsl-input');
      const charCount = document.getElementById('char-count');
      const updateCount = () => {
        charCount.textContent = textarea.value.length + ' chars';
      };
      textarea.addEventListener('input', updateCount);
      updateCount();

      // Template select loads the template name into the textarea
      document.getElementById('template-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          const lines = textarea.value.split('\\n');
          lines[0] = 'infographic ' + val;
          textarea.value = lines.join('\\n');
          textarea.dispatchEvent(new Event('input'));
        }
      });

      // Theme select updates the theme in the textarea
      document.getElementById('theme-select').addEventListener('change', (e) => {
        const val = e.target.value;
        const lines = textarea.value.split('\\n');
        const themeLine = 'theme ' + val;
        const themeIdx = lines.findIndex(l => l.trim().startsWith('theme '));
        if (themeIdx >= 0) {
          lines[themeIdx] = themeLine;
        } else {
          const dataIdx = lines.findIndex(l => l.trim() === 'data');
          if (dataIdx >= 0) {
            lines.splice(dataIdx, 0, themeLine);
          } else {
            lines.splice(1, 0, themeLine);
          }
        }
        textarea.value = lines.join('\\n');
        textarea.dispatchEvent(new Event('input'));
      });

      // HTMX events
      document.body.addEventListener('htmx:beforeRequest', () => {
        document.getElementById('status-text').textContent = 'Rendering...';
      });
      document.body.addEventListener('htmx:afterRequest', (e) => {
        if (e.detail.successful) {
          document.getElementById('status-text').textContent = 'Ready';
        } else {
          document.getElementById('status-text').textContent = 'Error';
        }
      });
    });
  </script>
  `;

  return layout('Infographic Editor', content);
}
