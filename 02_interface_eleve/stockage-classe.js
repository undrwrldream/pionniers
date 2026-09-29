/* =====================================================================
   STOCKAGE-CLASSE.JS — MATH ÉMULATION (version de classe, hébergée)
   Version 2 (29 septembre 2026) : le jeu ne perd plus rien quand ça « lag ».
   ---------------------------------------------------------------------
   Pourquoi ce fichier existe
   --------------------------
   Le Grimoire, les Parchemins, le Livre d'Histoire et la fiche enregistrent
   leur progression avec window.storage (get / set / list), une fonction qui
   n'existe que dans l'environnement Claude. Ce fichier la recrée en parlant
   au script Google (onglet « Coffres »).

   Ce qui a changé (29 sept. 2026, après les premiers jours en classe)
   -------------------------------------------------------------------
   • PATIENCE AU LIEU D'ABANDON : une lecture ou une écriture qui tarde est
     réessayée sans fin (délais de plus en plus longs). Avant, après 3 échecs,
     l'erreur était avalée : l'or était annoncé mais jamais enregistré, ou un
     coffre VIDE était lu à la place du vrai.
   • LE JEU SE FIGE : dès qu'une demande attend plus d'une seconde, un voile
     couvre tout l'écran (« Le royaume enregistre… patiente ») et bloque les
     clics jusqu'à la réponse. Le voile est posé sur la page du dessus (la fiche),
     donc il couvre aussi le livre ouvert.
   • JOURNAL SUR L'APPAREIL : chaque écriture est d'abord notée dans le
     localStorage, puis effacée quand Google confirme. Si la page se ferme avant,
     l'écriture est renvoyée au prochain chargement. Et tant qu'elle attend, c'est
     elle que l'appareil relit (jamais une vieille valeur).
   • LECTURES GROUPÉES EXACTES (?cles=) et coffre en UN appel (action « coffre »),
     avec repli automatique si le script Google n'a pas encore été mis à jour.

   Comportement volontairement identique à window.storage :
   - get() d'une clé absente lance une erreur (code "ABSENTE")
   - delete() n'existe pas en version de classe (code "NON_SUPPORTE").
   Les clés d'arrière-plan (stat_ : rapports détaillés) ne figent jamais le jeu
   et abandonnent après 3 essais, comme avant.

   Chargé APRÈS config-classe.js et AVANT passerelle-core.js.
   ===================================================================== */

(function(){
  // Dans l'environnement Claude, le vrai window.storage existe déjà : on n'y touche pas.
  if(window.storage) return;

  const CFG = window.CONFIG_CLASSE || {};
  const DELAI_ESSAI_MS = 25000;                       // un essai qui dépasse 25 s est relancé
  const PAUSES_MS = [800, 1500, 3000, 5000, 8000];    // puis 8 s entre chaque essai, sans fin
  const PAUSES_ARRIERE_PLAN_MS = [400, 1200];         // clés d'arrière-plan : 3 essais au total
  const VOILE_APRES_MS = 1000;
  const JOURNAL = 'pionniers_journal_v1';
  const JOURNAL_MAX_AGE_MS = 3 * 24 * 3600 * 1000;

  function erreur(code, message){ const e = new Error(message); e.code = code; return e; }
  function configurationValide(){ return !!CFG.URL_SCRIPT && CFG.URL_SCRIPT.indexOf('COLLE_ICI') === -1; }
  function attendre(ms){ return new Promise(r => setTimeout(r, ms)); }
  const arrierePlan = cle => /^stat_/.test(String(cle || ''));

  /* ---------------- Le voile « patiente » (sur la page du dessus) ---------------- */
  // La page du dessus (la fiche) montre le voile pour tout le monde : les livres ouverts dans
  // ses cadres lui demandent de l'afficher. Si on ne peut pas la joindre, chaque page a le sien.
  function installerVoile(){
    if(window.__pionniersVoile) return window.__pionniersVoile;
    let el = null, compte = 0, ecritures = 0, depuis = 0, minuterie = null, horloge = null;
    function creer(){
      if(el || !document.body) return;
      const st = document.createElement('style');
      st.textContent =
        '#pionniersVoile{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;' +
        'background:rgba(10,6,20,.55);cursor:wait;backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px)}' +
        '#pionniersVoile.ouvert{display:flex;animation:pvFondu .25s ease-out}' +
        '#pionniersVoile .pv-carte{max-width:min(92vw,440px);text-align:center;color:#F3E9D2;padding:22px 26px;border-radius:16px;' +
        'background:radial-gradient(ellipse at top,#2b1d4f,#120c26 75%);border:2px solid #d9a62e;box-shadow:0 10px 40px rgba(0,0,0,.6),0 0 30px rgba(168,85,247,.35);' +
        'font:600 17px/1.4 Georgia,serif}' +
        '#pionniersVoile .pv-sablier{font-size:44px;display:inline-block;animation:pvTourne 2s linear infinite}' +
        '#pionniersVoile .pv-titre{font-size:21px;color:#f5d77a;margin:8px 0 4px;font-weight:700}' +
        '#pionniersVoile .pv-petit{font-size:14px;opacity:.8;margin-top:8px}' +
        '@keyframes pvTourne{0%{transform:rotate(0)}45%{transform:rotate(180deg)}50%{transform:rotate(180deg)}95%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}' +
        '@keyframes pvFondu{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(st);
      el = document.createElement('div');
      el.id = 'pionniersVoile'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'assertive');
      el.innerHTML = '<div class="pv-carte"><div class="pv-sablier">⏳</div><div class="pv-titre">Le royaume enregistre…</div>' +
        '<div class="pv-texte">Patiente un instant, ne touche à rien.</div><div class="pv-petit"></div></div>';
      // Le voile avale tous les clics et toutes les touches.
      ['click', 'mousedown', 'pointerdown', 'touchstart', 'keydown'].forEach(t => el.addEventListener(t, e => { e.stopPropagation(); e.preventDefault(); }, true));
      document.body.appendChild(el);
    }
    function textes(){
      if(!el) return;
      const s = Math.round((Date.now() - depuis) / 1000);
      const titre = el.querySelector('.pv-titre'), texte = el.querySelector('.pv-texte'), petit = el.querySelector('.pv-petit');
      if(s < 12){ titre.textContent = ecritures ? 'Le royaume enregistre…' : 'Le royaume ouvre ton grimoire…'; texte.textContent = 'Patiente un instant, ne touche à rien.'; petit.textContent = ''; }
      else if(s < 45){ titre.textContent = 'Le royaume est lent aujourd’hui…'; texte.textContent = 'Ton travail est gardé en sécurité. Patiente encore un peu.'; petit.textContent = s + ' s'; }
      else { titre.textContent = 'Le royaume ne répond pas encore'; texte.textContent = 'Ne ferme pas la page : ton travail est gardé et sera envoyé dès que possible. Si ça dure, avertis ton enseignant.'; petit.textContent = s + ' s'; }
    }
    function montrer(){ creer(); if(!el) return; textes(); el.classList.add('ouvert'); clearInterval(horloge); horloge = setInterval(textes, 1000); }
    function cacher(){ clearTimeout(minuterie); minuterie = null; clearInterval(horloge); horloge = null; if(el) el.classList.remove('ouvert'); }
    const voile = {
      debut(ecriture){ if(ecriture) ecritures++; if(compte++ === 0){ depuis = Date.now(); minuterie = setTimeout(montrer, VOILE_APRES_MS); } },
      fin(ecriture){ if(ecriture && ecritures > 0) ecritures--; if(compte > 0 && --compte === 0) cacher(); },
      enCours(){ return compte > 0; }
    };
    window.__pionniersVoile = voile;
    return voile;
  }
  function voileHaut(){
    try{ if(window.top !== window && window.top.__pionniersVoile) return window.top.__pionniersVoile; }catch(e){ /* autre site */ }
    return installerVoile();
  }
  installerVoile();   // chaque page a le sien (utilisé si elle est la page du dessus)

  // Fermer l'onglet pendant qu'une écriture attend : le navigateur demande confirmation.
  window.addEventListener('beforeunload', e => {
    if(window.__pionniersVoile && window.__pionniersVoile.enCours()){ e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------------- Appels au script Google ---------------- */
  async function unEssai(url, options){
    const controle = new AbortController();
    const minuterie = setTimeout(() => controle.abort(), DELAI_ESSAI_MS);
    try{
      const res = await fetch(url, Object.assign({ signal: controle.signal, cache: 'no-store' }, options || {}));
      return await res.json();
    }catch(e){
      throw erreur('RESEAU', 'Le script Google est injoignable : ' + (e && e.message ? e.message : e));
    }finally{
      clearTimeout(minuterie);
    }
  }

  // patient = true : réessaie sans fin et fige le jeu pendant l'attente.
  // valide(data) : une réponse « serveur occupé » est traitée comme une panne passagère.
  async function appeler(url, options, patient, valide){
    if(!configurationValide()) throw erreur('CONFIG', "config-classe.js : l'adresse du script Google n'est pas encore renseignée.");
    const voile = patient ? voileHaut() : null;
    const ecriture = !!(options && options.method === 'POST');
    if(voile) voile.debut(ecriture);
    try{
      for(let i = 0; ; i++){
        try{
          const data = await unEssai(url, options);
          if(!valide || valide(data)) return data;
          throw erreur('SERVEUR', (data && data.error) || 'Réponse illisible.');
        }catch(e){
          const pauses = patient ? PAUSES_MS : PAUSES_ARRIERE_PLAN_MS;
          if(!patient && i >= pauses.length) throw e;
          await attendre(pauses[Math.min(i, pauses.length - 1)] + Math.random() * 400);
        }
      }
    }finally{
      if(voile) voile.fin(ecriture);
    }
  }

  /* ---------------- Journal des écritures (sur l'appareil) ---------------- */
  // Chaque page a un numéro de session et signale toutes les 5 s qu'elle est encore ouverte.
  // Au chargement, on ne renvoie QUE les écritures des pages fermées (jamais celles qu'une
  // autre page ouverte — la fiche, le Grimoire — est encore en train d'envoyer).
  const SESSION = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const VIVANT = 'pionniers_vivant_';
  function battre(){ try{ localStorage.setItem(VIVANT + SESSION, String(Date.now())); }catch(e){} }
  function vivante(session){ try{ return Date.now() - Number(localStorage.getItem(VIVANT + session) || 0) < 15000; }catch(e){ return false; } }
  battre(); setInterval(battre, 5000);
  window.addEventListener('pagehide', () => { try{ localStorage.removeItem(VIVANT + SESSION); }catch(e){} });

  function lireJournal(){
    try{ const j = JSON.parse(localStorage.getItem(JOURNAL) || '[]'); return Array.isArray(j) ? j : []; }catch(e){ return []; }
  }
  function ecrireJournal(j){ try{ localStorage.setItem(JOURNAL, JSON.stringify(j)); }catch(e){ /* plein ou interdit : on continue sans */ } }
  function noter(entree){ const j = lireJournal(); j.push(entree); ecrireJournal(j); }
  function effacer(id){ ecrireJournal(lireJournal().filter(x => x.id !== id)); }
  // Dernière valeur en attente pour une clé (écrite sur cet appareil, pas encore confirmée par Google).
  function enAttentePour(cle){
    const j = lireJournal();
    for(let i = j.length - 1; i >= 0; i--) if(j[i].corps && j[i].corps.cle === cle) return j[i].corps.valeur;
    return null;
  }

  const reponseOk = d => !!(d && d.ok);
  // Une erreur passagère du serveur (occupé, verrou) se réessaie; un vrai refus (secret) s'arrête.
  const passagere = d => !!(d && d.error && /occupé|impossible|lock|timed out|service|limite|trop/i.test(d.error));
  async function envoyerEtVerifier(corpsSansSecret){
    const patient = !arrierePlan(corpsSansSecret.cle);
    const corps = Object.assign({}, corpsSansSecret, { secret: CFG.SECRET_PARTAGE });
    const data = await appeler(CFG.URL_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // évite le "preflight" CORS
      body: JSON.stringify(corps)
    }, patient, d => reponseOk(d) || (!!d && !!d.error && !passagere(d)));
    if(!reponseOk(data)) throw erreur('ECRITURE', (data && data.error) || "L'enregistrement a été refusé.");
    return data;
  }

  // Au chargement : on renvoie, dans l'ordre, ce que des pages fermées n'avaient pas fait confirmer.
  // Toute nouvelle écriture ou lecture attend ce rejeu : une vieille valeur ne passe jamais après une neuve.
  const aRejouer = lireJournal().filter(x => x && x.corps && Date.now() - (x.quand || 0) < JOURNAL_MAX_AGE_MS && !vivante(x.session));
  let rejeu = null;
  function rejouerJournal(){
    if(rejeu) return rejeu;
    rejeu = (async () => {
      for(const entree of aRejouer){
        if(!lireJournal().some(x => x.id === entree.id)) continue;   // une autre page l'a déjà renvoyée
        try{ await envoyerEtVerifier(entree.corps); }catch(e){ /* refusée pour de bon (ex. secret changé) : on l'oublie */ }
        effacer(entree.id);
      }
      // Ménage : les entrées trop vieilles.
      ecrireJournal(lireJournal().filter(x => x && x.corps && Date.now() - (x.quand || 0) < JOURNAL_MAX_AGE_MS));
    })();
    return rejeu;
  }

  async function ecrire(corps){
    await rejouerJournal();
    const journaliser = !arrierePlan(corps.cle);
    const entree = { id: SESSION + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), session: SESSION, quand: Date.now(), corps };
    if(journaliser) noter(entree);
    try{
      return await envoyerEtVerifier(corps);
    }finally{
      if(journaliser) effacer(entree.id);
    }
  }

  /* ---------------- Lectures groupées ---------------- */
  const LOT_DELAI_MS = 30, LOT_MAX = 40;
  let enAttente = [], minuterieLot = null;
  let serveurConnaitCles = true;   // faux si le script Google n'a pas encore la version 3 (?cles=)

  function repondre(d, valeur){
    const locale = enAttentePour(d.cle);
    if(locale !== null && locale !== undefined) valeur = locale;   // on relit toujours ce qu'on vient d'écrire
    if(valeur === null || valeur === undefined || valeur === '') d.rejeter(erreur('ABSENTE', 'Clé introuvable : ' + d.cle));
    else d.resoudre({ key: d.cle, value: String(valeur), shared: true });
  }
  async function envoyerLot(){
    if(minuterieLot){ clearTimeout(minuterieLot); minuterieLot = null; }
    const groupe = enAttente; enAttente = [];
    if(!groupe.length) return;
    await rejouerJournal();
    const patient = groupe.some(d => !arrierePlan(d.cle));
    try{
      if(groupe.length === 1){
        const data = await appeler(CFG.URL_SCRIPT + '?cle=' + encodeURIComponent(groupe[0].cle), null, patient, d => !!d && !d.error);
        repondre(groupe[0], data.value);
        return;
      }
      const cles = [...new Set(groupe.map(d => d.cle))];
      let data = null;
      if(serveurConnaitCles){
        data = await appeler(CFG.URL_SCRIPT + '?cles=' + encodeURIComponent(cles.join(',')), null, patient, d => !!d && (!!d.valeurs || /clé manquante/.test(d.error || '')));
        if(!data.valeurs) serveurConnaitCles = false;   // ancien script : repli sur ?lot=
      }
      if(!serveurConnaitCles){
        data = await appeler(CFG.URL_SCRIPT + '?lot=' + encodeURIComponent(cles.join(',')), null, patient, d => !!d && !!d.valeurs);
      }
      groupe.forEach(d => repondre(d, data.valeurs[d.cle]));   // chaque clé exacte
    }catch(e){
      groupe.forEach(d => d.rejeter(e));
    }
  }

  window.storage = {
    __classe: true,

    // Les lectures demandées presque en même temps partent ensemble en UNE seule requête.
    get(cle /*, shared */){
      return new Promise((resoudre, rejeter) => {
        enAttente.push({ cle, resoudre, rejeter });
        if(enAttente.length >= LOT_MAX) envoyerLot();
        else if(!minuterieLot) minuterieLot = setTimeout(envoyerLot, LOT_DELAI_MS);
      });
    },

    async set(cle, valeur /*, shared */){
      await ecrire({ cle: cle, valeur: String(valeur) });
      return { key: cle, value: String(valeur), shared: true };
    },

    // Le coffre en un seul appel : le script Google fait lui-même la rotation des copies de secours.
    // (Un ancien script ignore « action » et écrit simplement la clé : ça marche aussi.)
    async ecrireCoffre(slug, enveloppeTexte){
      await ecrire({ action: 'coffre', cle: 'coffre_' + slug, bak1: 'coffre_bak1_' + slug, bak2: 'coffre_bak2_' + slug, valeur: String(enveloppeTexte) });
      return true;
    },

    async list(prefixe /*, shared */){
      const p = prefixe || '';
      await rejouerJournal();
      const data = await appeler(CFG.URL_SCRIPT + '?liste=' + encodeURIComponent(p), null, true, d => !!d && !d.error);
      return { keys: data.keys || [], prefix: p, shared: true };
    },

    async delete(/* cle */){
      throw erreur('NON_SUPPORTE', "La suppression n'existe pas dans la version de classe (les données ne se suppriment que dans la feuille Google).");
    }
  };

  // Rejeu du journal dès le chargement (sans attendre une première lecture).
  if(configurationValide()) setTimeout(() => { rejouerJournal(); }, 300);
})();
