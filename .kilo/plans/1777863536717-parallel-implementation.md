# Parallel Implementation Plan — Docsify Artifact Visualizer

## Agent Assignments

### Agent 1: Core Infrastructure (Must complete first)
**Scope:** Phases 0-1 — Project foundation and app shell
**Files:** `vite.config.js`, `index.html`, `src/shell.js`, `src/demo.md`, `styles/tokens.css`

**Tasks:**
- [ ] Create Vite project with vanilla JS target
- [ ] Add `vite-plugin-singlefile` to vite.config.js
- [ ] Add custom `injectSource` build-time source capture
- [ ] Set up index.html as single deployable app shell
- [ ] Implement app boot sequence (shell.js)
- [ ] Implement localStorage state manager (avz_content, avz_config, avz_mode, avz_meta, avz_seed_id)
- [ ] Add demo markdown content for first-run experience
- [ ] Implement config/preview mode switch with ?mode URL parameter
- [ ] Add session restore on load

**Deliverable:** Working app shell with persistence

---

### Agent 2: Import & Preview Foundation (Depends on Agent 1)
**Scope:** Phase 2 (Import) + Phase 4 (Docsify Runtime Bootstrap)
**Files:** `src/import.js`, `src/preview.js`, `src/plugin-registry.js`, `styles/config-ui.css`

**Tasks:**
- [ ] Implement global clipboard paste handling
- [ ] Implement file browse import
- [ ] Implement drag-and-drop import
- [ ] Implement URL fetch import with CORS error handling
- [ ] Implement `handleMarkdownContent(string)` handler
- [ ] Add import metadata tracking
- [ ] Add size check with warning threshold
- [ ] Create plugin registry with 9 built-in plugins (stubs)
- [ ] Add simplified virtual filesystem/router override
- [ ] Configure Docsify settings (loadSidebar: false, subMaxLevel: 3)
- [ ] Initialize Docsify preview from in-memory markdown
- [ ] Add floating preview toolbar (Configure, Reimport, Export placeholders)

**Deliverable:** End-to-end import → preview flow

---

### Agent 3: Config UI Components (Depends on Agent 1)
**Scope:** Phase 3 — Preset picker, plugin manager, token editor
**Files:** `src/config-ui.js`, `src/preset.js`, `src/themes.js`, `styles/config-ui.css`

**Tasks:**
- [ ] Build preset picker UI with 6 presets
- [ ] Implement preset selection with overwrite behavior
- [ ] Create plugin manager UI (toggle plugins, verified/unverified badges)
- [ ] Add per-plugin config panels (Kroki server URL field)
- [ ] Implement "Add plugin URL" flow for custom plugins
- [ ] Build token editor with 8 core controls
- [ ] Add "Advanced" expander for remaining tokens
- [ ] Add unsaved-change indicator for advanced tokens
- [ ] Add Reimport confirmation dialog
- [ ] Define CSS custom properties token architecture
- [ ] Implement 5 theme presets (variable definitions)

**Deliverable:** Fully functional config screen

---

### Agent 4: Plugin Integration (Depends on Agent 2)
**Scope:** Phase 5 — Docsify plugin integrations
**Files:** `src/preview.js` (plugin loading), `src/export.js` (seed handling)

**Tasks:**
- [ ] Integrate docsify-kroki with Mermaid theme integration
- [ ] Integrate docsify-shiki for syntax highlighting
- [ ] Integrate docsify-copy-code for code block copy button
- [ ] Integrate docsify-plugin-flexible-alerts for callouts
- [ ] Integrate docsify-tabs for tabbed content
- [ ] Integrate docsify-termynal for terminal animations
- [ ] Integrate docsify-drawio / drawcsify for diagrams
- [ ] Load plugins dynamically via `<script src>` injection
- [ ] Handle failed plugin loads gracefully
- [ ] Mark verified vs unverified plugins in UI

**Deliverable:** All 9 plugins working in preview mode

---

### Agent 5: Custom Renderers (Depends on Agent 2)
**Scope:** Phase 6 — Custom code block renderers
**Files:** `src/renderers/tree.js`, `src/renderers/csv.js`, `src/renderers/http.js`, `src/renderers/diff.js`, `src/renderers/data.js`, `styles/renderers.css`

**Tasks:**
- [ ] Implement custom `markdown.renderer.code` dispatch function
- [ ] Add tree/dir block renderer — directory tree card
- [ ] Add csv/tsv renderer — sortable HTML table
- [ ] Add http renderer — color-coded HTTP block
- [ ] Add diff renderer — green/red line diff with +/-
- [ ] Add structured data renderer — collapsible JSON/YAML/TOML tree
- [ ] Ensure unknown fenced blocks fall through to Shiki
- [ ] Add renderer styles in renderers.css

**Deliverable:** All 5 custom renderers working

---

### Agent 6: Export & Self-Replication (Depends on Agents 1, 4)
**Scope:** Phase 8 — HTML export pipeline
**Files:** `src/export.js`

**Tasks:**
- [ ] Define `APP_SOURCE` constant in built index.html
- [ ] Implement seed script generation with inline markdown + config
- [ ] Escape markdown for safe JS template literal
- [ ] Build seed script with SEED_ID (ISO timestamp)
- [ ] Clone APP_SOURCE and inject seed script
- [ ] Trigger HTML download via Blob + URL.createObjectURL
- [ ] Verify exported file opens directly into Preview mode
- [ ] Add HTML comment with config JSON in export

**Deliverable:** Working export-to-self-contained-HTML

---

### Agent 7: Hardening & Polish (Depends on all previous agents)
**Scope:** Phase 9 + final integration
**Files:** Various — error handling, accessibility fixes, final testing

**Tasks:**
- [ ] Add Kroki connection test with /health endpoint
- [ ] Document Kroki CORS requirement in UI
- [ ] Add error states for failed imports (network, CORS, invalid)
- [ ] Add error states for failed plugin loads
- [ ] Add confirm dialogs for destructive actions
- [ ] Add keyboard shortcuts (Ctrl+V, preview, export)
- [ ] Add accessibility pass (labels, focus order, ARIA)
- [ ] Add storage fallback behavior
- [ ] Run regression tests with demo content
- [ ] Test export chain (export → open → modify → re-export)
- [ ] Final integration testing

**Deliverable:** Production-ready application

---

## Execution Waves

### Wave 1 (Parallel): Core Foundation
- Agent 1: Core Infrastructure
- Duration: ~2-3 hours

### Wave 2 (Parallel after Wave 1): Foundation Expansion
- Agent 2: Import & Preview Foundation
- Agent 3: Config UI Components
- Duration: ~3-4 hours

### Wave 3 (Parallel after Wave 2): Feature Development
- Agent 4: Plugin Integration
- Agent 5: Custom Renderers
- Duration: ~2-3 hours

### Wave 4 (Parallel after Wave 3): Advanced Features
- Agent 6: Export & Self-Replication
- Duration: ~1-2 hours

### Wave 5 (Sequential after Wave 4): Final Polish
- Agent 7: Hardening & Polish
- Duration: ~2-3 hours

---

## File Ownership Conflict Resolution

| File | Agent(s) | Resolution |
|------|----------|------------|
| `src/shell.js` | Agent 1 | Only Agent 1 |
| `src/import.js` | Agent 2 | Only Agent 2 |
| `src/preview.js` | Agents 2, 4 | Agent 2 creates stub, Agent 4 adds plugin loading |
| `src/plugin-registry.js` | Agents 2, 3 | Agent 2 creates registry, Agent 3 uses for UI |
| `src/config-ui.js` | Agent 3 | Only Agent 3 |
| `src/export.js` | Agent 6 | References config from Agent 3 |
| `src/renderers/*` | Agent 5 | Only Agent 5 |
| `src/demo.md` | Agent 1 | Only Agent 1 |

---

## Total Estimated Timeline
**Sequential:** 12-15 hours  
**Parallel:** 8-11 hours (depending on agent speed)