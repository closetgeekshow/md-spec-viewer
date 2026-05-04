import { renderMermaid } from './mermaid.js';
import renderCode from './code.js';
import renderTables from './tables.js';
import renderTree from './tree.js';
import renderCsv from './csv.js';
import renderHttp from './http.js';
import renderDiff from './diff.js';
import renderData from './data.js';

export { renderMermaid, renderCode, renderTables, renderTree, renderCsv, renderHttp, renderDiff, renderData };

export function renderAll(content, renderer = 'docsify') {
  let result = content;
  
  if (renderer === 'custom') {
    result = renderTree(result);
    result = renderCsv(result);
    result = renderHttp(result);
    result = renderDiff(result);
    result = renderData(result);
    result = renderMermaid(result);
  } else {
    result = renderMermaid(result);
  }
  
  return result;
}

export function createCustomRenderer(docsifyRenderer) {
  return function(code, lang) {
    const langMap = {
      'tree': renderTreeCode,
      'dir': renderTreeCode,
      'csv': renderCsvCode,
      'tsv': renderCsvCode,
      'http': renderHttpCode,
      'diff': renderDiffCode,
      'json': renderDataCode,
      'yaml': renderDataCode,
      'toml': renderDataCode
    };
    
    if (langMap[lang]) {
      return langMap[lang](code, lang);
    }
    
    return docsifyRenderer ? docsifyRenderer(code, lang) : `<pre><code>${escapeHtml(code)}</code></pre>`;
  };
}

function renderTreeCode(code, lang) {
  const lines = code.trim().split('\n');
  return `<div class="tree-container"><pre class="tree-block">${renderTreeInline(lines)}</pre></div>`;
}

function renderTreeInline(lines) {
  let html = '';
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const isLast = line.includes('└');
    const prefix = isLast ? '└── ' : '├── ';
    const name = line.replace(/[├└│─\s]+/g, '').trim();
    html += `<span class="tree-item">${prefix}${escapeHtml(name)}</span>\n`;
  });
  return html;
}

function renderCsvCode(code, lang) {
  const delimiter = lang === 'tsv' ? '\t' : detectDelimiter(code);
  const lines = code.trim().split('\n');
  const headers = lines[0]?.split(delimiter).map(h => h.trim()) || [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim());
    if (cells.length === headers.length) rows.push(cells);
  }
  
  let html = '<div class="csv-container"><table class="csv-table"><thead><tr>';
  headers.forEach(h => html += `<th>${escapeHtml(h)}</th>`);
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>' + row.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function detectDelimiter(code) {
  const lines = code.split('\n');
  const firstLine = lines[0];
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

function renderHttpCode(code, lang) {
  const lines = code.trim().split('\n');
  const reqLine = lines[0] || '';
  const methodMatch = reqLine.match(/^(\w+)\s+/);
  const method = methodMatch ? methodMatch[1] : 'GET';
  
  let html = '<div class="http-container"><div class="http-message">';
  html += `<div class="http-request-line"><span class="http-method http-method-${method.toLowerCase()}">${method}</span> ${escapeHtml(reqLine.substring(method.length + 1))}</div>`;
  
  let bodyIdx = lines.findIndex(l => !l.includes(':') && l.trim());
  const headers = bodyIdx === -1 ? lines.slice(1) : lines.slice(1, bodyIdx);
  
  if (headers.length) {
    html += '<div class="http-headers"><table class="http-headers-table"><tbody>';
    headers.filter(l => l.includes(':')).forEach(h => {
      const [name, value] = h.split(':');
      html += `<tr><td class="header-name">${escapeHtml(name)}</td><td class="header-value">${escapeHtml(value)}</td></tr>`;
    });
    html += '</tbody></table></div>';
  }
  
  html += '</div></div>';
  return html;
}

function renderDiffCode(code, lang) {
  const lines = code.trim().split('\n');
  let html = '<div class="diff-container"><pre class="diff-block">';
  lines.forEach(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      html += `<span class="diff-add">+${escapeHtml(line.substring(1))}</span>\n`;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      html += `<span class="diff-remove">-${escapeHtml(line.substring(1))}</span>\n`;
    } else {
      html += `<span class="diff-context">${escapeHtml(line)}</span>\n`;
    }
  });
  html += '</pre></div>';
  return html;
}

function renderDataCode(code, lang) {
  try {
    const data = JSON.parse(code);
    return `<div class="data-container"><div class="data-tree">${renderObjectTree(data)}</div></div>`;
  } catch (e) {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function renderObjectTree(obj, depth = 0) {
  let html = '';
  const entries = Object.entries(obj);
  entries.forEach(([key, value], i) => {
    const isLast = i === entries.length - 1;
    const prefix = depth === 0 ? '' : isLast ? '└── ' : '├── ';
    if (typeof value === 'object' && value !== null) {
      html += `<div class="data-node"><span class="data-key">${prefix}${escapeHtml(key)}</span></div>`;
      html += `<div class="data-children">${renderObjectTree(value, depth + 1)}</div>`;
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