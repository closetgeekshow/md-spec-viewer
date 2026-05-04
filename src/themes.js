const themes = {
  'simple-dark': {
    label: 'Simple Dark',
    description: 'Clean dark theme',
    tokens: {
      '--theme-color': '#0066cc',
      '--background': '#1a1a1a',
      '--sidebar-background': '#252525',
      '--base-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '--mono-font-family': '"SF Mono", "Monaco", "Menlo", "Ubuntu Mono", monospace',
      '--base-font-size': '16px',
      '--content-max-width': '900px',
      '--sidebar-width': '260px'
    }
  },
  'simple-light': {
    label: 'Simple Light',
    description: 'Clean light theme',
    tokens: {
      '--theme-color': '#0066cc',
      '--background': '#ffffff',
      '--sidebar-background': '#f8f8f8',
      '--base-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '--mono-font-family': '"SF Mono", "Monaco", "Menlo", "Ubuntu Mono", monospace',
      '--base-font-size': '16px',
      '--content-max-width': '900px',
      '--sidebar-width': '260px'
    }
  },
  'nord': {
    label: 'Nord',
    description: 'Arctic color palette',
    tokens: {
      '--theme-color': '#88c0d0',
      '--background': '#2e3440',
      '--sidebar-background': '#3b4252',
      '--base-font-family': '"Roboto", "Helvetica Neue", Arial, sans-serif',
      '--mono-font-family': '"Fira Code", "SF Mono", monospace',
      '--base-font-size': '16px',
      '--content-max-width': '850px',
      '--sidebar-width': '280px'
    }
  },
  'github-dark': {
    label: 'GitHub Dark',
    description: 'GitHub-inspired dark theme',
    tokens: {
      '--theme-color': '#58a6ff',
      '--background': '#0d1117',
      '--sidebar-background': '#161b22',
      '--base-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      '--mono-font-family': '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      '--base-font-size': '15px',
      '--content-max-width': '1012px',
      '--sidebar-width': '280px'
    }
  },
  'solarized': {
    label: 'Solarized',
    description: 'Precision color scheme',
    tokens: {
      '--theme-color': '#268bd2',
      '--background': '#fdf6e3',
      '--sidebar-background': '#eee8d5',
      '--base-font-family': '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif',
      '--mono-font-family': '"Source Code Pro", "SF Mono", monospace',
      '--base-font-size': '16px',
      '--content-max-width': '900px',
      '--sidebar-width': '260px'
    }
  }
};

const docsifyThemeableVars = [
  '--theme-color',
  '--background',
  '--sidebar-background',
  '--base-font-family',
  '--mono-font-family',
  '--base-font-size',
  '--content-max-width',
  '--sidebar-width',
  '--font-family',
  '--font-size',
  '--text-color',
  '--text-color-light',
  '--link-color',
  '--link-color-hover',
  '--border-radius',
  '--block-border-radius',
  '--code-border-radius',
  '--header-height',
  '--header-background',
  '--header-text-color',
  '--sidebar-padding',
  '--sidebar-text-color',
  '--sidebar-link-color',
  '--sidebar-link-hover-color',
  '--sidebar-link-hover-background',
  '--content-padding',
  '--toc-background',
  '--toc-text-color',
  '--toc-link-color',
  '--search-background',
  '--search-border-color',
  '--search-text-color',
  '--search-placeholder-color',
  '--search-result-title-color',
  '--search-result-excerpt-color',
  '--search-result-excerpt-background',
  '--search-result-current-background'
];

function getTheme(id) {
  return themes[id] || null;
}

function getAllThemes() {
  return Object.entries(themes).map(([id, theme]) => ({ id, ...theme }));
}

function applyTheme(themeId, state) {
  const theme = getTheme(themeId);
  if (!theme) return;
  if (!state.config.tokens) state.config.tokens = {};
  Object.assign(state.config.tokens, theme.tokens);
}

function getCoreControls() {
  return [
    { id: '--theme-color', type: 'color', label: 'Theme Color', min: null, max: null, default: '#0066cc' },
    { id: '--background', type: 'color', label: 'Background', min: null, max: null, default: '#ffffff' },
    { id: '--sidebar-background', type: 'color', label: 'Sidebar Background', min: null, max: null, default: '#f8f8f8' },
    { id: '--base-font-family', type: 'text', label: 'Base Font Family', min: null, max: null, default: '-apple-system, BlinkMacSystemFont, sans-serif' },
    { id: '--mono-font-family', type: 'text', label: 'Monospace Font', min: null, max: null, default: '"SF Mono", monospace' },
    { id: '--base-font-size', type: 'range', label: 'Base Font Size', min: 12, max: 20, default: 16, unit: 'px' },
    { id: '--content-max-width', type: 'range', label: 'Content Max Width', min: 600, max: 1400, default: 900, unit: 'px' },
    { id: '--sidebar-width', type: 'range', label: 'Sidebar Width', min: 180, max: 360, default: 260, unit: 'px' }
  ];
}

export { themes, docsifyThemeableVars, getTheme, getAllThemes, applyTheme, getCoreControls };