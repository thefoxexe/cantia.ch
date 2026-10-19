-- Cantia Maquette is renamed Cantia Panorama (module key stays 'relief').
update public.modules
set name = 'Cantia Panorama',
    description = 'Toute l’entreprise en direct et en 3D : projets à leur étape, équipes du jour, process prérempli depuis le site, relié au planning, aux tâches et à la facturation.'
where key = 'relief';
