/* =====================================================================
   LECTURE-MAGIQUE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Deux habiletés magiques de lecture, liées au compagnon (Bahamut / Geri),
   pour tous les élèves, sans entraînement pour l'instant :

   1. LE COMPAGNON NARRATEUR (comme un lecteur de texte)
      L'élève clique sur son compagnon → « Lis-moi le texte ». Il clique
      ensuite sur un paragraphe du livre ouvert (ou surligne un passage) :
      le compagnon le lit à voix haute et chaque mot s'illumine au fil de la
      lecture. Vitesse réglable, pause, arrêt. (Voix du navigateur : il faut
      des écouteurs en classe.)

   2. LA BOULE DE CRISTAL (comme un prédicteur de mots)
      Petite icône au-dessus du compagnon. Elle fait apparaître la boule :
      pendant que l'élève écrit dans une case réponse, les mots probables
      apparaissent DANS la boule, en lettres bleutées courbées qui suivent le
      globe. Un clic sur un mot le complète dans la case.
      Mots proposés : ceux du texte à l'écran d'abord, puis les ~20 000 mots
      français les plus fréquents (mots-fr.js, chargé à la première ouverture).

   3. LA LOUPE MAGIQUE (vocabulaire seulement)
      Icône au-dessus de la boule, présente quand une liste de vocabulaire des
      Parchemins est ouverte. En promenant la loupe sur la liste, l'élève voit
      des lueurs rougeâtres dans les ZONES où se trouvent les mots qu'il
      cherche (jamais le mot exact) : la réponse de la question en cours, ou
      sinon celles de toutes les questions pas encore réussies
      (fournies par window.MotsCherchesVocab des Parchemins).

   Chargé par interface_eleve.html après compagnon-core.js (la « fiche » :
   c'est elle qui montre la boule, le panneau du narrateur et les icônes).

   LE MÊME FICHIER est aussi chargé DANS chaque livre et chaque document, avec
   l'attribut data-agent :  <script src="lecture-magique.js" data-agent></script>
   Il y joue le rôle d'« agent » : il suit les cases réponse, lit le texte à voix
   haute et promène la loupe DANS sa page, et parle à la fiche par messages
   (postMessage). Pourquoi : quand le projet est ouvert depuis un dossier de
   l'ordinateur (file://), Chrome interdit à la fiche de lire l'intérieur des
   livres ; sans agent, la boule et le narrateur ne voyaient rien. Avec les
   agents, tout marche partout (dossier, GitHub). Une page sans agent reste
   atteinte directement quand le navigateur le permet (même site).
   Messages : agent → fiche : lm-bonjour, lm-mots, lm-narr-etat, lm-vocab, lm-loupe-etat ;
              fiche → agent : lm-etat, lm-inserer, lm-narr-cmd, lm-loupe.
   Ne touche jamais au stockage.
   ===================================================================== */
window.LectureMagique = (function(){
  const SCRIPT = document.currentScript;
  let AGENT = !!(SCRIPT && SCRIPT.hasAttribute('data-agent'));            // dans un livre ou un document
  // AUTONOME : un livre ouvert SEUL (sans la fiche autour : dans un onglet, ou dans l'outil d'aperçu) devient lui-même
  // la « fiche » des habiletés magiques : il fait apparaître le compagnon, la boule et la loupe. Ainsi, ces outils
  // sont toujours là, peu importe comment le livre est ouvert.
  let AUTONOME = false;
  const BASE = ((SCRIPT && SCRIPT.getAttribute('src')) || '').replace(/[^\/]*$/, '');   // ex. '../' pour mots-fr.js
  if(AGENT) window.__lmAgent = true;
  const MODALES = ['grimoireModal', 'parcheminsModal', 'histoireModal', 'cassiopeeModal'];
  const IMG_BOULE = 'livre_assets/boule_cristal.webp';

  /* ---------- Styles ---------- */
  function styles(){
    if(document.getElementById('lm-styles')) return;
    const s = document.createElement('style'); s.id = 'lm-styles';
    s.textContent = `
      .lm-boule-btn{ position:fixed; left:25px; bottom:88px; z-index:10001; width:46px; height:46px; border-radius:50%; cursor:pointer; padding:0;
        border:2px solid #9ab8ff; background:radial-gradient(circle at 50% 40%, #28246b, #0b0a24 70%); box-shadow:0 0 0 2px #1b1840, 0 0 14px rgba(140,180,255,.55);
        display:none; overflow:hidden; transition:transform .15s; }
      .lm-boule-btn:hover{ transform:scale(1.08); }
      .lm-boule-btn img{ width:100%; height:100%; object-fit:cover; object-position:50% 28%; transform:scale(1.35); }
      .lm-boule-btn.actif{ border-color:#d7e6ff; box-shadow:0 0 0 2px #1b1840, 0 0 20px 6px rgba(140,190,255,.8); }
      /* La boule apparaît PAR-DESSUS le livre, dans le coin en bas à gauche (juste à droite de la colonne d'icônes),
         petite pour cacher le moins possible (le bas du socle glisse sous le bord de l'écran) ; le compagnon,
         lui, apparaît dans le coin en bas à droite. */
      .lm-boule{ position:fixed; left:86px; bottom:calc(-1 * clamp(190px, 17vw, 280px) * .2); z-index:10002; width:clamp(190px, 17vw, 280px); height:auto; aspect-ratio:546 / 800; display:none; user-select:none; -webkit-user-select:none;
        filter:drop-shadow(0 12px 26px rgba(0,0,0,.6)); animation:lm-apparait .45s cubic-bezier(.2,1.3,.4,1); }
      .lm-boule.visible{ display:block; }
      @keyframes lm-apparait{ from{ opacity:0; transform:translateY(30px) scale(.85); } to{ opacity:1; transform:none; } }
      .lm-boule .lm-voile{ position:absolute; left:2%; top:.5%; width:96%; aspect-ratio:1; border-radius:50%;
        background:radial-gradient(circle at 42% 38%, rgba(40,40,110,.82), rgba(10,10,40,.92) 62%, rgba(6,6,24,.95)); }
      .lm-boule .lm-verre{ position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
      .lm-boule svg{ position:absolute; left:2%; top:.5%; width:96%; aspect-ratio:1; overflow:visible; }
      .lm-mot{ cursor:pointer; fill:#a9d8ff; font-family:'Cinzel', Georgia, serif; font-weight:700; paint-order:stroke;
        stroke:rgba(10,20,60,.35); stroke-width:1px; filter:url(#lm-lueur); transition:fill .15s; }
      .lm-mot:hover{ fill:#ffffff; }
      .lm-indice{ fill:rgba(170,200,255,.55); font-family:Georgia, serif; font-style:italic; font-size:15px; }
      .lm-socle{ position:absolute; left:0; right:0; bottom:0; height:24%; cursor:grab; touch-action:none; }
      .lm-fermer{ position:absolute; right:4%; top:2%; width:28px; height:28px; border-radius:50%; border:1px solid #9ab8ff; background:rgba(10,10,40,.8); color:#d7e6ff; cursor:pointer; font-size:14px; }
      .lm-narr{ position:fixed; right:12px; bottom:6px; z-index:10002; width:236px; display:none; flex-direction:column; align-items:flex-end; gap:4px;
        font-family:'Crimson Text', Georgia, serif; font-size:16px; line-height:1.3; transition:bottom .45s cubic-bezier(.2,1,.3,1); }
      .lm-narr.visible{ display:flex; animation:lm-narr-entre .45s cubic-bezier(.2,1.3,.4,1); }
      .lm-narr.cede{ display:none; }   /* le compagnon est déjà sur scène (menu) : un seul à la fois */
      @keyframes lm-narr-entre{ from{ opacity:0; transform:translateX(40px) scale(.92); } to{ opacity:1; transform:none; } }
      .lm-narr .lm-bulle{ position:relative; width:100%; box-sizing:border-box; background:#F4E9CF; color:#2b1d0e; border:2px solid #8B6914; border-radius:14px;
        padding:8px 10px; font-size:14.5px; box-shadow:0 8px 22px rgba(0,0,0,.45); }
      .lm-narr .lm-bulle::after{ content:""; position:absolute; right:56px; bottom:-10px; border:8px solid transparent; border-top-color:#8B6914; border-bottom:0; }
      .lm-narr > img{ height:min(110px, 15vh); width:auto; margin-right:10px; filter:drop-shadow(0 6px 10px rgba(0,0,0,.5)); }
      .lm-narr.sans-image > img{ display:none; }
      .lm-narr.sans-image .lm-bulle::after{ display:none; }
      .lm-narr .lm-tete{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
      .lm-narr .lm-tete img{ width:34px; height:34px; border-radius:50%; object-fit:cover; border:2px solid #C9A227; }
      .lm-narr .lm-tete b{ font-family:'Cinzel', Georgia, serif; font-size:12px; letter-spacing:1px; color:#7A1F1F; }
      .lm-narr .lm-boutons{ display:flex; flex-wrap:wrap; gap:5px; margin-top:8px; }
      .lm-narr button{ font:700 13px 'Crimson Text', Georgia, serif; cursor:pointer; padding:4px 8px; border-radius:8px; border:2px solid #8B6914; background:#fffaf0; color:#2b1d0e; }
      .lm-narr button.actif{ background:#C9A227; }
      .lm-narr button.stop{ background:#7A1F1F; color:#fff; border-color:#7A1F1F; }
      .lm-narr .lm-avert{ font-size:13px; color:#7a1f1f; margin-top:6px; }
      .lm-loupe-btn{ position:fixed; left:25px; bottom:142px; z-index:10001; width:46px; height:46px; border-radius:50%; cursor:pointer; padding:0; display:none;
        border:2px solid #C9A227; background:radial-gradient(circle at 50% 40%, #5a1f1f, #220a0a 72%); box-shadow:0 0 0 2px #3a1010, 0 0 14px rgba(230,90,70,.5); transition:transform .15s; }
      .lm-loupe-btn:hover{ transform:scale(1.08); }
      .lm-loupe-btn.actif{ box-shadow:0 0 0 2px #3a1010, 0 0 20px 6px rgba(255,120,90,.8); border-color:#fde68a; }
      .lm-loupe-btn svg{ width:30px; height:30px; margin-top:3px; }
    `;
    document.head.appendChild(s);
  }

  /* ---------- Les documents atteignables : la fiche + le livre ouvert + ses cadres imbriqués ---------- */
  function livreOuvert(){
    if(AUTONOME) return { contentDocument: document, contentWindow: window };   // le livre, c'est cette page
    for(const id of MODALES){ const m = document.getElementById(id); if(m && m.classList.contains('open')) return m.querySelector('iframe'); }
    return null;
  }
  function documents(){
    const out = [];
    const visiter = (doc, prof) => {
      if(!doc || prof > 4) return;
      let aSonAgent = false; try{ aSonAgent = !!doc.defaultView.__lmAgent; }catch(e){}
      if(aSonAgent && !(AGENT && doc === document)) return;    // cette page a son propre agent : il s'en occupe
      out.push(doc);
      doc.querySelectorAll('iframe').forEach(f => { try{ if(f.contentDocument && f.contentDocument.body) visiter(f.contentDocument, prof + 1); }catch(e){} });
    };
    if(AGENT){ visiter(document, 0); return out; }
    const f = livreOuvert();
    if(f){ try{ visiter(f.contentDocument, 0); }catch(e){} }
    return out;
  }

  /* ---------- Le pont entre la fiche et les agents ---------- */
  const agents = new Set();                                          // (fiche) les pages qui ont un agent
  let etatFiche = { boule: false, ecoute: false, vitesse: 1 };        // (agent) ce que la fiche a demandé
  function versFiche(msg){                                           // (agent) à tous les cadres parents : seule la fiche répond
    msg.lmAgent = true;
    let w = window;
    for(let i = 0; i < 8 && w.parent && w.parent !== w; i++){ w = w.parent; try{ w.postMessage(msg, '*'); }catch(e){} }
  }
  function diffuser(msg, sauf){                                      // (fiche) à tous les agents
    agents.forEach(w => { if(w === sauf) return; try{ if(w.closed) agents.delete(w); else w.postMessage(msg, '*'); }catch(e){ agents.delete(w); } });
  }
  function etatPourAgents(){ return { type: 'lm-etat', boule: !!(boule && boule.classList.contains('visible')), ecoute: narr.ecoute, vitesse: narr.vitesse }; }

  /* =====================================================================
     1. LA BOULE DE CRISTAL
     ===================================================================== */
  let bouton = null, boule = null, svg = null, champ = null, motsCharges = false, chargement = null;
  let agentBoule = null, motsAgent = null;   // (fiche) l'agent où l'élève écrit, et ses dernières prédictions
  function chargerMots(){
    if(motsCharges || chargement) return chargement;
    chargement = new Promise(res => {
      if(window.MOTS_FR){ motsCharges = true; res(); return; }
      const sc = document.createElement('script'); sc.src = BASE + 'mots-fr.js';
      sc.onload = () => { motsCharges = true; res(); }; sc.onerror = () => res();
      document.head.appendChild(sc);
    });
    return chargement;
  }
  const sansAccents = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let index = null;   // [{ m, s }] : mot, mot sans accents (dans l'ordre de fréquence)
  function indexDico(){
    if(index || !window.MOTS_FR) return index;
    index = window.MOTS_FR.map(m => ({ m, s: sansAccents(m) }));
    return index;
  }
  // Mots du texte à l'écran (priorité : ce sont souvent les mots de l'exercice).
  function motsDeLaPage(doc){
    const cache = doc.__lmMots;
    if(cache && Date.now() - cache.t < 4000) return cache.l;
    const t = (doc.body && doc.body.innerText || '').slice(0, 40000);
    const compte = {};
    (t.match(/[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ'’-]{3,}/g) || []).forEach(w => { w = w.replace(/^[’'-]+|[’'-]+$/g, ''); if(w.length >= 3){ const k = w.toLowerCase(); compte[k] = (compte[k] || 0) + 1; } });
    const l = Object.keys(compte).sort((a, b) => compte[b] - compte[a]).map(m => ({ m, s: sansAccents(m) }));
    doc.__lmMots = { t: Date.now(), l };
    return l;
  }
  function motEnCours(el){
    const v = el.value || '', pos = el.selectionStart == null ? v.length : el.selectionStart;
    const avant = v.slice(0, pos), m = avant.match(/[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ'’-]+$/);
    return { mot: m ? m[0] : '', debut: m ? pos - m[0].length : pos, fin: pos };
  }
  // Les 5 mots probables pour la case en cours : { liste, indice }.
  function calculer(){
    const { mot } = motEnCours(champ);
    if(!mot) return { liste: [], indice: 'Commence un mot…' };
    const p = sansAccents(mot), vus = new Set(), res = [];
    const ajouter = e => { if(res.length < 5 && e.s.startsWith(p) && e.m.length > mot.length && !vus.has(e.m)){ vus.add(e.m); res.push(e.m); } };
    motsDeLaPage(champ.ownerDocument).forEach(ajouter);
    if(res.length < 5 && indexDico()) for(const e of index){ ajouter(e); if(res.length >= 5) break; }
    const maj = /^[A-ZÀ-ÖØ-Þ]/.test(mot);
    return { liste: res.map(m => maj ? m.charAt(0).toUpperCase() + m.slice(1) : m), indice: res.length ? '' : (motsCharges ? 'Aucun mot trouvé…' : 'La boule s\'éveille…') };
  }
  function predire(){
    if(AGENT){   // l'agent calcule et envoie les mots à la fiche, qui les dessine dans la boule
      if(!etatFiche.boule || !champ || !champ.isConnected) return;
      const r = calculer(); versFiche({ type: 'lm-mots', liste: r.liste, indice: r.indice }); return;
    }
    if(!boule || !boule.classList.contains('visible')) return;
    if(champ && champ.isConnected){ const r = calculer(); dessinerMots(r.liste, r.indice); return; }
    if(agentBoule && motsAgent){ dessinerMots(motsAgent.liste, motsAgent.indice); return; }
    dessinerMots([], 'Clique dans une case réponse et commence un mot…');
  }
  // Les mots flottent dans le globe : chacun suit un arc de cercle, plus petit vers le bas, comme pris dans le verre.
  function dessinerMots(liste, indice){
    if(!svg) return;
    const R = 150, rangs = [-78, -30, 14, 56, 94];
    let defs = '<defs><filter id="lm-lueur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="f"/>' +
      '<feMerge><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    let corps = '';
    liste.forEach((m, i) => {
      const y = rangs[i], demi = Math.sqrt(Math.max(0, R * R - y * y)) * 0.86;   // largeur disponible sur cette hauteur du globe
      const courbe = 26 + Math.abs(y) * 0.12;                                        // les arcs se bombent comme le verre
      defs += '<path id="lm-arc' + i + '" d="M ' + (R - demi).toFixed(1) + ' ' + (R + y + courbe * 0.5).toFixed(1) +
        ' Q ' + R + ' ' + (R + y - courbe).toFixed(1) + ' ' + (R + demi).toFixed(1) + ' ' + (R + y + courbe * 0.5).toFixed(1) + '" fill="none"/>';
      const taille = Math.max(15, Math.min(30, (demi * 2) / Math.max(4, m.length) * 1.1)) * (i === 0 ? 1.08 : 1);
      corps += '<text class="lm-mot" data-mot="' + m.replace(/"/g, '') + '" font-size="' + taille.toFixed(1) + '" text-anchor="middle">' +
        '<textPath href="#lm-arc' + i + '" startOffset="50%">' + m + '</textPath></text>';
    });
    if(indice){   // l'indice est coupé en lignes courtes pour rester dans le globe
      const lignes = []; let l = '';
      indice.split(' ').forEach(m => { if((l + ' ' + m).trim().length > 20 && l){ lignes.push(l); l = m; } else l = (l + ' ' + m).trim(); });
      if(l) lignes.push(l);
      const y0 = R + 6 - (lignes.length - 1) * 10;
      corps += '<text class="lm-indice" text-anchor="middle">' + lignes.map((t, i) => '<tspan x="' + R + '" y="' + (y0 + i * 20) + '">' + t + '</tspan>').join('') + '</text>';
    }
    svg.innerHTML = defs + '</defs>' + corps;
  }
  // Complète le mot dans la case (fonctionne aussi avec les pages faites en React).
  function inserer(mot){
    if(!AGENT && !(champ && champ.isConnected) && agentBoule){ try{ agentBoule.postMessage({ type: 'lm-inserer', mot }, '*'); }catch(e){} return; }
    if(!champ || !champ.isConnected) return;
    const { debut, fin } = motEnCours(champ), v = champ.value || '';
    const nouveau = v.slice(0, debut) + mot + ' ' + v.slice(fin);
    const proto = champ.tagName === 'TEXTAREA' ? champ.ownerDocument.defaultView.HTMLTextAreaElement.prototype : champ.ownerDocument.defaultView.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(champ, nouveau);
    champ.dispatchEvent(new champ.ownerDocument.defaultView.Event('input', { bubbles: true }));
    const pos = debut + mot.length + 1;
    try{ champ.focus(); champ.setSelectionRange(pos, pos); }catch(e){}
    predire();
  }
  const estChamp = el => el && ((el.tagName === 'INPUT' && /^(text|search|)$/i.test(el.type || '')) || el.tagName === 'TEXTAREA');
  // Y a-t-il une case réponse visible (où la boule peut servir) dans les pages atteignables ?
  function champsVisibles(){
    for(const d of documents()){
      try{
        for(const el of d.querySelectorAll('input, textarea')){
          if(estChamp(el) && !el.disabled && !el.readOnly && el.offsetParent !== null && el.getClientRects().length) return true;
        }
      }catch(e){}
    }
    return false;
  }
  function brancher(doc){
    if(!doc || doc.__lmBranche) return;
    doc.__lmBranche = true;
    const suivre = e => { const t = e.target; if(estChamp(t)){ champ = t; if(!AGENT) agentBoule = null; predire(); } };
    doc.addEventListener('focusin', suivre, true);
    doc.addEventListener('input', suivre, true);
    doc.addEventListener('keyup', suivre, true);
    doc.addEventListener('click', e => { if(estChamp(e.target)){ champ = e.target; if(!AGENT) agentBoule = null; predire(); } narrClic(e); }, true);
    doc.addEventListener('mouseover', narrSurvol, true);
    doc.addEventListener('mouseout', narrSurvolFin, true);
  }
  setInterval(() => { if(AGENT || (boule && boule.classList.contains('visible')) || narr.ecoute) documents().forEach(brancher); }, 1000);
  function construireBoule(){
    boule = document.createElement('div'); boule.className = 'lm-boule'; boule.setAttribute('role', 'dialog'); boule.setAttribute('aria-label', 'Boule de cristal : prédiction de mots');
    boule.innerHTML = '<div class="lm-voile"></div><img class="lm-verre" src="' + IMG_BOULE + '" alt="">' +
      '<svg viewBox="0 0 300 300"></svg><div class="lm-socle" title="Glisse pour déplacer la boule"></div>' +
      '<button type="button" class="lm-fermer" title="Faire disparaître la boule">✕</button>';
    document.body.appendChild(boule);
    svg = boule.querySelector('svg');
    // Un clic sur un mot le met dans la case (mousedown : la case garde le focus).
    svg.addEventListener('mousedown', e => { const t = e.target.closest('.lm-mot'); if(t){ e.preventDefault(); inserer(t.dataset.mot); } });
    boule.querySelector('.lm-fermer').addEventListener('click', () => { bouleVoulue = false; basculerBoule(false); });
    const socle = boule.querySelector('.lm-socle'); let g = null;
    socle.addEventListener('pointerdown', e => { const r = boule.getBoundingClientRect(); g = { dx: e.clientX - r.left, dy: e.clientY - r.top }; socle.setPointerCapture(e.pointerId); });
    socle.addEventListener('pointermove', e => { if(!g) return;
      boule.style.left = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - g.dx)) + 'px';
      boule.style.top = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - g.dy)) + 'px'; boule.style.bottom = 'auto';
      boule.dataset.deplacee = '1'; scene.maj(); });
    socle.addEventListener('pointerup', () => { g = null; });
  }
  // L'élève a ouvert la boule : elle reste ouverte (changement de page, de document) jusqu'à ce qu'il la referme.
  let bouleVoulue = false;
  function basculerBoule(forcer, garderPlace){
    if(!boule) construireBoule();
    const montrer = forcer === undefined ? !boule.classList.contains('visible') : forcer;
    if(montrer && !boule.classList.contains('visible') && !garderPlace){ boule.style.left = boule.style.top = boule.style.bottom = ''; delete boule.dataset.deplacee; }   // elle revient à sa place
    boule.classList.toggle('visible', montrer);
    if(bouton) bouton.classList.toggle('actif', montrer);
    scene.maj();
    diffuser(etatPourAgents());
    if(montrer){ documents().forEach(brancher); brancher(document); chargerMots().then(predire); predire(); }
  }

  /* =====================================================================
     2. LE COMPAGNON NARRATEUR
     ===================================================================== */
  const narr = { ecoute: false, panneau: null, vitesse: 1, doc: null, morceaux: [], idx: 0, mots: [], minuterie: null, bordures: false, bloc: null };
  function voix(){
    const v = speechSynthesis.getVoices();
    return v.find(x => /fr[-_]CA/i.test(x.lang)) || v.find(x => /fr[-_]FR/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null;
  }
  function panneau(){
    if(narr.panneau) return narr.panneau;
    const p = document.createElement('div'); p.className = 'lm-narr'; p.setAttribute('aria-live', 'polite');
    document.body.appendChild(p); narr.panneau = p; return p;
  }
  function dessinerPanneau(message, etat){
    if(AGENT){   // l'agent raconte à la fiche ce qu'il fait ; c'est la fiche qui montre le panneau
      versFiche({ type: 'lm-narr-etat', message, lit: !!narr.enCours, pause: speechSynthesis.paused });
      return;
    }
    const info = window.Compagnon && window.Compagnon.infos ? window.Compagnon.infos() : { nom: 'Ton compagnon', visage: '' };
    const p = panneau();
    const lit = etat ? !!etat.lit : speechSynthesis.speaking;
    const enPause = etat ? !!etat.pause : speechSynthesis.paused;
    p.innerHTML = '<div class="lm-bulle"><div class="lm-tete">' + (info.visage ? '<img src="' + info.visage + '" alt="">' : '') + '<div><b>' + info.nom + '</b><br>' + message + '</div></div>' +
      '<div class="lm-boutons">' +
        (lit ? '<button type="button" data-a="pause">' + (enPause ? '▶ Reprendre' : '⏸ Pause') + '</button>' : '<button type="button" data-a="selection">🖍️ Lire ce que j\'ai surligné</button>') +
        '<button type="button" data-a="lent" class="' + (narr.vitesse < 1 ? 'actif' : '') + '">🐢</button>' +
        '<button type="button" data-a="normal" class="' + (narr.vitesse === 1 ? 'actif' : '') + '">🚶</button>' +
        '<button type="button" data-a="vite" class="' + (narr.vitesse > 1 ? 'actif' : '') + '">🐇</button>' +
        '<button type="button" data-a="stop" class="stop">✕ Terminer</button>' +
      '</div>' + (voix() ? '' : '<div class="lm-avert">⚠️ Aucune voix française trouvée sur cet appareil.</div>') + '</div>' +
      (info.image ? '<img src="' + info.image + '" alt="">' : '');
    p.classList.add('visible');
    scene.maj();
    p.querySelectorAll('button').forEach(b => b.addEventListener('click', () => actionPanneau(b.dataset.a)));
  }
  function lireSelection(){
    for(const d of documents()){
      const sel = d.getSelection && d.getSelection();
      if(sel && sel.rangeCount && String(sel).trim()){ lireRange(d, sel.getRangeAt(0)); return true; }
    }
    return false;
  }
  function actionPanneau(a){
    if(AGENT){   // commandes reçues de la fiche
      if(a === 'stop'){ arreterNarrateur(); return; }
      if(a === 'silence'){ try{ speechSynthesis.cancel(); }catch(e){} narr.enCours = false; clearTimeout(narr.minuterie); effacerSurlignage(); return; }
      if(a === 'pause'){ if(speechSynthesis.paused) speechSynthesis.resume(); else speechSynthesis.pause(); dessinerPanneau(speechSynthesis.paused ? 'En pause.' : 'Je lis…'); return; }
      if(a === 'selection'){ lireSelection(); return; }
      return;
    }
    if(a === 'stop'){ arreterNarrateur(); return; }
    if(a === 'pause'){
      if(narr.agentLit){ try{ narr.agentLit.postMessage({ type: 'lm-narr-cmd', a: 'pause' }, '*'); }catch(e){} return; }
      if(speechSynthesis.paused) speechSynthesis.resume(); else speechSynthesis.pause(); dessinerPanneau(speechSynthesis.paused ? 'En pause.' : 'Je lis…'); return;
    }
    if(a === 'lent' || a === 'normal' || a === 'vite'){
      narr.vitesse = a === 'lent' ? 0.75 : a === 'vite' ? 1.25 : 1;
      diffuser(etatPourAgents());
      const lit = !!narr.agentLit || speechSynthesis.speaking;
      dessinerPanneau(lit ? 'La nouvelle vitesse commencera à la prochaine phrase.' : 'Clique sur le texte que je dois lire.', { lit, pause: false });
      return;
    }
    if(a === 'selection'){
      if(lireSelection()) return;
      diffuser({ type: 'lm-narr-cmd', a: 'selection' });   // le passage surligné est peut-être dans un livre (agent)
      clearTimeout(narr.attenteSel);
      narr.attenteSel = setTimeout(() => dessinerPanneau('Surligne d\'abord un passage avec ta souris, puis clique ici.'), 600);
    }
  }
  function narrer(){
    styles();
    if(!('speechSynthesis' in window)){ panneau(); dessinerPanneau('Désolé, cet appareil ne sait pas lire à voix haute.'); return; }
    narr.ecoute = true;
    diffuser(etatPourAgents());
    documents().forEach(brancher);
    speechSynthesis.getVoices();
    dessinerPanneau('Clique sur le texte que je dois lire. Mets tes écouteurs !');
  }
  function arreterNarrateur(){
    narr.ecoute = false; narr.enCours = false; narr.agentLit = null;
    if(!AGENT){ diffuser(etatPourAgents()); diffuser({ type: 'lm-narr-cmd', a: 'stop' }); }
    try{ speechSynthesis.cancel(); }catch(e){}
    clearInterval(narr.minuterie);
    effacerSurlignage();
    documents().forEach(d => d.querySelectorAll('.lm-survol').forEach(el => el.classList.remove('lm-survol')));
    if(narr.panneau) narr.panneau.classList.remove('visible');
    scene.maj();
  }
  // Le bloc de texte à lire sous la souris : un paragraphe, un titre, une ligne de liste, une case…
  const BLOCS = 'p, li, h1, h2, h3, h4, h5, blockquote, figcaption, td, th, label, .enonce, .texte, .legende, dd, dt';
  function blocSous(t){
    if(!t || !t.closest) return null;
    if(t.closest('input, textarea, select, .lm-narr, .lm-boule')) return null;
    // Jamais sur ce qui se clique (boutons, choix de réponse, rangées de liste, liens…) : le narrateur ne doit
    // jamais bloquer un exercice. On lit le texte, pas les commandes.
    if(t.closest('button, a[href], [role="button"], [onclick], summary, [data-sub], [data-theme], [data-id], [data-boss], [data-word], .choice-word, .text-row, .chapter-row, .evoc-liste-item, .doc-row, .back-link, .retour-bas')) return null;
    let b = t.closest(BLOCS);
    if(!b){ b = t; while(b && b.parentElement && (b.innerText || '').trim().length < 12) b = b.parentElement; }
    if(!b || !(b.innerText || '').trim() || b === b.ownerDocument.body) return null;
    return b;
  }
  function styleDoc(d){
    if(d.getElementById('lm-doc-styles')) return;
    const s = d.createElement('style'); s.id = 'lm-doc-styles';
    s.textContent = '.lm-survol{ outline:2px dashed #b8892b !important; outline-offset:3px; cursor:pointer !important; border-radius:4px; }' +
      '::highlight(lm-bloc){ background-color: rgba(253, 230, 138, 0.28); }' +
      '::highlight(lm-mot){ background-color: #fde047; color: #1b140c; }';
    (d.head || d.documentElement).appendChild(s);
  }
  function narrSurvol(e){ if(!narr.ecoute) return; const b = blocSous(e.target); if(b){ styleDoc(b.ownerDocument); b.classList.add('lm-survol'); } }
  function narrSurvolFin(e){ const b = e.target && e.target.closest && e.target.closest('.lm-survol'); if(b) b.classList.remove('lm-survol'); }
  function narrClic(e){
    if(!narr.ecoute) return;
    const b = blocSous(e.target);
    if(!b) return;
    // En mode narrateur, un clic sur le texte le fait lire (et ne déclenche rien d'autre).
    e.preventDefault(); e.stopPropagation();
    const r = b.ownerDocument.createRange(); r.selectNodeContents(b);
    lireRange(b.ownerDocument, r);
  }
  // Découpe le passage en mots (avec leur position dans le texte), puis en phrases (Chrome coupe les longues lectures).
  function lireRange(d, range){
    try{ speechSynthesis.cancel(); }catch(e){}
    clearInterval(narr.minuterie); effacerSurlignage();
    styleDoc(d);
    const racine = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode;
    const w = d.createTreeWalker(racine, NodeFilter.SHOW_TEXT, { acceptNode: n => {
      if(!range.intersectsNode(n)) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement; if(p && p.closest('script, style')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    let texte = '', mots = [], n;
    while((n = w.nextNode())){
      let t = n.nodeValue, debut = 0, fin = t.length;
      if(n === range.startContainer) debut = range.startOffset;
      if(n === range.endContainer) fin = range.endOffset;
      const morceau = t.slice(debut, fin);
      const re = /[^\s]+/g; let m;
      while((m = re.exec(morceau))){ mots.push({ node: n, s: debut + m.index, e: debut + m.index + m[0].length, c: texte.length + m.index }); }
      texte += morceau + ' ';
    }
    if(!texte.trim()){ dessinerPanneau('Je ne trouve pas de texte ici. Clique sur un paragraphe.'); return; }
    narr.doc = d; narr.mots = mots; narr.enCours = true;
    // bloc surligné doucement
    try{ const H = d.defaultView.Highlight; if(H && d.defaultView.CSS.highlights) d.defaultView.CSS.highlights.set('lm-bloc', new H(range.cloneRange())); }catch(e){}
    // phrases
    narr.morceaux = []; const reP = /[^.!?…:;]+[.!?…:;]*\s*/g; let m;
    while((m = reP.exec(texte))){ if(m[0].trim()) narr.morceaux.push({ t: m[0], c: m.index }); }
    narr.idx = 0;
    dessinerPanneau('Je lis…');
    direMorceau();
  }
  function direMorceau(){
    if(narr.idx >= narr.morceaux.length){ narr.enCours = false; effacerSurlignage(); if(narr.ecoute) dessinerPanneau('Fini ! Clique sur un autre texte, ou sur ✕ Terminer.'); return; }
    const mc = narr.morceaux[narr.idx];
    const u = new SpeechSynthesisUtterance(mc.t);
    const v = voix(); if(v){ u.voice = v; u.lang = v.lang; } else u.lang = 'fr-CA';
    u.rate = narr.vitesse;
    let bornes = false;
    u.onboundary = e => { if(e.name && e.name !== 'word') return; bornes = true; clearInterval(narr.minuterie); surlignerCar(mc.c + e.charIndex); };
    u.onstart = () => {
      // Voix sans repères de mots : on avance le surlignage à l'estimé (environ 14 lettres par seconde).
      setTimeout(() => {
        if(bornes) return;
        const mots = narr.mots.filter(x => x.c >= mc.c && x.c < mc.c + mc.t.length);
        let i = 0; const pas = () => (mots[i] ? (mots[i].e - mots[i].s + 1) : 4) * 72 / narr.vitesse;
        const avancer = () => { if(i >= mots.length) return; surlignerMot(mots[i]); const d = pas(); i++; narr.minuterie = setTimeout(avancer, d); };
        avancer();
      }, 250);
    };
    u.onend = () => { clearTimeout(narr.minuterie); narr.idx++; direMorceau(); };
    u.onerror = () => { clearTimeout(narr.minuterie); };
    speechSynthesis.speak(u);
  }
  function surlignerCar(c){ const m = narr.mots.find(x => c >= x.c && c < x.c + (x.e - x.s) + 1) || narr.mots.find(x => x.c >= c); if(m) surlignerMot(m); }
  function surlignerMot(m){
    const d = narr.doc; if(!d) return;
    try{
      const r = d.createRange(); r.setStart(m.node, m.s); r.setEnd(m.node, m.e);
      const H = d.defaultView.Highlight;
      if(H && d.defaultView.CSS.highlights) d.defaultView.CSS.highlights.set('lm-mot', new H(r));
    }catch(e){}
  }
  function effacerSurlignage(){
    documents().concat(narr.doc ? [narr.doc] : []).forEach(d => { try{ d.defaultView.CSS.highlights.delete('lm-mot'); d.defaultView.CSS.highlights.delete('lm-bloc'); }catch(e){} });
  }

  /* =====================================================================
     3. LA LOUPE MAGIQUE — les zones des mots cherchés dans la liste de vocabulaire
     ===================================================================== */
  const loupe = { actif: false, btn: null, doc: null, calque: null, anneau: null, corps: null, x: -999, y: -999, cx: -999, cy: -999 };
  function vocabDispo(){
    let w;
    if(AGENT || AUTONOME) w = window;
    else {
      const m = document.getElementById('parcheminsModal');
      if(!m || !m.classList.contains('open')) return null;
      try{ w = m.querySelector('iframe').contentWindow; if(w.__lmAgent) return null; void w.document; }catch(e){ return null; }   // avec un agent, c'est lui qui s'en occupe
    }
    const d = w && w.document; if(!d) return null;
    const p = d.getElementById('vocabPanel'), grid = d.getElementById('vocabPopupGrid');
    if(!p || !p.classList.contains('open') || !grid || typeof w.MotsCherchesVocab !== 'function' || !w.MotsCherchesVocab()) return null;
    return { w, d, p, grid, corps: p.querySelector('.vocab-panel-body') };
  }
  const hacher = t => { let h = 2166136261; for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  function stylesLoupe(d){
    if(d.getElementById('lm-loupe-styles')) return;
    const s = d.createElement('style'); s.id = 'lm-loupe-styles';
    s.textContent = '.lm-loupe-calque{ position:absolute; left:0; top:0; pointer-events:none; z-index:5; }' +
      '.lm-lueur{ position:absolute; border-radius:50%; background:radial-gradient(ellipse at center, rgba(215,30,20,.55), rgba(215,30,20,.28) 45%, rgba(215,30,20,0) 72%); animation:lm-pulse 1.8s ease-in-out infinite; }' +
      '@keyframes lm-pulse{ 0%,100%{ opacity:.8; } 50%{ opacity:1; } }' +
      '.lm-loupe-anneau{ position:fixed; width:170px; height:170px; margin:-85px 0 0 -85px; border-radius:50%; pointer-events:none; z-index:9999; display:none;' +
      ' border:6px solid #b8892b; box-shadow:0 0 0 2px #5a3a0a, inset 0 0 18px rgba(255,200,150,.35), 0 6px 16px rgba(0,0,0,.45); background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.22), rgba(255,255,255,0) 45%); }' +
      '.lm-loupe-anneau::after{ content:""; position:absolute; width:16px; height:70px; left:136px; top:130px; transform:rotate(-45deg); transform-origin:top center;' +
      ' background:linear-gradient(90deg, #4a2a0a, #8b5a1a, #4a2a0a); border-radius:6px; box-shadow:0 3px 8px rgba(0,0,0,.5); }' +
      'body.lm-loupe-active .vocab-panel-body{ cursor:none; }';
    (d.head || d.documentElement).appendChild(s);
  }
  function activerLoupe(){
    const v = vocabDispo(); if(!v) return;
    stylesLoupe(v.d);
    loupe.actif = true; loupe.doc = v.d; loupe.corps = v.corps;
    if(getComputedStyle(v.corps).position === 'static') v.corps.style.position = 'relative';
    loupe.calque = v.d.createElement('div'); loupe.calque.className = 'lm-loupe-calque'; v.corps.appendChild(loupe.calque);
    loupe.anneau = v.d.createElement('div'); loupe.anneau.className = 'lm-loupe-anneau'; v.d.body.appendChild(loupe.anneau);
    v.d.body.classList.add('lm-loupe-active');
    loupe.bouger = e => {
      const r = v.corps.getBoundingClientRect();
      loupe.x = e.clientX - r.left + v.corps.scrollLeft; loupe.y = e.clientY - r.top + v.corps.scrollTop;
      loupe.anneau.style.left = e.clientX + 'px'; loupe.anneau.style.top = e.clientY + 'px'; loupe.anneau.style.display = 'block';
      masquerLoupe();
    };
    loupe.sortir = () => { loupe.x = loupe.y = -999; loupe.anneau.style.display = 'none'; masquerLoupe(); };
    v.corps.addEventListener('mousemove', loupe.bouger);
    v.corps.addEventListener('mouseleave', loupe.sortir);
    dessinerLueurs(); masquerLoupe();
    if(loupe.btn) loupe.btn.classList.add('actif');
  }
  function desactiverLoupe(){
    if(!loupe.actif) return;
    loupe.actif = false;
    try{
      loupe.corps.removeEventListener('mousemove', loupe.bouger); loupe.corps.removeEventListener('mouseleave', loupe.sortir);
      loupe.calque.remove(); loupe.anneau.remove(); loupe.doc.body.classList.remove('lm-loupe-active');
    }catch(e){}
    if(loupe.btn) loupe.btn.classList.remove('actif');
  }
  // Seul ce qui est sous la loupe se voit (masque circulaire qui suit la souris).
  function masquerLoupe(){
    if(!loupe.calque) return;
    const m = 'radial-gradient(circle 80px at ' + loupe.x + 'px ' + loupe.y + 'px, #000 62%, transparent 100%)';
    loupe.calque.style.webkitMaskImage = m; loupe.calque.style.maskImage = m;
  }
  // Une lueur par mot cherché, décalée au hasard autour du mot : on voit la zone, pas le mot exact.
  function dessinerLueurs(){
    const v = vocabDispo();
    if(!v || !loupe.calque){ desactiverLoupe(); return; }
    const c = v.w.MotsCherchesVocab();
    const cibles = c.courant ? [c.courant] : c.tous;
    const rc = v.corps.getBoundingClientRect();
    loupe.calque.style.width = v.corps.scrollWidth + 'px'; loupe.calque.style.height = v.corps.scrollHeight + 'px';
    const cellules = [...v.grid.children];
    let html = '';
    cibles.forEach(mot => {
      const cel = cellules.find(x => x.textContent.trim().toLowerCase() === String(mot).trim().toLowerCase());
      if(!cel) return;
      const r = cel.getBoundingClientRect();
      const w = Math.max(r.width, 40), h = Math.max(r.height, 16);
      const cx = r.left - rc.left + v.corps.scrollLeft + r.width / 2 + (hacher(mot) - 0.5) * w * 1.1;
      const cy = r.top - rc.top + v.corps.scrollTop + r.height / 2 + (hacher(mot + '·') - 0.5) * h * 2.4;
      const rx = w * 1.25, ry = h * 2.6;
      html += '<div class="lm-lueur" style="left:' + (cx - rx).toFixed(0) + 'px;top:' + (cy - ry).toFixed(0) + 'px;width:' + (2 * rx).toFixed(0) + 'px;height:' + (2 * ry).toFixed(0) + 'px"></div>';
    });
    loupe.calque.innerHTML = html;
  }
  setInterval(() => { if(loupe.actif) dessinerLueurs(); }, 500);
  function construireBoutonLoupe(){
    loupe.btn = document.createElement('button'); loupe.btn.type = 'button'; loupe.btn.className = 'lm-loupe-btn';
    loupe.btn.title = 'Loupe magique : promène-la sur la liste de vocabulaire pour voir où sont cachés les mots que tu cherches';
    loupe.btn.setAttribute('aria-label', 'Loupe magique');
    loupe.btn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="rgba(255,190,150,.25)" stroke="#fde68a" stroke-width="2.2"/>' +
      '<path d="M15 15 L21 21" stroke="#c9a227" stroke-width="3.2" stroke-linecap="round"/><circle cx="8" cy="8" r="1.6" fill="#ff8a70"/></svg>';
    loupe.btn.addEventListener('click', () => {
      if(agentVocab && !vocabDispo()){ try{ agentVocab.postMessage({ type: 'lm-loupe', actif: !loupeAgentActive }, '*'); }catch(e){} return; }
      if(loupe.actif) desactiverLoupe(); else activerLoupe();
    });
    document.body.appendChild(loupe.btn);
  }

  /* =====================================================================
     4. LA SCÈNE
     La boule apparaît par-dessus le livre dans le coin en bas à GAUCHE, le
     compagnon (menu ou narrateur) dans le coin en bas à DROITE, petits pour
     cacher le moins possible. Le livre ne bouge pas. On envoie quand même au
     livre ouvert un message « scene-magique » ({ compagnon, hautDroite }) :
     la liste de vocabulaire des Parchemins se raccourcit au-dessus du
     compagnon, et le compagnon de lecture du Livre d'Histoire lui cède la place.
     En retour, un livre peut signaler ce qu'il occupe déjà en bas à droite
     (message « scene-occupe » : { basDroite } — ex. le compagnon de lecture
     du Livre d'Histoire) : le narrateur se pose alors au-dessus.
     ===================================================================== */
  function creerScene(){ return (function(){
    let dernier = '', cadre = null, basDroite = 0;
    function sceneCompagnon(){ const s = document.querySelector('.compagnon-scene'); return s && s.classList.contains('visible') ? s : null; }
    function maj(){
      const sc = sceneCompagnon();
      const p = narr.panneau, narrVisible = !!(p && p.classList.contains('visible'));
      if(p){
        p.classList.toggle('cede', !!sc);
        p.classList.toggle('sans-image', basDroite > 0);            // le compagnon de lecture du livre est déjà là, en bas
        p.style.bottom = (basDroite > 0 ? basDroite + 10 : 6) + 'px';
      }
      // La boule et le compagnon apparaissent PAR-DESSUS le livre, dans les coins du bas : le livre ne bouge pas
      // (gauche = droite = 0). Seule la liste de vocabulaire se raccourcit au-dessus du compagnon (hautDroite).
      const gauche = 0, droite = 0;
      const compagnon = sc ? 'menu' : narrVisible ? 'narrateur' : '';
      // hauteur occupée en bas à droite (la liste de vocabulaire des Parchemins se raccourcit au lieu de rétrécir le texte)
      const elD = sc || (narrVisible ? p : null);
      const hautDroite = elD ? Math.round(elD.offsetHeight + (parseFloat(getComputedStyle(elD).bottom) || 0) + 14) : 0;
      const f = livreOuvert();
      const cle = gauche + '/' + droite + '/' + compagnon + '/' + hautDroite;
      if(f === cadre && cle === dernier) return;
      cadre = f; dernier = cle;
      if(f){ try{ f.contentWindow.postMessage({ type: 'scene-magique', gauche, droite, compagnon, hautDroite }, '*'); }catch(e){} }
    }
    window.addEventListener('message', e => {
      const d = e.data;
      if(!d || d.type !== 'scene-occupe') return;
      const f = livreOuvert();
      if(!f || e.source !== f.contentWindow) return;
      basDroite = Math.max(0, Math.round(d.basDroite || 0));
      maj();
    });
    // Livre fermé ou changé : on oublie ce qu'il occupait.
    setInterval(() => { const f = livreOuvert(); if(f !== cadre){ basDroite = 0; dernier = ''; } maj(); }, 250);
    setInterval(() => { dernier = ''; }, 2000);   // renvoi régulier : un livre rechargé retrouve la bonne place
    window.addEventListener('resize', () => { dernier = ''; maj(); });
    return { maj };
  })(); }
  let scene = AGENT ? { maj(){} } : creerScene();

  /* ---------- L'icône de la boule, au-dessus du compagnon ---------- */
  function construireBouton(){
    styles();
    bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'lm-boule-btn';
    bouton.title = 'Boule de cristal : elle devine les mots que tu écris'; bouton.setAttribute('aria-label', 'Boule de cristal');
    bouton.innerHTML = '<img src="' + IMG_BOULE + '" alt="">';
    bouton.addEventListener('click', () => { bouleVoulue = !(boule && boule.classList.contains('visible')); basculerBoule(bouleVoulue); });
    document.body.appendChild(bouton);
  }
  // L'icône suit le compagnon : visible quand son cercle l'est.
  function installerFiche(){
  setInterval(() => {
    const r = document.querySelector('.compagnon-racine');
    const present = !!(r && r.style.display !== 'none' && getComputedStyle(r).display !== 'none');
    // La boule : seulement dans un livre, là où il y a une case réponse à remplir.
    let casesAgents = false;
    // (chaque agent redit toutes les secondes s'il a des cases : une page partie se tait, et on l'oublie après 2,5 s)
    agentsChamps.forEach((x, w) => { try{ if(w.closed || Date.now() - x.t > 2500) agentsChamps.delete(w); else if(x.v) casesAgents = true; }catch(e){ agentsChamps.delete(w); } });
    const dansLivre = present && !!livreOuvert();
    // L'icône : là où il y a une case réponse, ou partout dans les livres si l'élève a laissé la boule ouverte
    // (il peut ainsi toujours la refermer en recliquant l'icône).
    const iconeVisible = dansLivre && (bouleVoulue || casesAgents || champsVisibles());
    if(iconeVisible && !bouton) construireBouton();
    if(bouton) bouton.style.display = iconeVisible ? 'block' : 'none';
    const bouleVisible = !!(boule && boule.classList.contains('visible'));
    if(!dansLivre && bouleVisible) basculerBoule(false);                 // hors des livres : cachée (l'envie de l'élève est gardée)
    if(dansLivre && bouleVoulue && !bouleVisible) basculerBoule(true, true);   // de retour dans un livre : elle revient
    if(!present && narr.ecoute) arreterNarrateur();
    if(narr.ecoute && !livreOuvert()) arreterNarrateur();   // livre fermé : le narrateur se tait
    // La loupe : seulement quand une liste de vocabulaire est ouverte dans les Parchemins.
    const parcheminsOuverts = !!(document.getElementById('parcheminsModal') && document.getElementById('parcheminsModal').classList.contains('open'));
    const vocab = present && (!!vocabDispo() || (parcheminsOuverts && !!agentVocab));
    if(vocab && !loupe.btn) construireBoutonLoupe();
    if(loupe.btn) loupe.btn.style.display = vocab ? 'block' : 'none';
    if(!vocab && loupe.actif) desactiverLoupe();
    if(!vocab && agentVocab && loupeAgentActive){ try{ agentVocab.postMessage({ type: 'lm-loupe', actif: false }, '*'); }catch(e){} }
  }, 700);

  window.addEventListener('message', e => {
      const d = e.data;
      if(!d || !d.lmAgent || !e.source || e.source === window) return;
      agents.add(e.source);
      if(d.type === 'lm-bonjour'){ try{ e.source.postMessage(etatPourAgents(), '*'); }catch(err){} return; }
      if(d.type === 'lm-champs'){ agentsChamps.set(e.source, { v: !!d.present, t: Date.now() }); return; }
      // Un livre veut le plein écran (ex. Cherche et trouve) : toute la page passe en plein écran, outils magiques compris.
      if(d.type === 'lm-plein-ecran'){
        try{
          if(d.actif && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
          if(!d.actif && document.fullscreenElement) document.exitFullscreen().catch(() => {});
        }catch(err){}
        return;
      }
      if(d.type === 'lm-mots'){
        agentBoule = e.source; champ = null; motsAgent = { liste: d.liste || [], indice: d.indice || '' };
        if(boule && boule.classList.contains('visible')) dessinerMots(motsAgent.liste, motsAgent.indice);
        return;
      }
      if(d.type === 'lm-narr-etat'){
        if(!narr.ecoute) return;
        clearTimeout(narr.attenteSel);
        if(d.lit){
          if(narr.agentLit !== e.source) diffuser({ type: 'lm-narr-cmd', a: 'silence' }, e.source);   // une seule voix à la fois
          try{ speechSynthesis.cancel(); }catch(err){}
          narr.agentLit = e.source;
        } else if(narr.agentLit === e.source) narr.agentLit = null;
        dessinerPanneau(d.message, d);
        return;
      }
      if(d.type === 'lm-vocab'){
        if(d.dispo) agentVocab = e.source;
        else if(agentVocab === e.source){ agentVocab = null; loupeAgentActive = false; if(loupe.btn) loupe.btn.classList.remove('actif'); }
        return;
      }
      if(d.type === 'lm-loupe-etat'){ loupeAgentActive = !!d.actif; if(loupe.btn) loupe.btn.classList.toggle('actif', loupeAgentActive); return; }
    });
  }

  /* ---------- Les messages ---------- */
  let agentVocab = null, loupeAgentActive = false;   // (fiche) l'agent qui a une liste de vocabulaire ouverte
  const agentsChamps = new Map();                     // (fiche) agent → a-t-il une case réponse visible ?
  if(!AGENT) installerFiche();
  else {
    let ficheTrouvee = false;
    window.addEventListener('message', e => {
      const d = e.data;
      if(!d || d.lmAgent || !AGENT) return;
      if(d.type === 'lm-etat'){
        ficheTrouvee = true;
        const avant = etatFiche;
        etatFiche = { boule: !!d.boule, ecoute: !!d.ecoute, vitesse: d.vitesse || 1 };
        narr.vitesse = etatFiche.vitesse;
        if(etatFiche.ecoute && !narr.ecoute){ narr.ecoute = true; documents().forEach(brancher); try{ speechSynthesis.getVoices(); }catch(err){} }
        if(!etatFiche.ecoute && narr.ecoute) arreterNarrateur();
        if(etatFiche.boule && !avant.boule){ chargerMots().then(predire); predire(); }
        return;
      }
      if(d.type === 'lm-inserer'){ inserer(d.mot); return; }
      if(d.type === 'lm-narr-cmd'){ actionPanneau(d.a); return; }
      if(d.type === 'lm-loupe'){ if(d.actif) activerLoupe(); else desactiverLoupe(); versFiche({ type: 'lm-loupe-etat', actif: loupe.actif }); return; }
    });
    // La liste de vocabulaire (Parchemins) : on prévient la fiche quand elle s'ouvre ou se ferme.
    // Les cases réponse : on prévient la fiche quand il y en a (la boule n'apparaît que là où elle sert).
    let vocabAvant = null, champsAvant = null;
    setInterval(() => {
      if(!AGENT) return;
      const c = champsVisibles();
      champsAvant = c; versFiche({ type: 'lm-champs', present: c });
    }, 1000);
    // la page s'en va (document fermé) : ses cases disparaissent avec elle
    window.addEventListener('pagehide', () => { versFiche({ type: 'lm-champs', present: false }); versFiche({ type: 'lm-vocab', dispo: false }); });
    setInterval(() => {
      const dispo = !!vocabDispo();
      if(!dispo && loupe.actif){ desactiverLoupe(); versFiche({ type: 'lm-loupe-etat', actif: false }); }
      if(dispo !== vocabAvant){ vocabAvant = dispo; versFiche({ type: 'lm-vocab', dispo }); }
    }, 700);
    documents().forEach(brancher);
    versFiche({ type: 'lm-bonjour' });
    // Pas de fiche autour ? Un livre ouvert seul (à côté de la fiche, pas plus d'un cadre de profondeur) devient
    // autonome ; un document dans un livre redit bonjour jusqu'à ce que son livre (ou la fiche) réponde.
    const peutEtreAutonome = BASE === '' && (window === window.top || window.parent === window.top);
    let essais = 0;
    const attente = setInterval(() => {
      if(ficheTrouvee || ++essais > 12){ clearInterval(attente); return; }
      if(essais === 1 && peutEtreAutonome){ clearInterval(attente); devenirAutonome(); return; }
      versFiche({ type: 'lm-bonjour' });
    }, 1300);
  }

  async function devenirAutonome(){
    if(AUTONOME || !AGENT) return;
    AGENT = false; AUTONOME = true;
    try{ delete window.__lmAgent; }catch(e){ window.__lmAgent = false; }
    scene = creerScene();
    installerFiche();
    // le compagnon de l'élève : genre et rang lus dans l'adresse ou dans son coffre
    if(!window.Compagnon) await new Promise(res => { const sc = document.createElement('script'); sc.src = BASE + 'compagnon-core.js'; sc.onload = res; sc.onerror = res; document.head.appendChild(sc); });
    if(!window.Compagnon) return;
    const url = new URLSearchParams(location.search);
    let genre = url.get('genre'), niveau = 0;
    try{
      const P = window.PasserelleCore, id = P && P.lireIdentiteUrl();
      if(id){ const c = await P.chargerCoffre(id.slug, id.nom); const d = c && c.donnees; if(d){ genre = genre || d.genre; niveau = d.niveauLecture || 0; } }
    }catch(e){}
    if(genre !== 'fille' && genre !== 'garcon') genre = 'garcon';
    window.Compagnon.maj({ genre, niveau, grimoireOuvert: !!document.getElementById('bookWrap') });
  }

  return { narrer, arreterNarrateur, basculerBoule, livreOuvert: () => !!livreOuvert(), predire, activerLoupe, desactiverLoupe };
})();
