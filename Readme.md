# 📚 APE Kit de Rentrée — Guide d'installation

## Architecture

```
Familles (iPhone/Android/Desktop)
         ↓ ouvre la page
   GitHub Pages (index.html)
         ↓ appel API fetch()
   Google Apps Script (Code.gs)
         ↓ lit / écrit
   Google Sheets
```

---

## Étape 1 — Déployer Apps Script

1. Ouvre ton Google Sheet → **Extensions → Apps Script**
2. Remplace le contenu de `Code.gs` par le nouveau fichier fourni
3. **Déployer → Nouveau déploiement**
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
4. Clique **Déployer** → Autorise les permissions
5. **Copie l'URL** qui ressemble à :
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Étape 2 — Configurer index.html

Ouvre `index.html` et trouve la ligne (vers le bas) :

```javascript
const API_URL = 'COLLER_ICI_VOTRE_URL_APPS_SCRIPT';
```

Remplace-la par ton URL :

```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

---

## Étape 3 — Créer le dépôt GitHub Pages

1. Va sur **https://github.com** → crée un compte si besoin
2. Clique **New repository** (bouton vert)
3. Nom du dépôt : `kit-rentree-ape` (ou ce que tu veux)
4. Coche **"Public"**
5. Clique **Create repository**

---

## Étape 4 — Uploader index.html

Sur la page de ton dépôt vide :

1. Clique **"uploading an existing file"**
2. Glisse-dépose ton fichier `index.html`
3. En bas, clique **"Commit changes"**

---

## Étape 5 — Activer GitHub Pages

1. Dans ton dépôt → onglet **Settings**
2. Dans le menu gauche → **Pages**
3. Sous "Branch" → sélectionne **main** → dossier **/ (root)**
4. Clique **Save**

Attends 1-2 minutes, puis GitHub affiche :

> ✅ Your site is live at `https://TON-COMPTE.github.io/kit-rentree-ape/`

**C'est cette URL que tu partages aux familles !**

---

## Résumé des URLs

| Ce que c'est | URL |
|---|---|
| **À partager aux familles** | `https://TON-COMPTE.github.io/kit-rentree-ape/` |
| Apps Script (API, ne pas partager) | `https://script.google.com/macros/s/.../exec` |

---

## Mise à jour du contenu

- **Produits / prix** → modifie directement le Google Sheet → rechargement automatique
- **Modification du code HTML** → upload le nouveau `index.html` sur GitHub → actif en 1 minute
- **Modification de Code.gs** → redéploie avec une nouvelle version dans Apps Script