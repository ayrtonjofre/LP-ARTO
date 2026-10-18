import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const browserPath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifacts = resolve('.local-backup', 'qa');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(join(artifacts, '.chrome-preview-qa-'));
const browser = spawn(browserPath, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox',
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });

const delay = (ms) => new Promise((done) => setTimeout(done, ms));
let socket;
let session;
let sequence = 0;
const waiting = new Map();
const runtimeErrors = [];

function command(method, params = {}, sessionId = session) {
  return new Promise((resolveCommand, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { waiting.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000);
    waiting.set(id, { resolve: resolveCommand, reject, timeout });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function settleAnimations() {
  await evaluate('Promise.all(document.getAnimations().filter((animation) => animation.playState === "running" && animation.effect?.getTiming().iterations !== Infinity).map((animation) => animation.finished.catch(() => {})))');
  await delay(30);
}

try {
  let debugging;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { debugging = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split('\n'); break; }
    catch { await delay(250); }
  }
  if (!debugging) throw new Error('Chrome did not start its local debugging endpoint.');
  socket = new WebSocket(`ws://127.0.0.1:${debugging[0]}${debugging[1]}`);
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject; });
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    const pending = waiting.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timeout);
    waiting.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result);
  };
  const target = await command('Target.createTarget', { url: 'about:blank' }, null);
  session = (await command('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  // Test deterministic offline fallbacks; this environment blocks external network access.
  await command('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*', 'https://dynamic-media-cdn.tripadvisor.com/*', 'https://images.latamcoffeetrip.com/*', 'https://img02.restaurantguru.com/*', 'https://images.unsplash.com/*', 'https://unsplash.com/*'] });
  const url = process.env.ARTO_PREVIEW_URL || pathToFileURL(resolve('dist/index.html')).href;
  const results = [];
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 960, deviceScaleFactor: 1, mobile: width < 761 });
    await command('Page.navigate', { url });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate('document.readyState === "complete" && document.querySelector(\'.course-tab[aria-selected="true"]\') !== null')) break;
      await delay(100);
    }
    // The panorama is intentionally lazy in production; explicitly await it for deterministic asset QA.
    await evaluate("(() => { const image = document.querySelector('.house-still-life'); image.loading = 'eager'; return image.decode(); })()");
    const getMetrics = `(() => {
      const width = innerWidth;
      const visible = (element) => element.getClientRects().length && !element.closest('.sr-only, [hidden], .icon-defs') && getComputedStyle(element).visibility !== 'hidden';
      const overflow = [...document.querySelectorAll('main *')].filter(visible).filter((element) => {
        // The panoramic art intentionally extends inside its clipping frame.
        if (element.matches('.house-still-life, .house-light, .house-light *')) return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > width + 1;
      }).map((element) => String(element.className?.baseVal ?? element.className) || element.tagName);
      const rounded = [...document.querySelectorAll('body *')].filter(visible).filter((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) > 0).map((element) => String(element.className));
      const missingAnchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.hash).filter((hash) => !document.querySelector(hash));
      const textOverflow = [...document.querySelectorAll('h1, h2, h3, .hero-description, .opening-hours dd, .course-description, .course-topics, .house-story-title')].filter(visible).filter((element) => {
        const range = document.createRange(); range.selectNodeContents(element);
        const text = range.getBoundingClientRect(), box = element.getBoundingClientRect();
        return text.width > 0 && (text.left < box.left - 6 || text.right > box.right + 6);
      }).map((element) => element.textContent.trim());
      const overlaps = [];
      document.querySelectorAll('.intro, .courses-heading, .course-panel, .contact-heading, .contact-information, .header-identity, .hero-inner, .course-tabs').forEach((grid) => {
        const children = [...grid.children].filter(visible);
        children.forEach((first, index) => children.slice(index + 1).forEach((second) => {
          const a = first.getBoundingClientRect(), b = second.getBoundingClientRect();
          if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) overlaps.push(first.className + ' / ' + second.className);
        }));
      });
      const missingIcons = [...document.querySelectorAll('svg.icon use')].filter((use) => !document.querySelector(use.getAttribute('href'))).length;
      return { width, documentWidth: document.documentElement.scrollWidth, overflow, textOverflow, overlaps, rounded, missingAnchors, missingIcons, localArt: document.querySelector('.house-still-life').naturalWidth === 1774, visiblePanels: [...document.querySelectorAll('.course-panel')].filter(visible).length };
    })()`;
    function assertGeometry(metrics) {
      if (metrics.documentWidth !== width || metrics.overflow.length || metrics.textOverflow.length || metrics.overlaps.length || metrics.rounded.length || metrics.missingAnchors.length || metrics.missingIcons || !metrics.localArt || metrics.visiblePanels !== 1) throw new Error(JSON.stringify(metrics));
    }
    assertGeometry(await evaluate(getMetrics));
    for (const id of ['barista', 'latte', 'metodos']) {
      await evaluate(`document.getElementById('tab-${id}').click()`);
      await settleAnimations();
      if (!await evaluate(`document.getElementById('tab-${id}').getAttribute('aria-selected') === 'true' && !document.getElementById('programa-${id}').hidden`)) throw new Error('Course selection failed: ' + id);
      assertGeometry(await evaluate(getMetrics));
    }
    await evaluate("document.getElementById('tab-metodos').focus()");
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
    await settleAnimations();
    if (!await evaluate("document.activeElement.id === 'tab-barista' && document.getElementById('tab-barista').getAttribute('aria-selected') === 'true'")) throw new Error('Course keyboard wrap-around failed.');
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'End', code: 'End' });
    await settleAnimations();
    if (!await evaluate("document.activeElement.id === 'tab-metodos'")) throw new Error('Course End key failed.');
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home' });
    await settleAnimations();

    if (width === 390 || width === 768) {
      await evaluate("document.querySelector('.menu-toggle').click()");
      if (!await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true' && getComputedStyle(document.querySelector('.navigation')).display === 'flex'")) throw new Error('Mobile menu did not open.');
      await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
      if (await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded') !== 'false'")) throw new Error('Escape did not close the menu.');
    }
    await evaluate("document.querySelector('.questions-list summary').click()");
    await settleAnimations();
    if (!await evaluate("document.querySelector('.questions-list details').open && document.querySelector('.question-action-label').textContent === 'Cerrar respuesta'")) throw new Error('FAQ did not open.');
    await evaluate("document.querySelector('.questions-list summary').click()");
    await settleAnimations();
    if (await evaluate("document.querySelector('.questions-list details').open")) throw new Error('FAQ did not close.');
    await evaluate("document.querySelector('.questions-list summary').click(); document.querySelector('.questions-list summary').click()");
    await settleAnimations();
    if (await evaluate("document.querySelector('.questions-list details').open || document.querySelector('.questions-list details').style.overflow !== ''")) throw new Error('Rapid toggling left the FAQ clipped.');

    await evaluate('window.scrollTo({ top: 0, behavior: "instant" })');
    await delay(120);
    if (!await evaluate("document.querySelector('.hero-scene').classList.contains('is-in-view') && document.getAnimations().some((a) => a.effect?.getTiming().iterations === Infinity && a.playState === 'running')")) throw new Error('Ambient animation is not active in the viewport.');
    await evaluate("document.querySelector('.motion-toggle').click()");
    if (!await evaluate("document.querySelector('.motion-toggle').getAttribute('aria-pressed') === 'true' && document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity).every((a) => a.playState === 'paused')")) throw new Error('Motion pause failed.');
    await evaluate("document.querySelector('.motion-toggle').click()");

    if (width === 1440) {
      await evaluate("document.querySelector('.house-story').scrollIntoView({ block: 'center', behavior: 'instant' })");
      await delay(120);
      const before = await evaluate("document.querySelector('.house-still-life').style.getPropertyValue('--parallax-y')");
      await evaluate("window.scrollBy({ top: 120, behavior: 'instant' })");
      await delay(120);
      const after = await evaluate("document.querySelector('.house-still-life').style.getPropertyValue('--parallax-y')");
      if (before === after || Math.abs(parseFloat(after)) > 22) throw new Error('Bounded parallax did not update.');
      if (await evaluate("document.querySelector('.hero-scene').classList.contains('is-in-view')")) throw new Error('Offscreen hero animation was not suspended.');
    }
    if (width === 390) {
      await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await evaluate("document.getElementById('tab-latte').click(); document.querySelector('.questions-list summary').click()");
      await delay(40);
      if (!await evaluate("document.querySelector('.questions-list details').open && document.getAnimations().length === 0")) throw new Error('Reduced motion left animations running.');
      await evaluate("document.querySelector('.questions-list summary').click(); document.getElementById('tab-barista').click()");
      await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    }

    if (width === 390 || width === 1440) {
      await evaluate("document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('.motion-toggle').click()");
      await delay(100);
      const viewport = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(artifacts, `preview-redesign-${width === 390 ? 'mobile-viewport' : 'desktop'}.png`), Buffer.from(viewport.data, 'base64'));
      const layout = await command('Page.getLayoutMetrics');
      const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: layout.cssContentSize.height, scale: 1 } });
      await writeFile(join(artifacts, `preview-redesign-${width === 390 ? 'mobile' : 'full'}.png`), Buffer.from(screenshot.data, 'base64'));
      for (const id of ['barista', 'latte', 'metodos']) {
        await evaluate(`document.getElementById('tab-${id}').click()`);
        await settleAnimations();
        const courses = await evaluate("(() => { const rect = document.querySelector('#cursos').getBoundingClientRect(); return { x: 0, y: rect.top + scrollY, width: innerWidth, height: rect.height, scale: 1 }; })()");
        const courseScreenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: courses });
        const suffix = id === 'barista' ? '' : '-' + id;
        await writeFile(join(artifacts, 'preview-redesign-courses' + (width === 390 ? '-mobile' : '') + suffix + '.png'), Buffer.from(courseScreenshot.data, 'base64'));
      }
    }
    results.push({ width, overflow: false, rounded: false, coursePrograms: 3, keyboard: 'passed', menuAndFAQ: 'passed', motion: 'passed' });
  }

  const artLoad = await evaluate("new Promise((resolve) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = () => resolve(null); image.src = 'assets/arto-coffee-art.png'; })");
  if (artLoad?.width !== 2172 || artLoad?.height !== 724) throw new Error('The four-piece local artwork did not load.');

  await command('Emulation.setScriptExecutionDisabled', { value: true });
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 960, deviceScaleFactor: 1, mobile: true });
  await command('Page.navigate', { url });
  await delay(500);
  if (!await evaluate("document.querySelectorAll('.course-panel:not([hidden])').length === 3 && document.querySelectorAll('.course-tab[role=tab]').length === 0")) throw new Error('Course content is not available without JavaScript.');
  if (!await evaluate("getComputedStyle(document.querySelector('.navigation')).display === 'flex' && getComputedStyle(document.querySelector('.menu-toggle')).display === 'none' && document.documentElement.scrollWidth === innerWidth")) throw new Error('Mobile navigation is not available without JavaScript.');
  await evaluate("document.querySelector('.questions-list summary').click()");
  if (!await evaluate("document.querySelector('.questions-list details').open")) throw new Error('Native FAQ does not work without JavaScript.');
  await command('Emulation.setScriptExecutionDisabled', { value: false });
  if (runtimeErrors.length) throw new Error(runtimeErrors.join('; '));
  console.log(JSON.stringify({ results, noJavaScript: 'All programs remain available', localArtwork: artLoad, parallax: 'Bounded offsets verified', runtimeErrors, network: 'Local artwork verified. External fonts and the retained venue photo use offline fallbacks.' }, null, 2));
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try { await command('Browser.close', {}, null); } catch {}
    socket.close();
  }
  browser.kill();
}
