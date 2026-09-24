/* =====================================================================
   EN-LIGNE.JS — Échecs du Royaume : ce qui passe par la feuille Google
   ---------------------------------------------------------------------
   1. Progression contre l'IA de chaque élève : clé « echecs_<élève> »
      (niveau le plus haut vaincu) → suit l'élève d'un appareil à l'autre
      et alimente le classement « Contre l'IA ».
   2. Parties un contre un, chacun sur son appareil : clé « partie_<id> »
      dans l'onglet « Parties ». Chaque appareil relit la partie toutes
      les 2,5 s ; seul le joueur qui vient de jouer écrit.
   3. Horloge : 10 minutes par joueur. Le temps d'un joueur ne descend
      que pendant son tour, à partir du moment où le coup de l'adversaire
      est ARRIVÉ sur son écran (le délai de transmission n'est jamais
      compté contre lui). À 0, il perd. Si l'appareil de l'adversaire
      ne répond plus (onglet fermé), son horloge finit par tomber et la
      victoire va à l'autre joueur : une partie ne reste jamais bloquée.
   4. Classement « Un contre un » : une cote qui monte et descend selon la
      force de l'adversaire (comme aux vrais échecs), recalculée à partir
      de toutes les parties terminées.

   Sans identité d'élève ou sans adresse du script (atelier, fichier
   ouvert seul), rien de tout ça n'apparaît : le jeu reste celui d'avant.
   ===================================================================== */

window.EnLigne = (function(){

  const TEMPS_PAR_JOUEUR_MS = 10 * 60 * 1000;
  const SONDAGE_PARTIE_MS = 2500;
  const SONDAGE_SALON_MS = 4000;
  const MARGE_TEMPS_ADVERSAIRE_MS = 8000;      // avant de déclarer l'adversaire hors temps
  const PARTIE_OUVERTE_MAX_MS = 30 * 60 * 1000; // une partie en attente plus vieille est ignorée
  const COTE_DEPART = 1000, COTE_K = 32;

  const $ = id => document.getElementById(id);

  /* ------------------------- Identité et configuration ------------------------- */
  function trouverDansLesCadres(f){
    let w = window;
    for(let i = 0; i < 6 && w; i++){
      try{ const r = f(w); if(r) return r; }catch(e){ return null; }
      if(w === w.parent) break;
      w = w.parent;
    }
    return null;
  }
  const CFG = trouverDansLesCadres(w => {
    const c = w.CONFIG_CLASSE;
    return (c && c.URL_SCRIPT && c.URL_SCRIPT.indexOf('COLLE_ICI') === -1) ? c : null;
  });
  const MOI = trouverDansLesCadres(w => {
    const q = new URLSearchParams(w.location.search);
    const slug = (q.get('eleve') || '').trim();
    return slug ? { slug, nom: (q.get('nom') || slug).trim() } : null;
  });
  const actif = !!(CFG && MOI);

  /* ------------------------- Accès à la feuille Google ------------------------- */
  async function appel(url, options, delai){
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), delai || 30000);
    try{
      const r = await fetch(url, Object.assign({ cache:'no-store', signal:ctrl.signal }, options || {}));
      return await r.json();
    }finally{ clearTimeout(t); }
  }
  async function lire(cle){
    const d = await appel(CFG.URL_SCRIPT + '?cle=' + encodeURIComponent(cle) + '&t=' + Date.now());
    if(!d || d.error) throw new Error((d && d.error) || 'réponse illisible');
    return d.value ? JSON.parse(d.value) : null;
  }
  async function ecrire(cle, valeur){
    const d = await appel(CFG.URL_SCRIPT, {
      method:'POST', headers:{ 'Content-Type':'text/plain;charset=utf-8' },
      body: JSON.stringify({ cle, valeur: JSON.stringify(valeur), secret: CFG.SECRET_PARTAGE })
    });
    if(!d || !d.ok) throw new Error((d && d.error) || "écriture refusée");
  }
  async function lot(prefixes){
    const d = await appel(CFG.URL_SCRIPT + '?lot=' + encodeURIComponent(prefixes) + '&t=' + Date.now(), null, 45000);
    if(!d || !d.valeurs) throw new Error((d && d.error) || 'réponse illisible');
    return d.valeurs;
  }
  function signaler(message, details){
    if(window.GardeClasse) window.GardeClasse.signaler('échecs', message, details || {});
  }

  // Sceau : même calcul que PasserelleCore.calculerSceau — une fiche modifiée à la main est ignorée.
  function sceau(donnees){
    const texte = 'GRIMOIRE-MEQ-C6-2026' + JSON.stringify(donnees);
    let h = 0x811c9dc5;
    for(let i = 0; i < texte.length; i++){ h ^= texte.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16);
  }
  const esc = t => String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ------------------------- 1. Progression contre l'IA ------------------------- */
  let vaincuMax = 0;          // niveau le plus haut vaincu par cet élève (0 = aucun)
  const cleIA = () => 'echecs_' + MOI.slug;

  async function chargerProgressionIA(){
    try{
      const env = await lire(cleIA());
      if(env && env.donnees && sceau(env.donnees) === env.seal) vaincuMax = Math.max(0, Math.min(12, env.donnees.vaincuMax | 0));
    }catch(e){ /* feuille injoignable : la progression de l'appareil suffit pour l'instant */ }
    if(typeof buildLevelsGrid === 'function') buildLevelsGrid();
  }
  function niveauDebloque(){ return actif ? Math.min(12, vaincuMax + 1) : 1; }

  async function victoireIA(niveau){
    if(!actif || niveau <= vaincuMax) return;
    vaincuMax = niveau;
    const donnees = { nom: MOI.nom, vaincuMax: niveau, date: Date.now() };
    try{ await ecrire(cleIA(), { donnees, seal: sceau(donnees) }); }
    catch(e){ signaler("Victoire contre l'IA non enregistrée", { niveau, raison: String(e.message || e) }); }
  }

  /* ------------------------- 2. Salon et parties ------------------------- */
  let partie = null;            // dernière version connue de la partie jouée
  let maCouleur = null;         // 'w' ou 'b'
  let tourDepuis = 0;           // heure LOCALE où le tour courant a commencé sur cet appareil
  let minuterieSondage = null, minuterieSalon = null, minuterieHorloge = null;
  let ecritureEnCours = false, finAffichee = false;

  const nouvelId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clePartie = id => 'partie_' + id;
  const adversaireDe = p => (maCouleur === 'w' ? p.noir : p.blanc) || null;

  // Chaque boucle (salon, partie) porte un numéro de génération : une boucle d'une génération
  // précédente s'arrête d'elle-même au lieu de tourner en double.
  let generation = 0;
  function arreterSondages(){
    generation++;
    clearTimeout(minuterieSondage); clearTimeout(minuterieSalon); clearInterval(minuterieHorloge);
    minuterieSondage = minuterieSalon = minuterieHorloge = null;
  }

  async function lireParties(){
    const v = await lot('partie_');
    const liste = [];
    Object.keys(v).forEach(cle => { try{ const p = JSON.parse(v[cle]); if(p && p.id) liste.push(p); }catch(e){} });
    return liste;
  }

  function ouvrirSalon(){
    if(!actif) return;
    arreterSondages();
    mode = 'ligne';
    partie = null; finAffichee = false;
    showScreen('screen-salon');
    rafraichirSalon();
  }
  function quitterSalon(){
    arreterSondages();
    // Une partie que j'avais créée et que personne n'a rejointe est annulée.
    if(partieCreee && partieCreee.etat === 'attente'){
      const p = Object.assign({}, partieCreee, { etat:'annulee', maj: Date.now() });
      ecrire(clePartie(p.id), p).catch(() => {});
    }
    partieCreee = null;
    mode = 'pvp';
    showScreen('screen-home');
  }

  let partieCreee = null;
  async function rafraichirSalon(){
    clearTimeout(minuterieSalon);
    const gen = generation;
    let parties;
    try{ parties = await lireParties(); }
    catch(e){
      if(gen !== generation) return;
      $('salonListe').innerHTML = '<p class="salon-vide">Le salon ne répond pas. Nouvel essai dans quelques secondes…</p>';
      minuterieSalon = setTimeout(rafraichirSalon, SONDAGE_SALON_MS * 2);
      return;
    }
    if(gen !== generation || !$('screen-salon').classList.contains('active')) return;
    clearTimeout(minuterieSalon);
    const maintenant = Date.now();
    // Ma partie en cours (reprise après un rechargement) ou ma partie en attente.
    const miennes = parties.filter(p => (p.blanc && p.blanc.slug === MOI.slug) || (p.noir && p.noir.slug === MOI.slug));
    const enCours = miennes.find(p => p.etat === 'en_cours');
    if(enCours){ entrerDansPartie(enCours); return; }
    const attente = miennes.find(p => p.etat === 'attente' && maintenant - p.cree < PARTIE_OUVERTE_MAX_MS);
    partieCreee = attente || null;

    $('btnCreer').disabled = !!attente;
    $('salonMaPartie').innerHTML = attente
      ? '<div class="ma-partie"><span>Ta partie est ouverte. <b>En attente d\'un adversaire…</b></span>' +
        '<button class="bouton-sec" onclick="EnLigne.annulerPartie()">Annuler</button></div>'
      : '';

    const ouvertes = parties
      .filter(p => p.etat === 'attente' && p.blanc && p.blanc.slug !== MOI.slug && maintenant - p.cree < PARTIE_OUVERTE_MAX_MS)
      .sort((a, b) => a.cree - b.cree);
    $('salonListe').innerHTML = ouvertes.length
      ? ouvertes.map(p => '<div class="partie-ligne"><span><b>' + esc(p.blanc.nom) + '</b> t\'attend</span>' +
          '<button class="bouton-or" onclick="EnLigne.rejoindre(\'' + p.id + '\')">Rejoindre</button></div>').join('')
      : '<p class="salon-vide">Aucune partie ouverte pour l\'instant.</p>';
    minuterieSalon = setTimeout(rafraichirSalon, SONDAGE_SALON_MS);
  }

  async function creerPartie(){
    $('btnCreer').disabled = true;
    const p = { id: nouvelId(), cree: Date.now(), maj: Date.now(), version: 1, etat: 'attente',
                blanc: { slug: MOI.slug, nom: MOI.nom }, noir: null, coups: [],
                temps: { w: TEMPS_PAR_JOUEUR_MS, b: TEMPS_PAR_JOUEUR_MS }, resultat: null, raison: null };
    try{ await ecrire(clePartie(p.id), p); partieCreee = p; }
    catch(e){ $('salonAide').textContent = "La partie n'a pas pu être créée. Réessaie."; $('btnCreer').disabled = false; signaler('Création de partie impossible', { raison: String(e.message || e) }); return; }
    rafraichirSalon();
  }

  async function annulerPartie(){
    if(!partieCreee) return;
    const p = Object.assign({}, partieCreee, { etat:'annulee', maj: Date.now(), version: (partieCreee.version || 1) + 1 });
    try{ await ecrire(clePartie(p.id), p); }catch(e){}
    partieCreee = null;
    rafraichirSalon();
  }

  async function rejoindre(id){
    arreterSondages();
    let p;
    try{ p = await lire(clePartie(id)); }catch(e){ rafraichirSalon(); return; }
    if(!p || p.etat !== 'attente' || p.noir){ alert('Cette partie vient d\'être prise par quelqu\'un d\'autre.'); rafraichirSalon(); return; }
    // Si j'avais une partie en attente, elle est annulée : on ne joue qu'une partie à la fois.
    if(partieCreee) await annulerPartie();
    p.noir = { slug: MOI.slug, nom: MOI.nom };
    p.etat = 'en_cours'; p.debut = Date.now(); p.maj = Date.now(); p.version = (p.version || 1) + 1;
    try{ await ecrire(clePartie(id), p); }catch(e){ alert("Impossible de rejoindre la partie. Réessaie."); rafraichirSalon(); return; }
    // Deux élèves ont pu cliquer en même temps : on vérifie qui a vraiment la place.
    await new Promise(r => setTimeout(r, 1200));
    try{
      const verif = await lire(clePartie(id));
      if(!verif || !verif.noir || verif.noir.slug !== MOI.slug){ alert('Un autre élève a rejoint cette partie juste avant toi.'); rafraichirSalon(); return; }
      entrerDansPartie(verif);
    }catch(e){ entrerDansPartie(p); }
  }

  /* ------------------------- Pendant la partie ------------------------- */
  function rejouer(coups){
    game.reset();
    (coups || []).forEach(c => game.move(c));
  }

  function entrerDansPartie(p){
    arreterSondages();
    partieCreee = null;
    partie = p; finAffichee = false;
    maCouleur = (p.blanc && p.blanc.slug === MOI.slug) ? 'w' : 'b';
    mode = 'ligne'; aiLevel = null; flipBoard = maCouleur === 'b';
    selectedSquare = null; legalTargets = []; aiThinking = false;
    rejouer(p.coups);
    lastMoveTo = null; lastMoveAnimated = true;
    tourDepuis = Date.now();
    renderEnemyPortrait();
    renderBoard();
    const adv = adversaireDe(p);
    $('nomMoi').textContent = MOI.nom + (maCouleur === 'w' ? ' (Égypte)' : ' (Mésopotamie)');
    $('nomAdv').textContent = adv ? adv.nom + (maCouleur === 'w' ? ' (Mésopotamie)' : ' (Égypte)') : '…';
    ['horlogeMoi', 'horlogeAdv', 'btnAbandon'].forEach(id => { $(id).hidden = false; });
    showScreen('screen-game');
    afficherHorloges();
    minuterieHorloge = setInterval(tic, 250);
    sonderPartie();
    if(p.etat === 'finie') afficherFin(p);
  }

  function peutJouer(){
    return !!(partie && partie.etat === 'en_cours' && game.turn() === maCouleur && !ecritureEnCours && !finAffichee);
  }

  // Temps restant affiché : celui du joueur dont c'est le tour diminue depuis « tourDepuis ».
  function tempsRestant(couleur){
    if(!partie) return TEMPS_PAR_JOUEUR_MS;
    let t = partie.temps[couleur];
    if(partie.etat === 'en_cours' && game.turn() === couleur) t -= Date.now() - tourDepuis;
    return t;
  }
  function formater(ms){
    ms = Math.max(0, ms);
    const s = Math.ceil(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function afficherHorloges(){
    if(!partie) return;
    const adv = maCouleur === 'w' ? 'b' : 'w';
    const tMoi = tempsRestant(maCouleur), tAdv = tempsRestant(adv);
    $('tempsMoi').textContent = formater(tMoi);
    $('tempsAdv').textContent = formater(tAdv);
    const enCours = partie.etat === 'en_cours';
    $('horlogeMoi').classList.toggle('actif', enCours && game.turn() === maCouleur);
    $('horlogeAdv').classList.toggle('actif', enCours && game.turn() === adv);
    $('horlogeMoi').classList.toggle('bas', tMoi < 60000);
    $('horlogeAdv').classList.toggle('bas', tAdv < 60000);
    $('etatLigne').textContent = !enCours ? '' : (game.turn() === maCouleur ? 'À toi de jouer.' : 'Ton adversaire réfléchit…');
  }

  function tic(){
    if(!partie || partie.etat !== 'en_cours' || finAffichee) return;
    afficherHorloges();
    const adv = maCouleur === 'w' ? 'b' : 'w';
    if(game.turn() === maCouleur && tempsRestant(maCouleur) <= 0 && !ecritureEnCours){
      terminer(adv, 'temps');                                  // mon temps est écoulé : je perds
    }else if(game.turn() === adv && tempsRestant(adv) <= -MARGE_TEMPS_ADVERSAIRE_MS && !ecritureEnCours){
      reclamerTempsAdversaire();                               // l'adversaire ne joue plus
    }
  }

  async function reclamerTempsAdversaire(){
    ecritureEnCours = true;
    try{
      const frais = await lire(clePartie(partie.id));
      if(frais && frais.version === partie.version && frais.etat === 'en_cours'){
        await ecrireFin(frais, maCouleur, 'temps');
      }else if(frais){
        appliquerVersion(frais);
      }
    }catch(e){ /* on réessaiera au prochain tic */ }
    finally{ ecritureEnCours = false; }
  }

  async function sonderPartie(){
    clearTimeout(minuterieSondage);
    if(!partie || mode !== 'ligne') return;
    const gen = generation;
    try{
      const frais = await lire(clePartie(partie.id));
      if(gen !== generation) return;
      if(frais && frais.version > partie.version && !ecritureEnCours) appliquerVersion(frais);
    }catch(e){ if(gen !== generation) return; /* réseau passager : on garde l'écran et on réessaie */ }
    if(partie && partie.etat !== 'finie' && partie.etat !== 'annulee') minuterieSondage = setTimeout(sonderPartie, SONDAGE_PARTIE_MS);
  }

  function appliquerVersion(frais){
    const avant = partie ? partie.coups.length : 0;
    const tourAvant = game.turn();
    partie = frais;
    if(frais.coups.length !== avant){
      rejouer(frais.coups);
      const dernier = frais.coups[frais.coups.length - 1];
      lastMoveTo = dernier ? dernier.to : null; lastMoveAnimated = false;
      selectedSquare = null; legalTargets = [];
    }
    const adv = adversaireDe(partie);
    if(adv) $('nomAdv').textContent = adv.nom + (maCouleur === 'w' ? ' (Mésopotamie)' : ' (Égypte)');
    if(game.turn() !== tourAvant || frais.coups.length !== avant) tourDepuis = Date.now();   // mon tour commence MAINTENANT sur mon écran
    renderBoard();
    afficherHorloges();
    if(frais.etat === 'finie') afficherFin(frais);
  }

  // Appelé par le jeu juste après que j'ai déplacé une pièce.
  async function apresMonCoup(){
    const h = game.history({ verbose:true });
    const c = h[h.length - 1];
    const coup = { from: c.from, to: c.to };
    if(c.promotion) coup.promotion = c.promotion;
    const ecoule = Date.now() - tourDepuis;
    const p = JSON.parse(JSON.stringify(partie));
    p.coups.push(coup);
    p.temps[maCouleur] = Math.max(0, p.temps[maCouleur] - ecoule);
    p.maj = Date.now(); p.version = (p.version || 1) + 1;
    if(game.game_over()){
      p.etat = 'finie'; p.fin = Date.now();
      if(game.in_checkmate()){ p.resultat = maCouleur; p.raison = 'mat'; }
      else { p.resultat = 'nulle'; p.raison = game.in_stalemate() ? 'pat' : game.in_threefold_repetition() ? 'répétition' : game.insufficient_material() ? 'matériel' : '50 coups'; }
    }
    partie = p;
    tourDepuis = Date.now();          // le tour de l'adversaire commence (affichage seulement)
    afficherHorloges();
    ecritureEnCours = true;
    let essais = 0;
    while(true){
      try{ await ecrire(clePartie(p.id), p); break; }
      catch(e){
        essais++;
        $('etatLigne').textContent = 'Envoi du coup… (nouvel essai)';
        if(essais === 3) signaler("Coup d'échecs difficile à envoyer", { partie: p.id, raison: String(e.message || e) });
        await new Promise(r => setTimeout(r, Math.min(8000, 1000 * essais)));
      }
    }
    ecritureEnCours = false;
    afficherHorloges();
    if(p.etat === 'finie') afficherFin(p);
  }

  async function ecrireFin(base, gagnant, raison){
    const p = JSON.parse(JSON.stringify(base));
    const perdant = gagnant === 'w' ? 'b' : 'w';
    if(raison === 'temps') p.temps[perdant] = 0;
    p.etat = 'finie'; p.resultat = gagnant; p.raison = raison; p.fin = Date.now();
    p.maj = Date.now(); p.version = (p.version || 1) + 1;
    await ecrire(clePartie(p.id), p);
    partie = p;
    afficherHorloges();
    afficherFin(p);
  }
  async function terminer(gagnant, raison){
    if(!partie || partie.etat !== 'en_cours') return;
    ecritureEnCours = true;
    try{ await ecrireFin(partie, gagnant, raison); }
    catch(e){ signaler('Fin de partie non enregistrée', { partie: partie.id, raison: String(e.message || e) }); }
    finally{ ecritureEnCours = false; }
  }

  function abandonner(){
    if(!partie || partie.etat !== 'en_cours') return;
    if(!confirm('Abandonner la partie ? Ton adversaire gagnera.')) return;
    terminer(maCouleur === 'w' ? 'b' : 'w', 'abandon');
  }
  function quitterPartie(){
    if(partie && partie.etat === 'en_cours'){
      if(!confirm("Ta partie continue et ton horloge aussi. Quitter quand même ? (Tu peux la reprendre depuis le salon.)")) return;
    }
    arreterSondages();
    ['horlogeMoi', 'horlogeAdv', 'btnAbandon'].forEach(id => { $(id).hidden = true; });
    $('etatLigne').textContent = '';
    partie = null;
    ouvrirSalon();
  }

  function afficherFin(p){
    if(finAffichee) return;
    finAffichee = true;
    clearInterval(minuterieHorloge); minuterieHorloge = null;
    afficherHorloges();
    $('btnAbandon').hidden = true;
    const gagne = p.resultat === maCouleur, nulle = p.resultat === 'nulle';
    const titres = { mat:'Échec et mat !', temps:'Temps écoulé', abandon:'Abandon', pat:'Pat' };
    const titre = nulle ? 'Partie nulle' : (titres[p.raison] || 'Fin de partie');
    let texte = nulle ? 'Partie nulle (' + p.raison + ').'
      : gagne ? (p.raison === 'temps' ? "Le temps de ton adversaire est écoulé : tu gagnes !" : p.raison === 'abandon' ? 'Ton adversaire abandonne : tu gagnes !' : 'Tu gagnes la partie !')
      : (p.raison === 'temps' ? 'Ton temps est écoulé : tu perds la partie.' : p.raison === 'abandon' ? 'Tu as abandonné la partie.' : 'Tu perds la partie.');
    showModal(titre, texte + ' Le classement « Un contre un » est mis à jour.');
  }

  /* ------------------------- 3. Classements ------------------------- */
  // Cote des joueurs, recalculée à partir de toutes les parties terminées, dans l'ordre où elles ont fini.
  function calculerCotes(parties){
    const j = {};
    const joueur = x => (j[x.slug] = j[x.slug] || { slug:x.slug, nom:x.nom, cote:COTE_DEPART, v:0, n:0, d:0 });
    parties
      .filter(p => p.etat === 'finie' && p.blanc && p.noir && p.resultat && p.coups && p.coups.length >= 2)
      .sort((a, b) => (a.fin || a.maj) - (b.fin || b.maj))
      .forEach(p => {
        const A = joueur(p.blanc), B = joueur(p.noir);
        A.nom = p.blanc.nom; B.nom = p.noir.nom;
        const attendu = 1 / (1 + Math.pow(10, (B.cote - A.cote) / 400));
        const score = p.resultat === 'w' ? 1 : p.resultat === 'b' ? 0 : 0.5;
        A.cote += COTE_K * (score - attendu);
        B.cote += COTE_K * ((1 - score) - (1 - attendu));
        if(score === 1){ A.v++; B.d++; } else if(score === 0){ A.d++; B.v++; } else { A.n++; B.n++; }
      });
    return Object.values(j).map(x => Object.assign(x, { cote: Math.round(x.cote) }))
      .sort((a, b) => b.cote - a.cote || b.v - a.v);
  }
  function classementIA(valeurs){
    const liste = [];
    Object.keys(valeurs).forEach(cle => {
      if(cle.indexOf('echecs_') !== 0) return;
      try{
        const env = JSON.parse(valeurs[cle]);
        if(!env || !env.donnees || sceau(env.donnees) !== env.seal) return;
        const d = env.donnees;
        if(d.vaincuMax > 0) liste.push({ slug: cle.slice(7), nom: d.nom, niveau: d.vaincuMax, date: d.date || 0 });
      }catch(e){}
    });
    return liste.sort((a, b) => b.niveau - a.niveau || a.date - b.date);
  }

  let donneesClassement = null, ongletActuel = 'ia';
  async function ouvrirClassements(){
    showScreen('screen-classements');
    $('classementCorps').innerHTML = '<p>Chargement…</p>';
    try{
      const v = await lot('echecs_,partie_');
      const parties = [];
      Object.keys(v).forEach(cle => { if(cle.indexOf('partie_') === 0){ try{ parties.push(JSON.parse(v[cle])); }catch(e){} } });
      donneesClassement = { ia: classementIA(v), duel: calculerCotes(parties) };
    }catch(e){
      $('classementCorps').innerHTML = '<p>Les classements ne répondent pas pour l\'instant. Reviens dans un moment.</p>';
      return;
    }
    ongletClassement(ongletActuel);
  }
  function ongletClassement(quel){
    ongletActuel = quel;
    document.querySelectorAll('.onglet-cl').forEach(b => b.classList.toggle('actif', b.dataset.cl === quel));
    if(!donneesClassement) return;
    const medaille = r => r <= 3 ? ['🥇','🥈','🥉'][r - 1] : r;
    let html;
    if(quel === 'ia'){
      const l = donneesClassement.ia;
      html = l.length ? '<table class="table-cl"><thead><tr><th></th><th>Élève</th><th colspan="2">Plus loin dans le bestiaire</th></tr></thead><tbody>' +
        l.map((x, i) => {
          const b = BESTIARY[x.niveau - 1] || {};
          return '<tr' + (x.slug === MOI.slug ? ' class="moi"' : '') + '><td>' + medaille(i + 1) + '</td><td>' + esc(x.nom) + '</td>' +
            '<td class="mini"><img src="' + esc(b.img || '') + '" alt=""></td><td>' + x.niveau + '. ' + esc(b.name || '') + ' vaincu</td></tr>';
        }).join('') + '</tbody></table>'
        : '<p>Personne n\'a encore vaincu un adversaire du bestiaire.</p>';
    }else{
      const l = donneesClassement.duel;
      html = l.length ? '<table class="table-cl"><thead><tr><th></th><th>Élève</th><th class="n">Cote</th><th class="n">V</th><th class="n">N</th><th class="n">D</th></tr></thead><tbody>' +
        l.map((x, i) => '<tr' + (x.slug === MOI.slug ? ' class="moi"' : '') + '><td>' + medaille(i + 1) + '</td><td>' + esc(x.nom) + '</td>' +
          '<td class="n">' + x.cote + '</td><td class="n">' + x.v + '</td><td class="n">' + x.n + '</td><td class="n">' + x.d + '</td></tr>').join('') +
        '</tbody></table><p style="opacity:.7;font-size:.95rem">Tout le monde commence à 1000. Battre un joueur mieux classé rapporte plus que battre un joueur moins bien classé. V = victoires, N = nulles, D = défaites.</p>'
        : '<p>Aucune partie un contre un terminée pour l\'instant.</p>';
    }
    $('classementCorps').innerHTML = html;
  }

  /* ------------------------- Démarrage ------------------------- */
  if(actif){
    $('carteEnLigne').hidden = false;
    $('btnClassements').hidden = false;
    $('ligneJoueur').textContent = 'Joueur : ' + MOI.nom;
    chargerProgressionIA();
  }

  return { actif, peutJouer, apresMonCoup, niveauDebloque, victoireIA, ouvrirSalon, quitterSalon, creerPartie,
           annulerPartie, rejoindre, abandonner, quitterPartie, ouvrirClassements, ongletClassement,
           calculerCotes, classementIA, sceau };
})();
