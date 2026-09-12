// Optional browser QA: set PLAYWRIGHT_MODULE to an installed playwright package.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '../../..');
const css = fs.readFileSync(path.join(root, 'windows/assets/dream-skin.css'), 'utf8');
const theme = JSON.parse(fs.readFileSync(path.join(root, 'windows/assets/theme.json'), 'utf8'));
const out = path.join(root, 'artifacts/native-surfaces');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>
      * { box-sizing: border-box } body { margin:0; padding:24px; font:16px/1.5 system-ui }
      main { padding:24px; max-width:960px; margin:auto } section { display:grid; gap:16px }
      input,button,select,[role=dialog],[role=menu] { padding:12px; border:1px solid var(--color-border-subtle,#777); border-radius:10px }
      input,select { width:100%; background:var(--color-background-control,#eee); color:var(--color-text-foreground,#123) }
      button { background:var(--color-background-button-primary,#ddd); color:var(--color-text-button-primary,#123) }
      .muted { color:var(--color-text-secondary,#777) } .danger { color:var(--color-text-danger,red) }
      html { --color-text-danger:rgb(190,20,30) }
    </style><style>${css}</style><main class="main-surface"><section>
      <h1>设置与插件 · Settings & Plugins</h1><p class="muted">主题覆盖、表单、菜单和弹窗</p>
      <div class="sticky" style="background:var(--ds-bg)"><div><input id="plugins-store-page-search" aria-label="搜索插件" placeholder="Search plugins"></div></div>
      <div><input id="settings-search" aria-label="搜索设置" placeholder="Search settings"></div>
      <select aria-label="类别"><option>所有类别 / All categories</option></select>
      <button>查看插件 / View plugin</button><button disabled>不可用 / Unavailable</button>
      <div role="dialog" aria-label="插件详情"><strong>插件详情</strong><p class="muted">权限与连接状态由应用管理</p><span class="danger">危险操作保持原生语义色</span></div>
      <div role="menu" aria-label="菜单">设置菜单 · 原生控件布局</div>
    </section></main>`);
    let checks = 0;
    const variants = [{ id:'default', colors:null }, ...theme.backgroundVariants];
    for (const width of [480, 1280, 1920]) for (const shell of ['light','dark']) for (const variant of variants) {
      await page.setViewportSize({ width, height:900 });
      await page.evaluate(({ shell, variant }) => {
        const html = document.documentElement;
        html.removeAttribute('style');
        html.dataset.dreamSkin = 'settings'; html.dataset.dreamShell = shell; html.dataset.dreamThemeId = variant.id;
        if (variant.colors) {
          const mapping = {background:'bg',panel:'panel',panelAlt:'panel-2',text:'text',muted:'muted',accent:'accent',line:'line'};
          for (const [key, token] of Object.entries(mapping)) {
            const hex = variant.colors[key]; if (!hex) continue;
            html.style.setProperty('--ds-' + token, hex);
            const rgb = hex.slice(1).match(/../g).map(x=>parseInt(x,16)).join(' ');
            html.style.setProperty('--ds-' + token + '-rgb', rgb);
          }
        }
      }, {shell,variant});
      await page.locator('#plugins-store-page-search').focus();
      const result = await page.evaluate(() => {
        const style = node => getComputedStyle(node);
        const html = document.documentElement;
        const dialog = style(document.querySelector('[role=dialog]'));
        return { overflow:html.scrollWidth>innerWidth, background:dialog.backgroundColor,
          color:dialog.color, focus:style(document.querySelector('input').parentElement).outlineStyle,
          innerOutline:style(document.querySelector('input')).outlineStyle,
          band:style(document.querySelector('.sticky')).backgroundColor,
          danger:style(document.querySelector('.danger')).color,
          scheme:style(html).colorScheme };
      });
      assert.equal(result.overflow,false,JSON.stringify({width,shell,variant:variant.id}));
      assert.notEqual(result.background,'rgba(0, 0, 0, 0)');
      assert.notEqual(result.background,result.color);
      assert.equal(result.focus,'solid');
      assert.equal(result.innerOutline,'none');
      assert.equal(result.band,'rgba(0, 0, 0, 0)');
      assert.equal(result.danger,'rgb(190, 20, 30)');
      assert.equal(result.scheme,shell);
      if(width===1280 && shell==='light') await page.screenshot({path:path.join(out,variant.id+'.png')});
      checks++;
    }
    const frames = await page.evaluate(async()=>{
      const results=[];
      document.documentElement.style.setProperty('--dream-skin-art','linear-gradient(45deg, red, blue)');
      for(let i=0;i<20;i++) for(const mode of ['active','settings','home-native']) {
        document.documentElement.dataset.dreamSkin=mode;
        for(const transition of [true,false]) {
          document.documentElement.toggleAttribute('data-dream-route-transition',transition);
          if(transition) document.documentElement.setAttribute('data-dream-route-transition','true');
          await new Promise(requestAnimationFrame);
          const body=getComputedStyle(document.body),html=getComputedStyle(document.documentElement);
          results.push([body.backgroundImage,body.backgroundPosition,body.backgroundSize,body.backgroundAttachment,body.fontFamily,html.backgroundImage]);
        }
      }
      return results;
    });
    for(const frame of frames) assert.deepEqual(frame,frames[0],'route paint must remain identical on every sampled frame');
    await page.evaluate(()=>{document.documentElement.dataset.dreamSkin='native';document.documentElement.removeAttribute('data-dream-route-transition')});
    assert.equal(await page.locator('[role=dialog]').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)');
    console.log(`PASS: ${checks} viewport/palette/shell combinations; search wrappers; ${frames.length} route-transition paint frames; native opt-out`);
  } finally { await browser.close(); }
})().catch(error=>{ console.error(error); process.exitCode=1; });
