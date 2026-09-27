/* =====================================================================
   XP-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   L'expérience (XP) et le rang de mage, partagés par tous les livres.

   Rangs (index = niveauLecture dans le coffre) :
     0 Apprenti   : 0 XP (départ)
     1 Novice     : 1 000 XP
     2 Invocateur : 2 500 XP
     3 Magicien   : 5 000 XP
     4 Sorcier    : 10 000 XP
     5 Archimage  : ne s'obtient PAS par l'XP (à définir plus tard)

   Sources d'XP, rangées séparément dans le coffre puis additionnées :
     coffre.xpParchemins : Parchemins de lecture (recalculé par les Parchemins)
     coffre.xpHistoire   : Livre d'Histoire (lectures, questionnaires, Cherche et trouve)
     coffre.xp           : le TOTAL (c'est ce que la fiche de personnage affiche)
   Le rang ne redescend jamais.

   Utilisation :
     XpCore.rangDepuisXp(xp) → 0..4
     XpCore.prochainSeuil(xp) → nombre ou null (plus de rang par l'XP)
     XpCore.appliquer(coffre, 'xpHistoire', valeur, bonusRang?) → { total, niveau, monte }
       (modifie le coffre ; à sauvegarder ensuite avec PasserelleCore.sauvegarderCoffre)
   ===================================================================== */
window.XpCore = (function(){
  const SEUILS = [0, 1000, 2500, 5000, 10000];
  const NOMS = ['Apprenti', 'Novice', 'Invocateur', 'Magicien', 'Sorcier', 'Archimage'];
  function rangDepuisXp(xp){ let n = 0; SEUILS.forEach((s, i) => { if((xp || 0) >= s) n = i; }); return n; }
  function prochainSeuil(xp){ const s = SEUILS.find(v => v > (xp || 0)); return s === undefined ? null : s; }
  function seuilActuel(xp){ return SEUILS[rangDepuisXp(xp)]; }
  // Anciens coffres : seule la valeur « xp » existait, écrite par les Parchemins.
  function migrer(coffre){
    if(coffre.xpParchemins === undefined && coffre.xpHistoire === undefined) coffre.xpParchemins = coffre.xp || 0;
  }
  function total(coffre){ migrer(coffre); return (coffre.xpParchemins || 0) + (coffre.xpHistoire || 0); }
  function appliquer(coffre, source, valeur, bonusRang){
    migrer(coffre);
    coffre[source] = Math.max(0, valeur || 0);
    const t = total(coffre);
    coffre.xp = t;
    const vise = Math.min(rangDepuisXp(t) + (bonusRang || 0), NOMS.length - 1);
    const avant = coffre.niveauLecture || 0;
    const monte = vise > avant;
    if(monte) coffre.niveauLecture = vise;
    return { total: t, niveau: coffre.niveauLecture || 0, monte };
  }
  return { SEUILS, NOMS, rangDepuisXp, prochainSeuil, seuilActuel, total, appliquer };
})();
