# AMR — Maquette de démonstration (services interactifs)

Prototype d'application web sur mesure conçu pour présenter à **AMR (Aménagement Maçonnerie Rénovation)**,
maçon, paysagiste et constructeur de piscines à **Mours-Saint-Eusèbe (Drôme)**, trois fonctionnalités
qui manquent à leur site actuel ([amr-piscines.fr](https://amr-piscines.fr)).

> ⚠️ Maquette de démonstration non officielle. Reprend le **nom**, le **logo** et les **couleurs réelles**
> de l'entreprise (vert `#07A91F`, ardoise `#232D35`) à des fins de présentation commerciale.

## Les 3 fonctionnalités démontrées

1. **Devis intelligent multi-métiers** (`devis.html`)
   Un formulaire en 3 étapes qui **s'adapte automatiquement au métier choisi** (piscine, terrassement,
   maçonnerie, clôture, allées, plantation, bassin, entretien) et calcule une **fourchette de prix immédiate**.
   → remplace l'unique formulaire générique du site actuel.

2. **Galerie de réalisations catégorisée** (`realisations.html`)
   Galerie **filtrable par type de prestation** (avec compteurs) et visionneuse plein écran.
   → remplace la galerie non triée du site actuel.

3. **Prise de rendez-vous en ligne + suivi de projet** (`rendez-vous.html` & `suivi.html`)
   Réservation d'un créneau (visite technique, dépannage, conseil) avec confirmation immédiate,
   puis **suivi de l'avancement du projet** étape par étape via un numéro de dossier.
   → fonctionnalités totalement absentes du site actuel.

## Lancer le projet

Aucune dépendance, aucun build. Ouvrez simplement `index.html` dans un navigateur.

Pour une navigation optimale (liens entre pages), vous pouvez aussi servir le dossier :

```bash
# avec Python
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Parcours de démonstration conseillé

1. **Accueil** → présentation et accès aux 3 outils.
2. **Devis en ligne** → choisir « Piscines & spas », saisir les dimensions, voir l'estimation,
   valider → un **numéro de dossier** est généré.
3. **Suivi de projet** → le dossier s'affiche automatiquement ; cliquer sur
   « Faire avancer l'étape (démo) » pour illustrer le suivi en temps réel.
4. **Rendez-vous** → choisir un jour + créneau, confirmer.
5. **Réalisations** → filtrer par catégorie.

## Détails techniques

- **Stack** : HTML / CSS / JavaScript pur (zéro dépendance).
- **Données** : stockées localement dans le navigateur (`localStorage`) pour rendre la démo
  fonctionnelle sans backend. En production, ces flux seraient connectés à une base de données,
  un agenda (Google Calendar/Outlook) et des notifications e-mail/SMS.
- **Structure** :
  ```
  index.html            Accueil
  devis.html            Devis intelligent
  realisations.html     Galerie filtrable
  rendez-vous.html      Réservation de créneau
  suivi.html            Suivi de projet
  assets/css/style.css  Design system (couleurs AMR)
  assets/js/            Logique par page (app, devis, galerie, rdv, suivi)
  assets/img/           Logo, favicon et photos
  ```

## Passer en production (rendre le site opérationnel)

Le site est livrable en l'état. Pour qu'AMR reçoive et gère réellement les demandes :

### 1. Activer la réception des demandes par e-mail (5 min, gratuit)
1. Aller sur [web3forms.com](https://web3forms.com), saisir l'e-mail d'AMR et récupérer une **clé d'accès** gratuite.
2. Ouvrir `assets/js/app.js` et compléter l'objet `CONFIG` :
   ```js
   const CONFIG = {
     formAccessKey: "VOTRE-CLE-WEB3FORMS",      // colle la clé ici
     notifyEmail: "contact@amr-piscines.fr",     // e-mail de réception
     adminPin: "un-code-secret",                  // code de l'espace pro
   };
   ```
   → Dès qu'une demande de devis ou un rendez-vous est envoyé, **AMR reçoit un e-mail** détaillé.
   Tant que `formAccessKey` est vide, le site reste en mode démo (enregistrement local uniquement).

### 2. Espace professionnel (`admin.html`)
- Accessible via le lien « Espace pro » en bas de page, protégé par le code `adminPin`.
- Permet de **voir toutes les demandes**, changer le **statut d'avancement** d'un chantier (ce qui met à jour le suivi côté client) et **exporter en CSV**.

### 3. Mettre en ligne
- Glisser-déposer le dossier sur [Netlify Drop](https://app.netlify.com/drop) → URL publique immédiate.
- Ou brancher sur le domaine d'AMR / un sous-domaine (`devis.amr-piscines.fr`) via les DNS.

### 4. À compléter avant livraison
- Renseigner les **mentions légales** réelles dans `mentions-legales.html` (SIRET, hébergeur).
- Créer les comptes (hébergement, Web3Forms) **au nom d'AMR** pour qu'ils en soient propriétaires.

### Limites de cette version (et évolution)
- Le **suivi de projet** et l'**espace pro** lisent les données du navigateur (localStorage). Les e-mails Web3Forms
  garantissent qu'AMR reçoit **chaque** demande. Pour un suivi partagé multi-appareils et un vrai espace client
  sécurisé, l'étape suivante consiste à brancher une base de données (ex. Supabase/Airtable) et une authentification —
  l'architecture du code est prête pour cette évolution.

## Pistes d'évolution (argumentaire commercial)

- Connexion à un vrai agenda et envoi automatique de rappels SMS/e-mail.
- Tableau de bord interne pour qu'AMR mette à jour l'avancement des chantiers.
- Upload de photos de chantier visibles par le client dans son suivi.
- Signature électronique du devis.
