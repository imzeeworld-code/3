# Web Coding AIDE

  A powerful, mobile-first web development IDE that runs entirely in your browser.

  ## Features

  - **Split-screen editor + live preview** — Code on the left, see results instantly on the right
  - **Multi-file support** — HTML, CSS, JavaScript, TypeScript, JSON, Markdown tabs
  - **Syntax highlighting** — Language-aware coloring for all supported file types
  - **Auto-complete** — Smart suggestions as you type
  - **Error detection** — Real-time syntax error checking with line numbers
  - **Download HTML** — Export your full project as a single `index.html` file
  - **GitHub integration** — Push/pull files to any GitHub repository using a personal access token
  - **Drag & Drop** — Drop files directly into the editor to open them
  - **Mobile-optimized** — Designed for phone use in landscape mode
  - **Landscape rotation prompt** — Asks users to rotate their phone for the best experience
  - **Font size controls** — A- / A+ buttons to adjust code font size
  - **Line numbers** — Toggle line numbers on/off
  - **Auto-refresh preview** — Preview updates as you type (with debounce)
  - **Local persistence** — Your code is saved to browser localStorage automatically

  ## Supported Languages

  | Language | Extension | Features |
  |----------|-----------|---------|
  | HTML | .html | Tag highlighting, attribute colors, doctype detection |
  | CSS | .css | Property/value/selector highlighting |
  | JavaScript | .js | Keyword, string, function highlighting |
  | TypeScript | .ts/.tsx | Full JS highlighting + TS keywords |
  | JSON | .json | Key/value color coding + live validation |
  | Markdown | .md | Basic rendering |

  ## GitHub Integration

  1. Click **GitHub** in the toolbar
  2. Enter your Personal Access Token (with `repo` scope)
  3. Enter your repository name (`username/repo-name` or full GitHub URL)
  4. Browse and load files, or push your current files to the repo
  5. Get your GitHub Pages live URL automatically

  ## Download

  - **Download `filename`** — Downloads the current open file
  - **Download HTML** — Bundles ALL your files (HTML + CSS + JS) into one portable `index.html`

  ## Mobile Use

  This app is designed for mobile phones. For the best experience:
  - Rotate your phone to **landscape mode**
  - The split view gives you the editor on the left and preview on the right
  - Drag the divider between panels to resize
  - Use touch to scroll inside each panel

  ## Tech Stack

  - React + TypeScript + Vite
  - Tailwind CSS
  - Custom syntax highlighter (no external parser dependencies)
  - GitHub REST API v3
  - localStorage for persistence
  - Blob URLs for live preview iframe

  ## License

  MIT
  