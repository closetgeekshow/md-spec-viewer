import { state, saveState } from './shell.js';
import { getAllPresets, applyPreset } from './presets.js';
import { getAllThemes, applyTheme, getCoreControls, docsifyThemeableVars } from './themes.js';
import { getPlugins, getPluginById } from './plugin-registry.js';

function initConfigUI() {
  const container = document.getElementById('editor-container');
  if (!container) return;

  container.innerHTML = `
    <div class="config-ui">
      <div class="config-section">
        <h2>Theme</h2>
        <div class="theme-picker" id="theme-picker"></div>
      </div>
      <div class="config-section">
        <h2>Preset</h2>
        <div class="preset-picker" id="preset-picker"></div>
      </div>
      <div class="config-section">
        <h2>Plugins</h2>
        <div class="plugin-manager" id="plugin-manager"></div>
      </div>
      <div class="config-section">
        <h2>Theme Tokens</h2>
        <div class="token-editor" id="token-editor"></div>
        <button class="btn btn-secondary" id="advanced-toggle">Advanced Settings</button>
        <div class="advanced-section" id="advanced-section" style="display: none;"></div>
      </div>
      <div class="config-section">
        <button class="btn btn-primary" id="reimport-btn">Reimport from Source</button>
      </div>
    </div>
  `;

  renderThemePicker();
  renderPresetPicker();
  renderPluginManager();
  renderTokenEditor();

  document.getElementById('advanced-toggle').addEventListener('click', toggleAdvanced);
  document.getElementById('reimport-btn').addEventListener('click', showReimportDialog);
}

function renderThemePicker() {
  const container = document.getElementById('theme-picker');
  const themes = getAllThemes();
  const currentTheme = state.config.selectedTheme || 'simple-light';

  container.innerHTML = themes.map(theme => `
    <button class="theme-option ${currentTheme === theme.id ? 'active' : ''}" data-theme="${theme.id}" aria-label="Select ${theme.label} theme">
      <div class="theme-preview" style="background: ${theme.tokens['--background']}">
        <span style="color: ${theme.tokens['--theme-color']}">●</span>
      </div>
      <span class="theme-label">${theme.label}</span>
    </button>
  `).join('');

  container.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.theme;
      state.config.selectedTheme = themeId;
      applyTheme(themeId, state);
      saveState();
      renderThemePicker();
      renderTokenEditor();
    });
  });
}

function renderPresetPicker() {
  const container = document.getElementById('preset-picker');
  const presets = getAllPresets();
  const currentPreset = state.config.selectedPreset || null;

  container.innerHTML = presets.map(preset => `
    <button class="preset-option ${currentPreset === preset.id ? 'active' : ''}" data-preset="${preset.id}">
      <strong>${preset.label}</strong>
      <span class="preset-desc">${preset.description}</span>
    </button>
  `).join('');

  container.querySelectorAll('.preset-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.preset;
      if (currentPreset === presetId) return;
      
      const preset = presets.find(p => p.id === presetId);
      const confirmed = confirm(`Apply preset "${preset.label}"?\n\nThis will update your plugin configuration.`);
      if (!confirmed) return;
      
      state.config.selectedPreset = presetId;
      if (!state.config.plugins) state.config.plugins = {};
      applyPreset(presetId, state);
      saveState();
      renderPresetPicker();
      renderPluginManager();
    });
  });
}

function renderPluginManager() {
  const container = document.getElementById('plugin-manager');
  const plugins = getPlugins();
  const activePlugins = state.config.plugins || {};

  container.innerHTML = `
    <div class="plugin-list">
      ${plugins.map(plugin => `
        <div class="plugin-item">
          <label class="plugin-toggle">
            <input type="checkbox" data-plugin="${plugin.id}" ${activePlugins[plugin.id] ? 'checked' : ''} aria-label="Toggle ${plugin.label} plugin">
            <span class="toggle-slider"></span>
          </label>
          <div class="plugin-info">
            <span class="plugin-name">${plugin.label}</span>
            <span class="plugin-badge ${plugin.verified ? 'verified' : 'unverified'}" aria-label="${plugin.verified ? 'Verified' : 'Unverified'} plugin">
              ${plugin.verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
<div class="kroki-config-section" id="kroki-config-section" style="display: ${activePlugins.kroki ? 'block' : 'none'}">
       <h3>Kroki Configuration</h3>
       <div class="kroki-help" style="font-size: 12px; color: #666; margin-bottom: 8px;">
         Note: Kroki server must support CORS. 
         <a href="#" id="kroki-cors-help" style="color: var(--color-primary);">See requirements</a>
       </div>
       <div class="kroki-config">
         <label for="kroki-server-input">Kroki Server URL</label>
         <input type="text" id="kroki-server-input" value="${state.config.krokiServer || 'https://kroki.io'}" placeholder="https://kroki.io" aria-label="Kroki server URL">
         <button class="btn btn-secondary" id="test-kroki-btn">Test Connection</button>
         <span id="kroki-test-result" role="status" aria-live="polite"></span>
       </div>
     </div>
  `;

  container.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const pluginId = e.target.dataset.plugin;
      if (!state.config.plugins) state.config.plugins = {};
      state.config.plugins[pluginId] = e.target.checked;
      saveState();
      if (pluginId === 'kroki') {
        const krokiSection = document.getElementById('kroki-config-section');
        if (krokiSection) {
          krokiSection.style.display = e.target.checked ? 'block' : 'none';
        }
      }
      document.dispatchEvent(new CustomEvent('plugins-changed'));
    });
  });

  const testBtn = document.getElementById('test-kroki-btn');
  if (testBtn) {
    testBtn.addEventListener('click', testKrokiConnection);
  }
  
  const krokiInput = document.getElementById('kroki-server-input');
  if (krokiInput) {
    krokiInput.addEventListener('change', (e) => {
      state.config.krokiServer = e.target.value;
      saveState();
    });
  }
  
  const corsHelpLink = document.getElementById('kroki-cors-help');
  if (corsHelpLink) {
    corsHelpLink.addEventListener('click', (e) => {
      e.preventDefault();
      showKrokiCorsHelp();
    });
  }
}

async function testKrokiConnection() {
  const server = state.config.krokiServer || 'https://kroki.io';
  const resultEl = document.getElementById('kroki-test-result');
  resultEl.textContent = 'Testing...';
  resultEl.className = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const testDiagram = 'graph TD\n  A[Start] --> B[End]';
    const encoded = btoa(unescape(encodeURIComponent(testDiagram)));
    const response = await fetch(`${server}/graphviz/svg/${encoded}`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      resultEl.textContent = 'Connected';
      resultEl.className = 'success';
    } else {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      resultEl.textContent = 'Timeout';
    } else if (error.message.includes('CORS') || error.message.includes('fetch')) {
      resultEl.innerHTML = 'CORS Error - See docs';
    } else {
      resultEl.textContent = 'Failed';
    }
    resultEl.className = 'error';
    console.warn('Kroki connection failed:', error);
  }
}

function showKrokiCorsHelp() {
  const helpText = `Kroki CORS Requirements:
• Use a Kroki server with CORS enabled
• For local development: run kroki with --cors "*"
• Or use a public proxy that adds CORS headers
• Default https://kroki.io may have CORS restrictions`;
  alert(helpText);
}

function renderTokenEditor() {
  const container = document.getElementById('token-editor');
  const currentTokens = state.config.tokens || {};
  const controls = getCoreControls();

  container.innerHTML = controls.map(control => {
    const value = currentTokens[control.id] || control.default;
    if (control.type === 'color') {
      return `
        <div class="token-control">
          <label>${control.label}</label>
          <input type="color" data-token="${control.id}" value="${value}">
        </div>
      `;
    } else if (control.type === 'text') {
      return `
        <div class="token-control">
          <label>${control.label}</label>
          <input type="text" data-token="${control.id}" value="${value}">
        </div>
      `;
    } else if (control.type === 'range') {
      return `
        <div class="token-control">
          <label>${control.label}: <span class="token-value">${value}${control.unit}</span></label>
          <input type="range" data-token="${control.id}" min="${control.min}" max="${control.max}" value="${value}">
        </div>
      `;
    }
  }).join('');

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const tokenId = e.target.dataset.token;
      const control = controls.find(c => c.id === tokenId);
      if (control?.type === 'range') {
        const span = e.target.closest('.token-control').querySelector('.token-value');
        if (span) span.textContent = `${e.target.value}${control.unit}`;
      }
      if (!state.config.tokens) state.config.tokens = {};
      state.config.tokens[tokenId] = e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
      saveState();
    });
  });
}

function toggleAdvanced() {
  const section = document.getElementById('advanced-section');
  const toggle = document.getElementById('advanced-toggle');
  const isVisible = section.style.display !== 'none';
  
  if (isVisible) {
    section.style.display = 'none';
    toggle.textContent = 'Advanced Settings';
  } else {
    renderAdvancedSection();
    section.style.display = 'block';
    toggle.textContent = 'Hide Advanced Settings';
  }
}

function renderAdvancedSection() {
  const container = document.getElementById('advanced-section');
  const currentTokens = state.config.tokens || {};
  
  const advancedVars = docsifyThemeableVars.slice(8);

  container.innerHTML = `
    <h3>Advanced Theme Variables</h3>
    <div class="advanced-grid">
      ${advancedVars.map(token => `
        <div class="token-control">
          <label>${token}</label>
          <input type="text" data-token="${token}" value="${currentTokens[token] || ''}" placeholder="default">
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const tokenId = e.target.dataset.token;
      if (!state.config.tokens) state.config.tokens = {};
      state.config.tokens[tokenId] = e.target.value;
      saveState();
    });
  });
}

function showReimportDialog() {
  const confirmed = confirm('Reimport content from source? This will overwrite current content.');
  if (confirmed) {
    const source = typeof APP_SOURCE !== 'undefined' ? APP_SOURCE : '';
    if (source) {
      state.content = source;
      saveState();
      document.getElementById('content-input').value = source;
      alert('Content reimported successfully.');
    } else {
      alert('No source content available.');
    }
  }
}

export { initConfigUI };