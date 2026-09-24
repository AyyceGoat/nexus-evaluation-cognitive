/*
 * Écran de lancement — jauge de progression réelle.
 *
 * ── Pourquoi un fichier séparé, et non un script en ligne ──
 *
 * La politique de sécurité du contenu du site interdit `script-src 'unsafe-inline'`.
 * Un script en ligne dans `index.html` serait bloqué, et ce n'est pas la politique
 * qu'il faut plier. Ce fichier est servi depuis la même origine, donc autorisé, et
 * il pèse moins de deux kilo-octets.
 *
 * ── Ce qui rend la jauge réelle ──
 *
 * Elle ne suit pas une minuterie. Deux sources la font avancer :
 *
 *   1. les octets effectivement reçus, relevés par `PerformanceObserver` sur les
 *      ressources, rapportés au poids du chargement — poids injecté à la
 *      compilation par le greffon Vite `injecterPoidsDeChargement`, donc exact
 *      pour le bundle servi ;
 *   2. les jalons d'amorçage que l'application signale elle-même : module évalué,
 *      racine React montée, première peinture.
 *
 * Quand le réseau ne rend rien, la jauge n'avance pas. C'est voulu : une barre qui
 * progresse sans rien mesurer ment sur l'état du chargement. Le remplissage porte
 * en revanche une animation d'apparition, pour qu'un chargement lent ne ressemble
 * pas à un écran figé — du mouvement, sans fausse progression.
 *
 * ── Filet ──
 *
 * Si l'application ne signale rien au bout de `DELAI_ABANDON`, l'écran se retire
 * quand même. Mieux vaut une page vide qu'un visiteur prisonnier d'un écran de
 * chargement.
 */
(function () {
  'use strict';

  var ecran = document.getElementById('lancement');
  if (!ecran) return;

  var remplissage = ecran.querySelector('[data-remplissage]');
  var pourcentage = ecran.querySelector('[data-pourcentage]');

  /** Poids attendu du chargement, en octets. Injecté à la compilation. */
  var poidsAttendu = parseInt(ecran.getAttribute('data-poids') || '0', 10);

  /** Part de la jauge réservée au téléchargement. Le reste vient des jalons. */
  var PART_RESEAU = 78;

  /** Amorce : le premier octet est déjà une information. */
  var PLANCHER = 6;

  var DELAI_ABANDON = 12000;

  var progression = PLANCHER;
  var octets = 0;
  var termine = false;

  function peindre(valeur) {
    // Monotone : une jauge qui reculerait serait pire que pas de jauge.
    if (valeur <= progression) return;
    progression = Math.min(100, valeur);
    if (remplissage) remplissage.style.width = progression.toFixed(1) + '%';
    if (pourcentage) pourcentage.textContent = Math.round(progression) + ' %';
    ecran.setAttribute('aria-valuenow', String(Math.round(progression)));
  }

  peindre(PLANCHER);

  /* ── Source 1 : les octets reçus ─────────────────────────────────────── */

  function compter(entrees) {
    for (var i = 0; i < entrees.length; i++) {
      var e = entrees[i];
      // `transferSize` vaut 0 sur une ressource lue dans le cache : on retombe
      // sur la taille décodée, sinon un rechargement afficherait 0 %.
      var taille = e.transferSize || e.encodedBodySize || e.decodedBodySize || 0;
      octets += taille;
    }
    if (poidsAttendu > 0) {
      peindre(PLANCHER + (PART_RESEAU - PLANCHER) * Math.min(1, octets / poidsAttendu));
    }
  }

  try {
    var observateur = new PerformanceObserver(function (liste) {
      compter(liste.getEntries());
    });
    observateur.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // Navigateur sans PerformanceObserver : les jalons suffiront.
  }

  /* ── Source 2 : les jalons de l'application ──────────────────────────── */

  var JALONS = { module: 82, racine: 91, peint: 97 };

  function retirer() {
    if (!ecran.parentNode) return;
    ecran.setAttribute('data-parti', '');
    window.setTimeout(function () {
      if (ecran.parentNode) ecran.parentNode.removeChild(ecran);
    }, 340);
  }

  window.__lancement = {
    jalon: function (nom) {
      if (JALONS[nom]) peindre(JALONS[nom]);
    },
    terminer: function () {
      if (termine) return;
      termine = true;
      peindre(100);
      // Un battement, pour que la jauge pleine soit vue avant de disparaître.
      window.setTimeout(retirer, 160);
    },
  };

  window.setTimeout(function () {
    if (!termine) {
      termine = true;
      retirer();
    }
  }, DELAI_ABANDON);
})();
