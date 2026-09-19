/* =====================================================================
   EXERCICES-SUPP-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Module partagé pour les "exercices supplémentaires" (feuilles générées
   par l'enseignant, publiées une fois pour toutes, ciblées à tous les
   élèves ou à une liste précise).

   Chargé par grimoire-des-mathematiques.html (côté élève) et, plus tard,
   par le tableau de bord enseignant (génération + publication).

   ---------------------------------------------------------------------
   Format d'une feuille publiée (clé 'feuille_supp_<id>', shared:true) :
   {
     id: "fs175..._ab12c",
     titre: "Arrondissement — révision",
     generateurId: "arrondissement",
     dateCreation: 1234567890,
     cible: { type: "tous" } | { type: "liste", slugs: ["lea_tremblay", ...] },
     questions: [
       { enonce: "...", reponseSpec: { type: "nombre" }, reponse: { val: 48 } },
       ...
     ]
   }

   Format de la progression d'un élève sur une feuille
   (clé 'progress_supp_<slug>_<feuilleId>', shared:true) :
   {
     statut: "a_faire" | "reussi" | "a_reprendre",
     tentatives: 2,
     dernierScore: 13,
     dateDerniereTentative: 1234567890,
     dateReussite: 1234567999 | null
   }
   ===================================================================== */

window.ExercicesSuppCore = (function(){

  const PREFIXE_FEUILLE = 'feuille_supp_';

  function genererId(){
    return 'fs' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  async function lireCle(cle){
    try{
      const res = await window.storage.get(cle, true);
      return (res && res.value) ? JSON.parse(res.value) : null;
    }catch(e){ return null; }
  }

  async function ecrireCle(cle, valeur){
    try{
      await window.storage.set(cle, JSON.stringify(valeur), true);
      return true;
    }catch(e){ return false; }
  }

  /**
   * Publie une feuille. Écrit puis RELIT immédiatement pour confirmer que
   * la sauvegarde a bien pris — jamais de "succès" silencieux non vérifié.
   * Si l'écriture échoue, la feuille passée en argument (déjà générée,
   * avec ses nombres) reste intacte côté appelant : on peut réessayer
   * l'enregistrement sans jamais avoir à régénérer les nombres.
   */
  async function publierFeuille(feuille){
    const cle = PREFIXE_FEUILLE + feuille.id;
    const ecrit = await ecrireCle(cle, feuille);
    if(!ecrit) return { succes:false, feuille:null };
    const relue = await lireCle(cle);
    const valide = !!relue && JSON.stringify(relue) === JSON.stringify(feuille);
    return { succes: valide, feuille: relue };
  }

  async function listerToutesLesFeuilles(){
    try{
      const res = await window.storage.list(PREFIXE_FEUILLE, true);
      const cles = (res && res.keys) ? res.keys : [];
      const feuilles = [];
      for(const cle of cles){
        const f = await lireCle(cle);
        if(f) feuilles.push(f);
      }
      feuilles.sort((a, b) => (b.dateCreation||0) - (a.dateCreation||0));
      return feuilles;
    }catch(e){ return []; }
  }

  async function listerFeuillesPourEleve(slug){
    const toutes = await listerToutesLesFeuilles();
    return toutes.filter(f =>
      f.cible && (
        f.cible.type === 'tous' ||
        (f.cible.type === 'liste' && Array.isArray(f.cible.slugs) && f.cible.slugs.includes(slug))
      )
    );
  }

  async function chargerFeuille(id){
    return await lireCle(PREFIXE_FEUILLE + id);
  }

  function cleProgression(slug, feuilleId){
    return 'progress_supp_' + slug + '_' + feuilleId;
  }

  async function chargerProgressionFeuille(slug, feuilleId){
    const p = await lireCle(cleProgression(slug, feuilleId));
    return p || { statut:'a_faire', tentatives:0, dernierScore:null, dateDerniereTentative:null, dateReussite:null };
  }

  async function sauvegarderProgressionFeuille(slug, feuilleId, donnees){
    return await ecrireCle(cleProgression(slug, feuilleId), donnees);
  }

  return {
    genererId,
    publierFeuille,
    listerToutesLesFeuilles,
    listerFeuillesPourEleve,
    chargerFeuille,
    chargerProgressionFeuille,
    sauvegarderProgressionFeuille
  };

})();
