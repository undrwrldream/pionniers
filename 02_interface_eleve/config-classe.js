/* =====================================================================
   CONFIG-CLASSE.JS — MATH ÉMULATION (version de classe, hébergée)
   ---------------------------------------------------------------------
   Les deux valeurs ci-dessous sont les MÊMES que celles que tu colles
   dans passerelle-core.js (URL_SCRIPT et SECRET_PARTAGE).
   Ce fichier existe parce que passerelle-core.js garde ces valeurs pour
   lui seul ; les autres pièces de la version de classe (l'écran d'accueil,
   la console enseignant, l'écran du tableau, le pont de stockage) ont besoin de les lire aussi.

   ⚠️ À REMPLACER avant de déployer :
   ===================================================================== */

window.CONFIG_CLASSE = {
  // L'adresse /exec de ton déploiement Apps Script
  URL_SCRIPT: "COLLE_ICI_TON_URL_SE_TERMINANT_PAR_/exec",

  // Le même mot secret que dans le script Apps Script (constante SECRET)
  SECRET_PARTAGE: "CHANGE-MOI-AVANT-DE-DEPLOYER"
};
