// GPS du navigateur : suivi de position + calcul de distance.

/**
 * Suit la position du téléphone. `surPosition({lat, lon, precision, t})` est
 * appelé à chaque nouvelle mesure, `surErreur(message)` en cas de problème.
 * Renvoie une fonction pour arrêter le suivi.
 */
export function suivrePosition(surPosition, surErreur = () => {}) {
  if (!("geolocation" in navigator)) {
    surErreur("Ce navigateur ne gère pas le GPS.");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (p) => surPosition({
      lat: p.coords.latitude,
      lon: p.coords.longitude,
      precision: Math.round(p.coords.accuracy || 0),
      t: p.timestamp,
    }),
    (e) => surErreur(
      e.code === 1 ? "GPS refusé : autorise la localisation pour ce site dans les réglages du téléphone."
      : e.code === 2 ? "Position introuvable : va à découvert, loin des bâtiments."
      : "Le GPS met du temps à répondre…"
    ),
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}

/** Distance en mètres entre deux points {lat, lon} (formule de haversine). */
export function distance(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Limiteur d'envoi : renvoie true s'il faut envoyer la nouvelle position
 * (assez de temps écoulé OU assez de déplacement depuis le dernier envoi).
 */
export function limiteur({ delaiMs = 5000, metres = 5, delaiMaxMs = 20000 } = {}) {
  let dernier = null;
  return (pos) => {
    const t = Date.now();
    if (!dernier
      || t - dernier.t >= delaiMaxMs
      || (t - dernier.t >= delaiMs && distance(dernier, pos) >= metres)
      || (t - dernier.t >= 1000 && distance(dernier, pos) >= metres * 4)) {
      dernier = { ...pos, t };
      return true;
    }
    return false;
  };
}
