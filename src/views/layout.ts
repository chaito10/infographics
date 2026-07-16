export function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
          },
        },
      },
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    [x-cloak] { display: none !important; }

    * { box-sizing: border-box; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #0a0a0b;
      color: #e4e4e7;
      margin: 0;
      height: 100vh;
      overflow: hidden;
    }

    /* Split pane */
    .split-pane {
      display: flex;
      height: calc(100vh - 52px);
    }

    .pane-editor {
      width: 45%;
      min-width: 320px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #27272a;
      background: #09090b;
    }

    .pane-preview {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      background: #18181b;
      position: relative;
    }

    /* Editor textarea */
    .editor-textarea {
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 13px;
      line-height: 1.65;
      background: #09090b;
      color: #d4d4d8;
      border: none;
      outline: none;
      resize: none;
      padding: 16px 20px;
      width: 100%;
      height: 100%;
      tab-size: 2;
      caret-color: #a78bfa;
    }

    .editor-textarea::placeholder {
      color: #52525b;
    }

    .editor-textarea:focus {
      background: #0c0c0e;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #27272a;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #3f3f46;
    }

    /* Toolbar */
    .toolbar {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid #27272a;
      background: #09090b;
      flex-shrink: 0;
    }

    /* Select styling */
    .select-styled {
      appearance: none;
      background: #18181b;
      border: 1px solid #27272a;
      color: #d4d4d8;
      padding: 6px 32px 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      transition: border-color 0.15s;
    }

    .select-styled:hover {
      border-color: #3f3f46;
    }

    .select-styled:focus {
      border-color: #a78bfa;
      box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.15);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .btn-primary {
      background: #7c3aed;
      color: white;
      border-color: #7c3aed;
    }

    .btn-primary:hover {
      background: #6d28d9;
      border-color: #6d28d9;
    }

    .btn-ghost {
      background: transparent;
      color: #a1a1aa;
      border-color: #27272a;
    }

    .btn-ghost:hover {
      background: #18181b;
      color: #d4d4d8;
      border-color: #3f3f46;
    }

    .btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }

    /* Quick insert chips */
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
      background: #18181b;
      border: 1px solid #27272a;
      color: #a1a1aa;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .chip:hover {
      background: #27272a;
      color: #d4d4d8;
      border-color: #3f3f46;
    }

    /* Preview container */
    .preview-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .preview-container svg {
      max-width: 100%;
      max-height: 100%;
      filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.3));
    }

    /* Preview placeholder */
    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #52525b;
    }

    /* Status bar */
    .status-bar {
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      border-top: 1px solid #27272a;
      background: #09090b;
      font-size: 11px;
      color: #52525b;
      flex-shrink: 0;
    }

    /* Template grid */
    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .template-card {
      border: 1px solid #27272a;
      border-radius: 10px;
      overflow: hidden;
      background: #09090b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .template-card:hover {
      border-color: #a78bfa;
      box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.3), 0 8px 32px rgba(0, 0, 0, 0.3);
      transform: translateY(-2px);
    }

    .template-card-preview {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #18181b;
      padding: 16px;
      overflow: hidden;
    }

    .template-card-preview svg {
      max-width: 100%;
      max-height: 100%;
    }

    .template-card-info {
      padding: 12px 16px;
    }

    .template-card-name {
      font-size: 13px;
      font-weight: 600;
      color: #d4d4d8;
      margin-bottom: 2px;
    }

    .template-card-type {
      font-size: 11px;
      color: #52525b;
    }

    /* HTMX transitions */
    .htmx-settling svg {
      opacity: 0;
    }

    .htmx-swapping svg {
      opacity: 0;
      transition: opacity 0.15s;
    }

    /* Toast notification */
    .toast {
      position: fixed;
      bottom: 40px;
      right: 16px;
      padding: 10px 16px;
      border-radius: 8px;
      background: #18181b;
      border: 1px solid #27272a;
      color: #d4d4d8;
      font-size: 13px;
      font-weight: 500;
      z-index: 100;
      animation: slideIn 0.2s ease-out;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    @keyframes slideIn {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Loading spinner */
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #27272a;
      border-top-color: #a78bfa;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Logo icon */
    .logo-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
