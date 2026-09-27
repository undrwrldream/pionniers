/* =====================================================================
   SORTS-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   La barre de sorts, en bas de l'écran du Grimoire des mathématiques.
   Elle est là en permanence (pages du livre, documents, évaluations).
   Chaque sort fait apparaître un outil mathématique (sorts-outils.js).

   Un sort s'apprend en réussissant son ENTRAÎNEMENT (fine section verte
   placée dans le Grimoire juste avant la section où l'outil sert pour la
   première fois). Tant qu'il n'est pas appris, son icône est éteinte,
   avec un cadenas.

   Sorts appris : clé « sorts_<élève> » = { horloge: date, regle: date, … }
   (lue et écrite par le Grimoire, qui passe les fonctions de stockage).

   Utilisation (Grimoire) :
     Sorts.installer({ lire: async () => objet, ecrire: async objet => …,
                       toutOuvert: bool, alerte: texte => … })
     Sorts.apprendre('horloge')  → Promise
     Sorts.appris('horloge')     → bool
     Sorts.masquer(bool)         → cache la barre (jeux plein écran)
   ===================================================================== */
(function(){
  if(window.Sorts) return;

  // Ordre de la barre = ordre dans lequel les sorts s'apprennent dans le Grimoire.
  const SORTS = [
    { id:'horloge',      nom:"L'horloge magique",       icone:'🕰️', entrainement:"Entraînement : l'horloge magique" },
    { id:'regle',        nom:'La règle enchantée',      icone:'📏', entrainement:'Entraînement : la règle enchantée' },
    { id:'rapporteur',   nom:'Le rapporteur des angles', icone:'📐', entrainement:'Entraînement : le rapporteur des angles' },
    { id:'calculatrice', nom:'La calculatrice magique', icone:'🧮', entrainement:'Entraînement : la calculatrice magique' },
    { id:'velo',         nom:'Le vélo magique',          icone:'🚲', entrainement:'Entraînement : le vélo magique' }
  ];

  let opt = { lire: async () => ({}), ecrire: async () => {}, toutOuvert: false, alerte: t => alert(t) };
  let appris = {};
  let barre = null;

  function css(){
    if(document.getElementById('sorts-styles')) return;
    const s = document.createElement('style'); s.id = 'sorts-styles';
    s.textContent = `
      .sorts-barre{ position:fixed; left:50%; bottom:8px; transform:translateX(-50%); z-index:8990; display:flex; align-items:center; gap:8px;
        padding:6px 12px 6px 10px; border-radius:999px; background:linear-gradient(180deg, rgba(43,24,10,.94), rgba(22,12,5,.96));
        border:2px solid #c9a227; box-shadow:0 0 0 2px #3a2a12, 0 6px 18px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,236,170,.25);
        font-family:'Cinzel', Georgia, serif; transition:opacity .25s, transform .25s; }
      .sorts-barre.cachee{ opacity:0; pointer-events:none; transform:translate(-50%, 30px); }
      .sorts-titre{ color:#e8c96a; font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; padding:0 4px 0 2px; white-space:nowrap; }
      .sorts-btn{ position:relative; width:46px; height:46px; border-radius:50%; border:2px solid #8b6914; cursor:pointer; padding:0;
        background:radial-gradient(circle at 50% 38%, #4c2a86, #1e0f3d 72%); font-size:22px; line-height:1;
        display:flex; align-items:center; justify-content:center; transition:transform .15s, box-shadow .2s, filter .2s; }
      .sorts-btn:hover{ transform:translateY(-3px) scale(1.06); box-shadow:0 0 14px 3px rgba(196,181,253,.55); }
      .sorts-btn.actif{ border-color:#fde68a; box-shadow:0 0 0 2px #fde68a, 0 0 18px 5px rgba(253,230,138,.6); animation:sorts-pulse 1.8s ease-in-out infinite; }
      @keyframes sorts-pulse{ 0%,100%{ box-shadow:0 0 0 2px #fde68a, 0 0 12px 3px rgba(253,230,138,.45); } 50%{ box-shadow:0 0 0 2px #fde68a, 0 0 22px 7px rgba(253,230,138,.75); } }
      .sorts-btn.verrou{ background:radial-gradient(circle at 50% 38%, #3a3230, #161210 72%); border-color:#4a3d2a; }
      .sorts-btn.verrou .sorts-ico{ filter:grayscale(1) brightness(.45); }
      .sorts-btn.verrou::after{ content:'🔒'; position:absolute; right:-4px; bottom:-4px; font-size:13px; filter:drop-shadow(0 1px 1px #000); }
      .sorts-btn.nouveau{ animation:sorts-nouveau 1.2s ease-out 3; }
      @keyframes sorts-nouveau{ 0%{ transform:scale(1); box-shadow:0 0 0 0 rgba(253,230,138,.9); } 50%{ transform:scale(1.25); box-shadow:0 0 0 14px rgba(253,230,138,0); } 100%{ transform:scale(1); } }
      .sorts-bulle{ position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%); white-space:nowrap; pointer-events:none;
        background:#f4e9cf; color:#2b1d0e; border:1.5px solid #8b6914; border-radius:9px; padding:5px 10px; font:700 13px/1.2 Georgia, serif;
        box-shadow:0 4px 10px rgba(0,0,0,.4); opacity:0; transition:opacity .15s; }
      .sorts-btn:hover .sorts-bulle, .sorts-btn:focus-visible .sorts-bulle{ opacity:1; }
      .sorts-bulle small{ display:block; font-weight:400; font-style:italic; font-size:11.5px; color:#6b4f1d; }
      @media (max-width:560px){ .sorts-titre{ display:none; } .sorts-btn{ width:42px; height:42px; font-size:20px; } }
    `;
    document.head.appendChild(s);
  }

  const estAppris = id => opt.toutOuvert || !!appris[id];

  function construire(){
    css();
    barre = document.createElement('div');
    barre.className = 'sorts-barre';
    barre.setAttribute('role', 'toolbar'); barre.setAttribute('aria-label', 'Barre de sorts');
    barre.innerHTML = '<span class="sorts-titre">✦ Sorts</span>' + SORTS.map(s =>
      '<button type="button" class="sorts-btn" data-sort="' + s.id + '" aria-label="' + s.nom + '"><span class="sorts-ico">' + s.icone + '</span>' +
      '<span class="sorts-bulle"></span></button>').join('');
    document.body.appendChild(barre);
    barre.addEventListener('click', e => {
      const b = e.target.closest('.sorts-btn'); if(!b) return;
      const s = SORTS.find(x => x.id === b.dataset.sort);
      if(!estAppris(s.id)){
        opt.alerte("🔒 Tu ne connais pas encore ce sort : " + s.nom + ". Réussis « " + s.entrainement + " » (la section verte du Grimoire) pour l'apprendre.");
        return;
      }
      if(s.id === 'rapporteur' && window.SortsOutils && !window.SortsOutils.rapporteur.disponible()) return;
      window.SortsOutils.basculer(s.id, b);
    });
    window.SortsOutils.surChangement(() => dessiner());
    dessiner();
  }

  function dessiner(){
    if(!barre) return;
    barre.querySelectorAll('.sorts-btn').forEach(b => {
      const s = SORTS.find(x => x.id === b.dataset.sort);
      const ok = estAppris(s.id);
      b.classList.toggle('verrou', !ok);
      b.classList.toggle('actif', ok && window.SortsOutils.visible(s.id));
      b.querySelector('.sorts-bulle').innerHTML = s.nom + (ok ? '<small>' + (window.SortsOutils.visible(s.id) ? 'Clique pour le faire disparaître' : 'Clique pour lancer le sort') + '</small>'
        : '<small>À apprendre : section verte « ' + s.entrainement.split(' : ')[1] + ' »</small>');
    });
  }

  window.Sorts = {
    SORTS,
    async installer(o){
      opt = Object.assign(opt, o || {});
      if(!barre) construire();
      try{ appris = (await opt.lire()) || {}; }catch(e){ appris = {}; }
      dessiner();
    },
    // Relire les sorts appris (autre élève, ou ouvertures de l'atelier arrivées du stockage).
    async recharger(o){
      if(o) opt = Object.assign(opt, o);
      try{ appris = (await opt.lire()) || {}; }catch(e){ appris = {}; }
      // un sort qui n'est plus connu disparaît aussi de l'écran
      SORTS.forEach(s => { if(!estAppris(s.id) && window.SortsOutils.visible(s.id)) window.SortsOutils.fermer(s.id); });
      dessiner();
    },
    appris: id => !!appris[id],
    utilisable: estAppris,
    async apprendre(id){
      if(appris[id]) return false;
      appris[id] = Date.now();
      try{ await opt.ecrire(appris); }catch(e){}
      dessiner();
      const b = barre && barre.querySelector('[data-sort="' + id + '"]');
      if(b){ b.classList.remove('nouveau'); void b.offsetWidth; b.classList.add('nouveau');
        const r = b.getBoundingClientRect(); window.SortsOutils.etincelles(r.left + r.width / 2, r.top + r.height / 2, '#fde68a'); }
      return true;
    },
    masquer(oui){ if(barre) barre.classList.toggle('cachee', !!oui); if(oui) window.SortsOutils.toutFermer(); },
    nom: id => (SORTS.find(s => s.id === id) || {}).nom || id
  };
})();
