$ErrorActionPreference = "Stop"

if (-not (Test-Path "package.json")) {
  throw "Run this inside the the-mirror folder (where package.json exists)."
}

$dirs = @(
  "src","src/styles","src/types","src/state","src/storage","src/services","src/components","src/screens","tests","public"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

function Write-File($path, $content) {
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Set-Content -Path $path -Value $content -Encoding UTF8
}

Write-File "package.json" @"
{
  "name": "the-mirror",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
"@

Write-File "vite.config.ts" @"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
"@

Write-File "vitest.config.ts" @"
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom"
  }
});
"@

Write-File "tsconfig.json" @"
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"]
}
"@

Write-File "tsconfig.node.json" @"
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
"@

Write-File "index.html" @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Mirror</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@

Write-File "src/main.tsx" @"
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@

Write-File "src/styles/global.css" @"
:root {
  --bg: #000000;
  --text: #f2f0e9;
  --muted: rgba(242, 240, 233, 0.7);
  --gold: #bfa45a;
  --card: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.10);

  --radius: 16px;
  --pad: 18px;
  --max: 560px;
  --tap: 48px;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  height: 100%;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

a { color: inherit; }
* { box-sizing: border-box; }

.container {
  max-width: var(--max);
  margin: 0 auto;
  padding: 18px 16px 28px;
}

h1 {
  margin: 10px 0 18px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.small {
  font-size: 13px;
  color: var(--muted);
}

.hr {
  height: 1px;
  background: var(--border);
  margin: 14px 0;
}

.accent { color: var(--gold); }
"@

# ---- Minimal MVP app code (enough to compile and run) ----
# If you want the full strict file tree content next, say: "expand generator to full spec"
Write-File "src/state/screens.ts" @"
export enum Screen {
  HOME = "HOME",
  CHECK = "CHECK"
}
"@

Write-File "src/App.tsx" @"
import { useState } from "react";
import { Screen } from "./state/screens";

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);

  return (
    <div className="container">
      <h1>The Mirror</h1>
      {screen === Screen.HOME ? (
        <>
          <p className="small">Boot OK. Next step: generate full screens/services.</p>
          <button onClick={() => setScreen(Screen.CHECK)}>Check State</button>
        </>
      ) : (
        <>
          <p className="small">Check screen placeholder.</p>
          <button onClick={() => setScreen(Screen.HOME)}>Back</button>
        </>
      )}
    </div>
  );
}
"@

if (-not (Test-Path "public/ambient.mp3")) {
  New-Item -ItemType File -Force -Path "public/ambient.mp3" | Out-Null
}

Write-Host "✅ Base files generated."
Write-Host "Next:"
Write-Host "  npm install"
Write-Host "  npm run dev -- --host 0.0.0.0 --port 3000"
