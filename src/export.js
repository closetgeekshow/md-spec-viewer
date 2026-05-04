import { state } from './shell.js';

function escapeJsString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function generateSeedScript(markdown, config) {
  const seedId = new Date().toISOString();
  const escapedMarkdown = escapeJsString(markdown);
  const configJson = JSON.stringify(config);
  
  return `<script>
window.SEED_ID = "${seedId}";
window.SEED_MARKDOWN = \`${escapedMarkdown}\`;
window.SEED_CONFIG = ${configJson};
window.SEED_MODE = "preview";
</script>`;
}

function createExportHtml() {
  const currentHtml = document.documentElement.outerHTML;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = currentHtml.includes('<html') 
    ? currentHtml.replace('<!DOCTYPE html>', '').replace(/^<html[^>]*>/, '').replace(/<\/html>$/, '')
    : currentHtml;
  
  const headMatch = tempDiv.innerHTML.match(/<head[^>]*>[\s\S]*?<\/head>/i);
  const bodyMatch = tempDiv.innerHTML.match(/<body[^>]*>[\s\S]*?<\/body>/i);
  
  let head = headMatch ? headMatch[0] : '';
  let body = bodyMatch ? bodyMatch[0] : '';
  
  const seedScript = generateSeedScript(state.content, state.config);
  
  if (head) {
    const firstScriptIndex = head.indexOf('<script');
    if (firstScriptIndex !== -1) {
      head = head.slice(0, firstScriptIndex) + seedScript + head.slice(firstScriptIndex);
    } else {
      head = head.replace('</head>', seedScript + '</head>');
    }
  } else {
    head = `<head>${seedScript}</head>`;
  }
  
  const exportConfig = {
    content: state.content,
    config: state.config,
    seedId: new Date().toISOString(),
    mode: 'preview'
  };
  
  const configComment = `<!-- Export Config: ${JSON.stringify(exportConfig)} -->`;
  head = head.replace('<head>', `<head>${configComment}`);
  
  return `<!DOCTYPE html><html>${head}${body}</html>`;
}

function downloadExport() {
  const html = createExportHtml();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'artifact-visualizer-export.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initExport() {
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', downloadExport);
  }
  
  const exportPreviewBtn = document.getElementById('export-preview-btn');
  if (exportPreviewBtn) {
    exportPreviewBtn.addEventListener('click', downloadExport);
  }
}

export { downloadExport, initExport, generateSeedScript, escapeJsString };