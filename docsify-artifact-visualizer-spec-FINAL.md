# Docsify Artifact Visualizer — Application Specification

> **Version:** 0.1.3  
> **Status:** FINAL — Implementation Ready  
> **Type:** Client-Side Single-File Web Application  

---

## Overview

The Docsify Artifact Visualizer is a zero-backend, browser-only web application that transforms raw markdown documents — particularly LLM-generated specification documents — into fully interactive, themed, responsive websites. It operates as a self-contained single HTML file that requires no server, no build process, and no installation.

The application provides three core capabilities:

- **Import** — Accept markdown from clipboard paste, file drag-and-drop, file browse, or URL fetch
- **Configure** — Select rendering presets and manage plugins via a visual plugin manager
- **Export** — Produce a standalone, self-contained HTML file embedding the content, configuration, and all required scripts

---

## Goals & Non-Goals

### Goals

- Render any LLM-generated markdown artifact with high fidelity
- Support a wide range of embedded content types: diagrams, code blocks, data tables, terminal sessions, structured data
- Enable theming via CSS custom properties and design tokens
- Allow import and export of named, versioned configuration bundles
- Work entirely offline after initial CDN load (or with self-hosted CDN mirror); exported files share the same CDN dependency as the live app
- Produce portable exported HTML files openable in any modern browser

### Non-Goals

- Server-side rendering or static site generation
- SEO optimization or crawlability
- Multi-file document management or version control
- Authentication or multi-user collaboration
- Native mobile application

---

## Application Architecture

### App Modes

The application operates in two mutually exclusive modes, controlled by a `?mode` URL parameter and `localStorage` state:

```
Mode: CONFIG (default on first load)
  ↓ content imported + Preview clicked
Mode: PREVIEW (full Docsify render, no config UI)
  ↓ Configure button clicked
Mode: CONFIG (panel restores, content persists)
```

On load, the app checks `localStorage` for a saved session. If one exists, it restores the last mode, content, and configuration automatically.

### Module Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    index.html (shell)                   │
├──────────────┬──────────────────┬───────────────────────┤
│  ImportModule│  ConfigModule    │  PreviewModule        │
│              │                  │                       │
│  Clipboard   │  PresetManager   │  DocsifyBootstrap     │
│  FileReader  │  PluginRegistry  │  CustomRenderers      │
│  FetchURL    │  TokenEditor     │  ThemeInjector        │
├──────────────┴──────────────────┴───────────────────────┤
│                    StateManager (localStorage)          │
├─────────────────────────────────────────────────────────┤
│                    ExportModule                         │
│         TemplateInjector → Blob → Download              │
└─────────────────────────────────────────────────────────┘
```

---

## User Interface

### Config Screen Layout

```
┌──────────────────────────────────────────────────────────┐
│  ⬡ Docsify Artifact Visualizer                [v0.1.0]  │
├──────────────────────┬───────────────────────────────────┤
│  IMPORT              │  CONFIGURE                        │
│                      │                                   │
│  ┌──────────────┐    │  Theme: [simple-dark       ▼]    │
│  │              │    │                                   │
│  │  Drop .md    │    │  Preset: [Spec Document    ▼]    │
│  │  or paste    │    │                                   │
│  │  (⌘V)        │    │  PLUGINS                          │
│  │              │    │  ☑ docsify-kroki    [⚙ config]   │
│  └──────────────┘    │  ☑ docsify-shiki    [⚙ config]   │
│                      │  ☑ docsify-copy-code             │
│  [📁 Browse file]    │  ☑ flexible-alerts               │
│  [🔗 Fetch URL   ]   │  ☐ docsify-termynal              │
│                      │  ☐ docsify-tabs                  │
│                      │  ───────────────────             │
│                      │  [+ Add plugin URL...]           │
│                      │                                   │
│                      │  TOKEN OVERRIDES                  │
│                      │  --theme-color: [#7c6af7    ]    │
│                      │  --content-max-width: [900px]    │
├──────────────────────┴───────────────────────────────────┤
│  [ 👁 Preview ]                    [ ⬇ Export HTML ]    │
└──────────────────────────────────────────────────────────┘
```

### Preview Screen

The preview screen is a full-viewport Docsify render. A minimal floating toolbar persists at the top:

```
┌─────────────────────────────────────────────────┐
│  [← Configure]  [↺ Reimport]  [⬇ Export HTML]  │
└─────────────────────────────────────────────────┘
[    Full Docsify document render below    ]
```

---

## Import Module

### Input Methods

All four input methods resolve to the same internal handler: `handleMarkdownContent(string)`.

#### 1. Clipboard Paste (Primary Path)

- `document` listens for `paste` event globally in Config mode
- Check `clipboardData.files[0]` first — a `.md` file copied from the filesystem
- Fall back to `clipboardData.getData("text/plain")` for raw text
- Silent, no UI interaction required beyond Ctrl/Cmd+V

#### 2. Drag and Drop

- The entire import panel acts as a drop zone
- `dragover` event: highlight drop zone border
- `drop` event: `DataTransfer.files[0]` → `FileReader.readAsText()`
- Accepts `.md`, `.txt`, `.markdown` MIME types

#### 3. File Browse

- `<input type="file" accept=".md,.txt,.markdown">` triggered by a styled button
- `FileReader.readAsText()` on selected file

#### 4. URL Fetch

- `<input type="url">` + Fetch button
- `fetch(url)` → `.text()` on response
- On CORS failure: display inline warning with link to CORS proxy option
- Respects `Content-Type: text/markdown` or treats any text response as markdown

### Content Handling

```js
function handleMarkdownContent(rawText) {
  state.content = rawText;
  state.contentMeta = {
    source: "paste" | "file" | "url",
    filename: string | null,
    importedAt: ISO8601 timestamp,
    byteLength: number
  };
  localStorage.setItem("avz_content", rawText);
  localStorage.setItem("avz_meta", JSON.stringify(state.contentMeta));
  ui.showContentPreview(rawText.slice(0, 500)); // first 500 chars as preview
  ui.enablePreviewButton();
}
```

---

## Configuration Module

### State Shape

The entire application configuration is a single serializable JSON object:

```json
{
  "version": "1",
  "preset": "spec-doc",
  "theme": "simple-dark",
  "docsify": {
    "name": "Artifact Viewer",
    "loadSidebar": false,
    "subMaxLevel": 3,
    "coverpage": false
  },
  "plugins": [
    {
      "id": "kroki",
      "cdn": "https://cdn.jsdelivr.net/npm/docsify-kroki/dist/docsify-kroki.min.js",
      "enabled": true,
      "config": { "serverPath": "https://kroki.io/" }
    }
  ],
  "customRenderers": ["tree", "csv", "http", "diff"],
  "tokens": {
    "--theme-color": "#7c6af7",
    "--content-max-width": "900px",
    "--base-font-family": "Inter, system-ui"
  }
}
```

This config object:
- Persists to `localStorage` on every change
- Is embedded verbatim as an HTML comment in exported files
- Can be copy-pasted and re-imported to restore sessions

### Preset Bundles

| Preset ID | Label | Key Plugins | Use Case |
|---|---|---|---|
| `spec-doc` | Specification Document | kroki, shiki, copy-code, flex-alerts, tabs | LLM-generated specs |
| `api-doc` | API Reference | kroki, shiki, copy-code | REST/OpenAPI docs |
| `architecture` | Architecture / C4 | kroki, shiki, copy-code, drawio | System design docs |
| `data-report` | Data Report | kroki, shiki, copy-code, tabs | Analysis outputs |
| `dev-journal` | Dev Journal / Log | shiki, copy-code, termynal, flex-alerts | Engineering logs |
| `minimal` | Minimal Reading | shiki, copy-code | Plain prose documents |

### Plugin Registry

Each entry in the plugin registry defines:

```ts
interface PluginRegistryEntry {
  id: string;
  label: string;
  description: string;
  cdn: string;                        // jsdelivr or unpkg URL
  configSchema?: Record<string, {     // generates per-plugin config UI
    type: "string" | "select" | "boolean";
    label: string;
    default: unknown;
    options?: string[];               // for type: "select"
  }>;
  conflictsWith?: string[];           // IDs that cannot coexist
  tags: string[];                     // "diagrams" | "code" | "layout" | "ux"
  verified: boolean;                  // true = ships with the app
}
```

### Built-in Plugin Registry

| ID | Label | Tags | CDN |
|---|---|---|---|
| `kroki` | Docsify Kroki | diagrams, visualization | jsdelivr |
| `shiki` | Docsify Shiki | code, highlighting | jsdelivr |
| `copy-code` | Copy Code | ux, code | jsdelivr |
| `flex-alerts` | Flexible Alerts | layout, callouts | jsdelivr |
| `tabs` | Docsify Tabs | layout | jsdelivr |
| `termynal` | Termynal | code, terminal | jsdelivr |
| `drawio` | Docsify Draw.io | diagrams | jsdelivr |
| `pagination` | Pagination | navigation | jsdelivr |
| `zoom-image` | Image Zoom | ux, media | jsdelivr |

### Custom Plugin Import

1. User pastes any CDN URL into the "Add plugin URL" field
2. Script is loaded into a sandboxed `<iframe>`
3. Verifier checks if `window.$docsify.plugins` array grew after load
4. **Pass:** plugin added with `verified: false` badge
5. **Fail:** inline warning shown; user can force-add anyway
6. Unverified plugins receive a visual warning in the plugin list and a comment in the HTML export

---

## Rendering Module

### Docsify Bootstrap

In Preview mode, a Docsify instance is initialized with a router override that serves the markdown content directly from memory. This avoids any need for a file server or standard Docsify routing.

```js
window.$docsify = {
  ...state.config.docsify,
  plugins: [
    {
      init(hook, vm) {
        // Override the router fetch to serve content from memory
        vm.router.fetch = (path) => {
          if (path === '/README.md') {
            return Promise.resolve(state.content);
          }
          return Promise.reject(new Error('Not Found'));
        };
      }
    },
    ...loadedPlugins
  ]
};
```

### Custom Renderer Layer

A custom `markdown.renderer.code` function runs before Kroki and Shiki. It dispatches on the fence language to specialized renderers:

| Fence Language | Renderer | Output |
|---|---|---|
| `tree`, `dir` | `TreeRenderer` | Styled monospace directory tree card |
| `csv`, `tsv` | `TableRenderer` | Sortable HTML `<table>` |
| `http` | `HttpRenderer` | Color-coded HTTP request/response block |
| `diff` | `DiffRenderer` | Green/red line diff with +/- indicators |
| `json`, `yaml`, `toml` | `DataRenderer` | Collapsible JSON/YAML tree view |
| `mermaid`, `plantuml`, `d2`, `vega`, etc. | → docsify-kroki | SVG diagram |
| All other langs | → docsify-shiki | Syntax-highlighted code block |

Unknown fence languages fall through to Shiki with best-effort language detection.

### Heading-Based Navigation

Docsify's `subMaxLevel` config controls sidebar depth:

- `##` headings → top-level sidebar entries (pages)
- `###` headings → nested sidebar entries (sections)
- `####` and below → in-page anchor links only, not in sidebar

The sidebar is auto-generated from the heading tree with no manual `_sidebar.md` required when `loadSidebar: false`.

### Mermaid Theme Integration

When Kroki is configured to use its hosted Mermaid renderer, theme tokens are passed through:

```js
kroki: {
  serverPath: state.config.kroki.serverPath,
  mermaidConfig: {
    theme: "base",
    themeVariables: {
      primaryColor: state.config.tokens["--theme-color"],
      fontFamily: state.config.tokens["--base-font-family"]
    }
  }
}
```

---

## Theming System

### Token Architecture

All visual properties are defined as CSS custom properties in a dedicated `:root` block. Three layers apply in order:

```
1. docsify-themeable base theme    (provides all defaults)
2. preset token block              (preset-specific overrides)  
3. user token overrides            (per-session customization)
```

### Core Token Set

```css
:root {
  /* Typography */
  --base-font-family: 'Inter', system-ui, sans-serif;
  --base-font-size: 16px;
  --base-line-height: 1.7;
  --mono-font-family: 'JetBrains Mono', monospace;
  --heading-font-weight: 600;

  /* Color */
  --theme-color: #7c6af7;
  --background: #0f0f13;
  --sidebar-background: #13131a;
  --color-surface: #1a1a24;
  --color-muted: #888899;

  /* Layout */
  --content-max-width: 900px;
  --sidebar-width: 260px;
  --spacing-section: 3rem;

  /* Blocks */
  --code-block-radius: 6px;
  --code-font-size: 0.875em;
  --blockquote-border-color: var(--theme-color);
}
```

### Theme Presets

| Theme ID | Base | Accent | Best For |
|---|---|---|---|
| `simple-dark` | #0f0f13 | #7c6af7 | Default, specs |
| `simple-light` | #ffffff | #2563eb | Sharing/printing |
| `nord` | #2e3440 | #88c0d0 | Dev journals |
| `github-dark` | #0d1117 | #58a6ff | API docs |
| `solarized` | #002b36 | #268bd2 | Data reports |

---

## Export Module
### Final Export Model

The app uses a **self-replicating export model**. There is no template file or separate export build process. The exported file is a binary clone of the live app, with a `<script id="avz-seed">` block prepended to the head. This seed script hydrates the browser's `localStorage` with the markdown and config JSON on load. Opening an exported file provides the full app experience: the content is pre-loaded, the configuration is applied, and the user has full access to the Config UI and Re-export functionality.

The app and its exports are the **same file**. Exporting produces a clone of `index.html` with a pre-seed script injected that hydrates `localStorage` with the current content and config when the file is opened. The recipient gets the full app — config UI, plugin manager, preview mode, and the ability to re-export.

### Self-Replicating Model

```
index.html (live app)
  └─ Export clicked
       └─ Clone of index.html
            └─ + injected <script id="avz-seed"> in <head>
                 ├─ Full markdown content (inline string literal)
                 ├─ Full config JSON (inline object)
                 ├─ mode: "preview"
                 └─ SEED_ID: export timestamp (collision guard)
```

There is no separate export template. `APP_SOURCE` is a constant string baked into `index.html` at build time containing the full app source. The export function performs string manipulation on this constant and triggers a download.

### Seed Script

```html
<script id="avz-seed">
  (function() {
    const SEED_ID = "{{ISO_TIMESTAMP}}";
    if (localStorage.getItem("avz_seed_id") !== SEED_ID) {
      localStorage.setItem("avz_content", `{{ESCAPED_MARKDOWN}}`);
      localStorage.setItem("avz_config",  JSON.stringify({{CONFIG_OBJECT}}));
      localStorage.setItem("avz_mode",    "preview");
      localStorage.setItem("avz_seed_id", SEED_ID);
    }
  })();
</script>
```

The `SEED_ID` guard ensures the most recently opened export always wins. If the recipient opens a different exported file afterward, its seed replaces the previous session. If they reopen the same file, the seed is skipped and their modified session persists.

### Export Pipeline

```
1. Generate SEED_ID        → new Date().toISOString()
2. Escape markdown         → safe JS template literal string
3. Serialize config        → JSON.stringify(state.config)
4. Build seed script block → IIFE with inline content + config + SEED_ID
5. Clone APP_SOURCE        → insert seed block as first <script> in <head>
6. Blob(html, "text/html") → URL.createObjectURL() → <a download="spec.html">.click()
```

No fetch, no async, no template file. The entire export function is ~30 lines of synchronous string manipulation.

### Re-Export Chain

Any exported file is a full app instance. The recipient can:
1. Open the exported `.html` file — boots directly into Preview mode
2. Click "← Configure" — full config UI available with their content loaded
3. Modify plugins, tokens, or reimport new content
4. Export again — produces a new clone with their changes embedded

Each export in the chain is independent and self-contained.

### localStorage Keys Added for Export

| Key | Value |
|---|---|
| `avz_seed_id` | ISO timestamp of export — collision guard |
| `avz_content` | Full markdown string |
| `avz_config` | Config JSON string |
| `avz_mode` | `"preview"` — exported files open in preview by default |

---

## State Management

### localStorage Keys

| Key | Type | Description |
|---|---|---|
| `avz_content` | string | Raw markdown content |
| `avz_config` | JSON string | Full config object |
| `avz_meta` | JSON string | Import metadata (source, filename, timestamp) |
| `avz_mode` | `"config"` \| `"preview"` | Last active mode |
| `avz_custom_plugins` | JSON string | User-added unverified plugin entries |

### Session Lifecycle

```
App open
  ├── avz_content exists?
  │     ├── YES + avz_mode === "preview" → boot Docsify directly
  │     └── YES + avz_mode === "config"  → restore config UI with content loaded
  └── NO → show fresh Config screen with demo content loaded
```

### Demo Content

On first load with no saved session, the app loads a built-in `demo.md` that showcases every supported renderer:

- A Mermaid flowchart
- A PlantUML sequence diagram
- A `tree` block (directory structure)
- A `csv` block (rendered as a table)
- A `termynal` block (terminal animation)
- Flexible alert callouts (`NOTE`, `TIP`, `WARNING`, `DANGER`)
- Tabbed content sections
- Code blocks in 3+ languages
- An image with caption

This serves as both a feature demonstration and a renderer regression test.

---

## File Structure

```
docsify-artifact-visualizer/
├── index.html              # Single deployable file (config + preview modes)
├── src/
│   ├── shell.js            # App bootstrap, mode switching, state init
│   ├── import.js           # All four import paths
│   ├── config-ui.js        # Preset picker, plugin manager, token editor
│   ├── plugin-registry.js  # Built-in plugin definitions
│   ├── presets.js          # Named preset bundles
│   ├── preview.js          # Docsify init, virtual FS, plugin loader
│   ├── renderers/
│   │   ├── tree.js         # Directory tree renderer
│   │   ├── csv.js          # CSV/TSV → table renderer
│   │   ├── http.js         # HTTP block renderer
│   │   ├── diff.js         # Diff block renderer
│   │   └── data.js         # JSON/YAML/TOML collapsible tree
│   ├── export.js           # HTML export pipeline
│   ├── themes.js           # Theme token definitions
│   └── demo.md             # Built-in demo content
├── styles/
│   ├── config-ui.css       # Config screen styles
│   ├── renderers.css       # Custom renderer block styles
│   └── tokens.css          # Base token definitions
└── build.js                # (optional) inlines src/ into single index.html
```

The `build.js` step concatenates and inlines all `src/` modules into `index.html` to produce a single deployable file. For development, ES modules loaded locally work without a build step via `file://` or any static server.

---

## Technical Constraints

- **No framework** — vanilla JS only; no React, Vue, or Svelte dependency
- **No build required** to deploy or use (build is optional for distribution)
- **No server required** — works from `file://` protocol or any static host
- **ES2020+ target** — use native `async/await`, optional chaining, `fetch`, `Blob`, `URL.createObjectURL`
- **No cookies** — all persistence via `localStorage` only
- **CSP-friendly** — no `eval()`, no `document.write()`; dynamic scripts loaded via `<script src>` injection only
- **Graceful degradation** — if a plugin CDN URL fails to load, the rest of the render continues with a console warning

---

## Resolved Design Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Offline / air-gapped export | **No** — exports retain CDN script links; no JS inlining |
| 2 | Kroki server URL field | **Yes** — config UI exposes a Kroki server URL field defaulting to `https://kroki.io/` |
| 3 | Multi-document support | **No** — single document per session; scope is intentionally constrained |
| 4 | Config sharing via URL hash | **No** — config is local only; no URL-encoded sharing |
| 5 | Token editor depth | **8 most impactful tokens** exposed by default with an "Advanced" expander for the full set |

### Kroki Server URL Field

The Kroki server URL is surfaced as a first-class field in the plugin config panel for the `kroki` plugin entry — not buried in advanced settings. It defaults to `https://kroki.io/` but accepts any valid URL pointing at a self-hosted Kroki instance:

```
DIAGRAMS
☑ docsify-kroki    [⚙ configure ▾]
  └─ Kroki server URL: [https://kroki.io/        ] [Test connection]
```

A **"Test connection"** button fires a lightweight probe request (`GET /health` or a minimal diagram render) and shows a ✓ or ✗ inline. This is especially useful for self-hosted homelab deployments where the server URL may vary per environment.

### Token Editor — 8 Core Tokens

The default token editor exposes exactly these eight properties:

| Token | Label | Control Type |
|---|---|---|
| `--theme-color` | Accent color | Color picker |
| `--background` | Page background | Color picker |
| `--sidebar-background` | Sidebar background | Color picker |
| `--base-font-family` | Body font | Text input |
| `--mono-font-family` | Monospace font | Text input |
| `--base-font-size` | Base font size | Range slider (12–20px) |
| `--content-max-width` | Content max width | Range slider (600–1400px) |
| `--sidebar-width` | Sidebar width | Range slider (180–360px) |

The **"Advanced ▾"** expander reveals the remaining ~32 docsify-themeable variables grouped by category: Typography, Colors, Spacing, Code Blocks, Sidebar, Navbar, Tables, Blockquotes. All values are editable as raw text inputs in advanced mode.
