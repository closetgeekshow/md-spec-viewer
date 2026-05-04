export function renderDiff(content) {
  return content.replace(/```(diff)\n([\s\S]*?)```/g, (match, lang, code) => {
    const lines = code.trim().split('\n');
    let html = '<div class="diff-container"><pre class="diff-block">';
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        html += `<span class="diff-add">+${escapeHtml(line.substring(1))}</span>\n`;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        html += `<span class="diff-remove">-${escapeHtml(line.substring(1))}</span>\n`;
      } else if (line.startsWith('@@')) {
        html += `<span class="diff-hunk">${escapeHtml(line)}</span>\n`;
      } else {
        html += `<span class="diff-context">${escapeHtml(line)}</span>\n`;
      }
    }
    
    html += '</pre></div>';
    return html;
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderDiff;