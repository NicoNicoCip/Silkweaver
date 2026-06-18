#!/usr/bin/env node
/**
 * Generates the Silkweaver API reference as a single self-contained HTML file,
 * derived from the engine's real public API + JSDoc — so the docs can never drift
 * from the code (the same principle as the generated editor types).
 *
 * How it works:
 *   1. Emit the engine's .d.ts (which preserves JSDoc) to a temp dir.
 *   2. Parse each declaration with the TypeScript compiler API, extracting the
 *      signature, description, @param and @returns, for functions, constants,
 *      enums, and exported classes (+ their public methods).
 *   3. Categorise by source module and emit a searchable, hash-routed HTML page.
 *
 * Run via `npm run gen:docs`. Output: docs/api/index.html
 */

const fs   = require('node:fs')
const path = require('node:path')
const os   = require('node:os')
const { execFileSync } = require('node:child_process')
const ts   = require('typescript')

const ROOT       = path.resolve(__dirname, '..')
const ENGINE_TSC = path.join(ROOT, 'packages', 'engine', 'tsconfig.json')
const OUT_FILE   = path.join(ROOT, 'docs', 'api', 'index.html')

const CATEGORY_NAMES = {
    core: 'Core', drawing: 'Drawing', audio: 'Audio', physics: 'Physics',
    input: 'Input', data: 'Data Structures', storage: 'Storage & Files',
    math: 'Maths, Strings & Random', networking: 'Networking', particles: 'Particles',
    '3d': '3D', collision: 'Collision', utils: 'Utilities',
}

// --- Markdown (minimal) + guides -----------------------------------------

function md2html(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n')
    const inline = (s) => esc(s)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    let html = '', i = 0
    while (i < lines.length) {
        const line = lines[i]
        if (/^```/.test(line)) {
            i++; let code = ''
            while (i < lines.length && !/^```/.test(lines[i])) { code += lines[i] + '\n'; i++ }
            i++
            html += '<pre class="code">' + esc(code.replace(/\n$/, '')) + '</pre>'
            continue
        }
        const h = line.match(/^(#{1,4})\s+(.*)$/)
        if (h) { const n = h[1].length; html += `<h${n}>${inline(h[2])}</h${n}>`; i++; continue }
        if (/^\s*[-*]\s+/.test(line)) {
            html += '<ul>'
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { html += '<li>' + inline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>'; i++ }
            html += '</ul>'; continue
        }
        if (line.trim() === '') { i++; continue }
        let para = line; i++
        while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|```|\s*[-*]\s)/.test(lines[i])) { para += ' ' + lines[i]; i++ }
        html += '<p>' + inline(para) + '</p>'
    }
    return html
}

function read_guides() {
    const dir = path.join(ROOT, 'docs', 'guides')
    if (!fs.existsSync(dir)) return []
    const out = []
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.md')).sort()) {
        const md = fs.readFileSync(path.join(dir, f), 'utf8')
        const m = md.match(/^#\s+(.+)$/m)
        const title = (m ? m[1] : f.replace(/\.md$/, '')).trim()
        out.push({ name: title, kind: 'guide', category: 'Guides', module: 'docs/guides/' + f, html: md2html(md) })
    }
    return out
}

// --- JSDoc helpers --------------------------------------------------------

function flatten_comment(c) {
    if (!c) return ''
    if (typeof c === 'string') return c.trim()
    return c.map(part => part.text ?? '').join('').trim()
}

function doc_info(node) {
    const docs = ts.getJSDocCommentsAndTags(node)
    let description = '', returns = ''
    const params = [], examples = []
    const handle_tag = (tag) => {
        if (ts.isJSDocParameterTag(tag)) params.push({ name: tag.name?.getText() ?? '', desc: flatten_comment(tag.comment).replace(/^[-—]\s*/, '') })
        else if (ts.isJSDocReturnTag(tag)) returns = flatten_comment(tag.comment)
        else if (tag.tagName && tag.tagName.escapedText === 'example') { const t = flatten_comment(tag.comment); if (t) examples.push(t) }
    }
    for (const d of docs) {
        if (ts.isJSDoc(d)) {
            if (!description) description = flatten_comment(d.comment)
            for (const t of d.tags ?? []) handle_tag(t)
        } else {
            handle_tag(d)
        }
    }
    return { description, params, returns, examples }
}

function clean_sig(text) {
    return text
        .replace(/^export\s+declare\s+/, '')
        .replace(/^export\s+/, '')
        .replace(/^declare\s+/, '')
        .replace(/\s*\{[\s\S]*$/, '')   // drop any trailing class/enum body
        .replace(/;\s*$/, '')
        .trim()
}

// --- Extraction -----------------------------------------------------------

const entries = []   // { name, kind, category, module, signature, description, params, returns, member_of? }

function add_entry(e) { entries.push(e) }

function extract_from(sf, category, moduleName) {
    sf.forEachChild(node => {
        const mods = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : []
        const exported = mods.some(m => m.kind === ts.SyntaxKind.ExportKeyword)

        if (ts.isFunctionDeclaration(node) && node.name && exported) {
            add_entry({ name: node.name.text, kind: 'function', category, module: moduleName,
                signature: clean_sig(node.getText()), ...doc_info(node) })
        } else if (ts.isVariableStatement(node) && exported) {
            for (const decl of node.declarationList.declarations) {
                if (ts.isIdentifier(decl.name)) {
                    add_entry({ name: decl.name.text, kind: 'constant', category, module: moduleName,
                        signature: clean_sig(node.getText()), ...doc_info(node) })
                }
            }
        } else if (ts.isEnumDeclaration(node) && exported) {
            add_entry({ name: node.name.text, kind: 'enum', category, module: moduleName,
                signature: `enum ${node.name.text}`, ...doc_info(node) })
        } else if (ts.isClassDeclaration(node) && node.name && exported) {
            const className = node.name.text
            add_entry({ name: className, kind: 'class', category, module: moduleName,
                signature: `class ${className}`, ...doc_info(node) })
            for (const member of node.members) {
                const mmods = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : []
                const isPrivate = mmods.some(m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)
                const isStatic  = mmods.some(m => m.kind === ts.SyntaxKind.StaticKeyword)
                if (isPrivate) continue
                if ((ts.isMethodDeclaration(member) || ts.isGetAccessor(member)) && member.name && ts.isIdentifier(member.name)) {
                    const mname = member.name.text
                    if (mname.startsWith('_')) continue
                    add_entry({ name: mname, kind: isStatic ? 'static method' : 'method', category,
                        module: moduleName, member_of: className,
                        signature: clean_sig(member.getText()), ...doc_info(member) })
                }
            }
        }
    })
}

// --- Emit .d.ts then parse ------------------------------------------------

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-docs-'))
try {
    execFileSync('npx', ['tsc', '-p', ENGINE_TSC, '--declaration', '--emitDeclarationOnly', '--outDir', tmp], {
        cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32',
    })

    const files = []
    const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name)
            if (e.isDirectory()) walk(p)
            else if (e.name.endsWith('.d.ts')) files.push(p)
        }
    }
    walk(tmp)
    files.sort()

    for (const f of files) {
        const rel = path.relative(tmp, f).replace(/\\/g, '/')
        if (rel === 'index.d.ts') continue
        const topDir = rel.includes('/') ? rel.split('/')[0] : 'core'
        const category = CATEGORY_NAMES[topDir] ?? (topDir[0].toUpperCase() + topDir.slice(1))
        const moduleName = rel.replace(/\.d\.ts$/, '')
        const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.ES2020, true)
        extract_from(sf, category, moduleName)
    }

    // De-dupe API entries (re-exports can repeat a name).
    const seen = new Set()
    const api = entries.filter(e => {
        const key = (e.member_of ?? '') + '.' + e.name + '.' + e.kind
        if (seen.has(key)) return false
        seen.add(key); return true
    }).sort((a, b) => a.name.localeCompare(b.name))

    // Hand-written guides lead; then the generated API. Assign stable hash ids.
    const all = [...read_guides(), ...api]
    for (const e of all) {
        e.id = e.kind === 'guide'
            ? 'guide-' + e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            : (e.member_of ? e.member_of + '.' : '') + e.name
    }

    const html = render_html(all)
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
    fs.writeFileSync(OUT_FILE, html, 'utf8')

    const byCat = {}
    for (const e of all) byCat[e.category] = (byCat[e.category] ?? 0) + 1
    const guideCount = all.filter(e => e.kind === 'guide').length
    console.log(`[gen:docs] wrote ${path.relative(ROOT, OUT_FILE)} — ${all.length} entries (${guideCount} guides) across ${Object.keys(byCat).length} categories`)
} finally {
    fs.rmSync(tmp, { recursive: true, force: true })
}

// --- HTML rendering -------------------------------------------------------

function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function render_html(data) {
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Silkweaver API Reference</title>
<script>document.documentElement.dataset.theme = localStorage.getItem('sw-docs-theme') || 'dark'</script>
<style>
  /* Windows-desktop help-viewer styling — flat, Segoe UI. Dark (default) + light themes. */
  :root{
    --win:#0078d7;--win-dark:#005a9e;
    --bg:#f0f0f0;--side:#fafafa;--content:#ffffff;--fg:#1f1f1f;--muted:#6e6e6e;--border:#d4d4d4;
    --hover:#e5f1fb;--sel:#cce8ff;
    --topbar-bg:#0078d7;--topbar-fg:#ffffff;
    --search-bg:#ffffff;--search-fg:#1f1f1f;--search-border:#ffffff;
    --link:#0066cc;--codebg:#f6f6f6;--codefg:#0a3d62;--code-inline:#ececec;--title:#103a5c;--th-bg:#eef1f4;
    --kindbg:#0078d7;--kindfg:#ffffff;
  }
  :root[data-theme="dark"]{
    --win:#2b88d8;--win-dark:#1b6ec2;
    --bg:#1b1b1b;--side:#252526;--content:#1e1e1e;--fg:#e4e4e4;--muted:#9a9a9a;--border:#3a3a3a;
    --hover:#2a2d2e;--sel:#094771;
    --topbar-bg:#2d2d30;--topbar-fg:#ffffff;
    --search-bg:#3c3c3c;--search-fg:#e4e4e4;--search-border:#5a5a5a;
    --link:#4cc2ff;--codebg:#181818;--codefg:#9cdcfe;--code-inline:#333333;--title:#cfe0ff;--th-bg:#2d2d30;
    --kindbg:#0e639c;--kindfg:#ffffff;
  }
  *{box-sizing:border-box}
  body{margin:0;height:100vh;display:flex;flex-direction:column;background:var(--bg);color:var(--fg);
    font:14px/1.55 "Segoe UI",Tahoma,Geneva,Verdana,sans-serif}
  a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}
  code{font-family:Consolas,"Courier New",monospace;background:var(--code-inline);padding:0 3px}
  /* top toolbar */
  #topbar{display:flex;align-items:center;gap:12px;height:46px;flex:0 0 46px;background:var(--topbar-bg);color:var(--topbar-fg);padding:0 14px;user-select:none}
  #title{font-size:16px;font-weight:600}#title span{font-weight:400;opacity:.85}
  #search{margin-left:auto;width:280px;height:28px;padding:0 9px;border:1px solid var(--search-border);background:var(--search-bg);color:var(--search-fg);font-size:13px;font-family:inherit}
  #search:focus{outline:none;box-shadow:0 0 0 2px var(--win-dark)}
  #theme{height:28px;padding:0 12px;border:1px solid rgba(255,255,255,.45);background:transparent;color:var(--topbar-fg);font:13px "Segoe UI",sans-serif;cursor:pointer}
  #theme:hover{background:rgba(255,255,255,.14)}
  /* body split */
  #body{flex:1;display:flex;min-height:0}
  #side{width:300px;flex:0 0 300px;background:var(--side);border-right:1px solid var(--border);overflow:auto}
  #nav{padding:4px 0 24px}
  .cat>h3{margin:12px 12px 2px;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted)}
  .cat a{display:block;padding:3px 12px 3px 18px;color:var(--fg);font-family:Consolas,"Courier New",monospace;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid transparent;cursor:pointer}
  .cat a:hover{background:var(--hover)}
  .cat a.active{background:var(--sel);border-color:var(--win)}
  .cat a .mo{color:var(--muted)}
  /* content */
  #main{flex:1;overflow:auto;background:var(--content);padding:22px 34px 64px}
  #content{max-width:860px}
  h2.entry{font-family:Consolas,"Courier New",monospace;font-size:22px;font-weight:600;color:var(--title);margin:0 0 4px}
  .kind{display:inline-block;font-size:11px;font-weight:600;text-transform:uppercase;color:var(--kindfg);background:var(--kindbg);padding:1px 7px;vertical-align:middle;margin-left:9px}
  .src{color:var(--muted);font-size:12px;margin-bottom:14px}
  pre.sig{background:var(--codebg);border:1px solid var(--border);padding:10px 13px;overflow:auto;font-family:Consolas,"Courier New",monospace;font-size:13px;color:var(--codefg);white-space:pre-wrap}
  .desc{margin:14px 0;font-size:14px}
  table{border-collapse:collapse;width:100%;margin:8px 0 18px;border:1px solid var(--border)}
  th,td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--border);vertical-align:top}
  th{background:var(--th-bg);color:var(--fg);font-weight:600;font-size:12px}
  td.pn{font-family:Consolas,"Courier New",monospace;color:var(--codefg);white-space:nowrap}
  h4{color:var(--fg);opacity:.8;font-size:12px;font-weight:700;text-transform:uppercase;margin:18px 0 4px}
  #home h2{color:var(--title)}
  #home h4{margin-top:22px}#home ul{margin:6px 0 16px;padding-left:20px}#home li{margin:4px 0}
  .pill{display:inline-block;background:var(--content);border:1px solid var(--border);padding:3px 10px;margin:3px;font-size:13px;color:var(--muted)}
  /* collapsible categories */
  .cat>h3{cursor:pointer;display:flex;align-items:center;gap:6px;user-select:none}
  .cat>h3:hover{color:var(--fg)}
  .cat .tw{display:inline-block;transition:transform .12s;font-size:9px;width:9px}
  .cat.collapsed .tw{transform:rotate(-90deg)}
  .cat .ct{margin-left:auto;font-weight:400;font-size:10px;opacity:.8}
  .cat.collapsed .list{display:none}
  /* guides + example code blocks */
  .guide{max-width:760px}
  .guide h1{font-size:24px;color:var(--title);margin:0 0 10px}
  .guide h2{font-size:19px;color:var(--title);margin:26px 0 8px;border-bottom:1px solid var(--border);padding-bottom:4px}
  .guide h3{font-size:16px;margin:20px 0 6px}
  .guide p{margin:10px 0}.guide li{margin:3px 0}.guide ul{padding-left:22px}
  pre.code{background:var(--codebg);border:1px solid var(--border);padding:11px 13px;overflow:auto;font-family:Consolas,"Courier New",monospace;font-size:13px;color:var(--codefg);white-space:pre;line-height:1.5}
</style>
</head>
<body>
  <header id="topbar">
    <div id="title">Silkweaver <span>· API Reference</span></div>
    <input id="search" type="search" placeholder="Search the API…" autocomplete="off">
    <button id="theme" type="button">Light</button>
  </header>
  <div id="body">
    <aside id="side"><nav id="nav"></nav></aside>
    <main id="main"><div id="content"></div></main>
  </div>
<script>
const DATA = ${json};
const cats = {};
for (const e of DATA){ (cats[e.category] ||= []).push(e); }
const catOrder = Object.keys(cats).sort((a,b)=> a==='Guides'?-1 : b==='Guides'?1 : a.localeCompare(b));
const nav = document.getElementById('nav');
const content = document.getElementById('content');
let currentId = '';

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function markActive(){
  document.querySelectorAll('#nav a').forEach(a => {
    const on = a.dataset.id === currentId;
    a.classList.toggle('active', on);
    if (on) { const c = a.closest('.cat'); if (c) c.classList.remove('collapsed'); }
  });
}

function buildNav(filter){
  nav.innerHTML='';
  const f = (filter||'').toLowerCase();
  for (const cat of catOrder){
    const items = cats[cat].filter(e => !f || e.name.toLowerCase().includes(f) || (e.member_of||'').toLowerCase().includes(f));
    if (!items.length) continue;
    const div = document.createElement('div'); div.className='cat';
    // Collapsed by default; expanded when searching, for Guides, or when it holds the current entry.
    if (!(f || cat==='Guides' || items.some(e=>e.id===currentId))) div.classList.add('collapsed');
    const h = document.createElement('h3');
    h.innerHTML = '<span class="tw">▾</span>'+esc(cat)+'<span class="ct">'+items.length+'</span>';
    h.addEventListener('click', () => div.classList.toggle('collapsed'));
    div.appendChild(h);
    const list = document.createElement('div'); list.className='list';
    for (const e of items){
      const a = document.createElement('a'); a.href='#'+e.id; a.dataset.id=e.id;
      a.innerHTML = esc(e.name) + (e.member_of ? ' <span class="mo">· '+esc(e.member_of)+'</span>' : '');
      list.appendChild(a);
    }
    div.appendChild(list);
    nav.appendChild(div);
  }
  markActive();
}

function render(id){
  currentId = id;
  const main = document.getElementById('main');
  const e = DATA.find(x => x.id === id);
  if (!e){
    const guides = DATA.filter(x => x.kind==='guide');
    const apiCats = catOrder.filter(c => c!=='Guides');
    content.innerHTML = '<div id="home"><h2>Silkweaver API Reference</h2>'+
      '<p>'+DATA.length+' entries, generated directly from the engine source — so the reference can never drift from the code. Click a category in the sidebar to expand it, or search.</p>'+
      (guides.length ? '<h4>Guides</h4><ul>'+guides.map(g=>'<li><a href="#'+g.id+'">'+esc(g.name)+'</a></li>').join('')+'</ul>' : '')+
      '<h4>Reference categories</h4><p>'+apiCats.map(c=>'<span class="pill">'+esc(c)+' · '+cats[c].length+'</span>').join('')+'</p></div>';
    markActive(); return;
  }
  if (e.kind === 'guide'){
    content.innerHTML = '<article class="guide">'+e.html+'</article>';
    main.scrollTop = 0; markActive(); return;
  }
  let h = '<h2 class="entry">'+esc(e.name)+'<span class="kind">'+esc(e.kind)+'</span></h2>';
  h += '<div class="src">'+(e.member_of ? esc(e.member_of)+' · ' : '')+'<code>'+esc(e.module)+'</code></div>';
  h += '<pre class="sig">'+esc(e.signature)+'</pre>';
  if (e.description) h += '<div class="desc">'+esc(e.description)+'</div>';
  if (e.params && e.params.length){
    h += '<h4>Parameters</h4><table><tr><th>Name</th><th>Description</th></tr>';
    for (const p of e.params) h += '<tr><td class="pn">'+esc(p.name)+'</td><td>'+esc(p.desc)+'</td></tr>';
    h += '</table>';
  }
  if (e.returns) h += '<h4>Returns</h4><div>'+esc(e.returns)+'</div>';
  if (e.examples && e.examples.length){
    h += '<h4>Example</h4>';
    for (const ex of e.examples) h += '<pre class="code">'+esc(ex)+'</pre>';
  }
  content.innerHTML = h;
  main.scrollTop = 0; markActive();
}
const themeBtn = document.getElementById('theme');
function syncTheme(){ themeBtn.textContent = document.documentElement.dataset.theme === 'dark' ? 'Light' : 'Dark'; }
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('sw-docs-theme', next);
  syncTheme();
});
syncTheme();
document.getElementById('search').addEventListener('input', ev => buildNav(ev.target.value));
window.addEventListener('hashchange', () => render(decodeURIComponent(location.hash.slice(1))));
buildNav('');
render(decodeURIComponent(location.hash.slice(1)));
</script>
</body>
</html>
`
}
