/* =====================================================================
   RAPPORTEUR.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Le rapporteur d'angles transparent de la « Feuille blanche avec
   rapporteur », sans la feuille, le crayon ni l'efface. Il flotte
   par-dessus la page d'exercices :
     • glisser le rapporteur = le déplacer (le centre suit);
     • glisser la poignée bleue au-dessus = le faire tourner;
     • bouton « 📐 » en bas à droite = le montrer / le cacher / le recentrer.
   Graduations : chaque degré, les 5° et les 10° plus longs, et les deux
   échelles (0 → 180 à l'extérieur, 180 → 0 à l'intérieur), comme un
   vrai rapporteur d'école.

   Utilisation : <script src="rapporteur.js"></script> (ou ../rapporteur.js)
   Aucune dépendance. Ne touche à rien d'autre sur la page.
   ===================================================================== */
(function(){
  if(window.Rapporteur) return;
  const R = 172;                 // rayon en pixels (même taille que l'original)

  const css = `
  .rap-cadre{ position:fixed; z-index:9000; width:${2*R}px; height:${R}px; transform-origin:50% 100%; touch-action:none; user-select:none; -webkit-user-select:none; }
  .rap-corps{ position:absolute; inset:0; border-radius:${R}px ${R}px 0 0; cursor:grab;
    background:rgba(255,255,255,0.22); backdrop-filter:blur(0.6px) saturate(1.15); -webkit-backdrop-filter:blur(0.6px) saturate(1.15);
    border:1.2px solid rgba(0,0,0,0.22); border-bottom:1.8px solid rgba(0,0,0,0.38);
    box-shadow:0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.65); }
  .rap-corps:active{ cursor:grabbing; }
  .rap-corps svg{ position:absolute; left:0; top:0; overflow:visible; pointer-events:none; }
  .rap-tige{ position:absolute; left:50%; top:0; width:1.5px; height:38px; transform:translate(-50%,-100%);
    background:linear-gradient(180deg, rgba(37,99,235,0.55), rgba(37,99,235,0.12)); pointer-events:none; }
  .rap-poignee{ position:absolute; left:50%; top:0; width:40px; height:40px; transform:translate(-50%, calc(-50% - 38px));
    border-radius:50%; background:#2563eb; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.3); cursor:grab;
    display:flex; align-items:center; justify-content:center; color:#fff; font:700 18px/1 system-ui, sans-serif; }
  .rap-poignee:active{ cursor:grabbing; }
  .rap-lecture{ position:absolute; left:50%; top:100%; transform:translate(-50%, 12px); background:rgba(17,24,39,.82); color:#fff;
    font:700 12px/1 system-ui, sans-serif; padding:5px 8px; border-radius:999px; pointer-events:none; white-space:nowrap; }
  .rap-bouton{ position:fixed; right:16px; bottom:16px; z-index:9001; width:52px; height:52px; border-radius:50%; border:3px solid #fff;
    background:#2563eb; color:#fff; font-size:24px; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,.3); }
  .rap-bouton:hover{ background:#1d4ed8; }
  .rap-menu{ position:fixed; right:16px; bottom:76px; z-index:9001; display:none; flex-direction:column; gap:6px; }
  .rap-menu.ouvert{ display:flex; }
  .rap-menu button{ font:700 14px system-ui, sans-serif; padding:8px 12px; border-radius:10px; border:2px solid #2563eb; background:#fff; color:#1e3a8a; cursor:pointer; text-align:left; }
  `;

  function svgRapporteur(){
    let t = '';
    for(let d = 0; d <= 180; d++){
      const a = d * Math.PI / 180, c = Math.cos(a), s = -Math.sin(a);
      const dix = d % 10 === 0, cinq = d % 5 === 0;
      const long = dix ? 18 : cinq ? 11 : 6;
      t += '<line x1="' + (c*(R-long)).toFixed(2) + '" y1="' + (s*(R-long)).toFixed(2) + '" x2="' + (c*(R-0.5)).toFixed(2) + '" y2="' + (s*(R-0.5)).toFixed(2) +
        '" stroke="rgba(0,0,0,' + (dix ? .8 : cinq ? .55 : .35) + ')" stroke-width="' + (dix ? 1.1 : cinq ? .8 : .5) + '"/>';
      if(dix){
        const ext = R - 28, int = R - 46;
        const txt = (x, y, v, taille, op) => '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + taille +
          '" font-weight="700" fill="rgba(0,0,0,' + op + ')" style="font-family:Inter,system-ui,sans-serif;paint-order:stroke;stroke:rgba(255,255,255,.85);stroke-width:2.2px">' + v + '</text>';
        t += txt(c*ext, s*ext, d, 10.5, .85);                 // échelle extérieure : 0 à droite → 180 à gauche
        if(d > 0 && d < 180) t += txt(c*int, s*int, 180 - d, 8.5, .55);   // échelle intérieure : sens inverse
      }
    }
    // ligne de base, arcs, repère central
    t = '<line x1="' + (-R) + '" y1="0" x2="' + R + '" y2="0" stroke="rgba(0,0,0,.65)" stroke-width="1.8"/>' +
        '<path d="M ' + (-R) + ' 0 A ' + R + ' ' + R + ' 0 0 1 ' + R + ' 0" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>' +
        '<path d="M -98 0 A 98 98 0 0 1 98 0" fill="none" stroke="rgba(0,0,0,.10)" stroke-width=".8" stroke-dasharray="4 5"/>' + t +
        '<line x1="0" y1="0" x2="0" y2="-26" stroke="rgba(37,99,235,.5)" stroke-width="1.1" stroke-dasharray="3 4"/>' +
        '<line x1="-9" y1="0" x2="9" y2="0" stroke="rgba(0,0,0,.8)" stroke-width="1"/><line x1="0" y1="-9" x2="0" y2="9" stroke="rgba(0,0,0,.8)" stroke-width="1"/>' +
        '<circle cx="0" cy="0" r="4.6" fill="rgba(255,255,255,.92)" stroke="rgba(0,0,0,.2)" stroke-width=".7"/><circle cx="0" cy="0" r="2.4" fill="rgba(0,0,0,.85)"/>';
    return '<svg viewBox="' + (-R) + ' ' + (-R) + ' ' + (2*R) + ' ' + R + '" width="' + (2*R) + '" height="' + R + '">' + t + '</svg>';
  }

  function installer(){
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const cadre = document.createElement('div'); cadre.className = 'rap-cadre';
    cadre.innerHTML = '<div class="rap-corps">' + svgRapporteur() + '</div><div class="rap-tige"></div>' +
      '<div class="rap-poignee" title="Glisse pour faire tourner">⟳</div><div class="rap-lecture"></div>';
    document.body.appendChild(cadre);
    const bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'rap-bouton'; bouton.title = 'Rapporteur'; bouton.textContent = '📐';
    const menu = document.createElement('div'); menu.className = 'rap-menu';
    menu.innerHTML = '<button type="button" data-a="voir">👁️ Montrer / cacher</button><button type="button" data-a="centre">🎯 Ramener au centre</button><button type="button" data-a="droit">↔️ Remettre droit</button>' +
      '<button type="button" data-a="plus">➕ Plus grand</button><button type="button" data-a="moins">➖ Plus petit</button>';
    document.body.appendChild(menu); document.body.appendChild(bouton);

    // x, y = position du CENTRE du rapporteur à l'écran
    const etat = { x: window.innerWidth / 2, y: Math.min(window.innerHeight * 0.55, 380), rot: 0, visible: true, echelle: 1 };
    const lecture = cadre.querySelector('.rap-lecture');
    function dessiner(){
      cadre.style.display = etat.visible ? '' : 'none';
      cadre.style.left = etat.x + 'px'; cadre.style.top = etat.y + 'px';
      cadre.style.transform = 'translate(-50%, -100%) rotate(' + etat.rot + 'deg) scale(' + etat.echelle + ')';
      lecture.style.transform = 'translate(-50%, 12px) rotate(' + (-etat.rot) + 'deg)';
      lecture.textContent = 'Rotation ' + Math.round(((etat.rot % 360) + 360) % 360) + '°';
    }
    let glisse = null;
    function debut(e, mode){
      e.preventDefault(); e.stopPropagation();
      try{ e.currentTarget.setPointerCapture(e.pointerId); }catch(_){}
      glisse = { mode, x0: e.clientX, y0: e.clientY, depart: Object.assign({}, etat) };
    }
    cadre.querySelector('.rap-corps').addEventListener('pointerdown', e => debut(e, 'deplacer'));
    cadre.querySelector('.rap-poignee').addEventListener('pointerdown', e => debut(e, 'tourner'));
    window.addEventListener('pointermove', e => {
      if(!glisse) return;
      if(glisse.mode === 'deplacer'){
        etat.x = glisse.depart.x + e.clientX - glisse.x0;
        etat.y = glisse.depart.y + e.clientY - glisse.y0;
      } else {
        // la poignée est « en haut » (−90°) quand la rotation vaut 0
        etat.rot = Math.atan2(e.clientY - etat.y, e.clientX - etat.x) * 180 / Math.PI + 90;
      }
      dessiner();
    });
    const fin = () => { glisse = null; };
    window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);

    bouton.addEventListener('click', () => menu.classList.toggle('ouvert'));
    menu.addEventListener('click', e => {
      const a = e.target.closest('button') && e.target.closest('button').dataset.a;
      if(a === 'voir') etat.visible = !etat.visible;
      if(a === 'centre'){ etat.visible = true; etat.x = window.innerWidth / 2; etat.y = Math.min(window.innerHeight * 0.55, 380); }
      if(a === 'droit'){ etat.visible = true; etat.rot = 0; }
      if(a === 'plus') etat.echelle = Math.min(1.6, +(etat.echelle + 0.15).toFixed(2));
      if(a === 'moins') etat.echelle = Math.max(0.55, +(etat.echelle - 0.15).toFixed(2));
      if(a === 'plus' || a === 'moins') etat.visible = true;
      menu.classList.remove('ouvert');
      dessiner();
    });
    window.addEventListener('resize', () => {
      etat.x = Math.max(20, Math.min(window.innerWidth - 20, etat.x));
      etat.y = Math.max(40, Math.min(window.innerHeight, etat.y));
      dessiner();
    });
    dessiner();
    window.Rapporteur = { etat, dessiner };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer); else installer();
})();
