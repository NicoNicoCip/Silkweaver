# Web Installer

## File Structure
```
packages/installer/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── VersionSelector.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── ProgressBar.tsx
│   │   └── OutputDisplay.tsx
│   ├── services/
│   │   ├── github-api.ts
│   │   ├── version-manifest.ts
│   │   └── project-generator.ts
│   └── utils/
│       └── zip.ts
└── index.html
```

## Installer Flow

### 1. Welcome Screen
- Introduction to PaperCrane
- "Create New Project" button

### 2. Version Selection
- Engine version dropdown (from manifest)
- Shows latest version by default
- Release notes for each version

### 3. Template Selection
- Choose template or blank project
- Template preview/description
- Templates: Platformer, Top-down, Shooter, Puzzle, RPG

### 4. Configuration
- Project name
- Project location (download folder)
- Additional settings

### 5. Download
- Fetch engine from GitHub `engine` branch
- Fetch template from `template/[name]` branch
- Progress indicator

### 6. Assembly
- Combine engine + template
- Validate compatibility
- Generate project.json

### 7. Complete
- "Open in IDE" button
- "Download ZIP" button
- Project location info

## Version Manifest

**File**: `version-manifest.json` (hosted in main branch)

```json
{
  "schemaVersion": 1,
  "engine": {
    "latest": "1.0.0",
    "versions": [
      {
        "version": "1.0.0",
        "branch": "engine",
        "tag": "v1.0.0",
        "minInstaller": "1.0.0",
        "releaseDate": "2026-01-15",
        "notes": "Initial stable release"
      },
      {
        "version": "0.9.0",
        "branch": "engine",
        "tag": "v0.9.0",
        "minInstaller": "0.9.0",
        "releaseDate": "2026-01-01",
        "notes": "Beta release"
      }
    ]
  },
  "templates": {
    "platformer": {
      "name": "Platformer",
      "description": "Side-scrolling platformer with movement and collision",
      "latest": "1.0.0",
      "versions": [
        {
          "version": "1.0.0",
          "branch": "template/platformer",
          "engineRange": ">=1.0.0 <2.0.0"
        }
      ]
    },
    "top-down": {
      "name": "Top-Down Adventure",
      "description": "8-directional movement with room transitions",
      "latest": "1.0.0",
      "versions": [
        {
          "version": "1.0.0",
          "branch": "template/top-down",
          "engineRange": ">=1.0.0 <2.0.0"
        }
      ]
    },
    "shooter": {
      "name": "Space Shooter",
      "description": "Bullets, enemies, and scoring system",
      "latest": "1.0.0",
      "versions": [
        {
          "version": "1.0.0",
          "branch": "template/shooter",
          "engineRange": ">=1.0.0 <2.0.0"
        }
      ]
    },
    "puzzle": {
      "name": "Puzzle Game",
      "description": "Grid-based matching and timers",
      "latest": "1.0.0",
      "versions": [
        {
          "version": "1.0.0",
          "branch": "template/puzzle",
          "engineRange": ">=1.0.0 <2.0.0"
        }
      ]
    },
    "rpg": {
      "name": "Simple RPG",
      "description": "Stats, inventory, and dialogue",
      "latest": "1.0.0",
      "versions": [
        {
          "version": "1.0.0",
          "branch": "template/rpg",
          "engineRange": ">=1.0.0 <2.0.0"
        }
      ]
    }
  }
}
```

## Compatibility Validation

**Strict validation** - blocks incompatible combinations

```typescript
import * as semver from 'semver';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateCompatibility(
  engineVersion: string,
  templateName: string,
  templateVersion: string,
  manifest: VersionManifest
): ValidationResult {
  const template = manifest.templates[templateName];
  const templateConfig = template.versions.find(
    v => v.version === templateVersion
  );

  if (!templateConfig) {
    return {
      valid: false,
      error: `Template version ${templateVersion} not found`
    };
  }

  if (!semver.satisfies(engineVersion, templateConfig.engineRange)) {
    return {
      valid: false,
      error: `Template requires engine ${templateConfig.engineRange}, but ${engineVersion} was selected`
    };
  }

  return { valid: true };
}
```

## GitHub API Integration

```typescript
async function fetchBranchContents(
  owner: string,
  repo: string,
  branch: string
): Promise<FileTree> {
  // Use GitHub API to get branch contents
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  return response.json();
}

async function downloadFile(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
  );
  return response.arrayBuffer();
}
```

## Project Generation

```typescript
async function generateProject(
  engineVersion: string,
  templateName: string | null,
  projectName: string
): Promise<Blob> {
  // 1. Download engine files
  const engineFiles = await downloadBranch('engine', `v${engineVersion}`);

  // 2. Download template files (if selected)
  let templateFiles = {};
  if (templateName) {
    templateFiles = await downloadBranch(`template/${templateName}`);
  }

  // 3. Merge files (template overwrites engine defaults)
  const projectFiles = { ...engineFiles, ...templateFiles };

  // 4. Generate project.json
  projectFiles['project.json'] = JSON.stringify({
    name: projectName,
    version: '1.0.0',
    engineVersion,
    // ... other settings
  });

  // 5. Create ZIP
  const zip = new JSZip();
  for (const [path, content] of Object.entries(projectFiles)) {
    zip.file(path, content);
  }

  return zip.generateAsync({ type: 'blob' });
}
```
