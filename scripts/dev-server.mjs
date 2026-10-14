import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import godsHandler from '../api/gods.js';

const publicRoot = new URL('../public/', import.meta.url);
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/learn-content.js', ['learn-content.js', 'text/javascript; charset=utf-8']],
  ['/quiz.js', ['quiz.js', 'text/javascript; charset=utf-8']],
  ['/quiz.css', ['quiz.css', 'text/css; charset=utf-8']],
]);

export function createAppServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Cache-Control', 'no-store');

    let url;
    try {
      url = new URL(req.url, 'http://127.0.0.1');
    } catch {
      res.writeHead(400).end('Invalid request.');
      return;
    }

    if (url.pathname === '/api/gods') {
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (value) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(value));
        return res;
      };
      try {
        await godsHandler(req, res);
      } catch {
        if (!res.headersSent) {
          res.status(500).json({ error: 'The archive is taking a short break. Please try again.' });
        } else {
          res.end();
        }
      }
      return;
    }

    const asset = assets.get(url.pathname);
    if (!asset) {
      res.writeHead(404).end('Page not found.');
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      res.writeHead(405).end('Method not allowed.');
      return;
    }
    try {
      const contents = await readFile(new URL(asset[0], publicRoot));
      res.setHeader('Content-Type', asset[1]);
      res.writeHead(200).end(req.method === 'HEAD' ? undefined : contents);
    } catch {
      res.writeHead(404).end('Page not found.');
    }
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const port = Number(process.env.PORT) || 3000;
  const server = createAppServer();
  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE'
      ? 'Mythos.Guide may already be open. Visit http://localhost:3000.'
      : 'Mythos.Guide could not start. Ask Codex to help restart it.');
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    const address = `http://localhost:${port}`;
    console.log(`Mythos.Guide is ready at ${address}`);
    console.log('Keep this window open while using the app. Press Ctrl+C to stop.');
    if (process.argv.includes('--open') && process.platform === 'darwin') {
      const opener = spawn('open', [address], { stdio: 'ignore' });
      opener.on('error', () => {});
    }
  });
  for (const event of ['SIGINT', 'SIGTERM']) {
    process.on(event, () => server.close(() => process.exit(0)));
  }
}
