import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit, startAfter
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";

// Config Firebase
const firebaseConfig = {
      apiKey: "AIzaSyDYiXjIGccT_jD8a6C4iW8gMgh1ruby6sg",
      authDomain: "gestionale-kneip.firebaseapp.com",
      projectId: "gestionale-kneip",
      storageBucket: "gestionale-kneip.firebasestorage.app",
      messagingSenderId: "154033977872",
      appId: "1:154033977872:web:e7c5d15698ad6ccf4f2895",
      measurementId: "G-ER3BHZWYP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

async function startApp() {
  await checkAppStatus(); // aspetta il controllo prima di avviare
  const configRef = doc(db, "config", "appStatus");
  const snap = await getDoc(configRef);

  if (snap.exists()) {
    const data = snap.data();
    if (!data.enabled) {
      document.body.innerHTML = `<h1>${data.message}</h1>`;
      // blocca l'esecuzione qui
      return Promise.reject("App disattivata");
    }
  } else {
    console.error("Documento di configurazione non trovato");
  }
}

startApp();


//Check if the license is still on.
async function checkAppStatus() {
  
}

checkAppStatus();

// Detect page
const bodyHTML = document.querySelector("body").innerHTML;
const isIndexPage = bodyHTML.includes("Inserisci");
const isContoPage = window.location.pathname.includes("conto.html");

// Variabili comuni
let lista = document.getElementById("lista");
let saldoSpan = document.getElementById("saldo");

// Funzioni comuni
function getOggi() {
  const oggi = new Date();
  oggi.setMinutes(oggi.getMinutes() - oggi.getTimezoneOffset());
  return oggi.toISOString().split("T")[0];
}

function getMinuto() {
  const oggi = new Date();
  const ore = String(oggi.getHours()).padStart(2, '0');
  const minuti = String(oggi.getMinutes()).padStart(2, '0');
  return `${ore}:${minuti}`;
}

// INDEX PAGE
if (isIndexPage) {
  const descrizioneInput = document.getElementById("descrizione");
  const orarioInput = document.getElementById("orario");
  const dataInput = document.getElementById("data");

  window.aggiungiTransazione = async function () {
    const descrizione = descrizioneInput.value.trim();
    const orario = orarioInput.value;
    const data = dataInput.value;

    if (!descrizione || !orario || !data) {
      alert("Compila tutti i campi!");
      return;
    }

    await addDoc(collection(db, "clienti"), {
      descrizione,
      orario,
      data
    });

    alert("Cliente aggiunto!");
    resetCampi();
  };

  window.resetCampi = function () {
    descrizioneInput.value = "";
    orarioInput.value = getMinuto();
    dataInput.value = getOggi();
  };

  window.scaricaBackup = async function () {
    const q = query(collection(db, "clienti"), orderBy("data", "asc"));
    const snapshot = await getDocs(q);
    const dati = snapshot.docs.map(doc => doc.data());

    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CLIENTI_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  document.addEventListener("DOMContentLoaded", () => {
    orarioInput.value = getMinuto();
    dataInput.value = getOggi();
  });
}