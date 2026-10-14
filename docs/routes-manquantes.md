# Routes API manquantes — Kids'Med IA

> Base URL : `https://backendkids.onrender.com/api` — Auth : `Authorization: Bearer <accessToken>`
> Cochez une route une fois réalisée : `[ ]` → `[*]`

Total : 70 routes

- [*] **`POST /alertes/symptome`** _(À venir)_
  - **Description** : Alertes symptômes (doc : À venir). Il faut aussi une route de lecture GET /alertes/etablissement/:etablissementId
  - **Rôles** : rsai
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "prenom": "string",
            "nom": "string"
          },
          "symptome": "string",
          "gravite": "faible | moyenne | elevee",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /developer/metrics`** _(À venir)_
  - **Description** : Métriques techniques (requêtes, latence, CPU, mémoire)
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "requestsPerMinute": 0,
        "avgResponseTime": 0,
        "errorRate": 0,
        "cpu": 0,
        "memory": 0,
        "uptime": 0,
        "history": [
          {
            "time": "HH:mm",
            "requests": 0,
            "latency": 0
          }
        ]
      }
    }
    ```


- [*] **`GET /developer/health-detailed`** _(À venir)_
  - **Description** : Santé détaillée des services
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "services": [
          {
            "name": "MongoDB",
            "status": "up | down | degraded",
            "latency": 0
          }
        ]
      }
    }
    ```


- [*] **`GET /developer/errors`** _(À venir)_
  - **Description** : Erreurs récentes
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "message": "string",
          "endpoint": "string",
          "level": "error | warning",
          "count": 0,
          "resolved": false,
          "lastSeen": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /developer/support/tickets`** _(À venir)_
  - **Description** : Tickets de support
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "titre": "string",
          "priorite": "basse | normale | haute | urgente",
          "statut": "ouvert | en_cours | resolu",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /developer/database/stats`** _(À venir)_
  - **Description** : Statistiques de la base
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "collections": [
          {
            "name": "string",
            "count": 0,
            "sizeMB": 0
          }
        ],
        "totalSizeMB": 0
      }
    }
    ```


- [*] **`GET /developer/endpoints`** _(À venir)_
  - **Description** : Liste des routes de l'API
  - **Rôles** : dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "method": "GET",
          "path": "string",
          "calls24h": 0,
          "avgMs": 0
        }
      ]
    }
    ```


- [*] **`POST /users (rôle « developpeur »)`** 
  - **Description** : Le rôle Développeur n'existe pas. Ajouter « developpeur » à l'énumération des rôles (POST /users, PUT /users/:userId/profile) et le renvoyer dans user.role à la connexion.
  - **Rôles** : dev, admin
  - **Body attendu** :

    ```json
    {
      "role": "parent | medecin | creche | rsai | admin | superadmin | developpeur"
    }
    ```


- [*] **`GET /auth/me (champ etablissementId)`** 
  - **Description** : L'utilisateur connecté (Crèche, RSAI) doit contenir etablissementId pour charger les données de son établissement.
  - **Rôles** : creche, rsai
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "role": "creche",
        "etablissementId": "string"
      }
    }
    ```


- [*] **`GET /presences/stats/:etablissementId`** 
  - **Description** : Évolution des présences des enfants
  - **Rôles** : creche
  - **Paramètres** : `?periode=semaine|mois`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "label": "Lun",
          "presents": 0,
          "absents": 0
        }
      ]
    }
    ```


- [*] **`GET /etablissements/:etablissementId/sante`** 
  - **Description** : Indicateurs santé globaux (vaccins à jour, allergies, PAI, traitements en cours)
  - **Rôles** : rsai
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "vaccinsAJour": 0,
        "allergiques": 0,
        "pai": 0,
        "traitementsEnCours": 0,
        "evolution": [
          {
            "mois": "Jan",
            "consultations": 0,
            "alertes": 0
          }
        ]
      }
    }
    ```


- [*] **`GET /medecins/:medecinId/stats`** 
  - **Description** : Statistiques du médecin (patients, consultations, ordonnances par mois)
  - **Rôles** : medecin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "patients": 0,
        "consultationsMois": 0,
        "ordonnancesMois": 0,
        "parMois": [
          {
            "mois": "Jan",
            "consultations": 0,
            "ordonnances": 0
          }
        ]
      }
    }
    ```


- [*] **`GET /rendez-vous/medecin/:medecinId`** 
  - **Description** : Agenda / consultations du médecin
  - **Rôles** : medecin
  - **Paramètres** : `?date=YYYY-MM-DD`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "heure": "HH:mm",
          "enfant": {
            "prenom": "string",
            "nom": "string"
          },
          "motif": "string",
          "etablissement": "string"
        }
      ]
    }
    ```


- [*] **`GET /abonnements/revenus`** 
  - **Description** : Revenus mensuels (MRR) par plan
  - **Rôles** : admin
  - **Paramètres** : `?annee=2026`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "mois": "Jan",
          "essentiel": 0,
          "premium": 0,
          "entreprise": 0
        }
      ]
    }
    ```


- [*] **`GET /enfants/:enfantId/qrcode`** _(À venir)_
  - **Description** : QR code de liaison parent
  - **Rôles** : creche
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "code": "string",
        "qrCodeUrl": "data:image/png;base64,..."
      }
    }
    ```


- [*] **`GET /medecins`** 
  - **Description** : Annuaire des médecins (non-admin). Aujourd'hui seul GET /users (admin) existe.
  - **Rôles** : creche, rsai, admin
  - **Paramètres** : `?etablissementId=`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "prenom": "string",
          "nom": "string",
          "specialite": "string",
          "rpps": "string",
          "tel": "string",
          "email": "string"
        }
      ]
    }
    ```


- [*] **`GET /rsai`** 
  - **Description** : Annuaire des RSAI (non-admin)
  - **Rôles** : creche, medecin, admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "prenom": "string",
          "nom": "string",
          "etablissements": [
            "string"
          ],
          "tel": "string",
          "email": "string"
        }
      ]
    }
    ```


- [*] **`GET /diagnostics`** 
  - **Description** : Liste des diagnostics IA récents (pas de route de liste globale)
  - **Rôles** : rsai, medecin
  - **Paramètres** : `?etablissementId=&limit=`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "prenom": "string",
            "nom": "string"
          },
          "symptomes": [
            "string"
          ],
          "resultat": "string",
          "confiance": 0,
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /users/export-data`** _(À venir)_
  - **Description** : Export RGPD de mes données
  - **Rôles** : creche, rsai, medecin, admin, dev

- [*] **`POST /enfants/lier-code`** 
  - **Description** : Lier l'utilisateur connecté (parent, médecin, crèche) à un enfant grâce au code de liaison
  - **Rôles** : creche, medecin, rsai
  - **Body attendu** :

    ```json
    {
      "code": "LEA-4821"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "enfantId",
        "prenom": "string",
        "nom": "string"
      }
    }
    ```


- [*] **`POST /enfants/:enfantId/regenerer-code`** 
  - **Description** : Régénérer le code de liaison d'un enfant (l'ancien devient invalide)
  - **Rôles** : creche, admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "code": "LEA-1234",
        "qrCodeUrl": "data:image/png;base64,..."
      }
    }
    ```


- [*] **`GET /liaisons/enfant/:enfantId`** 
  - **Description** : Personnes liées à un enfant (parents, médecins, crèche, RSAI)
  - **Rôles** : creche, rsai, medecin, admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "user": {
            "_id": "string",
            "prenom": "string",
            "nom": "string",
            "email": "string"
          },
          "role": "parent | medecin | rsai | creche",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /liaisons`** 
  - **Description** : Toutes les liaisons enfant ↔ utilisateurs (vue admin)
  - **Rôles** : admin
  - **Paramètres** : `?enfantId=&userId=&role=`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "_id": "string",
            "prenom": "string",
            "nom": "string"
          },
          "user": {
            "_id": "string",
            "prenom": "string",
            "nom": "string",
            "email": "string"
          },
          "role": "parent | medecin | rsai | creche",
          "source": "admin | code",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`POST /liaisons`** 
  - **Description** : Créer une liaison (admin ou crèche)
  - **Rôles** : admin, creche
  - **Body attendu** :

    ```json
    {
      "enfant": "enfantId",
      "email": "string (ou userId)",
      "role": "parent | medecin | rsai | creche"
    }
    ```


- [*] **`DELETE /liaisons/:liaisonId`** 
  - **Description** : Révoquer une liaison
  - **Rôles** : admin, creche

- [*] **`GET /abonnements/me`** 
  - **Description** : Abonnement de l'utilisateur connecté (médecin, admin, développeur)
  - **Rôles** : medecin, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "plan": "essentiel | premium | entreprise",
        "statut": "actif | essai | suspendu",
        "prixMensuel": 0,
        "dateDebut": "ISO date",
        "dateFin": "ISO date",
        "quota": {
          "enfantsMax": 0,
          "enfantsInscrits": 0,
          "utilisateursMax": 0
        },
        "factures": [
          {
            "_id": "string",
            "date": "ISO date",
            "montant": 0,
            "url": "string"
          }
        ]
      }
    }
    ```


- [*] **`GET /parents/me/enfants`** 
  - **Description** : Enfants rattachés au parent connecté, avec le résumé du jour (présence, humeur, repas, sieste)
  - **Rôles** : parent
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "prenom": "string",
          "nom": "string",
          "dateNaissance": "ISO date",
          "etablissement": {
            "_id": "string",
            "nom": "string"
          },
          "codeLiaison": "string",
          "aujourdhui": {
            "present": true,
            "humeur": "string",
            "repas": "string",
            "sieste": "string"
          }
        }
      ]
    }
    ```


- [*] **`GET /parents/me/transmissions`** 
  - **Description** : Transmissions du jour pour les enfants du parent
  - **Rôles** : parent
  - **Paramètres** : `?date=YYYY-MM-DD`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "_id": "string",
            "prenom": "string"
          },
          "type": "repas | sieste | sante | change | activite",
          "contenu": "string",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /parents/me/alertes`** 
  - **Description** : Alertes santé envoyées au parent (signalements crèche, diagnostics IA à risque)
  - **Rôles** : parent
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "prenom": "string"
          },
          "niveau": "faible | moyen | eleve",
          "message": "string",
          "createdAt": "ISO date",
          "lu": false
        }
      ]
    }
    ```


- [*] **`PATCH /enfants/:enfantId/dossier-medical`** 
  - **Description** : Mise à jour par le parent des infos médicales (allergies, antécédents, groupe sanguin)
  - **Rôles** : parent, medecin
  - **Body attendu** :

    ```json
    {
      "groupeSanguin": "O+",
      "allergies": [
        "string"
      ],
      "antecedents": [
        "string"
      ]
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string"
      }
    }
    ```


- [*] **`POST /diagnostics/analyser`** 
  - **Description** : Analyse IA des symptômes (multipart/form-data). Enregistre le résultat dans diagnostics_ia et notifie parents/crèche si risque élevé.
  - **Rôles** : creche, rsai, parent, medecin
  - **Body attendu** :

    ```json
    {
      "multipart/form-data": {
        "enfantId": "string",
        "symptomes": "JSON string[] (ex. [\"fievre\",\"toux\"])",
        "temperature": "number (°C, optionnel)",
        "duree": "string (ex. 24h)",
        "commentaire": "string",
        "photo": "fichier image (optionnel)"
      }
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "enfant_id": "string",
        "date_analyse": "ISO date",
        "symptoms_detectes": [
          "string"
        ],
        "photo_analysee": "URL",
        "diagnostics": [
          {
            "nom": "Bronchiolite",
            "confiance": 87.5
          }
        ],
        "diagnostic_suggere": "string",
        "niveau_confiance": 87.5,
        "niveau_risque": "faible | moyen | eleve",
        "conseils": [
          "string"
        ],
        "orientation": "surveillance | consultation_24h | urgence_15"
      }
    }
    ```


- [*] **`POST /diagnostics/:diagnosticId/retour-medecin`** 
  - **Description** : Retour du médecin sur l'exactitude du diagnostic IA (amélioration continue du modèle)
  - **Rôles** : medecin
  - **Body attendu** :

    ```json
    {
      "exact": true,
      "diagnosticReel": "string",
      "commentaire": "string"
    }
    ```


- [*] **`GET /enfants/:enfantId/vaccins`** 
  - **Description** : Carnet vaccinal : chaque injection avec date, médecin prescripteur et rappel
  - **Rôles** : creche, rsai, medecin, parent, admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "nom": "DTP | Coqueluche | Hib | Hépatite B | Pneumocoque | Méningocoque C | ROR",
          "dose": 1,
          "date": "ISO date",
          "medecin": {
            "_id": "string",
            "prenom": "string",
            "nom": "string"
          },
          "lot": "string",
          "rappel": "ISO date | null"
        }
      ]
    }
    ```


- [*] **`POST /enfants/:enfantId/vaccins`** 
  - **Description** : Ajouter une injection au carnet vaccinal
  - **Rôles** : medecin, parent, rsai
  - **Body attendu** :

    ```json
    {
      "nom": "string",
      "dose": 1,
      "date": "ISO date",
      "medecinId": "string",
      "lot": "string",
      "rappel": "ISO date"
    }
    ```


- [*] **`GET /enfants/:enfantId/consentements`** 
  - **Description** : Registre des consentements parentaux (droit à l'image, soins d'urgence, partage RSAI, transport, données de santé)
  - **Rôles** : creche, parent, admin, rsai
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "type": "droit_image | soins_urgence | partage_rsai | transport | donnees_sante",
          "accorde": true,
          "signePar": {
            "prenom": "string",
            "nom": "string"
          },
          "date": "ISO date"
        }
      ]
    }
    ```


- [*] **`PUT /enfants/:enfantId/consentements/:type`** 
  - **Description** : Accorder / retirer un consentement (signature horodatée)
  - **Rôles** : parent
  - **Body attendu** :

    ```json
    {
      "accorde": true,
      "signature": "string (nom saisi ou image base64)"
    }
    ```


- [*] **`POST /rgpd/demandes`** 
  - **Description** : Demande d'exercice des droits RGPD (accès, rectification, effacement, anonymisation)
  - **Rôles** : parent, creche, rsai, medecin, admin, dev
  - **Body attendu** :

    ```json
    {
      "type": "acces | rectification | effacement | anonymisation",
      "enfantId": "string (optionnel)",
      "motif": "string"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "statut": "recue",
        "delaiLegal": "ISO date (+30 jours)"
      }
    }
    ```


- [*] **`GET /rgpd/demandes`** 
  - **Description** : Liste des demandes RGPD (admin)
  - **Rôles** : admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "type": "string",
          "user": {
            "prenom": "string",
            "nom": "string"
          },
          "statut": "recue | en_cours | traitee",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /securite/regles-acces`** 
  - **Description** : Plages horaires autorisées par rôle et périmètres de géorepérage par établissement
  - **Rôles** : admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "plages": [
          {
            "role": "creche | rsai | medecin | parent",
            "jours": [
              1,
              2,
              3,
              4,
              5
            ],
            "debut": "07:00",
            "fin": "19:00",
            "actif": true
          }
        ],
        "geofences": [
          {
            "etablissementId": "string",
            "nom": "string",
            "lat": 0,
            "lng": 0,
            "rayonM": 150,
            "roles": [
              "rsai"
            ]
          }
        ]
      }
    }
    ```


- [*] **`PUT /securite/regles-acces`** 
  - **Description** : Enregistrer les plages horaires et périmètres
  - **Rôles** : admin
  - **Body attendu** :

    ```json
    {
      "plages": "[...] (même format que GET)",
      "geofences": "[...]"
    }
    ```


- [*] **`POST /securite/verifier-acces`** 
  - **Description** : Vérifie, avant d'ouvrir un dossier, l'horaire et la position de l'utilisateur. Journalise un refus et alerte l'admin.
  - **Rôles** : creche, rsai
  - **Body attendu** :

    ```json
    {
      "enfantId": "string",
      "lat": 0,
      "lng": 0,
      "device": "string (user agent)"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "autorise": true,
        "motif": "hors_plage | hors_zone | null",
        "distanceM": 0
      }
    }
    ```


- [*] **`GET /securite/alertes`** 
  - **Description** : Tentatives d'accès hors plage horaire ou hors zone
  - **Rôles** : admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "user": {
            "prenom": "string",
            "nom": "string",
            "role": "string"
          },
          "motif": "hors_plage | hors_zone",
          "adresse_ip": "string",
          "device": "string",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /logs/securite`** 
  - **Description** : Collection logs_securite : action, utilisateur, IP et appareil
  - **Rôles** : admin, dev
  - **Paramètres** : `?action=consultation_dossier|modification_dossier|tentative_connexion|acces_refuse&enfantId=`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "utilisateur": {
            "prenom": "string",
            "nom": "string",
            "role": "string"
          },
          "action": "consultation_dossier | modification_dossier | tentative_connexion | acces_refuse",
          "enfant": {
            "_id": "string",
            "prenom": "string"
          },
          "date": "ISO date",
          "adresse_ip": "string",
          "device": "Samsung Galaxy S22"
        }
      ]
    }
    ```


- [*] **`GET /logs/securite/enfant/:enfantId`** 
  - **Description** : Qui a consulté / modifié le dossier de cet enfant
  - **Rôles** : admin, creche, parent
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "utilisateur": {
            "prenom": "string",
            "nom": "string",
            "role": "string"
          },
          "action": "string",
          "date": "ISO date",
          "adresse_ip": "string",
          "device": "string"
        }
      ]
    }
    ```


- [*] **`POST /auth/login (rôle « parent »)`** 
  - **Description** : La connexion doit renvoyer user.role = « parent » et l'espace parent doit être autorisé (MFA par SMS).
  - **Rôles** : parent
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "user": {
          "_id": "string",
          "role": "parent",
          "telephone": "string"
        },
        "accessToken": "string"
      }
    }
    ```


- [*] **`POST /developer/support/tickets`** 
  - **Description** : Tout compte (bêta) peut ouvrir un ticket vers le développeur. Joindre automatiquement page, rôle, navigateur.
  - **Rôles** : creche, rsai, medecin, parent, admin, dev
  - **Body attendu** :

    ```json
    {
      "titre": "string",
      "description": "string",
      "priorite": "basse | normale | haute | urgente",
      "categorie": "bug | question | suggestion",
      "page": "/enfants/…",
      "device": "Chrome macOS",
      "capture": "fichier image (optionnel, multipart)"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "numero": "TCK-0042",
        "statut": "ouvert"
      }
    }
    ```


- [*] **`GET /developer/support/tickets/mine`** 
  - **Description** : Tickets ouverts par l'utilisateur connecté
  - **Rôles** : creche, rsai, medecin, parent, admin
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "numero": "string",
          "titre": "string",
          "statut": "ouvert | en_cours | resolu",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /rsai/me/affectations`** 
  - **Description** : Crèches où la RSAI est affectée, avec ses horaires de travail par jour et le périmètre GPS
  - **Rôles** : rsai
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "etablissement": {
            "_id": "string",
            "nom": "string",
            "adresse": "string",
            "lat": 0,
            "lng": 0,
            "rayonM": 150
          },
          "horaires": [
            {
              "jour": 1,
              "debut": "08:00",
              "fin": "12:00"
            }
          ],
          "dateDebut": "ISO date",
          "dateFin": "ISO date | null",
          "enfants": 0
        }
      ]
    }
    ```


- [*] **`POST /rsai/:rsaiId/avis`** 
  - **Description** : La crèche note une RSAI (1 à 5) avec un commentaire. GET /rsai doit renvoyer noteMoyenne et nbAvis.
  - **Rôles** : creche
  - **Body attendu** :

    ```json
    {
      "note": 4,
      "commentaire": "string"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "noteMoyenne": 4.5,
        "nbAvis": 12
      }
    }
    ```


- [*] **`POST /abonnements/checkout-session`** 
  - **Description** : Crée une session de paiement Stripe pour changer de formule ; renvoie l'URL Stripe Checkout. Un webhook Stripe (POST /webhooks/stripe) met ensuite l'abonnement à jour.
  - **Rôles** : creche, rsai, medecin, parent
  - **Body attendu** :

    ```json
    {
      "plan": "essentiel | premium | entreprise",
      "periodicite": "mensuel | annuel"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "url": "https://checkout.stripe.com/…",
        "sessionId": "cs_test_…"
      }
    }
    ```


- [*] **`POST /abonnements/portail`** 
  - **Description** : Lien vers le portail client Stripe (carte, factures, résiliation)
  - **Rôles** : creche, rsai, medecin, parent
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "url": "https://billing.stripe.com/…"
      }
    }
    ```


- [*] **`PUT /abonnements/:abonnementId/attribuer`** 
  - **Description** : L'admin attribue ou change la formule d'un compte sans paiement (geste commercial, essai)
  - **Rôles** : admin
  - **Body attendu** :

    ```json
    {
      "plan": "string",
      "dateFin": "ISO date",
      "gratuit": true
    }
    ```


- [*] **`POST /users/me/avatar`** 
  - **Description** : Photo de profil (multipart, champ « photo », jpg/png ≤ 2 Mo). L'utilisateur renvoyé par /auth/me doit contenir avatarUrl.
  - **Rôles** : creche, rsai, medecin, parent, admin, dev
  - **Body attendu** :

    ```json
    {
      "multipart/form-data": {
        "photo": "fichier image"
      }
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "avatarUrl": "URL"
      }
    }
    ```


- [*] **`GET /rgpd/registre`** 
  - **Description** : Registre des traitements + preuves pour un contrôle CNIL : consentements, demandes, accès aux dossiers, incidents, sous-traitants
  - **Rôles** : dev, admin
  - **Paramètres** : `?du=YYYY-MM-DD&au=YYYY-MM-DD`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "traitements": [
          {
            "nom": "string",
            "finalite": "string",
            "baseLegale": "string",
            "duree": "string"
          }
        ],
        "consentements": 0,
        "demandes": 0,
        "accesDossiers": 0,
        "incidents": [
          {
            "date": "ISO date",
            "description": "string",
            "notifieCnil": false
          }
        ]
      }
    }
    ```


- [*] **`GET /rgpd/export`** 
  - **Description** : Export complet (CSV/JSON/PDF) des journaux d'accès, consentements et demandes RGPD sur une période
  - **Rôles** : dev, admin
  - **Paramètres** : `?type=logs|consentements|demandes|tout&format=csv|json|pdf&du=&au=`
  - **Réponse attendue** :

    ```json
    "fichier"
    ```


- [*] **`GET /documents/accessibles`** 
  - **Description** : Documents accessibles : enfants liés uniquement ; admin supervision. Autorisation et URLs privées contrôlées par le serveur.
  - **Rôles** : medecin, parent, admin, dev
  - **Paramètres** : `?enfantId=&type=Ordonnance`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "nom": "string",
          "type": "string",
          "enfant": {
            "_id": "string",
            "prenom": "string",
            "nom": "string"
          },
          "dateValidite": "ISO date | null",
          "statut": "valide | en_attente | rejete",
          "url": "URL privée signée"
        }
      ]
    }
    ```


- [*] **`POST /documents/depot-medical`** 
  - **Description** : Dépôt médecin/parent/admin, ordonnance liée à l'enfant et disponible dans son dossier et ses ordonnances. Valider rôle, liaison, taille et contenu côté serveur.
  - **Rôles** : medecin, parent, admin, dev
  - **Body attendu** :

    ```json
    {
      "multipart/form-data": {
        "fichier": "PDF/JPG/PNG ≤10 Mo",
        "type": "Ordonnance | autre type",
        "enfant": "enfantId obligatoire",
        "dateValidite": "YYYY-MM-DD optionnel"
      }
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "ordonnanceId": "string si ordonnance",
        "nom": "string",
        "type": "string",
        "enfant": {
          "_id": "string"
        },
        "statut": "en_attente",
        "dateValidite": "ISO date | null",
        "createdAt": "ISO date",
        "url": "URL privée signée"
      }
    }
    ```


- [*] **`GET /documents/alertes`** 
  - **Description** : Pièces obligatoires manquantes (selon établissement/PAI), rejetées, expirées ou expirant sous 30 jours. Déduire les obligations du serveur ; notifier les destinataires liés. Admin : supervision globale.
  - **Rôles** : creche, rsai, medecin, parent, admin, dev
  - **Paramètres** : `?enfantId=&etablissementId=&horizonJours=30`
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "enfant": {
            "_id": "string",
            "prenom": "string",
            "nom": "string"
          },
          "type": "string",
          "motif": "manquant | rejete | expire | expiration_proche",
          "dateValidite": "ISO date | null",
          "documentId": "string | null"
        }
      ]
    }
    ```


- [*] **`POST /etablissements/:etablissementId/avis-rsai`** 
  - **Description** : Une RSAI affectée peut noter un établissement de 1 à 5 ; un avis par auteur/établissement (mise à jour). Admin peut superviser.
  - **Rôles** : rsai
  - **Body attendu** :

    ```json
    {
      "note": 4,
      "commentaire": "string"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "noteMoyenne": 4.5,
        "nbAvis": 12
      }
    }
    ```


- [*] **`GET /coordination/avis`** 
  - **Description** : Avis réciproques crèche/RSAI : filtre selon rôle ; admin supervise tous les avis.
  - **Rôles** : creche, rsai, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "cibleType": "rsai | etablissement",
          "cibleId": "string",
          "cibleNom": "string",
          "auteurNom": "string",
          "auteurRole": "creche | rsai",
          "note": 4,
          "commentaire": "string",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`GET /coordination/affectations`** 
  - **Description** : Affectations RSAI : admin toutes, crèche les siennes, RSAI ses affectations. Contrôle serveur.
  - **Rôles** : creche, rsai, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "rsai": {
            "_id": "string",
            "nom": "string"
          },
          "etablissement": {
            "_id": "string",
            "nom": "string"
          },
          "jours": [
            1,
            2,
            3,
            4,
            5
          ],
          "debut": "08:00",
          "fin": "18:00",
          "dateDebut": "YYYY-MM-DD",
          "dateFin": "YYYY-MM-DD | null",
          "statut": "active | revoquee"
        }
      ]
    }
    ```


- [*] **`POST /coordination/affectations`** 
  - **Description** : Admin uniquement : affecter une RSAI à une crèche et définir ses jours/horaires et dates. Alimente /rsai/me/affectations et le contrôle d'accès serveur.
  - **Rôles** : admin, dev
  - **Body attendu** :

    ```json
    {
      "rsaiId": "string",
      "etablissementId": "string",
      "jours": [
        1,
        2,
        3,
        4,
        5
      ],
      "debut": "08:00",
      "fin": "18:00",
      "dateDebut": "YYYY-MM-DD",
      "dateFin": "YYYY-MM-DD optionnel",
      "demandeId": "string optionnel"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "statut": "active"
      }
    }
    ```


- [*] **`DELETE /coordination/affectations/:affectationId`** 
  - **Description** : Révoquer une affectation (admin) ; retirer immédiatement les droits associés et journaliser.
  - **Rôles** : admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "statut": "revoquee"
      }
    }
    ```


- [*] **`GET /coordination/demandes-rsai`** 
  - **Description** : Crèche : ses demandes ; admin : toutes les demandes d'intervention RSAI.
  - **Rôles** : creche, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "etablissement": {
            "_id": "string",
            "nom": "string"
          },
          "rsaiId": "string | null",
          "motif": "string",
          "dateSouhaitee": "YYYY-MM-DD",
          "statut": "en_attente | acceptee | refusee",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`POST /coordination/demandes-rsai`** 
  - **Description** : La crèche demande une RSAI (préférence facultative). Déduire son établissement de la session et notifier l'admin.
  - **Rôles** : creche
  - **Body attendu** :

    ```json
    {
      "rsaiId": "string optionnel",
      "motif": "string",
      "dateSouhaitee": "YYYY-MM-DD"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "statut": "en_attente"
      }
    }
    ```


- [*] **`PATCH /coordination/demandes-rsai/:demandeId`** 
  - **Description** : Admin traite une demande : refuser avec motif ou accepter avec affectationId existant. Notifier la crèche.
  - **Rôles** : admin, dev
  - **Body attendu** :

    ```json
    {
      "statut": "acceptee | refusee",
      "motif": "string",
      "affectationId": "string si acceptee"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "statut": "string"
      }
    }
    ```


- [*] **`GET /enfants/:enfantId/notes`** 
  - **Description** : Notes crèche/médecin : publiques = acteurs liés (pas Internet), médicales = professionnels autorisés uniquement. Filtrage, consentement et journalisation côté serveur ; admin supervisé.
  - **Rôles** : creche, rsai, medecin, parent, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "contenu": "string",
          "visibilite": "publique | medicale",
          "auteurNom": "string",
          "auteurRole": "creche | medecin",
          "destinataire": "creche",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`POST /enfants/:enfantId/notes`** 
  - **Description** : Crèche/médecin publie une note publique ou médicale ; médecin envoie à la crèche liée, notification et trace d'accès.
  - **Rôles** : creche, medecin
  - **Body attendu** :

    ```json
    {
      "contenu": "string",
      "visibilite": "publique | medicale",
      "destinataire": "creche | medecin"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "createdAt": "ISO date"
      }
    }
    ```


- [*] **`GET /enfants/:enfantId/echanges-documents`** 
  - **Description** : Demandes et envois entre médecin/crèche/parents liés ; expéditeur/destinataire seulement, professionnels autorisés et supervision admin.
  - **Rôles** : creche, medecin, parent, rsai, admin, dev
  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "string",
          "action": "demande | envoi",
          "type": "string",
          "destinataire": "creche | parent | medecin",
          "expediteurRole": "string",
          "message": "string",
          "documentId": "string | null",
          "statut": "en_attente | envoye | recu",
          "echeance": "YYYY-MM-DD | null",
          "createdAt": "ISO date"
        }
      ]
    }
    ```


- [*] **`POST /enfants/:enfantId/echanges-documents`** 
  - **Description** : Médecin demande/envoie un document à la crèche ou aux parents ; réponse crèche/parent au médecin. Pour envoi : documentId déjà téléversé, enfant identique et partage autorisé. Notifier et journaliser côté serveur.
  - **Rôles** : creche, medecin, parent
  - **Body attendu** :

    ```json
    {
      "action": "demande | envoi",
      "destinataire": "creche | parent | medecin",
      "type": "string",
      "message": "string",
      "documentId": "string obligatoire pour envoi",
      "demandeId": "string optionnel (réponse)",
      "echeance": "YYYY-MM-DD optionnel"
    }
    ```

  - **Réponse attendue** :

    ```json
    {
      "success": true,
      "data": {
        "_id": "string",
        "statut": "en_attente | envoye",
        "createdAt": "ISO date"
      }
    }
    ```


