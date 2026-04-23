// Netlify Function — proxy vers Google Apps Script
// Suit les redirections côté serveur, retourne du JSON propre

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysJrGaCkau3qQC7HrGf8ze0BBBTyiiHzCds6FQKxMIygdp4WvV3EuvpT-9ZLd8WGZh/exec';

exports.handler = async (event) => {
  try {
    // Construire l'URL avec les paramètres de la requête
    const params = new URLSearchParams(event.queryStringParameters || {}).toString();
    const url = APPS_SCRIPT_URL + (params ? '?' + params : '');

    // Appel vers Apps Script (suit les redirections automatiquement)
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'Accept': 'application/json, text/javascript, */*' },
    });

    const text = await response.text();

    // Extraire le JSON si la réponse est JSONP : callback({...})
    let json;
    const jsonpMatch = text.match(/^[^(]+\((.+)\)\s*;?\s*$/s);
    if (jsonpMatch) {
      json = jsonpMatch[1];
    } else {
      json = text;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: json,
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};