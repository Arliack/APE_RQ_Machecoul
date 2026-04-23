const https = require('https');
const http  = require('http');
const { URL } = require('url');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysJrGaCkau3qQC7HrGf8ze0BBBTyiiHzCds6FQKxMIygdp4WvV3EuvpT-9ZLd8WGZh/exec';

function fetchText(urlStr, maxRedirects, visited) {
  if (maxRedirects === undefined) maxRedirects = 6;
  if (visited === undefined) visited = [];
  visited.push(urlStr);

  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const lib = parsed.protocol === 'https:' ? https : http;

      const req = lib.get({
        hostname: parsed.hostname,
        path: parsed.pathname + (parsed.search || ''),
        headers: {
          'Accept': 'application/json, */*',
          'User-Agent': 'Node.js',
        },
      }, (res) => {
        if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
          if (maxRedirects <= 0) { reject(new Error('Too many redirects')); return; }
          let next = res.headers.location;
          if (!next.startsWith('http')) next = parsed.origin + next;
          // consume response body to free socket
          res.resume();
          resolve(fetchText(next, maxRedirects - 1, visited));
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', c => { body += c; });
        res.on('end', () => resolve({ body, status: res.statusCode, visited }));
        res.on('error', reject);
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    } catch(e) { reject(e); }
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const params = new URLSearchParams(event.queryStringParameters || {}).toString();
    const url = APPS_SCRIPT_URL + (params ? '?' + params : '');

    const result = await fetchText(url);
    let text = result.body;

    // Extraire JSON depuis JSONP si besoin
    const m = text.match(/^\s*[\w$]+\s*\((\{[\s\S]*\}|\[[\s\S]*\])\)\s*;?\s*$/);
    if (m) text = m[1];

    // Vérifier JSON valide
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(parseErr) {
      // Retourner le texte brut pour debug
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Réponse non-JSON de Apps Script',
          debug_status: result.status,
          debug_visited: result.visited,
          debug_raw: text.substring(0, 500),
        }),
      };
    }

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(parsed) };

  } catch(err) {
    return {
      statusCode: 200, // 200 pour que le JS puisse lire le corps
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Proxy error: ' + err.message }),
    };
  }
};