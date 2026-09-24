/*
 * Page d'écoute : lit le manifeste produit par `scripts/genere-echantillons.mjs`.
 *
 * Script classique et non module : la politique de sécurité du site autorise
 * `script-src 'self'`, et un fichier séparé évite de dépendre d'une tolérance
 * sur les scripts en ligne.
 *
 * La page fonctionne sans manifeste : elle affiche alors ce qu'il faut faire
 * pour en produire un, plutôt qu'un écran vide.
 */
(function () {
  'use strict';

  var contenu = document.getElementById('contenu');

  function texte(element, valeur) {
    var cible = document.getElementById(element);
    if (cible) cible.textContent = valeur;
  }

  function etiquette(valeur, accent) {
    var span = document.createElement('span');
    span.className = accent ? 'etiquette accent' : 'etiquette';
    span.textContent = valeur;
    return span;
  }

  function messageVide(detail) {
    var bloc = document.createElement('div');
    bloc.className = 'vide';

    var titre = document.createElement('p');
    titre.style.color = 'var(--craie)';
    titre.style.marginTop = '0';
    titre.textContent = 'Aucun échantillon pour l’instant.';
    bloc.appendChild(titre);

    var explication = document.createElement('p');
    explication.className = 'sous';
    explication.textContent =
      'La génération demande une clé d’API, qui n’est pas dans le dépôt. Une fois la clé ' +
      'posée dans .env, la commande ci-dessous produit un échantillon par voix française ' +
      'du service, puis remplit cette page.';
    bloc.appendChild(explication);

    var commande = document.createElement('p');
    var code = document.createElement('code');
    code.textContent = 'node scripts/genere-echantillons.mjs --service azure';
    commande.appendChild(code);
    bloc.appendChild(commande);

    if (detail) {
      var note = document.createElement('p');
      note.className = 'sous';
      note.style.fontSize = '0.875rem';
      note.textContent = detail;
      bloc.appendChild(note);
    }

    contenu.appendChild(bloc);
  }

  function rendre(manifeste) {
    texte('extrait-intro', manifeste.extrait.introduction);
    texte('extrait-paragraphe', manifeste.extrait.paragraphe);
    texte('extrait-normalise', manifeste.extrait.normalise);

    var entete = document.createElement('p');
    entete.className = 'sous';
    entete.textContent =
      manifeste.voix.length +
      ' voix, service ' +
      manifeste.service +
      ', générées le ' +
      new Date(manifeste.genere).toLocaleString('fr-FR');
    contenu.appendChild(entete);

    var groupes = [
      ['Voix féminines', 'féminine'],
      ['Voix masculines', 'masculine'],
    ];

    groupes.forEach(function (groupe) {
      var liste = manifeste.voix.filter(function (v) {
        return v.genre === groupe[1];
      });
      if (liste.length === 0) return;

      var titre = document.createElement('h2');
      titre.textContent = groupe[0] + ' (' + liste.length + ')';
      contenu.appendChild(titre);

      var ul = document.createElement('ul');
      ul.className = 'voix';

      liste.forEach(function (v) {
        var li = document.createElement('li');

        var bandeau = document.createElement('div');
        bandeau.className = 'entete';

        var nom = document.createElement('span');
        nom.className = 'nom';
        nom.textContent = v.nom || v.id;
        bandeau.appendChild(nom);

        if (v.multilingue) bandeau.appendChild(etiquette('multilingue', true));
        if (v.age) bandeau.appendChild(etiquette(v.age));
        (v.styles || []).slice(0, 3).forEach(function (style) {
          if (style) bandeau.appendChild(etiquette(style));
        });

        var identifiant = document.createElement('span');
        identifiant.className = 'id';
        identifiant.textContent = v.id + ' · ' + Math.round((v.octets || 0) / 1024) + ' ko';
        bandeau.appendChild(identifiant);

        li.appendChild(bandeau);

        var audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'none';
        audio.src = './' + v.fichier;
        // Une seule lecture à la fois : comparer deux voix qui parlent ensemble
        // ne renseigne sur aucune des deux.
        audio.addEventListener('play', function () {
          var tous = document.querySelectorAll('audio');
          for (var i = 0; i < tous.length; i++) {
            if (tous[i] !== audio) tous[i].pause();
          }
        });
        li.appendChild(audio);

        ul.appendChild(li);
      });

      contenu.appendChild(ul);
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
