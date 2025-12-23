# exchange_of_presents (GitHub Pages frontend)

This folder is a **static** site ready for GitHub Pages.

## What you get
- `admin.html` (admin panel)
- `participante.html` (participant form)
- `resultado.html` (result lookup — requires backend endpoint)
- `static/` (styles + i18n + config)

## Backend required
GitHub Pages cannot run Python/FastAPI. Deploy the backend separately and set the URL.

### Set backend URL
Edit `static/config.js`:

```js
const DEFAULT = "https://YOUR-BACKEND.example.com";
```

Or in the browser console:

```js
localStorage.setItem('backend_url','https://your-backend.onrender.com');
location.reload();
```

## GitHub Pages
Settings → Pages → Deploy from branch → `main` → `/ (root)`

`.nojekyll` is included.
