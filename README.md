# Web Codding AIDE

A powerful, mobile-first web IDE designed for serious developers. Code, preview, and deploy directly from your phone in landscape mode.

## Features

### Core IDE
- **Landscape-Only Interface**: Full-screen rotate prompt in portrait mode; all IDE features unlock in landscape
- **Split-Screen Editor**: Live code editor on the left with syntax highlighting, real-time preview on the right
- **Multi-File Support**: Switch between HTML, CSS, and JavaScript files with tab-based navigation
- **CodeMirror Integration**: Professional syntax highlighting with language-specific support
- **Live Preview**: Instant rendering of your code changes in a sandboxed iframe
- **Error Console**: Capture and display console logs, warnings, and runtime errors from your preview

### Developer Tools
- **Download Projects**: Export complete, self-contained HTML files with inlined CSS and JavaScript
- **GitHub Integration**: Push your code directly to GitHub repositories with token authentication
- **Backend Configuration**: Configure Firebase, Supabase, and Cloudinary credentials with code generation
- **Error Detection**: Real-time syntax and runtime error detection with inline reporting

### Mobile Optimization
- **Touch-Friendly UI**: Optimized controls and spacing for mobile devices
- **Responsive Layout**: Adapts seamlessly to different phone screen sizes in landscape
- **No Overflow**: All content remains visible without clipping or truncation
- **Smooth Scrolling**: Efficient scrolling for both editor and preview panels

## Getting Started

### Installation

```bash
cd web-codding-aide
pnpm install
pnpm dev
```

The app will start on `http://localhost:3000`.

### Usage

1. **Open the App**: Navigate to the home page and click "Launch IDE"
2. **Rotate Your Phone**: The IDE requires landscape orientation
3. **Start Coding**: Edit HTML, CSS, or JavaScript in the left panel
4. **See Changes**: The right panel updates in real-time with your code
5. **Download or Push**: Use the toolbar buttons to download or push to GitHub

## Architecture

### Frontend
- **React 19**: Modern UI framework with hooks
- **Tailwind CSS 4**: Utility-first styling with dark theme
- **CodeMirror 6**: Professional code editor with syntax highlighting
- **Wouter**: Lightweight routing for single-page app

### Backend
- **Express 4**: Lightweight web server
- **tRPC 11**: End-to-end type-safe API
- **Drizzle ORM**: Type-safe database queries
- **MySQL/TiDB**: Persistent data storage

### Key Components
- `IDE.tsx`: Main IDE page with landscape detection
- `CodeEditor.tsx`: CodeMirror-powered editor component
- `ErrorConsole.tsx`: Console output and error display
- `GitHubIntegration.tsx`: GitHub push functionality
- `BackendConfig.tsx`: Backend service configuration

## Project Structure

```
client/
  src/
    pages/
      Home.tsx          # Landing page with feature highlights
      IDE.tsx           # Main IDE interface
    components/
      CodeEditor.tsx    # CodeMirror editor
      ErrorConsole.tsx  # Console/error panel
      GitHubIntegration.tsx  # GitHub push UI
      BackendConfig.tsx # Backend config dialog
    lib/
      trpc.ts          # tRPC client setup
    App.tsx            # Main app router
    index.css          # Global styles with dark theme

server/
  routers.ts           # tRPC procedure definitions
  routers/
    github.ts          # GitHub integration router
  db.ts               # Database queries
  _core/              # Framework internals

drizzle/
  schema.ts           # Database schema
```

## Mobile Optimization

The app is built mobile-first with landscape orientation as the primary target:

- **Landscape Detection**: Automatic detection with portrait overlay prompt
- **Touch-Optimized**: Buttons and controls sized for touch interaction
- **No Truncation**: All UI elements remain fully visible on standard phone displays
- **Efficient Scrolling**: Separate scroll areas for editor, preview, and console
- **Performance**: Optimized rendering for smooth interactions on mobile devices

## Backend Integration

### Firebase
Configure Firebase credentials to use real-time database and authentication:
- API Key
- Project ID
- Database URL

### Supabase
Set up Supabase for PostgreSQL backend:
- Project URL
- Anon Key

### Cloudinary
Configure image storage and transformation:
- Cloud Name
- Upload Preset

## GitHub Integration

Push your projects to GitHub directly from the IDE:

1. Generate a personal access token at [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click the GitHub button in the IDE toolbar
3. Enter your token and repository name
4. Click "Push to GitHub"

Your code will be pushed as `index.html` to the specified repository.

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Code Style
The project uses Prettier for formatting:
```bash
pnpm format
```

## Performance Considerations

- **Large Files**: The editor handles large codebases efficiently with CodeMirror's virtual rendering
- **Live Preview**: Preview updates are optimized to prevent excessive iframe reloads
- **Console Capture**: Error console captures logs without impacting performance

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari (mobile)
- Edge

**Note**: Best experience on modern mobile browsers with landscape orientation support.

## Limitations

- **Sandbox Restrictions**: Preview iframe runs in a sandboxed environment for security
- **Local Storage**: No persistent file storage (download or push to GitHub to save)
- **External Resources**: Limited ability to load external scripts/stylesheets in preview
- **GitHub API**: Requires valid personal access token with repository permissions

## Future Enhancements

- Multi-language support (TypeScript, JSX, etc.)
- Project templates and snippets
- Collaborative editing
- Version history and undo/redo
- Advanced debugging tools
- Mobile app distribution

## License

MIT

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Web Codding AIDE** - Code anywhere, anytime, on any device.
