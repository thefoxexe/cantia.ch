# Planning ↔ Google Agenda / Outlook : mise en service

Chaque personne connecte **son** agenda dans *Planning › Mes agendas*.
- Ce qu'elle planifie dans Cantia est écrit dans son agenda.
- Ses rendez-vous de l'agenda arrivent dans son planning, en privé : les collègues voient seulement « Rendez-vous privé ».

La synchronisation se fait :
- à l'ouverture du planning ;
- à chaque création ou modification d'événement ;
- avec le bouton « Synchroniser ».

Côté serveur, tout passe par une seule fonction : `supabase/functions/calendar-sync`. La migration correspondante est `20261007140000_calendar_sync.sql`. Les jetons d'accès sont gardés dans Supabase Vault, jamais dans une table lisible par l'app.

**Adresse de retour à déclarer chez Google et chez Microsoft** (identique pour les deux) :

```
https://krijilwxhdlzflvnvrtl.supabase.co/functions/v1/calendar-sync
```

## 1. Google (Google Cloud Console)

1. Va sur https://console.cloud.google.com et crée un projet, par exemple « Cantia ».
2. Active l'API Google Calendar : *API et services › Bibliothèque › Google Calendar API › Activer*.
3. Configure l'écran de consentement OAuth (*API et services › Écran de consentement OAuth*) :
   - type d'utilisateurs : **Externe** ;
   - nom de l'application : Cantia ; e-mail d'assistance ; logo ;
   - domaines autorisés : `cantia.ch` et `supabase.co` ;
   - page d'accueil `https://cantia.ch`, règles de confidentialité `https://cantia.ch/confidentialite` ;
   - champs d'application (scopes) : `openid`, `email`, `https://www.googleapis.com/auth/calendar.events`.
4. Ajoute des utilisateurs de test. Tant que l'application est « en test », seuls ces comptes Google peuvent se connecter (100 maximum).
5. Crée les identifiants : *Identifiants › Créer des identifiants › ID client OAuth* :
   - type : **Application Web** ;
   - URI de redirection autorisés : l'adresse de retour ci-dessus.

   Tu obtiens un **ID client** et un **code secret client**.
6. Pour ouvrir l'application à tout le monde, demande la **validation Google** (*Publier l'application*). Le champ `calendar.events` est « sensible » : Google demande une courte vidéo montrant l'usage et vérifie les pages du domaine. Il faut compter de quelques jours à quelques semaines.

## 2. Microsoft (portail Azure / Entra)

1. Va sur https://entra.microsoft.com, puis *Applications › Inscriptions d'applications › Nouvelle inscription* :
   - nom : Cantia ;
   - types de comptes : **comptes dans n'importe quel annuaire organisationnel et comptes Microsoft personnels** (pour Outlook.com, Hotmail et Microsoft 365) ;
   - URI de redirection : plateforme **Web**, avec l'adresse de retour ci-dessus.
2. Note l'**ID d'application (client)** affiché sur la page de l'application.
3. *Certificats et secrets › Nouveau secret client* : copie tout de suite la **valeur**, elle n'est montrée qu'une fois. Note aussi sa date d'expiration (24 mois au maximum) et mets un rappel pour la renouveler.
4. *Autorisations de l'API › Ajouter une autorisation › Microsoft Graph › Autorisations déléguées* :
   - ajoute `offline_access`, `openid`, `email`, `User.Read` et `Calendars.ReadWrite` ;
   - il n'y a pas de consentement administrateur à donner : chaque personne accepte pour elle-même.
5. Optionnel : *Personnalisation et propriétés*, ajoute le logo et l'éditeur vérifié (Microsoft Partner Network). Sans éditeur vérifié, l'écran de connexion affiche « non vérifié », mais la connexion fonctionne.

## 3. Mettre les clés dans Supabase

Dans *Supabase › Project Settings › Edge Functions › Secrets*, ajoute ces quatre secrets :

| Nom | Valeur |
|---|---|
| `GOOGLE_CALENDAR_CLIENT_ID` | ID client Google |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | code secret client Google |
| `MICROSOFT_CALENDAR_CLIENT_ID` | ID d'application Microsoft |
| `MICROSOFT_CALENDAR_CLIENT_SECRET` | valeur du secret Microsoft |

Il n'y a rien à redéployer : la fonction lit ces secrets à chaque appel. Tant qu'ils manquent, le bouton « Connecter » affiche « La connexion des agendas n'est pas encore configurée côté serveur ».

## 4. Tester

1. Dans app.cantia.ch, ouvre *Planning › Mes agendas › Google Agenda › Connecter*, accepte, puis tu reviens sur le planning avec « Agenda connecté ».
2. Crée un événement dans Cantia : il apparaît dans Google Agenda en quelques secondes.
3. Crée un rendez-vous dans Google Agenda, puis rouvre le planning : il est là, en privé.
4. Refais les mêmes étapes avec Outlook.

## Règles de synchronisation

- **Dans quel agenda va un événement** : il va dans l'agenda de la personne concernée (le membre), même s'il a été créé par un administrateur.
- **Événement créé dans Cantia** : Cantia fait foi. Une modification faite dans l'agenda n'est pas reprise ; une modification dans Cantia remplace celle de l'agenda.
- **Rendez-vous importé de l'agenda** : l'agenda fait foi. S'il est supprimé dans l'agenda, il disparaît du planning.
- **Période couverte** : les 30 derniers jours et l'année à venir.
- **Deux agendas connectés** : un rendez-vous importé de Google n'est pas recopié dans Outlook, et inversement.
- **Déconnexion** : les rendez-vous importés de cet agenda disparaissent du planning ; ce que Cantia a écrit dans l'agenda y reste.
