// Garde l'écran allumé pendant la partie (Screen Wake Lock API).
// Le verrou saute quand l'écran s'éteint ou qu'on change d'appli :
// on le redemande dès que la page redevient visible.

let verrou = null;
let actif = false;

async function demander() {
  if (!actif || !("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    verrou = await navigator.wakeLock.request("screen");
    verrou.addEventListener("release", () => { verrou = null; });
  } catch (e) {
    // Refusé (batterie faible…) : pas grave, on réessaiera.
  }
}

document.addEventListener("visibilitychange", () => { if (!verrou) demander(); });

/** Active le maintien de l'écran. Renvoie false si le navigateur ne sait pas faire. */
export function garderEcranAllume() {
  actif = true;
  demander();
  return "wakeLock" in navigator;
}

export function libererEcran() {
  actif = false;
  if (verrou) verrou.release().catch(() => {});
  verrou = null;
}
