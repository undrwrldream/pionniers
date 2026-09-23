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
    { id:'helmet', nom:'Casque', objets:[
      { id:'h_leather', nom:'Casque de cuir',   prix:20,  pv:8,   palier:1 },
      { id:'h_steel',   nom:"Heaume d'acier",   prix:45,  pv:18,  palier:2 },
      { id:'h_royal',   nom:'Heaume royal',     prix:120, pv:40,  palier:3 } ]},
    { id:'armor', nom:'Armure', objets:[
      { id:'a_leather', nom:'Plastron de cuir', prix:25,  pv:15,  palier:1 },
      { id:'a_steel',   nom:"Armure d'acier",   prix:60,  pv:25,  palier:2 },
      { id:'a_royal',   nom:'Armure royale',    prix:150, pv:100, palier:3 } ]},
    { id:'gloves', nom:'Gants', objets:[
      { id:'g_leather', nom:'Gants de cuir',    prix:15,  degatsBonus:2, palier:1 },
      { id:'g_steel',   nom:"Gants d'acier",    prix:35,  degatsBonus:4, palier:2 },
      { id:'g_royal',   nom:'Gants royaux',     prix:90,  degatsBonus:8, palier:3 } ]},
    { id:'boots', nom:'Bottes', objets:[
      { id:'b_leather', nom:'Bottes de cuir',   prix:15,  pv:15,  palier:1 },
      { id:'b_steel',   nom:"Bottes d'acier",   prix:40,  pv:25,  palier:2 },
      { id:'b_royal',   nom:'Bottes royales',   prix:100, pv:60,  palier:3 } ]},
    { id:'weapon', nom:'Arme', objets:[
      { id:'w_dague',   nom:'Dague',            prix:18,  degats:8,  palier:1 },
      { id:'w_epee',    nom:'Épée longue',      prix:50,  degats:20, palier:2 },
      { id:'w_sabre',   nom:'Sabre',            prix:52,  degats:22, palier:3 } ]},
    { id:'shield', nom:'Bouclier', objets:[
      { id:'s_rond',    nom:'Bouclier rond',    prix:25,  pv:25,  palier:1 },
      { id:'s_acier',   nom:"Écu d'acier",      prix:46,  pv:45,  palier:2 },
      { id:'s_royal',   nom:'Bouclier royal',   prix:115, pv:120, palier:3 } ]}
  ];
  const PALIERS = ['Sans équipement', 'Tout en cuir (palier 1)', 'Tout en acier (palier 2)', 'Tout royal (palier 3)'];

  // Images de l'arène pour les badges d'arme et de bouclier (dossier 03_ecran_arene/arena_assets/).
  const IMAGES_ARENE = {
    w_dague:'weapon1_dagger', w_epee:'weapon2_longsword', w_sabre:'weapon5_saber',
    s_rond:'shield2_round', s_acier:'shield3_heater', s_royal:'shield5_royal'
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
