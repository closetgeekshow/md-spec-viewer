# Implementation Plan — Docsify Artifact Visualizer

## Milestone 1 — Foundation
**Goal:** Get the app shell running and persistent.

### Deliverables
- Vite single-file build
- App bootstrap and mode switching
- `localStorage` persistence
- Demo content
- Basic config screen layout

### Definition of Done
- App loads as a single HTML file
- Config mode shows on first load
- Saved state restores correctly

---

## Milestone 2 — Import and Preview
**Goal:** Make markdown import and preview work end to end.

### Deliverables
- Paste, file, drag-drop, and URL import
- Markdown content handler
- Simplified Docsify runtime with in-memory content serving
- Preview mode and floating toolbar

### Definition of Done
- Pasted markdown renders correctly
- Imported content survives refresh
- Preview can be entered and exited reliably

---

## Milestone 3 — Presets and Plugins
**Goal:** Make the app configurable for different artifact types.

### Deliverables
- Preset picker with overwrite behavior
- Plugin registry and plugin manager
- Built-in plugin integrations
- Kroki config panel with test connection
- Custom plugin URL import and verification

### Definition of Done
- Selecting a preset reconfigures the plugin set immediately
- Plugin toggles persist in config
- Kroki endpoint can be validated

---

## Milestone 4 — Renderers and Theming
**Goal:** Support the broadest useful set of artifact formats.

### Deliverables
- Tree, csv, http, diff, structured-data renderers
- Core token editor
- Advanced token expander
- Theme preset support

### Definition of Done
- Common LLM outputs display cleanly
- Theme changes are visible live in core tokens
- Advanced tokens can be applied explicitly

---

## Milestone 5 — Export
**Goal:** Export the app as a self-replicating file.

### Deliverables
- Seed script injection with inline content and config JSON
- SEED_ID collision guard
- Export download flow
- Reopen exported file as a full app instance

### Definition of Done
- Exported file opens directly into preview
- Exported file includes content and configuration
- Re-export after editing works

---

## Milestone 6 — Hardening
**Goal:** Remove rough edges and prepare for daily use.

### Deliverables
- Error handling and recovery flows
- Reimport confirmation dialog
- Size warning and storage fallback behavior
- Accessibility pass
- Demo content regression testing

### Definition of Done
- No known critical blockers remain
- Errors are clear and recoverable
- Core flows are stable and predictable
