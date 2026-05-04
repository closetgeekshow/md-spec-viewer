export function renderCode(content) {
  return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block${lang ? ` language-${lang}` : ''}"><code>${escapeHtml(code)}</code></pre>`;
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderCode;