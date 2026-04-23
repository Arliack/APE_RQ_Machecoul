// Netlify Function — proxy Apps Script
// Utilise le module https natif (compatible Node.js 14/16/18)
// Suit les redirections manuellement (Apps Script redirige vers googleusercontent.com)

const https = require('https');
const http  = require('http');
const { URL } = require('url');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysJrGaCkau3qQC7HrGf8ze0BBBTyiiHzCds6FQKxMIygdp4WvV3EuvpT-9ZLd8WGZh/exec';

// Fetch avec suivi de redirections (jusqu'à 5)
function fetchText(urlStr, maxRedirects) {
  if (maxRedirects === undefined) maxRedirects = 5;

  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const lib    = parsed.protocol === 'https:' ? https : http;

      const req = lib.get({
        hostname: parsed.hostname,
        path:     parsed.pathname + (parsed.search || ''),
        headers:  {
          'Accept':     'application/json, text/javascript, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; Netlify-Function)',
        },
      }, (res) => {
        // Suivre les redirections
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          if (maxRedirects <= 0) { reject(new Error('Trop de redirections')); return; }
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : parsed.origin + res.headers.location;
          resolve(fetchText(next, maxRedirects - 1));
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data',  chunk => { body += chunk; });
        res.on('end',   () => resolve(body));
        res.on('error', reject);
      });

      req.on('error', reject);
      req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });

    } catch (e) { reject(e); }
  });
}

exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {}).toString();
    const url    = APPS_SCRIPT_URL + (params ? '?' + params : '');

    let text = await fetchText(url);

    // Si la réponse est JSONP (callback({...})), extraire le JSON brut
    const m = text.match(/^\s*\w+\s*\((.+)\)\s*;?\s*$/s);
    if (m) text = m[1];

    // Vérifier que c'est du JSON valide
    JSON.parse(text); // lève une exception si invalide

    return {
      statusCode: 200,
      headers: {
        'Content-Type':                'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: text,
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Proxy error: ' + err.message }),
    };
  }
};