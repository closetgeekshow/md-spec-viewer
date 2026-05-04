const presets = {
  'spec-doc': {
    label: 'Specification Document',
    description: 'Technical specification with diagrams and code blocks',
    plugins: ['kroki', 'shiki', 'copy-code', 'flex-alerts', 'tabs']
  },
  'api-doc': {
    label: 'API Documentation',
    description: 'Clean API reference with syntax highlighting',
    plugins: ['kroki', 'shiki', 'copy-code']
  },
  'architecture': {
    label: 'Architecture Docs',
    description: 'System architecture with diagrams and draw.io integration',
    plugins: ['kroki', 'shiki', 'copy-code', 'drawio']
  },
  'data-report': {
    label: 'Data Report',
    description: 'Data analysis reports with tabbed sections',
    plugins: ['kroki', 'shiki', 'copy-code', 'tabs']
  },
  'dev-journal': {
    label: 'Developer Journal',
    description: 'Interactive demos and terminal sessions',
    plugins: ['shiki', 'copy-code', 'termynal', 'flex-alerts']
  },
  'minimal': {
    label: 'Minimal',
    description: 'Clean documentation with basic features',
    plugins: ['shiki', 'copy-code']
  }
};

function getPreset(id) {
  return presets[id] || null;
}

function getAllPresets() {
  return Object.entries(presets).map(([id, preset]) => ({ id, ...preset }));
}

function applyPreset(presetId, state) {
  const preset = getPreset(presetId);
  if (!preset) return;
  state.config.plugins = { ...state.config.plugins };
  preset.plugins.forEach(pluginId => {
    state.config.plugins[pluginId] = true;
  });
  Object.keys(state.config.plugins).forEach(id => {
    if (!preset.plugins.includes(id)) {
      state.config.plugins[id] = false;
    }
  });
}

export { presets, getPreset, getAllPresets, applyPreset };