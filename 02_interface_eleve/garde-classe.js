/* =====================================================================
   GARDE-CLASSE.JS — MATH ÉMULATION (version de classe, hébergée)
   ---------------------------------------------------------------------
   Deux gardiens dans un seul fichier, insérés automatiquement dans
   TOUTES les pages de 07_production par outils/construire_production.py.
   (L'atelier de développement n'en a pas besoin et ne le charge pas.)

   1. LE GARDIEN DE SORTIE — seulement sur les pages marquées
      data-garde="sortie" (la fiche de personnage) :
        • avertissement du navigateur avant de fermer l'onglet ou de recharger ;
        • le bouton Retour du navigateur ne fait plus rien ;
        • clic droit, F12, Ctrl+Maj+I/J/C et Ctrl+U sont désactivés
          (dans toutes les pages, cadres compris).
      Aucune de ces barrières n'est infranchissable : elles découragent.

   2. LE RAPPORTEUR D'ERREURS — partout, en silence, sans JAMAIS rien
      demander à l'élève. Il recueille le plus de détails possible :
        • erreurs JavaScript (message, fichier:ligne:colonne, pile d'appels) ;
        • promesses rejetées sans traitement ;
        • console.error ;
        • images, scripts ou feuilles de style qui n'ont pas pu se charger ;
        • appels au script Google : échecs, refus, lenteurs (> 15 s) ;
        • page gelée plus de 8 secondes ;
        • onglet fermé brutalement (plantage probable) et rouvert peu après ;
      avec, pour chaque erreur : l'élève, la page, les 25 dernières actions
      (clics, ouvertures de modules, changements de page), les 12 derniers
      appels au script Google, l'appareil, le navigateur et l'écran.
      Les erreurs attendent dans l'appareil (localStorage) si le script
      Google est bloqué ou injoignable, et partent dès que ça passe.
      Destination : onglet « Erreurs » de la feuille Google.
   ===================================================================== */

(function(){
  if(window.__gardeClasse) return;          // jamais deux fois dans la même page
  window.__gardeClasse = true;

  /* ------------------------------ Réglages ------------------------------ */
  const MAX_ACTIONS = 25;             // taille du fil des dernières actions
  const MAX_APPELS = 12;              // derniers appels au script Google gardés
  const MAX_ATTENTE = 60;             // erreurs gardées dans l'appareil au maximum
  const MAX_ENVOIS_PAR_ERREUR = 3;    // une même erreur n'est envoyée que 3 fois par session
  const APPEL_LENT_MS = 15000;        // au-delà : « lenteur » signalée
  const GEL_MS = 8000;                // page figée plus longtemps que ça : « gel » signalé
  const PLANTAGE_FENETRE_MS = 10 * 60 * 1000;   // réouverture < 10 min après un arrêt brutal
  const CLE_ATTENTE = 'garde_erreurs_attente';
  const CLE_FIL = 'garde_fil';
  const CLE_APPELS = 'garde_appels';
  const CLE_COMPTES = 'garde_comptes';
  const CLE_SESSION = 'garde_session';
  const CLE_VIVANT = 'garde_vivant';

  const estHaut = (function(){ try{ return window.top === window; }catch(e){ return false; } })();
  const scriptCourant = document.currentScript;
  const gardeSortie = !!(scriptCourant && scriptCourant.getAttribute('data-garde') === 'sortie') && estHaut;
  const debutPage = Date.now();

  /* ------------------------------ Outils -------------------------------- */
  function lireJSON(stock, cle, defaut){
    try{ const v = stock.getItem(cle); return v ? JSON.parse(v) : defaut; }catch(e){ return defaut; }
  }
  function ecrireJSON(stock, cle, valeur){
    try{ stock.setItem(cle, JSON.stringify(valeur)); }catch(e){ /* stockage plein ou interdit */ }
  }
  function court(t, n){ t = String(t == null ? '' : t); return t.length > n ? t.slice(0, n) + '…' : t; }

  function config(){
    let cfg = window.CONFIG_CLASSE;
    if(!cfg){ try{ cfg = window.top.CONFIG_CLASSE; }catch(e){} }
    cfg = cfg || {};
    const ok = !!cfg.URL_SCRIPT && cfg.URL_SCRIPT.indexOf('COLLE_ICI') === -1;
    return { url: ok ? cfg.URL_SCRIPT : null, secret: cfg.SECRET_PARTAGE || '' };
  }

  function nomPage(){
    const p = location.pathname.split('/').filter(Boolean);
    return p.slice(-2).join('/') || 'index.html';
  }

  function session(){
    let s = lireJSON(sessionStorage, CLE_SESSION, null);
    if(!s){
      s = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), debut: Date.now() };
      ecrireJSON(sessionStorage, CLE_SESSION, s);
    }
    return s;
  }

  // L'élève : ?eleve= de cette page, sinon de la page du dessus, sinon le dernier connu dans cet onglet.
  function eleve(){
    function depuis(loc){
      try{
        const q = new URLSearchParams(loc.search);
        const slug = q.get('eleve');
        return slug ? (q.get('nom') ? q.get('nom') + ' (' + slug + ')' : slug) : null;
      }catch(e){ return null; }
    }
    let e = depuis(location);
    if(!e){ try{ e = depuis(window.top.location); }catch(_){} }
    if(e){ try{ sessionStorage.setItem('garde_eleve', e); }catch(_){} return e; }
    try{ return sessionStorage.getItem('garde_eleve') || '(inconnu)'; }catch(_){ return '(inconnu)'; }
  }

  function appareil(){
    const n = navigator, c = n.connection || {};
    const m = (performance && performance.memory) || null;
    return {
      navigateur: n.userAgent,
      plateforme: (n.userAgentData && n.userAgentData.platform) || n.platform || '',
      langue: n.language,
      ecran: screen.width + '×' + screen.height,
      fenetre: innerWidth + '×' + innerHeight,
      densite: window.devicePixelRatio,
      memoireAppareilGo: n.deviceMemory || null,
      processeurs: n.hardwareConcurrency || null,
      memoirePageMo: m ? Math.round(m.usedJSHeapSize / 1048576) + ' / ' + Math.round(m.jsHeapSizeLimit / 1048576) : null,
      reseau: c.effectiveType ? c.effectiveType + (c.downlink ? ' ' + c.downlink + ' Mb/s' : '') + (c.rtt ? ' rtt ' + c.rtt + ' ms' : '') : null,
      enLigne: n.onLine,
      adresse: location.href,
      pageDuDessus: (function(){ try{ return estHaut ? null : window.top.location.pathname; }catch(e){ return '(autre domaine)'; } })(),
      dansUnCadre: !estHaut,
      depuisOuvertureS: Math.round((Date.now() - debutPage) / 1000),
      visible: document.visibilityState
    };
  }

  /* ------------------------- Fil des dernières actions ------------------------- */
  function action(texte){
    const fil = lireJSON(sessionStorage, CLE_FIL, []);
    fil.push(new Date().toTimeString().slice(0, 8) + ' ' + nomPage() + ' — ' + court(texte, 160));
    while(fil.length > MAX_ACTIONS) fil.shift();
    ecrireJSON(sessionStorage, CLE_FIL, fil);
  }

  function decrireElement(el){
    if(!el || !el.tagName) return '?';
    const cible = el.closest ? (el.closest('button, a, [role="button"], input, select, textarea, label, [onclick], .square, li') || el) : el;
    let d = cible.tagName.toLowerCase();
    if(cible.id) d += '#' + cible.id;
    else if(cible.className && typeof cible.className === 'string') d += '.' + cible.className.trim().split(/\s+/).slice(0, 2).join('.');
    const txt = (cible.getAttribute && (cible.getAttribute('aria-label') || cible.getAttribute('title'))) || cible.textContent || cible.value || '';
    const t = String(txt).replace(/\s+/g, ' ').trim();
    return t ? d + ' « ' + court(t, 50) + ' »' : d;
  }

  document.addEventListener('click', e => action('clic ' + decrireElement(e.target)), true);
  document.addEventListener('change', e => {
    const el = e.target;
    if(el && el.tagName === 'SELECT') action('choix ' + decrireElement(el) + ' = ' + court(el.value, 40));
  }, true);
  document.addEventListener('visibilitychange', () => action('onglet ' + (document.visibilityState === 'visible' ? 'revenu au premier plan' : 'passé en arrière-plan')));
  window.addEventListener('message', e => {
    const d = e.data;
    if(d && typeof d === 'object' && (d.source || d.type)) action('message ' + court((d.source || '?') + ':' + (d.type || d.event || '?'), 60));
  });
  window.addEventListener('online', () => { action('connexion retrouvée'); planifierEnvoi(1500); });
  window.addEventListener('offline', () => action('connexion perdue'));
  action('ouverture de la page');

  /* ------------------------- Appels au script Google ------------------------- */
  function noterAppel(entree){
    const appels = lireJSON(sessionStorage, CLE_APPELS, []);
    appels.push(entree);
    while(appels.length > MAX_APPELS) appels.shift();
    ecrireJSON(sessionStorage, CLE_APPELS, appels);
  }

  function decrireAppel(url, options){
    let quoi = (options && options.method === 'POST') ? 'écriture' : 'lecture';
    try{
      const u = new URL(url, location.href);
      const p = u.searchParams;
      if(p.get('cle')) quoi += ' ' + p.get('cle');
      else if(p.has('lot')) quoi += ' lot ' + p.get('lot');
      else if(p.has('liste')) quoi += ' liste ' + p.get('liste');
      else if(p.has('eleves')) quoi += ' liste des élèves';
      else if(p.has('commande')) quoi += ' commande';
    }catch(e){}
    if(options && typeof options.body === 'string'){
      try{
        const b = JSON.parse(options.body);
        if(b.action === 'erreurs') return null;                 // on ne se surveille pas soi-même
        if(b.cle) quoi += ' ' + b.cle;
        else if(b.action) quoi += ' ' + b.action;
      }catch(e){}
    }
    return quoi;
  }

  if(window.fetch){
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = function(ressource, options){
      const url = typeof ressource === 'string' ? ressource : (ressource && ressource.url) || '';
      if(url.indexOf('script.google') === -1) return fetchOriginal(ressource, options);
      const quoi = decrireAppel(url, options);
      if(!quoi) return fetchOriginal(ressource, options);
      const t0 = Date.now();
      return fetchOriginal(ressource, options).then(rep => {
        const duree = Date.now() - t0;
        const entree = { a: new Date(t0).toTimeString().slice(0, 8), quoi: court(quoi, 90), ms: duree, statut: rep.status };
        // On lit une copie de la réponse pour repérer les refus du script (« error » dans le JSON).
        rep.clone().text().then(t => {
          let refus = null;
          try{ const j = JSON.parse(t); if(j && j.error) refus = j.error; }
          catch(e){ refus = 'réponse illisible (pas du JSON) : ' + court(t.replace(/\s+/g, ' '), 200); }
          if(refus) entree.refus = court(refus, 200);
          noterAppel(entree);
          if(refus) signaler('refus du script', refus, { appel: quoi, dureeMs: duree, statut: rep.status });
          else if(duree > APPEL_LENT_MS) signaler('lenteur', 'Le script Google a mis ' + Math.round(duree / 1000) + ' s à répondre', { appel: quoi });
        }).catch(() => noterAppel(entree));
        return rep;
      }, err => {
        const duree = Date.now() - t0;
        noterAppel({ a: new Date(t0).toTimeString().slice(0, 8), quoi: court(quoi, 90), ms: duree, echec: court(err && err.message || err, 120) });
        if(!(err && err.name === 'AbortError' && duree < 1000)){
          signaler('réseau', 'Appel au script Google impossible : ' + (err && err.message || err), { appel: quoi, dureeMs: duree, enLigne: navigator.onLine });
        }
        throw err;
      });
    };
  }

  /* ------------------------- Capture des erreurs ------------------------- */
  window.addEventListener('error', e => {
    const cible = e.target;
    if(cible && cible !== window && cible.tagName){
      // Une ressource (image, script, feuille de style, cadre) n'a pas pu se charger.
      const src = cible.currentSrc || cible.src || cible.href || '';
      if(!src || src.indexOf('about:blank') === 0 || src === location.href) return;   // image sans adresse : sans importance
      // Polices décoratives bloquées par un filtre : notées dans le fil, pas signalées (la page reste utilisable).
      if(/fonts\.(googleapis|gstatic)\.com/.test(src)){ action('police non chargée (filtre ?)'); return; }
      signaler('ressource introuvable', cible.tagName.toLowerCase() + ' ' + src, {});
      return;
    }
    const err = e.error;
    signaler('erreur JavaScript', e.message || (err && err.message) || 'erreur sans message', {
      endroit: (e.filename || '?') + ':' + (e.lineno || '?') + ':' + (e.colno || '?'),
      pile: err && err.stack
    });
  }, true);

  window.addEventListener('unhandledrejection', e => {
    const r = e.reason;
    const msg = r && r.message ? r.message : (typeof r === 'string' ? r : JSON.stringify(r));
    if(r && r.code === 'ABSENTE') return;    // « rien d'enregistré encore » : normal, pas une erreur
    signaler('promesse rejetée', msg || 'raison inconnue', { pile: r && r.stack, code: r && r.code });
  });

  (function surveillerConsole(){
    const orig = console.error;
    console.error = function(){
      try{
        const parties = Array.prototype.map.call(arguments, a => a instanceof Error ? (a.message + '\n' + a.stack) : (typeof a === 'object' ? JSON.stringify(a) : String(a)));
        signaler('console.error', court(parties.join(' '), 2000), {});
      }catch(e){}
      return orig.apply(console, arguments);
    };
  })();

  // Page gelée : un minuteur d'une seconde qui arrive très en retard pendant que la page est visible.
  (function surveillerGel(){
    let attendu = Date.now() + 1000;
    setInterval(() => {
      const retard = Date.now() - attendu;
      attendu = Date.now() + 1000;
      if(retard > GEL_MS && document.visibilityState === 'visible'){
        signaler('gel', 'La page est restée figée environ ' + Math.round(retard / 1000) + ' s', {});
      }
    }, 1000);
  })();

  // Fermeture brutale : la page du haut laisse un « signe de vie » ; s'il n'a pas été effacé
  // proprement (pagehide) et que l'appareil rouvre le site peu après, c'est un plantage probable.
  if(estHaut){
    const precedent = lireJSON(localStorage, CLE_VIVANT, null);
    if(precedent && !precedent.fermePropre && Date.now() - precedent.dernier < PLANTAGE_FENETRE_MS){
      signaler('fermeture brutale', "La page précédente s'est arrêtée sans se fermer normalement (plantage, gel ou onglet tué)", {
        pagePrecedente: precedent.page, elevePrecedent: precedent.eleve,
        ouverteDepuisS: Math.round((precedent.dernier - precedent.debut) / 1000),
        dernierSigneIlYaS: Math.round((Date.now() - precedent.dernier) / 1000)
      });
    }
    const vivant = { page: nomPage(), eleve: eleve(), debut: Date.now(), dernier: Date.now(), fermePropre: false };
    ecrireJSON(localStorage, CLE_VIVANT, vivant);
    setInterval(() => { vivant.dernier = Date.now(); ecrireJSON(localStorage, CLE_VIVANT, vivant); }, 15000);
    window.addEventListener('pagehide', () => {
      vivant.fermePropre = true; vivant.dernier = Date.now();
      ecrireJSON(localStorage, CLE_VIVANT, vivant);
      envoyer(true);
    });
  }

  /* ------------------------- File d'attente et envoi ------------------------- */
  function signaler(type, message, details){
    try{
      details = details || {};
      const endroit = details.endroit || '';
      const cleCompte = type + '|' + court(message, 200) + '|' + endroit;
      const comptes = lireJSON(sessionStorage, CLE_COMPTES, {});
      comptes[cleCompte] = (comptes[cleCompte] || 0) + 1;
      ecrireJSON(sessionStorage, CLE_COMPTES, comptes);

      const attente = lireJSON(localStorage, CLE_ATTENTE, []);
      const deja = attente.find(x => x.cle === cleCompte);
      if(deja){ deja.repetitions = (deja.repetitions || 1) + 1; ecrireJSON(localStorage, CLE_ATTENTE, attente); return; }
      if(comptes[cleCompte] > MAX_ENVOIS_PAR_ERREUR) return;   // déjà assez vue dans cette session

      const extra = Object.assign({}, details);
      delete extra.endroit; delete extra.pile;
      attente.push({
        cle: cleCompte,
        quand: Date.now(),
        eleve: eleve(),
        page: nomPage(),
        type: type,
        message: court(message, 3000),
        endroit: endroit,
        pile: court(details.pile || '', 6000) + (Object.keys(extra).length ? '\n\nDétails : ' + JSON.stringify(extra) : ''),
        repetitions: 1,
        actions: lireJSON(sessionStorage, CLE_FIL, []).join('\n'),
        reseau: lireJSON(sessionStorage, CLE_APPELS, []).map(a =>
          a.a + ' ' + a.quoi + ' — ' + (a.echec ? 'ÉCHEC ' + a.echec : (a.statut + (a.refus ? ' REFUS ' + a.refus : ''))) + ' (' + a.ms + ' ms)').join('\n'),
        appareil: appareil(),
        session: session().id
      });
      while(attente.length > MAX_ATTENTE) attente.shift();
      ecrireJSON(localStorage, CLE_ATTENTE, attente);
      action('⚠ ' + type + ' : ' + court(message, 80));
      planifierEnvoi(3000);
    }catch(e){ /* le rapporteur ne doit jamais lui-même casser la page */ }
  }

  let minuterieEnvoi = null, envoiEnCours = false;
  function planifierEnvoi(ms){
    if(!estHaut) return;                          // seule la page du haut envoie (les cadres déposent)
    clearTimeout(minuterieEnvoi);
    minuterieEnvoi = setTimeout(() => envoyer(false), ms);
  }

  function envoyer(enPartant){
    const cfg = config();
    if(!cfg.url || envoiEnCours) return;
    const attente = lireJSON(localStorage, CLE_ATTENTE, []);
    if(!attente.length) return;
    const lot = attente.slice(0, 20);
    const corps = JSON.stringify({ action: 'erreurs', secret: cfg.secret, erreurs: lot });
    if(enPartant){
      // La page se ferme : on tente un dernier envoi sans attendre de réponse.
      try{ navigator.sendBeacon(cfg.url, new Blob([corps], { type: 'text/plain;charset=utf-8' })); }catch(e){}
      return;
    }
    envoiEnCours = true;
    const origine = window.fetch.__original || window.fetch;
    origine(cfg.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: corps, keepalive: corps.length < 60000 })
      .then(r => r.json())
      .then(d => {
        if(d && d.ok){
          const envoyees = new Set(lot.map(x => x.cle + '@' + x.quand));
          const reste = lireJSON(localStorage, CLE_ATTENTE, []).filter(x => !envoyees.has(x.cle + '@' + x.quand));
          ecrireJSON(localStorage, CLE_ATTENTE, reste);
          if(reste.length) planifierEnvoi(2000);
        }
      })
      .catch(() => { /* bloqué ou hors ligne : les erreurs attendent dans l'appareil */ })
      .finally(() => { envoiEnCours = false; });
  }

  if(estHaut){
    planifierEnvoi(6000);                                        // ce qui attendait d'une visite précédente
    setInterval(() => { if(lireJSON(localStorage, CLE_ATTENTE, []).length) envoyer(false); }, 90000);
  }

  /* ------------------------- Gardien de sortie ------------------------- */
  let sortiePermise = false;

  // Raccourcis des outils de développement et clic droit : désactivés partout (cadres compris).
  document.addEventListener('contextmenu', e => e.preventDefault(), true);
  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    const bloque = e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
      (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c')) ||
      (e.ctrlKey && !e.shiftKey && k === 'u');
    if(bloque){ e.preventDefault(); e.stopPropagation(); action('raccourci bloqué ' + (e.ctrlKey ? 'Ctrl+' : '') + (e.shiftKey ? 'Maj+' : '') + e.key); }
  }, true);

  if(gardeSortie){
    window.addEventListener('beforeunload', e => {
      if(sortiePermise) return;
      action('tentative de quitter ou de recharger');
      e.preventDefault();
      e.returnValue = '';            // le navigateur affiche son propre avertissement
      return '';
    });
    // Bouton Retour : on ajoute une étape à l'historique, et on la remet chaque fois qu'elle est consommée.
    try{
      history.pushState({ garde: true }, '', location.href);
      window.addEventListener('popstate', () => {
        if(sortiePermise) return;
        action('bouton Retour du navigateur (bloqué)');
        history.pushState({ garde: true }, '', location.href);
      });
    }catch(e){}
  }

  /* ------------------------- Accès pour les autres pièces ------------------------- */
  window.GardeClasse = {
    signaler: (type, message, details) => signaler(type || 'signalement', message || '', details || {}),
    action: action,
    permettreSortie: () => { sortiePermise = true; },
    envoyerMaintenant: () => envoyer(false)
  };
})();
