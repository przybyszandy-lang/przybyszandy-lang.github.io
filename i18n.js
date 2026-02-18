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
      update_available: "Update available.",
      update_refresh: "Refresh",
      install_msg: "Install Donkey App for a faster, full-screen experience.",
      install_btn: "Install",
      install_not_now: "Not now",
      install_ios_msg: "On iPhone: Share → Add to Home Screen.",
      install_ok: "OK",
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
      update_available: "Dostępna jest aktualizacja.",
      update_refresh: "Odśwież",
      install_msg: "Zainstaluj Donkey App, aby korzystać szybciej i w trybie pełnoekranowym.",
      install_btn: "Zainstaluj",
      install_not_now: "Nie teraz",
      install_ios_msg: "Na iPhonie: Udostępnij → Dodaj do ekranu głównego.",
      install_ok: "OK",
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
      update_available: "Aktualisierung verfügbar.",
      update_refresh: "Aktualisieren",
      install_msg: "Installiere Donkey App für ein schnelleres, vollbildiges Erlebnis.",
      install_btn: "Installieren",
      install_not_now: "Jetzt nicht",
      install_ios_msg: "Auf dem iPhone: Teilen → Zum Home-Bildschirm.",
      install_ok: "OK",
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
      update_available: "Actualización disponible.",
      update_refresh: "Actualizar",
      install_msg: "Instala Donkey App para una experiencia más rápida y a pantalla completa.",
      install_btn: "Instalar",
      install_not_now: "Ahora no",
      install_ios_msg: "En iPhone: Compartir → Añadir a pantalla de inicio.",
      install_ok: "OK",
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
      update_available: "Mise à jour disponible.",
      update_refresh: "Actualiser",
      install_msg: "Installe Donkey App pour une expérience plus rapide et en plein écran.",
      install_btn: "Installer",
      install_not_now: "Pas maintenant",
      install_ios_msg: "Sur iPhone : Partager → Sur l’écran d’accueil.",
      install_ok: "OK",
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
