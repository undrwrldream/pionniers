/* =====================================================================
   SORTS-OUTILS.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Les outils mathématiques que l'élève fait apparaître par magie :
     • calculatrice : la calculatrice mauve (couleurs au choix, clavier
                      supporté, calcul enchaîné, « Erreur » si ÷ 0);
     • regle        : la règle de 10 cm graduée au millimètre (même échelle
                      que les formes des exercices : 1 cm = 38 px);
     • rapporteur   : le rapporteur d'angles de rapporteur.js (à charger
                      AVANT ce fichier, avec l'attribut data-manuel);
     • horloge      : l'horloge magique. On tourne les aiguilles, et l'heure
                      numérique s'écrit en lettres de magie dans les airs.
     • velo         : le vélo magique (BMX). On le fait tourner de 0° à 1080° ;
                      degrés, quarts de tour et demi-tours flottent en mauve.
                      SortsOutils.velo.lire() → degrés ; .regler(n) ; .surChangement(f)

   Utilisé par :
     • sorts-core.js (la barre de sorts du Grimoire);
     • les documents d'entraînement (dossier entrainements/).
   Ce fichier ne touche JAMAIS au stockage.

   Utilisation :
     SortsOutils.ouvrir('horloge')   SortsOutils.fermer('horloge')
     SortsOutils.basculer('horloge') SortsOutils.visible('horloge')
     SortsOutils.surChangement((nom, visible) => …)   // ouverture / fermeture
     SortsOutils.horloge.lire()  → { h: 0..23, m: 0..59 }
     SortsOutils.horloge.regler(h, m)
     SortsOutils.horloge.surChangement(({h, m}) => …)
     SortsOutils.regle.lire()    → { x, y, rot }  (x, y = le 0 de la règle à l'écran)
   ===================================================================== */
(function(){
  if(window.SortsOutils) return;
  // Dossier de ce fichier (ex. '../' depuis entrainements/) : pour trouver les images des outils.
  const BASE = ((document.currentScript && document.currentScript.getAttribute('src')) || '').replace(/[^\/]*$/, '');
  // Version des outils selon l'élève : « fille » = règle et rapporteur roses étoilés. Le Grimoire reçoit ?genre=
  // dans son adresse (fiche de personnage) et le transmet aux entraînements ; SortsOutils.genre('fille') le change aussi.
  let GENRE = (new URLSearchParams(location.search).get('genre') || '').toLowerCase() === 'fille' ? 'fille' : 'garcon';

  const Z = 9000;            // au-dessus de la fenêtre des documents du Grimoire (120) et de ses dialogues (400)
  const ecouteurs = [];
  function signaler(nom, visible){ ecouteurs.forEach(f => { try{ f(nom, visible); }catch(e){} }); }

  // Entraînement en cours : les outils ne se ferment pas (voir bloquerFermeture, plus bas).
  let fermetureBloquee = false;
  function styles(id, css){
    if(document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  // Rend un élément déplaçable par une poignée (bandeau du haut).
  function deplacable(el, poignee){
    let g = null;
    poignee.addEventListener('pointerdown', e => {
      if(e.target.closest('button, input, .so-pas-glisser')) return;
      const r = el.getBoundingClientRect();
      g = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try{ poignee.setPointerCapture(e.pointerId); }catch(_){}
      e.preventDefault();
    });
    poignee.addEventListener('pointermove', e => {
      if(!g) return;
      const x = Math.max(-el.offsetWidth + 80, Math.min(window.innerWidth - 80, e.clientX - g.dx));
      const y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - g.dy));
      el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    const fin = () => { g = null; };
    poignee.addEventListener('pointerup', fin); poignee.addEventListener('pointercancel', fin);
  }

  // Petite gerbe d'étincelles à l'apparition d'un outil.
  function etincelles(x, y, couleur){
    styles('so-etincelles', `
      .so-etin{ position:fixed; z-index:${Z + 50}; width:8px; height:8px; margin:-4px 0 0 -4px; border-radius:50%; pointer-events:none;
        animation:so-etin .75s ease-out forwards; }
      @keyframes so-etin{ from{ transform:translate(0,0) scale(1); opacity:1; } to{ transform:translate(var(--dx),var(--dy)) scale(.2); opacity:0; } }`);
    for(let i = 0; i < 18; i++){
      const p = document.createElement('div'); p.className = 'so-etin';
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.background = couleur || (i % 2 ? '#f5d67a' : '#c4b5fd');
      p.style.boxShadow = '0 0 8px ' + (couleur || '#f5d67a');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  /* =====================================================================
     1. LA CALCULATRICE MAUVE
     ===================================================================== */
  const calculatrice = (function(){
    const THEMES = [
      ['Mauve', '#7c3aed'], ['Émeraude', '#10b981'], ['Bordeaux', '#8b1538'], ['Rouge', '#ef4444'],
      ['Framboise', '#be123c'], ['Marine', '#1e3a8a'], ['Orange', '#f97316']
    ];
    let el = null, ecran = null, badge = null, montre = false;
    // État du calcul enchaîné (comme une vraie calculatrice de base : de gauche à droite).
    let affiche = '0', memoire = null, operation = null, nouveau = true, erreur = false;

    function css(){
      styles('so-calc', `
        .so-calc{ position:fixed; z-index:${Z + 2}; width:320px; right:24px; bottom:92px; border-radius:26px; overflow:hidden; background:#fff;
          box-shadow:0 24px 60px -12px rgba(76,29,149,.45), 0 0 0 1px rgba(124,58,237,.12); font-family:system-ui, -apple-system, 'Segoe UI', sans-serif;
          --c:#7c3aed; transform:translateY(24px) scale(.96); opacity:0; pointer-events:none; transition:transform .28s cubic-bezier(.2,1.2,.4,1), opacity .22s; }
        .so-calc.visible{ transform:none; opacity:1; pointer-events:auto; }
        .so-calc-tete{ background:var(--c); color:#fff; display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:grab; touch-action:none; }
        .so-calc-tete:active{ cursor:grabbing; }
        .so-calc-ico{ width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; font-size:15px; }
        .so-calc-nom{ font-weight:800; font-size:15px; }
        .so-calc-badge{ font-size:10.5px; font-weight:700; letter-spacing:.06em; background:rgba(255,255,255,.18); border-radius:999px; padding:3px 8px; text-transform:uppercase; }
        .so-calc-x{ margin-left:auto; width:32px; height:32px; border-radius:50%; border:0; background:rgba(255,255,255,.18); color:#fff; font-size:17px; cursor:pointer; }
        .so-calc-x:hover{ background:rgba(255,255,255,.3); }
        .so-calc-couleurs{ display:flex; justify-content:center; gap:10px; padding:10px 0; border-bottom:1px solid #f1eefb; }
        .so-calc-couleurs button{ width:24px; height:24px; border-radius:50%; border:0; cursor:pointer; padding:0; transition:transform .15s; }
        .so-calc-couleurs button.actif{ transform:scale(1.35); box-shadow:0 0 0 3px #fff inset; }
        .so-calc-ecran{ text-align:right; padding:18px 20px 8px; min-height:74px; }
        .so-calc-calcul{ font-size:13px; color:#9ca3af; min-height:17px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .so-calc-valeur{ font-size:40px; font-weight:800; color:#1f1633; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .so-calc-touches{ display:grid; grid-template-columns:repeat(4, 1fr); gap:9px; padding:8px 14px 10px; }
        .so-calc-touches button{ height:50px; border-radius:14px; border:1px solid #ece9f3; background:#fff; color:#1f1633; font-size:19px; font-weight:600; cursor:pointer;
          transition:transform .08s, filter .15s; font-family:inherit; }
        .so-calc-touches button:active{ transform:scale(.94); }
        .so-calc-touches .fn{ background:color-mix(in srgb, var(--c) 9%, #fff); color:var(--c); font-weight:800; font-size:17px; border-color:transparent; }
        .so-calc-touches .op{ background:var(--c); color:#fff; border-color:transparent; font-size:21px; }
        .so-calc-touches .op.choisi{ filter:brightness(1.25); box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 35%, #fff); }
        .so-calc-touches button:hover{ filter:brightness(.97); }
        .so-calc-pied{ display:flex; justify-content:space-between; align-items:center; padding:2px 16px 12px; font-size:10.5px; color:#a1a1aa; letter-spacing:.04em; }
        .so-calc-pied b{ color:var(--c); font-weight:700; letter-spacing:.08em; }
      `);
    }

    function fmt(n){
      if(!isFinite(n)) return 'Erreur';
      const r = Math.round(n * 1e10) / 1e10;
      let s = String(r);
      if(s.replace('-', '').replace('.', '').length > 12) s = r.toPrecision(10).replace(/\.?0+$/, '');
      return s.replace('.', ',');
    }
    const nombre = () => parseFloat(affiche.replace(',', '.'));
    function calculer(a, op, b){
      if(op === '+') return a + b;
      if(op === '−') return a - b;
      if(op === '×') return a * b;
      if(op === '÷') return b === 0 ? NaN : a / b;
      return b;
    }
    function reset(){ affiche = '0'; memoire = null; operation = null; nouveau = true; erreur = false; }
    function touche(k){
      if(erreur && k !== 'Reset'){ reset(); if('+−×÷=%'.includes(k)) { rendre(); return; } }
      if(/^[0-9]$/.test(k)){
        if(nouveau){ affiche = k; nouveau = false; }
        else if(affiche.replace(/[-,]/g, '').length < 12) affiche = affiche === '0' ? k : affiche + k;
      } else if(k === ','){
        if(nouveau){ affiche = '0,'; nouveau = false; }
        else if(!affiche.includes(',')) affiche += ',';
      } else if(k === 'Reset'){
        reset();
      } else if(k === '←'){
        if(!nouveau){ affiche = affiche.length > 1 && !(affiche.length === 2 && affiche[0] === '-') ? affiche.slice(0, -1) : '0'; if(affiche === '0') nouveau = true; }
      } else if(k === '+/−'){
        if(affiche !== '0') affiche = affiche[0] === '-' ? affiche.slice(1) : '-' + affiche;
      } else if(k === '%'){
        const v = nombre();
        affiche = fmt(memoire !== null && (operation === '+' || operation === '−') ? memoire * v / 100 : v / 100);
        nouveau = true;
      } else if('+−×÷'.includes(k)){
        if(operation && !nouveau){
          const r = calculer(memoire, operation, nombre());
          affiche = fmt(r); if(!isFinite(r)){ erreur = true; operation = null; memoire = null; rendre(); return; }
          memoire = r;
        } else if(!operation || memoire === null){ memoire = nombre(); }
        operation = k; nouveau = true;
      } else if(k === '='){
        if(operation !== null && memoire !== null){
          const b = nombre(), r = calculer(memoire, operation, b);
          el.querySelector('.so-calc-calcul').textContent = fmt(memoire) + ' ' + operation + ' ' + fmt(b) + ' =';
          affiche = fmt(r); memoire = null; operation = null; nouveau = true;
          if(!isFinite(r)) erreur = true;
          rendre(true); return;
        }
      }
      rendre();
    }
    function rendre(garderCalcul){
      ecran.textContent = affiche;
      if(!garderCalcul) el.querySelector('.so-calc-calcul').textContent = (memoire !== null && operation) ? fmt(memoire) + ' ' + operation : '';
      el.querySelectorAll('.op').forEach(b => b.classList.toggle('choisi', !!operation && nouveau && b.dataset.k === operation));
    }
    function theme(i){
      const [nom, c] = THEMES[i];
      el.style.setProperty('--c', c);
      badge.textContent = 'Sort • ' + nom;
      el.querySelectorAll('.so-calc-couleurs button').forEach((b, j) => b.classList.toggle('actif', j === i));
    }
    function construire(){
      css();
      el = document.createElement('div'); el.className = 'so-calc'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Calculatrice magique');
      const touches = ['Reset','←','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','+/−','0',',','='];
      el.innerHTML =
        '<div class="so-calc-tete"><span class="so-calc-ico">🧮</span><span class="so-calc-nom">Calc</span><span class="so-calc-badge"></span>' +
        '<button type="button" class="so-calc-x" title="Faire disparaître la calculatrice" aria-label="Fermer">✕</button></div>' +
        '<div class="so-calc-couleurs">' + THEMES.map(([n, c]) => '<button type="button" title="' + n + '" style="background:' + c + '"></button>').join('') + '</div>' +
        '<div class="so-calc-ecran"><div class="so-calc-calcul"></div><div class="so-calc-valeur">0</div></div>' +
        '<div class="so-calc-touches">' + touches.map(k => '<button type="button" data-k="' + k + '" class="' +
          ('÷×−+='.includes(k) ? 'op' : ['Reset','←','%','+/−'].includes(k) ? 'fn' : '') + '">' + k + '</button>').join('') + '</div>' +
        '<div class="so-calc-pied"><span>Enchaînée • Erreur si ÷0</span><b>✦ MAGIQUE</b></div>';
      document.body.appendChild(el);
      ecran = el.querySelector('.so-calc-valeur'); badge = el.querySelector('.so-calc-badge');
      el.querySelector('.so-calc-touches').addEventListener('click', e => { const b = e.target.closest('button'); if(b) touche(b.dataset.k); });
      el.querySelectorAll('.so-calc-couleurs button').forEach((b, i) => b.addEventListener('click', () => theme(i)));
      el.querySelector('.so-calc-x').addEventListener('click', () => { if(!fermetureBloquee) fermer(); });
      deplacable(el, el.querySelector('.so-calc-tete'));
      theme(0);
      // Clavier : seulement si la calculatrice est visible et que l'élève n'écrit pas dans une case réponse.
      document.addEventListener('keydown', e => {
        if(!montre || e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target; if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        const carte = { '*':'×', 'x':'×', 'X':'×', '/':'÷', '-':'−', '+':'+', 'Enter':'=', '=':'=', 'Escape':'Reset', 'Backspace':'←', '.':',', ',':',', '%':'%' };
        const k = /^[0-9]$/.test(e.key) ? e.key : carte[e.key];
        if(!k) return;
        e.preventDefault(); touche(k);
      });
    }
    function ouvrir(){ if(!el) construire(); montre = true; el.classList.add('visible'); signaler('calculatrice', true); }
    function fermer(){ if(!el || !montre) return; montre = false; el.classList.remove('visible'); signaler('calculatrice', false); }
    // Position choisie par la page (ex. un entraînement) : { left, top, right, echelle }
    function placer(p){
      if(!el) construire();
      ['left','top','right','bottom'].forEach(k => { el.style[k] = (p[k] === undefined) ? (k === 'bottom' || k === 'left' ? 'auto' : el.style[k]) : (typeof p[k] === 'number' ? p[k] + 'px' : p[k]); });
      if(p.echelle){ el.style.zoom = p.echelle; }
    }
    return { ouvrir, fermer, visible: () => montre, element: () => el, touche, placer };
  })();

  /* =====================================================================
     2. LA RÈGLE (10 cm, graduée au millimètre — comme dans « Formes et mesures »)
     ===================================================================== */
  const regle = (function(){
    const CM = 38, MARGE = 16, LARG = 10 * CM + 2 * MARGE, HAUT = 58;
    let el = null, montre = false;
    const pos = { x: 0, y: 0, rot: 0 };   // x, y = position du 0 à l'écran ; rot en degrés
    function css(){
      styles('so-regle', `
        .so-regle{ position:fixed; left:0; top:0; z-index:${Z + 1}; touch-action:none; user-select:none; -webkit-user-select:none; cursor:grab;
          filter:drop-shadow(0 6px 10px rgba(0,0,0,.22)) drop-shadow(0 0 10px rgba(196,181,253,.55)); }
        .so-regle:active{ cursor:grabbing; }
        .so-regle svg{ display:block; overflow:visible; }
        .so-regle-poignee{ position:absolute; top:50%; width:36px; height:36px; margin-top:-18px; border-radius:50%; background:#2563eb; border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.3); color:#fff; font:700 17px/30px system-ui, sans-serif; text-align:center; cursor:grab; }
        .so-regle-barre{ position:absolute; left:${MARGE}px; top:${HAUT + 8}px; display:flex; gap:5px; transform-origin:0 0; }
        .so-regle-barre button{ font:700 13px/1 system-ui, sans-serif; height:30px; min-width:30px; padding:0 9px; border-radius:999px; border:2px solid #fff;
          background:#2563eb; color:#fff; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.3); }
        .so-regle-barre button[data-a="fermer"]{ background:#b91c1c; }
        .so-regle:not(.fille){ filter:drop-shadow(0 6px 10px rgba(0,0,0,.22)) drop-shadow(0 0 12px rgba(96,165,250,.6)); }
        .so-regle.fille{ filter:drop-shadow(0 6px 10px rgba(0,0,0,.22)) drop-shadow(0 0 12px rgba(244,114,182,.6)); }
        .so-regle.fille .so-regle-poignee, .so-regle.fille .so-regle-barre button{ background:#a21caf; }
        .so-regle.fille .so-regle-barre button[data-a="fermer"]{ background:#b91c1c; }
      `);
    }
    function construire(){
      css();
      el = document.createElement('div'); el.className = 'so-regle';
      const fille = GENRE === 'fille';
      el.classList.toggle('fille', fille);
      // Verre étoilé des images fournies : rose pour les filles (regle_fille.webp), bleu pour les garçons (regle_garcon.webp).
      // Les graduations des images étaient fausses : elles sont redessinées ici, justes au mm.
      const encre = fille ? '#3b0a45' : '#0b1f3f';
      let s = '<svg width="' + LARG + '" height="' + HAUT + '" viewBox="0 0 ' + LARG + ' ' + HAUT + '">' +
        '<defs><linearGradient id="so-plast" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".92"/>' +
        '<stop offset=".55" stop-color="#eef5ff" stop-opacity=".78"/><stop offset="1" stop-color="#dbe8f8" stop-opacity=".85"/></linearGradient>' +
        '<linearGradient id="so-reflet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>' +
        '<clipPath id="so-regle-clip"><rect x="0.5" y="0.5" width="' + (LARG - 1) + '" height="' + (HAUT - 1) + '" rx="8"/></clipPath></defs>' +
        '<g clip-path="url(#so-regle-clip)"><image href="' + BASE + 'livre_assets/regle_' + (fille ? 'fille' : 'garcon') + '.webp" x="0" y="0" width="' + LARG + '" height="' + HAUT + '" preserveAspectRatio="none" opacity=".32"/>' +   // verre plus transparent : on voit au travers
          '<rect width="' + LARG + '" height="' + HAUT + '" fill="url(#so-reflet)"/></g>' +
        '<rect x="0.5" y="0.5" width="' + (LARG - 1) + '" height="' + (HAUT - 1) + '" rx="8" fill="none" stroke="' + (fille ? 'rgba(255,230,250,.9)' : 'rgba(224,242,254,.95)') + '" stroke-width="1.4"/>';
      for(let mm = 0; mm <= 100; mm++){
        const x = MARGE + mm * CM / 10, cmPile = mm % 10 === 0, demi = mm % 5 === 0;
        const long = cmPile ? 20 : demi ? 14 : 8;
        s += '<line x1="' + x.toFixed(2) + '" y1="0" x2="' + x.toFixed(2) + '" y2="' + long + '" stroke="' + encre + '" stroke-width="' + (cmPile ? 1.6 : 1) + '"/>';
        if(cmPile) s += '<text x="' + x.toFixed(2) + '" y="38" text-anchor="middle" font-family="Nunito, system-ui, sans-serif" font-size="15" font-weight="800" fill="' + encre + '"' +
          ' stroke="' + (fille ? '#fde7f7' : '#e0f2fe') + '" stroke-width="2.6" paint-order="stroke">' + (mm / 10) + '</text>';
      }
      s += '<text x="' + (LARG - 6) + '" y="' + (HAUT - 12) + '" text-anchor="end" font-family="Nunito, system-ui, sans-serif" font-size="10" font-weight="800" fill="' + encre + '" stroke="' + (fille ? '#fde7f7' : '#e0f2fe') + '" stroke-width="2" paint-order="stroke">cm</text></svg>';
      el.innerHTML = s + '<div class="so-regle-poignee" title="Glisse pour faire tourner la règle">⟳</div>' +
        '<div class="so-regle-barre"><button type="button" data-a="droit" title="Remettre la règle à l\'horizontale">↔ Droite</button>' +
        '<button type="button" data-a="fermer" title="Faire disparaître la règle">✕</button></div>';
      document.body.appendChild(el);
      const poignee = el.querySelector('.so-regle-poignee');
      poignee.style.left = (LARG + 6) + 'px';
      el.style.width = LARG + 'px';
      el.style.transformOrigin = MARGE + 'px 0px';
      let g = null;
      el.addEventListener('pointerdown', e => {
        if(e.target === poignee || e.target.closest('.so-regle-barre')) return;
        e.preventDefault();
        g = { mode:'deplacer', x0:e.clientX, y0:e.clientY, px:pos.x, py:pos.y };
        try{ el.setPointerCapture(e.pointerId); }catch(_){}
      });
      poignee.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        g = { mode:'tourner' };
        try{ poignee.setPointerCapture(e.pointerId); }catch(_){}
      });
      window.addEventListener('pointermove', e => {
        if(!g) return;
        if(g.mode === 'deplacer'){
          pos.x = Math.max(0, Math.min(window.innerWidth, g.px + e.clientX - g.x0));
          pos.y = Math.max(0, Math.min(window.innerHeight - 20, g.py + e.clientY - g.y0));
        } else {
          let a = Math.atan2(e.clientY - pos.y, e.clientX - pos.x) * 180 / Math.PI;
          const proche = Math.round(a / 15) * 15;          // petit aimant tous les 15°
          if(Math.abs(a - proche) < 2.5) a = proche;
          pos.rot = a;
        }
        placer();
      });
      const fin = () => { g = null; };
      window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
      el.querySelector('.so-regle-barre').addEventListener('click', e => {
        const b = e.target.closest('button'); if(!b) return;
        if(b.dataset.a === 'droit'){ pos.rot = 0; placer(); }
        if(b.dataset.a === 'fermer' && !fermetureBloquee) fermer();
      });
      window.addEventListener('resize', () => { pos.x = Math.min(pos.x, window.innerWidth - 10); pos.y = Math.min(pos.y, window.innerHeight - 20); placer(); });
    }
    function placer(){
      el.style.transform = 'translate(' + (pos.x - MARGE) + 'px,' + pos.y + 'px) rotate(' + pos.rot + 'deg)';
      // la barre de boutons reste lisible (elle ne tourne pas avec la règle)
      const barre = el.querySelector('.so-regle-barre'); if(barre) barre.style.transform = 'rotate(' + (-pos.rot) + 'deg)';
    }
    function ouvrir(){
      if(!el) construire();
      pos.x = Math.max(MARGE + 10, window.innerWidth / 2 - 5 * CM); pos.y = Math.max(60, window.innerHeight - HAUT - 190); pos.rot = 0;
      placer(); el.style.display = ''; montre = true; signaler('regle', true);
    }
    function fermer(){ if(!el || !montre) return; el.style.display = 'none'; montre = false; signaler('regle', false); }
    return { ouvrir, fermer, visible: () => montre, lire: () => Object.assign({}, pos), CM };
  })();

  /* =====================================================================
     3. LE RAPPORTEUR (rapporteur.js en mode manuel)
     ===================================================================== */
  const rapporteur = (function(){
    let surveille = false;
    function outil(){
      if(!window.RapporteurInstaller) return null;
      if(!window.Rapporteur) window.RapporteurInstaller({ bouton:false, visible:false, zIndex:Z + 1, barre:true, style: GENRE, base: BASE });
      if(!surveille){
        surveille = true;
        // Le ✕ de la petite barre du rapporteur le cache lui-même : on le remarque pour éteindre l'icône du sort.
        document.addEventListener('click', e => {
          if(e.target.closest && e.target.closest('.rap-barre [data-a="fermer"]')) setTimeout(() => signaler('rapporteur', false), 0);
        }, true);
      }
      return window.Rapporteur;
    }
    return {
      ouvrir(){ const r = outil(); if(r){ r.montrer(); signaler('rapporteur', true); } },
      fermer(){ const r = outil(); if(r && r.etat.visible){ r.cacher(); signaler('rapporteur', false); } },
      visible(){ return !!(window.Rapporteur && window.Rapporteur.etat.visible); },
      disponible(){ return !!window.RapporteurInstaller; }
    };
  })();

  /* =====================================================================
     4. L'HORLOGE MAGIQUE
     La grande aiguille (minutes) entraîne la petite : un tour complet = 1 heure.
     On peut aussi tourner la petite aiguille directement. L'heure numérique
     flotte au-dessus de l'horloge, écrite en lettres de magie.
     ===================================================================== */
  const horloge = (function(){
    const R = 128;                                   // rayon de la face argentée (l'anneau rose de l'image l'entoure)
    const IMG_HORLOGE = BASE + 'livre_assets/horloge_magique.webp';   // l'horloge ciselée et ses tourbillons (face recouverte par le SVG)
    let el = null, montre = false;
    let totalMin = 3 * 60;                           // minutes depuis minuit, 0 .. 1439 (commence à 3:00)
    const abonnes = [];
    function css(){
      styles('so-horloge', `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap');
        .so-horl{ position:fixed; z-index:${Z + 3}; left:50%; top:50%; width:${2 * R + 190}px; transform:translate(-50%,-46%) scale(.9); opacity:0; pointer-events:none;
          transition:transform .35s cubic-bezier(.2,1.3,.4,1), opacity .3s; font-family:Georgia, serif; user-select:none; -webkit-user-select:none; }
        .so-horl.visible{ transform:translate(-50%,-50%); opacity:1; pointer-events:auto; }
        .so-horl.deplacee{ transform:scale(var(--e, 1)); transform-origin:0 0; }
        .so-horl-air{ position:relative; height:118px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; cursor:grab; touch-action:none; }
        .so-horl-air:active{ cursor:grabbing; }
        .so-horl-num{ font-family:'Cinzel Decorative', 'Cinzel', Georgia, serif; font-weight:700; font-size:66px; line-height:1; letter-spacing:.04em;
          color:#fff7d6; text-shadow:0 0 6px #fde68a, 0 0 16px #f59e0b, 0 0 32px #a855f7, 0 0 54px #7c3aed;
          animation:so-flotte 3.2s ease-in-out infinite; }
        .so-horl-mots{ margin-top:6px; font-size:17px; font-style:italic; color:#f5e7ff; text-shadow:0 0 8px #a855f7, 0 0 2px #000; animation:so-flotte 3.2s ease-in-out infinite .4s; }
        @keyframes so-flotte{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-6px); } }
        .so-horl-num.change{ animation:so-flotte 3.2s ease-in-out infinite, so-eclat .45s ease-out; }
        @keyframes so-eclat{ 0%{ filter:brightness(2.2) blur(1px); } 100%{ filter:none; } }
        .so-horl-poussiere{ position:absolute; width:5px; height:5px; border-radius:50%; background:#fde68a; box-shadow:0 0 8px #fbbf24; pointer-events:none;
          animation:so-pouss 2.4s ease-out forwards; }
        @keyframes so-pouss{ from{ transform:translate(0,0); opacity:0; } 15%{ opacity:1; } to{ transform:translate(var(--dx), -70px); opacity:0; } }
        .so-horl-cadran{ position:relative; padding:${Math.round(R * 0.5)}px 0 ${Math.round(R * 0.5)}px; }
        .so-horl-art{ position:absolute; left:50%; top:50%; width:${Math.round(R * 1000 / 236)}px; max-width:none; transform:translate(-50%,-50%); pointer-events:none;
          filter:drop-shadow(0 12px 22px rgba(0,0,0,.45)); animation:so-horl-tourbillon 1.2s cubic-bezier(.2,.9,.3,1.1); }
        @keyframes so-horl-tourbillon{ 0%{ opacity:0; transform:translate(-50%,-50%) rotate(-40deg) scale(.6); filter:brightness(2.5) blur(4px); } 100%{ opacity:1; transform:translate(-50%,-50%); } }
        .so-horl svg{ position:relative; display:block; margin:0 auto; overflow:visible; touch-action:none; }
        .so-horl .aig{ cursor:grab; }
        /* Calculer la durée : bouton à gauche, début / fin à droite, temps écoulé en haut */
        .so-horl-duree-btn{ position:absolute; left:-150px; top:50%; transform:translateY(-50%); width:128px; z-index:3;
          font:700 15px/1.2 'Cinzel', Georgia, serif; padding:12px 10px; border-radius:14px; cursor:pointer; color:#fdf4dc;
          background:linear-gradient(180deg, rgba(76,29,149,.95), rgba(46,16,101,.95)); border:2px solid #f5d67a; box-shadow:0 0 16px rgba(168,85,247,.55); }
        .so-horl-duree-btn:hover{ filter:brightness(1.15); }
        .so-horl-duree-btn.actif{ background:linear-gradient(180deg, #7f1d1d, #4c0519); border-color:#fca5a5; }
        .so-horl-form{ position:absolute; left:-190px; top:calc(50% + 50px); width:200px; z-index:4; display:none; text-align:center;
          background:rgba(20,10,40,.96); border:2px solid #f5d67a; border-radius:12px; padding:10px; color:#fdf4dc; box-shadow:0 8px 22px rgba(0,0,0,.5); }
        .so-horl-form.ouvert{ display:block; }
        .so-horl-form p{ margin:0 0 8px; font:italic 700 15px Georgia, serif; }
        .so-horl-form input{ width:52px; font:700 22px Georgia, serif; text-align:center; border-radius:8px; border:2px solid #d8b4fe; padding:4px 2px; }
        .so-horl-form .deux-pts{ font:700 24px Georgia, serif; margin:0 3px; }
        .so-horl-form button{ margin-top:8px; font:700 14px system-ui, sans-serif; padding:8px 14px; border-radius:999px; border:2px solid #f5d67a;
          background:#6d28d9; color:#fff; cursor:pointer; }
        .so-horl-form .aide-sens{ font:normal 600 12.5px/1.3 system-ui, sans-serif; opacity:.85; }
        .so-horl.a-reculons .so-horl-num{ text-shadow:0 0 6px #bae6fd, 0 0 18px #38bdf8, 0 0 34px #6366f1; }
        .so-horl.a-reculons .borne-fin{ text-shadow:0 0 6px #bae6fd, 0 0 16px #38bdf8, 0 0 30px #6366f1; }
        .so-horl-form .erreur{ min-height:16px; margin:6px 0 0; font-size:13px; color:#fca5a5; font-style:normal; }
        .so-horl-bornes{ position:absolute; right:-160px; top:50%; transform:translateY(-50%); width:140px; display:none; text-align:center; z-index:3; }
        .so-horl.en-duree .so-horl-bornes{ display:block; }
        .so-horl-borne{ margin:10px 0; }
        .so-horl-borne b{ display:block; font-family:'Cinzel Decorative', 'Cinzel', Georgia, serif; font-size:38px; line-height:1.05; color:#fff7d6;
          text-shadow:0 0 6px #fde68a, 0 0 16px #f59e0b, 0 0 30px #a855f7; }
        .so-horl-borne span{ font-size:15px; font-style:italic; font-weight:700; color:#f5e7ff; text-shadow:0 0 8px #a855f7, 0 0 2px #000; }
        .so-horl.en-duree .so-horl-num{ font-size:52px; }
        .so-horl-outils{ display:flex; justify-content:center; gap:6px; margin-top:12px; flex-wrap:wrap; }
        .so-horl-outils button{ font:700 13px/1 system-ui, sans-serif; height:32px; padding:0 11px; border-radius:999px; border:2px solid #f5d67a;
          background:rgba(30,16,52,.88); color:#fdf4dc; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.4); }
        .so-horl-outils button:hover{ background:rgba(76,29,149,.95); }
        .so-horl-outils button.actif{ background:#fde68a; border-color:#fff7d6; color:#3b2a0a; }
        .so-horl-outils button[data-a="fermer"]{ background:#7f1d1d; }
      `);
    }
    const h24 = () => Math.floor(totalMin / 60) % 24, mm = () => totalMin % 60;
    const deux = n => (n < 10 ? '0' : '') + n;
    function motsHeure(){
      const h = h24(), m = mm(), h12 = h % 12 === 0 ? 12 : h % 12;
      const moment = h < 12 ? (h === 0 ? 'minuit' : 'du matin') : (h === 12 ? 'midi' : h < 18 ? "de l'après-midi" : 'du soir');
      if(h === 12 && m === 0) return 'midi';
      if(h === 0 && m === 0) return 'minuit';
      return h12 + ' h' + (m ? ' ' + deux(m) : '') + ' ' + (h === 0 ? 'du matin' : h === 12 ? "de l'après-midi" : moment);
    }
    // Le cadran argenté (par-dessus la face de l'image, dont les chiffres et les aiguilles étaient figés) :
    // chiffres arabes gravés, étoiles, graduations, et les deux aiguilles d'argent qu'on fait tourner.
    function svg(){
      const P = n => n.toFixed(1);
      let s = '<svg width="' + (2 * R + 20) + '" height="' + (2 * R + 20) + '" viewBox="' + (-R - 10) + ' ' + (-R - 10) + ' ' + (2 * R + 20) + ' ' + (2 * R + 20) + '">' +
        '<defs><radialGradient id="so-face" cx="46%" cy="40%" r="70%"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".62" stop-color="#d3dbe6"/><stop offset="1" stop-color="#a9b4c5"/></radialGradient>' +
        '<radialGradient id="so-coeur" cx="45%" cy="40%" r="75%"><stop offset="0" stop-color="#dfe6f0"/><stop offset="1" stop-color="#aab6c8"/></radialGradient>' +
        '<linearGradient id="so-argent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e7e2d6"/><stop offset="1" stop-color="#b9b2a2"/></linearGradient>' +
        '<filter id="so-grave" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.2" stdDeviation=".8" flood-color="#2b2118" flood-opacity=".55"/></filter></defs>' +
        '<circle r="' + (R + 2) + '" fill="url(#so-face)"/>' +
        '<circle r="' + (R - 1) + '" fill="none" stroke="#f3ead6" stroke-width="3"/><circle r="' + (R - 3.5) + '" fill="none" stroke="#6b5b48" stroke-width=".8" opacity=".6"/>';
      // cœur étoilé, comme sur l'image
      const rc = R * 0.52;
      s += '<circle r="' + P(rc) + '" fill="url(#so-coeur)" stroke="#f3ead6" stroke-width="2.4"/><circle r="' + P(rc - 5) + '" fill="none" stroke="#7b8799" stroke-width=".7" stroke-dasharray="1.5 3"/>';
      for(let k = 0; k < 4; k++){ const a = k * Math.PI / 4; s += '<line x1="' + P(Math.cos(a) * rc) + '" y1="' + P(Math.sin(a) * rc) + '" x2="' + P(-Math.cos(a) * rc) + '" y2="' + P(-Math.sin(a) * rc) + '" stroke="#8a96a8" stroke-width=".6" opacity=".7"/>'; }
      let graine = 7; const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
      const etoile = (x, y, t, c) => '<path d="M' + P(x) + ' ' + P(y - t) + ' L' + P(x + t * .28) + ' ' + P(y - t * .28) + ' L' + P(x + t) + ' ' + P(y) + ' L' + P(x + t * .28) + ' ' + P(y + t * .28) + ' L' + P(x) + ' ' + P(y + t) + ' L' + P(x - t * .28) + ' ' + P(y + t * .28) + ' L' + P(x - t) + ' ' + P(y) + ' L' + P(x - t * .28) + ' ' + P(y - t * .28) + 'Z" fill="' + c + '"/>';
      for(let k = 0; k < 16; k++){ const a = hasard() * Math.PI * 2, r = 14 + hasard() * (rc - 22); s += etoile(Math.cos(a) * r, Math.sin(a) * r, 2.5 + hasard() * 4, k % 3 ? '#ffffff' : '#6f7c90'); }
      for(let k = 0; k < 22; k++){ const a = hasard() * Math.PI * 2, r = rc + 8 + hasard() * (R - rc - 50); s += '<circle cx="' + P(Math.cos(a) * r) + '" cy="' + P(Math.sin(a) * r) + '" r="' + P(.8 + hasard() * 1.2) + '" fill="#7d889a" opacity=".7"/>'; }
      // les deux axes (12-6 et 9-3) : on voit mieux les quarts d'heure
      const ax = R - 56;
      s += '<g stroke="#6d28d9" stroke-width="2.4" stroke-linecap="round" opacity=".75">' +
        '<line x1="0" y1="' + P(-ax) + '" x2="0" y2="' + P(ax) + '"/><line x1="' + P(-ax) + '" y1="0" x2="' + P(ax) + '" y2="0"/></g>';
      // graduations
      for(let i = 0; i < 60; i++){
        const a = i * 6 * Math.PI / 180, grand = i % 5 === 0;
        const r1 = R - (grand ? 15 : 9), r2 = R - 5;
        s += '<line x1="' + P(Math.sin(a) * r1) + '" y1="' + P(-Math.cos(a) * r1) + '" x2="' + P(Math.sin(a) * r2) + '" y2="' + P(-Math.cos(a) * r2) +
          '" stroke="' + (grand ? '#3f3428' : '#5d6776') + '" stroke-width="' + (grand ? 2.6 : 1.1) + '" stroke-linecap="round"/>';
      }
      // chiffres gravés (crème, bord sombre)
      for(let n = 1; n <= 12; n++){
        const a = n * 30 * Math.PI / 180, r = R - 36;
        s += '<text x="' + P(Math.sin(a) * r) + '" y="' + P(-Math.cos(a) * r + R * 0.075) + '" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="' + P(R * 0.2) + '" font-weight="700"' +
          ' fill="#fbf6ea" stroke="#3f3226" stroke-width="1.3" paint-order="stroke" filter="url(#so-grave)">' + n + '</text>';
      }
      // petite aiguille (heures) puis grande aiguille (minutes) : argent ciselé
      const lh = R * 0.5, lm = R * 0.8;
      s += '<g class="aig aig-h" filter="url(#so-grave)"><path d="M-6 16 L-5 0 L-3.2 ' + P(-lh * .62) + ' L-9 ' + P(-lh * .72) + ' L0 ' + P(-lh) + ' L9 ' + P(-lh * .72) + ' L3.2 ' + P(-lh * .62) + ' L5 0 L6 16 Z"' +
        ' fill="url(#so-argent)" stroke="#3f3226" stroke-width="1.4" stroke-linejoin="round"/><circle cy="' + P(-lh * .72) + '" r="2.2" fill="#3f3226"/>' +
        '<line x1="0" y1="0" x2="0" y2="' + P(-lh) + '" stroke="transparent" stroke-width="34"/></g>';
      s += '<g class="aig aig-m" filter="url(#so-grave)"><path d="M-4 22 L-3.2 0 L-1.8 ' + P(-lm * .8) + ' L-6 ' + P(-lm * .86) + ' L0 ' + P(-lm) + ' L6 ' + P(-lm * .86) + ' L1.8 ' + P(-lm * .8) + ' L3.2 0 L4 22 Z"' +
        ' fill="#fdfbf6" stroke="#3f3226" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<line x1="0" y1="0" x2="0" y2="' + P(-lm) + '" stroke="transparent" stroke-width="30"/></g>';
      s += '<circle r="9" fill="url(#so-argent)" stroke="#3f3226" stroke-width="1.4"/><circle r="3" fill="#8a8272"/></svg>';
      return s;
    }
    function construire(){
      css();
      el = document.createElement('div'); el.className = 'so-horl'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Horloge magique');
      el.innerHTML = '<div class="so-horl-air" title="Glisse ici pour déplacer l\'horloge"><div class="so-horl-num">3:00</div><div class="so-horl-mots"></div></div>' +
        '<div class="so-horl-cadran"><img class="so-horl-art" src="' + IMG_HORLOGE + '" alt="" draggable="false">' + svg() +
          '<button type="button" class="so-horl-duree-btn" title="Calculer le temps écoulé entre deux heures, ou reculer pour trouver l\'heure qu\'il était">⏱ Calculer la durée</button>' +
          '<div class="so-horl-form" role="dialog" aria-label="Heure de début"><p>À partir de quelle heure ?</p><p class="aide-sens">Avance : combien de temps a passé.<br>Recule : quelle heure il était.</p>' +
            '<input type="number" min="0" max="23" inputmode="numeric" class="duree-h" aria-label="Heure"><span class="deux-pts">:</span>' +
            '<input type="number" min="0" max="59" inputmode="numeric" class="duree-m" aria-label="Minutes"><br>' +
            '<button type="button" class="duree-ok">Commencer ✨</button><p class="erreur"></p></div>' +
          '<div class="so-horl-bornes"><div class="so-horl-borne"><b class="borne-debut">0:00</b><span class="nom-debut">début</span></div>' +
            '<div class="so-horl-borne"><b class="borne-fin">0:00</b><span class="nom-fin">fin</span></div></div>' +
        '</div>' +
        '<div class="so-horl-outils">' +
          '<button type="button" data-a="-1" title="Reculer d\'une minute">− 1 min</button>' +
          '<button type="button" data-a="+1" title="Avancer d\'une minute">+ 1 min</button>' +
          '<button type="button" data-a="matin" title="Heures du matin (0:00 à 11:59)">☀️ Matin</button>' +
          '<button type="button" data-a="soir" title="Heures de l\'après-midi et du soir (12:00 à 23:59)">🌙 Après-midi</button>' +
          '<button type="button" data-a="fermer" title="Faire disparaître l\'horloge">✕</button>' +
        '</div>';
      document.body.appendChild(el);
      const svgEl = el.querySelector('svg');
      let g = null;
      function angle(e){
        const r = svgEl.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        return (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI + 360) % 360;   // 0° = midi, sens horaire
      }
      el.querySelectorAll('.aig').forEach(a => a.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        g = { type: a.classList.contains('aig-h') ? 'h' : 'm' };
        try{ svgEl.setPointerCapture(e.pointerId); }catch(_){}
      }));
      svgEl.addEventListener('pointermove', e => {
        if(!g) return;
        const deg = angle(e);
        if(g.type === 'm'){
          // minute visée : la plus proche sur le cadran ; passer par le 12 change l'heure
          const cible = Math.round(deg / 6) % 60, actuelle = mm();
          let diff = cible - actuelle;
          if(diff > 30) diff -= 60; else if(diff < -30) diff += 60;
          regler(null, null, totalMin + diff);
        } else {
          // la petite aiguille choisit l'heure ; les minutes restent les mêmes
          const matin = h24() < 12;
          let h = Math.floor(((deg - mm() * 0.5 + 360) % 360) / 30 + 0.5) % 12;   // heure la plus proche compte tenu des minutes
          regler((matin ? 0 : 12) + h, mm());
        }
      });
      const fin = () => { g = null; };
      svgEl.addEventListener('pointerup', fin); svgEl.addEventListener('pointercancel', fin);
      el.querySelector('.so-horl-outils').addEventListener('click', e => {
        const b = e.target.closest('button'); if(!b) return;
        const a = b.dataset.a;
        if(a === '-1') regler(null, null, totalMin - 1);
        if(a === '+1') regler(null, null, totalMin + 1);
        if(a === 'matin' && h24() >= 12) regler(null, null, totalMin - 720);
        if(a === 'soir' && h24() < 12) regler(null, null, totalMin + 720);
        if(a === 'fermer' && !fermetureBloquee) fermer();
      });
      // ---- Calculer la durée ----
      const btnDuree = el.querySelector('.so-horl-duree-btn'), form = el.querySelector('.so-horl-form');
      const champH = form.querySelector('.duree-h'), champM = form.querySelector('.duree-m'), erreurForm = form.querySelector('.erreur');
      btnDuree.addEventListener('click', () => {
        if(duree){ arreterDuree(); return; }
        if(form.classList.contains('ouvert')){ form.classList.remove('ouvert'); return; }
        champH.value = h24(); champM.value = deux(mm()); erreurForm.textContent = '';
        form.classList.add('ouvert'); setTimeout(() => { champH.focus(); champH.select(); }, 30);
      });
      function commencerDuree(){
        const h = parseInt(champH.value, 10), m = parseInt(champM.value, 10);
        if(!(h >= 0 && h <= 23) || !(m >= 0 && m <= 59)){ erreurForm.textContent = 'Heure de 0 à 23, minutes de 0 à 59.'; return; }
        form.classList.remove('ouvert');
        duree = null; regler(h, m);                     // l'horloge se place à l'heure du début
        duree = { debut: h * 60 + m, ecoule: 0 };
        el.classList.add('en-duree'); btnDuree.classList.add('actif'); btnDuree.textContent = '✕ Terminer le calcul';
        dessiner();
      }
      form.querySelector('.duree-ok').addEventListener('click', commencerDuree);
      form.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); commencerDuree(); } e.stopPropagation(); });
      // déplacer l'horloge en la tenant par son heure magique
      const air = el.querySelector('.so-horl-air');
      let d = null;
      air.addEventListener('pointerdown', e => {
        const r = el.getBoundingClientRect();
        d = { dx: e.clientX - r.left, dy: e.clientY - r.top };
        try{ air.setPointerCapture(e.pointerId); }catch(_){}
        e.preventDefault();
      });
      air.addEventListener('pointermove', e => {
        if(!d) return;
        el.classList.add('deplacee');
        el.style.left = Math.max(-100, Math.min(window.innerWidth - 120, e.clientX - d.dx)) + 'px';
        el.style.top = Math.max(-40, Math.min(window.innerHeight - 120, e.clientY - d.dy)) + 'px';
      });
      const finD = () => { d = null; };
      air.addEventListener('pointerup', finD); air.addEventListener('pointercancel', finD);
      dessiner(true);
      // poussière de magie qui monte doucement de l'heure écrite dans les airs
      setInterval(() => {
        if(!montre) return;
        const p = document.createElement('div'); p.className = 'so-horl-poussiere';
        p.style.left = (30 + Math.random() * (el.offsetWidth - 60)) + 'px'; p.style.top = (70 + Math.random() * 30) + 'px';
        p.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
        air.appendChild(p); setTimeout(() => p.remove(), 2500);
      }, 260);
    }
    let dernierTexte = '';
    let duree = null;   // mode « Calculer la durée » : { debut: minutes depuis minuit, ecoule: minutes écoulées (négatif = à reculons) }
    function texteDuree(n){ const h = Math.floor(n / 60), m = n % 60; return h ? h + ' h' + (m ? ' ' + deux(m) : '') : m + ' min'; }
    function arreterDuree(){
      duree = null;
      if(!el) return;
      el.classList.remove('en-duree');
      const b = el.querySelector('.so-horl-duree-btn'); b.classList.remove('actif'); b.textContent = '⏱ Calculer la durée';
      dessiner();
    }
    function dessiner(silence){
      if(!el) return;
      const h = h24(), m = mm();
      el.querySelector('.aig-m').setAttribute('transform', 'rotate(' + (m * 6) + ')');
      el.querySelector('.aig-h').setAttribute('transform', 'rotate(' + ((h % 12) * 30 + m * 0.5) + ')');
      const recule = !!(duree && duree.ecoule < 0);
      const texte = duree ? texteDuree(Math.abs(duree.ecoule)) : h + ':' + deux(m);
      el.classList.toggle('a-reculons', recule);
      const num = el.querySelector('.so-horl-num');
      num.textContent = texte;
      el.querySelector('.so-horl-mots').textContent = duree ? (recule ? 'plus tôt (à reculons)' : 'de temps écoulé') : motsHeure();
      if(duree){
        el.querySelector('.borne-debut').textContent = Math.floor(duree.debut / 60) + ':' + deux(duree.debut % 60);
        el.querySelector('.borne-fin').textContent = h + ':' + deux(m);
        el.querySelector('.nom-debut').textContent = recule ? 'il est' : 'début';
        el.querySelector('.nom-fin').textContent = recule ? 'il était' : 'fin';
      }
      el.querySelector('[data-a="matin"]').classList.toggle('actif', h < 12);
      el.querySelector('[data-a="soir"]').classList.toggle('actif', h >= 12);
      if(!silence && texte !== dernierTexte){ num.classList.remove('change'); void num.offsetWidth; num.classList.add('change'); }
      dernierTexte = texte;
    }
    function regler(h, m, total){
      const avant = totalMin;
      let ecart;   // de combien de minutes les aiguilles ont tourné (pour le temps écoulé)
      if(total === undefined || total === null){
        total = (+h || 0) * 60 + (+m || 0);
        ecart = ((total - avant) % 1440 + 1440) % 1440; if(ecart > 720) ecart -= 1440;   // le chemin le plus court
      } else ecart = Math.round(total) - avant;
      if(duree){
        // On peut aussi reculer avant le départ : « quelle heure était-il il y a 2 h 10 ? » (ecoule négatif).
        // Limite : moins d'une journée dans un sens comme dans l'autre.
        duree.ecoule = Math.max(-1439, Math.min(1439, duree.ecoule + ecart));
      }
      totalMin = ((Math.round(total) % 1440) + 1440) % 1440;
      dessiner();
      if(totalMin !== avant) abonnes.forEach(f => { try{ f({ h: h24(), m: mm() }); }catch(e){} });
    }
    function ouvrir(){
      if(!el) construire();
      el.classList.remove('deplacee'); el.style.left = ''; el.style.top = '';
      montre = true; void el.offsetWidth; el.classList.add('visible'); dessiner(true); signaler('horloge', true);
      const art = el.querySelector('.so-horl-art'); if(art){ art.style.animation = 'none'; void art.offsetWidth; art.style.animation = ''; }
    }
    function fermer(){ if(!el || !montre) return; montre = false; el.classList.remove('visible'); arreterDuree(); signaler('horloge', false); }
    let placeFixe = null;   // position choisie par la page : { left, top, echelle }
    function placer(p){
      placeFixe = p;
      if(!el) construire();
      appliquerPlace();
    }
    function appliquerPlace(){
      if(!placeFixe) return;
      el.classList.add('deplacee');
      el.style.left = placeFixe.left + 'px'; el.style.top = placeFixe.top + 'px';
      el.style.setProperty('--e', placeFixe.echelle || 1);
    }
    return {
      ouvrir(){ ouvrir(); appliquerPlace(); }, fermer, visible: () => montre, placer,
      lire: () => ({ h: h24(), m: mm() }),
      regler: (h, m) => regler(h, m),
      surChangement: f => abonnes.push(f)
    };
  })();


  /* =====================================================================
     5. LE VÉLO MAGIQUE (BMX)
     Le vélo apparaît dans les airs, par magie. L'élève le fait tourner sur
     lui-même en le glissant avec la souris (ou le doigt) : dans le sens des
     aiguilles d'une montre, l'angle augmente jusqu'à 1080° (3 tours) ; dans
     l'autre sens, il revient jusqu'à 0°, autant de fois qu'il le veut.
     En lettres mauves flottantes : à gauche les DEGRÉS, à droite les QUARTS
     DE TOUR et les DEMI-TOURS. Boutons −90°, −1°, +1°, +90°, ⟲ 0°.
     Image : livre_assets/velo_magique.webp (chemin trouvé à partir de ce
     fichier, pour marcher dans le Grimoire et dans entrainements/).
     ===================================================================== */
  const velo = (function(){
    const MAX = 1080;
    let el = null, montre = false, deg = 0, dernierQuart = 0;
    const abonnes = [];
    const IMG = BASE + 'livre_assets/velo_magique.webp';
    function css(){
      styles('so-velo', `
        .so-velo{ position:fixed; z-index:${Z + 3}; left:50%; top:50%; width:min(880px, 96vw); transform:translate(-50%,-46%) scale(.9); opacity:0; pointer-events:none;
          transition:transform .35s cubic-bezier(.2,1.3,.4,1), opacity .3s; font-family:Georgia, serif; user-select:none; -webkit-user-select:none; }
        .so-velo.visible{ transform:translate(-50%,-50%); opacity:1; pointer-events:auto; }
        .so-velo.deplacee{ transform:scale(var(--e, 1)); transform-origin:0 0; }
        .so-velo-scene{ display:grid; grid-template-columns:1fr minmax(260px, 46%) 1fr; align-items:center; gap:6px; }
        .so-velo-col{ text-align:center; animation:so-velo-flotte 3.4s ease-in-out infinite; cursor:grab; touch-action:none; }
        .so-velo-col.droite{ animation-delay:.6s; }
        .so-velo-col:active{ cursor:grabbing; }
        @keyframes so-velo-flotte{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
        /* un voile de magie sombre derrière le vélo et ses lettres : lisible sur le parchemin clair comme sur le fond sombre */
        .so-velo::before{ content:""; position:absolute; inset:-30px -50px 30px; z-index:-1; border-radius:48%; pointer-events:none;
          background:radial-gradient(ellipse at 50% 50%, rgba(36,10,64,.82), rgba(36,10,64,.55) 45%, rgba(36,10,64,0) 72%); }
        .so-velo-grand{ font-family:'Cinzel Decorative', 'Cinzel', Georgia, serif; font-weight:700; font-size:clamp(40px, 6.4vw, 70px); line-height:1; color:#faf5ff;
          -webkit-text-stroke:1px #4c1d95; text-shadow:0 0 2px #3b0764, 0 0 4px #3b0764, 0 0 12px #c084fc, 0 0 28px #a855f7, 0 0 50px #7c3aed; font-variant-numeric:tabular-nums; }
        .so-velo-moyen{ font-family:'Cinzel Decorative', 'Cinzel', Georgia, serif; font-weight:700; font-size:clamp(28px, 4.2vw, 46px); line-height:1.05; color:#faf5ff;
          -webkit-text-stroke:.8px #4c1d95; text-shadow:0 0 2px #3b0764, 0 0 4px #3b0764, 0 0 12px #c084fc, 0 0 26px #a855f7; font-variant-numeric:tabular-nums; }
        .so-velo-etiq{ margin-top:4px; font-size:clamp(14px, 1.6vw, 18px); font-style:italic; font-weight:700; color:#f3e8ff; text-shadow:0 0 2px #2e1065, 0 0 3px #2e1065, 0 0 10px #a855f7; }
        .so-velo-bloc + .so-velo-bloc{ margin-top:16px; }
        .so-velo-grand.eclat, .so-velo-moyen.eclat{ animation:so-velo-eclat .5s ease-out; }
        @keyframes so-velo-eclat{ 0%{ filter:brightness(2.4) blur(1px); transform:scale(1.12); } 100%{ filter:none; transform:none; } }
        .so-velo-roue{ position:relative; aspect-ratio:1; cursor:grab; touch-action:none; }
        .so-velo-roue:active{ cursor:grabbing; }
        .so-velo-cercle{ position:absolute; inset:2%; border-radius:50%; border:2px dashed rgba(216,180,254,.45);
          background:radial-gradient(circle, rgba(88,28,135,.35), rgba(30,10,50,.15) 60%, transparent 72%); box-shadow:0 0 30px rgba(168,85,247,.35) inset; }
        /* plan cartésien : les deux axes seulement, centrés sur l'axe de rotation du vélo (le centre de la roue) */
        .so-velo-axes{ position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible; }
        .so-velo-axes line{ stroke:#e9d5ff; stroke-width:1.6; vector-effect:non-scaling-stroke; opacity:.9; filter:drop-shadow(0 0 3px #a855f7); }
        .so-velo-axes path{ fill:#e9d5ff; opacity:.9; }
        .so-velo-img{ position:absolute; left:50%; top:50%; width:96%; height:auto; transform:translate(-50%,-50%) rotate(0deg); pointer-events:none;
          filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)) drop-shadow(0 0 14px rgba(192,132,252,.55)); }
        .so-velo-img.apparait{ animation:so-velo-apparait 1.1s cubic-bezier(.2,.9,.3,1.15); }
        @keyframes so-velo-apparait{ 0%{ opacity:0; filter:brightness(3) blur(6px); } 60%{ opacity:1; } 100%{ opacity:1; } }
        .so-velo-sens{ position:absolute; right:4%; top:4%; font-size:26px; color:#e9d5ff; text-shadow:0 0 10px #a855f7; opacity:.8; pointer-events:none; }
        .so-velo-indice{ text-align:center; min-height:20px; margin-top:4px; font-size:15px; font-style:italic; font-weight:700; color:#f3e8ff; text-shadow:0 0 2px #2e1065, 0 0 3px #2e1065, 0 0 8px #7c3aed; }
        .so-velo-outils{ display:flex; justify-content:center; gap:6px; margin-top:8px; flex-wrap:wrap; }
        .so-velo-outils button{ font:700 13px/1 system-ui, sans-serif; height:32px; padding:0 11px; border-radius:999px; border:2px solid #d8b4fe;
          background:rgba(46,16,101,.9); color:#fdf4ff; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.4); }
        .so-velo-outils button:hover{ background:rgba(107,33,168,.95); }
        .so-velo-outils button[data-a="fermer"]{ background:#7f1d1d; border-color:#fca5a5; }
        .so-velo-poussiere{ position:absolute; width:5px; height:5px; border-radius:50%; background:#e9d5ff; box-shadow:0 0 8px #c084fc; pointer-events:none;
          animation:so-pouss 2.4s ease-out forwards; }
        @media (max-width:700px){ .so-velo-scene{ grid-template-columns:1fr; } .so-velo-col.droite{ order:3; } }
      `);
    }
    // 2,5 → « 2,5 » ; 3 → « 3 » (écriture française, au plus 2 décimales)
    const fr = n => { const r = Math.round(n * 100) / 100; return String(r).replace('.', ','); };
    function construire(){
      css();
      el = document.createElement('div'); el.className = 'so-velo'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Vélo magique');
      el.innerHTML =
        '<div class="so-velo-scene">' +
          '<div class="so-velo-col gauche" title="Glisse ici pour déplacer le vélo"><div class="so-velo-bloc"><div class="so-velo-grand" data-v="deg">0°</div><div class="so-velo-etiq">degrés</div></div></div>' +
          '<div class="so-velo-roue" title="Fais tourner le vélo avec ta souris"><div class="so-velo-cercle"></div>' +
            '<svg class="so-velo-axes" viewBox="-100 -100 200 200" aria-hidden="true">' +
              '<line x1="-100" y1="0" x2="100" y2="0"/><line x1="0" y1="-100" x2="0" y2="100"/>' +
              '<path d="M100 0 L91 -4.5 L91 4.5 Z"/><path d="M0 -100 L-4.5 -91 L4.5 -91 Z"/>' +
            '</svg>' +
            '<img class="so-velo-img" alt="Vélo magique" draggable="false"><div class="so-velo-sens" aria-hidden="true">↻</div></div>' +
          '<div class="so-velo-col droite" title="Glisse ici pour déplacer le vélo">' +
            '<div class="so-velo-bloc"><div class="so-velo-moyen" data-v="quarts">0</div><div class="so-velo-etiq" data-v="quarts-mot">quart de tour</div></div>' +
            '<div class="so-velo-bloc"><div class="so-velo-moyen" data-v="demis">0</div><div class="so-velo-etiq" data-v="demis-mot">demi-tour</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="so-velo-indice"></div>' +
        '<div class="so-velo-outils">' +
          '<button type="button" data-a="-90" title="Reculer d\'un quart de tour">− 90°</button>' +
          '<button type="button" data-a="-1" title="Reculer d\'un degré">− 1°</button>' +
          '<button type="button" data-a="+1" title="Avancer d\'un degré">+ 1°</button>' +
          '<button type="button" data-a="+90" title="Avancer d\'un quart de tour">+ 90°</button>' +
          '<button type="button" data-a="zero" title="Revenir à 0°">⟲ 0°</button>' +
          '<button type="button" data-a="fermer" title="Faire disparaître le vélo">✕</button>' +
        '</div>';
      document.body.appendChild(el);
      const img = el.querySelector('.so-velo-img');
      img.onload = () => {};
      img.src = IMG;
      // tourner : on suit l'angle de la souris autour du centre, tour après tour (sans sauter de 359° à 0°)
      const roue = el.querySelector('.so-velo-roue');
      let g = null;
      const angleSouris = e => { const r = roue.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
      roue.addEventListener('pointerdown', e => { e.preventDefault(); g = { a: angleSouris(e), brut: deg }; try{ roue.setPointerCapture(e.pointerId); }catch(_){} });
      roue.addEventListener('pointermove', e => {
        if(!g) return;
        const a = angleSouris(e);
        let d = a - g.a; if(d > 180) d -= 360; else if(d < -180) d += 360;   // sens horaire à l'écran = angle qui augmente
        g.a = a; g.brut += d;
        if(g.brut < 0){ g.brut = 0; indice('Tu es à 0° : tourne dans l\'autre sens ↻'); }
        else if(g.brut > MAX){ g.brut = MAX; indice('1080° : trois tours complets, c\'est le maximum !'); }
        else indice('');
        regler(Math.round(g.brut));
      });
      const fin = () => { g = null; };
      roue.addEventListener('pointerup', fin); roue.addEventListener('pointercancel', fin);
      el.querySelector('.so-velo-outils').addEventListener('click', e => {
        const b = e.target.closest('button'); if(!b) return;
        const a = b.dataset.a;
        if(a === 'fermer'){ if(!fermetureBloquee) fermer(); return; }
        if(a === 'zero'){ regler(0); return; }
        const n = deg + parseInt(a, 10);
        if(n < 0) indice('Tu es à 0° : impossible de reculer encore.'); else if(n > MAX) indice('1080°, c\'est le maximum !'); else indice('');
        regler(Math.max(0, Math.min(MAX, n)));
      });
      // déplacer le vélo en le tenant par ses lettres magiques
      el.querySelectorAll('.so-velo-col').forEach(col => {
        let d = null;
        col.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); d = { dx: e.clientX - r.left, dy: e.clientY - r.top }; try{ col.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); });
        col.addEventListener('pointermove', e => {
          if(!d) return;
          el.classList.add('deplacee');
          el.style.left = Math.max(-200, Math.min(window.innerWidth - 160, e.clientX - d.dx)) + 'px';
          el.style.top = Math.max(-60, Math.min(window.innerHeight - 140, e.clientY - d.dy)) + 'px';
        });
        const f = () => { d = null; }; col.addEventListener('pointerup', f); col.addEventListener('pointercancel', f);
      });
      // poussière de magie autour du vélo
      setInterval(() => {
        if(!montre) return;
        const p = document.createElement('div'); p.className = 'so-velo-poussiere';
        p.style.left = (10 + Math.random() * 80) + '%'; p.style.top = (55 + Math.random() * 35) + '%';
        p.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
        roue.appendChild(p); setTimeout(() => p.remove(), 2500);
      }, 220);
      dessiner();
    }
    function indice(t){ if(el) el.querySelector('.so-velo-indice').textContent = t; }
    function eclat(sel){ const n = el.querySelector(sel); n.classList.remove('eclat'); void n.offsetWidth; n.classList.add('eclat'); }
    function dessiner(){
      if(!el) return;
      const q = Math.floor(deg / 90), dm = Math.floor(deg / 180);   // quarts et demi-tours COMPLETS : jamais de décimales
      el.querySelector('.so-velo-img').style.transform = 'translate(-50%,-50%) rotate(' + deg + 'deg)';
      el.querySelector('[data-v="deg"]').textContent = deg + '°';
      el.querySelector('[data-v="quarts"]').textContent = fr(q);
      el.querySelector('[data-v="demis"]').textContent = fr(dm);
      el.querySelector('[data-v="quarts-mot"]').textContent = q >= 2 ? 'quarts de tour' : 'quart de tour';
      el.querySelector('[data-v="demis-mot"]').textContent = dm >= 2 ? 'demi-tours' : 'demi-tour';
      el.querySelector('.so-velo-sens').textContent = deg >= MAX ? '↺' : '↻';
    }
    function regler(n){
      const avant = deg;
      deg = Math.max(0, Math.min(MAX, Math.round(+n || 0)));
      dessiner();
      if(deg === avant) return;
      // un quart de tour pile franchi : éclat et étincelles
      const quart = Math.floor(deg / 90);
      if(deg % 90 === 0 && el){
        eclat('[data-v="deg"]'); eclat('[data-v="quarts"]'); if(deg % 180 === 0) eclat('[data-v="demis"]');
        const r = el.querySelector('.so-velo-roue').getBoundingClientRect();
        if(montre && quart !== dernierQuart) etincelles(r.left + r.width / 2, r.top + r.height / 2, '#e9d5ff');
      }
      dernierQuart = quart;
      abonnes.forEach(f => { try{ f(deg); }catch(e){} });
    }
    function ouvrir(){
      if(!el) construire();
      el.classList.remove('deplacee'); el.style.left = ''; el.style.top = '';
      montre = true; void el.offsetWidth; el.classList.add('visible');
      const img = el.querySelector('.so-velo-img'); img.classList.remove('apparait'); void img.offsetWidth; img.classList.add('apparait');
      indice('Fais tourner le vélo avec ta souris ↻');
      dessiner(); signaler('velo', true);
    }
    function fermer(){ if(!el || !montre) return; montre = false; el.classList.remove('visible'); signaler('velo', false); }
    let placeFixe = null;
    function placer(p){ placeFixe = p; if(!el) construire(); appliquerPlace(); }
    function appliquerPlace(){
      if(!placeFixe) return;
      el.classList.add('deplacee');
      el.style.left = placeFixe.left + 'px'; el.style.top = placeFixe.top + 'px';
      el.style.setProperty('--e', placeFixe.echelle || 1);
    }
    return {
      ouvrir(){ ouvrir(); appliquerPlace(); }, fermer, visible: () => montre, placer,
      lire: () => deg,
      regler: n => regler(n),
      surChangement: f => abonnes.push(f)
    };
  })();

  /* =====================================================================
     Interface commune
     ===================================================================== */
  const OUTILS = { calculatrice, regle, rapporteur, horloge, velo };
  window.SortsOutils = {
    OUTILS,
    calculatrice, regle, rapporteur, horloge, velo,
    ouvrir(nom, depuis){
      const o = OUTILS[nom]; if(!o) return;
      o.ouvrir();
      if(depuis){ const r = depuis.getBoundingClientRect(); etincelles(r.left + r.width / 2, r.top + r.height / 2); }
    },
    fermer(nom){ const o = OUTILS[nom]; if(o) o.fermer(); },
    basculer(nom, depuis){ if(this.visible(nom)) this.fermer(nom); else this.ouvrir(nom, depuis); },
    visible(nom){ const o = OUTILS[nom]; return !!(o && o.visible()); },
    toutFermer(){ Object.keys(OUTILS).forEach(n => this.fermer(n)); },
    // Entraînement : true = plus aucun bouton ✕ sur les outils, et l'élève ne peut pas les faire disparaître.
    bloquerFermeture(oui){
      fermetureBloquee = !!oui;
      styles('so-sans-fermer', 'body.so-fermeture-bloquee [data-a="fermer"], body.so-fermeture-bloquee .so-calc-x{ display:none !important; }');
      document.documentElement.classList.toggle('so-fermeture-bloquee', fermetureBloquee);
      if(document.body) document.body.classList.toggle('so-fermeture-bloquee', fermetureBloquee);
      else document.addEventListener('DOMContentLoaded', () => document.body.classList.toggle('so-fermeture-bloquee', fermetureBloquee));
    },
    genre(g){ if(g) GENRE = String(g).toLowerCase() === 'fille' ? 'fille' : 'garcon'; return GENRE; },
    surChangement(f){ ecouteurs.push(f); },
    etincelles
  };
})();
