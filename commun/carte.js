// Carte Leaflet + OpenStreetMap. Leaflet est chargé par une balise <script>
// dans la page du jeu (variable globale L).

export const COULEURS = {
  moi: "#1565c0",
  chasseur: "#e65100",
  fugitif: "#c62828",
  arbitre: "#2e7d32",
  vieux: "#9e9e9e",
};

/**
 * Crée une carte dans l'élément `el`. Renvoie un objet pour placer des marqueurs :
 *   carte.placer(id, { lat, lon, precision, couleur, texte, pointille })
 *   carte.retirer(id), carte.garder(ids), carte.centrer(pos), carte.suivre(bool)
 */
export function creerCarte(el) {
  const L = window.L;
  const map = L.map(el, { zoomControl: true, attributionControl: true }).setView([46.6, 2.4], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  const marqueurs = new Map();
  let premierCentrage = true;

  function placer(id, { lat, lon, precision = 0, couleur = COULEURS.chasseur, texte = "", pointille = false, gros = false }) {
    let m = marqueurs.get(id);
    if (!m) {
      m = {
        cercle: L.circle([lat, lon], { radius: precision, weight: 1, fillOpacity: 0.12 }).addTo(map),
        point: L.circleMarker([lat, lon], { radius: gros ? 11 : 9, weight: 3, color: "#fff", fillOpacity: 1 }).addTo(map),
      };
      m.point.bindTooltip("", { permanent: true, direction: "top", offset: [0, -10], className: "etiquette" });
      marqueurs.set(id, m);
    }
    m.cercle.setLatLng([lat, lon]).setRadius(precision || 0);
    m.cercle.setStyle({ color: couleur, fillColor: couleur, dashArray: pointille ? "6 6" : null });
    m.point.setLatLng([lat, lon]).setStyle({ fillColor: couleur, dashArray: pointille ? "4 4" : null });
    m.point.setTooltipContent(texte);
    if (texte) m.point.openTooltip(); else m.point.closeTooltip();
  }

  function retirer(id) {
    const m = marqueurs.get(id);
    if (!m) return;
    m.cercle.remove();
    m.point.remove();
    marqueurs.delete(id);
  }

  /** Retire tous les marqueurs dont l'id n'est pas dans `ids`. */
  function garder(ids) {
    const set = new Set(ids);
    for (const id of [...marqueurs.keys()]) if (!set.has(id)) retirer(id);
  }

  function centrer(pos, zoom) {
    if (!pos) return;
    map.setView([pos.lat, pos.lon], zoom || Math.max(map.getZoom(), premierCentrage ? 17 : 0));
    premierCentrage = false;
  }

  /** Centre la carte sur la première position reçue (une seule fois). */
  function centrerUneFois(pos) {
    if (premierCentrage) centrer(pos, 17);
  }

  // La carte doit être recalculée quand son conteneur change de taille.
  new ResizeObserver(() => map.invalidateSize()).observe(el);

  return { map, placer, retirer, garder, centrer, centrerUneFois };
}
