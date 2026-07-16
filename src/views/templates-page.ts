import { layout } from './layout';
import { getTemplates } from '../core/templates/registry';

export function templatesPage(): string {
  const templates = getTemplates();

  const categorized: Record<string, string[]> = {};
  for (const t of templates) {
    const parts = t.split('-');
    let prefix: string;
    if (parts[0] === 'list') prefix = 'list';
    else if (parts[0] === 'sequence') prefix = 'sequence';
    else if (parts[0] === 'chart') prefix = 'chart';
    else if (parts[0] === 'compare') prefix = 'compare';
    else if (parts[0] === 'hierarchy') prefix = 'hierarchy';
    else if (parts[0] === 'relation') prefix = 'relation';
    else prefix = parts[0];

    if (!categorized[prefix]) categorized[prefix] = [];
    categorized[prefix].push(t);
  }

  const categoryLabels: Record<string, string> = {
    list: 'List',
    sequence: 'Sequence',
    chart: 'Chart',
    compare: 'Compare',
    hierarchy: 'Hierarchy',
    relation: 'Relation',
  };

  const categoryIcons: Record<string, string> = {
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    sequence: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    compare: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>',
    hierarchy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 8l7-5 7 5"/><path d="M5 16l7 5 7-5"/></svg>',
    relation: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M8.5 7.5L15.5 16.5"/></svg>',
  };

  const categoryBlocks = Object.entries(categorized)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cat, names]) => {
      const cards = names
        .map(
          (n) => `
        <div
          class="template-card"
          hx-get="/api/template-preview?name=${encodeURIComponent(n)}"
          hx-target="#preview-modal"
          hx-swap="innerHTML"
          hx-trigger="click"
        >
          <div class="template-card-preview" id="preview-${n}">
            <div class="text-zinc-600 text-xs">Click to preview</div>
          </div>
          <div class="template-card-info">
            <div class="template-card-name">${n}</div>
            <div class="template-card-type">${n}</div>
          </div>
        </div>`,
        )
        .join('');

      return `
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-zinc-400">${categoryIcons[cat] || ''}</span>
          <h2 class="text-lg font-semibold text-zinc-200">${categoryLabels[cat] || cat}</h2>
          <span class="text-xs text-zinc-600 font-mono">${names.length}</span>
        </div>
        <div class="template-grid">
          ${cards}
        </div>
      </div>`;
    })
    .join('');

  const content = `
  <div class="flex flex-col h-screen" x-data="{ search: '', showModal: false }">
    <!-- Header -->
    <div class="toolbar">
      <div class="flex items-center gap-3">
        <div class="logo-icon">I</div>
        <span class="text-sm font-semibold text-zinc-200">Template Browser</span>
      </div>
      <div class="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search templates..."
          class="select-styled"
          style="min-width: 240px;"
          x-model="search"
        >
        <a href="/" class="btn btn-ghost btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Editor
        </a>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Stats -->
        <div class="flex items-center gap-6 mb-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-zinc-100">${templates.length}</span>
            <span class="text-sm text-zinc-500">templates</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-zinc-100">${Object.keys(categorized).length}</span>
            <span class="text-sm text-zinc-500">categories</span>
          </div>
        </div>

        ${categoryBlocks}
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      id="preview-modal"
      x-show="showModal"
      x-cloak
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="showModal = false"
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
    ></div>
  </div>

  <script>
    document.addEventListener('alpine:init', () => {
      const searchInput = document.querySelector('input[placeholder="Search templates..."]');
      searchInput?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.template-card').forEach(card => {
          const name = card.querySelector('.template-card-name')?.textContent?.toLowerCase() || '';
          card.style.display = name.includes(q) ? '' : 'none';
        });
      });
    });
  </script>
  `;

  return layout('Template Browser', content);
}
