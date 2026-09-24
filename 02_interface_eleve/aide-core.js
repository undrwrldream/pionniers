/* =====================================================================
   AIDE-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   La fenêtre du personnage de l'enseignant, quand un élève bute sur un
   numéro (décidé par rapports-core.js) :

   1re fenêtre (7 mauvaises réponses au même numéro) : trois choix
     1. « Je lève ma main pour demander de l'aide. »  → verrou (mot de passe)
     2. « Je vais y arriver par moi-même. »           → 2 autres chances
     3. « J'abandonne. »                              → refusé : l'écran vibre.
        5 clics rapides sur ce bouton : il disparaît.
   2e fenêtre (3e tentative manquée après le choix 2) : seulement le choix 1.

   Verrou : tout le logiciel est bloqué jusqu'à ce que l'enseignant tape
   son mot de passe. Le verrou survit à un rechargement de la page
   (retenu dans l'appareil).

   La fenêtre s'affiche TOUJOURS dans la page principale (la fiche de
   personnage) : elle couvre le Grimoire, les Parchemins et les documents.

   Le mot de passe n'est pas écrit en clair ici : seulement son empreinte.
   Pour le changer : dans la console du navigateur, Aide.empreinte('nouveau')
   donne la nouvelle empreinte à coller dans EMPREINTE_MOT_DE_PASSE.
   ===================================================================== */
(function(){
  if(window.Aide) return;

  const EMPREINTE_MOT_DE_PASSE = 'h4_bd16ecde';     // « patate »
  const IMAGE_PERSONNAGE = 'livre_assets/personnage_enseignant.png';
  const CLE_VERROU = 'verrou_aide';
  const CLICS_RAPIDES = 5, FENETRE_CLICS_MS = 2500;

  function empreinte(texte){
    // Petite empreinte (FNV-1a) : cache le mot de passe aux curieux, sans prétendre être un coffre-fort.
    let h = 0x811c9dc5;
    const t = String(texte || '').trim().toLowerCase();
    for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'h4_' + h.toString(16);
  }

  // La page principale (même site) affiche la fenêtre; sinon, la page elle-même.
  function pagePrincipale(){
    try{ if(window.top !== window && window.top.Aide && window.top.document) return window.top; }catch(e){}
    return window;
  }

  function lireVerrou(){ try{ return JSON.parse(localStorage.getItem(CLE_VERROU)); }catch(e){ return null; } }
  function ecrireVerrou(v){ try{ v ? localStorage.setItem(CLE_VERROU, JSON.stringify(v)) : localStorage.removeItem(CLE_VERROU); }catch(e){} }

  const CSS = `
  #aideVoile{ position:fixed; inset:0; z-index:2147483000; background:rgba(8,4,2,.82); display:flex; align-items:center; justify-content:center;
    font-family:'EB Garamond','Crimson Text',Georgia,serif; backdrop-filter:blur(3px); }
  #aideVoile .aide-boite{ width:min(92vw,660px); background:linear-gradient(#f6ecd2,#ead9b0); color:#3a2410; border:3px solid #b8872f;
    border-radius:14px; box-shadow:0 20px 60px rgba(0,0,0,.6); padding:22px 24px 20px; display:flex; gap:20px; align-items:flex-start; }
  #aideVoile .aide-portrait{ flex:0 0 170px; height:220px; border-radius:10px; border:2px solid #b8872f;
    background:radial-gradient(ellipse at 50% 60%, #5a2a14 0%, #2a170b 75%); padding:8px; box-sizing:border-box;
    display:flex; align-items:center; justify-content:center; font-size:64px; overflow:hidden; }
  #aideVoile .aide-portrait img{ width:100%; height:100%; object-fit:contain; image-rendering:pixelated; filter:drop-shadow(0 4px 6px rgba(0,0,0,.6)); }
  #aideVoile .aide-texte{ flex:1; display:flex; flex-direction:column; gap:12px; }
  #aideVoile h2{ margin:0; font-family:'Cinzel','Cinzel Decorative',serif; font-size:22px; color:#6b1f14; }
  #aideVoile p{ margin:0; font-size:19px; line-height:1.35; }
  #aideVoile .aide-choix{ display:flex; flex-direction:column; gap:9px; margin-top:4px; }
  #aideVoile button{ font:inherit; font-size:19px; text-align:left; padding:11px 14px; border-radius:9px; cursor:pointer;
    border:2px solid #b8872f; background:#fffaf0; color:#3a2410; }
  #aideVoile button:hover{ background:#fff3d6; }
  #aideVoile button.aide-main{ background:#7a1f16; color:#fff4dc; border-color:#e0b54e; }
  #aideVoile button.aide-main:hover{ background:#8f2a1f; }
  #aideVoile input{ font:inherit; font-size:20px; padding:9px 12px; border-radius:8px; border:2px solid #b8872f; width:100%; box-sizing:border-box; }
  #aideVoile .aide-rangee{ display:flex; gap:8px; }
  #aideVoile .aide-rangee button{ text-align:center; flex:0 0 auto; }
  #aideVoile .aide-mini{ font-size:15px; opacity:.75; }
  @keyframes aideVibre{ 0%,100%{transform:translate(0,0)} 15%{transform:translate(-14px,3px)} 30%{transform:translate(12px,-4px)}
    45%{transform:translate(-10px,2px)} 60%{transform:translate(8px,-2px)} 75%{transform:translate(-5px,1px)} 90%{transform:translate(3px,0)} }
  .aide-vibre{ animation:aideVibre .45s ease both; }
  @media (max-width:560px){ #aideVoile .aide-boite{ flex-direction:column; align-items:center; } }
  `;

  let etat = null;   // { mode:'choix'|'main'|'verrou', rappel, contexte }

  function installerStyle(doc){
    if(doc.getElementById('aideStyle')) return;
    const st = doc.createElement('style'); st.id = 'aideStyle'; st.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(st);
  }

  function vibrer(doc){
    const cible = doc.documentElement;
    cible.classList.remove('aide-vibre'); void cible.offsetWidth; cible.classList.add('aide-vibre');
    setTimeout(() => cible.classList.remove('aide-vibre'), 500);
  }

  function portrait(doc){
    const div = doc.createElement('div'); div.className = 'aide-portrait';
    const img = doc.createElement('img'); img.alt = '';
    img.onload = () => {};
    img.onerror = () => { div.textContent = '🧙'; };
    img.src = IMAGE_PERSONNAGE;
    div.appendChild(img);
    return div;
  }

  function fermer(doc){
    const v = doc.getElementById('aideVoile'); if(v) v.remove();
    etat = null;
  }

  function dessiner(doc){
    installerStyle(doc);
    let v = doc.getElementById('aideVoile');
    if(!v){
      v = doc.createElement('div'); v.id = 'aideVoile'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
      // Le voile avale tout : clics, touches (sauf dans la fenêtre elle-même).
      ['pointerdown','click','keydown','wheel','touchstart'].forEach(ev => v.addEventListener(ev, e => { e.stopPropagation(); }));   // phase de bouillonnement : les boutons de la fenêtre reçoivent d'abord leur clic
      doc.body.appendChild(v);
    }
    v.innerHTML = '';
    const boite = doc.createElement('div'); boite.className = 'aide-boite';
    boite.appendChild(portrait(doc));
    const txt = doc.createElement('div'); txt.className = 'aide-texte';
    boite.appendChild(txt);
    v.appendChild(boite);
    const c = etat.contexte || {};
    const ou = c.titre ? ' (« ' + c.titre + ' », numéro ' + c.numero + ')' : '';

    if(etat.mode === 'choix'){
      txt.innerHTML = '<h2>Halte, jeune mage !</h2>' +
        '<p>' + (etat.rappel
          ? 'Tu as encore manqué ce numéro' + ou + '. Tu as fait de ton mieux. Maintenant, on le règle ensemble.'
          : 'Je vois que ce numéro te donne du fil à retordre' + ou + '. Que veux-tu faire ?') + '</p>';
      const choix = doc.createElement('div'); choix.className = 'aide-choix'; txt.appendChild(choix);
      const b1 = doc.createElement('button'); b1.className = 'aide-main'; b1.type = 'button';
      b1.textContent = '✋ 1. Je lève ma main pour demander de l\'aide.';
      b1.addEventListener('click', () => { verrouiller(); });
      choix.appendChild(b1);
      if(!etat.rappel){
        const b2 = doc.createElement('button'); b2.type = 'button';
        b2.textContent = '💪 2. Je vais y arriver par moi-même.';
        b2.addEventListener('click', () => { const f = etat.surChoix; fermer(doc); if(f) f(2); });
        choix.appendChild(b2);
        const b3 = doc.createElement('button'); b3.type = 'button';
        b3.textContent = '🏳️ 3. J\'abandonne.';
        const clics = [];
        b3.addEventListener('click', () => {
          vibrer(doc);
          const t = Date.now(); clics.push(t);
          while(clics.length && t - clics[0] > FENETRE_CLICS_MS) clics.shift();
          if(clics.length >= CLICS_RAPIDES) b3.remove();
        });
        choix.appendChild(b3);
      }
      setTimeout(() => b1.focus(), 50);
    } else {   // verrou : on attend l'enseignant
      txt.innerHTML = '<h2>✋ Main levée</h2>' +
        '<p>Garde ta main levée : ton enseignant arrive pour t\'aider' + (c.titre ? ' avec « ' + c.titre + ' », numéro ' + c.numero : '') + '.</p>' +
        '<p class="aide-mini">Le logiciel est en pause jusqu\'à ce que ton enseignant le débloque.</p>';
      const rangee = doc.createElement('div'); rangee.className = 'aide-rangee';
      const champ = doc.createElement('input'); champ.type = 'password'; champ.placeholder = 'Mot de passe de l\'enseignant';
      champ.autocomplete = 'off'; champ.setAttribute('aria-label', 'Mot de passe de l\'enseignant');
      const ok = doc.createElement('button'); ok.type = 'button'; ok.className = 'aide-main'; ok.textContent = 'Débloquer';
      const essayer = () => {
        if(empreinte(champ.value) === EMPREINTE_MOT_DE_PASSE){ deverrouiller(doc); }
        else { champ.value = ''; vibrer(doc); champ.focus(); }
      };
      ok.addEventListener('click', essayer);
      champ.addEventListener('keydown', e => { if(e.key === 'Enter') essayer(); });
      rangee.appendChild(champ); rangee.appendChild(ok);
      txt.appendChild(rangee);
      setTimeout(() => champ.focus(), 50);
    }
  }

  function verrouiller(){
    const doc = document;   // on est déjà dans la page principale
    const c = (etat && etat.contexte) || {};
    etat = { mode:'verrou', contexte:c };
    ecrireVerrou({ slug:c.slug || '', titre:c.titre || '', numero:c.numero || '', exoId:c.exoId || '', depuis:Date.now() });
    if(c.surMain) try{ c.surMain(); }catch(e){}
    dessiner(doc);
  }

  function deverrouiller(doc){
    ecrireVerrou(null);
    fermer(doc);
  }

  /**
   * demander(contexte, { rappel, surChoix(2), surMain() })
   * contexte : { slug, exoId, titre, numero }
   * Appelé depuis n'importe quelle page du logiciel; la fenêtre s'ouvre dans la page principale.
   */
  function demander(contexte, options){
    const top = pagePrincipale();
    if(top !== window) return top.Aide.demander(contexte, options);
    options = options || {};
    etat = { mode: 'choix', rappel: !!options.rappel, contexte: Object.assign({}, contexte, { surMain: options.surMain }),
             surChoix: options.surChoix };
    if(options.rappel){ verrouillerRappel(); return; }
    dessiner(document);
  }
  // 2e fenêtre : seulement le choix 1, et le verrou est posé tout de suite (recharger la page n'y échappe pas).
  function verrouillerRappel(){
    const c = etat.contexte;
    ecrireVerrou({ slug:c.slug || '', titre:c.titre || '', numero:c.numero || '', exoId:c.exoId || '', depuis:Date.now(), rappel:true });
    dessiner(document);
  }

  // Au chargement : un verrou en cours (page rechargée, logiciel rouvert) se réaffiche.
  function reprendre(){
    if(window.top !== window){ try{ if(window.top.Aide) return; }catch(e){} }
    const v = lireVerrou();
    if(!v) return;
    etat = { mode: v.rappel ? 'choix' : 'verrou', rappel: !!v.rappel, contexte: v };
    dessiner(document);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reprendre); else reprendre();

  window.Aide = { demander, empreinte, verrouActif: () => !!lireVerrou() };
})();
