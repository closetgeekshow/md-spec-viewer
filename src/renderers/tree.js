export function renderTree(content) {
  return content.replace(/```(tree|dir)\n([\s\S]*?)```/g, (match, lang, code) => {
    const lines = code.trim().split('\n');
    const tree = parseTreeLines(lines);
    return `<div class="tree-container"><pre class="tree-block">${renderTreeHtml(tree, 0)}</pre></div>`;
  });
}

function parseTreeLines(lines) {
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = getIndent(line);
    const name = line.replace(/[├└│─\s]+/g, '').trim();
    result.push({ indent, name, isLast: line.includes('└') });
  }
  return result;
}

function getIndent(line) {
  let indent = 0;
  for (const char of line) {
    if (char === '│' || char === ' ') indent++;
    else if (char === '├' || char === '└') break;
  }
  return Math.floor(indent / 4);
}

function renderTreeHtml(items, index) {
  let html = '';
  let i = index;
  while (i < items.length) {
    const item = items[i];
    const isLast = item.isLast || (i === items.length - 1);
    const prefix = isLast ? '└── ' : '├── ';
    const classes = ['tree-item'];
    if (item.name.endsWith('/')) classes.push('tree-directory');
    else classes.push('tree-file');
    html += `<span class="${classes.join(' ')}">${prefix}${escapeHtml(item.name)}</span>\n`;
    i++;
  }
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderTree;