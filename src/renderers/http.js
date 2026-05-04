export function renderHttp(content) {
  return content.replace(/```http\n([\s\S]*?)```/g, (match, code) => {
    const parsed = parseHttpMessage(code);
    return `<div class="http-container">${renderHttpMessage(parsed)}</div>`;
  });
}

function parseHttpMessage(code) {
  const lines = code.trim().split('\n');
  const result = { method: '', url: '', version: 'HTTP/1.1', headers: [], body: '' };
  
  let i = 0;
  if (lines[0]) {
    const requestMatch = lines[0].match(/^(\w+)\s+([^\s]+)\s*(.*)$/);
    if (requestMatch) {
      result.method = requestMatch[1];
      result.url = requestMatch[2];
      result.version = requestMatch[3] || 'HTTP/1.1';
      i = 1;
    }
  }

  while (i < lines.length && lines[i].trim()) {
    const headerMatch = lines[i].match(/^([^:]+):\s*(.*)$/);
    if (headerMatch) {
      result.headers.push({ name: headerMatch[1], value: headerMatch[2] });
    }
    i++;
  }

  if (i < lines.length - 1) {
    result.body = lines.slice(i + 1).join('\n');
  }

  return result;
}

function renderHttpMessage({ method, url, version, headers, body }) {
  let html = '<div class="http-message">';
  
  const methodClass = {
    GET: 'http-method-get',
    POST: 'http-method-post',
    PUT: 'http-method-put',
    DELETE: 'http-method-delete',
    PATCH: 'http-method-patch'
  }[method] || 'http-method-other';

  html += `<div class="http-request-line"><span class="http-method ${methodClass}">${method}</span> <span class="http-url">${escapeHtml(url)}</span> <span class="http-version">${version}</span></div>`;
  
  if (headers.length) {
    html += '<div class="http-headers"><table class="http-headers-table"><tbody>';
    headers.forEach(h => {
      html += `<tr><td class="header-name">${escapeHtml(h.name)}</td><td class="header-value">${escapeHtml(h.value)}</td></tr>`;
    });
    html += '</tbody></table></div>';
  }

  if (body) {
    html += `<div class="http-body"><pre>${escapeHtml(body)}</pre></div>`;
  }

  html += '</div>';
  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderHttp;