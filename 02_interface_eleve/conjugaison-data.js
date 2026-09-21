/* =====================================================================
   CONJUGAISON-DATA.JS — MATH ÉMULATION / Parchemins de lecture
   ---------------------------------------------------------------------
   Contenu du Chapitre 2 (Conjurations) : les 5 thèmes de conjugaison,
   2 séries chacun, tirés des feuilles de chapitre2_conjugaison/.
   Chaque série = 3 temps (Présent, Imparfait, Futur) ; chaque temps =
   2 tableaux de référence + 2 groupes de 6 phrases à compléter
   (36 réponses par série). Une réponse = [pronom, réponse attendue, suite de la phrase].

     window.CONJUGAISON_DATA[id].series[0|1] = [ { titre, refs:[{verbe, temps, lignes:[[pronom, forme]]}],
                                                    groupes:[{titre, items:[[pronom, reponse, suite]]}] } ]

   Utilisé par parchemins-lecture.html (correction automatique, comme les Invocations du chapitre 1).
   Les feuilles imprimables d'origine restent dans chapitre2_conjugaison/.
   Pour ajouter le thème 6 (Petit Castor) : ajouter ici une entrée « 6 » et retirer « placeholder:true »
   de son entrée dans DATA (parchemins-lecture.html).
   ===================================================================== */

window.CONJUGAISON_DATA = {
 "1": {
  "slug": "chrono-bot",
  "series": [
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "suis"
        ],
        [
         "tu",
         "es"
        ],
        [
         "il/elle",
         "est"
        ],
        [
         "nous",
         "sommes"
        ],
        [
         "vous",
         "êtes"
        ],
        [
         "ils/elles",
         "sont"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "ai"
        ],
        [
         "tu",
         "as"
        ],
        [
         "il/elle",
         "a"
        ],
        [
         "nous",
         "avons"
        ],
        [
         "vous",
         "avez"
        ],
        [
         "ils/elles",
         "ont"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE au présent",
       "items": [
        [
         "Je",
         "suis",
         "fatigué après le voyage temporel."
        ],
        [
         "Tu",
         "es",
         "le meilleur pilote de Chrono-Bot !"
        ],
        [
         "Il",
         "est",
         "dans le futur, en 3024."
        ],
        [
         "Nous",
         "sommes",
         "prêts à décoller."
        ],
        [
         "Vous",
         "êtes",
         "très courageux aujourd'hui."
        ],
        [
         "Elles",
         "sont",
         "dans le vaisseau spatial."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR au présent",
       "items": [
        [
         "J'",
         "ai",
         "une idée géniale pour réparer le robot."
        ],
        [
         "Tu",
         "as",
         "un robot incroyable."
        ],
        [
         "Elle",
         "a",
         "un casque temporel doré."
        ],
        [
         "Nous",
         "avons",
         "deux batteries de secours."
        ],
        [
         "Vous",
         "avez",
         "beaucoup de chance."
        ],
        [
         "Ils",
         "ont",
         "des secrets du futur."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "étais"
        ],
        [
         "tu",
         "étais"
        ],
        [
         "il/elle",
         "était"
        ],
        [
         "nous",
         "étions"
        ],
        [
         "vous",
         "étiez"
        ],
        [
         "ils/elles",
         "étaient"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "avais"
        ],
        [
         "tu",
         "avais"
        ],
        [
         "il/elle",
         "avait"
        ],
        [
         "nous",
         "avions"
        ],
        [
         "vous",
         "aviez"
        ],
        [
         "ils/elles",
         "avaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE à l'imparfait",
       "items": [
        [
         "Quand j'",
         "étais",
         "petit, je rêvais de robots."
        ],
        [
         "Tu",
         "étais",
         "toujours avec ton robot."
        ],
        [
         "Il",
         "était",
         "dans le passé."
        ],
        [
         "Nous",
         "étions",
         "dans le laboratoire."
        ],
        [
         "Vous",
         "étiez",
         "les inventeurs du futur."
        ],
        [
         "Ils",
         "étaient",
         "fatigués hier."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR à l'imparfait",
       "items": [
        [
         "J'",
         "avais",
         "peur des robots avant."
        ],
        [
         "Tu",
         "avais",
         "un petit robot en jouet."
        ],
        [
         "Il",
         "avait",
         "une montre qui voyage dans le temps."
        ],
        [
         "Nous",
         "avions",
         "beaucoup d'idées."
        ],
        [
         "Vous",
         "aviez",
         "une mission secrète."
        ],
        [
         "Elles",
         "avaient",
         "des étoiles plein les yeux."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "serai"
        ],
        [
         "tu",
         "seras"
        ],
        [
         "il/elle",
         "sera"
        ],
        [
         "nous",
         "serons"
        ],
        [
         "vous",
         "serez"
        ],
        [
         "ils/elles",
         "seront"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "aurai"
        ],
        [
         "tu",
         "auras"
        ],
        [
         "il/elle",
         "aura"
        ],
        [
         "nous",
         "aurons"
        ],
        [
         "vous",
         "aurez"
        ],
        [
         "ils/elles",
         "auront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE au futur",
       "items": [
        [
         "Demain, je",
         "serai",
         "dans l'an 3000 !"
        ],
        [
         "Tu",
         "seras",
         "le capitaine du vaisseau."
        ],
        [
         "Elle",
         "sera",
         "une grande scientifique."
        ],
        [
         "Nous",
         "serons",
         "ensemble pour la mission."
        ],
        [
         "Vous",
         "serez",
         "les premiers voyageurs du temps."
        ],
        [
         "Ils",
         "seront",
         "très fiers."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR au futur",
       "items": [
        [
         "J'",
         "aurai",
         "un nouveau robot demain."
        ],
        [
         "Tu",
         "auras",
         "une combinaison spatiale."
        ],
        [
         "Il",
         "aura",
         "besoin de recharger."
        ],
        [
         "Nous",
         "aurons",
         "beaucoup de souvenirs."
        ],
        [
         "Vous",
         "aurez",
         "le temps de tout voir."
        ],
        [
         "Elles",
         "auront",
         "des ailes pour voler."
        ]
       ]
      }
     ]
    }
   ],
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "suis"
        ],
        [
         "tu",
         "es"
        ],
        [
         "il/elle",
         "est"
        ],
        [
         "nous",
         "sommes"
        ],
        [
         "vous",
         "êtes"
        ],
        [
         "ils/elles",
         "sont"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "ai"
        ],
        [
         "tu",
         "as"
        ],
        [
         "il/elle",
         "a"
        ],
        [
         "nous",
         "avons"
        ],
        [
         "vous",
         "avez"
        ],
        [
         "ils/elles",
         "ont"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE au présent",
       "items": [
        [
         "Je",
         "suis",
         "un explorateur du temps."
        ],
        [
         "Tu",
         "es",
         "mon coéquipier robotique."
        ],
        [
         "Il",
         "est",
         "le gardien de la porte temporelle."
        ],
        [
         "Nous",
         "sommes",
         "dans l'année 3024."
        ],
        [
         "Vous",
         "êtes",
         "les voyageurs du futur."
        ],
        [
         "Elles",
         "sont",
         "prêtes pour la mission finale."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR au présent",
       "items": [
        [
         "J'",
         "ai",
         "un module d'énergie quantique."
        ],
        [
         "Tu",
         "as",
         "une puce en diamant stellaire."
        ],
        [
         "Elle",
         "a",
         "un réacteur solaire bleu."
        ],
        [
         "Nous",
         "avons",
         "une mission secrète."
        ],
        [
         "Vous",
         "avez",
         "accès au portail quantique."
        ],
        [
         "Ils",
         "ont",
         "des ailes holographiques."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "étais"
        ],
        [
         "tu",
         "étais"
        ],
        [
         "il/elle",
         "était"
        ],
        [
         "nous",
         "étions"
        ],
        [
         "vous",
         "étiez"
        ],
        [
         "ils/elles",
         "étaient"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "avais"
        ],
        [
         "tu",
         "avais"
        ],
        [
         "il/elle",
         "avait"
        ],
        [
         "nous",
         "avions"
        ],
        [
         "vous",
         "aviez"
        ],
        [
         "ils/elles",
         "avaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE à l'imparfait",
       "items": [
        [
         "J'",
         "étais",
         "perdu dans le vortex temporel."
        ],
        [
         "Tu",
         "étais",
         "en mode veille prolongée."
        ],
        [
         "Il",
         "était",
         "le premier Chrono-Bot de l'histoire."
        ],
        [
         "Nous",
         "étions",
         "dans le passé lointain."
        ],
        [
         "Vous",
         "étiez",
         "connectés au réseau temporel."
        ],
        [
         "Elles",
         "étaient",
         "les gardiennes du temps."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR à l'imparfait",
       "items": [
        [
         "J'",
         "avais",
         "un vieux circuit rouillé."
        ],
        [
         "Tu",
         "avais",
         "une batterie à fusion."
        ],
        [
         "Il",
         "avait",
         "des yeux bleus lumineux."
        ],
        [
         "Nous",
         "avions",
         "peur du paradoxe temporel."
        ],
        [
         "Vous",
         "aviez",
         "des ailes dorées à l'époque."
        ],
        [
         "Elles",
         "avaient",
         "un plan secret."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "ÊTRE",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "serai"
        ],
        [
         "tu",
         "seras"
        ],
        [
         "il/elle",
         "sera"
        ],
        [
         "nous",
         "serons"
        ],
        [
         "vous",
         "serez"
        ],
        [
         "ils/elles",
         "seront"
        ]
       ]
      },
      {
       "verbe": "AVOIR",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "aurai"
        ],
        [
         "tu",
         "auras"
        ],
        [
         "il/elle",
         "aura"
        ],
        [
         "nous",
         "aurons"
        ],
        [
         "vous",
         "aurez"
        ],
        [
         "ils/elles",
         "auront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec ÊTRE au futur",
       "items": [
        [
         "Je",
         "serai",
         "le maître du temps."
        ],
        [
         "Tu",
         "seras",
         "mon allié interstellaire."
        ],
        [
         "Elle",
         "sera",
         "la reine du futur."
        ],
        [
         "Nous",
         "serons",
         "invincibles dans la galaxie."
        ],
        [
         "Vous",
         "serez",
         "les héros de demain."
        ],
        [
         "Ils",
         "seront",
         "les gardiens de l'univers."
        ]
       ]
      },
      {
       "titre": "B. Complète avec AVOIR au futur",
       "items": [
        [
         "J'",
         "aurai",
         "un nouveau propulseur photonique."
        ],
        [
         "Tu",
         "auras",
         "une armure en or quantique."
        ],
        [
         "Il",
         "aura",
         "un pouvoir de téléportation."
        ],
        [
         "Nous",
         "aurons",
         "des ailes de lumière."
        ],
        [
         "Vous",
         "aurez",
         "accès au portail final."
        ],
        [
         "Elles",
         "auront",
         "une mission à accomplir."
        ]
       ]
      }
     ]
    }
   ]
  ]
 },
 "2": {
  "slug": "m-pizza",
  "series": [
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "aime"
        ],
        [
         "tu",
         "aimes"
        ],
        [
         "il/elle",
         "aime"
        ],
        [
         "nous",
         "aimons"
        ],
        [
         "vous",
         "aimez"
        ],
        [
         "ils/elles",
         "aiment"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "mange"
        ],
        [
         "tu",
         "manges"
        ],
        [
         "il/elle",
         "mange"
        ],
        [
         "nous",
         "mangeons"
        ],
        [
         "vous",
         "mangez"
        ],
        [
         "ils/elles",
         "mangent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER au présent",
       "items": [
        [
         "J'",
         "aime",
         "les pepperonis bien chauds."
        ],
        [
         "Tu",
         "aimes",
         "la croûte dorée."
        ],
        [
         "Il (M. PIZZA)",
         "aime",
         "les olives noires."
        ],
        [
         "Nous",
         "aimons",
         "les pizzas au fromage."
        ],
        [
         "Vous",
         "aimez",
         "les soirées pizza."
        ],
        [
         "Elles",
         "aiment",
         "le four à bois."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER au présent",
       "items": [
        [
         "Je",
         "mange",
         "une part de pizza maintenant."
        ],
        [
         "Tu",
         "manges",
         "trop vite !"
        ],
        [
         "Elle",
         "mange",
         "sa croûte avec plaisir."
        ],
        [
         "Nous",
         "mangeons",
         "deux pizzas ce soir."
        ],
        [
         "Vous",
         "mangez",
         "beaucoup de fromage."
        ],
        [
         "Ils",
         "mangent",
         "des restes de pizza froide."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "aimais"
        ],
        [
         "tu",
         "aimais"
        ],
        [
         "il/elle",
         "aimait"
        ],
        [
         "nous",
         "aimions"
        ],
        [
         "vous",
         "aimiez"
        ],
        [
         "ils/elles",
         "aimaient"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "mangeais"
        ],
        [
         "tu",
         "mangeais"
        ],
        [
         "il/elle",
         "mangeait"
        ],
        [
         "nous",
         "mangions"
        ],
        [
         "vous",
         "mangiez"
        ],
        [
         "ils/elles",
         "mangeaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER à l'imparfait",
       "items": [
        [
         "Autrefois, j'",
         "aimais",
         "surtout les pizzas au fromage."
        ],
        [
         "Tu",
         "aimais",
         "toujours la croûte, avant."
        ],
        [
         "Il",
         "aimait",
         "les anchois dans le passé."
        ],
        [
         "Nous",
         "aimions",
         "la pizza du vendredi."
        ],
        [
         "Vous",
         "aimiez",
         "les pizzas épicées."
        ],
        [
         "Ils",
         "aimaient",
         "le pepperoni hier."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER à l'imparfait",
       "items": [
        [
         "Je",
         "mangeais",
         "de la pizza tous les samedis."
        ],
        [
         "Tu",
         "mangeais",
         "avec les doigts."
        ],
        [
         "Il",
         "mangeait",
         "sa croûte en premier."
        ],
        [
         "Nous",
         "mangions",
         "beaucoup de parts."
        ],
        [
         "Vous",
         "mangiez",
         "une pizza entière à l'époque."
        ],
        [
         "Elles",
         "mangeaient",
         "des miettes par terre."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "aimerai"
        ],
        [
         "tu",
         "aimeras"
        ],
        [
         "il/elle",
         "aimera"
        ],
        [
         "nous",
         "aimerons"
        ],
        [
         "vous",
         "aimerez"
        ],
        [
         "ils/elles",
         "aimeront"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "mangerai"
        ],
        [
         "tu",
         "mangeras"
        ],
        [
         "il/elle",
         "mangera"
        ],
        [
         "nous",
         "mangerons"
        ],
        [
         "vous",
         "mangerez"
        ],
        [
         "ils/elles",
         "mangeront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER au futur",
       "items": [
        [
         "Demain, M. PIZZA",
         "aimera",
         "les nouvelles saveurs."
        ],
        [
         "Tu",
         "aimeras",
         "la pizza à l'ananas un jour."
        ],
        [
         "Elle",
         "aimera",
         "la nouvelle recette au basilic."
        ],
        [
         "Nous",
         "aimerons",
         "la fête de la pizza."
        ],
        [
         "Vous",
         "aimerez",
         "la nouvelle pizzeria."
        ],
        [
         "Ils",
         "aimeront",
         "le four à bois rénové."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER au futur",
       "items": [
        [
         "Demain, je",
         "mangerai",
         "une pizza géante."
        ],
        [
         "Tu",
         "mangeras",
         "la dernière part."
        ],
        [
         "Elle",
         "mangera",
         "avant tout le monde."
        ],
        [
         "Nous",
         "mangerons",
         "ensemble ce soir."
        ],
        [
         "Vous",
         "mangerez",
         "toute la boîte."
        ],
        [
         "Ils",
         "mangeront",
         "des pizzas froides demain matin."
        ]
       ]
      }
     ]
    }
   ],
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "aime"
        ],
        [
         "tu",
         "aimes"
        ],
        [
         "il/elle",
         "aime"
        ],
        [
         "nous",
         "aimons"
        ],
        [
         "vous",
         "aimez"
        ],
        [
         "ils/elles",
         "aiment"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "mange"
        ],
        [
         "tu",
         "manges"
        ],
        [
         "il/elle",
         "mange"
        ],
        [
         "nous",
         "mangeons"
        ],
        [
         "vous",
         "mangez"
        ],
        [
         "ils/elles",
         "mangent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER au présent",
       "items": [
        [
         "J'",
         "aime",
         "les pizzas 4 fromages."
        ],
        [
         "Tu",
         "aimes",
         "ton coéquipier gourmand."
        ],
        [
         "Elle",
         "aime",
         "le gardien du four."
        ],
        [
         "Nous",
         "aimons",
         "les soirées pizza."
        ],
        [
         "Vous",
         "aimez",
         "les pizzas du futur."
        ],
        [
         "Ils",
         "aiment",
         "la nouvelle recette."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER au présent",
       "items": [
        [
         "Je",
         "mange",
         "une part quantique."
        ],
        [
         "Tu",
         "manges",
         "une croûte diamant."
        ],
        [
         "Elle",
         "mange",
         "du fromage bleu."
        ],
        [
         "Il",
         "mange",
         "deux olives."
        ],
        [
         "Nous",
         "mangeons",
         "en mission secrète."
        ],
        [
         "Vous",
         "mangez",
         "la dernière pointe."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "aimais"
        ],
        [
         "tu",
         "aimais"
        ],
        [
         "il/elle",
         "aimait"
        ],
        [
         "nous",
         "aimions"
        ],
        [
         "vous",
         "aimiez"
        ],
        [
         "ils/elles",
         "aimaient"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "mangeais"
        ],
        [
         "tu",
         "mangeais"
        ],
        [
         "il/elle",
         "mangeait"
        ],
        [
         "nous",
         "mangions"
        ],
        [
         "vous",
         "mangiez"
        ],
        [
         "ils/elles",
         "mangeaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER à l'imparfait",
       "items": [
        [
         "Avant, j'",
         "aimais",
         "la pizza classique."
        ],
        [
         "Tu",
         "aimais",
         "les soirées tranquilles."
        ],
        [
         "Il",
         "aimait",
         "le premier M. PIZZA."
        ],
        [
         "Nous",
         "aimions",
         "le passé lointain."
        ],
        [
         "Vous",
         "aimiez",
         "le réseau pizzeria."
        ],
        [
         "Elles",
         "aimaient",
         "les vieilles recettes."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER à l'imparfait",
       "items": [
        [
         "Je",
         "mangeais",
         "du vieux fromage."
        ],
        [
         "Tu",
         "mangeais",
         "avec envie."
        ],
        [
         "Il",
         "mangeait",
         "avec des yeux gourmands."
        ],
        [
         "Nous",
         "mangions",
         "par peur de manquer."
        ],
        [
         "Vous",
         "mangiez",
         "des croûtes dorées."
        ],
        [
         "Ils",
         "mangeaient",
         "en cachette."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "AIMER",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "aimerai"
        ],
        [
         "tu",
         "aimeras"
        ],
        [
         "il/elle",
         "aimera"
        ],
        [
         "nous",
         "aimerons"
        ],
        [
         "vous",
         "aimerez"
        ],
        [
         "ils/elles",
         "aimeront"
        ]
       ]
      },
      {
       "verbe": "MANGER",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "mangerai"
        ],
        [
         "tu",
         "mangeras"
        ],
        [
         "il/elle",
         "mangera"
        ],
        [
         "nous",
         "mangerons"
        ],
        [
         "vous",
         "mangerez"
        ],
        [
         "ils/elles",
         "mangeront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec AIMER au futur",
       "items": [
        [
         "M. PIZZA",
         "aimera",
         "les champignons plus tard."
        ],
        [
         "J'",
         "aimerai",
         "les anchois en 2056."
        ],
        [
         "Tu",
         "aimeras",
         "la pizza surgelée demain."
        ],
        [
         "Nous",
         "aimerons",
         "la croûte croustillante du futur."
        ],
        [
         "Vous",
         "aimerez",
         "les nouvelles pizzas."
        ],
        [
         "Ils",
         "aimeront",
         "la pizza spatiale."
        ]
       ]
      },
      {
       "titre": "B. Complète avec MANGER au futur",
       "items": [
        [
         "M. PIZZA",
         "mangera",
         "de la pizza en 2056."
        ],
        [
         "Je",
         "mangerai",
         "une croûte demain."
        ],
        [
         "Tu",
         "mangeras",
         "toute la boîte seul."
        ],
        [
         "Il",
         "mangera",
         "avant minuit."
        ],
        [
         "Nous",
         "mangerons",
         "de la pizza en 3030."
        ],
        [
         "Vous",
         "mangerez",
         "la dernière part ensemble."
        ]
       ]
      }
     ]
    }
   ]
  ]
 },
 "3": {
  "slug": "tyran",
  "series": [
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "peux"
        ],
        [
         "tu",
         "peux"
        ],
        [
         "il/elle",
         "peut"
        ],
        [
         "nous",
         "pouvons"
        ],
        [
         "vous",
         "pouvez"
        ],
        [
         "ils/elles",
         "peuvent"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "veux"
        ],
        [
         "tu",
         "veux"
        ],
        [
         "il/elle",
         "veut"
        ],
        [
         "nous",
         "voulons"
        ],
        [
         "vous",
         "voulez"
        ],
        [
         "ils/elles",
         "veulent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR au présent",
       "items": [
        [
         "Je",
         "peux",
         "écraser la rébellion du royaume."
        ],
        [
         "Tu",
         "peux",
         "fuir devant le Tyran sans te faire voir."
        ],
        [
         "Il",
         "peut",
         "ordonner l'attaque de ses chevaliers noirs."
        ],
        [
         "Nous",
         "pouvons",
         "entendre les cris dans la salle du trône."
        ],
        [
         "Vous",
         "pouvez",
         "trembler devant sa couronne d'épines."
        ],
        [
         "Elles",
         "peuvent",
         "se cacher dans les cachots du château."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR au présent",
       "items": [
        [
         "Je",
         "veux",
         "renverser le Tyran et libérer le peuple."
        ],
        [
         "Tu",
         "veux",
         "devenir son fidèle serviteur par peur."
        ],
        [
         "Elle",
         "veut",
         "défier l'empereur tyrannique en duel."
        ],
        [
         "Nous",
         "voulons",
         "reprendre le pouvoir du château noir."
        ],
        [
         "Vous",
         "voulez",
         "obéir aux ordres cruels du Tyran."
        ],
        [
         "Ils",
         "veulent",
         "briser la malédiction de la couronne."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "pouvais"
        ],
        [
         "tu",
         "pouvais"
        ],
        [
         "il/elle",
         "pouvait"
        ],
        [
         "nous",
         "pouvions"
        ],
        [
         "vous",
         "pouviez"
        ],
        [
         "ils/elles",
         "pouvaient"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "voulais"
        ],
        [
         "tu",
         "voulais"
        ],
        [
         "il/elle",
         "voulait"
        ],
        [
         "nous",
         "voulions"
        ],
        [
         "vous",
         "vouliez"
        ],
        [
         "ils/elles",
         "voulaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR à l'imparfait",
       "items": [
        [
         "Autrefois, je",
         "pouvais",
         "à peine approcher le trône du Tyran."
        ],
        [
         "Tu",
         "pouvais",
         "toujours défier les gardes du château."
        ],
        [
         "Il",
         "pouvait",
         "ordonner la destruction du village d'un seul geste."
        ],
        [
         "Nous",
         "pouvions",
         "entendre les chaînes dans les cachots sombres."
        ],
        [
         "Vous",
         "pouviez",
         "voir la lueur de sa couronne maléfique de loin."
        ],
        [
         "Ils",
         "pouvaient",
         "fuir devant l'armée du Tyran."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR à l'imparfait",
       "items": [
        [
         "Je",
         "voulais",
         "renverser le Tyran quand j'étais jeune."
        ],
        [
         "Tu",
         "voulais",
         "libérer les prisonniers du donjon."
        ],
        [
         "Il",
         "voulait",
         "conquérir tous les royaumes voisins."
        ],
        [
         "Nous",
         "voulions",
         "briser le pouvoir de l'empereur tyrannique."
        ],
        [
         "Vous",
         "vouliez",
         "obéir au Tyran par peur autrefois."
        ],
        [
         "Elles",
         "voulaient",
         "échapper à la malédiction du château."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "pourrai"
        ],
        [
         "tu",
         "pourras"
        ],
        [
         "il/elle",
         "pourra"
        ],
        [
         "nous",
         "pourrons"
        ],
        [
         "vous",
         "pourrez"
        ],
        [
         "ils/elles",
         "pourront"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "voudrai"
        ],
        [
         "tu",
         "voudras"
        ],
        [
         "il/elle",
         "voudra"
        ],
        [
         "nous",
         "voudrons"
        ],
        [
         "vous",
         "voudrez"
        ],
        [
         "ils/elles",
         "voudront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR au futur",
       "items": [
        [
         "Demain, je",
         "pourrai",
         "vaincre le Tyran dans l'arène."
        ],
        [
         "Tu",
         "pourras",
         "défier sa couronne d'or noir."
        ],
        [
         "Elle",
         "pourra",
         "s'infiltrer dans la salle du trône."
        ],
        [
         "Nous",
         "pourrons",
         "libérer le royaume ensemble."
        ],
        [
         "Vous",
         "pourrez",
         "assister à la chute du Tyran."
        ],
        [
         "Ils",
         "pourront",
         "enfin respirer sans peur."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR au futur",
       "items": [
        [
         "Je",
         "voudrai",
         "devenir le nouveau roi à sa place."
        ],
        [
         "Tu",
         "voudras",
         "porter la cape du Tyran déchu."
        ],
        [
         "Il",
         "voudra",
         "garder son pouvoir pour toujours."
        ],
        [
         "Nous",
         "voudrons",
         "reconstruire le château sans cruauté."
        ],
        [
         "Vous",
         "voudrez",
         "choisir la liberté plutôt que la peur."
        ],
        [
         "Elles",
         "voudront",
         "oublier les jours sombres du Tyran."
        ]
       ]
      }
     ]
    }
   ],
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "peux"
        ],
        [
         "tu",
         "peux"
        ],
        [
         "il/elle",
         "peut"
        ],
        [
         "nous",
         "pouvons"
        ],
        [
         "vous",
         "pouvez"
        ],
        [
         "ils/elles",
         "peuvent"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "veux"
        ],
        [
         "tu",
         "veux"
        ],
        [
         "il/elle",
         "veut"
        ],
        [
         "nous",
         "voulons"
        ],
        [
         "vous",
         "voulez"
        ],
        [
         "ils/elles",
         "veulent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR au présent",
       "items": [
        [
         "Je",
         "peux",
         "dominer les terres du Tyran."
        ],
        [
         "Tu",
         "peux",
         "entrer dans le château noir sans te faire voir."
        ],
        [
         "Il",
         "peut",
         "écraser la résistance d'un seul ordre."
        ],
        [
         "Nous",
         "pouvons",
         "entendre son rugissement dans le donjon."
        ],
        [
         "Vous",
         "pouvez",
         "trembler devant son trône d'épines."
        ],
        [
         "Elles",
         "peuvent",
         "fuir devant sa garde noire."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR au présent",
       "items": [
        [
         "Je",
         "veux",
         "briser la malédiction du Tyran."
        ],
        [
         "Tu",
         "veux",
         "devenir chevalier pour le combattre."
        ],
        [
         "Elle",
         "veut",
         "fuir le château maudit du Tyran."
        ],
        [
         "Il",
         "veut",
         "conserver son empire de peur."
        ],
        [
         "Nous",
         "voulons",
         "reprendre le royaume des ténèbres."
        ],
        [
         "Vous",
         "voulez",
         "échapper à sa colère."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "pouvais"
        ],
        [
         "tu",
         "pouvais"
        ],
        [
         "il/elle",
         "pouvait"
        ],
        [
         "nous",
         "pouvions"
        ],
        [
         "vous",
         "pouviez"
        ],
        [
         "ils/elles",
         "pouvaient"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "voulais"
        ],
        [
         "tu",
         "voulais"
        ],
        [
         "il/elle",
         "voulait"
        ],
        [
         "nous",
         "voulions"
        ],
        [
         "vous",
         "vouliez"
        ],
        [
         "ils/elles",
         "voulaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR à l'imparfait",
       "items": [
        [
         "Je",
         "pouvais",
         "voir le Tyran depuis la tour sombre."
        ],
        [
         "Tu",
         "pouvais",
         "entendre ses ordres cruels résonner."
        ],
        [
         "Il",
         "pouvait",
         "régner sans pitié sur le peuple."
        ],
        [
         "Nous",
         "pouvions",
         "fuir devant ses gardes noirs."
        ],
        [
         "Vous",
         "pouviez",
         "sentir la peur dans le château."
        ],
        [
         "Elles",
         "pouvaient",
         "résister en secret."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR à l'imparfait",
       "items": [
        [
         "Je",
         "voulais",
         "détruire son trône de fer noir."
        ],
        [
         "Tu",
         "voulais",
         "libérer les esclaves du donjon."
        ],
        [
         "Il",
         "voulait",
         "conquérir le monde entier."
        ],
        [
         "Nous",
         "voulions",
         "échapper à sa colère éternelle."
        ],
        [
         "Vous",
         "vouliez",
         "obéir par crainte autrefois."
        ],
        [
         "Ils",
         "voulaient",
         "renverser le Tyran ensemble."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "POUVOIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "pourrai"
        ],
        [
         "tu",
         "pourras"
        ],
        [
         "il/elle",
         "pourra"
        ],
        [
         "nous",
         "pourrons"
        ],
        [
         "vous",
         "pourrez"
        ],
        [
         "ils/elles",
         "pourront"
        ]
       ]
      },
      {
       "verbe": "VOULOIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "voudrai"
        ],
        [
         "tu",
         "voudras"
        ],
        [
         "il/elle",
         "voudra"
        ],
        [
         "nous",
         "voudrons"
        ],
        [
         "vous",
         "voudrez"
        ],
        [
         "ils/elles",
         "voudront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "P. Complète avec POUVOIR au futur",
       "items": [
        [
         "Je",
         "pourrai",
         "affronter le Tyran à l'aube."
        ],
        [
         "Tu",
         "pourras",
         "voler sa couronne maléfique."
        ],
        [
         "Elle",
         "pourra",
         "s'échapper du palais sombre."
        ],
        [
         "Nous",
         "pourrons",
         "vaincre l'empereur tyrannique."
        ],
        [
         "Vous",
         "pourrez",
         "célébrer la chute du Tyran."
        ],
        [
         "Ils",
         "pourront",
         "enfin vivre en paix."
        ]
       ]
      },
      {
       "titre": "V. Complète avec VOULOIR au futur",
       "items": [
        [
         "Je",
         "voudrai",
         "gouverner avec justice après lui."
        ],
        [
         "Tu",
         "voudras",
         "porter l'épée légendaire du royaume."
        ],
        [
         "Il",
         "voudra",
         "garder le pouvoir jusqu'à la fin."
        ],
        [
         "Nous",
         "voudrons",
         "reconstruire un monde sans peur."
        ],
        [
         "Vous",
         "voudrez",
         "choisir la paix pour le royaume."
        ],
        [
         "Elles",
         "voudront",
         "oublier le règne du Tyran."
        ]
       ]
      }
     ]
    }
   ]
  ]
 },
 "4": {
  "slug": "einstein",
  "series": [
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "apprends"
        ],
        [
         "tu",
         "apprends"
        ],
        [
         "il/elle",
         "apprend"
        ],
        [
         "nous",
         "apprenons"
        ],
        [
         "vous",
         "apprenez"
        ],
        [
         "ils/elles",
         "apprennent"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "comprends"
        ],
        [
         "tu",
         "comprends"
        ],
        [
         "il/elle",
         "comprend"
        ],
        [
         "nous",
         "comprenons"
        ],
        [
         "vous",
         "comprenez"
        ],
        [
         "ils/elles",
         "comprennent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE au présent",
       "items": [
        [
         "J'",
         "apprends",
         "la formule de la relativité d'Einstein."
        ],
        [
         "Tu",
         "apprends",
         "à dessiner les planètes au tableau."
        ],
        [
         "Il",
         "apprend",
         "à utiliser le télescope du laboratoire."
        ],
        [
         "Nous",
         "apprenons",
         "les secrets de l'univers."
        ],
        [
         "Vous",
         "apprenez",
         "les lois du temps et de l'espace."
        ],
        [
         "Elles",
         "apprennent",
         "à calculer la vitesse de la lumière."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE au présent",
       "items": [
        [
         "Je",
         "comprends",
         "enfin l'équation d'Einstein."
        ],
        [
         "Tu",
         "comprends",
         "le mouvement des étoiles."
        ],
        [
         "Elle",
         "comprend",
         "le mystère des trous noirs."
        ],
        [
         "Nous",
         "comprenons",
         "le temps grâce à Einstein."
        ],
        [
         "Vous",
         "comprenez",
         "les notes dans son carnet."
        ],
        [
         "Ils",
         "comprennent",
         "le dessin sur le tableau noir."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "apprenais"
        ],
        [
         "tu",
         "apprenais"
        ],
        [
         "il/elle",
         "apprenait"
        ],
        [
         "nous",
         "apprenions"
        ],
        [
         "vous",
         "appreniez"
        ],
        [
         "ils/elles",
         "apprenaient"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "comprenais"
        ],
        [
         "tu",
         "comprenais"
        ],
        [
         "il/elle",
         "comprenait"
        ],
        [
         "nous",
         "comprenions"
        ],
        [
         "vous",
         "compreniez"
        ],
        [
         "ils/elles",
         "comprenaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE à l'imparfait",
       "items": [
        [
         "Quand j'étais petit, j'",
         "apprenais",
         "déjà les constellations."
        ],
        [
         "Tu",
         "apprenais",
         "les planètes avec Einstein."
        ],
        [
         "Il",
         "apprenait",
         "à écrire des formules au tableau."
        ],
        [
         "Nous",
         "apprenions",
         "à observer le ciel étoilé."
        ],
        [
         "Vous",
         "appreniez",
         "les chiffres avec le petit Einstein."
        ],
        [
         "Ils",
         "apprenaient",
         "la science dans son bureau."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE à l'imparfait",
       "items": [
        [
         "Je",
         "comprenais",
         "difficilement la gravité avant."
        ],
        [
         "Tu",
         "comprenais",
         "déjà les étoiles filantes."
        ],
        [
         "Il",
         "comprenait",
         "le langage secret de l'univers."
        ],
        [
         "Nous",
         "comprenions",
         "ses blagues de génie."
        ],
        [
         "Vous",
         "compreniez",
         "ses croquis de fusées."
        ],
        [
         "Elles",
         "comprenaient",
         "son amour pour la science."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "apprendrai"
        ],
        [
         "tu",
         "apprendras"
        ],
        [
         "il/elle",
         "apprendra"
        ],
        [
         "nous",
         "apprendrons"
        ],
        [
         "vous",
         "apprendrez"
        ],
        [
         "ils/elles",
         "apprendront"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "comprendrai"
        ],
        [
         "tu",
         "comprendras"
        ],
        [
         "il/elle",
         "comprendra"
        ],
        [
         "nous",
         "comprendrons"
        ],
        [
         "vous",
         "comprendrez"
        ],
        [
         "ils/elles",
         "comprendront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE au futur",
       "items": [
        [
         "Demain, j'",
         "apprendrai",
         "à dessiner comme Einstein."
        ],
        [
         "Tu",
         "apprendras",
         "à lire une carte du ciel."
        ],
        [
         "Elle",
         "apprendra",
         "la formule E=mc²."
        ],
        [
         "Nous",
         "apprendrons",
         "à construire une petite fusée."
        ],
        [
         "Vous",
         "apprendrez",
         "les noms des galaxies."
        ],
        [
         "Elles",
         "apprendront",
         "à observer Saturne."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE au futur",
       "items": [
        [
         "Je",
         "comprendrai",
         "le temps grâce à son livre."
        ],
        [
         "Tu",
         "comprendras",
         "le secret des planètes."
        ],
        [
         "Il",
         "comprendra",
         "enfin la relativité."
        ],
        [
         "Nous",
         "comprendrons",
         "l'infini de l'univers."
        ],
        [
         "Vous",
         "comprendrez",
         "pourquoi les étoiles brillent."
        ],
        [
         "Elles",
         "comprendront",
         "la passion d'Einstein."
        ]
       ]
      }
     ]
    }
   ],
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Présent",
       "lignes": [
        [
         "j'",
         "apprends"
        ],
        [
         "tu",
         "apprends"
        ],
        [
         "il/elle",
         "apprend"
        ],
        [
         "nous",
         "apprenons"
        ],
        [
         "vous",
         "apprenez"
        ],
        [
         "ils/elles",
         "apprennent"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "comprends"
        ],
        [
         "tu",
         "comprends"
        ],
        [
         "il/elle",
         "comprend"
        ],
        [
         "nous",
         "comprenons"
        ],
        [
         "vous",
         "comprenez"
        ],
        [
         "ils/elles",
         "comprennent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE au présent",
       "items": [
        [
         "J'",
         "apprends",
         "la science avec Einstein."
        ],
        [
         "Tu",
         "apprends",
         "à dessiner une planète."
        ],
        [
         "Il",
         "apprend",
         "à écrire au tableau noir."
        ],
        [
         "Nous",
         "apprenons",
         "les étoiles dans son bureau."
        ],
        [
         "Vous",
         "apprenez",
         "la formule magique."
        ],
        [
         "Elles",
         "apprennent",
         "à observer les étoiles."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE au présent",
       "items": [
        [
         "Je",
         "comprends",
         "son carnet rempli d'étoiles."
        ],
        [
         "Tu",
         "comprends",
         "son dessin de Saturne."
        ],
        [
         "Elle",
         "comprend",
         "le globe sur le bureau."
        ],
        [
         "Il",
         "comprend",
         "le temps qui s'étire."
        ],
        [
         "Nous",
         "comprenons",
         "son idée de génie."
        ],
        [
         "Ils",
         "comprennent",
         "enfin sa théorie."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "j'",
         "apprenais"
        ],
        [
         "tu",
         "apprenais"
        ],
        [
         "il/elle",
         "apprenait"
        ],
        [
         "nous",
         "apprenions"
        ],
        [
         "vous",
         "appreniez"
        ],
        [
         "ils/elles",
         "apprenaient"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "comprenais"
        ],
        [
         "tu",
         "comprenais"
        ],
        [
         "il/elle",
         "comprenait"
        ],
        [
         "nous",
         "comprenions"
        ],
        [
         "vous",
         "compreniez"
        ],
        [
         "ils/elles",
         "comprenaient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE à l'imparfait",
       "items": [
        [
         "J'",
         "apprenais",
         "les chiffres tout petit."
        ],
        [
         "Tu",
         "apprenais",
         "les planètes avec lui."
        ],
        [
         "Il",
         "apprenait",
         "la gravité dans son labo."
        ],
        [
         "Nous",
         "apprenions",
         "à regarder le ciel."
        ],
        [
         "Vous",
         "appreniez",
         "ses formules secrètes."
        ],
        [
         "Elles",
         "apprenaient",
         "en silence."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE à l'imparfait",
       "items": [
        [
         "Je",
         "comprenais",
         "mal les étoiles avant."
        ],
        [
         "Tu",
         "comprenais",
         "déjà les fusées."
        ],
        [
         "Il",
         "comprenait",
         "les mystères du cosmos."
        ],
        [
         "Nous",
         "comprenions",
         "ses notes au tableau."
        ],
        [
         "Vous",
         "compreniez",
         "son humour de savant."
        ],
        [
         "Ils",
         "comprenaient",
         "son génie."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "APPRENDRE",
       "temps": "Futur",
       "lignes": [
        [
         "j'",
         "apprendrai"
        ],
        [
         "tu",
         "apprendras"
        ],
        [
         "il/elle",
         "apprendra"
        ],
        [
         "nous",
         "apprendrons"
        ],
        [
         "vous",
         "apprendrez"
        ],
        [
         "ils/elles",
         "apprendront"
        ]
       ]
      },
      {
       "verbe": "COMPRENDRE",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "comprendrai"
        ],
        [
         "tu",
         "comprendras"
        ],
        [
         "il/elle",
         "comprendra"
        ],
        [
         "nous",
         "comprendrons"
        ],
        [
         "vous",
         "comprendrez"
        ],
        [
         "ils/elles",
         "comprendront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "A. Complète avec APPRENDRE au futur",
       "items": [
        [
         "J'",
         "apprendrai",
         "l'histoire de l'univers."
        ],
        [
         "Tu",
         "apprendras",
         "à utiliser le globe terrestre."
        ],
        [
         "Elle",
         "apprendra",
         "à dessiner les galaxies."
        ],
        [
         "Nous",
         "apprendrons",
         "à calculer comme Einstein."
        ],
        [
         "Vous",
         "apprendrez",
         "à rêver en grand."
        ],
        [
         "Ils",
         "apprendront",
         "les secrets du temps."
        ]
       ]
      },
      {
       "titre": "C. Complète avec COMPRENDRE au futur",
       "items": [
        [
         "Je",
         "comprendrai",
         "la relativité demain."
        ],
        [
         "Tu",
         "comprendras",
         "pourquoi le temps passe."
        ],
        [
         "Il",
         "comprendra",
         "la lumière des étoiles."
        ],
        [
         "Nous",
         "comprendrons",
         "le secret de l'espace."
        ],
        [
         "Vous",
         "comprendrez",
         "la joie d'apprendre."
        ],
        [
         "Elles",
         "comprendront",
         "enfin l'univers."
        ]
       ]
      }
     ]
    }
   ]
  ]
 },
 "5": {
  "slug": "faucheuse",
  "series": [
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "finis"
        ],
        [
         "tu",
         "finis"
        ],
        [
         "il/elle",
         "finit"
        ],
        [
         "nous",
         "finissons"
        ],
        [
         "vous",
         "finissez"
        ],
        [
         "ils/elles",
         "finissent"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "meurs"
        ],
        [
         "tu",
         "meurs"
        ],
        [
         "il/elle",
         "meurt"
        ],
        [
         "nous",
         "mourons"
        ],
        [
         "vous",
         "mourez"
        ],
        [
         "ils/elles",
         "meurent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR au présent",
       "items": [
        [
         "Je",
         "finis",
         "ma tournée dans le cimetière à minuit."
        ],
        [
         "Tu",
         "finis",
         "de polir ta petite faux brillante."
        ],
        [
         "Elle",
         "finit",
         "sa récolte d'âmes sous la lune."
        ],
        [
         "Nous",
         "finissons",
         "notre patrouille nocturne ensemble."
        ],
        [
         "Vous",
         "finissez",
         "toujours votre travail en retard."
        ],
        [
         "Ils",
         "finissent",
         "par s'endormir dans la brume."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR au présent",
       "items": [
        [
         "Je",
         "meurs",
         "d'envie de collectionner des citrouilles."
        ],
        [
         "Tu",
         "meurs",
         "de froid dans la brume du cimetière."
        ],
        [
         "Il",
         "meurt",
         "de peur en voyant mon sourire."
        ],
        [
         "Nous",
         "mourons",
         "de rire avec les petites chauves-souris."
        ],
        [
         "Vous",
         "mourez",
         "d'ennui quand il n'y a pas de brouillard."
        ],
        [
         "Elles",
         "meurent",
         "de fatigue après Halloween."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "finissais"
        ],
        [
         "tu",
         "finissais"
        ],
        [
         "il/elle",
         "finissait"
        ],
        [
         "nous",
         "finissions"
        ],
        [
         "vous",
         "finissiez"
        ],
        [
         "ils/elles",
         "finissaient"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "mourais"
        ],
        [
         "tu",
         "mourais"
        ],
        [
         "il/elle",
         "mourait"
        ],
        [
         "nous",
         "mourions"
        ],
        [
         "vous",
         "mouriez"
        ],
        [
         "ils/elles",
         "mouraient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR à l'imparfait",
       "items": [
        [
         "Autrefois, je",
         "finissais",
         "ma tournée avant l'aube."
        ],
        [
         "Tu",
         "finissais",
         "toujours tes devoirs dans le cimetière."
        ],
        [
         "Il",
         "finissait",
         "sa ronde avant le lever du jour."
        ],
        [
         "Nous",
         "finissions",
         "notre travail dans le laboratoire des ombres."
        ],
        [
         "Vous",
         "finissiez",
         "toujours vos rondes en retard."
        ],
        [
         "Ils",
         "finissaient",
         "fatigués après la nuit des morts."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR à l'imparfait",
       "items": [
        [
         "Je",
         "mourais",
         "de peur quand j'entendais les hiboux."
        ],
        [
         "Tu",
         "mourais",
         "d'ennui dans ton petit cercueil."
        ],
        [
         "Il",
         "mourait",
         "de froid chaque hiver sans manteau."
        ],
        [
         "Nous",
         "mourions",
         "de rire en voyant les fantômes danser."
        ],
        [
         "Vous",
         "mouriez",
         "d'impatience avant Halloween."
        ],
        [
         "Elles",
         "mouraient",
         "d'envie de faire peur aux villageois."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "finirai"
        ],
        [
         "tu",
         "finiras"
        ],
        [
         "il/elle",
         "finira"
        ],
        [
         "nous",
         "finirons"
        ],
        [
         "vous",
         "finirez"
        ],
        [
         "ils/elles",
         "finiront"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "mourrai"
        ],
        [
         "tu",
         "mourras"
        ],
        [
         "il/elle",
         "mourra"
        ],
        [
         "nous",
         "mourrons"
        ],
        [
         "vous",
         "mourrez"
        ],
        [
         "ils/elles",
         "mourront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR au futur",
       "items": [
        [
         "Demain, je",
         "finirai",
         "dans l'an 3000 !"
        ],
        [
         "Tu",
         "finiras",
         "le dernier rite avant l'aube."
        ],
        [
         "Elle",
         "finira",
         "sa collection de crânes brillants."
        ],
        [
         "Nous",
         "finirons",
         "ensemble notre mission nocturne."
        ],
        [
         "Vous",
         "finirez",
         "les premiers gardiens du temps."
        ],
        [
         "Ils",
         "finiront",
         "très fiers de leur faucheuse."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR au futur",
       "items": [
        [
         "Je",
         "mourrai",
         "de rire si tu fais encore peur."
        ],
        [
         "Tu",
         "mourras",
         "d'envie devant mon cimetière."
        ],
        [
         "Il",
         "mourra",
         "de froid sans sa cape."
        ],
        [
         "Nous",
         "mourrons",
         "de fatigue après la récolte."
        ],
        [
         "Vous",
         "mourrez",
         "de peur quand je brillerai."
        ],
        [
         "Elles",
         "mourront",
         "de joie en retrouvant leurs âmes."
        ]
       ]
      }
     ]
    }
   ],
   [
    {
     "titre": "Présent",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "finis"
        ],
        [
         "tu",
         "finis"
        ],
        [
         "il/elle",
         "finit"
        ],
        [
         "nous",
         "finissons"
        ],
        [
         "vous",
         "finissez"
        ],
        [
         "ils/elles",
         "finissent"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Présent",
       "lignes": [
        [
         "je",
         "meurs"
        ],
        [
         "tu",
         "meurs"
        ],
        [
         "il/elle",
         "meurt"
        ],
        [
         "nous",
         "mourons"
        ],
        [
         "vous",
         "mourez"
        ],
        [
         "ils/elles",
         "meurent"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR au présent",
       "items": [
        [
         "Je",
         "finis",
         "ma tournée dans le cimetière."
        ],
        [
         "Tu",
         "finis",
         "de polir ta faux."
        ],
        [
         "Elle",
         "finit",
         "sa récolte d'âmes."
        ],
        [
         "Nous",
         "finissons",
         "notre patrouille nocturne."
        ],
        [
         "Vous",
         "finissez",
         "toujours en retard."
        ],
        [
         "Ils",
         "finissent",
         "par s'endormir dans la brume."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR au présent",
       "items": [
        [
         "Je",
         "meurs",
         "d'envie de collectionner des citrouilles."
        ],
        [
         "Tu",
         "meurs",
         "de froid dans la brume."
        ],
        [
         "Il",
         "meurt",
         "de peur en me voyant sourire."
        ],
        [
         "Nous",
         "mourons",
         "de rire avec les chauves-souris."
        ],
        [
         "Vous",
         "mourez",
         "d'ennui sans brouillard."
        ],
        [
         "Elles",
         "meurent",
         "de fatigue après Halloween."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Imparfait",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "finissais"
        ],
        [
         "tu",
         "finissais"
        ],
        [
         "il/elle",
         "finissait"
        ],
        [
         "nous",
         "finissions"
        ],
        [
         "vous",
         "finissiez"
        ],
        [
         "ils/elles",
         "finissaient"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Imparfait",
       "lignes": [
        [
         "je",
         "mourais"
        ],
        [
         "tu",
         "mourais"
        ],
        [
         "il/elle",
         "mourait"
        ],
        [
         "nous",
         "mourions"
        ],
        [
         "vous",
         "mouriez"
        ],
        [
         "ils/elles",
         "mouraient"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR à l'imparfait",
       "items": [
        [
         "Autrefois, je",
         "finissais",
         "toujours avant minuit."
        ],
        [
         "Tu",
         "finissais",
         "toujours tes devoirs au cimetière."
        ],
        [
         "Il",
         "finissait",
         "dans le passé lointain."
        ],
        [
         "Nous",
         "finissions",
         "dans le laboratoire des ombres."
        ],
        [
         "Vous",
         "finissiez",
         "vos rondes les premières."
        ],
        [
         "Ils",
         "finissaient",
         "fatigués après la nuit des morts."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR à l'imparfait",
       "items": [
        [
         "Je",
         "mourais",
         "de peur avec les hiboux."
        ],
        [
         "Tu",
         "mourais",
         "d'ennui dans ton cercueil."
        ],
        [
         "Il",
         "mourait",
         "de froid chaque hiver."
        ],
        [
         "Nous",
         "mourions",
         "de rire avec les fantômes."
        ],
        [
         "Vous",
         "mouriez",
         "d'impatience avant Halloween."
        ],
        [
         "Elles",
         "mouraient",
         "d'envie de faire peur."
        ]
       ]
      }
     ]
    },
    {
     "titre": "Futur",
     "refs": [
      {
       "verbe": "FINIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "finirai"
        ],
        [
         "tu",
         "finiras"
        ],
        [
         "il/elle",
         "finira"
        ],
        [
         "nous",
         "finirons"
        ],
        [
         "vous",
         "finirez"
        ],
        [
         "ils/elles",
         "finiront"
        ]
       ]
      },
      {
       "verbe": "MOURIR",
       "temps": "Futur",
       "lignes": [
        [
         "je",
         "mourrai"
        ],
        [
         "tu",
         "mourras"
        ],
        [
         "il/elle",
         "mourra"
        ],
        [
         "nous",
         "mourrons"
        ],
        [
         "vous",
         "mourrez"
        ],
        [
         "ils/elles",
         "mourront"
        ]
       ]
      }
     ],
     "groupes": [
      {
       "titre": "F. Complète avec FINIR au futur",
       "items": [
        [
         "Demain, je",
         "finirai",
         "dans l'an 3000 !"
        ],
        [
         "Tu",
         "finiras",
         "le dernier rite avant l'aube."
        ],
        [
         "Elle",
         "finira",
         "sa collection de crânes."
        ],
        [
         "Nous",
         "finirons",
         "ensemble notre mission."
        ],
        [
         "Vous",
         "finirez",
         "les premiers gardiens du temps."
        ],
        [
         "Ils",
         "finiront",
         "très fiers de leur faucheuse."
        ]
       ]
      },
      {
       "titre": "M. Complète avec MOURIR au futur",
       "items": [
        [
         "Je",
         "mourrai",
         "de rire si tu fais peur."
        ],
        [
         "Tu",
         "mourras",
         "d'envie devant mon cimetière."
        ],
        [
         "Il",
         "mourra",
         "de froid sans sa cape."
        ],
        [
         "Nous",
         "mourrons",
         "de fatigue après la récolte."
        ],
        [
         "Vous",
         "mourrez",
         "de peur quand je brillerai."
        ],
        [
         "Elles",
         "mourront",
         "de joie en retrouvant leurs âmes."
        ]
       ]
      }
     ]
    }
   ]
  ]
 }
};
