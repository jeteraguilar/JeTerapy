import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handler para rotas de API: evita que SSR tente processar rotas /api
 */
// Proxy /api requests to the real backend so SSR won't try to resolve them as Angular routes.
app.use('/api', (req, res) => {
  const backendUrl = `http://localhost:8080${req.originalUrl}`;
  const chunks: Buffer[] = [];

  req.on('data', (chunk) => {
    chunks.push(Buffer.from(chunk));
  });

  req.on('end', () => {
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      if (Array.isArray(value)) headers[key] = value.join(',');
      else headers[key] = value as string;
    }

    fetch(backendUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    })
      .then((backendRes) => {
        res.status(backendRes.status);
        backendRes.headers.forEach((val, key) => {
          if (
            ['transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'].includes(
              key.toLowerCase(),
            )
          )
            return;
          res.setHeader(key, val);
        });
        return backendRes.arrayBuffer();
      })
      .then((responseBuffer) => {
        if (responseBuffer && responseBuffer.byteLength) {
          res.send(Buffer.from(responseBuffer));
        } else {
          res.end();
        }
      })
      .catch((err) => {
        console.error('API proxy error:', err);
        res.status(502).send('Bad gateway');
      });
  });

  req.on('error', (err) => {
    console.error('API proxy request error:', err);
    res.status(400).end();
  });
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
