import { getPlugins, getPluginById } from './plugin-registry.js';
import { createCustomRenderer } from './renderers/index.js';
import { state } from './shell.js';

let docsifyInstance = null;
const virtualFiles = new Map();
const loadedPlugins = new Set();
const pluginStatus = new Map();

function initPreview(content, appState) {
  virtualFiles.set('/', content);
  virtualFiles.set('/README.md', content);
  state.config = appState.config || state.config;
  state.tokens = appState.tokens || {};

  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = '';
  }

  createToolbar();
  loadDocsify(content);
}

function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'preview-toolbar';
  toolbar.innerHTML = `
    <button id="configure-btn" class="toolbar-btn">Configure</button>
    <button id="reimport-btn" class="toolbar-btn">Reimport</button>
    <button id="export-preview-btn" class="toolbar-btn">Export</button>
    <div class="plugin-status" id="plugin-status"></div>
  `;

  const output = document.getElementById('output');
  if (output) {
    output.parentNode.insertBefore(toolbar, output);
  }

  initToolbar();
}

function initToolbar() {
  const configureBtn = document.getElementById('configure-btn');
  const reimportBtn = document.getElementById('reimport-btn');
  const exportBtn = document.getElementById('export-preview-btn');

  if (configureBtn) {
    configureBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mode-change', { detail: 'config' }));
    });
  }

  if (reimportBtn) {
    reimportBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('reimport-requested'));
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportCurrentContent);
  }
}

function loadDocsify(content) {
  if (window.Docsify) {
    initDocsify(content);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/docsify@4.0.0/dist/docsify.min.js';
  script.onload = () => initDocsify(content);
  script.onerror = () => console.warn('Failed to load docsify core');
  document.head.appendChild(script);
}

function initDocsify(content) {
  const output = document.getElementById('output');
  if (!output) return;

  output.setAttribute('data-docsify', '');

  const tokens = state.tokens || {};
  const themeTokens = state.config?.tokens || {};
  const mermaidConfig = buildMermaidConfig(themeTokens);

  window.$docsify = {
    loadSidebar: false,
    subMaxLevel: 3,
    basePath: '/',
    routerMode: 'history',
    fetch: function(url) {
      return virtualFiles.get(url) || content;
    },
    markdown: {
      renderer: {
        code: createCustomRenderer(null)
      }
    }
  };

  Docsify.init(output, window.$docsify);
  docsifyInstance = Docsify;

  loadActivePlugins(content, mermaidConfig);
}

function buildMermaidConfig(tokens) {
  const primaryColor = tokens['--theme-color'] || '#0066cc';
  const backgroundColor = tokens['--background'] || '#ffffff';
  const textColor = tokens['--text-color'] || '#333333';

  return {
    theme: 'default',
    themeVariables: {
      primaryColor: primaryColor,
      primaryTextColor: textColor,
      primaryBorderColor: primaryColor,
      lineColor: primaryColor,
      secondaryColor: backgroundColor,
      background: backgroundColor,
      mainBkg: primaryColor,
      mainContrastColor: '#ffffff',
      text: textColor
    }
  };
}

function loadActivePlugins(content, mermaidConfig) {
  const plugins = getPlugins();
  const activePlugins = state.config?.plugins || {};

  loadedPlugins.clear();
  pluginStatus.clear();

  plugins.forEach(plugin => {
    if (activePlugins[plugin.id]) {
      loadPluginWithConfig(plugin, content, mermaidConfig);
    }
  });

  updatePluginStatus();
}

function loadPluginWithConfig(plugin, content, mermaidConfig) {
  const script = document.createElement('script');
  script.src = plugin.cdn;
  script.dataset.pluginId = plugin.id;

  script.onload = () => {
    loadedPlugins.add(plugin.id);
    pluginStatus.set(plugin.id, { loaded: true, error: null });

    if (plugin.id === 'kroki' && window.DocsifyKroki) {
      configureKrokiPlugin(mermaidConfig);
    }
    updatePluginStatus();
  };

  script.onerror = () => {
    pluginStatus.set(plugin.id, { loaded: false, error: 'Failed to load plugin from CDN' });
    console.warn(`Failed to load plugin: ${plugin.label} (${plugin.id}) - CDN may be unavailable`);
    updatePluginStatus();
  };

  document.head.appendChild(script);
}

function configureKrokiPlugin(mermaidConfig) {
  if (!window.$docsify) window.$docsify = {};
  window.$docsify.krokiConfig = {
    server: state.config?.krokiServer || 'https://kroki.io',
    mermaidConfig: mermaidConfig
  };
}

function updatePluginStatus() {
  const statusEl = document.getElementById('plugin-status');
  if (!statusEl) return;

  const plugins = getPlugins();
  const activePlugins = state.config?.plugins || {};

  const statusHtml = plugins
    .filter(p => activePlugins[p.id])
    .map(p => {
      const status = pluginStatus.get(p.id);
      const badgeClass = p.verified ? 'verified' : 'unverified';
      const statusIcon = status?.loaded ? '✓' : status?.error ? '✗' : '○';
      const title = status?.error ? `title="${status.error}"` : '';
      return `<span class="plugin-badge ${badgeClass}" ${title}>${p.label} ${statusIcon}</span>`;
    })
    .join('');

  statusEl.innerHTML = statusHtml;
}

function exportCurrentContent() {
  const content = virtualFiles.get('/') || '';
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'documentation.md';
  a.click();
  URL.revokeObjectURL(url);
}

function updateContent(content) {
  virtualFiles.set('/', content);
  virtualFiles.set('/README.md', content);
  if (docsifyInstance) {
    docsifyInstance.router.parse();
  }
}

function getPluginLoadStatus(pluginId) {
  return pluginStatus.get(pluginId) || { loaded: false, error: null };
}

export { initPreview, updateContent, virtualFiles, getPluginLoadStatus, loadActivePlugins };