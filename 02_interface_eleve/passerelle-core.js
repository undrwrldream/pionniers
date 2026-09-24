/* =====================================================================
   PASSERELLE-CORE.JS — MATH ÉMULATION
   ---------------------------------------------------------------------
   Module partagé, chargé à la fois par interface_eleve.html et par
   grimoire-des-mathematiques.html (et potentiellement d'autres pièces
   du système plus tard). Il gère :

   1. L'identité de l'élève, fournie exclusivement par l'enseignant via
      l'URL (?eleve=<slug>&nom=<Nom Affiché>). Il n'y a plus AUCUNE saisie
      libre de nom par l'élève — voir la discussion du projet à ce sujet.

   2. Le "coffre" de l'élève : un seul objet regroupant le genre choisi
      pour l'avatar, le nombre de pièces d'or, et l'équipement possédé/
      porté. C'est LA source de vérité unique pour l'or (fusion du
      portefeuille du Grimoire et de celui de la Boutique).

   3. Un sceau (checksum) qui détecte toute altération faite en dehors
      des fonctions officielles de ce module, et deux générations de
      sauvegarde automatiques pour survivre à une corruption ponctuelle
      sans jamais forcer à "tout recommencer" en pleine année scolaire.

   ---------------------------------------------------------------------
   MIGRATION GOOGLE SHEETS (2026)
   ---------------------------------------------------------------------
   Seule chose qui a changé par rapport à la version window.storage :
   lireCle() et ecrireCle() parlent maintenant à un script Google Apps
   Script (déployé séparément) au lieu de l'API Artifacts de Claude.
   Tout le reste du module — identité, sceau, générations de sauvegarde,
   API publique — est strictement identique. Rien d'autre dans le projet
   n'a besoin d'être modifié.

   ⚠️ À FAIRE avant de déployer : remplace URL_SCRIPT et SECRET_PARTAGE
   ci-dessous par les valeurs de TON déploiement Apps Script (voir les
   instructions fournies séparément).
   ===================================================================== */

window.PasserelleCore = (function(){

  const SEL_SCEAU = "GRIMOIRE-MEQ-C6-2026";

  // ⚠️ À REMPLACER : colle ici l'URL /exec de ton déploiement Apps Script
  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbx263q1bpQIZlXPcpoGy8kUlmsUjMVPIZhO9wb5cpr4cjwtdiEI1s24a8fhterD_YShAA/exec";

  // ⚠️ À REMPLACER : choisis un mot secret et mets EXACTEMENT le même
  // dans la constante SECRET du script Apps Script côté Google.
  const SECRET_PARTAGE = "Chevalier1224";

  /* ---------- Identité (fournie par l'enseignant via l'URL) ---------- */

  // Lit ?eleve=<slug>&nom=<Nom Affiché> dans l'URL courante.
  // Retourne { slug, nom } ou null si le lien ne contient pas d'identité.
  function lireIdentiteUrl(){
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get('eleve') || '').trim();
    if(!slug) return null;
    let nom = (params.get('nom') || '').trim();
    if(!nom){
      // Repli si le paramètre "nom" est absent : on dérive quelque chose
      // de lisible à partir du slug plutôt que d'afficher un identifiant brut.
      nom = slug.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return { slug, nom };
  }

  /* ---------- Sceau (checksum) ---------- */

  // Hash simple (type FNV-1a). Suffisant pour détecter une altération ou
  // une corruption ; ne vise pas une sécurité cryptographique.
  function calculerSceau(objetDonnees){
    const texte = SEL_SCEAU + JSON.stringify(objetDonnees);
    let h = 0x811c9dc5;
    for(let i = 0; i < texte.length; i++){
      h ^= texte.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  }

  function enveloppeValide(enveloppe){
    return !!(enveloppe && enveloppe.donnees && calculerSceau(enveloppe.donnees) === enveloppe.seal);
  }

  function coffreParDefaut(nomAffiche){
    return {
      nom: nomAffiche || '',
      genre: null,           // "garcon" | "fille" | null (pas encore choisi)
      or: 0,
      orGagne: 0,            // or gagné au total, jamais diminué (force du groupe dans l'arène)
      niveauLecture: 0,      // index dans LEVELS (Apprenti → Archimage), voir parchemins-lecture.html
      equipement: { inventory: [], equipped: {}, portraitImage: null }
    };
  }

  /* ---------- Accès bas niveau — maintenant via Google Apps Script ---------- */

  async function lireCle(cle){
    try{
      const res = await fetch(URL_SCRIPT + '?cle=' + encodeURIComponent(cle));
      const data = await res.json();
      return (data && data.value) ? JSON.parse(data.value) : null;
    }catch(e){
      return null; // clé absente, réseau indisponible, ou erreur ponctuelle
    }
  }

  async function ecrireCle(cle, valeur){
    try{
      const res = await fetch(URL_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // évite le "preflight" CORS
        body: JSON.stringify({ cle: cle, valeur: JSON.stringify(valeur), secret: SECRET_PARTAGE })
      });
      const data = await res.json();
      return !!(data && data.ok);
    }catch(e){
      return false;
    }
  }

  function clesPour(slug){
    return {
      courant: 'coffre_' + slug,
      bak1: 'coffre_bak1_' + slug,
      bak2: 'coffre_bak2_' + slug
    };
  }

  /* ---------- API publique (inchangée) ---------- */

  /**
   * Charge le coffre d'un élève, avec restauration automatique en cascade.
   * Retourne { donnees, source, restaure } où :
   *   - source  : 'courant' | 'sauvegarde1' | 'sauvegarde2' | 'defaut'
   *   - restaure: true si on a dû revenir à une ancienne sauvegarde
   *               (utile pour informer l'élève avec un texte narratif plutôt
   *               qu'un message d'erreur froid).
   */
  async function chargerCoffre(slug, nomAffiche){
    const cles = clesPour(slug);
    const tentatives = [
      { cle: cles.courant, source: 'courant' },
      { cle: cles.bak1,    source: 'sauvegarde1' },
      { cle: cles.bak2,    source: 'sauvegarde2' }
    ];
    for(const tentative of tentatives){
      const enveloppe = await lireCle(tentative.cle);
      if(enveloppeValide(enveloppe)){
        // On rafraîchit le nom affiché au passage (au cas où l'enseignant
        // aurait corrigé une coquille dans le lien depuis la dernière visite).
        if(nomAffiche) enveloppe.donnees.nom = nomAffiche;
        return { donnees: enveloppe.donnees, source: tentative.source, restaure: tentative.source !== 'courant' };
      }
    }
    // Rien de valide trouvé : soit première visite, soit corruption totale
    // (extrêmement improbable — il faudrait que les 3 copies soient toutes
    // altérées en même temps).
    const existaitDejaQuelqueChose = !!(await lireCle(cles.courant));
    return { donnees: coffreParDefaut(nomAffiche), source: 'defaut', restaure: existaitDejaQuelqueChose };
  }

  /**
   * Sauvegarde le coffre d'un élève. Fait tourner les générations de
   * sauvegarde (courant → sauvegarde1 → sauvegarde2) AVANT d'écrire la
   * nouvelle version — et seulement si la version qu'on s'apprête à
   * décaler était elle-même valide, pour ne jamais promouvoir une donnée
   * corrompue au rang de "sauvegarde de secours".
   */
  async function sauvegarderCoffre(slug, donnees){
    const cles = clesPour(slug);

    const courantActuel = await lireCle(cles.courant);
    if(enveloppeValide(courantActuel)){
      const bak1Actuel = await lireCle(cles.bak1);
      if(enveloppeValide(bak1Actuel)){
        await ecrireCle(cles.bak2, bak1Actuel);
      }
      await ecrireCle(cles.bak1, courantActuel);
    }

    const nouvelleEnveloppe = { donnees: donnees, seal: calculerSceau(donnees) };
    return await ecrireCle(cles.courant, nouvelleEnveloppe);
  }

  return {
    lireIdentiteUrl,
    chargerCoffre,
    sauvegarderCoffre,
    calculerSceau,
    coffreParDefaut
  };

})();
