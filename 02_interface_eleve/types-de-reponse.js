/* =====================================================================
   TYPES-DE-REPONSE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Registre générique de "types de réponse" pour les questions du
   Grimoire et des exercices supplémentaires.

   Chaque type définit trois choses :
   - rendreChamps(question, index, valeurPrecedente) -> HTML des champs de saisie
   - lireValeurs(index) -> lit les champs actuellement affichés dans le DOM
   - estCorrecte(question, valeurs) -> compare à la bonne réponse

   Conçu pour être étendu facilement : ajouter un nouveau type de
   réponse (ex. "fraction") ne demande qu'un nouvel appel à enregistrer(),
   sans toucher au reste du système (rendu des pages, correction, etc.).
   ===================================================================== */

window.TypesDeReponse = (function(){

  const registre = {};

  function enregistrer(type, definition){
    registre[type] = definition;
  }

  function obtenir(type){
    return registre[type] || null;
  }

  /* ---------- Type "nombre" : une seule case, un seul nombre ---------- */
  enregistrer('nombre', {
    rendreChamps(question, index){
      return '<input type="text" inputmode="decimal" class="reponse-champ reponse-nombre" ' +
        'id="rep_' + index + '_val" autocomplete="off">';
    },
    lireValeurs(index){
      const el = document.getElementById('rep_' + index + '_val');
      return { val: el ? el.value : '' };
    },
    estCorrecte(question, valeurs){
      const donne = parseFloat(String(valeurs.val || '').trim().replace(',', '.'));
      const attendu = question.reponse.val;
      return !isNaN(donne) && Math.abs(donne - attendu) < 0.01;
    },
    texteDonne(valeurs){
      return String(valeurs.val || '').trim();
    },
    texteAttendu(question){
      return String(question.reponse.val);
    }
  });

  /* ---------- D'autres types (ex. "fraction") viendront s'ajouter ici ---------- */

  /* ---------- Type "mot" : une case, un mot ou une courte expression ---------- */
  enregistrer('mot', {
    rendreChamps(question, index){
      return '<input type="text" class="reponse-champ reponse-mot" ' +
        'id="rep_' + index + '_val" autocomplete="off" spellcheck="false">';
    },
    lireValeurs(index){
      const el = document.getElementById('rep_' + index + '_val');
      return { val: el ? el.value : '' };
    },
    estCorrecte(question, valeurs){
      const donne = String(valeurs.val || '').trim().toLowerCase();
      const attendu = String(question.reponse.val).trim().toLowerCase();
      return donne.length > 0 && donne === attendu;
    },
    texteDonne(valeurs){
      return String(valeurs.val || '').trim();
    },
    texteAttendu(question){
      return String(question.reponse.val);
    }
  });

  return { enregistrer, obtenir };

})();
