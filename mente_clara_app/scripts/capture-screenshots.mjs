import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'capturas_informe');
const port = 5173;
const baseUrl = `http://127.0.0.1:${port}`;

const games = [
  ['memoryPairs', 'parejas'],
  ['colorSequence', 'colores'],
  ['imageWord', 'imagen-palabra'],
  ['oddObject', 'intruso'],
  ['orderSteps', 'ordenar-pasos'],
  ['classifyObjects', 'clasificar-objetos'],
];

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl);
      if (res.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error('Vite no respondió a tiempo.');
}

async function capture(page, name, hash, options = {}) {
  await page.goto(`${baseUrl}/#${hash}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(options.delay ?? 900);
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: options.fullPage ?? true,
  });
  console.log(`capturada: ${name}.png`);
}

async function clickFirstEnabled(page, selector) {
  const locator = page.locator(selector).filter({ hasNot: page.locator('[disabled]') }).first();
  await locator.click();
}

await mkdir(outDir, { recursive: true });

const server = spawn('npm.cmd', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  stdio: 'pipe',
  shell: true,
});

server.stdout.on('data', (data) => process.stdout.write(data));
server.stderr.on('data', (data) => process.stderr.write(data));

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`console error: ${msg.text()}`);
  });

  await capture(page, '01-inicio', '/', { fullPage: false });
  await capture(page, '02-menu-juegos', '/juegos');
  await capture(page, '03-dificultad-parejas', '/juegos/memoryPairs/dificultad');

  for (const [gameId, slug] of games) {
    await capture(page, `reglas-${slug}`, `/rules/${gameId}/facil`);
  }

  for (const [gameId, slug] of games) {
    await capture(page, `juego-${slug}`, `/juegos/${gameId}/facil`);
  }

  await capture(page, 'estado-colores-secuencia', '/juegos/colorSequence/facil', { fullPage: false });
  await page.getByRole('button', { name: /iniciar secuencia/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, 'estado-colores-observando.png'), fullPage: false });

  await capture(page, 'estado-intruso-respuesta', '/juegos/oddObject/facil', { fullPage: false });
  await page.locator('button[id^="odd-item-"]').first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'estado-intruso-feedback.png'), fullPage: false });

  await capture(page, 'estado-ordenar-respuesta', '/juegos/orderSteps/facil', { fullPage: true });
  for (let i = 0; i < 3; i += 1) {
    await page.locator('main button').filter({ hasText: /^(?!Reiniciar|Salir|Deshacer).+/ }).nth(i).click();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'estado-ordenar-feedback.png'), fullPage: true });

  await capture(page, 'resultado-fin-juego', '/juegos/imageWord/facil', { fullPage: false });
  for (let i = 0; i < 5; i += 1) {
    await clickFirstEnabled(page, 'button[id^="choice-"]');
    await page.waitForTimeout(1450);
  }
  await page.waitForURL('**/#/resultado', { timeout: 8000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'resultado-imagen-palabra.png'), fullPage: true });
  console.log(`\nCapturas guardadas en: ${outDir}`);
} finally {
  if (browser) await browser.close();
  server.kill();
}
