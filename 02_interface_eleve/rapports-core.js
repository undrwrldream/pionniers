/* =====================================================================
   RAPPORTS-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Collecte, en silence, ce qu'il faut pour l'onglet « Rapports détaillés »
   de la console enseignant :
     • le nombre de tentatives de chaque élève à chaque numéro;
     • le temps d'étude de chaque exercice (temps ACTIF seulement);
     • les ouvertures, les abandons et la réussite de chaque exercice.

   Qui l'utilise : le Grimoire des mathématiques et les Parchemins de lecture.
   Les documents des chapitres (dans leur fenêtre) ne touchent jamais au
   stockage : ils disent au Grimoire « numéro 4, raté » par postMessage,
   et c'est le Grimoire qui appelle ce fichier.

   Une fiche par élève et par exercice :   stat_<élève>_<exercice>
     { v:1, titre, groupe, ordre, temps (ms), ouvertures, abandons, fait,
       debut, der, q: { "<numéro>": [ratées, trouvé 0|1] } }

   Règles (volontairement simples et lisibles dans la console) :
     • Un numéro déjà trouvé ne compte plus : refaire l'exercice plus tard
       n'ajoute ni tentative ni erreur à ce numéro.
     • Une réponse vide n'est pas une tentative.
     • Le temps n'avance que si l'élève est actif : page visible ET un geste
       (clic, touche, défilement…) depuis moins de SEUIL_INACTIVITE_MS.
     • Abandon = l'élève ferme l'exercice sans l'avoir jamais réussi, après
       y avoir vraiment travaillé (au moins une tentative ou 30 s actives).
       Un clic par erreur n'est pas un abandon.

   Rien ici ne touche à l'or, au coffre ni aux récompenses. Si une écriture
   échoue, l'exercice continue normalement : il manque seulement une ligne
   au rapport.
   ===================================================================== */
(function(){
  if(window.Rapports) return;

  const PREFIXE = 'stat_';
  const SEUIL_INACTIVITE_MS = 90 * 1000;   // plus d'une minute et demie sans geste = pause
  const PAS_MS = 5000;                     // l'horloge avance par pas de 5 s
  const ENVOI_PERIODIQUE_MS = 90 * 1000;   // sauvegarde de sûreté pendant un long exercice
  const TRAVAIL_MIN_ABANDON_MS = 30 * 1000;

  // Fenêtre d'aide (aide-core.js) : après SEUIL_AIDE mauvaises réponses au même numéro,
  // puis CHANCES_APRES_CHOIX_2 autres chances si l'élève choisit « j'y arriverai par moi-même ».
  const SEUIL_AIDE = 7;
  const CHANCES_APRES_CHOIX_2 = 3;   // la 3e tentative manquée rouvre la fenêtre (verrou)

  let session = null;       // exercice en cours (un seul à la fois)
  let derniereActivite = Date.now();

  function cle(slug, exoId){ return PREFIXE + slug + '_' + exoId; }
  function vide(){ return { v:1, temps:0, ouvertures:0, abandons:0, fait:false, debut:0, der:0, q:{}, aide:{}, mains:0 }; }

  function activite(){ derniereActivite = Date.now(); }
  ['pointerdown','keydown','wheel','input','touchstart','scroll'].forEach(ev =>
    window.addEventListener(ev, activite, { capture:true, passive:true }));
  let dernierMouvement = 0;
  window.addEventListener('pointermove', () => {
    const t = Date.now();
    if(t - dernierMouvement > 2000){ dernierMouvement = t; activite(); }
  }, { capture:true, passive:true });

  // Relie aussi les gestes faits DANS une fenêtre (iframe) du même site.
  function ecouterCadre(cadre){
    try{
      const w = cadre.contentWindow;
      if(!w || w.__rapportsEcoute) return;
      w.__rapportsEcoute = true;
      ['pointerdown','keydown','wheel','input','touchstart','scroll','pointermove'].forEach(ev =>
        w.addEventListener(ev, ev === 'pointermove'
          ? () => { const t = Date.now(); if(t - dernierMouvement > 2000){ dernierMouvement = t; activite(); } }
          : activite, { capture:true, passive:true }));
    }catch(e){ /* autre site : les messages du document compteront quand même comme activité */ }
  }

  // ---------- horloge d'étude ----------
  setInterval(() => {
    if(!session) return;
    const t = Date.now();
    const actif = !document.hidden && (t - derniereActivite) < SEUIL_INACTIVITE_MS;
    if(actif){ session.delta.temps += PAS_MS; session.travailMs += PAS_MS; session.sale = true; }
    if(session.sale && t - session.dernierEnvoi > ENVOI_PERIODIQUE_MS) envoyer(session);
  }, PAS_MS);

  // ---------- lecture de la fiche existante ----------
  function charger(s){
    s.base = null;
    s.chargement = (async () => {
      try{
        const r = await window.storage.get(cle(s.slug, s.exoId), true);
        s.base = JSON.parse(r.value);
      }catch(e){
        if(e && e.code === 'RESEAU'){ s.base = null; s.baseEchec = true; return; }
        s.base = vide();   // clé absente (ou environnement Claude) : première fois
      }
      if(!s.base || typeof s.base !== 'object') s.base = vide();
      s.base.q = s.base.q || {};
      s.base.aide = s.base.aide || {};
      s.base.mains = s.base.mains || 0;
    })();
    return s.chargement;
  }

  // ---------- fusion : fiche existante + ce qui s'est passé dans cette session ----------
  function fusion(s){
    const f = JSON.parse(JSON.stringify(s.base));
    const d = s.delta;
    f.v = 1;
    f.titre = s.meta.titre || f.titre || s.exoId;
    f.groupe = s.meta.groupe || f.groupe || '';
    f.ordre = (s.meta.ordre != null) ? s.meta.ordre : (f.ordre || 0);
    if(s.meta.numeros) f.numeros = s.meta.numeros;
    f.temps = (f.temps || 0) + d.temps;
    f.ouvertures = (f.ouvertures || 0) + d.ouvertures;
    f.abandons = (f.abandons || 0) + d.abandons;
    f.fait = !!(f.fait || d.fait);
    f.debut = f.debut || d.debut;
    f.der = Math.max(f.der || 0, d.der || 0);
    f.aide = Object.assign({}, f.aide || {}, d.aide);
    f.mains = (f.mains || 0) + d.mains;
    Object.keys(d.q).forEach(n => {
      const a = f.q[n] || [0, 0], b = d.q[n];
      f.q[n] = [a[0] + b[0], (a[1] || b[1]) ? 1 : 0];
    });
    return f;
  }

  async function envoyer(s, parBalise){
    if(!s || !s.sale) return;
    const texte = (() => { try{ return s.base ? JSON.stringify(fusion(s)) : null; }catch(e){ return null; } })();
    if(parBalise){
      // La page se ferme : on confie la fiche au navigateur (il l'envoie même après la fermeture).
      if(!texte) return;
      const CFG = window.CONFIG_CLASSE;
      if(window.storage && window.storage.__classe && CFG && CFG.URL_SCRIPT && navigator.sendBeacon){
        try{
          const ok = navigator.sendBeacon(CFG.URL_SCRIPT, new Blob([JSON.stringify({ cle: cle(s.slug, s.exoId), valeur: texte, secret: CFG.SECRET_PARTAGE })], { type:'text/plain;charset=utf-8' }));
          if(ok) marquerEnvoye(s, JSON.parse(texte));
        }catch(e){}
      }else{
        window.storage.set(cle(s.slug, s.exoId), texte, true).catch(() => {});
      }
      return;
    }
    if(s.envoiEnCours) return s.envoiEnCours;
    s.envoiEnCours = (async () => {
      try{
        await s.chargement;
        if(!s.base){ await charger(s); }        // la lecture avait échoué (réseau) : on réessaie
        if(!s.base) return;                      // toujours rien : on garde tout pour le prochain envoi
        const f = fusion(s);
        s.dernierEnvoi = Date.now();
        await window.storage.set(cle(s.slug, s.exoId), JSON.stringify(f), true);
        marquerEnvoye(s, f);
      }catch(e){ /* réessai au prochain envoi */ }
      finally{ s.envoiEnCours = null; }
    })();
    return s.envoiEnCours;
  }
  // Ce qui vient d'être écrit devient la nouvelle base; le « delta » repart à zéro.
  function marquerEnvoye(s, f){
    s.base = f;
    s.delta = { temps:0, ouvertures:0, abandons:0, fait:false, debut:s.delta.debut, der:0, q:{}, aide:{}, mains:0 };
    s.sale = false;
    s.dernierEnvoi = Date.now();
  }

  // ---------- ce que le Grimoire et les Parchemins appellent ----------
  /**
   * debut(slug, exoId, meta) — l'élève ouvre un exercice.
   * meta : { titre, groupe, ordre, numeros? }
   * Ferme d'abord l'exercice précédent s'il y en avait un.
   */
  function debut(slug, exoId, meta){
    if(!slug || !exoId || !window.storage) return;
    if(session && session.slug === slug && session.exoId === exoId) return;
    if(session) fin();
    const t = Date.now();
    activite();
    session = {
      slug, exoId, meta: meta || {},
      delta: { temps:0, ouvertures:1, abandons:0, fait:false, debut:t, der:t, q:{}, aide:{}, mains:0 },
      tentatives: 0, termine: false, sale: true, dernierEnvoi: t,
      travailMs: 0
    };
    charger(session);
  }

  /** tentative(numero, correcte, options) — une réponse vérifiée (vide = ne pas appeler).
      options.sansAide : ne jamais ouvrir la fenêtre d'aide (ex. copie d'évaluation scellée). */
  function tentative(numero, correcte, options){
    const s = session;
    if(!s || numero == null || numero === '') return;
    const n = String(numero);
    activite();
    const dejaTrouve = (s.base && s.base.q && s.base.q[n] && s.base.q[n][1]) || (s.delta.q[n] && s.delta.q[n][1]);
    if(dejaTrouve) return;
    const e = s.delta.q[n] || (s.delta.q[n] = [0, 0]);
    if(correcte) e[1] = 1; else e[0]++;
    s.tentatives++;
    s.delta.der = Date.now();
    s.sale = true;
    if(!correcte && !(options && options.sansAide)) verifierAide(s, n);
  }

  // ---------- fenêtre d'aide ----------
  function etatAide(s, n){
    return s.delta.aide[n] || (s.base && s.base.aide && s.base.aide[n]) || { seuil: SEUIL_AIDE, relance: 0 };
  }
  function verifierAide(s, n){
    if(!window.Aide) return;
    const base = (s.base && s.base.q && s.base.q[n]) ? s.base.q[n][0] || 0 : 0;
    const ratees = base + (s.delta.q[n] ? s.delta.q[n][0] : 0);
    const a = etatAide(s, n);
    if(ratees < a.seuil) return;
    s.aideEnAttente = s.aideEnAttente || {};
    if(s.aideEnAttente[n]) return;      // la fenêtre est déjà ouverte pour ce numéro
    const contexte = { slug: s.slug, exoId: s.exoId, titre: s.meta.titre || '', numero: n };
    const mainLevee = () => {           // verrou posé : prochaine fenêtre dans SEUIL_AIDE erreurs
      delete s.aideEnAttente[n];
      s.delta.aide[n] = { seuil: ratees + SEUIL_AIDE, relance: 0 };
      s.delta.mains++;
      s.sale = true;
      envoyer(s);
    };
    if(a.relance){
      mainLevee();
      window.Aide.demander(contexte, { rappel: true });
      return;
    }
    s.aideEnAttente[n] = true;
    window.Aide.demander(contexte, {
      surChoix: () => { delete s.aideEnAttente[n]; s.delta.aide[n] = { seuil: ratees + CHANCES_APRES_CHOIX_2, relance: 1 }; s.sale = true; envoyer(s); },
      surMain: mainLevee
    });
  }

  /** termine() — l'exercice est réussi (même règle que la récompense). */
  function termine(){
    const s = session;
    if(!s) return;
    s.termine = true;
    s.delta.fait = true;
    s.delta.der = Date.now();
    s.sale = true;
    envoyer(s);
  }

  /** fin() — l'élève quitte l'exercice (fermeture, retour, abandon). */
  function fin(){
    const s = session;
    if(!s) return;
    session = null;
    const dejaFait = s.base && s.base.fait;
    const aTravaille = s.tentatives > 0 || s.travailMs >= TRAVAIL_MIN_ABANDON_MS;
    if(!s.termine && !dejaFait && aTravaille){ s.delta.abandons++; }
    s.delta.der = Date.now();
    s.sale = true;
    envoyer(s);
  }

  // La page se cache ou se ferme : on met la fiche en lieu sûr sans fermer l'exercice.
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && session && session.sale) envoyer(session);
  });
  window.addEventListener('pagehide', () => {
    if(!session) return;
    const s = session;
    const dejaFait = s.base && s.base.fait;
    if(!s.termine && !dejaFait && (s.tentatives > 0 || s.travailMs >= TRAVAIL_MIN_ABANDON_MS)) s.delta.abandons++;
    s.sale = true;
    session = null;
    envoyer(s, true);
  });

  window.Rapports = {
    debut, tentative, termine, fin, activite, ecouterCadre,
    enCours: () => session ? { exoId: session.exoId, slug: session.slug } : null,
    PREFIXE
  };
})();
