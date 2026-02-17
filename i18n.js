(() => {
  const DICTS = {
    English: {
      show_lang: " ",
      press_first: "Press me to get a joke",
      press_next: "Another joke",
      previous: "Previous",
      copy_joke: "Copy Joke",
      loading: "Loading jokes...",
      error_loading: "Error loading jokes.",
      no_jokes: "No jokes available.",
      thanks_vote: "Thanks for your vote.",
      vote_failed: "Vote failed (try again).",
      copied: "Joke copied!",
      copy_failed: "Copy failed (browser blocked it).",
      add_joke: "Want to add a joke?",
      terms_note: "By clicking 'Press me to get a joke' you agree to these",
      terms_link_conditions: "Terms and Conditions",
      terms_link_cookies: "Use of Cookies",
      terms_link_privacy: "Privacy Policy",
      offline: "You are offline. Reconnect to load jokes."
    },

    Polish: {
      show_lang: " ",
      press_first: "Kliknij, aby dostać dowcip",
      press_next: "Kolejny dowcip",
      previous: "Poprzedni",
      copy_joke: "Kopiuj dowcip",
      loading: "Wczytywanie dowcipów...",
      error_loading: "Błąd wczytywania dowcipów.",
      no_jokes: "Brak dowcipów.",
      thanks_vote: "Dzięki za głos.",
      vote_failed: "Nie udało się oddać głosu (spróbuj ponownie).",
      copied: "Skopiowano dowcip!",
      copy_failed: "Nie udało się skopiować (przeglądarka zablokowała).",
      add_joke: "Chcesz dodać dowcip?",
      terms_note: "Klikając „Kliknij, aby dostać dowcip” zgadzasz się na",
      terms_link_conditions: "Warunki korzystania",
      terms_link_cookies: "Politykę cookies",
      offline: "Brak połączenia z internetem. Połącz się, aby wczytać dowcipy.",
      terms_link_privacy: "Politykę prywatności"
    },

    German: {
      show_lang: " ",
      press_first: "Drück mich für einen Witz",
      press_next: "Noch ein Witz",
      previous: "Zurück",
      copy_joke: "Witz kopieren",
      loading: "Witze werden geladen...",
      error_loading: "Fehler beim Laden der Witze.",
      no_jokes: "Keine Witze verfügbar.",
      thanks_vote: "Danke für deine Bewertung.",
      vote_failed: "Bewertung fehlgeschlagen (bitte erneut versuchen).",
      copied: "Witz kopiert!",
      copy_failed: "Kopieren fehlgeschlagen (vom Browser blockiert).",
      add_joke: "Willst du einen Witz hinzufügen?",
      terms_note: "Durch Klicken auf „Drück mich für einen Witz“ stimmst du zu",
      terms_link_conditions: "Nutzungsbedingungen",
      terms_link_cookies: "Cookie-Richtlinie",
      offline: "Du bist offline. Stelle die Verbindung wieder her, um Witze zu laden.",
      terms_link_privacy: "Datenschutzrichtlinie"
    },

    Spanish: {
      show_lang: " ",
      press_first: "Pulsa para ver un chiste",
      press_next: "Otro chiste",
      previous: "Anterior",
      copy_joke: "Copiar chiste",
      loading: "Cargando chistes...",
      error_loading: "Error al cargar los chistes.",
      no_jokes: "No hay chistes disponibles.",
      thanks_vote: "Gracias por tu voto.",
      vote_failed: "Error al votar (inténtalo de nuevo).",
      copied: "¡Chiste copiado!",
      copy_failed: "No se pudo copiar (el navegador lo bloqueó).",
      add_joke: "¿Quieres añadir un chiste?",
      terms_note: "Al pulsar «Pulsa para ver un chiste» aceptas",
      terms_link_conditions: "Términos y condiciones",
      terms_link_cookies: "Uso de cookies",
      offline: "Estás sin conexión. Conéctate para cargar chistes.",
      terms_link_privacy: "Política de privacidad"
    },

    French: {
      show_lang: " ",
      press_first: "Clique pour une blague",
      press_next: "Une autre blague",
      previous: "Précédent",
      copy_joke: "Copier la blague",
      loading: "Chargement des blagues...",
      error_loading: "Erreur lors du chargement des blagues.",
      no_jokes: "Aucune blague disponible.",
      thanks_vote: "Merci pour ton vote.",
      vote_failed: "Vote échoué (réessaie).",
      copied: "Blague copiée !",
      copy_failed: "Copie impossible (bloquée par le navigateur).",
      add_joke: "Envie d’ajouter une blague ?",
      terms_note: "En cliquant sur « Clique pour une blague » tu acceptes",
      terms_link_conditions: "Conditions d’utilisation",
      terms_link_cookies: "Utilisation des cookies",
      offline: "Vous êtes hors ligne. Reconnectez-vous pour charger des blagues.",
      terms_link_privacy: "Politique de confidentialité"
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
