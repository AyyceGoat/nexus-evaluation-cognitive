/*
 * Page d'écoute : lit le manifeste produit par `scripts/genere-echantillons.mjs`.
 *
 * Script classique et non module : la politique de sécurité du site autorise
 * `script-src 'self'`, et un fichier séparé évite de dépendre d'une tolérance
 * sur les scripts en ligne.
 *
 * Le regroupement se fait par pays puis par genre. L'ordre n'est pas
 * décoratif : les voix de France arrivent en premier parce que ce sont les
 * seules candidates réelles pour ce produit, les autres servant de point de
 * comparaison.
 *
 * La page fonctionne sans manifeste : elle affiche alors ce qu'il faut faire
 * pour en produire un, plutôt qu'un écran vide.
 */
(function () {
  'use strict';

  var contenu = document.getElementById('contenu');

  /** Pays d'abord la France : les autres ne sont là que pour comparer. */
  var ORDRE_LOCALES = ['fr-FR', 'fr-BE', 'fr-CH', 'fr-CA'];

  var NOM_LOCALES = {
    'fr-FR': 'France',
    'fr-BE': 'Belgique',
    'fr-CH': 'Suisse',
    'fr-CA': 'Canada',
  };

  function texte(id, valeur) {
    var cible = document.getElementById(id);
    if (cible) cible.textContent = valeur;
  }

  function etiquette(valeur, accent) {
    var span = document.createElement('span');
    span.className = accent ? 'etiquette accent' : 'etiquette';
    span.textContent = valeur;
    return span;
  }

  function paragraphe(valeur, classe) {
    var p = document.createElement('p');
    if (classe) p.className = classe;
    p.textContent = valeur;
    return p;
  }

  function messageVide(detail) {
    var bloc = document.createElement('div');
    bloc.className = 'vide';

    var titre = paragraphe('Aucun échantillon pour l’instant.');
    titre.style.color = 'var(--craie)';
    titre.style.marginTop = '0';
    bloc.appendChild(titre);

    bloc.appendChild(
      paragraphe(
        'La commande ci-dessous produit un échantillon par voix française du catalogue. ' +
          'Elle ne demande ni compte ni clé : edge-tts s’adresse au moteur de lecture à ' +
          'voix haute du navigateur Edge.',
        'sous'
      )
    );

    var commande = document.createElement('p');
    var code = document.createElement('code');
    code.textContent = 'npm run echantillons';
    commande.appendChild(code);
    bloc.appendChild(commande);

    if (detail) {
      var note = paragraphe(detail, 'sous');
      note.style.fontSize = '0.875rem';
      bloc.appendChild(note);
    }

    contenu.appendChild(bloc);
  }

  function carte(v) {
    var li = document.createElement('li');

    var bandeau = document.createElement('div');
    bandeau.className = 'entete';

    var nom = document.createElement('span');
    nom.className = 'nom';
    nom.textContent = v.nom;
    bandeau.appendChild(nom);

    bandeau.appendChild(etiquette(v.genre));
    if (v.multilingue) bandeau.appendChild(etiquette('multilingue', true));
    if (v.reperesFichier) {
      bandeau.appendChild(etiquette(v.mots + ' repères de mots', true));
    }

    var identifiant = document.createElement('span');
    identifiant.className = 'id';
    identifiant.textContent = v.id + ' · ' + Math.round((v.octets || 0) / 1024) + ' ko';
    bandeau.appendChild(identifiant);

    li.appendChild(bandeau);

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'none';
    audio.src = './' + v.fichier;
    // Une seule lecture à la fois : comparer deux voix qui parlent ensemble ne
    // renseigne sur aucune des deux.
    audio.addEventListener('play', function () {
      var tous = document.querySelectorAll('audio');
      for (var i = 0; i < tous.length; i++) {
        if (tous[i] !== audio) tous[i].pause();
      }
    });
    li.appendChild(audio);

    return li;
  }

  function rendre(manifeste) {
    texte('extrait-intro', manifeste.extrait.introduction);
    texte('extrait-paragraphe', manifeste.extrait.paragraphe);
    texte('extrait-normalise', manifeste.extrait.normalise);

    var deFrance = manifeste.voix.filter(function (v) {
      return v.locale === 'fr-FR';
    }).length;

    contenu.appendChild(
      paragraphe(
        manifeste.voix.length +
          ' voix, dont ' +
          deFrance +
          ' de France. Service : ' +
          manifeste.service +
          '. Débit ' +
          manifeste.debit +
          '. Généré le ' +
          new Date(manifeste.genere).toLocaleString('fr-FR') +
          '.',
        'sous'
      )
    );

    var locales = ORDRE_LOCALES.filter(function (l) {
      return manifeste.voix.some(function (v) {
        return v.locale === l;
      });
    });

    locales.forEach(function (locale) {
      var titre = document.createElement('h2');
      titre.textContent = NOM_LOCALES[locale] || locale;
      contenu.appendChild(titre);

      if (locale !== 'fr-FR') {
        contenu.appendChild(
          paragraphe('Pour comparaison : l’accent n’est pas celui du public visé.', 'sous')
        );
      }

      [
        ['féminine', 'Féminines'],
        ['masculine', 'Masculines'],
      ].forEach(function (groupe) {
        var liste = manifeste.voix.filter(function (v) {
          return v.locale === locale && v.genre === groupe[0];
        });
        if (liste.length === 0) return;

        var sousTitre = document.createElement('h3');
        sousTitre.style.margin = '1.5rem 0 0.75rem';
        sousTitre.style.fontSize = '1rem';
        sousTitre.style.color = 'var(--brume)';
        sousTitre.style.fontWeight = '600';
        sousTitre.textContent = groupe[1] + ' (' + liste.length + ')';
        contenu.appendChild(sousTitre);

        var ul = document.createElement('ul');
        ul.className = 'voix';
        liste.forEach(function (v) {
          ul.appendChild(carte(v));
        });
        contenu.appendChild(ul);
      });
    });
  }

  fetch('./manifeste.json', { cache: 'no-store' })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error('manifeste absent (' + reponse.status + ')');

      // Le type de contenu est vérifié avant l'analyse. La redirection
      // d'application du site renvoie l'index HTML avec un statut 200 pour
      // tout chemin inexistant : sans ce contrôle, la page essaierait
      // d'analyser du HTML et afficherait une erreur de syntaxe JSON au lieu
      // de dire simplement qu'aucun échantillon n'existe encore.
      var type = reponse.headers.get('content-type') || '';
      if (type.indexOf('json') === -1) throw new Error('manifeste pas encore genere');

      return reponse.json();
    })
    .then(function (manifeste) {
      if (!manifeste.voix || manifeste.voix.length === 0) {
        throw new Error('manifeste vide');
      }
      rendre(manifeste);
    })
    .catch(function (erreur) {
      messageVide(String(erreur.message));
    });
})();
