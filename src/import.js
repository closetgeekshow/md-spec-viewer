import { state, saveState } from './shell.js';

function initImportPanel() {
  const panel = document.createElement('div');
  panel.className = 'import-panel';
  panel.innerHTML = `
    <h2>Import Markdown</h2>
    <div class="import-options">
      <div class="import-option">
        <label for="file-input" class="btn btn-primary">Browse File</label>
        <input type="file" id="file-input" accept=".md,.txt,.markdown" style="display: none">
      </div>
      <div class="import-option">
        <input type="url" id="url-input" placeholder="Enter URL to fetch">
        <button id="url-fetch-btn" class="btn btn-secondary">Fetch URL</button>
      </div>
      <div class="import-option">
        <button id="paste-btn" class="btn btn-secondary">Paste from Clipboard</button>
      </div>
      <div class="import-option drop-zone" id="drop-zone">
        <span>Drag & Drop file here</span>
      </div>
    </div>
  `;

  const editorContainer = document.getElementById('editor-container');
  if (editorContainer) {
    editorContainer.insertBefore(panel, editorContainer.firstChild);
  }

  initFileBrowse();
  initClipboardPaste();
  initDragDrop();
  initUrlFetch();
}

function initFileBrowse() {
  const fileInput = document.getElementById('file-input');
  if (!fileInput) return;

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      if (!text.trim()) {
        showError('File is empty or could not be read');
        return;
      }
      handleMarkdownContent(text, { source: 'file', name: file.name });
    } catch (err) {
      showError(`Failed to read file: ${err.message}`);
    }
  });

  const label = document.querySelector('label[for="file-input"]');
  if (label) {
    label.addEventListener('click', () => fileInput.click());
  }
}

function initClipboardPaste() {
  const pasteBtn = document.getElementById('paste-btn');
  if (!pasteBtn) return;

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleMarkdownContent(text, { source: 'clipboard' });
      }
    } catch (err) {
      console.error('Clipboard read failed:', err);
    }
  });
}

document.addEventListener('paste', async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file && file.name.match(/\.(md|txt|markdown)$/i)) {
        const text = await file.text();
        handleMarkdownContent(text, { source: 'clipboard-file', name: file.name });
        e.preventDefault();
        return;
      }
    }
  }

  const text = e.clipboardData?.getData('text/plain');
  if (text && text.trim()) {
    handleMarkdownContent(text, { source: 'clipboard' });
    e.preventDefault();
  }
});

function initDragDrop() {
  const dropZone = document.getElementById('drop-zone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(evt => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', async (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.name.match(/\.(md|txt|markdown)$/i)) {
      const text = await file.text();
      handleMarkdownContent(text, { source: 'drop', name: file.name });
    }
  });
}

function initUrlFetch() {
  const fetchBtn = document.getElementById('url-fetch-btn');
  const urlInput = document.getElementById('url-input');
  if (!fetchBtn || !urlInput) return;

  fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
      showError('Please enter a URL');
      return;
    }

    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Fetching...';
      status.className = '';
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        mode: 'cors'
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Invalid content: HTML page received instead of Markdown');
      }
      
      handleMarkdownContent(text, { source: 'url', url });
    } catch (err) {
      if (err.name === 'AbortError') {
        showError('Request timed out. Please try again.');
      } else if (err.message.includes('CORS') || err.message.includes('fetch')) {
        showError('CORS error: Cannot fetch from this URL. The server must allow cross-origin requests.');
      } else if (err.message.includes('Invalid content')) {
        showError(err.message);
      } else {
        showError(`Failed to fetch URL: ${err.message}`);
      }
    }
  });
}

function handleMarkdownContent(content, meta) {
  state.content = content;
  state.contentMeta = meta;
  saveState();

  const preview = content.substring(0, 500);
  showPreview(preview);

  const previewBtn = document.querySelector('[data-mode="preview"]');
  if (previewBtn) {
    previewBtn.disabled = false;
    previewBtn.classList.add('ready');
  }

  const contentInput = document.getElementById('content-input');
  if (contentInput) {
    contentInput.value = content;
  }

  updateStatus(`Imported from ${meta.source || 'unknown'}`);
}

function showPreview(preview) {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = `<div class="preview-content"><pre>${escapeHtml(preview)}${state.content.length > 500 ? '...' : ''}</pre></div>`;
  }
}

function showError(message) {
  const status = document.getElementById('status');
  if (status) {
    status.textContent = message;
    status.className = 'error';
    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 3000);
  }
}

function updateStatus(message) {
  const status = document.getElementById('status');
  if (status) {
    status.textContent = message;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initImportPanel);

export { initImportPanel, handleMarkdownContent };