const plugins = [
  {
    id: 'kroki',
    label: 'Kroki Diagrams',
    description: 'Support for diagrams using Kroki (Graphviz, PlantUML, Mermaid, etc.)',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-kroki@1.0.0/dist/docsify-kroki.min.js',
    tags: ['diagrams', 'kroki', 'graphviz', 'plantuml'],
    verified: true
  },
  {
    id: 'shiki',
    label: 'Shiki Syntax Highlighting',
    description: 'Beautiful syntax highlighting using Shiki',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-shiki@1.0.0/dist/docsify-shiki.min.js',
    tags: ['syntax', 'highlighting', 'shiki', 'code'],
    verified: true
  },
  {
    id: 'copy-code',
    label: 'Copy Code',
    description: 'Add copy button to code blocks',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-copy-code@1.0.0/dist/docsify-copy-code.min.js',
    tags: ['code', 'copy', 'utility'],
    verified: true
  },
  {
    id: 'flex-alerts',
    label: 'Flex Alerts',
    description: 'Flexible alert/notice blocks for documentation',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-plugin-flex-alerts@1.0.0/dist/docsify-plugin-flex-alerts.min.js',
    tags: ['alerts', 'notes', 'admonitions'],
    verified: true
  },
  {
    id: 'tabs',
    label: 'Tabs',
    description: 'Tabbed content blocks for organizing information',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-tabs@1.0.0/dist/docsify-tabs.min.js',
    tags: ['tabs', 'navigation', 'layout'],
    verified: true
  },
  {
    id: 'termynal',
    label: 'Termynal',
    description: 'Terminal emulator for interactive demos',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-termynal@1.0.0/dist/docsify-termynal.min.js',
    tags: ['terminal', 'demo', 'interactive'],
    verified: true
  },
  {
    id: 'drawio',
    label: 'Draw.io Integration',
    description: 'Embed Draw.io diagrams in documentation',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-drawio@1.0.0/dist/docsify-drawio.min.js',
    tags: ['diagrams', 'drawio', 'embed'],
    verified: true
  },
  {
    id: 'drawcsify',
    label: 'Draw.csify',
    description: 'Alternative Draw.io integration with CS clarity',
    cdn: 'https://cdn.jsdelivr.net/npm/drawcsify@1.0.0/dist/drawcsify.min.js',
    tags: ['diagrams', 'drawio', 'embed', 'csharp'],
    verified: false
  },
  {
    id: 'pagination',
    label: 'Pagination',
    description: 'Add pagination to documentation pages',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-pagination@1.0.0/dist/docsify-pagination.min.js',
    tags: ['navigation', 'pagination', 'pages'],
    verified: true
  },
  {
    id: 'zoom-image',
    label: 'Zoom Image',
    description: 'Click to zoom images with modal overlay',
    cdn: 'https://cdn.jsdelivr.net/npm/docsify-zoom-image@1.0.0/dist/docsify-zoom-image.min.js',
    tags: ['images', 'zoom', 'modal'],
    verified: true
  }
];

function getPlugins() {
  return plugins;
}

function getPluginById(id) {
  return plugins.find(p => p.id === id);
}

export { plugins, getPlugins, getPluginById };