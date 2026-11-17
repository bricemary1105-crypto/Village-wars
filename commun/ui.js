// Petits outils d'interface.

/** Échappe le texte avant de l'insérer dans du HTML (pseudos des joueurs !). */
export function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Formate une durée en ms : 125000 → "2:05", 3725000 → "1:02:05". */
export function chrono(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** "il y a 3 min", "il y a 20 s" */
export function ilYa(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `il y a ${s} s`;
  return `il y a ${Math.floor(s / 60)} min`;
}

/** Message temporaire en bas de l'écran. */
export function toast(texte, type = "info", duree = 3500) {
  let zone = document.getElementById("toasts");
  if (!zone) {
    zone = document.createElement("div");
    zone.id = "toasts";
    document.body.appendChild(zone);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = texte;
  zone.appendChild(el);
  setTimeout(() => el.remove(), duree);
}

/** Petite vibration si le téléphone sait faire (Android ; ignoré sur iPhone). */
export function vibrer(motif = 200) {
  if (navigator.vibrate) navigator.vibrate(motif);
}

/** Enregistre le service worker (PWA, ajout à l'écran d'accueil). */
export function enregistrerPWA(chemin) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(chemin).catch(() => {});
  }
}
