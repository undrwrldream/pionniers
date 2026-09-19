/* =====================================================================
   STOCKAGE-CLASSE.JS — MATH ÉMULATION (version de classe, hébergée)
   ---------------------------------------------------------------------
   Pourquoi ce fichier existe
   --------------------------
   Le Grimoire, les Parchemins de lecture et les exercices supplémentaires
   enregistrent leur progression avec window.storage (get / set / list),
   une fonction qui n'existe que dans l'environnement Claude. Sur un vrai
   site (GitHub Pages), elle n'existe pas : sans ce pont, la progression
   des sections ne serait pas retenue et l'or pourrait être regagné à
   chaque visite.

   Ce fichier recrée window.storage en parlant au MÊME script Apps Script
   que passerelle-core.js, dans le MÊME onglet "Coffres". Aucune autre
   pièce du projet n'a besoin d'être modifiée.

   Comportement volontairement identique à window.storage :
   - get() d'une clé absente lance une erreur (code "ABSENTE")
   - une panne réseau lance une autre erreur (code "RESEAU"), après
     quelques nouvelles tentatives — pour qu'une panne passagère ne soit
     JAMAIS confondue avec "rien d'enregistré".
   - delete() n'existe pas en version de classe (code "NON_SUPPORTE").

   Chargé APRÈS config-classe.js et AVANT passerelle-core.js.
   ===================================================================== */

(function(){
  // Dans l'environnement Claude, le vrai window.storage existe déjà : on n'y touche pas.
  if(window.storage) return;

  const CFG = window.CONFIG_CLASSE || {};
  const DELAI_MAX_MS = 15000;
  const PAUSES_ENTRE_ESSAIS_MS = [400, 1200];   // 3 essais au total

  function erreur(code, message){
    const e = new Error(message);
    e.code = code;
    return e;
  }

  function configurationValide(){
    return !!CFG.URL_SCRIPT && CFG.URL_SCRIPT.indexOf('COLLE_ICI') === -1;
  }

  function attendre(ms){ return new Promise(r => setTimeout(r, ms)); }

  // Un aller-retour vers le script, avec délai maximal. Lance "RESEAU" si la
  // réponse n'est pas un JSON lisible (réseau coupé, page d'erreur Google, etc.).
  async function unEssai(url, options){
    const controle = new AbortController();
    const minuterie = setTimeout(() => controle.abort(), DELAI_MAX_MS);
    try{
      const res = await fetch(url, Object.assign({ signal: controle.signal, cache: 'no-store' }, options || {}));
      return await res.json();
    }catch(e){
      throw erreur('RESEAU', 'Le script Google est injoignable : ' + (e && e.message ? e.message : e));
    }finally{
      clearTimeout(minuterie);
    }
  }

  async function avecEssais(url, options){
    if(!configurationValide()){
      throw erreur('CONFIG', "config-classe.js : l'adresse du script Google n'est pas encore renseignée.");
    }
    let derniere;
    for(let i = 0; i <= PAUSES_ENTRE_ESSAIS_MS.length; i++){
      try{
        return await unEssai(url, options);
      }catch(e){
        derniere = e;
        if(i < PAUSES_ENTRE_ESSAIS_MS.length) await attendre(PAUSES_ENTRE_ESSAIS_MS[i]);
      }
    }
    throw derniere;
  }

  window.storage = {
    __classe: true,

    async get(cle /*, shared */){
      const data = await avecEssais(CFG.URL_SCRIPT + '?cle=' + encodeURIComponent(cle));
      if(!data || data.error) throw erreur('SERVEUR', (data && data.error) || 'Réponse illisible.');
      if(data.value === null || data.value === undefined || data.value === '') throw erreur('ABSENTE', 'Clé introuvable : ' + cle);
      return { key: cle, value: String(data.value), shared: true };
    },

    async set(cle, valeur /*, shared */){
      const data = await avecEssais(CFG.URL_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // évite le "preflight" CORS
        body: JSON.stringify({ cle: cle, valeur: String(valeur), secret: CFG.SECRET_PARTAGE })
      });
      if(!data || !data.ok) throw erreur('ECRITURE', (data && data.error) || "L'enregistrement a été refusé.");
      return { key: cle, value: String(valeur), shared: true };
    },

    async list(prefixe /*, shared */){
      const p = prefixe || '';
      const data = await avecEssais(CFG.URL_SCRIPT + '?liste=' + encodeURIComponent(p));
      if(!data || data.error) throw erreur('SERVEUR', (data && data.error) || 'Réponse illisible.');
      return { keys: data.keys || [], prefix: p, shared: true };
    },

    async delete(/* cle */){
      throw erreur('NON_SUPPORTE', "La suppression n'existe pas dans la version de classe (les données ne se suppriment que dans la feuille Google).");
    }
  };
})();
