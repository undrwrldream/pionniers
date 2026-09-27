/* =====================================================================
   COMPAGNON-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Le compagnon de l'élève : le bébé dragon (Bahamut) pour les filles,
   le chien-loup (Geri) pour les garçons. Il apparaît à partir du rang
   Novice (niveau 1) : un cercle avec son visage, en bas à gauche de la
   fiche de personnage. Cliquer le visage l'invoque : il apparaît à DROITE
   de l'écran (la gauche est réservée à la boule de cristal).

   Chargé seulement par interface_eleve.html (la fiche) : les livres
   (Grimoire, Parchemins…) s'ouvrent PAR-DESSUS la fiche, donc le cercle
   reste visible et utilisable pendant tout le travail, sans doublon.

   Ce que fait le compagnon selon le rang (index de NIVEAUX_LECTURE) :
     0 Apprenti    : le compagnon est là seulement comme narrateur et gardien de la boule de cristal.
     1 Novice      : il encourage l'élève d'une phrase, puis disparaît.
     Tous les rangs : dans un livre ouvert, il est le NARRATEUR (« Lis-moi le texte ») et garde la
                     BOULE DE CRISTAL (prédiction de mots) — voir lecture-magique.js.
     2 Invocateur  : il encourage (la calculatrice et le rapporteur sont devenus des SORTS :
                     barre de sorts du Grimoire, sorts-core.js, appris par les entraînements).
     3 Magicien    : il encourage. Plus tard : le « calcul magique » (l'élève clique
                     les nombres de la page pour bâtir un calcul qui apparaît dans le vide),
                     quand il aura des sorts de magicien puissants.
     4 Sorcier     : le parchemin des formules (FORMULES ci-dessous) + un encouragement.
     5 Archimage   : comme le Sorcier pour l'instant (capacités à venir).
   Le parchemin n'est offert QUE quand le Grimoire des mathématiques est ouvert
   (Évaluations comprises) ; ailleurs, le compagnon encourage seulement.

   Utilisation : Compagnon.maj({ genre: 'fille'|'garcon', niveau: 0..5, grimoireOuvert: bool })
   à chaque fois qu'une de ces valeurs peut avoir changé.
   ===================================================================== */

window.Compagnon = (function(){

  const COMPAGNONS = {
    fille:  { nom: 'Bébé Bahamut', image: 'compagnons/dragon.webp',     visage: 'compagnons/dragon-visage.webp' },
    garcon: { nom: 'Geri',         image: 'compagnons/chien-loup.webp', visage: 'compagnons/chien-loup-visage.webp' }
  };
  const NIVEAU_APPARITION = 0;   // tous les élèves : le compagnon est aussi leur narrateur et garde la boule de cristal (lecture-magique.js)
  const NIVEAU_FORMULES = 4;     // Sorcier : parchemin des formules
  const NIVEAU_OUTILS = NIVEAU_FORMULES;   // à partir de ce rang, il propose un choix dans le Grimoire

  // Parchemin des formules (Sorcier). Pour en ajouter : une ligne [nom, formule] dans la bonne famille.
  const FORMULES = [
    ['Périmètre', [
      ['Carré', '4 × côté'],
      ['Rectangle', '2 × (longueur + largeur)'],
      ['Tout polygone', 'somme de la mesure des côtés']]],
    ['Aire', [
      ['Carré', 'côté × côté'],
      ['Rectangle', 'longueur × largeur'],
      ['Triangle', '(base × hauteur) ÷ 2'],
      ['Parallélogramme', 'base × hauteur']]],
    ['Volume', [
      ['Cube', 'arête × arête × arête'],
      ['Prisme rectangulaire', 'longueur × largeur × hauteur']]],
    ['Longueurs', [
      ['1 km', '1 000 m'],
      ['1 m', '10 dm = 100 cm = 1 000 mm'],
      ['1 dm', '10 cm'],
      ['1 cm', '10 mm']]],
    ['Temps', [
      ['1 jour', '24 h'],
      ['1 h', '60 min'],
      ['1 min', '60 s'],
      ['Un quart / une demie', '15 min / 30 min']]],
    ['Angles', [
      ['Aigu', 'moins de 90°'],
      ['Droit', '90°'],
      ['Obtus', 'entre 90° et 180°'],
      ['Plat / plein', '180° / 360°'],
      ['Angles d’un triangle', 'ensemble, 180°']]],
    ['Nombres', [
      ['Moyenne', 'somme des données ÷ nombre de données'],
      ['Pourcentages', '50 % = 1/2 · 25 % = 1/4 · 10 % = 1/10']]]
  ];

  const ENCOURAGEMENTS = [
    "Tu es capable. Une étape à la fois !",
    "Respire, relis la question… tu vas trouver.",
    "Chaque erreur t'apprend quelque chose. Continue !",
    "Je crois en toi, jeune mage !",
    "Prends ton temps : la magie vient avec la patience.",
    "Tu progresses plus que tu le penses.",
    "Un vrai mage n'abandonne jamais. Allez !",
    "Regarde bien les indices, ils sont là pour toi.",
    "Bravo pour tes efforts. Je suis fier de toi !",
    "Encore un petit effort, tu y es presque !",
    "Même les archimages ont déjà été novices.",
    "Concentre-toi, et laisse ta magie travailler."
  ];

  let etat = { genre: null, niveau: 0, grimoireOuvert: false };
  let racine = null, bouton = null, scene = null, minuterie = null, derniere = -1;
  let formules = null;

  function installerStyles(){
    if(document.getElementById('compagnon-styles')) return;
    const s = document.createElement('style');
    s.id = 'compagnon-styles';
    s.textContent = `
      .compagnon-racine{ position:fixed; left:14px; bottom:14px; z-index:10001; font-family:'Crimson Text', Georgia, serif; }
      .compagnon-cercle{ width:66px; height:66px; border-radius:50%; padding:0; cursor:pointer; overflow:hidden;
        border:3px solid #C9A227; background:#1b140c; box-shadow:0 0 0 2px #3a2a12, 0 4px 14px rgba(0,0,0,.55);
        animation: compagnon-lueur 2.8s ease-in-out infinite; transition: transform .15s ease; }
      .compagnon-cercle:hover{ transform: scale(1.07); }
      .compagnon-cercle img{ width:100%; height:100%; object-fit:cover; display:block; transform:scale(1.14); }
      @keyframes compagnon-lueur{ 0%,100%{ box-shadow:0 0 0 2px #3a2a12, 0 4px 14px rgba(0,0,0,.55); }
        50%{ box-shadow:0 0 0 2px #3a2a12, 0 0 18px 4px rgba(201,162,39,.55); } }
      /* La scène du compagnon apparaît PAR-DESSUS le livre, dans le coin en bas à DROITE, petite pour cacher
         le moins possible (le cercle reste en bas à gauche ; la boule de cristal apparaît en bas à gauche). */
      .compagnon-scene{ position:fixed; right:12px; bottom:6px; width:220px; display:flex; flex-direction:column; align-items:flex-end; gap:4px;
        pointer-events:none; opacity:0; transform: translateX(40px) scale(.92); transform-origin: bottom right;
        transition: opacity .4s ease, transform .5s cubic-bezier(.2,1.3,.4,1); }
      .compagnon-scene.visible{ opacity:1; transform:none; pointer-events:auto; }
      .compagnon-image{ order:2; height:min(120px, 16vh); width:auto; margin-right:10px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.5)); }
      .compagnon-bulle{ order:1; position:relative; width:100%; box-sizing:border-box; padding:8px 12px;
        background:#F4E9CF; color:#2b1d0e; border:2px solid #8B6914; border-radius:14px; font-size:15px; line-height:1.3;
        box-shadow:0 6px 16px rgba(0,0,0,.35); }
      .compagnon-bulle::before{ content:""; position:absolute; right:56px; bottom:-10px; border:8px solid transparent;
        border-top-color:#8B6914; border-bottom:0; }
      .compagnon-nom{ display:block; font-family:'Cinzel', Georgia, serif; font-size:12px; font-weight:700; letter-spacing:1px;
        color:#7A1F1F; margin-bottom:2px; }
      .compagnon-choix{ display:flex; flex-direction:column; gap:5px; margin-top:6px; }
      .compagnon-choix button{ font-family:'Crimson Text', Georgia, serif; font-size:14.5px; font-weight:700; text-align:left; cursor:pointer;
        padding:4px 9px; border-radius:9px; border:2px solid #8B6914; background:#fffaf0; color:#3b2a1a; }
      .compagnon-choix button:hover{ background:#C9A227; color:#1b140c; }
      .compagnon-panneau{ position:fixed; z-index:10000; left:96px; bottom:20px; background:#F4E9CF; border:3px solid #8B6914;
        border-radius:14px; box-shadow:0 10px 28px rgba(0,0,0,.45); font-family:'Crimson Text', Georgia, serif; color:#2b1d0e; }
      .compagnon-panneau-tete{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 8px 6px 12px;
        background:#3a2a12; color:#F4E9CF; border-radius:10px 10px 0 0; cursor:move; touch-action:none; user-select:none;
        font-family:'Cinzel', Georgia, serif; font-size:13px; font-weight:700; letter-spacing:1px; }
      .compagnon-panneau-tete button{ background:#7A1F1F; color:#fff; border:none; border-radius:50%; width:26px; height:26px; cursor:pointer; font-size:14px; }
      .formules-corps{ max-height:min(60vh, 460px); overflow-y:auto; padding:8px 14px 12px; width:340px; }
      .formules-corps h4{ margin:10px 0 4px; font-family:'Cinzel', Georgia, serif; font-size:14px; color:#7A1F1F; }
      .formules-corps div{ display:flex; justify-content:space-between; gap:12px; padding:3px 0; border-bottom:1px dotted #c9b27a; font-size:16px; }
      .formules-corps b{ white-space:nowrap; }
      .formules-corps span{ text-align:right; }
      @media (max-width:520px){ .compagnon-scene{ width:200px; } .compagnon-image{ height:120px; } .compagnon-bulle{ font-size:15px; } }
      @media (prefers-reduced-motion: reduce){ .compagnon-cercle{ animation:none; } .compagnon-scene{ transition:opacity .2s; transform:none; } }
    `;
    document.head.appendChild(s);
  }

  function construire(){
    installerStyles();
    racine = document.createElement('div');
    racine.className = 'compagnon-racine';
    racine.innerHTML =
      '<div class="compagnon-scene" aria-live="polite">' +
        '<img class="compagnon-image" alt="">' +
        '<div class="compagnon-bulle"><span class="compagnon-nom"></span><span class="compagnon-texte"></span><div class="compagnon-choix"></div></div>' +
      '</div>' +
      '<button type="button" class="compagnon-cercle"><img alt=""></button>';
    document.body.appendChild(racine);
    bouton = racine.querySelector('.compagnon-cercle');
    scene = racine.querySelector('.compagnon-scene');
    bouton.addEventListener('click', invoquer);
  }

  function choisirPhrase(){
    let i;
    do{ i = Math.floor(Math.random() * ENCOURAGEMENTS.length); } while(ENCOURAGEMENTS.length > 1 && i === derniere);
    derniere = i;
    return ENCOURAGEMENTS[i];
  }

  function cacher(){
    clearTimeout(minuterie);
    if(scene) scene.classList.remove('visible');
  }

  function outilsOfferts(){ return etat.grimoireOuvert && (etat.niveau || 0) >= NIVEAU_OUTILS; }

  function invoquer(){
    if(scene.classList.contains('visible')){ cacher(); return; }
    const texte = scene.querySelector('.compagnon-texte');
    const choix = scene.querySelector('.compagnon-choix');
    choix.innerHTML = '';
    clearTimeout(minuterie);
    const livre = !!(window.LectureMagique && window.LectureMagique.livreOuvert());
    if(!outilsOfferts() && !livre){
      // Hors des livres : une phrase d'encouragement, puis il repart.
      texte.textContent = choisirPhrase();
      scene.classList.add('visible');
      minuterie = setTimeout(cacher, 5000);
      return;
    }
    // Un livre est ouvert : il propose de lire le texte (narrateur), et au rang Sorcier, dans le Grimoire, le parchemin des formules.
    texte.textContent = 'Que puis-je faire pour toi ?';
    const offres = [];
    if(livre) offres.push(['📖 Lis-moi le texte', () => { window.LectureMagique.narrer(); }]);
    if(outilsOfferts()) offres.push(['📜 Parchemin des formules', ouvrirFormules]);
    offres.push(['✨ Un encouragement', () => { choix.innerHTML = ''; texte.textContent = choisirPhrase(); minuterie = setTimeout(cacher, 5000); return false; }]);
    offres.forEach(([lib, action]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = lib;
      b.addEventListener('click', () => { if(action() !== false) cacher(); });
      choix.appendChild(b);
    });
    scene.classList.add('visible');
  }

  /* ---------- Panneau flottant (parchemin des formules) : déplaçable par son bandeau ---------- */
  function creerPanneau(titre){
    installerStyles();
    const p = document.createElement('div');
    p.className = 'compagnon-panneau';
    p.innerHTML = '<div class="compagnon-panneau-tete"><span>' + titre + '</span><button type="button" title="Fermer">✕</button></div>';
    document.body.appendChild(p);
    p.querySelector('.compagnon-panneau-tete button').addEventListener('click', () => { p.style.display = 'none'; });
    const tete = p.querySelector('.compagnon-panneau-tete');
    let glisse = null;
    tete.addEventListener('pointerdown', e => {
      if(e.target.closest('button')) return;
      const r = p.getBoundingClientRect();
      glisse = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try{ tete.setPointerCapture(e.pointerId); }catch(_){}
    });
    tete.addEventListener('pointermove', e => {
      if(!glisse) return;
      const x = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - glisse.dx));
      const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - glisse.dy));
      p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.bottom = 'auto';
    });
    const fin = () => { glisse = null; };
    tete.addEventListener('pointerup', fin); tete.addEventListener('pointercancel', fin);
    return p;
  }

  /* ---------- Parchemin des formules (Sorcier) ---------- */
  function ouvrirFormules(){
    if(!formules){
      formules = creerPanneau('📜 Parchemin des formules');
      formules.style.left = 'auto'; formules.style.right = '20px'; formules.style.bottom = 'auto'; formules.style.top = '70px';
      formules.insertAdjacentHTML('beforeend', '<div class="formules-corps">' +
        FORMULES.map(([famille, lignes]) => '<h4>' + famille + '</h4>' +
          lignes.map(([nom, f]) => '<div><b>' + nom + '</b><span>' + f + '</span></div>').join('')).join('') + '</div>');
    }
    formules.style.display = '';
    return true;
  }

  // Quand le Grimoire se ferme, on range les outils.
  function rangerOutils(){
    if(formules) formules.style.display = 'none';
  }

  function maj(nouveau){
    etat = Object.assign({}, etat, nouveau || {});
    if(!outilsOfferts()){ rangerOutils(); if(scene && scene.querySelector('.compagnon-choix').children.length) cacher(); }
    const c = COMPAGNONS[etat.genre];
    const present = !!c && (etat.niveau || 0) >= NIVEAU_APPARITION;
    if(!present){
      cacher();
      if(racine) racine.style.display = 'none';
      return;
    }
    if(!racine) construire();
    racine.style.display = '';
    bouton.querySelector('img').src = c.visage;
    bouton.title = 'Invoquer ' + c.nom;
    bouton.setAttribute('aria-label', 'Invoquer ' + c.nom);
    scene.querySelector('.compagnon-image').src = c.image;
    scene.querySelector('.compagnon-nom').textContent = c.nom;
  }

  // Pour le narrateur (lecture-magique.js) : le nom et le visage du compagnon de l'élève.
  function infos(){ const c = COMPAGNONS[etat.genre] || COMPAGNONS.fille; return { nom: c.nom, image: c.image, visage: c.visage }; }
  return { maj, cacher, infos };
})();
