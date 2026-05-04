export function renderMermaid(content) {
  const matches = content.match(/```mermaid\n([\s\S]*?)```/g);
  if (!matches) return content;
  
  return content.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
    return `<div class="mermaid-container">${code}</div>`;
  });
}

export default renderMermaid;