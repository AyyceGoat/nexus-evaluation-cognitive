/*
 * Lecture d'un article avec surlignage du passage en cours.
 *
 * ── Ce que cette page démontre ──
 *
 * Que le surlignage tient sans alignement approximatif. Chaque segment de
 * l'article — introduction, titre de section, paragraphe — a été synthétisé
 * séparément, et son décalage dans le fichier concaténé est donc connu
 * exactement. Le rendu se contente de chercher, à chaque battement du lecteur,
 * le segment dont l'intervalle contient l'instant courant.
 *
 * ── Pourquoi le paragraphe et non le mot ──
 *
 * Les repères de mots existent et sont dans les données. Mais un repère ne
 * correspond pas toujours à un mot affiché : le moteur regroupe parfois deux
 * mots, et la préparation orale en réécrit certains — « XVIᵉ » devient
 * « seizième ». Surligner mot à mot demanderait une carte de correspondance
 * entre le texte lu et le texte écrit, qui n'existe pas encore. Le paragraphe,
 * lui, est exact.
 *
 * Script classique et non module : la politique de sécurité du site autorise
 * `script-src 'self'`.
 */
(function () {
  'use strict';

  var choix = document.getElementById('choix');
  var contenu = document.getElementById('contenu');

  var etat = { segments: [], noeuds: [], actif: -1, audio: null, minuteur: 0 };

  function minutes(secondes) {
    var m = Math.floor(secondes / 60);
    var s = Math.round(secondes % 60);
    return m + ' min ' + (s < 10 ? '0' : '') + s;
  }

  function messageVide(detail) {
    var bloc = document.createElement('div');
    bloc.className = 'vide';

    var titre = document.createElement('p');
    titre.style.marginTop = '0';
    titre.style.color = 'var(--craie)';
    titre.textContent = 'Aucun article lu pour l’instant.';
    bloc.appendChild(titre);

    var p = document.createElement('p');
    p.className = 'sous';
    p.textContent =
      'La commande ci-dessous produit l’audio d’un article et ses repères de ' +
      'synchronisation. Ni compte ni clé : edge-tts s’adresse au moteur de lecture ' +
      'du navigateur Edge.';
    bloc.appendChild(p);

    var cmd = document.createElement('p');
    var code = document.createElement('code');
    code.textContent =
      'node scripts/genere-audio.mjs --voix fr-FR-VivienneMultilingualNeural --articles hist_chute_rome';
    cmd.appendChild(code);
    bloc.appendChild(cmd);

    if (detail) {
      var note = document.createElement('p');
      note.className = 'sous';
      note.style.fontSize = '0.875rem';
      note.textContent = detail;
      bloc.appendChild(note);
    }

    contenu.appendChild(bloc);
  }

  /** Cherche le segment contenant l'instant donné. */
  function segmentA(instant) {
    var segments = etat.segments;
    for (var i = segments.length - 1; i >= 0; i--) {
      if (instant >= segments[i].debut) return i;
    }
    return -1;
  }

  function surligner(rang) {
    if (rang === etat.actif) return;
    if (etat.actif >= 0 && etat.noeuds[etat.actif]) {
      etat.noeuds[etat.actif].classList.remove('actif');
    }
    etat.actif = rang;
    var noeud = etat.noeuds[rang];
    if (!noeud) return;
    noeud.classList.add('actif');

    // Ramener le passage à l'écran, sans arracher la vue : seulement s'il en
    // est sorti, et en douceur.
    var boite = noeud.getBoundingClientRect();
    if (boite.top < 90 || boite.bottom > window.innerHeight - 40) {
      noeud.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function rendre(entree, donnees) {
    contenu.textContent = '';
    if (etat.minuteur) window.clearInterval(etat.minuteur);
    etat = { segments: donnees.segments, noeuds: [], actif: -1, audio: null, minuteur: 0 };

    var lecteur = document.createElement('div');
    lecteur.className = 'lecteur';

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.src = './' + entree.audio;
    lecteur.appendChild(audio);

    var infos = document.createElement('p');
    infos.className = 'infos';
    infos.textContent =
      donnees.titre +
      ' · ' +
      minutes(donnees.duree) +
      ' · ' +
      (entree.octets / 1024 / 1024).toFixed(2) +
      ' Mo · ' +
      donnees.segments.length +
      ' segments · ' +
      donnees.voix;
    lecteur.appendChild(infos);

    contenu.appendChild(lecteur);

    var article = document.createElement('article');
    donnees.segments.forEach(function (segment, rang) {
      var p = document.createElement('p');
      p.className = 'segment ' + segment.type;
      p.textContent = segment.affiche;
      p.title = 'Écouter à partir d’ici';
      p.addEventListener('click', function () {
        audio.currentTime = segment.debut;
        if (audio.paused) void audio.play();
      });
      article.appendChild(p);
      etat.noeuds.push(p);
    });
    contenu.appendChild(article);

    etat.audio = audio;

    // Le surlignage suit la POSITION, pas les évènements.
    //
    // Une première version écoutait `timeupdate` et `seeked`. Elle marchait à
    // la lecture et échouait par intermittence sur un déplacement : quand le
    // fichier n'a jamais été joué, seules ses métadonnées sont chargées, et le
    // navigateur peut enregistrer la nouvelle position sans émettre `seeked`.
    // Deux sondes identiques à quelques secondes d'intervalle ont donné deux
    // résultats différents, ce qui est le signe qu'il ne faut pas se fier à
    // l'évènement.
    //
    // Une relève périodique ne fait aucune hypothèse : elle lit la position.
    // Le coût est négligeable — sept lectures par seconde sur une vingtaine de
    // segments — et elle couvre du même geste la lecture, le déplacement à la
    // souris et une position posée par programme.
    if (etat.minuteur) window.clearInterval(etat.minuteur);
    etat.minuteur = window.setInterval(function () {
      if (!document.body.contains(audio)) {
        window.clearInterval(etat.minuteur);
        return;
      }
      surligner(audio.ended ? -1 : segmentA(audio.currentTime));
    }, 150);
  }

  function choisir(entrees) {
    entrees.forEach(function (entree, rang) {
      var bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.setAttribute('aria-pressed', rang === 0 ? 'true' : 'false');
      bouton.textContent = entree.titre + ' — ' + minutes(entree.duree);
      bouton.addEventListener('click', function () {
        for (var i = 0; i < choix.children.length; i++) {
          choix.children[i].setAttribute('aria-pressed', 'false');
        }
        bouton.setAttribute('aria-pressed', 'true');
        charger(entree);
      });
      choix.appendChild(bouton);
    });
  }

  function charger(entree) {
    fetch('./' + entree.donnees, { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (donnees) {
        rendre(entree, donnees);
      })
      .catch(function (erreur) {
        contenu.textContent = '';
        messageVide('Donnees illisibles : ' + erreur.message);
      });
  }

  fetch('./manifeste.json', { cache: 'no-store' })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error('manifeste absent (' + reponse.status + ')');
      // La redirection d'application renvoie l'index HTML avec un statut 200
      // pour tout chemin inexistant : on vérifie donc le type avant d'analyser.
      var type = reponse.headers.get('content-type') || '';
      if (type.indexOf('json') === -1) throw new Error('rien n a encore ete genere');
      return reponse.json();
    })
    .then(function (manifeste) {
      if (!manifeste.articles || manifeste.articles.length === 0) {
        throw new Error('manifeste vide');
      }
      choisir(manifeste.articles);
      charger(manifeste.articles[0]);
    })
    .catch(function (erreur) {
      messageVide(String(erreur.message));
    });
})();
