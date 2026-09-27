/* =====================================================================
   ENTRAINEMENTS/COMMUN.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Le moteur commun des entraînements de sorts (horloge, règle,
   rapporteur, calculatrice). Chaque page décrit ses défis; ce fichier
   s'occupe de l'affichage, de la vérification et des messages au Grimoire :
     { source:'grimoire-doc', type:'progress', vus, total }  à chaque défi réussi
     { source:'grimoire-doc', type:'tentative', numero, correcte }
     { source:'grimoire-doc', type:'termine' }                quand tout est réussi

   Entrainement.demarrer({
     titre, sousTitre, icone,
     intro: html,                       // la leçon (toujours visible en haut)
     lancer: { texte, action },         // bouton « lancer le sort » dans l'intro (facultatif)
     defis: [ {
       titre, html,                     // énoncé (html) — peut contenir un dessin
       reponse: nombre | [nombres],     // réponse tapée dans la case (sinon : verifier)
       unite: 'cm' | '°' | '$'…,        // affichée à côté de la case
       tolerance: nombre,               // écart accepté (ex. 2° pour un angle)
       verifier: () => bool,            // défi sans case : vérifié par la page (ex. l'horloge)
       auto: bool,                      // avec verifier : se valide tout seul (Entrainement.reverifier())
       aide: 'texte si c'est raté'
     } ]
   })
   ===================================================================== */
(function(){
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap');
    *{ box-sizing:border-box; }
    html, body{ background:transparent; }
    body{ margin:0; font-family:'Nunito', system-ui, sans-serif; color:#243b2c; }
    main{ max-width:600px; margin:0; padding:16px 16px 90px 22px; display:flex; flex-direction:column; gap:12px; }
    .e-entete{ background:linear-gradient(90deg, rgba(220,243,228,.92), rgba(240,250,243,.86)); border:1.5px solid #6fb487; border-radius:16px; padding:12px 16px; }
    .e-entete h1{ margin:0; font-size:21px; font-weight:800; color:#17462a; display:flex; align-items:center; gap:10px; }
    .e-entete p{ margin:3px 0 0; font-size:14px; color:#3f6b4e; }
    .e-barre{ height:8px; border-radius:99px; background:rgba(23,70,42,.12); overflow:hidden; margin-top:9px; }
    .e-barre i{ display:block; height:100%; width:0; background:linear-gradient(90deg,#86efac,#15803d); transition:width .35s; }
    .e-score{ font-size:13px; font-weight:800; color:#17462a; margin-top:5px; }
    .e-carte{ background:rgba(255,252,242,.92); border:1px solid #d9c49a; border-radius:16px; padding:14px 18px; }
    .e-carte h2{ margin:0 0 6px; font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px; color:#3b2a1a; }
    .e-carte h2 .rond{ width:30px; height:30px; border-radius:50%; background:#1f6b3f; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:15px; flex:none; }
    .e-carte p{ margin:6px 0; font-size:16px; line-height:1.5; color:#3b2a1a; }
    .e-carte ul{ margin:6px 0; padding-left:22px; font-size:15.5px; line-height:1.5; color:#3b2a1a; }
    .e-lancer{ margin-top:8px; font:800 16px 'Nunito', sans-serif; padding:10px 18px; border-radius:999px; border:2px solid #c9a227; cursor:pointer;
      background:radial-gradient(circle at 50% 30%, #6d3fc0, #2e1065); color:#fff7d6; box-shadow:0 0 14px rgba(168,85,247,.5); }
    .e-lancer:hover{ filter:brightness(1.15); }
    .e-defi.verrou{ display:none; }
    .e-defi.fait{ background:rgba(236,252,241,.92); border-color:#86c79d; }
    .e-defi.fait h2 .rond{ background:#c9a227; color:#2b1d0e; }
    .e-ligne{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .e-ligne input{ width:110px; font:800 20px 'Nunito', sans-serif; padding:6px 10px; border-radius:10px; border:2px solid #d9c49a; background:#fff; color:#3b2a1a; text-align:center; }
    .e-ligne input:focus{ outline:none; border-color:#1f6b3f; }
    .e-ligne .unite{ font-weight:800; font-size:18px; }
    .e-verif{ font:800 15px 'Nunito', sans-serif; padding:8px 16px; border-radius:10px; border:0; background:#1f6b3f; color:#fff; cursor:pointer; }
    .e-verif:hover{ background:#17532f; }
    .e-msg{ font-weight:800; font-size:15px; min-height:20px; margin-top:6px; }
    .e-msg.bon{ color:#15803d; } .e-msg.faux{ color:#b91c1c; }
    .e-attente{ font-size:14px; font-style:italic; color:#6b5a3e; margin-top:6px; }
    .e-fin{ text-align:center; background:radial-gradient(circle at 50% 0%, rgba(253,230,138,.95), rgba(255,250,236,.92) 70%); border:2px solid #c9a227; }
    .e-fin .gros{ font-size:44px; }
    .e-fin h2{ justify-content:center; font-size:22px; }
    @keyframes e-secoue{ 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
    .e-secoue{ animation:e-secoue .35s ease; }
  `;
  const st = document.createElement('style'); st.id = 'grimoire-parchemin'; st.textContent = css; document.head.appendChild(st);

  function parent(msg){ try{ window.parent.postMessage(Object.assign({ source:'grimoire-doc' }, msg), '*'); }catch(e){} }
  const lireNombre = t => { const v = parseFloat(String(t).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(v) ? null : v; };

  let cfg = null, faits = 0, courant = 0, cartes = [];

  function demarrer(c){
    cfg = c;
    const main = document.createElement('main');
    main.innerHTML =
      '<div class="e-entete"><h1><span>' + (c.icone || '✨') + '</span>' + c.titre + '</h1><p>' + (c.sousTitre || '') + '</p>' +
      '<div class="e-barre"><i></i></div><div class="e-score"></div></div>' +
      '<div class="e-carte e-intro">' + c.intro + (c.lancer ? '<button type="button" class="e-lancer">' + c.lancer.texte + '</button>' : '') + '</div>';
    c.defis.forEach((d, i) => {
      const carte = document.createElement('div');
      carte.className = 'e-carte e-defi' + (i > 0 ? ' verrou' : '');
      carte.innerHTML = '<h2><span class="rond">' + (i + 1) + '</span>' + d.titre + '</h2>' + (d.html || '') +
        (d.verifier && d.reponse === undefined
          ? (d.auto ? '<div class="e-attente">✨ Le défi se réussit tout seul dès que c\'est bien placé.</div>' : '<div class="e-ligne"><button type="button" class="e-verif">Vérifier</button></div>')
          : '<div class="e-ligne"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Ta réponse"><span class="unite">' + (d.unite || '') + '</span>' +
            '<button type="button" class="e-verif">Vérifier</button></div>') +
        '<div class="e-msg"></div>';
      main.appendChild(carte);
      cartes.push(carte);
      const b = carte.querySelector('.e-verif');
      if(b) b.addEventListener('click', () => verifier(i, true));
      const inp = carte.querySelector('input');
      if(inp) inp.addEventListener('keydown', e => { if(e.key === 'Enter') verifier(i, true); });
    });
    const fin = document.createElement('div');
    fin.className = 'e-carte e-fin'; fin.style.display = 'none';
    fin.innerHTML = '<div class="gros">✨</div><h2>Sort appris !</h2><p>' + (c.fin || 'Bravo ! Ce sort est maintenant dans ta barre de sorts, en bas du Grimoire.') + '</p>';
    main.appendChild(fin);
    document.body.appendChild(main);
    if(c.lancer) main.querySelector('.e-lancer').addEventListener('click', c.lancer.action);
    majEntete();
    parent({ type:'progress', vus:0, total:c.defis.length });
  }

  function majEntete(){
    const t = cfg.defis.length;
    document.querySelector('.e-barre i').style.width = (100 * faits / t) + '%';
    document.querySelector('.e-score').textContent = faits + ' / ' + t + ' défis réussis';
  }

  function verifier(i, clic){
    if(i !== courant || !cfg) return false;
    const d = cfg.defis[i], carte = cartes[i], msg = carte.querySelector('.e-msg');
    let ok;
    if(d.reponse !== undefined){
      const v = lireNombre(carte.querySelector('input').value);
      if(v === null){ if(clic){ msg.className = 'e-msg faux'; msg.textContent = 'Écris un nombre dans la case.'; } return false; }
      const bonnes = Array.isArray(d.reponse) ? d.reponse : [d.reponse];
      ok = bonnes.some(r => Math.abs(v - r) <= (d.tolerance || 0) + 1e-9);
    } else {
      ok = !!d.verifier();
      if(!ok && !clic) return false;   // vérification automatique : on attend sans rien dire
    }
    parent({ type:'tentative', numero:String(i + 1), correcte:ok });
    if(!ok){
      msg.className = 'e-msg faux'; msg.textContent = '✗ Pas encore. ' + (d.aide || 'Réessaie !');
      carte.classList.remove('e-secoue'); void carte.offsetWidth; carte.classList.add('e-secoue');
      return false;
    }
    msg.className = 'e-msg bon'; msg.textContent = '✓ ' + (d.bravo || 'Bravo !');
    carte.classList.add('fait');
    const inp = carte.querySelector('input'); if(inp) inp.disabled = true;
    const b = carte.querySelector('.e-verif'); if(b) b.remove();
    const att = carte.querySelector('.e-attente'); if(att) att.remove();
    faits++; courant++;
    majEntete();
    parent({ type:'progress', vus:faits, total:cfg.defis.length });
    if(courant < cartes.length){
      cartes[courant].classList.remove('verrou');
      setTimeout(() => { cartes[courant].scrollIntoView({ behavior:'smooth', block:'center' }); const n = cartes[courant].querySelector('input'); if(n) n.focus({ preventScroll:true }); if(cfg.defis[courant].surApparition) cfg.defis[courant].surApparition(); }, 350);
    } else {
      const fin = document.querySelector('.e-fin'); fin.style.display = '';
      setTimeout(() => fin.scrollIntoView({ behavior:'smooth', block:'center' }), 350);
      parent({ type:'termine' });
    }
    return true;
  }

  window.Entrainement = {
    demarrer,
    // Pour les défis « auto » : la page appelle ceci quand l'outil bouge.
    reverifier(){ if(cfg && courant < cfg.defis.length && cfg.defis[courant].auto) verifier(courant, false); },
    courant: () => courant
  };
})();
