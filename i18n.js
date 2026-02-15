// i18n.js
(() => {
  const DICTS = {
    English: {
      show_lang: "Show jokes in:",
      press_first: "Press me to get a joke",
      press_next: "Another joke",
      loading: "Loading jokes...",
      error_loading: "Error loading jokes.",
      no_jokes: "No jokes available.",
      thanks_vote: "Thanks for your vote.",
      vote_failed: "Vote failed (try again).",
      copied: "Joke copied!",
      copy_failed: "Copy failed (browser blocked it).",
      add_joke: "Want to add a joke?"
    },

    Polish: {
      show_lang: "Pokaż dowcipy w:",
      press_first: "Kliknij, aby dostać dowcip",
      press_next: "Kolejny dowcip",
      loading: "Wczytywanie dowcipów...",
      error_loading: "Błąd wczytywania dowcipów.",
      no_jokes: "Brak dowcipów.",
      thanks_vote: "Dzięki za głos.",
      vote_failed: "Nie udało się oddać głosu (spróbuj ponownie).",
      copied: "Skopiowano dowcip!",
      copy_failed: "Nie udało się skopiować (przeglądarka zablokowała).",
      add_joke: "Chcesz dodać dowcip?"
    },

    German: {
      show_lang: "Witze anzeigen auf:",
      press_first: "Drück mich für einen Witz",
      press_next: "Noch ein Witz",
      loading: "Witze werden geladen...",
      error_loading: "Fehler beim Laden der Witze.",
      no_jokes: "Keine Witze verfügbar.",
      thanks_vote: "Danke für deine Bewertung.",
      vote_failed: "Bewertung fehlgeschlagen (bitte erneut versuchen).",
      copied: "Witz kopiert!",
      copy_failed: "Kopieren fehlgeschlagen (vom Browser blockiert).",
      add_joke: "Willst du einen Witz hinzufügen?"
    },

    Spanish: {
      show_lang: "Mostrar chistes en:",
      press_first: "Pulsa para ver un chiste",
      press_next: "Otro chiste",
      loading: "Cargando chistes...",
      error_loading: "Error al cargar los chistes.",
      no_jokes: "No hay chistes disponibles.",
      thanks_vote: "Gracias por tu voto.",
      vote_failed: "Error al votar (inténtalo de nuevo).",
      copied: "¡Chiste copiado!",
      copy_failed: "No se pudo copiar (el navegador lo bloqueó).",
      add_joke: "¿Quieres añadir un chiste?"
    },

    French: {
      show_lang: "Afficher les blagues en :",
      press_first: "Clique pour une blague",
      press_next: "Une autre blague",
      loading: "Chargement des blagues...",
      error_loading: "Erreur lors du chargement des blagues.",
      no_jokes: "Aucune blague disponible.",
      thanks_vote: "Merci pour ton vote.",
      vote_failed: "Vote échoué (réessaie).",
      copied: "Blague copiée !",
      copy_failed: "Copie impossible (bloquée par le navigateur).",
      add_joke: "Envie d’ajouter une blague ?"
    }
  };

  const FALLBACK_LANG = "English";

  function getLang() {
    return localStorage.getItem("donkey_lang") || FALLBACK_LANG;
  }

  function setLang(lang) {
    localStorage.setItem("donkey_lang", lang);
    window.dispatchEvent(new CustomEvent("donkey:langchange", { detail: { lang } }));
  }

  function t(key, lang) {
    const L = lang || getLang();
    return (DICTS[L] && DICTS[L][key]) ||
      (DICTS[FALLBACK_LANG] && DICTS[FALLBACK_LANG][key]) ||
      key;
  }

  window.DonkeyI18n = { t, getLang, setLang, DICTS };
})();
