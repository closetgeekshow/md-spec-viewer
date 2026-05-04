export function renderCsv(content) {
  return content.replace(/```(csv|tsv)\n([\s\S]*?)```/g, (match, lang, code) => {
    const delimiter = lang === 'tsv' ? '\t' : detectDelimiter(code);
    const lines = code.trim().split('\n');
    const parsed = parseCsv(lines, delimiter);
    if (!parsed.headers.length) return match;
    return renderCsvTable(parsed, lang);
  });
}

function detectDelimiter(code) {
  const firstLine = code.split('\n')[0];
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

function parseCsv(lines, delimiter) {
  const headers = lines[0]?.split(delimiter).map(h => h.trim()) || [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim());
    if (cells.length === headers.length) {
      rows.push(cells);
    }
  }
  return { headers, rows };
}

function renderCsvTable({ headers, rows }, lang) {
  let html = '<div class="csv-container"><table class="csv-table" data-lang="' + lang + '">';
  html += '<thead><tr>';
  headers.forEach((h, i) => {
    html += `<th data-col="${i}">${escapeHtml(h)}</th>`;
  });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${escapeHtml(cell)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderCsv;