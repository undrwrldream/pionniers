/* =====================================================================
   MODE-ENSEIGNANT.JS — MATH ÉMULATION (version de classe, hébergée)
   ---------------------------------------------------------------------
   Le livre de l'enseignant : la version de classe ouverte par
   enseignant.html (avec le mot de passe de l'enseignant).

   Ce qu'il change, et SEULEMENT quand le mode enseignant est allumé
   (drapeau dans sessionStorage, posé par enseignant.html pour cet onglet) :
     • Plus rien ne va dans la feuille Google : tous les appels au script
       Apps Script sont servis ici, depuis l'appareil (localStorage, clés
       « pionniers_ens:… »). L'or, l'XP, les rapports et les erreurs de
       l'enseignant ne touchent donc jamais la classe (force du groupe,
       console, rapports détaillés restent propres).
       Exceptions, en LECTURE seulement : la liste des élèves (?eleves=1), et l'arène
       (arene_combat.html), qui combat avec les vrais coffres de la classe.
     • window.MODE_ENSEIGNANT = true : ouvertures-core.js se comporte comme
       dans l'atelier (tout ouvert, ou les vrais verrous au choix), le
       gardien de sortie et le rapporteur d'erreurs se taisent, et la fiche
       de personnage montre le panneau « Enseignant ».

   Sans le drapeau, ce fichier ne fait RIEN : les élèves ne voient aucune différence.
   Inséré par outils/construire_production.py au début de chaque page, avant
   garde-classe.js, stockage-classe.js et passerelle-core.js.
   ===================================================================== */
(function(){
  if(window.__modeEnseignantCharge) return;
  window.__modeEnseignantCharge = true;

  const DRAPEAU = 'pionniers_mode_enseignant';
  const PREFIXE = 'pionniers_ens:';
  let actif = false;
  try{ actif = sessionStorage.getItem(DRAPEAU) === '1'; }catch(e){}
  window.MODE_ENSEIGNANT = actif;
  if(!actif) return;

  function lire(cle){ try{ return localStorage.getItem(PREFIXE + cle); }catch(e){ return null; } }
  function ecrire(cle, valeur){ try{ localStorage.setItem(PREFIXE + cle, String(valeur)); }catch(e){} }
  function cles(){
    const liste = [];
    try{
      for(let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if(k && k.indexOf(PREFIXE) === 0) liste.push(k.slice(PREFIXE.length));
      }
    }catch(e){}
    return liste;
  }
  function reponse(objet){
    return new Response(JSON.stringify(objet), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  // L'adresse du script est lue au moment de l'appel (config-classe.js peut être chargé après ce fichier).
  function versScript(adresse){
    const cfg = window.CONFIG_CLASSE || {};
    if(!cfg.URL_SCRIPT || !adresse) return false;
    try{ return String(adresse).split('?')[0] === cfg.URL_SCRIPT; }catch(e){ return false; }
  }

  const vraiFetch = window.fetch ? window.fetch.bind(window) : null;
  const ARENE = /arene_combat\.html$/i.test(location.pathname);
  window.fetch = async function(entree, options){
    const adresse = typeof entree === 'string' ? entree : (entree && entree.url) || '';
    if(!versScript(adresse)) return vraiFetch(entree, options);
    const methode = ((options && options.method) || 'GET').toUpperCase();
    if(methode === 'POST'){
      let corps = {};
      try{ corps = JSON.parse(options.body); }catch(e){}
      if(corps && typeof corps.cle === 'string' && ('valeur' in corps)) ecrire(corps.cle, corps.valeur);
      return reponse({ ok: true });   // rapports, erreurs, parties : avalés sans bruit
    }
    const p = new URL(adresse, location.href).searchParams;
    if(p.has('eleves')) return vraiFetch(entree, options);          // la vraie liste des élèves (lecture seulement)
    if(ARENE) return vraiFetch(entree, options);                    // l'arène combat avec la vraie classe (lecture seulement)
    if(p.has('cle')){ const v = lire(p.get('cle')); return reponse({ value: v === null ? null : v }); }
    if(p.has('cles')){   // lecture groupée de clés exactes (stockage-classe.js, version 2)
      const valeurs = {};
      (p.get('cles') || '').split(',').filter(Boolean).forEach(k => { valeurs[k] = lire(k); });
      return reponse({ valeurs });
    }
    if(p.has('lot')){
      const prefixes = (p.get('lot') || '').split(',').filter(Boolean);
      const valeurs = {};
      cles().forEach(k => { if(prefixes.some(x => k.indexOf(x) === 0)) valeurs[k] = lire(k); });
      return reponse({ valeurs });
    }
    if(p.has('liste')){ const x = p.get('liste') || ''; return reponse({ keys: cles().filter(k => k.indexOf(x) === 0) }); }
    return reponse({ ok: true });
  };
  if(navigator.sendBeacon){
    const vraiBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(adresse, donnees){ return versScript(adresse) ? true : vraiBeacon(adresse, donnees); };
  }

  window.ModeEnseignant = {
    PREFIXE, cles,
    effacerTout(){ cles().forEach(k => { try{ localStorage.removeItem(PREFIXE + k); }catch(e){} }); },
    quitter(){ try{ sessionStorage.removeItem(DRAPEAU); }catch(e){} }
  };
})();
