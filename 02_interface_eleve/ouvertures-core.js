/* =====================================================================
   OUVERTURES-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Qui peut ouvrir quoi, en plus des règles normales de chaque livre :

   1. L'ATELIER — dans l'atelier de développement (jamais dans la version
      de classe), tout est ouvert : chapitres, sections et documents, pour
      travailler sans obstruction. Le bouton « Verrous » de l'atelier remet
      les vrais verrous (clé atelier_tout_ouvert = 'false').
      La version de classe est reconnue à config-classe.js et au pont de
      stockage, insérés par construire_production.py : là, MODE_ATELIER
      est toujours faux et la clé de l'atelier n'est jamais lue.

   2. PAR ÉLÈVE — l'enseignant coche des chapitres pour un élève précis
      dans le Registre du Maître (Grimoire, Ctrl+Maj+M). Une clé par livre
      et par élève, qui contient la liste des ids ouverts :
        • Grimoire des mathématiques : chapitres_<identifiant>
          (ids de CHAPTERS : 'nombres', 'fractions'…)
        • Parchemins de lecture : lecture_chapitres_<identifiant>
          (ids de CHAPITRES_LECTURE ci-dessous = champ id dans DATA)
      Ces clés vont dans l'onglet Coffres : aucun changement du script Google.

   Chargé après passerelle-core.js par grimoire-des-mathematiques.html et
   parchemins-lecture.html.
   ===================================================================== */

window.Ouvertures = (function(){

  // Le livre de l'enseignant (mode-enseignant.js) se comporte comme l'atelier : tout ouvert, ou les vrais verrous au choix.
  const MODE_ATELIER = !!window.MODE_ENSEIGNANT || !(window.CONFIG_CLASSE || (window.storage && window.storage.__classe));
  const CLE_ATELIER = 'atelier_tout_ouvert';

  const PREFIXES = {
    maths:   'chapitres_',
    lecture: 'lecture_chapitres_'
  };

  // Chapitres des Parchemins de lecture qu'on peut ouvrir à un élève.
  // Les chapitres 1 (Invocations) et 2 (Conjurations) sont ouverts à tous d'emblée.
  // L'id doit être le même que le champ « id » du chapitre dans DATA (parchemins-lecture.html).
  const CHAPITRES_LECTURE = [
    { id:'lecture3', court:'3', titre:'Chapitre 3' },
    { id:'lecture4', court:'4', titre:'Chapitre 4' },
    { id:'lecture5', court:'5', titre:'Chapitre 5' },
    { id:'interdit', court:'✦', titre:'Chapitre Interdit' }
  ];

  function cle(livre, slug){ return PREFIXES[livre] + slug; }

  function lireListe(valeur){
    try{ const l = JSON.parse(valeur); return Array.isArray(l) ? l.filter(id => typeof id === 'string') : []; }
    catch(e){ return []; }
  }

  // Vrai seulement dans l'atelier, tant que le bouton n'est pas sur « verrous réels ».
  async function atelierToutOuvert(){
    if(!MODE_ATELIER) return false;
    try{
      const res = await window.storage.get(CLE_ATELIER, true);
      return !(res && res.value === 'false');
    }catch(e){ return true; }   // clé absente = tout ouvert (réglage par défaut de l'atelier)
  }

  async function chapitresEleve(livre, slug){
    if(!slug) return [];
    try{
      const res = await window.storage.get(cle(livre, slug), true);
      return (res && res.value) ? lireListe(res.value) : [];
    }catch(e){ return []; }
  }

  async function enregistrer(livre, slug, liste){
    await window.storage.set(cle(livre, slug), JSON.stringify(liste), true);
  }

  return { MODE_ATELIER, CLE_ATELIER, CHAPITRES_LECTURE, cle, lireListe, atelierToutOuvert, chapitresEleve, enregistrer };
})();
