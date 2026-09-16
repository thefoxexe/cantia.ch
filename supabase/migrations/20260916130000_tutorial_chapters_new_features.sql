-- Catches the tutorial shooting plan up with features shipped since the
-- original 20260903180000 seed: situations de chantier, live tablet
-- signature on travaux supplémentaires, and the CSV/Excel data-migration
-- tool. Also extends chapter 14's script to mention the automatic daily
-- report setting added alongside it. Purely additive/update — no schema
-- change, same tutorial_chapters table.

update public.tutorial_chapters
set talking_points = talking_points || $$
Montrer le réglage dans les paramètres du chantier qui active la génération automatique quotidienne du rapport, avec relance du chef d'équipe s'il n'a encore rien envoyé.$$
where title = $$Rapport de chantier généré par IA$$;

insert into public.tutorial_chapters (order_index, feature_area, title, talking_points) values

(28, $$Chantiers$$, $$Signature en direct sur tablette (travaux supplémentaires)$$, $$Sur un travail supplémentaire créé depuis le chantier, montrer le bouton « Faire signer maintenant » à côté de l'envoi par lien.
Montrer le client qui signe directement du doigt sur la tablette, sans quitter l'écran.
Montrer le PDF final généré avec la signature intégrée, déjà enregistré côté chantier.$$),

(29, $$Facturation$$, $$Situations de chantier (facturation progressive)$$, $$Montrer la création d'une situation à partir d'un chantier en cours : pourcentage d'avancement saisi poste par poste du devis.
Montrer le calcul automatique du montant à facturer, avec déduction des situations déjà envoyées.
Sur un chantier long, montrer 2-3 situations successives jusqu'au solde final — le cas d'usage principal.$$),

(30, $$Migration$$, $$Importer ses données depuis un ancien logiciel$$, $$Montrer l'import d'un fichier CSV/Excel exporté d'un ancien outil : clients, devis, factures ou dépenses.
Montrer le mappage des colonnes assisté par IA — les bons champs sont proposés automatiquement, à corriger si besoin.
Rappeler que c'est pensé pour reprendre un historique complet, utile pour rester conforme SIA 450/451.$$);
