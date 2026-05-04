# Build Checklist — Docsify Artifact Visualizer

## Phase 0 — Project Setup
- [ ] Create Vite project with vanilla JS target
- [ ] Add `vite-plugin-singlefile` to inline JS/CSS into one HTML file
- [ ] Add custom `injectSource` or equivalent build-time source capture
- [ ] Set up `index.html` as the single deployable app shell
- [ ] Establish `src/` module layout and `styles/` tokens

## Phase 1 — App Shell & State
- [ ] Implement app boot sequence
- [ ] Implement `localStorage` state manager (`avz_content`, `avz_config`, `avz_mode`, `avz_seed_id`)
- [ ] Add demo markdown content for first-run experience
- [ ] Add config/preview mode switch
- [ ] Add session restore on load

## Phase 2 — Import UX
- [ ] Implement global clipboard paste handling
- [ ] Implement file browse import
- [ ] Implement drag-and-drop import
- [ ] Implement URL fetch import
- [ ] Add import metadata tracking (source, filename, timestamp, byte length)
- [ ] Add size check with warning threshold (~2MB)

## Phase 3 — Config UI
- [ ] Build preset picker
- [ ] Build plugin manager with registry-backed cards
- [ ] Add per-plugin config panels
- [ ] Add preset overwrite behavior with no merge logic
- [ ] Add "Add plugin URL" flow for custom plugins
- [ ] Add token editor with 8 core controls + Advanced expander
- [ ] Add unsaved-change indicator for advanced tokens
- [ ] Add Reimport confirmation dialog

## Phase 4 — Docsify Runtime
- [ ] Add simplified virtual filesystem/router override
- [ ] Lock `loadSidebar: false` and `subMaxLevel: 3`
- [ ] Initialize Docsify preview from in-memory markdown only
- [ ] Ensure preview reinitialization is safe when switching modes
- [ ] Add floating preview toolbar

## Phase 5 — Plugins
- [ ] Integrate docsify-kroki
- [ ] Integrate docsify-shiki
- [ ] Integrate docsify-copy-code
- [ ] Integrate docsify-plugin-flexible-alerts
- [ ] Integrate docsify-tabs
- [ ] Integrate docsify-termynal
- [ ] Integrate docsify-drawio / drawcsify
- [ ] Add custom plugin verification via sandbox iframe and postMessage
- [ ] Mark verified vs unverified plugins in UI

## Phase 6 — Renderers
- [ ] Add tree/dir block renderer
- [ ] Add csv/tsv renderer
- [ ] Add http renderer
- [ ] Add diff renderer
- [ ] Add structured data renderer for JSON/YAML/TOML
- [ ] Ensure unknown fenced blocks fall through cleanly

## Phase 7 — Export
- [ ] Implement seed-script generation with inline markdown + config JSON
- [ ] Inject seed script into cloned app source
- [ ] Add SEED_ID collision guard
- [ ] Trigger HTML download via Blob URL
- [ ] Verify exported file opens directly into Preview mode
- [ ] Verify re-export chain works

## Phase 8 — Polish & Safety
- [ ] Add Kroki connection test with `/health`
- [ ] Document Kroki CORS requirement in UI
- [ ] Add error states for failed imports and failed plugin loads
- [ ] Add confirm dialogs for destructive actions
- [ ] Add keyboard shortcuts for paste/import/preview/export
- [ ] Add accessibility checks for labels, focus order, and contrast
- [ ] Add final regression pass using demo content
