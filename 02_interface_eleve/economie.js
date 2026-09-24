/* =====================================================================
   ECONOMIE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Les chiffres du jeu, en un seul endroit, pour l'arène et la console
   enseignant :
     • l'équipement de la boutique (prix, PV, dégâts) — COPIE des chiffres
       du CATALOG de interface_eleve.html (la fiche de personnage).
       ⚠️ Si tu changes un prix ou une statistique dans la fiche, change-le
       ici aussi. outils/construire_production.py compare les deux et
       refuse de construire la version de classe s'ils ne concordent pas.
     • les rangs de mage et leurs multiplicateurs ;
     • la force d'un élève (même calcul que computeStats() de la fiche) ;
     • l'or gagné au total par un élève ;
     • la force des monstres selon l'or gagné par le groupe.
   Aucune donnée d'élève ici : seulement des règles.
   ===================================================================== */

window.Economie = (function(){

  const BASE_PV = 10;                                   // PV de départ, avant équipement
  const RANGS = ['Apprenti', 'Novice', 'Invocateur', 'Magicien', 'Sorcier', 'Archimage'];
  const MULT_RANG = [1, 2, 4, 8, 12, 20];               // × sur les PV et les dégâts

  // palier : 1 = cuir / premier achat, 2 = acier / milieu, 3 = royal / haut de gamme
  const EMPLACEMENTS = [
    { id:'helmet', nom:"Casque", objets:[
      { id:'h_straw', nom:"Casque de paille", prix:30, pv:4 },
      { id:'h_leather', nom:"Casque de cuir", prix:60, pv:8, palier:1 },
      { id:'h_chainmail', nom:"Coiffe de mailles", prix:96, pv:13 },
      { id:'h_jester', nom:"Heaume du bouffon", prix:114, pv:15 },
      { id:'h_steel', nom:"Heaume d'acier", prix:135, pv:18, palier:2 },
      { id:'h_pigface', nom:"Groin d'acier", prix:165, pv:22 },
      { id:'h_voodoo', nom:"Masque tribal", prix:195, pv:26 },
      { id:'h_obsidian', nom:"Heaume d'obsidienne", prix:240, pv:31 },
      { id:'h_wizard', nom:"Chapeau d'astromancien", prix:300, pv:35 },
      { id:'h_royal', nom:"Heaume royal", prix:360, pv:40, palier:3 } ]},
    { id:'armor', nom:"Armure", objets:[
      { id:'a_leather', nom:"Plastron de cuir", prix:75, pv:15, palier:1 },
      { id:'a_chainmail', nom:"Cotte de mailles", prix:120, pv:20 },
      { id:'a_steel', nom:"Armure d'acier", prix:180, pv:25, palier:2 },
      { id:'a_barbarian', nom:"Armure barbare", prix:216, pv:35 },
      { id:'a_templar', nom:"Armure templière", prix:255, pv:45 },
      { id:'a_elven', nom:"Armure elfique", prix:294, pv:55 },
      { id:'a_dragon', nom:"Armure d'écailles", prix:336, pv:68 },
      { id:'a_obsidian', nom:"Armure d'obsidienne", prix:375, pv:78 },
      { id:'a_mage', nom:"Armure runique", prix:414, pv:88 },
      { id:'a_royal', nom:"Armure royale", prix:450, pv:100, palier:3 } ]},
    { id:'gloves', nom:"Gants", objets:[
      { id:'g_leather', nom:"Gants de cuir", prix:45, degatsBonus:2, palier:1 },
      { id:'g_chainmail', nom:"Gants de mailles", prix:75, degatsBonus:3 },
      { id:'g_steel', nom:"Gants d'acier", prix:105, degatsBonus:4, palier:2 },
      { id:'g_barbarian', nom:"Gants barbares", prix:126, degatsBonus:5 },
      { id:'g_templar', nom:"Gants templiers", prix:150, degatsBonus:5 },
      { id:'g_elven', nom:"Gants elfiques", prix:174, degatsBonus:6 },
      { id:'g_dragon', nom:"Gants d'écailles", prix:198, degatsBonus:6 },
      { id:'g_obsidian', nom:"Gants d'obsidienne", prix:222, degatsBonus:7 },
      { id:'g_mage', nom:"Gants runiques", prix:246, degatsBonus:7 },
      { id:'g_royal', nom:"Gants royaux", prix:270, degatsBonus:8, palier:3 } ]},
    { id:'boots', nom:"Bottes", objets:[
      { id:'b_leather', nom:"Bottes de cuir", prix:45, pv:15, palier:1 },
      { id:'b_chainmail', nom:"Bottes de mailles", prix:84, pv:20 },
      { id:'b_steel', nom:"Bottes d'acier", prix:120, pv:25, palier:2 },
      { id:'b_barbarian', nom:"Bottes barbares", prix:144, pv:30 },
      { id:'b_templar', nom:"Bottes templières", prix:168, pv:35 },
      { id:'b_elven', nom:"Bottes elfiques", prix:192, pv:40 },
      { id:'b_dragon', nom:"Bottes d'écailles", prix:219, pv:45 },
      { id:'b_obsidian', nom:"Bottes d'obsidienne", prix:246, pv:50 },
      { id:'b_mage', nom:"Bottes runiques", prix:273, pv:55 },
      { id:'b_royal', nom:"Bottes royales", prix:300, pv:60, palier:3 } ]},
    { id:'weapon', nom:"Arme", objets:[
      { id:'w_dague', nom:"Dague", prix:54, degats:8, palier:1 },
      { id:'w_2mains', nom:"Épée à deux mains", prix:81, degats:12 },
      { id:'w_hallebarde', nom:"Hallebarde", prix:84, degats:10 },
      { id:'w_courte', nom:"Épée courte", prix:105, degats:15 },
      { id:'w_epee', nom:"Épée longue", prix:150, degats:20, palier:2 },
      { id:'w_lance', nom:"Lance", prix:150, degats:24 },
      { id:'w_sabre', nom:"Sabre", prix:156, degats:22, palier:3 },
      { id:'w_fleau', nom:"Fléau d'armes", prix:174, degats:20 },
      { id:'w_hache', nom:"Hache de bataille", prix:219, degats:30 },
      { id:'w_marteau', nom:"Marteau de guerre", prix:234, degats:26 } ]},
    { id:'shield', nom:"Bouclier", objets:[
      { id:'s_rond', nom:"Bouclier rond", prix:75, pv:25, palier:1 },
      { id:'s_acier', nom:"Écu d'acier", prix:138, pv:45, palier:2 },
      { id:'s_templier', nom:"Bouclier templier", prix:192, pv:65 },
      { id:'s_ecailles', nom:"Bouclier d'écailles", prix:264, pv:90 },
      { id:'s_royal', nom:"Bouclier royal", prix:345, pv:120, palier:3 } ]}
  ];
  const PALIERS = ['Sans équipement', 'Tout en cuir (palier 1)', 'Tout en acier (palier 2)', 'Tout royal (palier 3)'];

  // Images de l'arène pour les badges d'arme et de bouclier (dossier 03_ecran_arene/arena_assets/).
  const IMAGES_ARENE = {
    w_dague:'weapon1_dagger', w_epee:'weapon2_longsword', w_courte:'weapon3_shortsword', w_hache:'weapon4_axe', w_sabre:'weapon5_saber',
    w_lance:'weapon6_lance', w_marteau:'weapon7_warhammer', w_hallebarde:'weapon8_halberd', w_fleau:'weapon9_flail', w_2mains:'weapon10_2hsword',
    s_rond:'shield2_round', s_acier:'shield3_heater', s_templier:'shield1_kite', s_ecailles:'shield4_dragon', s_royal:'shield5_royal'
  };

  const PAR_ID = {};
  EMPLACEMENTS.forEach(e => e.objets.forEach(o => { PAR_ID[o.id] = Object.assign({ emplacement:e.id }, o); }));

  function objet(id){ return PAR_ID[id] || null; }

  // Force d'un élève : même calcul que computeStats() de la fiche de personnage.
  //   PV = (10 + PV de l'équipement porté) × multiplicateur du rang
  //   Dégâts = (arme + bonus des gants) × multiplicateur du rang
  function force(equipe, rangIndex){
    let pv = BASE_PV, degats = 0;
    Object.keys(equipe || {}).forEach(emp => {
      const o = objet(equipe[emp]);
      if(!o) return;
      pv += o.pv || 0;
      degats += (o.degats || 0) + (o.degatsBonus || 0);
    });
    const r = Math.max(0, Math.min(MULT_RANG.length - 1, rangIndex | 0));
    return { pv: Math.round(pv * MULT_RANG[r]), degats: Math.round(degats * MULT_RANG[r]), rang: r, mult: MULT_RANG[r] };
  }

  function valeurInventaire(inventaire){
    return (inventaire || []).reduce((t, id) => t + ((objet(id) || {}).prix || 0), 0);
  }

  // Or gagné au total. La revente rembourse 100 % et rien d'autre ne coûte de l'or,
  // donc « or en poche + valeur de l'équipement possédé » ne peut jamais dépasser l'or gagné :
  // on garde le plus grand des deux (utile pour les coffres d'avant le compteur orGagne).
  function orGagne(coffre){
    if(!coffre) return 0;
    const inv = coffre.equipement && coffre.equipement.inventory;
    return Math.max(Number(coffre.orGagne) || 0, (Number(coffre.or) || 0) + valeurInventaire(inv));
  }

  // Équipement complet d'un palier (1 à 3) : coût total et objets.
  function kitComplet(palier){
    const equipe = {}; let cout = 0;
    if(palier > 0) EMPLACEMENTS.forEach(e => {
      const o = e.objets.find(x => x.palier === palier);
      if(o){ equipe[e.id] = o.id; cout += o.prix; }
    });
    return { equipe, cout };
  }

  /* ---------------------------------------------------------------
     MONSTRES — force calculée à partir de l'or GAGNÉ par le groupe
     (dépensé ou pas : c'est au groupe de bien s'en servir).
       G = or gagné par toute la classe, n = nombre d'élèves au combat
       PV du monstre     = PV de base + facteur × COEF_PV × G
       Dégâts par round  = facteur × (DEGATS_BASE + COEF_DEGATS × G / n)
       facteur = 1,0 pour le monstre I, puis +0,1 par monstre (2,0 pour XI)
     Repère : 25 élèves qui ont chacun gagné 150 or et porté le kit de
     cuir complet (118 or), sans rang, battent le Gobelin au 5e round,
     juste avant de tomber. Ceux qui gardent leur or font perdre le groupe.
     Les monstres suivants demandent un meilleur équipement ou des rangs.
     --------------------------------------------------------------- */
  // Sept. 2026 : prix du marché triplés, force des monstres INCHANGÉE (voulu par l'enseignant) :
  // les rangs des Parchemins deviennent indispensables. Repère (25 élèves identiques, achats optimaux,
  // sans événements) : Apprentis → aucun monstre ; Novices → I à VI environ ; Invocateurs → les 11 dès ~100 or.
  const REGLAGE_MONSTRES = { COEF_PV: 0.28, DEGATS_BASE: 3, COEF_DEGATS: 0.08, PAS_FACTEUR: 0.10 };

  const MONSTRES = [
    { id:'gobelin',      nom:'I. Gobelin',          img:'monster_gobelin',         pvBase:150 },
    { id:'zombie',       nom:'II. Zombie',          img:'monster_zombie',          pvBase:90  },
    { id:'chimere',      nom:'III. Chimère',        img:'monster_chimere',         pvBase:110 },
    { id:'troll',        nom:'IV. Troll',           img:'monster_troll',           pvBase:130 },
    { id:'cube',         nom:'V. Cube gélatineux',  img:'monster_cube_gelatineux', pvBase:100 },
    { id:'mimique',      nom:'VI. Mimique',         img:'monster_mimique',         pvBase:120 },
    { id:'hobgobelin',   nom:'VII. Hobgobelin',     img:'monster_hobgobelin',      pvBase:140 },
    { id:'basilic',      nom:'VIII. Basilic',       img:'monster_basilic',         pvBase:160 },
    { id:'demon',        nom:'IX. Démon',           img:'monster_demon',           pvBase:180 },
    { id:'manticore',    nom:'X. Manticore',        img:'monster_manticore',       pvBase:200 },
    { id:'dragon_blanc', nom:'XI. Dragon blanc',    img:'monster_dragon_blanc',    pvBase:230 }
  ];

  function forceMonstre(idOuIndex, orGroupe, nbEleves){
    const i = typeof idOuIndex === 'number' ? idOuIndex : MONSTRES.findIndex(m => m.id === idOuIndex);
    const m = MONSTRES[Math.max(0, i)];
    const R = REGLAGE_MONSTRES;
    const facteur = 1 + R.PAS_FACTEUR * Math.max(0, i);
    const G = Math.max(0, Number(orGroupe) || 0);
    const n = Math.max(1, nbEleves | 0);
    return {
      pv: Math.round(m.pvBase + facteur * R.COEF_PV * G),
      degats: Math.max(1, Math.round(facteur * (R.DEGATS_BASE + R.COEF_DEGATS * G / n))),
      facteur
    };
  }

  // Sceau des fiches (même calcul que PasserelleCore.calculerSceau) : pour ne lire que des fiches intactes.
  function sceau(donnees){
    const texte = 'GRIMOIRE-MEQ-C6-2026' + JSON.stringify(donnees);
    let h = 0x811c9dc5;
    for(let i = 0; i < texte.length; i++){ h ^= texte.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16);
  }

  return { BASE_PV, RANGS, MULT_RANG, EMPLACEMENTS, PALIERS, IMAGES_ARENE, MONSTRES, REGLAGE_MONSTRES,
           objet, force, valeurInventaire, orGagne, kitComplet, forceMonstre, sceau };
})();
