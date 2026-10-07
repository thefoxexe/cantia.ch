# Skills du projet

## Sécurité (copiés depuis un dépôt externe)

Source : https://github.com/mukul975/Anthropic-Cybersecurity-Skills
(commit `54a798831d2266a3ca61ce68a7acb80b81160d57`, licence Apache 2.0).
Ce dépôt n'est **pas** publié par Anthropic, malgré son nom. Seuls ces trois skills ont été
copiés, après relecture complète de chaque fichier :

- `conducting-api-security-testing` : tests d'API (droits d'accès, BOLA/BFLA, jetons, exposition de données).
- `performing-security-headers-audit` : en-têtes HTTP (CSP, HSTS, cadres, cookies).
- `implementing-secret-scanning-with-gitleaks` : recherche de secrets dans le dépôt.

Règles pour Cantia :

- Ne jamais lancer `conducting-api-security-testing/scripts/agent.py` contre la prod
  (app.cantia.ch, projet Supabase de prod) : il envoie 50 tentatives de connexion d'affilée et
  des requêtes d'écriture. Seulement contre une copie de test, avec l'accord du propriétaire.
- L'audit des en-têtes ne fait que lire les réponses : il peut viser app.cantia.ch et cantia.ch.
- Un secret trouvé par gitleaks ne doit jamais être recopié dans un message, un commit ou un
  rapport : on donne le fichier et la ligne, puis on le fait révoquer.
- Pour mettre à jour un skill, recopier depuis la source puis relire le diff avant de commiter.
