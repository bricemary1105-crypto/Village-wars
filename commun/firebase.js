// Connexion Firebase : app, authentification anonyme, base temps réel, heure serveur.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInAnonymously, connectAuthEmulator,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, connectDatabaseEmulator, ref, onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

export * from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// En local (firebase emulators:start), on utilise les émulateurs.
const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);

async function chargerConfig() {
  if (firebaseConfig) return firebaseConfig;
  if (LOCAL) {
    return { apiKey: "demo", projectId: "demo-scouts", databaseURL: "https://demo-scouts-default-rtdb.firebaseio.com" };
  }
  const rep = await fetch("/__/firebase/init.json");
  if (!rep.ok) throw new Error("Configuration Firebase introuvable (voir commun/firebase-config.js)");
  return rep.json();
}

let pret = null;

/** Initialise Firebase une seule fois. Renvoie { db, uid }. */
export function initFirebase() {
  if (pret) return pret;
  pret = (async () => {
    const app = initializeApp(await chargerConfig());
    const auth = getAuth(app);
    const db = getDatabase(app);
    if (LOCAL) {
      connectAuthEmulator(auth, `http://${location.hostname}:9099`, { disableWarnings: true });
      connectDatabaseEmulator(db, location.hostname, 9000);
    }
    // Compte anonyme : aucun e-mail ni donnée perso, juste un identifiant technique
    // qui reste le même sur ce téléphone (rechargement de page OK).
    await auth.authStateReady();
    const uid = auth.currentUser ? auth.currentUser.uid : (await signInAnonymously(auth)).user.uid;
    // Décalage entre l'horloge du téléphone et celle du serveur.
    onValue(ref(db, ".info/serverTimeOffset"), (s) => { decalage = s.val() || 0; });
    return { db, uid };
  })();
  return pret;
}

let decalage = 0;
/** Heure du serveur (ms), pour que tous les téléphones aient le même chrono. */
export function maintenant() {
  return Date.now() + decalage;
}
