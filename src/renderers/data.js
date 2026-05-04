export function renderData(content) {
  return content.replace(/```(json|yaml|toml)\n([\s\S]*?)```/g, (match, lang, code) => {
    try {
      const data = parseData(code, lang);
      const id = 'data-' + Math.random().toString(36).slice(2);
      return `<div class="data-container"><div class="data-tree" data-lang="${lang}" id="${id}">${renderDataTree(data)}</div></div>`;
    } catch (e) {
      return match;
    }
  });
}

function parseData(code, lang) {
  if (lang === 'json') return JSON.parse(code);
  if (lang === 'yaml') return parseYaml(code);
  if (lang === 'toml') return parseToml(code);
  return {};
}

function parseYaml(code) {
  const result = {};
  const lines = code.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      result[match[1]] = match[2] || '';
    }
  }
  return result;
}

function parseToml(code) {
  const result = {};
  for (const line of code.split('\n')) {
    const match = line.match(/^(\w+)\s*=\s*"(.*)"/);
    if (match) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

function renderDataTree(data, depth = 0) {
  let html = '';
  const entries = Object.entries(data);
  
  entries.forEach(([key, value], i) => {
    const isLast = i === entries.length - 1;
    const prefix = depth === 0 ? '' : isLast ? '└── ' : '├── ';
    
    if (typeof value === 'object' && value !== null) {
      html += `<div class="data-node"><span class="data-key">${prefix}${escapeHtml(key)}</span></div>`;
      html += `<div class="data-children">${renderDataTree(value, depth + 1)}</div>`;
    } else {
      html += `<div class="data-node"><span class="data-key">${prefix}${escapeHtml(key)}</span><span class="data-value">: ${escapeHtml(String(value))}</span></div>`;
    }
  });
  
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderData;