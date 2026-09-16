'use strict';
// Configuration Firebase + utilitaires partagés — Calor Run
// Utilisé par : live_trail.html, participants.html, podiums.html, resultats.html, statistiques.html, historique.html
// Ce fichier doit être chargé APRÈS les SDK Firebase et AVANT le <script> spécifique de chaque page.
// Il initialise l'app Firebase une seule fois et expose les fonctions utilitaires communes en variables globales.

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAIAAz51gEGKQd0EoqA3yUhvnqw3DkQiIo",
    authDomain: "calor-run.firebaseapp.com",
    databaseURL: "https://calor-run-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "calor-run",
    storageBucket: "calor-run.firebasestorage.app",
    messagingSenderId: "329949291334",
    appId: "1:329949291334:web:c71ef20268c609cf953b47",
    measurementId: "G-YVQPW6JGPK"
};

firebase.initializeApp(FIREBASE_CONFIG);

// Échappement basique pour éviter toute casse d'affichage si un champ contient < > & " '
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));

// Normalise un identifiant de course ("10", "10km", "10 km"...) vers un format unique ("10km")
const COURSE_ALIASES = {
    '10': '10km', '10km': '10km', '10 km': '10km',
    '20': '20km', '20km': '20km', '20 km': '20km'
};
const normalizeCourse = course => COURSE_ALIASES[String(course ?? '').trim()] || String(course ?? '');

// Convertit une durée en millisecondes vers "HH:MM:SS"
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// Convertit une valeur Excel (fraction de jour) en durée, en millisecondes
const excelFractionToMs = value => (Number(value) % 1) * 86400000;

// Convertit directement une valeur Excel (fraction de jour) en "HH:MM:SS"
const formatExcelTime = value => formatTime(excelFractionToMs(value));

// Abonnement Firebase sécurisé : capture les erreurs du callback pour ne jamais casser l'affichage
const safeListener = (ref, onData, onError) => {
    if (!ref || typeof ref.on !== 'function') {
        console.error('safeListener: référence Firebase invalide', ref);
        return;
    }
    ref.on('value', snapshot => {
        try {
            onData(snapshot);
        } catch (err) {
            console.error('Erreur Firebase :', err);
        }
    }, onError);
};
