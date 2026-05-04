import { initConfigUI } from './config-ui.js';
import { initExport } from './export.js';

const STORAGE_KEYS = {
  CONTENT: 'avz_content',
  CONTENT_META: 'avz_content_meta',
  CONFIG: 'avz_config',
  MODE: 'avz_mode',
  META: 'avz_meta',
  SEED_ID: 'avz_seed_id'
};

const state = {
  content: '',
  contentMeta: {},
  config: {
    theme: 'light',
    fontSize: 16
  },
  mode: 'config',
  meta: {},
  seedId: null
};

let storageAvailable = true;

function checkStorageAvailability() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn('LocalStorage full, clearing old data');
      try {
        for (const k of Object.values(STORAGE_KEYS)) {
          localStorage.removeItem(k);
        }
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.error('Failed to save even after clearing:', retryError);
        storageAvailable = false;
      }
    } else {
      console.error('LocalStorage error:', e);
      storageAvailable = false;
    }
  }
}

function loadState() {
  if (!checkStorageAvailability()) {
    storageAvailable = false;
    return;
  }
  
  try {
    state.content = localStorage.getItem(STORAGE_KEYS.CONTENT) || '';
    state.contentMeta = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT_META) || '{}');
    state.config = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{"theme":"light","fontSize":16}');
    state.mode = localStorage.getItem(STORAGE_KEYS.MODE) || getUrlMode();
    state.meta = JSON.parse(localStorage.getItem(STORAGE_KEYS.META) || '{}');
    state.seedId = localStorage.getItem(STORAGE_KEYS.SEED_ID) || null;
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

function getUrlMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode')) {
    return params.get('mode');
  }
  if (window.SEED_MODE) {
    return window.SEED_MODE;
  }
  return 'config';
}

function loadSeedState() {
  if (window.SEED_MARKDOWN !== undefined) {
    state.content = window.SEED_MARKDOWN;
  }
  if (window.SEED_CONFIG !== undefined) {
    state.config = { ...state.config, ...window.SEED_CONFIG };
  }
  if (window.SEED_ID !== undefined) {
    state.seedId = window.SEED_ID;
  }
}

function saveState() {
  if (!storageAvailable) return;
  
  try {
    safeLocalStorageSet(STORAGE_KEYS.CONTENT, state.content);
    safeLocalStorageSet(STORAGE_KEYS.CONTENT_META, JSON.stringify(state.contentMeta));
    safeLocalStorageSet(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    safeLocalStorageSet(STORAGE_KEYS.MODE, state.mode);
    safeLocalStorageSet(STORAGE_KEYS.META, JSON.stringify(state.meta));
    if (state.seedId) {
      safeLocalStorageSet(STORAGE_KEYS.SEED_ID, state.seedId);
    }
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function updateMode(newMode) {
  state.mode = newMode;
  saveState();
  document.body.className = newMode;
  
  const modeButtons = document.querySelectorAll('[data-mode]');
  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === newMode;
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function init() {
  loadSeedState();
  loadState();
  
  if (window.SEED_MODE) {
    state.mode = window.SEED_MODE;
  }
  
  document.body.className = state.mode;

  const contentInput = document.getElementById('content-input');
  if (contentInput) {
    contentInput.value = state.content;
    contentInput.addEventListener('input', (e) => {
      state.content = e.target.value;
      saveState();
    });
  }

  const modeButtons = document.querySelectorAll('[data-mode]');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      updateMode(btn.dataset.mode);
      if (btn.dataset.mode === 'config') {
        setTimeout(initConfigUI, 0);
      }
    });
  });

  if (state.mode === 'config') {
    setTimeout(initConfigUI, 0);
  }

  initExport();
  initKeyboardShortcuts();
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      return;
    }
    
    const isMac = navigator.platform.includes('Mac');
    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    
    if (ctrl && e.key === 'v') {
      e.preventDefault();
      handlePasteShortcut();
    } else if (ctrl && e.key === 'p') {
      e.preventDefault();
      updateMode('preview');
    } else if (ctrl && e.key === 'e') {
      e.preventDefault();
      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) exportBtn.click();
    }
  });
}

function handlePasteShortcut() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(text => {
      if (text && text.trim()) {
        const contentInput = document.getElementById('content-input');
        if (contentInput) {
          state.content = text;
          contentInput.value = text;
          saveState();
        }
      }
    }).catch(() => {
      alert('Unable to read clipboard. Please use the Paste button in the import panel.');
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

export { state, saveState, updateMode };