/* ==========================================================================
   site.js : moteur du site « Cartographie de nuit »
   Rend index, pages app, contact et à propos. FR / EN.
   Les pages légales des apps iPhone restent servies par site-pages.js, intactes.
   ========================================================================== */
(function () {
    'use strict';

    var MAIL = 'rodolphe_vandaele@hotmail.fr';
    var LIBERAPAY = 'https://liberapay.com/Rodolphe_Vandaele/donate';
    var GITHUB_MACTUNER = 'https://github.com/Bodyroro/MacTuner';
    var GITHUB_DNSTUNER = 'https://github.com/Bodyroro/DNSTuner';
    var STORE = 'https://apps.apple.com/fr/app/';

    /* ---------------------------------------------------------------------
       Langue
       --------------------------------------------------------------------- */
    function detectLang() {
        var q = new URLSearchParams(location.search).get('lang');
        if (q === 'fr' || q === 'en') { try { localStorage.setItem('v2lang', q); } catch (e) {} return q; }
        try {
            var s = localStorage.getItem('v2lang');
            if (s === 'fr' || s === 'en') return s;
        } catch (e) {}
        var nav = (navigator.language || 'fr').slice(0, 2);
        return nav === 'fr' ? 'fr' : 'en';
    }
    var lang = detectLang();
    function setLang(l) {
        if (l === lang) return;
        lang = l;
        try { localStorage.setItem('v2lang', l); } catch (e) {}
        var url = new URL(location.href);
        url.searchParams.set('lang', l);
        history.replaceState(null, '', url);
        render();
    }
    function pick(o) { return o[lang] !== undefined ? o[lang] : o.fr; }
    function withLang(href) {
        if (!href || href.indexOf('http') === 0 || href.indexOf('mailto:') === 0) return href;
        var hash = '', base = href, hi = href.indexOf('#');
        if (hi !== -1) { hash = href.slice(hi); base = href.slice(0, hi); }
        return base + (base.indexOf('?') === -1 ? '?' : '&') + 'lang=' + lang + hash;
    }

    /* ---------------------------------------------------------------------
       Contenus
       --------------------------------------------------------------------- */
    var T = {
        /* Les deux entrées nomment l'appareil, pas la plateforme : « Apps iOS »
           et « macOS » ne formaient pas une paire, et un visiteur cherche un
           iPhone ou un Mac, pas un nom de système. */
        navIOS: { fr: 'iPhone', en: 'iPhone' },
        navMac: { fr: 'Mac', en: 'Mac' },
        navAbout: { fr: 'À propos', en: 'About' },
        navContact: { fr: 'Contact', en: 'Contact' },
        navSupport: { fr: 'Soutenir', en: 'Support' },
        brandSub: { fr: 'Développeur indépendant', en: 'Independent developer' },

        heroChip1: { fr: '{n} apps en ligne', en: '{n} apps live' },
        heroChip2: { fr: 'iPhone et Mac', en: 'iPhone and Mac' },
        heroChip3: { fr: 'Fait en France', en: 'Made in France' },
        /* Le héro n'appartient plus à une gamme : la carte de France est
           descendue dans la section iPhone, à laquelle elle appartient. Ce qui
           reste ici doit valoir pour les deux, sans en avantager aucune. */
        heroTitle: {
            fr: 'Deux gammes, <em>un seul principe</em>.',
            en: 'Two ranges, <em>one principle</em>.'
        },
        heroLead: {
            fr: 'Des applications natives qui font une chose et la font bien, sans compte, sans traceur et sans dépendance. Sur iPhone, les services publics français du quotidien. Sur Mac, des utilitaires libres dont le code est entièrement ouvert.',
            en: 'Native apps that do one thing and do it well, with no account, no tracker and no dependency. On iPhone, everyday French public services. On Mac, free utilities whose code is fully open.'
        },
        heroCTA1: { fr: 'Les apps iPhone', en: 'The iPhone apps' },
        heroCTA2: { fr: 'Les apps Mac', en: 'The Mac apps' },
        scrollHint: { fr: 'Explorer', en: 'Explore' },
        skipLink: { fr: 'Aller au contenu', en: 'Skip to content' },

        statsEyebrow: { fr: 'En chiffres', en: 'By the numbers' },
        stats: {
            fr: [
                ['{n}', 'applications publiées', '{ios} sur iPhone via l’App Store, {mac} sur Mac en open source sur GitHub.'],
                ['2', 'plateformes natives', 'iPhone et Mac, développées en SwiftUI, sans framework tiers.'],
                ['11', 'langues traduites', 'Interfaces entièrement localisées, du français à l’arabe.'],
                ['0', 'compte requis', 'Aucune inscription ni donnée personnelle collectée.']
            ],
            en: [
                ['{n}', 'published apps', '{ios} on iPhone via the App Store, {mac} on Mac as open source on GitHub.'],
                ['2', 'native platforms', 'iPhone and Mac, built in SwiftUI, no third-party frameworks.'],
                ['11', 'translated languages', 'Fully localized interfaces, from French to Arabic.'],
                ['0', 'accounts required', 'No sign-up and no personal data collected.']
            ]
        },

        iosTitle: { fr: 'Quatre applications conçues pour la France.', en: 'Four apps built for France.' },
        iosLead: {
            fr: 'Les services publics français du quotidien, sur la carte et hors connexion. Interface native SwiftUI, données publiques officielles, résultats géolocalisés. Aucun compte, aucune inscription.',
            en: 'Everyday French public services, on the map and offline. Native SwiftUI interface, official public data, geolocated results. No account, no sign-up.'
        },
        /* Un point par application, comme la section Mac : les deux gammes se
           présentent exactement de la même façon. */
        iosPoints: {
            fr: [
                ['CarbuFrance', 'Le prix des carburants station par station, avec carnet de bord et widget.'],
                ['IRVEFrance', 'Les bornes de recharge, leur puissance, leurs connecteurs et leur disponibilité.'],
                ['ToiletteFrance', 'Les toilettes publiques, leurs horaires et leur accessibilité.'],
                ['DefibFrance', 'Les défibrillateurs, avec mode Urgence et guide de réanimation.']
            ],
            en: [
                ['CarbuFrance', 'Fuel prices station by station, with a logbook and a widget.'],
                ['IRVEFrance', 'EV chargers, their power, connectors and availability.'],
                ['ToiletteFrance', 'Public toilets, their opening hours and accessibility.'],
                ['DefibFrance', 'Defibrillators, with an Emergency mode and a CPR guide.']
            ]
        },
        iosCTA: { fr: 'Les quatre applications', en: 'The four apps' },
        iosMore: { fr: 'Voir l’interface', en: 'See the interface' },
        iosRequires: { fr: 'Gratuit · iPhone et iPad · iOS 18 et plus', en: 'Free · iPhone and iPad · iOS 18 and later' },
        iosStore: { fr: 'Sur l’App Store', en: 'On the App Store' },
        iosPage: { fr: 'Ouvrir la page', en: 'Open the page' },
        showcaseEyebrow: { fr: 'Aperçu produit', en: 'Product preview' },
        showcaseTitle: { fr: 'Un aperçu de l’interface.', en: 'A preview of the interface.' },
        showcaseLead: {
            fr: 'Sélectionnez une application pour voir sa carte, ses filtres et sa navigation.',
            en: 'Select an app to see its map, filters and navigation.'
        },

        /* Blocs du circuit macOS, pendants des noms de villes de la carte. */
        macShowEyebrow: { fr: 'Aperçu produit', en: 'Product preview' },
        macShowTitle: { fr: 'Un aperçu de l’interface.', en: 'A preview of the interface.' },
        macShowLead: {
            fr: 'Sélectionnez un utilitaire pour voir son tableau de bord, ses réglages et sa navigation.',
            en: 'Select a utility to see its dashboard, settings and navigation.'
        },
        rigLabels: { fr: ['APPLE SILICON', 'MÉMOIRE', 'RÉSEAU', 'STOCKAGE'],
                     en: ['APPLE SILICON', 'MEMORY', 'NETWORK', 'STORAGE'] },
        macTitle: { fr: 'Deux utilitaires pour votre Mac Apple Silicon.', en: 'Two utilities for your Apple Silicon Mac.' },
        macLead: {
            fr: 'Contrairement aux apps iPhone, celles-ci ne sont pas limitées à la France : elles fonctionnent sur tous les Mac Apple Silicon. Applications natives, libres et open source, chacune sur un sujet précis, sans compte, sans publicité et sans dépendance.',
            en: 'Unlike the iPhone apps, these are not tied to France: they run on any Apple Silicon Mac. Native, free and open source apps, each on one precise subject, with no account, no ads and no dependency.'
        },
        macPoints: {
            fr: [
                ['MacTuner', 'Le matériel en temps réel, 34 réglages système réversibles, nettoyage et ventilation.'],
                ['DNSTuner', '46 résolveurs publics, DNS chiffré, et la mesure réelle de ce que chacun bloque.'],
                ['Le point commun', 'Rien d’irréversible, rien de caché, et le code complet sur GitHub.']
            ],
            en: [
                ['MacTuner', 'Hardware in real time, 34 reversible system tweaks, cleanup and fan control.'],
                ['DNSTuner', '46 public resolvers, encrypted DNS, and a real measurement of what each one blocks.'],
                ['What they share', 'Nothing irreversible, nothing hidden, and the full code on GitHub.']
            ]
        },
        macCTA: { fr: 'Les deux utilitaires', en: 'The two utilities' },
        macMore: { fr: 'Voir l’interface', en: 'See the interface' },
        macStore: { fr: 'Sur GitHub', en: 'On GitHub' },
        macPage: { fr: 'Ouvrir la page', en: 'Open the page' },
        macRequires: { fr: 'Gratuit · macOS 26 et 27 · Apple Silicon', en: 'Free · macOS 26 and 27 · Apple Silicon' },

        valuesEyebrow: { fr: 'Engagements', en: 'Commitments' },
        valuesTitle: { fr: 'Les mêmes principes sur iPhone et sur Mac.', en: 'The same principles on iPhone and Mac.' },
        values: {
            fr: [
                ['shield', 'Vie privée locale', 'Aucun compte, aucun traceur. Vos favoris et réglages restent sur votre appareil.'],
                ['map', 'Données publiques', 'Sources ouvertes et officielles, mises en cache pour fonctionner hors connexion.'],
                ['heart', 'Support direct', 'Un développeur indépendant qui répond personnellement à chaque message.']
            ],
            en: [
                ['shield', 'Local privacy', 'No account, no trackers. Your favorites and settings stay on your device.'],
                ['map', 'Public data', 'Open, official sources, cached so everything keeps working offline.'],
                ['heart', 'Direct support', 'An independent developer who answers every message personally.']
            ]
        },

        supportTitle: { fr: 'Les applications sont gratuites. Le soutien est libre.', en: 'The apps are free. Support is voluntary.' },
        supportLead: {
            fr: 'Les applications restent utilisables sans don. Un soutien libre via Liberapay finance les données, les tests, l’hébergement et les mises à jour.',
            en: 'The apps stay usable without donating. Voluntary Liberapay support funds data, testing, hosting and updates.'
        },
        supportCTA: { fr: 'Faire un don libre', en: 'Donate freely' },
        supportNote: {
            fr: 'Un don web ne débloque aucune fonction Premium. Les achats intégrés restent gérés par StoreKit dans les apps.',
            en: 'A web donation unlocks no Premium features. In app purchases remain handled by StoreKit inside the apps.'
        },
        supportWays: {
            fr: [
                ['heart', 'Donner', 'Un don libre, sans contrepartie cachée dans les apps.'],
                ['star', 'Partager', 'Un avis App Store aide chaque app à trouver ses utilisateurs.'],
                ['mail', 'Signaler', 'Un retour précis corrige plus vite données et cas limites.']
            ],
            en: [
                ['heart', 'Donate', 'A free amount donation, no hidden in app advantage.'],
                ['star', 'Share', 'An App Store review helps each app find its users.'],
                ['mail', 'Report', 'Precise feedback fixes data and edge cases faster.']
            ]
        },

        profileEyebrow: { fr: 'À propos', en: 'About' },
        profileBio: {
            fr: 'Développeur autodidacte basé en France, je construis des apps simples, utiles et respectueuses de la vie privée, en privilégiant SwiftUI, MapKit, StoreKit, WidgetKit et les composants natifs Apple pour une expérience cohérente.',
            en: 'Self taught developer based in France, I build simple, useful, privacy minded apps, favoring SwiftUI, MapKit, StoreKit, WidgetKit and native Apple components for a coherent experience.'
        },
        profileCTA: { fr: 'Me contacter', en: 'Get in touch' },
        profileMore: { fr: 'En savoir plus', en: 'Learn more' },

        footerLine: { fr: 'Sur iPhone, les services publics français du quotidien. Sur Mac, des utilitaires libres qui font une chose et la font bien.', en: 'On iPhone, everyday French public services. On Mac, free utilities that do one thing and do it well.' },
        footerSite: { fr: 'Site', en: 'Site' },
        footerTagline: { fr: 'Conçu et développé en France.', en: 'Designed and built in France.' },
        footerVisitors: { fr: 'visiteurs cette semaine', en: 'visitors this week' },

        available: { fr: 'Disponible', en: 'Available' },
        free: { fr: 'Gratuit', en: 'Free' },
        download: { fr: 'Télécharger', en: 'Download' },
        discover: { fr: 'Découvrir', en: 'Discover' },
        supportLink: { fr: 'Assistance', en: 'Support' },
        privacyLink: { fr: 'Confidentialité', en: 'Privacy' },
        backHome: { fr: 'Toutes les apps', en: 'All apps' },

        featEyebrow: { fr: 'Fonctionnalités', en: 'Features' },
        featTitle: { fr: 'Fonctionnalités principales.', en: 'Main features.' },
        shotsEyebrow: { fr: 'Captures réelles', en: 'Real screenshots' },
        shotsTitle: { fr: 'L’application sur iPhone.', en: 'The app on iPhone.' },
        shotsLead: { fr: 'Captures réelles : la carte, la liste et la fiche détaillée avec vue à 360° et guidage.', en: 'Real screenshots: the map, the list and the detailed sheet with 360° view and directions.' },
        dataEyebrow: { fr: 'Données & confidentialité', en: 'Data & privacy' },
        dataTitle: { fr: 'Ce que l’app utilise et ce qui reste sur votre appareil.', en: 'What the app uses and what stays on your device.' },
        dataSources: { fr: 'Sources', en: 'Sources' },
        dataLocal: { fr: 'Données locales', en: 'Local data' },
        dataBusiness: { fr: 'Publicité & achats', en: 'Ads & purchases' },
        dataLocalText: {
            fr: 'Aucun compte utilisateur. Favoris, réglages et cache restent sur l’appareil et disparaissent avec l’app.',
            en: 'No user account. Favorites, settings and cache stay on the device and vanish with the app.'
        },
        legalEyebrow: { fr: 'Documents de l’app', en: 'App documents' },
        legalTitle: { fr: 'Pages légales officielles.', en: 'Official legal pages.' },
        legalNote: {
            fr: 'La politique de confidentialité et l’assistance officielles de l’application, telles que présentées sur l’App Store.',
            en: 'The app’s official privacy policy and support pages, exactly as presented on the App Store.'
        },
        productSupport: { fr: 'Un problème, une question ?', en: 'An issue or a question?' },
        productSupportCTA: { fr: 'Écrire au support', en: 'Write to support' },

        contactEyebrow: { fr: 'Contact', en: 'Contact' },
        contactTitle: { fr: 'Une réponse rapide et personnelle.', en: 'A quick, personal reply.' },
        contactLead: {
            fr: 'Développeur indépendant, je réponds moi-même à chaque message, en général sous 24 à 48 h. Choisissez une application : l’objet et le message sont préremplis.',
            en: 'As an independent developer I answer every message myself, usually within 24 to 48 hours. Pick an app and the subject and message are prefilled.'
        },
        composerTo: { fr: 'À', en: 'To' },
        composerSubject: { fr: 'Objet', en: 'Subject' },
        composerBody: { fr: 'Message', en: 'Message' },
        composerDevice: { fr: 'Appareil', en: 'Device' },
        composerOS: { fr: 'Version du système', en: 'System version' },
        composerAuto: { fr: 'détecté', en: 'detected' },
        composerDevicePh: { fr: 'ex. iPhone 15 Pro', en: 'e.g. iPhone 15 Pro' },
        composerOSPh: { fr: 'ex. iOS 18.2', en: 'e.g. iOS 18.2' },
        composerOpen: { fr: 'Ouvrir dans Mail', en: 'Open in Mail' },
        composerCopy: { fr: 'Copier l’adresse', en: 'Copy address' },
        composerCopied: { fr: 'Adresse copiée ✓', en: 'Address copied ✓' },
        composerHint: { fr: 'Si le bouton n’ouvre pas votre messagerie, copiez l’adresse.', en: 'If the button doesn’t open your mail app, copy the address.' },
        mailSubject: { fr: 'Support', en: 'Support' },
        mailBody: {
            fr: ['Bonjour,', '', 'Application : {app}', 'Version de l’app : ', 'Appareil : {device}', 'Version du système : {os}', 'Langue : {locale}', '', 'Description du problème : ', '', 'Étapes pour reproduire : ', '', 'Capture d’écran jointe si possible.', '', 'Merci.'],
            en: ['Hello,', '', 'App: {app}', 'App version: ', 'Device: {device}', 'System version: {os}', 'Language: {locale}', '', 'Issue description: ', '', 'Steps to reproduce: ', '', 'Screenshot attached if possible.', '', 'Thank you.']
        },
        tipsEyebrow: { fr: 'Message efficace', en: 'Effective message' },
        tipsTitle: { fr: 'Pour une réponse plus rapide.', en: 'For a faster reply.' },
        tips: {
            fr: [
                ['Nommez la version', 'Celle de l’app et celle du système, visibles dans les réglages.'],
                ['Décrivez le contexte', 'Ce que vous faisiez, ce qui s’est passé, depuis quand.'],
                ['Joignez une capture', 'Une image permet souvent de reproduire le problème immédiatement.']
            ],
            en: [
                ['Name the version', 'Both the app’s and the system’s, visible in settings.'],
                ['Describe the context', 'What you were doing, what happened, since when.'],
                ['Attach a screenshot', 'An image often makes the issue instantly reproducible.']
            ]
        },

        aboutTitle: { fr: 'Rodolphe Vandaele', en: 'Rodolphe Vandaele' },
        aboutRole: { fr: 'Développeur indépendant iPhone et Mac', en: 'Independent iPhone and Mac developer' },
        aboutBio2: {
            fr: 'Sur iPhone, chaque application répond à un besoin concret du quotidien en France et s’appuie sur des données publiques documentées. Sur Mac, chaque utilitaire fait une chose et la fait bien. Aucune ne demande de compte, et les données restent sur l’appareil.',
            en: 'On iPhone, each app answers a concrete everyday need in France and builds on documented public data. On Mac, each utility does one thing and does it well. None of them requires an account, and data stays on the device.'
        },
        aboutAppsTitle: { fr: 'Les applications', en: 'The apps' },
        /* Formulation précise : seules les apps macOS ont leur code publié. Le
           code des apps iPhone n’est pas public, et rien ne doit laisser croire
           le contraire. */
        aboutAppsSub: { fr: 'Les apps iPhone sur l’App Store, les utilitaires Mac en open source sur GitHub.',
                        en: 'The iPhone apps on the App Store, the Mac utilities as open source on GitHub.' },

        /* Les deux gammes n'ont ni le même public, ni le même mode de
           distribution. La page À propos est l'endroit où le dire une fois,
           clairement, plutôt que de le laisser deviner app par app. */
        aboutLinesEyebrow: { fr: 'Deux gammes', en: 'Two ranges' },
        aboutLinesTitle: { fr: 'Deux publics, deux façons de distribuer.',
                           en: 'Two audiences, two ways of shipping.' },
        aboutLines: {
            fr: [
                ['phone', 'iPhone, pour la France',
                 'Quatre applications gratuites bâties sur les jeux de données publics français : carburants, bornes de recharge, toilettes et défibrillateurs. Distribuées sur l’App Store, financées par une publicité discrète, sans compte ni inscription.'],
                ['laptop', 'Mac, en open source',
                 'Deux utilitaires natifs pour Mac Apple Silicon, chacun sur un sujet précis. Publiés sous licence MIT sur GitHub, code complet consultable, sans publicité ni dépendance tierce.']
            ],
            en: [
                ['phone', 'iPhone, built for France',
                 'Four free apps built on French public datasets: fuel prices, EV chargers, public toilets and defibrillators. Shipped on the App Store, funded by discreet advertising, with no account or sign-up.'],
                ['laptop', 'Mac, open source',
                 'Two native utilities for Apple Silicon Macs, each on one precise subject. Published under the MIT licence on GitHub, full source readable, with no ads and no third-party dependency.']
            ]
        },

        /* Volontairement différent des « valeurs » de l'accueil, qui parlent du
           produit. Ici c'est la méthode : comment c'est fait et entretenu. */
        aboutMethodEyebrow: { fr: 'Méthode', en: 'Method' },
        aboutMethodTitle: { fr: 'Comment tout cela est fabriqué.', en: 'How all of it is built.' },
        aboutMethod: {
            fr: [
                ['gear', 'Natif, sans framework tiers',
                 'Tout est écrit en Swift et SwiftUI avec les frameworks d’Apple. Moins de dépendances, et des applications prêtes dès la sortie d’une nouvelle version du système.'],
                ['book', 'Des sources nommées',
                 'Chaque donnée affichée vient d’un jeu de données officiel, cité sur la page de l’application concernée. Rien n’est recopié d’une source que je ne peux pas montrer.'],
                ['shield', 'Rien ne quitte l’appareil',
                 'Favoris, historique et réglages restent en local. Aucun compte à créer, aucun profil à remplir, aucun identifiant à retenir.'],
                ['mail', 'Une seule personne répond',
                 'Le support, c’est moi. Chaque message reçoit une réponse, et les corrections partent dans la mise à jour suivante.']
            ],
            en: [
                ['gear', 'Native, no third-party frameworks',
                 'Everything is written in Swift and SwiftUI using Apple frameworks. Fewer dependencies, and apps that are ready the day a new system version ships.'],
                ['book', 'Named sources',
                 'Every piece of data comes from an official dataset, cited on the page of the app that uses it. Nothing is copied from a source I cannot show you.'],
                ['shield', 'Nothing leaves the device',
                 'Favorites, history and settings stay local. No account to create, no profile to fill in, no credentials to remember.'],
                ['mail', 'One person answers',
                 'Support is me. Every message gets a reply, and fixes ship in the next update.']
            ]
        }
    };

    var APPS = {
        carbufrance: {
            name: 'CarbuFrance', platform: 'ios', accent: '#4d7dff', glyph: '€',
            store: STORE + 'carbufrance/id6760407573',
            tag: { fr: 'Prix des carburants', en: 'Fuel prices' },
            desc: {
                fr: 'Prix des carburants en France : carte, liste, favoris, widget station la moins chère, carnet de bord avec CO₂ et consommation, observatoire des marchés et CarPlay. 100 % gratuit.',
                en: 'French fuel prices: map, list, favorites, cheapest station widget, logbook with CO₂ and fuel economy, market observatory and CarPlay. 100% free.'
            },
            features: {
                fr: [
                    'Carte et liste des stations avec prix carburants en France, tri par prix ou distance, favoris, stations masquées et cache hors-ligne.',
                    'Évolution du prix dans la station suivie : courbe interactive des relevés quotidiens sur 45 jours.',
                    'Carnet de bord : consommation et autonomie calculées depuis vos pleins, CO₂ émis (facteurs ADEME) et écart de prix payé face à la moyenne nationale du mois.',
                    'Véhicules et entretien : motorisation thermique, hybride ou hybride rechargeable, capacité du réservoir, dépenses par catégorie et budget.',
                    'Analyse du marché : baril de Brent, euro/dollar, stations les moins chères et ruptures par carburant, plus les actualités du secteur.',
                    'Widget station la moins chère, CarPlay et Contrôle rapide. Aucun abonnement : la vidéo récompensée offre 6 h sans publicité.'
                ],
                en: [
                    'Map and list of French fuel stations with prices, sorted by price or distance, favorites, hidden stations and offline cache.',
                    'Price history for the station you follow: an interactive curve of daily readings over 45 days.',
                    'Logbook: fuel economy and range computed from your fill-ups, CO₂ emitted (ADEME factors) and how the price you paid compares to the national monthly average.',
                    'Vehicles and maintenance: combustion, hybrid or plug-in hybrid powertrain, tank capacity, spending by category and budget.',
                    'Market analysis: Brent crude, EUR/USD, cheapest stations and out-of-stock counts per fuel, plus sector news.',
                    'Cheapest station widget, CarPlay and Control Center widget. No subscription: a rewarded video grants 6 ad-free hours.'
                ]
            },
            sources: { fr: 'Prix publics officiels des carburants en France, mis en cache localement. Historique des prix, cours du Brent et taux de change issus de sources publiques ; facteurs CO₂ de l’ADEME.', en: 'Official public French fuel prices, cached locally. Price history, Brent crude and exchange rates from public sources; CO₂ factors from ADEME.' },
            business: { fr: 'Application 100 % gratuite, financée par la publicité. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free app, funded by ads. No in-app purchases, no payment card data in the app.' },
            demo: {
                title: { fr: 'Stations', en: 'Stations' },
                kind: 'badge',
                pins: [
                    { top: 'TOTAL', tag: '1,990', tone: '#e01f26', x: 27, y: 38 },
                    { top: 'AVIA', tag: '2,099', tone: '#e30613', x: 66, y: 31, main: true },
                    { top: 'bp', tag: '2,069', tone: '#009a17', x: 45, y: 55 },
                    { top: 'ESSO', tag: '1,975', tone: '#0057a8', x: 72, y: 64 }
                ],
                unit: '€',
                selector: { fr: ['Gazole', 'SP95', 'SP98', 'E10', 'E85', 'GPLc'], en: ['Diesel', 'SP95', 'SP98', 'E10', 'E85', 'LPG'] },
                active: 3,
                tabs: { fr: [['pin', 'Stations'], ['list', 'Liste'], ['chart', 'Marché'], ['book', 'Carnet'], ['gear', 'Réglages']], en: [['pin', 'Stations'], ['list', 'List'], ['chart', 'Market'], ['book', 'Logbook'], ['gear', 'Settings']] }
            },
            shots: [
                { file: 'carbufrance-map', caption: { fr: 'Carte des stations et prix en direct', en: 'Live station map and prices' } },
                { file: 'carbufrance-list', caption: { fr: 'Liste triée par prix, écart affiché', en: 'List sorted by price, savings shown' } },
                { file: 'carbufrance-detail', caption: { fr: 'Fiche station, Vue 360° et guidage', en: 'Station sheet, 360° view and directions' } }
            ]
        },
        irvefrance: {
            name: 'IRVEFrance', platform: 'ios', accent: '#6a5cff', glyph: '⚡︎',
            store: STORE + 'irvefrance/id6760716931',
            tag: { fr: 'Bornes de recharge', en: 'EV charging' },
            desc: {
                fr: 'Bornes de recharge électrique : réseaux, connecteurs, puissance, disponibilité, guidage et calculateur de recharge.',
                en: 'EV charging stations: networks, connectors, power, availability, directions and a charging calculator.'
            },
            features: {
                fr: ['Carte des bornes avec connecteurs, puissance, opérateur et disponibilité.', 'Filtres CCS2, CHAdeMO, Type 2, puissance minimale et rayon 5 à 50 km.', 'Look Around, vue 3D, favoris, hors-ligne, Siri et calculateur de recharge.', 'Premium : prix spot, coût avec tarif saisi, conseils et actualités mobilité électrique.'],
                en: ['Charger map with connectors, power, operator and availability.', 'CCS2, CHAdeMO, Type 2, minimum power and 5 to 50 km radius filters.', 'Look Around, 3D map, favorites, offline mode, Siri and charging calculator.', 'Premium: spot price, cost with your tariff, advice and EV news.']
            },
            sources: { fr: 'Données ouvertes des infrastructures de recharge (IRVE), mises en cache localement.', en: 'Open data on French charging infrastructure (IRVE), cached locally.' },
            business: { fr: 'Outils Premium optionnels gérés par StoreKit. Aucune donnée bancaire dans l’app.', en: 'Optional Premium tools handled by StoreKit. No payment card data in the app.' },
            demo: {
                title: { fr: 'Bornes', en: 'Chargers' },
                icon: 'evstation',
                pins: [
                    { tag: '7 kW', tone: '#0e7d74', x: 27, y: 38 },
                    { tag: '22 kW', tone: '#f28c0d', x: 45, y: 55, main: true },
                    { tag: '22 kW', tone: '#1d6ef2', x: 66, y: 31 },
                    { tag: '3 kW', tone: '#34c759', x: 72, y: 64 }
                ],
                selector: { fr: ['Toutes', '≥ 22 kW', '≥ 50 kW', '≥ 150 kW'], en: ['All', '≥ 22 kW', '≥ 50 kW', '≥ 150 kW'] },
                active: 0,
                tabs: { fr: [['pin', 'Bornes'], ['list', 'Liste'], ['chart', 'Marché'], ['gear', 'Réglages']], en: [['pin', 'Chargers'], ['list', 'List'], ['chart', 'Market'], ['gear', 'Settings']] }
            },
            shots: [
                { file: 'irvefrance-map', caption: { fr: 'Carte des bornes, puissance en direct', en: 'Charger map, live power' } },
                { file: 'irvefrance-list', caption: { fr: 'Liste par connecteur, puissance et distance', en: 'List by connector, power and distance' } },
                { file: 'irvefrance-detail', caption: { fr: 'Fiche borne, Vue 360° et connecteurs', en: 'Charger sheet, 360° view and connectors' } }
            ]
        },
        toilettefrance: {
            name: 'ToiletteFrance', platform: 'ios', accent: '#3d9bff', glyph: 'WC',
            store: STORE + 'toilettefrance/id6760978805',
            tag: { fr: 'Toilettes publiques', en: 'Public toilets' },
            desc: {
                fr: 'Toilettes publiques en France : carte, filtres utiles, accessibilité, horaires et guidage.',
                en: 'Public toilets in France: map, useful filters, accessibility, opening hours and directions.'
            },
            features: {
                fr: ['Carte des toilettes publiques en France avec distance et guidage.', 'Filtres d’accessibilité, horaires et informations selon les données ouvertes.', 'Favoris, préférences et données locales sans compte utilisateur.', 'Application gratuite financée par publicité AdMob.'],
                en: ['Map of public toilets in France with distance and directions.', 'Accessibility filters, opening hours and details from open data.', 'Favorites, preferences and local data with no user account.', 'Free app funded by AdMob ads.']
            },
            sources: { fr: 'Données ouvertes françaises sur les toilettes publiques, mises en cache localement.', en: 'French open data on public toilets, cached locally.' },
            business: { fr: 'Publicités AdMob avec consentement. Aucun achat intégré.', en: 'AdMob ads with consent. No in app purchases.' },
            demo: {
                title: { fr: 'Toilettes', en: 'Toilets' },
                icon: 'toilet',
                pins: [
                    { tag: 'Gratuit', tagEn: 'Free', tone: '#34c759', x: 27, y: 38, sub: true },
                    { tag: 'Gratuit', tagEn: 'Free', tone: '#34c759', x: 66, y: 31 },
                    { tag: 'Gratuit', tagEn: 'Free', tone: '#34c759', x: 45, y: 55, main: true, sub: true },
                    { tag: 'Tarif inconnu', tagEn: 'Unknown fee', tone: '#34c759', x: 72, y: 64 }
                ],
                cta: { label: { fr: 'Le plus Proche', en: 'Nearest' }, tone: '#ff9500', icon: 'nav' },
                tabs: { fr: [['map', 'Toilettes'], ['list', 'Liste'], ['gear', 'Réglages']], en: [['map', 'Toilets'], ['list', 'List'], ['gear', 'Settings']] }
            },
            shots: [
                { file: 'toilettefrance-map', caption: { fr: 'Carte des toilettes publiques', en: 'Public toilets map' } },
                { file: 'toilettefrance-list', caption: { fr: 'Liste triée par distance', en: 'List sorted by distance' } },
                { file: 'toilettefrance-detail', caption: { fr: 'Fiche toilette, accessibilité et Vue 360°', en: 'Toilet sheet, accessibility and 360° view' } }
            ]
        },
        defibfrance: {
            name: 'DefibFrance', platform: 'ios', accent: '#17b26a', glyph: '+',
            store: STORE + 'defibfrance/id6761717722',
            tag: { fr: 'Défibrillateurs', en: 'Defibrillators' },
            desc: {
                fr: 'Défibrillateurs (DAE) : disponibilité, accessibilité, mode Urgence, appel SAMU 15 et guide RCP avec métronome haptique.',
                en: 'AEDs: availability, accessibility, Emergency mode, SAMU 15 call and CPR guide with haptic metronome.'
            },
            features: {
                fr: ['Carte des DAE proches avec code couleur par accessibilité.', 'Filtres accès public, 24h/24, intérieur/extérieur et rayon 500 m à 10 km.', 'Mode Urgence, appel SAMU 15 avec confirmation et guide RCP avec métronome haptique.', 'Vidéo récompensée 1 h sans pub et don StoreKit pour retirer les publicités.'],
                en: ['Nearby AED map with color coding by accessibility.', 'Public access, 24/7, indoor/outdoor and 500 m to 10 km radius filters.', 'Emergency mode, confirmed SAMU 15 call and CPR guide with haptic metronome.', 'Rewarded video gives 1 h ad free; a StoreKit donation removes ads for good.']
            },
            sources: { fr: 'Base nationale des défibrillateurs, mise en cache localement.', en: 'The national defibrillator database, cached locally.' },
            business: { fr: 'Publicités avec consentement ; don StoreKit optionnel pour les retirer définitivement.', en: 'Ads with consent; optional StoreKit donation removes them permanently.' },
            demo: {
                title: { fr: 'Défibrillateurs', en: 'Defibrillators' },
                icon: 'heartbolt',
                pins: [
                    { tag: 'Accès public', tagEn: 'Public access', tone: '#0a84ff', x: 27, y: 38 },
                    { tag: 'Accès public', tagEn: 'Public access', tone: '#0a84ff', x: 45, y: 55, main: true },
                    { tag: 'Clients uniquement', tagEn: 'Customers only', tone: '#ff9500', x: 66, y: 31 },
                    { tag: 'Accès public', tagEn: 'Public access', tone: '#0a84ff', x: 72, y: 64 }
                ],
                cta: { label: { fr: 'URGENCE', en: 'EMERGENCY' }, tone: '#ff3b30', icon: 'heart' },
                tabs: { fr: [['map', 'Défibrillateurs'], ['list', 'Liste'], ['gear', 'Réglages']], en: [['map', 'Defibrillators'], ['list', 'List'], ['gear', 'Settings']] }
            },
            shots: [
                { file: 'defibfrance-map', caption: { fr: 'Carte des DAE, bouton Urgence', en: 'AED map, Emergency button' } },
                { file: 'defibfrance-list', caption: { fr: 'Liste avec accès et intérieur/extérieur', en: 'List with access and indoor/outdoor' } },
                { file: 'defibfrance-detail', caption: { fr: 'Fiche DAE, accès, niveau et localisation', en: 'AED sheet, access, floor and location' } }
            ]
        },
        mactuner: {
            name: 'MacTuner', platform: 'mac', accent: '#8eb8ff',
            store: GITHUB_MACTUNER,
            tag: { fr: 'Centre de contrôle Mac', en: 'Mac control center' },
            desc: {
                fr: 'Application macOS libre : tableau de bord temps réel, réglages système réversibles, nettoyage, désinstallation sans résidu, maintenance et contrôle du ventilateur.',
                en: 'Free macOS app: real time dashboard, reversible system tweaks, cleanup, residue free uninstall, maintenance and fan control.'
            },
            features: {
                fr: ['Tableau de bord : CPU par cœur, mémoire, disque, réseau, température, batterie et ventilation en temps réel.', '34 réglages système désactivables et 100 % réversibles : Siri, Apple Intelligence, télémétrie, iCloud…', 'Nettoyage sur 18 catégories et désinstallation sans résidu, protégées par un garde-fou central.', 'Contrôle du ventilateur borné au min/max constructeur, presets et réapplication au démarrage.'],
                en: ['Dashboard: per core CPU, memory, disk, network, temperature, battery and fans in real time.', '34 fully reversible system tweaks: Siri, Apple Intelligence, telemetry, iCloud…', 'Cleanup across 18 categories and residue free uninstall, protected by a central safety guard.', 'Fan control capped to maker min/max, presets and reapply at startup.']
            },
            sources: { fr: 'Mécanismes documentés d’Apple uniquement : launchctl, defaults, IOKit SMC. Aucun fichier système modifié.', en: 'Documented Apple mechanisms only: launchctl, defaults, IOKit SMC. No system file is ever modified.' },
            business: { fr: 'Gratuit et open source (MIT) : ni publicité, ni achat, ni compte.', en: 'Free and open source (MIT): no ads, purchases or accounts.' }
        },
        dnstuner: {
            name: 'DNSTuner', platform: 'mac', accent: '#6d5cff',
            store: GITHUB_DNSTUNER,
            tag: { fr: 'Sélecteur de DNS système', en: 'System-wide DNS switcher' },
            desc: {
                fr: 'Application macOS libre : bascule le DNS de tout le Mac vers l’un des 46 résolveurs publics, en clair ou chiffré (DoH/DoT), et mesure vraiment ce que chacun bloque.',
                en: 'Free macOS app: switches your whole Mac’s DNS to one of 46 public resolvers, plain or encrypted (DoH/DoT), and actually measures what each one blocks.'
            },
            features: {
                fr: ['46 résolveurs publics groupés par éditeur : AdGuard, Cloudflare, Quad9, OpenDNS, Mullvad, DNS4EU, Control D, CleanBrowsing, NextDNS, dns0.eu, CZ.NIC, FDN, CIRA, Google…', 'Appliqué à tous les services réseau (Wi-Fi, Ethernet, Thunderbolt) en une seule demande de mot de passe.', 'DNS chiffré DoH et DoT par profil de configuration, installable en deux clics et désinstallable depuis l’app.', 'Matrice « que bloque quoi » sur 7 catégories, croisant l’annonce du fournisseur et la mesure réelle de latence et de blocage.', 'Note de blocage sur 100 : 40 domaines témoins de régies publicitaires, traqueurs et télémétrie interrogés un par un, avec le détail de ce qui passe et de ce qui ne passe pas.', 'Diagnostic en dix tests de la configuration active : chiffrement, résolveur sortant, transmission de votre sous-réseau, DNSSEC, détournement des erreurs, anti-rebinding.'],
                en: ['46 public resolvers grouped by vendor: AdGuard, Cloudflare, Quad9, OpenDNS, Mullvad, DNS4EU, Control D, CleanBrowsing, NextDNS, dns0.eu, CZ.NIC, FDN, CIRA, Google…', 'Applied to every network service (Wi-Fi, Ethernet, Thunderbolt) with a single password prompt.', 'Encrypted DoH and DoT DNS via a configuration profile, installed in two clicks and removable from the app.', 'A “what blocks what” matrix across 7 categories, cross-checking the provider’s claims against measured latency and blocking.', 'A blocking score out of 100: 40 canary domains from ad networks, trackers and telemetry queried one by one, with the detail of what gets through and what does not.', 'A ten-test diagnostic of the active setup: encryption, outbound resolver, client subnet disclosure, DNSSEC, error hijacking, rebind protection.']
            },
            sources: { fr: 'Outils documentés d’Apple uniquement : networksetup, scutil, dscacheutil, profiles. Aucun fichier système modifié, aucun démon installé.', en: 'Documented Apple tools only: networksetup, scutil, dscacheutil, profiles. No system file is modified, no daemon is installed.' },
            business: { fr: 'Gratuit et open source (MIT) : ni publicité, ni achat, ni compte.', en: 'Free and open source (MIT): no ads, purchases or accounts.' }
        }
    };
    var IOS_ORDER = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance'];
    var MAC_ORDER = ['mactuner', 'dnstuner'];

    /* ---------------------------------------------------------------------
       Icônes SVG
       --------------------------------------------------------------------- */
    function svg(name) {
        var icons = {
            arrow: '<path d="M3 8h9M8 3.5 12.5 8 8 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
            apple: '<path fill="currentColor" d="M13 2.6c-.7.1-1.5.5-2 1.1-.4.5-.8 1.3-.6 2 .7.1 1.5-.4 2-1 .5-.6.8-1.3.6-2.1zM16.9 15c-.3.9-.6 1.3-1.1 2-.7 1-1.6 2.2-2.7 2.2-1.1 0-1.4-.7-2.7-.7-1.3 0-1.6.7-2.7.7-1.1 0-2-1.1-2.7-2.1C3.1 14.3 1.7 9.2 4.9 7c1-.7 2.2-1.1 3.3-1.1 1.2 0 2 .7 3.1.7 1 0 1.7-.7 3.1-.7 1 0 2.3.6 3.1 1.7-2.7 1.5-2.3 5.7.4 7.4z"/>',
            github: '<path fill="currentColor" d="M10 1.6a8.4 8.4 0 0 0-2.7 16.4c.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.7 1.3 2 .9 2.5.7.1-.6.3-.9.5-1.2-1.9-.2-3.9-.9-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.2 0 0 .7-.2 2.3.9a8 8 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.1.2 2 .1 2.2.5.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.3c0 .2.1.5.6.4A8.4 8.4 0 0 0 10 1.6z"/>',
            shield: '<path d="M12 3 5 5.8v5.4c0 4.3 3 8.3 7 9.8 4-1.5 7-5.5 7-9.8V5.8L12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9.2 12 2 2 3.6-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
            map: '<path d="m9 4.5-4.5 2v13l4.5-2 6 2 4.5-2v-13l-4.5 2-6-2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" fill="none" stroke="currentColor" stroke-width="1.7"/>',
            heart: '<path d="M12 20s-7.5-4.6-9.3-9C1.4 7.8 3.2 4.5 6.4 4.5c2 0 3.5 1.1 4.3 2.6l1.3 2.2 1.3-2.2c.8-1.5 2.3-2.6 4.3-2.6 3.2 0 5 3.3 3.7 6.5-1.8 4.4-9.3 9-9.3 9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
            star: '<path d="m12 3.5 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.1l-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7L12 3.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
            mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
            doc: '<path d="M6 3.5h7l5 5v12H6v-17z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 3.5v5h5M9 12h6M9 15.5h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
            phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
            laptop: '<rect x="4" y="4.5" width="16" height="11" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2.5 18.5h19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
            cpu: '<rect x="7" y="7" width="10" height="10" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M5.5 18.5l2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
            fan: '<circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 10c0-3-1-5.5 1.8-6.4 2.6-.8 4.4 2.3 2.6 4.4-1 1.2-2.9 2-4.4 2zm-2 2c-3 0-5.5 1-6.4-1.8-.8-2.6 2.3-4.4 4.4-2.6 1.2 1 2 2.9 2 4.4zm2 2c0 3 1 5.5-1.8 6.4-2.6.8-4.4-2.3-2.6-4.4 1-1.2 2.9-2 4.4-2zm2-2c3 0 5.5-1 6.4 1.8.8 2.6-2.3 4.4-4.4 2.6-1.2-1-2-2.9-2-4.4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
            broom: '<path d="m14 3 7 7-5.5 1.5L10 6 14 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 6 3 13c-1 1 0 4 2 6s5 3 6 2l7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
            search: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
            memory: '<rect x="4" y="7" width="16" height="10" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 7V4.6M12 7V4.6M16.5 7V4.6M7.5 19.4V17M12 19.4V17M16.5 19.4V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="8" y="10.2" width="8" height="3.6" rx="1" fill="currentColor"/>',
            disk: '<rect x="3.5" y="6" width="17" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="17" cy="15" r="1" fill="currentColor"/>',
            network: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3.5c2.6 2.3 3.9 5.2 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.2-3.9-8.5s1.3-6.2 3.9-8.5z" fill="none" stroke="currentColor" stroke-width="1.7"/>',
            pin: '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6" fill="currentColor"/>',
            list: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="4" cy="6" r="1.4" fill="currentColor"/><circle cx="4" cy="12" r="1.4" fill="currentColor"/><circle cx="4" cy="18" r="1.4" fill="currentColor"/>',
            chart: '<path d="M4 20V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m7 14 4-5 3.5 3L19 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
            book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5v-13z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
            gear: '<circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
            cross: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.8v8.4M7.8 12h8.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
            bolt: '<path d="M13.2 2.5 5.5 13.4h4.6L10.8 21.5l7.7-10.9h-4.6l-.7-8.1z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>',
            nav: '<path d="M21 3 3.6 10.8l7 2.6 2.6 7L21 3z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
            /* Glyphes des pins, fidèles aux vraies apps (l'éclair/écran reprend
               la couleur du pin via var(--tone)) */
            evstation: '<path d="M4.5 21V4.4C4.5 3.1 5.6 2 6.9 2h6.2c1.3 0 2.4 1.1 2.4 2.4V21H4.5z" fill="currentColor"/><rect x="6.5" y="4.3" width="7" height="3.6" rx="1" style="fill:var(--tone,#0a0e1a)"/><path d="M10.8 9.2 8.3 14h1.9l-.9 4.8 3.4-5.8h-1.9l1-3.8h-1z" style="fill:var(--tone,#0a0e1a)"/><path d="M15.5 9h1.4c1 0 1.8.8 1.8 1.8v4.7a1.6 1.6 0 0 1-3.2 0v-.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M3.2 21h13.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
            toilet: '<rect x="8.6" y="2.8" width="5" height="5.4" rx="1.2" fill="currentColor"/><path d="M6.2 9.4h11.6v1.6c0 3-2 5.4-4.8 6l.8 4.2H9.4l.8-4.2c-2.8-.6-4.8-3-4.8-6V9.4z" fill="currentColor"/>',
            heartbolt: '<path d="M12 20.6S4.4 15.9 2.7 11.5C1.4 8.2 3.3 4.9 6.6 4.9c2 0 3.7 1.1 4.5 2.7l.9 1.6.9-1.6c.8-1.6 2.5-2.7 4.5-2.7 3.3 0 5.2 3.3 3.9 6.6-1.7 4.4-9.3 9.1-9.3 9.1z" fill="currentColor"/><path d="M12.7 7.6 9.8 12.8h2.2l-1 4.4 3.6-5.6h-2.2l.8-4z" style="fill:var(--tone,#0a0e1a)"/>'
        };
        var vb = (name === 'arrow') ? '0 0 16 16' : (name === 'github' ? '0 0 20 20' : '0 0 24 24');
        return '<svg viewBox="' + vb + '" aria-hidden="true">' + (icons[name] || '') + '</svg>';
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }
    function tricolore() { return '<span class="tricolore" aria-hidden="true"><i></i><i></i><i></i></span>'; }
    function eyebrow(txt) { return '<span class="eyebrow">' + esc(txt) + '</span>'; }

    /* ---------------------------------------------------------------------
       Blocs partagés
       --------------------------------------------------------------------- */
    /* `active` désigne l'entrée de navigation correspondant à la page courante.
       Sans elle, rien n'indiquait où l'on se trouve une fois entré dans une app. */
    function navHTML(page, active) {
        var home = page === 'v2-home' ? '' : './index.html';
        function anchor(a) { return home ? withLang(home + a) : a; }
        function link(href, label, key, attrs) {
            var on = key && key === active;
            return '<a href="' + href + '"' + (on ? ' class="is-on" aria-current="page"' : '') +
                (attrs || '') + '>' + esc(label) + '</a>';
        }
        return '<a class="skip-link" href="#main">' + esc(pick(T.skipLink)) + '</a>' +
            '<header class="nav" id="nav"><div class="nav-inner">' +
            '<a class="brand" href="' + withLang('./index.html') + '"><span class="brand-mark">RV</span>' +
            '<span class="brand-name">Rodolphe Vandaele<small>' + esc(pick(T.brandSub)) + '</small></span></a>' +
            '<nav class="nav-links" aria-label="Navigation">' +
            link(anchor('#ios'), pick(T.navIOS), 'ios') +
            link(anchor('#macos'), pick(T.navMac), 'mac') +
            link(withLang('./about.html'), pick(T.navAbout), 'about') +
            link(withLang('./contact.html'), pick(T.navContact), 'contact') +
            '<a href="' + LIBERAPAY + '" target="_blank" rel="noopener">' + esc(pick(T.navSupport)) + ' ♥</a>' +
            '</nav>' +
            '<div class="lang-switch" role="group" aria-label="Langue">' +
            '<button data-lang="fr" class="' + (lang === 'fr' ? 'is-on' : '') + '">FR</button>' +
            '<button data-lang="en" class="' + (lang === 'en' ? 'is-on' : '') + '">EN</button></div>' +
            '<button class="nav-burger" id="burger" aria-label="Menu"><span></span></button>' +
            '</div></header>';
    }

    function storeBadge(app, cls) {
        if (app.platform === 'mac') {
            return '<a class="store-badge ' + (cls || '') + '" href="' + app.store + '" target="_blank" rel="noopener">' + svg('github') +
                '<span><small>' + esc(pick(T.free)) + ' · Open source</small><strong>GitHub</strong></span></a>';
        }
        return '<a class="store-badge ' + (cls || '') + '" href="' + app.store + '">' + svg('apple') +
            '<span><small>' + esc(pick(T.download)) + '</small><strong>App Store</strong></span></a>';
    }

    function footerHTML() {
        /* Une colonne par gamme, comme le reste de la page : le pied
           réunissait toutes les applications sous un seul titre, alors que rien
           d'autre sur le site ne les mélange plus. */
        function colonne(titre, cles) {
            return '<nav aria-label="' + esc(titre) + '"><b>' + esc(titre) + '</b>' +
                cles.map(function (k) {
                    return '<a href="' + withLang('./' + k + '.html') + '">' + APPS[k].name + '</a>';
                }).join('') + '</nav>';
        }
        return '<footer class="footer"><div class="wrap">' +
            '<div class="footer-grid">' +
            '<div class="footer-brand">' + tricolore() +
            '<b>Rodolphe Vandaele</b><p>' + esc(pick(T.footerLine)) + '</p></div>' +
            colonne(pick(T.navIOS), IOS_ORDER) + colonne(pick(T.navMac), MAC_ORDER) +
            '<nav aria-label="Site"><b>' + esc(pick(T.footerSite)) + '</b>' +
            '<a href="' + withLang('./about.html') + '">' + esc(pick(T.navAbout)) + '</a>' +
            '<a href="' + withLang('./contact.html') + '">' + esc(pick(T.navContact)) + '</a>' +
            '<a href="' + LIBERAPAY + '" target="_blank" rel="noopener">Liberapay</a>' +
            '<a href="mailto:' + MAIL + '">' + MAIL + '</a></nav>' +
            '</div>' +
            '<div class="footer-legal"><span>© 2026 Rodolphe Vandaele</span>' +
            '<span class="visit-count" data-visit-badge hidden><b data-visit-n></b>&nbsp;' + esc(pick(T.footerVisitors)) + '</span>' +
            '<span>' + esc(pick(T.footerTagline)) + '</span></div>' +
            '</div></footer>';
    }

    /* Barre d'état iOS : réseau, wifi, batterie (fidèle à l'iPhone) */
    function statusIcons() {
        return '<span class="demo-status-icons" aria-hidden="true">' +
            '<svg viewBox="0 0 18 12" class="si-signal"><rect x="0" y="7.5" width="3" height="4.5" rx="1.1" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="1.1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="9.5" rx="1.1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1.1" fill="currentColor"/></svg>' +
            '<svg viewBox="0 0 17 12" class="si-wifi">' +
            '<path d="M1.4 4.2a11 11 0 0 1 14.2 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
            '<path d="M4 7a7 7 0 0 1 9 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
            '<circle cx="8.5" cy="10.3" r="1.7" fill="currentColor"/></svg>' +
            '<svg viewBox="0 0 26 12" class="si-batt"><rect x="0.5" y="0.5" width="21.5" height="11" rx="3.4" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.1"/><rect x="2.1" y="2.1" width="16.2" height="7.8" rx="1.9" fill="currentColor"/><path d="M23.6 4.1v3.8a2 2 0 0 0 0-3.8z" fill="currentColor" fill-opacity="0.5"/></svg>' +
            '</span>';
    }

    function iphoneHTML(key) {
        var app = APPS[key];
        var d = app.demo;
        var selector = d.selector ? '<div class="demo-selector">' + pick(d.selector).map(function (c, i) {
            return '<span class="' + (i === d.active ? 'is-on' : '') + '">' + esc(c) + '</span>';
        }).join('') + '</div>' : '';
        /* Bouton flottant façon vraie app (Le plus Proche, URGENCE…) */
        var cta = d.cta ? '<div class="demo-cta" style="--cta:' + d.cta.tone + '">' + svg(d.cta.icon) + esc(pick(d.cta.label)) + '</div>' : '';
        var pins = d.pins.map(function (p, i) {
            var tag = (lang === 'en' && p.tagEn) ? p.tagEn : p.tag;
            var val = d.unit ? tag + ' ' + d.unit : tag;
            /* Tête fidèle à l'app : badge de marque (CarbuFrance) ou pastille
               ronde avec glyphe (bornes, WC, DAE), étiquette en dessous */
            /* badge accessibilité accolé au pin, comme dans la vraie app */
            var sub = p.sub ? '<i class="demo-pin-sub" aria-hidden="true">♿</i>' : '';
            var head = d.kind === 'badge'
                ? '<span class="demo-pin-head is-brand">' + esc(p.top) + '</span>'
                : '<span class="demo-pin-head">' + (p.icon || d.icon ? svg(p.icon || d.icon) : esc(p.top)) + sub + '</span>';
            return '<span class="demo-pin' + (p.main ? ' is-main' : '') + '" style="left:' + p.x + '%;top:' + p.y + '%;--tone:' + p.tone + ';--pd:' + (260 + i * 130) + 'ms">' +
                head + '<span class="demo-pin-tag">' + esc(val) + '</span></span>';
        }).join('');
        var locateSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 2.6v3.2M12 18.2v3.2M2.6 12h3.2M18.2 12h3.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
        var searchSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        var layersSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m3.5 12.5 8.5 4.7 8.5-4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
        var tabbar = pick(d.tabs).map(function (tb, i) {
            return '<span class="demo-tab' + (i === 0 ? ' is-on' : '') + '">' + svg(tb[0]) + '<small>' + esc(tb[1]) + '</small></span>';
        }).join('');
        return '<div class="iphone" style="--glow:' + app.accent + '55;--accent:' + app.accent + '">' +
            '<div class="iphone-screen">' +
            '<canvas data-demo="' + key + '" data-accent="' + app.accent + '"></canvas>' +
            '<div class="demo-island" aria-hidden="true"></div>' +
            '<div class="demo-ui' + (d.selector ? '' : ' no-selector') + '">' +
            '<div class="demo-status"><span class="demo-time">9:41</span>' + statusIcons() + '</div>' +
            '<div class="demo-header">' +
            '<h4>' + esc(pick(d.title)) + '</h4>' +
            '<div class="demo-header-btns"><button aria-hidden="true">' + searchSVG + '</button><button aria-hidden="true">' + layersSVG + '</button></div>' +
            '</div>' +
            '<div class="demo-pins">' + pins + '</div>' +
            '<div class="demo-fab" aria-hidden="true">' + locateSVG + '</div>' +
            cta +
            '<div class="demo-bottom">' +
            selector +
            '<div class="demo-footer"><div class="demo-tabbar">' + tabbar + '</div><span class="demo-home"></span></div>' +
            '</div>' +
            '</div></div></div>';
    }

    /* Anneau de jauge, comme les RingGauge du vrai tableau de bord */
    function mtRing(id, color) {
        var C = 2 * Math.PI * 30; /* r = 30 */
        return '<div class="mt-ring"><svg viewBox="0 0 72 72">' +
            '<circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7"/>' +
            '<circle cx="36" cy="36" r="30" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round"' +
            ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"' +
            ' transform="rotate(-90 36 36)" data-mt-ring="' + id + '"/></svg>' +
            '<span class="mt-ring-center"><b data-mt-val="' + id + '">··</b><small data-mt-sub="' + id + '"></small></span></div>';
    }
    function mtHeader(icon, label, colorClass) {
        return '<div class="mt-head ' + colorClass + '">' + svg(icon) + '<span>' + esc(label) + '</span></div>';
    }
    /* Lignes utilitaires pour les vues MacTuner */
    function mtLine(icon, name, sub, right) {
        return '<div class="mt-line">' + (icon || '') +
            '<span class="mt-line-txt"><b>' + esc(name) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
            (right || '') + '</div>';
    }
    function mtCheck(on) { return '<span class="mt-check' + (on ? '' : ' is-off') + '">✓</span>'; }
    function mtToggle(on) { return '<span class="mt-toggle' + (on ? ' is-on' : '') + '"></span>'; }

    /* Fenêtre macOS de démonstration. Chaque app mac a la sienne ; l'animation
       des onglets (attachMacTabs) est commune et pilotée par les data-mt-tab. */
    function macWindowHTML(key) {
        if (key === 'dnstuner') return dnsWindowHTML();
        return macTunerWindowHTML();
    }

    /* Fenêtre DNSTuner : 6 onglets, listes détaillées, mêmes classes que MacTuner.
       L'anneau de protection et les barres de couverture sont animés par dnsDemo(). */
    function dnsWindowHTML() {
        var fr = lang === 'fr';
        var C = 2 * Math.PI * 30;

        var TABS = fr
            ? ['Tableau de bord', 'Fournisseurs', 'État', 'Comparatif', 'Test', 'Journal']
            : ['Dashboard', 'Providers', 'Status', 'Comparison', 'Test', 'Log'];
        var tabs = TABS.map(function (t, i) {
            return '<span class="mt-tab' + (i === 0 ? ' is-on' : '') + '" data-mt-tab="' + i + '">' + esc(t) + '</span>';
        }).join('');
        var shield = '<span class="mt-shield">' + svg('shield') + '</span>';

        function chip(txt, cls) { return '<span class="mt-chip' + (cls ? ' ' + cls : '') + '">' + esc(txt) + '</span>'; }
        function flag(code) { return '<span class="dt-flag" aria-hidden="true">' + code + '</span>'; }

        /* Vue 1 · Tableau de bord — l'anneau de protection et les compteurs */
        var vDash = '<div class="mt-grid" style="padding:0">' +
            '<div class="mt-card dt-card-wide">' + mtHeader('shield', fr ? 'Protection' : 'Protection', 'is-blue') +
            '<div class="dt-hero">' +
            '<div class="mt-ring"><svg viewBox="0 0 72 72">' +
            '<circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7"/>' +
            '<circle cx="36" cy="36" r="30" fill="none" stroke="#6d5cff" stroke-width="7" stroke-linecap="round"' +
            ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"' +
            ' transform="rotate(-90 36 36)" data-dt-ring/></svg>' +
            '<span class="mt-ring-center"><b data-dt-score>··</b><small>' + (fr ? 'protection' : 'protection') + '</small></span></div>' +
            '<div class="dt-hero-txt">' +
            '<b>AdGuard DNS ' + flag('🇨🇾') + '</b>' +
            '<small>' + (fr ? 'Par défaut · chiffré en DoH' : 'Default · encrypted over DoH') + '</small>' +
            '<span class="dt-chiprow">' + chip('DoH', 'is-green') + chip('DNSSEC', 'is-green') +
            chip(fr ? 'Sans journalisation' : 'No logging', 'is-green') + '</span>' +
            '</div>' +
            '<div class="dt-hero-num"><small>' + (fr ? 'Latence' : 'Latency') + '</small>' +
            '<b data-dt-latency>··</b></div>' +
            '</div></div>' +

            '<div class="mt-card">' + mtHeader('network', fr ? 'Services réseau' : 'Network services', 'is-teal') +
            '<div class="mt-rows">' +
            '<span class="mt-row"><i style="background:#4ade80"></i>Wi-Fi<b>en1</b></span>' +
            '<span class="mt-row"><i style="background:#4ade80"></i>Ethernet<b>en0</b></span>' +
            '<span class="mt-row"><i style="background:rgba(255,255,255,0.25)"></i>Thunderbolt<b>bridge0</b></span>' +
            '</div>' +
            '<div class="mt-foot mt-foot-center"><span>' +
            (fr ? '3 services · une seule invite' : '3 services · one prompt') + '</span></div></div>' +

            '<div class="mt-card">' + mtHeader('book', fr ? 'Catalogue' : 'Catalog', 'is-purple') +
            '<div class="dt-stats">' +
            '<span class="dt-stat"><b>46</b><small>' + (fr ? 'résolveurs' : 'resolvers') + '</small></span>' +
            '<span class="dt-stat"><b>21</b><small>' + (fr ? 'éditeurs' : 'vendors') + '</small></span>' +
            '<span class="dt-stat"><b>13</b><small>' + (fr ? 'pays' : 'countries') + '</small></span>' +
            '<span class="dt-stat"><b>45</b><small>' + (fr ? 'chiffrés' : 'encrypted') + '</small></span>' +
            '</div></div>' +

            '<div class="mt-card dt-card-wide">' + mtHeader('chart', fr ? 'Couverture du catalogue' : 'Catalog coverage', 'is-orange') +
            '<div class="dt-bars">' +
            [[fr ? 'Publicités' : 'Ads', 14], [fr ? 'Traqueurs' : 'Trackers', 13],
             [fr ? 'Malware' : 'Malware', 26], [fr ? 'Contenu adulte' : 'Adult', 12],
             [fr ? 'Domaines récents' : 'New domains', 8]].map(function (b) {
                return '<span class="dt-bar"><em>' + esc(b[0]) + '</em>' +
                    '<i><u style="--w:' + Math.round(b[1] / 46 * 100) + '%"></u></i>' +
                    '<b>' + b[1] + '</b></span>';
            }).join('') +
            '</div></div>' +
            '</div>';

        /* Vue 2 · Fournisseurs — la liste du catalogue, avec l'entrée appliquée */
        var providers = [
            ['🇨🇾', 'AdGuard DNS', fr ? 'Par défaut' : 'Default', '94.140.14.14', true],
            ['🇨🇾', 'AdGuard DNS', fr ? 'Protection familiale' : 'Family protection', '94.140.14.15', false],
            ['🇺🇸', 'Cloudflare', '1.1.1.3 · ' + (fr ? 'famille' : 'family'), '1.1.1.3', false],
            ['🇨🇭', 'Quad9', fr ? 'Sécurisé + DNSSEC' : 'Secured + DNSSEC', '9.9.9.9', false],
            ['🇸🇪', 'Mullvad', fr ? 'Base · chiffré' : 'Base · encrypted', 'base.dns.mullvad.net', false],
            ['🇪🇺', 'DNS4EU', fr ? 'Protection + anti-pub' : 'Protective + ad blocking', '86.54.11.13', false]
        ];
        /* Le drapeau tient lieu d'icône de ligne : la juridiction se lit avec le
           nom du résolveur, pas rejetée à l'autre bout de la ligne. */
        var vProviders = '<div class="mt-list">' + providers.map(function (p) {
            return mtLine(flag(p[0]), p[1] + ' · ' + p[2], p[3],
                p[4] ? chip(fr ? 'appliqué' : 'applied', 'is-green') : '');
        }).join('') + '</div>';

        /* Vue 3 · État — ce que le système résout vraiment */
        var vStatus = '<div class="mt-list">' +
            mtLine(svg('network'), 'Wi-Fi · en1', '94.140.14.14, 94.140.15.15', chip(fr ? 'actif' : 'up', 'is-green')) +
            mtLine(svg('network'), 'Ethernet · en0', '94.140.14.14, 94.140.15.15', '') +
            mtLine(svg('network'), 'Thunderbolt Bridge · bridge0', '94.140.14.14, 94.140.15.15', '') +
            mtLine(svg('shield'), fr ? 'Chiffrement' : 'Encryption',
                fr ? 'profil DoH actif · dns.adguard-dns.com' : 'DoH profile active · dns.adguard-dns.com',
                chip('DoH', 'is-green')) +
            mtLine(svg('gear'), fr ? 'Retour arrière' : 'Rollback',
                fr ? 'configuration d’origine mémorisée' : 'original configuration saved',
                chip(fr ? 'prêt' : 'ready', 'is-green')) +
            '</div>';

        /* Vue 4 · Comparatif — annonce du fournisseur vs mesure */
        var cats = fr
            ? ['Pubs', 'Traqueurs', 'Malware', 'Adulte']
            : ['Ads', 'Trackers', 'Malware', 'Adult'];
        var matrix = [
            ['🇨🇾', 'AdGuard · ' + (fr ? 'Par défaut' : 'Default'), [1, 1, 1, 0]],
            ['🇺🇸', 'Cloudflare · 1.1.1.3', [0, 0, 1, 1]],
            ['🇨🇭', 'Quad9 · ' + (fr ? 'Sécurisé' : 'Secured'), [0, 0, 1, 0]],
            ['🇸🇪', 'Mullvad · ' + (fr ? 'Tout' : 'All'), [1, 1, 1, 1]],
            ['🇪🇺', 'DNS4EU · ' + (fr ? 'Anti-pub' : 'Ad blocking'), [1, 1, 1, 0]]
        ];
        var vCompare = '<div class="mt-list">' +
            mtLine('', fr ? 'Catégorie bloquée' : 'Blocked category', cats.join(' · '), '') +
            matrix.map(function (row) {
                var dots = row[2].map(function (on) { return mtCheck(!!on); }).join('');
                return mtLine(flag(row[0]), row[1], '', '<span class="mt-line-dots">' + dots + '</span>');
            }).join('') + '</div>';

        /* Vue 5 · Test — latence mesurée */
        var latencies = [
            ['🇺🇸', 'Cloudflare 1.1.1.1', 12, 'is-green'],
            ['🇨🇾', 'AdGuard DNS', 18, 'is-green'],
            ['🇨🇭', 'Quad9', 31, ''],
            ['🇪🇺', 'DNS4EU', 46, ''],
            ['🇨🇦', 'Control D', 58, ''],
            ['🇸🇪', 'Mullvad (DoH)', 74, '']
        ];
        var vTest = '<div class="mt-list">' + latencies.map(function (l) {
            return mtLine(flag(l[0]), l[1], fr ? 'latence médiane · 3 essais' : 'median latency · 3 runs',
                '<span class="dt-lat"><i><u style="--w:' + Math.round(l[2] / 80 * 100) + '%"></u></i>' +
                chip(l[2] + ' ms', l[3]) + '</span>');
        }).join('') + '</div>';

        /* Vue 6 · Journal */
        var log = [
            [fr ? 'DNS appliqué : AdGuard DNS · Par défaut' : 'DNS applied: AdGuard DNS · Default', '10:42:07'],
            [fr ? 'Profil chiffré installé (DoH)' : 'Encrypted profile installed (DoH)', '10:42:31'],
            [fr ? 'Cache DNS vidé' : 'DNS cache flushed', '10:42:32'],
            [fr ? 'Test effectué : 46 résolveurs' : 'Test completed: 46 resolvers', '10:44:18'],
            [fr ? 'Blocage confirmé : publicités, traqueurs' : 'Blocking confirmed: ads, trackers', '10:44:52'],
            [fr ? 'Configuration d’origine mémorisée' : 'Original configuration saved', '10:42:06']
        ];
        var vLog = '<div class="mt-list">' + log.map(function (l) {
            return mtLine(mtCheck(true), l[0], l[1], '');
        }).join('') + '</div>';

        var views = [vDash, vProviders, vStatus, vCompare, vTest, vLog].map(function (v, i) {
            return '<div class="mt-view' + (i === 0 ? ' is-live' : '') + '" data-mt-view="' + i + '">' + v + '</div>';
        }).join('');

        return '<div class="mac-scene"><div class="mac-window dt-window" aria-hidden="true">' +
            '<div class="mac-titlebar"><i></i><i></i><i></i>' +
            '<div class="mt-tabs">' + tabs + '</div>' + shield + '</div>' +
            '<div class="mt-idcard">' +
            '<img src="./assets/img/dnstuner.png" alt="">' +
            '<span class="mt-idcard-name"><b>DNSTuner <em>v1.0.0</em></b><small>' +
            (fr ? '46 résolveurs · 13 pays' : '46 resolvers · 13 countries') + '</small></span>' +
            '<span class="mt-idcard-os">macOS 27<small>' + (fr ? 'DoH actif' : 'DoH on') + '</small></span>' +
            '</div>' +
            '<div class="mt-body">' + views + '</div>' +
            '</div></div>';
    }

    /* Démo DNSTuner : l'anneau de protection se remplit, la latence respire.
       Volontairement sobre — deux valeurs animées, pas un feu d'artifice. */
    function dnsDemo() {
        var win = document.querySelector('.dt-window');
        if (!win) return;
        var ring = win.querySelector('[data-dt-ring]');
        var score = win.querySelector('[data-dt-score]');
        var lat = win.querySelector('[data-dt-latency]');
        if (!ring || !score) return;
        var C = 2 * Math.PI * 30;
        var target = 0.86;

        if (reduceMotion) {
            ring.style.strokeDashoffset = String(C * (1 - target));
            score.textContent = String(Math.round(target * 100));
            if (lat) lat.textContent = '18 ms';
            return;
        }

        var shown = 0, t0 = null;
        function frame(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min((ts - t0) / 1400, 1);
            /* même courbe que les apparitions du site */
            var eased = 1 - Math.pow(1 - p, 3);
            shown = target * eased;
            ring.style.strokeDashoffset = String(C * (1 - Math.max(0.02, shown)));
            score.textContent = String(Math.round(shown * 100));
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);

        if (lat) {
            var base = 18;
            var beat = setInterval(function () {
                if (!lat.isConnected) { clearInterval(beat); return; }
                var v = base + Math.round((Math.random() - 0.5) * 6);
                lat.textContent = Math.max(9, v) + ' ms';
            }, 2600);
        }
    }

    function macTunerWindowHTML() {
        var fr = lang === 'fr';
        var coreBars = '';
        for (var i = 0; i < 8; i++) coreBars += '<i data-mt-core="' + i + '"></i>';
        var C2 = (2 * Math.PI * 24).toFixed(1);

        /* Les 8 onglets de la vraie application */
        var TABS = fr
            ? ['Tableau de bord', 'Fonctionnalités', 'Nettoyage', 'Désinstaller', 'Maintenance', 'Gains', 'Réglages', 'Guide']
            : ['Dashboard', 'Features', 'Cleanup', 'Uninstall', 'Maintenance', 'Gains', 'Settings', 'Guide'];
        var tabs = TABS.map(function (t, i) {
            return '<span class="mt-tab' + (i === 0 ? ' is-on' : '') + '" data-mt-tab="' + i + '">' + esc(t) + '</span>';
        }).join('');
        var shield = '<span class="mt-shield"><svg viewBox="0 0 24 24"><path d="M12 3 5 5.8v5.4c0 4.3 3 8.3 7 9.8 4-1.5 7-5.5 7-9.8V5.8L12 3z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg></span>';

        /* Vue 1 · Tableau de bord */
        var vDash = '<div class="mt-grid" style="padding:0">' +
            '<div class="mt-card">' + mtHeader('cpu', fr ? 'Processeur' : 'CPU', 'is-orange') +
            mtRing('cpu', '#ff9f0a') +
            '<div class="mt-cores">' + coreBars + '</div>' +
            '<div class="mt-foot"><span>8 ' + (fr ? 'cœurs' : 'cores') + '</span><b class="is-temp" data-mt-temp>··</b></div></div>' +
            '<div class="mt-card">' + mtHeader('memory', fr ? 'Mémoire' : 'Memory', 'is-purple') +
            mtRing('mem', '#bf5af2') +
            '<div class="mt-rows">' +
            '<span class="mt-row"><i style="background:#bf5af2"></i>' + (fr ? 'Réservée' : 'Wired') + '<b data-mt-mem="0">··</b></span>' +
            '<span class="mt-row"><i style="background:#ff375f"></i>' + (fr ? 'Compressée' : 'Compressed') + '<b data-mt-mem="1">··</b></span>' +
            '<span class="mt-row"><i style="background:#0a84ff"></i>Apps<b data-mt-mem="2">··</b></span>' +
            '</div></div>' +
            '<div class="mt-card">' + mtHeader('disk', fr ? 'Disque' : 'Disk', 'is-teal') +
            mtRing('disk', '#40c8e0') +
            '<div class="mt-foot mt-foot-center"><span>✓ 588 ' + (fr ? 'Go libres' : 'GB free') + '</span></div></div>' +
            '<div class="mt-card">' + mtHeader('network', fr ? 'Réseau' : 'Network', 'is-blue') +
            '<div class="mt-net">' +
            '<span class="mt-net-row"><em class="is-down">↓</em>' + (fr ? 'Réception' : 'Down') + '<b data-mt-net="0">··</b></span>' +
            '<canvas class="mt-spark" data-mt-spark width="200" height="34"></canvas>' +
            '<span class="mt-net-row"><em class="is-up">↑</em>' + (fr ? 'Envoi' : 'Up') + '<b data-mt-net="1">··</b></span>' +
            '</div>' +
            '<div class="mt-foot mt-foot-center"><span>' + (fr ? 'Temps réel · 1,5 s' : 'Live · 1.5 s') + '</span></div></div>' +
            '</div>' +
            /* Ventilation, comme la vraie app */
            '<div class="mt-fan">' +
            '<span class="mt-fan-ring"><svg viewBox="0 0 58 58">' +
            '<circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="5.5"/>' +
            '<circle cx="29" cy="29" r="24" fill="none" stroke="#40c8e0" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="' + C2 + '" stroke-dashoffset="' + (C2 * 0.8).toFixed(1) + '" transform="rotate(-90 29 29)"/>' +
            '</svg><span class="mt-fan-center"><b data-mt-rpm>1 001</b><small>tr/min</small></span></span>' +
            '<span class="mt-fan-mid">' +
            '<span class="mt-fan-row">' + svg('fan') + (fr ? 'Contrôle manuel de la vitesse' : 'Manual speed control') + mtToggle(false) + '</span>' +
            '<span class="mt-fan-slider"><i></i></span>' +
            '<span class="mt-fan-scale"><span>1 000 · ' + (fr ? 'silencieux' : 'silent') + '</span><span>4 900 · maximum</span></span>' +
            '</span>' +
            '<span class="mt-chip is-green">' + (fr ? 'Mode automatique' : 'Automatic mode') + '</span>' +
            '</div>';

        /* Vue 2 · Fonctionnalités */
        var vFeat = '<div class="mt-list">' +
            mtLine(svg('cpu'), 'Siri & Apple Intelligence', fr ? '7 processus · 512 Mo RAM' : '7 processes · 512 MB RAM', mtToggle(false)) +
            mtLine(svg('chart'), fr ? 'Télémétrie & analyse' : 'Telemetry & analytics', fr ? '4 processus · 96 Mo RAM' : '4 processes · 96 MB RAM', mtToggle(false)) +
            mtLine(svg('search'), fr ? 'Suggestions Spotlight' : 'Spotlight suggestions', fr ? '2 processus · 64 Mo RAM' : '2 processes · 64 MB RAM', mtToggle(true)) +
            mtLine(svg('gear'), 'Game Center', fr ? '3 processus · 88 Mo RAM' : '3 processes · 88 MB RAM', mtToggle(true)) +
            '</div><p class="mt-note">' + (fr ? '2/34 désactivés · 100 % réversible, aucun fichier supprimé' : '2/34 disabled · 100% reversible, no file deleted') + '</p>';

        /* Vue 3 · Nettoyage */
        var vClean = '<div class="mt-list">' +
            mtLine(mtCheck(true), fr ? 'Caches utilisateur' : 'User caches', null, '<span class="mt-val">2,1 Go</span>') +
            mtLine(mtCheck(true), fr ? 'Journaux & diagnostics' : 'Logs & diagnostics', null, '<span class="mt-val">480 Mo</span>') +
            mtLine(mtCheck(true), fr ? 'Builds Xcode' : 'Xcode builds', null, '<span class="mt-val">6,4 Go</span>') +
            mtLine(mtCheck(false), fr ? 'Caches navigateurs' : 'Browser caches', null, '<span class="mt-val">1,2 Go</span>') +
            '</div><div class="mt-cta">' + (fr ? 'Nettoyer la sélection (9,0 Go)' : 'Clean selection (9.0 GB)') + '</div>' +
            '<p class="mt-note">' + (fr ? 'Fichiers régénérables uniquement, garde-fou actif' : 'Regenerable files only, safety guard active') + '</p>';

        /* Vue 4 · Désinstaller */
        var vUnin = '<div class="mt-list">' +
            mtLine(mtCheck(true), 'Google Chrome', fr ? '14 éléments · app, caches, préférences' : '14 items · app, caches, preferences', '<span class="mt-val">1,3 Go</span>') +
            mtLine(mtCheck(true), 'Zoom', fr ? '9 éléments · app, conteneurs' : '9 items · app, containers', '<span class="mt-val">640 Mo</span>') +
            mtLine(mtCheck(false), 'homebrew', fr ? 'outil CLI · données liées résolues' : 'CLI tool · linked data resolved', '<span class="mt-val">312 Mo</span>') +
            '</div><div class="mt-cta is-red">' + (fr ? 'Désinstaller sans résidu (1,9 Go)' : 'Uninstall with zero leftovers (1.9 GB)') + '</div>' +
            '<p class="mt-note">' + (fr ? 'Fichiers personnels vers la Corbeille, récupérables' : 'Personal files go to the Trash, recoverable') + '</p>';

        /* Vue 5 · Maintenance */
        var vMaint = '<div class="mt-list">' +
            mtLine(svg('network'), fr ? 'Vider le cache DNS' : 'Flush DNS cache', null, '<span class="mt-chip">' + (fr ? 'Exécuter' : 'Run') + '</span>') +
            mtLine(svg('memory'), fr ? 'Purger la mémoire' : 'Purge memory', null, '<span class="mt-chip">' + (fr ? 'Exécuter' : 'Run') + '</span>') +
            mtLine(svg('search'), fr ? 'Réindexer Spotlight' : 'Rebuild Spotlight index', null, '<span class="mt-chip">' + (fr ? 'Exécuter' : 'Run') + '</span>') +
            mtLine(svg('disk'), fr ? 'Snapshots Time Machine' : 'Time Machine snapshots', null, '<span class="mt-chip">' + (fr ? 'Exécuter' : 'Run') + '</span>') +
            '</div><p class="mt-note">' + (fr ? 'Commandes documentées Apple uniquement' : 'Documented Apple commands only') + '</p>';

        /* Vue 6 · Gains */
        var vGains = '<div class="mt-tiles">' +
            '<div class="mt-tile"><b>1,8 Go</b><span>' + (fr ? 'RAM libérée' : 'RAM freed') + '</span></div>' +
            '<div class="mt-tile"><b>42</b><span>' + (fr ? 'processus en moins' : 'fewer processes') + '</span></div>' +
            '<div class="mt-tile"><b>12,6 Go</b><span>' + (fr ? 'disque récupéré' : 'disk recovered') + '</span></div>' +
            '</div>' +
            '<div class="mt-fan" style="margin-top:10px">' +
            '<span class="mt-fan-mid">' +
            '<span class="mt-fan-row">' + svg('chart') + (fr ? 'Services actifs' : 'Active services') + '<span class="mt-val" style="margin-left:auto">231 → 189</span></span>' +
            '<span class="mt-fan-scale"><span>' + (fr ? 'Mesures réelles depuis vos actions' : 'Real measurements from your actions') + '</span></span>' +
            '</span></div>';

        /* Vue 7 · Réglages */
        var vSet = '<div class="mt-list">' +
            mtLine(svg('gear'), fr ? 'Langue' : 'Language', null, '<span class="mt-chip">' + (fr ? 'Français' : 'English') + '</span>') +
            mtLine(svg('shield'), fr ? 'Autorisation administrateur' : 'Admin authorization', fr ? 'règles sudoers révocables' : 'revocable sudoers rules', '<span class="mt-chip is-green">✓ ' + (fr ? 'Active' : 'Active') + '</span>') +
            mtLine(svg('fan'), fr ? 'Contrôle du ventilateur' : 'Fan control', null, '<span class="mt-chip is-green">✓ ' + (fr ? 'Autorisé' : 'Allowed') + '</span>') +
            mtLine(svg('disk'), fr ? 'Accès complet au disque' : 'Full disk access', null, '<span class="mt-chip is-green">✓ ' + (fr ? 'Accordé' : 'Granted') + '</span>') +
            '</div>';

        /* Vue 8 · Guide */
        var vGuide = '<div class="mt-list">' +
            mtLine('<span class="mt-check">1</span>', fr ? 'Surveillez le tableau de bord' : 'Watch the dashboard', fr ? 'CPU, mémoire, disque, réseau en direct' : 'live CPU, memory, disk, network') +
            mtLine('<span class="mt-check">2</span>', fr ? 'Désactivez le superflu' : 'Disable what you don’t use', fr ? '34 réglages, tous réversibles' : '34 tweaks, all reversible') +
            mtLine('<span class="mt-check">3</span>', fr ? 'Nettoyez et désinstallez' : 'Clean and uninstall', fr ? 'sans résidu, garde-fou actif' : 'zero leftovers, safety guard on') +
            mtLine('<span class="mt-check">4</span>', fr ? 'Mesurez les gains' : 'Measure the gains', fr ? 'RAM, CPU et disque récupérés' : 'RAM, CPU and disk recovered') +
            '</div>';

        var views = [vDash, vFeat, vClean, vUnin, vMaint, vGains, vSet, vGuide].map(function (v, i) {
            return '<div class="mt-view' + (i === 0 ? ' is-live' : '') + '" data-mt-view="' + i + '">' + v + '</div>';
        }).join('');

        return '<div class="mac-scene"><div class="mac-window" aria-hidden="true">' +
            '<div class="mac-titlebar"><i></i><i></i><i></i>' +
            '<div class="mt-tabs">' + tabs + '</div>' + shield + '</div>' +
            '<div class="mt-idcard">' +
            '<img src="./assets/img/mactuner.png" alt="">' +
            '<span class="mt-idcard-name"><b>MacTuner <em>v1.1.0</em></b><small>Apple M4 · 10 ' + (fr ? 'cœurs' : 'cores') + ' · 16 Go</small></span>' +
            '<span class="mt-idcard-os">macOS 27<small>' + (fr ? 'en ligne 7 h 27' : 'up 7 h 27 min') + '</small></span>' +
            '</div>' +
            '<div class="mt-body">' + views + '</div>' +
            '</div></div>';
    }

    /* ---------------------------------------------------------------------
       Pages
       --------------------------------------------------------------------- */
    function appCard(key, i) {
        var app = APPS[key];
        var isMac = app.platform === 'mac';
        /* Les apps macOS n'ont ni page Confidentialité ni page Support (pas de
           collecte, code ouvert) : leur pied de carte pointe vers GitHub. */
        var foot = isMac
            ? '<a class="link-quiet" href="' + app.store + '" target="_blank" rel="noopener">GitHub</a>' +
              '<a class="link-quiet" href="' + app.store + '#readme" target="_blank" rel="noopener">README</a>'
            : '<a class="link-quiet" href="' + withLang('./' + key + '-support.html') + '">' + esc(pick(T.supportLink)) + '</a>' +
              '<a class="link-quiet" href="' + withLang('./' + key + '-privacy.html') + '">' + esc(pick(T.privacyLink)) + '</a>';
        return '<article class="app-card reveal tilt" style="--accent:' + app.accent + ';--rd:' + (i * 70) + 'ms">' +
            /* Même nom de transition que l'icône de la page produit : le
               navigateur fait morpher l'une vers l'autre à la navigation. */
            '<div class="app-card-head"><img class="app-icon" src="./assets/img/' + key + '.png" alt="" width="62" height="62"' +
            ' style="view-transition-name:icone-' + key + '">' +
            '<div><h3>' + app.name + '</h3>' +
            '<span class="app-status"><span class="dot"></span>' + esc(pick(T.available)) +
            ' · ' + (isMac ? 'Mac' : 'iPhone') + '</span></div></div>' +
            '<p>' + esc(pick(app.desc)) + '</p>' +
            '<div class="app-card-foot">' +
            '<a class="link-arrow" href="' + withLang('./' + key + '.html') + '">' + esc(pick(T.discover)) + svg('arrow') + '</a>' +
            foot +
            '</div></article>';
    }

    /* Bloc « en chiffres », inchangé, sorti de renderHome pour l'alléger. */
    function statsHTML() {
        var n = IOS_ORDER.length + MAC_ORDER.length;
        function fill(t) {
            return t.replace('{n}', String(n)).replace('{ios}', String(IOS_ORDER.length))
                    .replace('{mac}', String(MAC_ORDER.length));
        }
        return '<section class="section stats-section"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.statsEyebrow)) + '</div>' +
            '<div class="stats-grid">' + pick(T.stats).map(function (s2, i) {
                return '<div class="stat reveal" style="--rd:' + (i * 70) + 'ms">' +
                    '<span class="stat-num">' + esc(fill(s2[0])) + '</span>' +
                    '<span class="stat-label">' + esc(fill(s2[1])) + '</span>' +
                    '<span class="stat-desc">' + esc(fill(s2[2])) + '</span></div>';
            }).join('') + '</div></div></section>';
    }

    /* Une gamme : entête avec son illustration, cartes, puis vitrine animée.
       Les deux gammes passent par ici, donc aucune ne peut dériver de l'autre. */
    function rangeSection(c) {
        return '<section class="section range-section' + (c.tint ? ' mac-section' : '') +
            '" id="' + c.id + '"><div class="wrap">' +
            '<div class="range-hero">' +
            '<div class="range-copy reveal">' +
            '<span class="platform-tag platform-' + c.platform + '">' + svg(c.icon) + esc(c.tag) + '</span>' +
            '<h2>' + esc(c.title) + '</h2><p>' + esc(c.lead) + '</p>' +
            '<ul class="mac-points">' + c.points.map(function (p2) {
                return '<li><span><b>' + esc(p2[0]) + '</b> : ' + esc(p2[1]) + '</span></li>';
            }).join('') + '</ul>' +
            '<div class="hero-actions">' +
            '<a class="btn btn-solid" href="#' + c.id + '-apps">' + esc(c.cta) + svg('arrow') + '</a>' +
            '<a class="btn btn-ghost" href="#' + c.id + '-demo">' + esc(c.more) + '</a>' +
            '</div><p class="support-note">' + esc(c.note) + '</p></div>' +
            '<div class="range-scene reveal" id="' + c.id + '-scene" aria-hidden="true" style="--rd:120ms">' +
            '<canvas id="' + c.id + '-canvas"></canvas>' +
            '<div class="map-pins" id="' + c.id + '-pins"></div></div>' +
            '</div>' +
            '<div class="app-grid" id="' + c.id + '-apps">' + c.order.map(appCard).join('') + '</div>' +
            /* La vitrine reste **dans** la section de la gamme : séparée, elle
               flottait entre deux bandes sans qu'on sache à qui elle
               appartenait. Les seuls séparateurs du site sont désormais entre
               les gammes, nulle part ailleurs. */
            '<div class="range-demo" id="' + c.id + '-demo"><div class="mac-layout">' +
            '<div class="mac-copy reveal">' + eyebrow(c.showEyebrow) +
            '<h2>' + esc(c.showTitle) + '</h2><p>' + esc(c.showLead) + '</p>' +
            '<div class="hero-badges" ' + c.tabsAttr + '>' + c.order.map(function (k, i) {
                return '<button class="chip' + (i === 0 ? ' is-on' : '') + '" ' + c.tabAttr +
                    '="' + k + '" style="cursor:pointer">' + APPS[k].name + '</button>';
            }).join('') + '</div>' +
            /* Les boutons suivent l'onglet choisi : ils sont donc à côté de lui. */
            '<div class="hero-actions">' +
            '<a class="btn btn-solid" ' + c.storeAttr + ' href="' + APPS[c.order[0]].store +
            '" target="_blank" rel="noopener">' + svg(c.platform === 'mac' ? 'github' : 'apple') +
            esc(c.store) + '</a>' +
            '<a class="btn btn-ghost" ' + c.pageAttr + ' href="' + withLang('./' + c.order[0] + '.html') +
            '">' + esc(c.page) + svg('arrow') + '</a>' +
            '</div></div>' +
            '<div class="reveal" style="--rd:140ms" id="' + c.slot + '">' + c.initial + '</div>' +
            '</div></div>' +
            '</div></section>';
    }

    function renderHome() {
        document.title = 'Rodolphe Vandaele · Apps iOS & macOS';
        return navHTML('v2-home') +
            '<main id="main">' +

            /* HÉRO : il n'appartient plus à une gamme. La carte de France est
               descendue dans la section iPhone, à laquelle elle appartient, et
               le héro se contente de présenter les deux et d'y envoyer. */
            '<section class="hero hero-intro"><canvas id="hero-bg" aria-hidden="true"></canvas><div class="hero-veil"></div>' +
            '<div class="wrap"><div class="hero-inner hero-centered">' +
            '<div class="hero-badges reveal"><span class="chip"><span class="dot"></span>' + esc(pick(T.heroChip1).replace('{n}', String(IOS_ORDER.length + MAC_ORDER.length))) + '</span>' +
            '<span class="chip">' + esc(pick(T.heroChip2)) + '</span><span class="chip">\ud83c\uddeb\ud83c\uddf7 ' + esc(pick(T.heroChip3)) + '</span></div>' +
            '<h1 class="reveal" style="--rd:80ms">' + pick(T.heroTitle) + '</h1>' +
            '<p class="hero-lead reveal" style="--rd:160ms">' + esc(pick(T.heroLead)) + '</p>' +
            '<div class="hero-actions reveal" style="--rd:240ms">' +
            '<a class="btn btn-solid" href="#ios">' + svg('phone') + esc(pick(T.heroCTA1)) + '</a>' +
            '<a class="btn btn-ghost" href="#macos">' + svg('laptop') + esc(pick(T.heroCTA2)) + '</a>' +
            '</div></div></div>' +
            '<span class="hero-scroll" aria-hidden="true">' + esc(pick(T.scrollHint)) + '</span>' +
            '</section>' +

            /* STATS */
            statsHTML() +

            /* Les deux gammes, produites par la même fonction : elles ne peuvent
               pas diverger d'ordre, de titre ni de traitement. */
            rangeSection({
                id: 'ios', platform: 'ios', icon: 'phone', tint: false,
                tag: 'iPhone \u00b7 iOS 18+',
                title: pick(T.iosTitle), lead: pick(T.iosLead), points: pick(T.iosPoints),
                cta: pick(T.iosCTA), more: pick(T.iosMore), note: pick(T.iosRequires),
                order: IOS_ORDER,
                showTitle: pick(T.showcaseTitle), showLead: pick(T.showcaseLead),
                showEyebrow: pick(T.showcaseEyebrow),
                store: pick(T.iosStore), page: pick(T.iosPage),
                tabsAttr: 'data-demo-tabs', tabAttr: 'data-demo-tab',
                storeAttr: 'data-demo-store', pageAttr: 'data-demo-page',
                slot: 'showcase-phone', initial: ''
            }) +
            rangeSection({
                id: 'macos', platform: 'mac', icon: 'laptop', tint: true,
                tag: 'macOS \u00b7 Apple Silicon',
                title: pick(T.macTitle), lead: pick(T.macLead), points: pick(T.macPoints),
                cta: pick(T.macCTA), more: pick(T.macMore), note: pick(T.macRequires),
                order: MAC_ORDER,
                showTitle: pick(T.macShowTitle), showLead: pick(T.macShowLead),
                showEyebrow: pick(T.macShowEyebrow),
                store: pick(T.macStore), page: pick(T.macPage),
                tabsAttr: 'data-mac-tabs', tabAttr: 'data-mac-tab',
                storeAttr: 'data-mac-store', pageAttr: 'data-mac-page',
                slot: 'showcase-mac', initial: macWindowHTML('mactuner')
            }) +

            /* VALEURS */
            '<section class="section" id="valeurs"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.valuesEyebrow)) + '<h2>' + esc(pick(T.valuesTitle)) + '</h2></div>' +
            '<div class="values-grid">' + pick(T.values).map(function (v, i) {
                return '<article class="value-card reveal" style="--rd:' + (i * 80) + 'ms">' + svg(v[0]) +
                    '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p></article>';
            }).join('') + '</div></div></section>' +

            /* SOUTIEN */
            '<section class="section" id="soutenir" style="padding-top:0"><div class="wrap">' +
            '<div class="support-band reveal"><div>' +
            '<h2>' + esc(pick(T.supportTitle)) + '</h2><p>' + esc(pick(T.supportLead)) + '</p>' +
            '<div class="hero-actions"><a class="btn btn-solid" href="' + LIBERAPAY + '" target="_blank" rel="noopener">' + svg('heart') + esc(pick(T.supportCTA)) + '</a></div>' +
            '<p class="support-note">' + esc(pick(T.supportNote)) + '</p></div>' +
            '<div class="support-cards">' + pick(T.supportWays).map(function (w) {
                return '<div class="support-mini">' + svg(w[0]) + '<span><b>' + esc(w[1]) + '</b>' + esc(w[2]) + '</span></div>';
            }).join('') + '</div></div></div></section>' +

            /* PROFIL */
            '<section class="section" id="apropos" style="padding-top:40px"><div class="wrap">' +
            '<div class="profile-band reveal">' +
            '<div class="profile-frame"><img class="profile-photo" src="./assets/img/profile.jpg" alt="Rodolphe Vandaele"></div>' +
            '<div class="profile-copy">' + eyebrow(pick(T.profileEyebrow)) +
            '<h2>Rodolphe Vandaele</h2><p>' + esc(pick(T.profileBio)) + '</p>' +
            '<div class="stack-chips"><span>SwiftUI</span><span>MapKit</span><span>StoreKit</span><span>WidgetKit</span><span>Core Location</span><span>IOKit</span></div>' +
            '<div class="hero-actions"><a class="btn btn-ghost" href="' + withLang('./contact.html') + '">' + esc(pick(T.profileCTA)) + '</a>' +
            '<a class="link-arrow" href="' + withLang('./about.html') + '">' + esc(pick(T.profileMore)) + svg('arrow') + '</a></div>' +
            '</div></div></div></section>' +

            '</main>' + footerHTML();
    }

    /* Icônes des cartes fonctionnalités, alignées sur le contenu de chaque app */
    var FEAT_ICONS = {
        carbufrance: ['map', 'chart', 'book', 'gear', 'bolt', 'star'],
        irvefrance: ['map', 'bolt', 'star', 'chart'],
        toilettefrance: ['map', 'gear', 'heart', 'star'],
        defibfrance: ['map', 'gear', 'cross', 'star'],
        mactuner: ['chart', 'gear', 'broom', 'fan'],
        dnstuner: ['network', 'shield', 'list', 'chart', 'star', 'search']
    };

    function renderApp(key) {
        var app = APPS[key];
        document.title = app.name + ' · ' + pick(app.tag);
        var device = app.platform === 'mac' ? macWindowHTML(key) : iphoneHTML(key);
        var platformTag = app.platform === 'mac'
            ? '<span class="platform-tag platform-mac">' + svg('laptop') + 'macOS · Apple Silicon</span>'
            : '<span class="platform-tag platform-ios">' + svg('phone') + 'iPhone · iOS 18+</span>';
        var legal = app.platform === 'mac'
            ? '<div class="legal-links">' +
              '<a href="' + app.store + '" target="_blank" rel="noopener">' + svg('github') + 'Code source (MIT)</a>' +
              '<a href="' + app.store + '#readme" target="_blank" rel="noopener">' + svg('doc') + 'README</a></div>'
            : '<div class="legal-links">' +
              '<a href="' + withLang('./' + key + '-privacy.html') + '">' + svg('shield') + esc(pick(T.privacyLink)) + '</a>' +
              '<a href="' + withLang('./' + key + '-support.html') + '">' + svg('mail') + esc(pick(T.supportLink)) + '</a></div>';

        return navHTML('v2-app', app.platform === 'mac' ? 'mac' : 'ios') +
            '<main id="main" style="--accent:' + app.accent + '">' +

            '<section class="product-hero"><div class="wrap"><div class="product-layout">' +
            '<div class="product-copy">' +
            '<a class="link-quiet reveal" href="' + withLang('./index.html') + '#' + (app.platform === 'mac' ? 'macos' : 'ios') + '">← ' + esc(pick(T.backHome)) + '</a>' +
            '<div class="product-identity reveal" style="--rd:60ms"><img class="product-icon" src="./assets/img/' + key + '.png" alt="" width="88" height="88"' +
            ' style="view-transition-name:icone-' + key + '">' +
            '<div>' + platformTag + '<h1>' + app.name + '</h1><span class="product-tagline">' + esc(pick(app.tag)) + '</span></div></div>' +
            '<p class="reveal" style="--rd:120ms">' + esc(pick(app.desc)) + '</p>' +
            '<div class="product-actions reveal" style="--rd:180ms">' + storeBadge(app) + '</div></div>' +
            '<div class="reveal" style="--rd:200ms">' + device + '</div>' +
            '</div></div></section>' +

            '<section class="section" style="padding-top:60px"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.featEyebrow)) + '<h2>' + esc(pick(T.featTitle)) + '</h2></div>' +
            '<div class="feature-grid">' + pick(app.features).map(function (f, i) {
                var ico = (FEAT_ICONS[key] || [])[i] || 'star';
                return '<article class="feature-card reveal" style="--rd:' + (i * 70) + 'ms">' +
                    '<div class="feature-head"><span class="feature-ico">' + svg(ico) + '</span>' +
                    '<span class="feature-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span></div>' +
                    '<p>' + esc(f) + '</p></article>';
            }).join('') + '</div></div></section>' +

            (app.shots && app.shots.length ?
            '<section class="section shots-section" style="padding-top:0"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.shotsEyebrow)) + '<h2>' + esc(pick(T.shotsTitle)) + '</h2><p>' + esc(pick(T.shotsLead)) + '</p></div>' +
            '<div class="shots-gallery">' + app.shots.map(function (sh, i) {
                return '<figure class="shot reveal" style="--rd:' + (i * 90) + 'ms">' +
                    '<div class="shot-frame"><img src="./assets/img/shots/' + sh.file + '.jpg" alt="' + esc(pick(sh.caption)) + '" loading="lazy"></div>' +
                    '<figcaption>' + esc(pick(sh.caption)) + '</figcaption></figure>';
            }).join('') + '</div></div></section>' : '') +

            '<section class="section" style="padding-top:0"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.dataEyebrow)) + '<h2>' + esc(pick(T.dataTitle)) + '</h2></div>' +
            '<div class="data-grid">' +
            '<div class="data-card reveal"><span class="data-ico">' + svg('doc') + '</span><b>' + esc(pick(T.dataSources)) + '</b><p>' + esc(pick(app.sources)) + '</p></div>' +
            '<div class="data-card reveal" style="--rd:70ms"><span class="data-ico">' + svg('shield') + '</span><b>' + esc(pick(T.dataLocal)) + '</b><p>' + esc(pick(T.dataLocalText)) + '</p></div>' +
            '<div class="data-card reveal" style="--rd:140ms"><span class="data-ico">' + svg('chart') + '</span><b>' + esc(pick(T.dataBusiness)) + '</b><p>' + esc(pick(app.business)) + '</p></div>' +
            '</div></div></section>' +

            '<section class="section" style="padding-top:0"><div class="wrap">' +
            '<div class="legal-strip reveal">' +
            '<div class="section-head" style="margin-bottom:0;gap:10px">' + eyebrow(pick(T.legalEyebrow)) + '<h2 style="font-size:24px">' + esc(pick(T.legalTitle)) + '</h2></div>' +
            legal +
            (app.platform === 'mac' ? '' : '<p>' + esc(pick(T.legalNote)) + '</p>') +
            '</div></div></section>' +

            '<section class="section" style="padding-top:0"><div class="wrap">' +
            '<div class="support-band reveal"><div>' +
            '<h2>' + esc(pick(T.productSupport)) + '</h2><p>' + esc(pick(T.contactLead)) + '</p>' +
            '<div class="hero-actions"><a class="btn btn-solid" href="' + withLang('./contact.html?app=' + key) + '">' + svg('mail') + esc(pick(T.productSupportCTA)) + '</a></div></div>' +
            '<div class="support-cards">' + pick(T.tips).map(function (w, i) {
                return '<div class="support-mini"><span class="tip-num">0' + (i + 1) + '</span><span><b>' + esc(w[0]) + '</b>' + esc(w[1]) + '</span></div>';
            }).join('') + '</div></div></div></section>' +

            '</main>' + footerHTML();
    }

    /* Détecte ce qu'on peut de l'appareil pour pré-remplir le mail de support.
       L'utilisateur écrit en général depuis l'appareil concerné. */
    function deviceInfo() {
        var ua = navigator.userAgent, m;
        var dev = '', os = '';
        if ((m = ua.match(/iPhone OS (\d+)[._](\d+)/))) { dev = 'iPhone'; os = 'iOS ' + m[1] + '.' + m[2]; }
        else if ((m = ua.match(/iPad; CPU OS (\d+)[._](\d+)/))) { dev = 'iPad'; os = 'iPadOS ' + m[1] + '.' + m[2]; }
        else if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) { dev = 'iPad'; os = 'iPadOS'; }
        else if (/Macintosh/.test(ua)) { dev = 'Mac'; os = 'macOS'; }
        else if ((m = ua.match(/Android (\d+(?:\.\d+)?)/))) { dev = 'Android'; os = 'Android ' + m[1]; }
        else if (/Windows/.test(ua)) { dev = 'PC'; os = 'Windows'; }
        return { dev: dev, os: os, locale: navigator.language || '' };
    }

    function renderContact() {
        document.title = pick(T.navContact) + ' · Rodolphe Vandaele';
        var keys = IOS_ORDER.concat(MAC_ORDER);
        var param = new URLSearchParams(location.search).get('app');
        var active = keys.indexOf(param) !== -1 ? param : 'carbufrance';

        function composer(key) {
            var app = APPS[key];
            var di = deviceInfo();
            var body = pick(T.mailBody).join('\n')
                .replace('{app}', app.name)
                .replace('{device}', di.dev)
                .replace('{os}', di.os)
                .replace('{locale}', di.locale);
            var subject = app.name + ' · ' + pick(T.mailSubject);
            var mailto = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            var auto = '<em class="cf-auto">' + esc(pick(T.composerAuto)) + '</em>';
            return '<div class="composer reveal" id="composer" data-app="' + key + '" style="--accent:' + app.accent + '">' +
                '<div class="composer-head"><i></i><i></i><i></i><span data-cf-title>' + esc(subject) + '</span></div>' +
                '<div class="composer-body">' +
                '<label class="composer-field">' + esc(pick(T.composerTo)) + '<div>' + MAIL + '</div></label>' +
                '<label class="composer-field">' + esc(pick(T.composerSubject)) +
                '<input class="composer-input" data-cf="subject" value="' + esc(subject) + '" spellcheck="false"></label>' +
                '<div class="composer-duo">' +
                '<label class="composer-field">' + esc(pick(T.composerDevice)) + (di.dev ? auto : '') +
                '<input class="composer-input" data-cf="device" value="' + esc(di.dev) + '" placeholder="' + esc(pick(T.composerDevicePh)) + '" spellcheck="false"></label>' +
                '<label class="composer-field">' + esc(pick(T.composerOS)) + (di.os ? auto : '') +
                '<input class="composer-input" data-cf="os" value="' + esc(di.os) + '" placeholder="' + esc(pick(T.composerOSPh)) + '" spellcheck="false"></label>' +
                '</div>' +
                '<label class="composer-field">' + esc(pick(T.composerBody)) + '<pre>' + esc(body) + '</pre></label>' +
                '</div>' +
                '<div class="composer-actions">' +
                '<a class="btn btn-solid" data-cf-send href="' + mailto + '">' + svg('mail') + esc(pick(T.composerOpen)) + '</a>' +
                '<button class="btn btn-ghost" data-copy="' + MAIL + '">' + esc(pick(T.composerCopy)) + '</button>' +
                '<span class="copy-hint">' + esc(pick(T.composerHint)) + '</span>' +
                '</div></div>';
        }

        return navHTML('v2-contact', 'contact') +
            '<main id="main">' +
            '<section class="contact-hero"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.contactEyebrow)) +
            '<h2>' + esc(pick(T.contactTitle)) + '</h2><p>' + esc(pick(T.contactLead)) + '</p></div>' +
            '<div class="app-picker reveal" data-picker>' + keys.map(function (k) {
                return '<button class="app-pick' + (k === active ? ' is-on' : '') + '" data-pick="' + k + '" style="--accent:' + APPS[k].accent + '">' +
                    '<img src="./assets/img/' + k + '.png" alt="">' + APPS[k].name + '</button>';
            }).join('') + '</div>' +
            '<div id="composer-slot">' + composer(active) + '</div>' +
            '</div></section>' +

            '<section class="section"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.tipsEyebrow)) + '<h2>' + esc(pick(T.tipsTitle)) + '</h2></div>' +
            '<div class="tips-grid">' + pick(T.tips).map(function (t, i) {
                return '<article class="tip-card reveal" style="--rd:' + (i * 70) + 'ms"><span class="tip-num">0' + (i + 1) + '</span>' +
                    '<b>' + esc(t[0]) + '</b><p>' + esc(t[1]) + '</p></article>';
            }).join('') + '</div></div></section>' +
            '</main>' + footerHTML();
    }

    /* Une gamme et ses applications : titre discret, puis la grille. */
    function aboutGroup(label, keys) {
        return '<h3 class="about-group reveal">' + esc(label) + '</h3>' +
            '<div class="about-apps">' + keys.map(function (k, i) {
                var a = APPS[k];
                return '<a class="about-app reveal" style="--rd:' + (i * 60) + 'ms" href="' + withLang('./' + k + '.html') + '">' +
                    '<img src="./assets/img/' + k + '.png" alt=""><span><b>' + a.name + '</b><span>' +
                    esc(pick(a.tag)) + '</span></span></a>';
            }).join('') + '</div>';
    }

    function renderAbout() {
        document.title = pick(T.navAbout) + ' · Rodolphe Vandaele';
        return navHTML('v2-about', 'about') +
            '<main id="main">' +
            '<section class="about-hero"><div class="wrap">' +
            '<div class="profile-band reveal">' +
            '<div class="profile-frame"><img class="profile-photo" src="./assets/img/profile.jpg" alt="Rodolphe Vandaele"></div>' +
            '<div class="profile-copy">' + eyebrow(pick(T.aboutRole)) +
            '<h2>' + esc(pick(T.aboutTitle)) + '</h2>' +
            '<p>' + esc(pick(T.profileBio)) + '</p><p>' + esc(pick(T.aboutBio2)) + '</p>' +
            '<div class="stack-chips"><span>Swift</span><span>SwiftUI</span><span>MapKit</span><span>StoreKit</span><span>WidgetKit</span><span>Core Location</span><span>IOKit</span></div>' +
            '<div class="hero-actions"><a class="btn btn-solid" href="' + withLang('./contact.html') + '">' + svg('mail') + esc(pick(T.profileCTA)) + '</a></div>' +
            '</div></div></div></section>' +

            /* Les deux gammes, avant la liste des apps : le visiteur sait ce
               qu'il regarde avant de voir sept icônes d'un coup. */
            '<section class="section"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.aboutLinesEyebrow)) +
            '<h2>' + esc(pick(T.aboutLinesTitle)) + '</h2></div>' +
            '<div class="values-grid">' + pick(T.aboutLines).map(function (v, i) {
                return '<article class="value-card reveal" style="--rd:' + (i * 80) + 'ms">' + svg(v[0]) +
                    '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p></article>';
            }).join('') + '</div></div></section>' +

            '<section class="section" style="padding-top:0"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.aboutAppsTitle)) + '<h2>' + esc(pick(T.aboutAppsSub)) + '</h2></div>' +
            aboutGroup(pick(T.navIOS), IOS_ORDER) + aboutGroup(pick(T.navMac), MAC_ORDER) +
            '</div></section>' +

            /* La méthode, pas les valeurs de l'accueil : cette page répétait mot
               pour mot les trois cartes de la page d'accueil. */
            '<section class="section" style="padding-top:0"><div class="wrap">' +
            '<div class="section-head reveal">' + eyebrow(pick(T.aboutMethodEyebrow)) +
            '<h2>' + esc(pick(T.aboutMethodTitle)) + '</h2></div>' +
            '<div class="values-grid">' + pick(T.aboutMethod).map(function (v, i) {
                return '<article class="value-card reveal" style="--rd:' + (i * 80) + 'ms">' + svg(v[0]) +
                    '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p></article>';
            }).join('') + '</div></div></section>' +
            '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Animations : socle
       --------------------------------------------------------------------- */
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rafs = [];
    function loop(fn) {
        var id = { v: 0, stop: false };
        if (reduceMotion) { fn(performance.now()); return id; }
        function tick(t) { if (id.stop) return; fn(t); id.v = requestAnimationFrame(tick); }
        id.v = requestAnimationFrame(tick);
        rafs.push(id);
        return id;
    }
    function stopLoops() { rafs.forEach(function (id) { id.stop = true; cancelAnimationFrame(id.v); }); rafs = []; }

    /* Aléatoire déterministe (la scène change à chaque cycle, jamais au hasard sauvage) */
    function mulberry(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    function easeOutBack(p) { var c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
    function easeInOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
    /* Fondu des bords d'une scène. Les deux illustrations s'éteignent vers
       l'extérieur au lieu de s'arrêter net : c'est ce qui les pose dans la page
       plutôt que dans un cadre. Appliqué en fin de rendu, en retirant de
       l'alpha, donc quel que soit ce qui a été dessiné. */
    function fondreBords(ctx, w, h) {
        /* Rayons calés sur la **grande** dimension : sur la plus petite, le
           fondu mangeait la Corse et les bords de la carte mère. */
        var r = Math.max(w, h);
        var g = ctx.createRadialGradient(w / 2, h / 2, r * 0.46,
                                         w / 2, h / 2, r * 0.86);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    /* Point d'une courbe de Bézier quadratique. Partagé par la carte de France
       et la scène macOS : les deux dessinent des liaisons de la même façon. */
    function arcPoint(a, b, cpx, cpy, p) {
        var u = 1 - p;
        return [u * u * a.x + 2 * u * p * cpx + p * p * b.x,
                u * u * a.y + 2 * u * p * cpy + p * p * b.y];
    }
    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function attachReveals() {
        var els = document.querySelectorAll('.reveal');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            els.forEach(function (e) { e.classList.add('is-in'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        els.forEach(function (e) { io.observe(e); });
    }

    function attachTilt() {
        if (reduceMotion) return;
        document.querySelectorAll('.tilt').forEach(function (card) {
            /* Amorti à l'entrée, retour souple à la sortie (jamais de snap sec).
               La transition est posée sur les événements pour ne pas casser
               l'animation reveal qui partage la propriété transform. */
            card.addEventListener('pointerenter', function () {
                card.style.transition = 'transform 0.16s ease-out, border-color 0.3s';
            });
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', (x * 100) + '%');
                card.style.setProperty('--my', (y * 100) + '%');
                card.style.transform = 'perspective(900px) rotateY(' + ((x - 0.5) * 7) + 'deg) rotateX(' + ((0.5 - y) * 7) + 'deg)';
            });
            card.addEventListener('pointerleave', function () {
                card.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.7, 0.3, 1), border-color 0.3s';
                card.style.transform = '';
            });
        });
    }

    /* Une fenêtre suit doucement le pointeur en 3D autour de sa pose de base.
       Desktop avec vrai survol uniquement. */
    function windowTilt(win, scene, baseY, baseX, persp, ampY, ampX) {
        var ty = baseY, tx = baseX, cy = baseY, cx = baseX, raf = 0, armed = false;
        /* Neutraliser la transition CSS au premier survol seulement : le faire
           à l'attache casserait l'animation reveal de l'élément */
        function arm() {
            if (armed) return;
            armed = true;
            win.style.transition = 'none';
        }
        function step() {
            cy += (ty - cy) * 0.09;
            cx += (tx - cx) * 0.09;
            win.style.transform = 'perspective(' + persp + 'px) rotateY(' + cy.toFixed(2) + 'deg) rotateX(' + cx.toFixed(2) + 'deg)';
            if (Math.abs(ty - cy) + Math.abs(tx - cx) > 0.01) raf = requestAnimationFrame(step);
            else raf = 0;
        }
        function wake() { if (!raf) raf = requestAnimationFrame(step); }
        scene.addEventListener('pointermove', function (e) {
            arm();
            var r = scene.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            ty = baseY + (x - 0.5) * ampY;
            tx = baseX + (0.5 - y) * ampX;
            wake();
        });
        scene.addEventListener('pointerleave', function () { ty = baseY; tx = baseX; wake(); });
    }
    function attachMacTilt() {
        if (reduceMotion) return;
        if (!matchMedia('(hover: hover) and (min-width: 1021px)').matches) return;
        var win = document.querySelector('.mac-window');
        if (win) windowTilt(win, win.closest('.mac-scene') || win, -5, 2, 1400, 8, 6);
    }

    function attachCounts() {
        var els = document.querySelectorAll('[data-count]');
        if (!els.length) return;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            els.forEach(function (e) { e.textContent = e.getAttribute('data-count'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                io.unobserve(en.target);
                var target = +en.target.getAttribute('data-count'), t0 = performance.now();
                (function step(t) {
                    var p = Math.min((t - t0) / 900, 1);
                    en.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) requestAnimationFrame(step);
                })(t0);
            });
        }, { threshold: 0.5 });
        els.forEach(function (e) { io.observe(e); });
    }

    function attachNavChrome() {
        var nav = document.getElementById('nav');
        if (nav) {
            var onScroll = function () { nav.classList.toggle('is-scrolled', scrollY > 12); };
            addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
        var burger = document.getElementById('burger');
        if (burger) burger.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
        document.querySelectorAll('.lang-switch button').forEach(function (b) {
            b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
        });
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
        });
    }

    /* ---------------------------------------------------------------------
       Hero : la France, contour fidèle (IGN simplifié) + villes + arcs
       --------------------------------------------------------------------- */
    var MAINLAND = [[6.99,47.49],[6.88,47.36],[7.06,47.34],[6.63,47.0],[6.5,46.97],[6.43,46.75],[6.11,46.58],[6.17,46.37],[5.96,46.13],[6.28,46.22],[6.28,46.35],[6.72,46.41],[6.86,46.28],[7.04,45.92],[6.82,45.84],[7.0,45.5],[7.18,45.41],[7.14,45.26],[6.63,45.1],[6.75,44.91],[7.01,44.84],[6.85,44.53],[7.01,44.24],[7.43,44.12],[7.68,44.17],[7.53,43.79],[6.73,43.41],[6.56,43.19],[6.13,43.08],[5.34,43.21],[5.32,43.35],[4.83,43.33],[4.55,43.45],[4.13,43.53],[3.26,43.19],[3.05,42.84],[3.17,42.43],[2.65,42.34],[2.03,42.35],[1.71,42.5],[1.44,42.6],[0.7,42.85],[0.66,42.69],[-0.04,42.69],[-0.31,42.84],[-0.75,42.96],[-1.44,43.05],[-1.79,43.38],[-1.38,43.66],[-1.25,44.47],[-1.08,45.51],[-0.74,45.09],[-1.24,44.66],[-1.16,45.47],[-0.71,45.33],[-1.13,45.66],[-0.99,45.95],[-1.24,46.02],[-1.12,46.26],[-1.79,46.49],[-2.14,46.82],[-2.02,47.08],[-2.24,47.13],[-1.74,47.22],[-2.53,47.3],[-2.42,47.41],[-2.9,47.56],[-3.13,47.47],[-3.35,47.71],[-4.16,47.7],[-4.34,47.8],[-4.7,48.03],[-4.29,48.11],[-4.53,48.19],[-4.55,48.34],[-4.79,48.4],[-4.56,48.57],[-4.72,48.55],[-4.36,48.67],[-3.99,48.72],[-3.85,48.61],[-3.55,48.81],[-3.24,48.86],[-3.09,48.79],[-2.69,48.53],[-2.44,48.65],[-2.29,48.55],[-1.98,48.7],[-1.86,48.62],[-1.36,48.65],[-1.57,49.21],[-1.6,49.65],[-1.94,49.72],[-1.24,49.6],[-1.15,49.36],[-0.22,49.28],[0.29,49.43],[0.07,49.51],[0.62,49.86],[1.19,49.94],[1.55,50.21],[1.53,50.37],[1.66,50.35],[1.56,50.71],[1.61,50.88],[2.55,51.09],[2.6,50.99],[3.16,50.79],[3.28,50.53],[3.66,50.46],[3.71,50.3],[4.03,50.34],[4.22,50.26],[4.14,49.98],[4.69,50.0],[4.86,50.14],[4.79,49.98],[5.44,49.55],[5.82,49.55],[6.37,49.47],[6.74,49.19],[7.06,49.12],[7.63,49.05],[8.23,48.97],[7.58,48.12],[7.57,47.62],[7.51,47.5]];
    var CORSICA = [[9.42,42.72],[9.45,42.99],[9.34,43.0],[9.35,42.74],[9.29,42.68],[9.34,42.61],[8.74,42.57],[8.66,42.52],[8.72,42.44],[8.55,42.37],[8.75,42.26],[8.54,42.24],[8.69,42.18],[8.57,42.16],[8.7,42.1],[8.62,41.96],[8.79,41.92],[8.61,41.9],[8.86,41.75],[8.78,41.63],[9.09,41.51],[9.16,41.38],[9.22,41.63],[9.4,41.66],[9.55,42.15],[9.53,42.55]];
    var CITIES = [
        { n: 'Paris', p: [2.35, 48.86], lbl: false },
        { n: 'Lyon', p: [4.84, 45.76], lbl: false },
        { n: 'Marseille', p: [5.37, 43.30], lbl: false },
        { n: 'Toulouse', p: [1.44, 43.60], lbl: false },
        { n: 'Bordeaux', p: [-0.58, 44.84], lbl: false },
        { n: 'Nantes', p: [-1.55, 47.22], lbl: true },
        { n: 'Lille', p: [3.06, 50.63], lbl: true },
        { n: 'Strasbourg', p: [7.75, 48.57], lbl: false },
        { n: 'Rennes', p: [-1.68, 48.11], lbl: false },
        { n: 'Nice', p: [7.26, 43.71], lbl: true },
        { n: 'Clermont', p: [3.08, 45.78], lbl: false },
        { n: 'Ajaccio', p: [8.74, 41.93], lbl: true }
    ];
    /* Icône d'app iPhone posée sur sa ville (MacTuner en est absent : il n'est pas une app France) */
    var MAP_APP_PINS = [
        ['toilettefrance', 'Paris'],
        ['irvefrance', 'Lyon'],
        ['carbufrance', 'Bordeaux'],
        ['defibfrance', 'Marseille']
    ];

    /* ----------------------------------------------------------------------
       Fond animé du héro
       ----------------------------------------------------------------------
       Le héro n'a plus d'illustration depuis que la carte est descendue dans la
       section iPhone. Plutôt qu'un aplat, il porte la même matière que les deux
       scènes : un semis de points qui scintille et dérive, et trois ondes
       lentes. Même palette, même déterminisme, même sortie sous
       `prefers-reduced-motion`.

       Volontairement discret : c'est un fond, pas un sujet. Les opacités
       plafonnent à 0,5 pour le semis et 0,1 pour les ondes.
       -------------------------------------------------------------------- */
    function heroBackdrop() {
        var cv = document.getElementById('hero-bg');
        if (!cv) return;
        var ctx = cv.getContext('2d');
        var dpr = Math.min(devicePixelRatio || 1, 2);
        var dots = [], lastW = 0, lastH = 0;

        function size() {
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w || !h || (w === lastW && h === lastH)) return;
            lastW = w; lastH = h;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var rnd = mulberry(23);
            dots = [];
            for (var i = 0; i < 110; i++) {
                var r = rnd();
                dots.push({
                    x: rnd() * w, y: rnd() * h,
                    c: r < 0.7 ? '#4d7dff' : r < 0.88 ? '#8eb8ff' : r < 0.96 ? '#f2f5fd' : '#f5483c',
                    rr: 0.7 + rnd() * 1.6,
                    ph: rnd() * Math.PI * 2,
                    sp: 0.4 + rnd() * 0.8,
                    /* dérive très lente, en pixels par seconde */
                    vx: (rnd() - 0.5) * 5,
                    vy: -(3 + rnd() * 7)
                });
            }
        }
        size();
        addEventListener('resize', size);

        return loop(function (t) {
            if (!cv.isConnected) return;
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w) return;
            ctx.clearRect(0, 0, w, h);
            var sec = t / 1000;

            /* Trois ondes lentes, décalées : elles donnent le mouvement de fond
               sans jamais attirer l'œil. */
            for (var k = 0; k < 3; k++) {
                var baseY = h * (0.42 + k * 0.13);
                var amp = h * (0.05 + k * 0.018);
                var grad = ctx.createLinearGradient(0, 0, w, 0);
                grad.addColorStop(0, 'rgba(77,125,255,0)');
                grad.addColorStop(0.5, k === 1 ? 'rgba(142,184,255,0.10)' : 'rgba(77,125,255,0.09)');
                grad.addColorStop(1, 'rgba(77,125,255,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                for (var x = 0; x <= w; x += 8) {
                    var y = baseY
                        + Math.sin(x / (190 + k * 60) + sec * (0.16 + k * 0.05) + k * 1.7) * amp
                        + Math.sin(x / 90 - sec * 0.1) * amp * 0.22;
                    x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
                }
                ctx.stroke();
            }

            /* Semis dérivant, exactement la matière des deux scènes. */
            dots.forEach(function (p) {
                var x = p.x + p.vx * sec, y = p.y + p.vy * sec;
                /* enroulement : le semis ne se vide jamais */
                x = ((x % w) + w) % w;
                y = ((y % h) + h) % h;
                var tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(sec * p.sp + p.ph));
                ctx.globalAlpha = tw * 0.5;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(x, y, p.rr, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        });
    }

    /* ----------------------------------------------------------------------
       Carte mère macOS
       ----------------------------------------------------------------------
       Pendant de la carte de France, et construit sur le même principe : un
       seul objet, dense, dont l'intérieur porte la matière. La France a un
       littoral et un semis ; la carte a un substrat, un plan de masse pointillé,
       et surtout **des faisceaux de pistes**. C'est le routage qui fait qu'une
       carte se reconnaît, pas les composants : une grille de rectangles ne
       ressemble à rien, une version précédente l'a prouvé.

       Ce qui rend l'image crédible est inchangé : une icône n'est jamais posée
       au hasard. MacTuner sur le processeur, DNSTuner sur le contrôleur réseau.
       Les signaux ne relient pas deux points tirés au sort, ils parcourent les
       pistes réellement tracées.

       Coordonnées en unités de scène (100 × 100) projetées à la taille du
       canvas ; **les rayons de points restent en pixels**, sinon ils passent
       sous le pixel dès que la scène rétrécit et le semis disparaît.
       -------------------------------------------------------------------- */
    var PCB = {
        carte: { x0: 3, y0: 3, x1: 97, y1: 97 },
        /* Composants. `app` désigne l'icône qui vient s'y poser. */
        puces: [
            { x0: 33, y0: 31, x1: 67, y1: 59, r: 2.4, soc: true, app: 'mactuner', label: 0 },
            { x0: 8,  y0: 16, x1: 27, y1: 28, r: 1.2, label: 1 },
            { x0: 73, y0: 16, x1: 92, y1: 28, r: 1.2, label: 1 },
            { x0: 7,  y0: 66, x1: 27, y1: 80, r: 1.4, app: 'dnstuner', label: 2 },
            { x0: 73, y0: 66, x1: 93, y1: 80, r: 1.4, label: 3 }
        ],
        /* Connecteur de bord, en bas : la carte se branche quelque part. */
        connecteur: { x0: 33, y0: 92, x1: 67, y1: 96, broches: 15 }
    };

    function chipCanvas() {
        var cv = document.getElementById('macos-canvas');
        if (!cv) return;
        var pinsBox = document.getElementById('macos-pins');
        var ctx = cv.getContext('2d');
        var dpr = Math.min(devicePixelRatio || 1, 2);
        var S = 1, ox = 0, oy = 0;
        var masse = [], pistes = [], vias = [], passifs = [], routes = [], pulses = [];
        var mouse = { x: 0.5, y: 0.5 }, par = { x: 0, y: 0 };
        var lastSpawn = 0, lastW = 0, lastH = 0;

        function px(x, y) { return [ox + x * S, oy + y * S]; }
        function dansPuce(x, y, marge) {
            return PCB.puces.some(function (c) {
                return x > c.x0 - marge && x < c.x1 + marge && y > c.y0 - marge && y < c.y1 + marge;
            });
        }

        /* Un faisceau : des pistes parallèles qui partent d'un bord de composant,
           s'écartent, prennent un coude à 45° puis filent. C'est ce motif, et non
           les composants, qui fait lire une carte mère. */
        function faisceau(puce, cote, n, longueur, sens, rnd) {
            var out = [];
            for (var i = 0; i < n; i++) {
                var t = (i + 1) / (n + 1);
                var d = 3 + i * 1.7 + rnd() * 1.2;      // écartement croissant
                var coude = 3 + rnd() * 3;
                var pts;
                if (cote === 'g' || cote === 'd') {
                    var y0 = puce.y0 + (puce.y1 - puce.y0) * t;
                    var x0 = cote === 'g' ? puce.x0 : puce.x1;
                    var dir = cote === 'g' ? -1 : 1;
                    var y1 = y0 + sens * coude;
                    pts = [[x0, y0], [x0 + dir * d, y0],
                           [x0 + dir * (d + coude), y1],
                           [x0 + dir * longueur, y1]];
                } else {
                    var x1 = puce.x0 + (puce.x1 - puce.x0) * t;
                    var yy0 = cote === 'h' ? puce.y0 : puce.y1;
                    var dirY = cote === 'h' ? -1 : 1;
                    var xx1 = x1 + sens * coude;
                    pts = [[x1, yy0], [x1, yy0 + dirY * d],
                           [xx1, yy0 + dirY * (d + coude)],
                           [xx1, yy0 + dirY * longueur]];
                }
                out.push({ pts: pts, large: rnd() < 0.22 });
            }
            return out;
        }

        function longueurs(pts) {
            var lens = [0], total = 0;
            for (var k = 1; k < pts.length; k++) {
                total += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
                lens.push(total);
            }
            return { pts: pts, lens: lens, total: total || 1 };
        }
        function surTrajet(path, t) {
            var d = Math.max(0, Math.min(1, t)) * path.total;
            for (var k = 1; k < path.pts.length; k++) {
                if (d <= path.lens[k] || k === path.pts.length - 1) {
                    var seg = path.lens[k] - path.lens[k - 1] || 1;
                    var u = (d - path.lens[k - 1]) / seg;
                    return [path.pts[k - 1][0] + (path.pts[k][0] - path.pts[k - 1][0]) * u,
                            path.pts[k - 1][1] + (path.pts[k][1] - path.pts[k - 1][1]) * u];
                }
            }
            return path.pts[0];
        }

        function size() {
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w || !h || (w === lastW && h === lastH)) return;
            lastW = w; lastH = h;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            S = Math.min((w - 18) / 100, (h - 18) / 100);
            ox = (w - 100 * S) / 2;
            oy = (h - 100 * S) / 2;

            var rnd = mulberry(29);

            /* Plan de masse : semis fin sur tout le substrat, hors composants. */
            masse = [];
            var garde = 0;
            while (masse.length < 210 && garde++ < 14000) {
                var x = 5 + rnd() * 90, y = 5 + rnd() * 90;
                if (dansPuce(x, y, 1)) continue;
                var r = rnd();
                masse.push({
                    x: x, y: y,
                    c: r < 0.7 ? '#4d7dff' : r < 0.88 ? '#8eb8ff' : r < 0.96 ? '#f2f5fd' : '#f5483c',
                    rr: 0.6 + rnd() * 1.3,
                    ph: rnd() * Math.PI * 2,
                    sp: 0.5 + rnd()
                });
            }

            /* Faisceaux : le processeur irrigue les quatre côtés, les
               contrôleurs renvoient vers les bords. */
            var soc = PCB.puces[0];
            pistes = []
                .concat(faisceau(soc, 'g', 6, 26, -1, rnd))
                .concat(faisceau(soc, 'd', 6, 26, 1, rnd))
                .concat(faisceau(soc, 'h', 5, 22, -1, rnd))
                .concat(faisceau(soc, 'b', 6, 30, 1, rnd))
                .concat(faisceau(PCB.puces[1], 'b', 3, 14, 1, rnd))
                .concat(faisceau(PCB.puces[2], 'b', 3, 14, -1, rnd))
                .concat(faisceau(PCB.puces[3], 'h', 3, 16, 1, rnd))
                .concat(faisceau(PCB.puces[4], 'h', 3, 16, -1, rnd));

            /* Vias aux coudes, comme sur une vraie carte. */
            vias = [];
            pistes.forEach(function (t2) {
                if (rnd() < 0.55) vias.push(t2.pts[2]);
                if (rnd() < 0.25) vias.push(t2.pts[1]);
            });

            /* Composants passifs : les petites capacités semées entre les pistes. */
            passifs = [];
            garde = 0;
            while (passifs.length < 22 && garde++ < 4000) {
                var px2 = 7 + rnd() * 86, py2 = 7 + rnd() * 86;
                if (dansPuce(px2, py2, 2.5)) continue;
                passifs.push({ x: px2, y: py2, w: 1.6 + rnd() * 1.4, vertical: rnd() < 0.5 });
            }

            /* Les signaux empruntent les pistes du processeur. */
            routes = pistes.slice(0, 23).map(function (t3) { return longueurs(t3.pts); });

            if (pinsBox) {
                pinsBox.innerHTML = PCB.puces.filter(function (c) { return c.app; })
                    .map(function (c, i) {
                        var q = px((c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2);
                        return '<span class="map-app-pin" style="left:' + q[0].toFixed(1) +
                            'px;top:' + q[1].toFixed(1) + 'px;--d:-' + (i * 1.4) +
                            's;--pd:' + (0.7 + i * 0.13) + 's;--glow:' + APPS[c.app].accent + '66">' +
                            '<span class="pin-core"><img src="./assets/img/' + c.app + '.png" alt=""></span></span>';
                    }).join('');
            }
        }

        size();
        addEventListener('resize', size);
        var band = cv.closest('.range-scene');
        if (band) band.addEventListener('pointermove', function (e) {
            var r = band.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) / r.width;
            mouse.y = (e.clientY - r.top) / r.height;
        });

        function chemin(pts) {
            ctx.beginPath();
            pts.forEach(function (p, i) {
                var q = px(p[0], p[1]);
                i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
            });
        }
        function boite(c, radius) {
            var a = px(c.x0, c.y0), b = px(c.x1, c.y1);
            ctx.beginPath();
            ctx.roundRect(a[0], a[1], b[0] - a[0], b[1] - a[1], radius * S);
        }

        return loop(function (t) {
            if (!cv.isConnected) return;
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w) return;
            ctx.clearRect(0, 0, w, h);

            par.x += ((mouse.x - 0.5) * 12 - par.x) * 0.04;
            par.y += ((mouse.y - 0.5) * 10 - par.y) * 0.04;
            ctx.save();
            ctx.translate(par.x, par.y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            /* Aucun cadre : la carte n'est pas un objet posé sur la page, elle
               s'y fond. Ce sont les pistes et le semis qui en dessinent
               l'étendue, exactement comme le littoral et le semis dessinent la
               France sans qu'on ait besoin d'encadrer la carte. */

            /* Plan de masse. Rayons en pixels : c'est ce qui les rend visibles. */
            masse.forEach(function (p) {
                var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 1000 * p.sp + p.ph));
                var q = px(p.x, p.y);
                ctx.globalAlpha = tw * 0.75;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(q[0], q[1], p.rr, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            /* Pistes. */
            pistes.forEach(function (tr) {
                ctx.strokeStyle = tr.large ? 'rgba(140,168,255,0.34)' : 'rgba(140,168,255,0.2)';
                ctx.lineWidth = tr.large ? 1.7 : 1;
                chemin(tr.pts);
                ctx.stroke();
            });

            /* Vias. */
            vias.forEach(function (v) {
                var q = px(v[0], v[1]);
                ctx.strokeStyle = 'rgba(140,168,255,0.42)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(q[0], q[1], Math.max(1.6, S * 0.05), 0, Math.PI * 2);
                ctx.stroke();
            });

            /* Passifs. */
            ctx.fillStyle = 'rgba(140,168,255,0.16)';
            ctx.strokeStyle = 'rgba(140,168,255,0.3)';
            ctx.lineWidth = 0.9;
            passifs.forEach(function (c) {
                var lg = c.vertical ? 0.9 : c.w, ht = c.vertical ? c.w : 0.9;
                boite({ x0: c.x - lg / 2, y0: c.y - ht / 2, x1: c.x + lg / 2, y1: c.y + ht / 2 }, 0.3);
                ctx.fill();
                ctx.stroke();
            });

            /* Connecteur de bord. */
            var cn = PCB.connecteur;
            for (var i = 0; i < cn.broches; i++) {
                var bx = cn.x0 + (cn.x1 - cn.x0) * (i + 0.5) / cn.broches;
                boite({ x0: bx - 0.7, y0: cn.y0, x1: bx + 0.7, y1: cn.y1 }, 0.2);
                ctx.fillStyle = 'rgba(140,168,255,0.24)';
                ctx.fill();
            }

            /* Composants, leurs broches et leur nom. */
            var noms = pick(T.rigLabels);
            PCB.puces.forEach(function (c) {
                boite(c, c.r);
                ctx.fillStyle = 'rgba(10,14,26,0.85)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(140,168,255,0.42)';
                ctx.lineWidth = 1.3;
                ctx.stroke();

                /* Broches sur les quatre côtés. */
                ctx.strokeStyle = 'rgba(140,168,255,0.3)';
                ctx.lineWidth = 1;
                var n = c.soc ? 14 : 7;
                for (var j = 0; j < n; j++) {
                    var u = (j + 0.5) / n;
                    var xx = c.x0 + (c.x1 - c.x0) * u, yy = c.y0 + (c.y1 - c.y0) * u;
                    [[xx, c.y0, xx, c.y0 - 1.4], [xx, c.y1, xx, c.y1 + 1.4],
                     [c.x0, yy, c.x0 - 1.4, yy], [c.x1, yy, c.x1 + 1.4, yy]].forEach(function (l) {
                        var a = px(l[0], l[1]), b = px(l[2], l[3]);
                        ctx.beginPath();
                        ctx.moveTo(a[0], a[1]);
                        ctx.lineTo(b[0], b[1]);
                        ctx.stroke();
                    });
                }

                /* Le die du processeur : la trame fine qui se voit sur une puce. */
                if (c.soc) {
                    ctx.strokeStyle = 'rgba(140,168,255,0.13)';
                    ctx.lineWidth = 0.7;
                    for (var gx = c.x0 + 3; gx < c.x1 - 2; gx += 3) {
                        var a1 = px(gx, c.y0 + 2.5), a2 = px(gx, c.y1 - 2.5);
                        ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.stroke();
                    }
                    for (var gy = c.y0 + 3; gy < c.y1 - 2; gy += 3) {
                        var b1 = px(c.x0 + 2.5, gy), b2 = px(c.x1 - 2.5, gy);
                        ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
                    }
                }

                /* Le nom se pose **sous** le composant, jamais dedans : au
                   centre, l'icône de l'application le recouvrait. C'est aussi
                   ce que fait la carte, dont les noms de villes sont à côté du
                   point et non dessus. */
                var q = px((c.x0 + c.x1) / 2, c.y1 + 3.4);
                ctx.font = '600 ' + Math.max(7, S * 0.1).toFixed(1) +
                    'px ui-monospace, SFMono-Regular, Menlo, monospace';
                ctx.fillStyle = 'rgba(214,226,255,0.55)';
                ctx.textAlign = 'center';
                ctx.fillText(noms[c.label], q[0], q[1]);
                ctx.textAlign = 'start';
            });

            /* Signaux le long des pistes réellement tracées. */
            if (!reduceMotion) {
                if (t - lastSpawn > 620 && pulses.length < 7 && routes.length) {
                    lastSpawn = t;
                    var r3 = routes[Math.floor(Math.random() * routes.length)];
                    var teintes = ['#6a93ff', '#8eb8ff', '#f2f5fd'];
                    pulses.push({
                        route: r3, t0: t, dur: 900 + r3.total * 22,
                        c: teintes[Math.floor(Math.random() * teintes.length)],
                        retour: Math.random() < 0.45
                    });
                }
                pulses = pulses.filter(function (u) {
                    var p = (t - u.t0) / u.dur;
                    if (p > 1.2) return false;
                    var head = easeInOutCubic(clamp01(p));
                    var tail = easeInOutCubic(clamp01(p - 0.3));
                    if (u.retour) { head = 1 - head; tail = 1 - tail; }
                    ctx.strokeStyle = u.c;
                    ctx.lineWidth = 1.6;
                    var STEPS = 16;
                    for (var s2 = 0; s2 < STEPS; s2++) {
                        var p1 = tail + (head - tail) * (s2 / STEPS);
                        var p2 = tail + (head - tail) * ((s2 + 1) / STEPS);
                        var q1 = surTrajet(u.route, p1), q2 = surTrajet(u.route, p2);
                        var a1b = px(q1[0], q1[1]), a2b = px(q2[0], q2[1]);
                        ctx.globalAlpha = 0.62 * (s2 / STEPS) * (p > 1 ? 1 - (p - 1) / 0.2 : 1);
                        ctx.beginPath();
                        ctx.moveTo(a1b[0], a1b[1]);
                        ctx.lineTo(a2b[0], a2b[1]);
                        ctx.stroke();
                    }
                    if (p <= 1) {
                        var hp = surTrajet(u.route, head);
                        var hq = px(hp[0], hp[1]);
                        ctx.save();
                        ctx.globalAlpha = 0.95;
                        ctx.shadowColor = u.c;
                        ctx.shadowBlur = 7;
                        ctx.fillStyle = u.c;
                        ctx.beginPath();
                        ctx.arc(hq[0], hq[1], 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    ctx.globalAlpha = 1;
                    return true;
                });
            }

            ctx.restore();
            fondreBords(ctx, w, h);
        });
    }

    function franceCanvas() {
        var cv = document.getElementById('ios-canvas');
        if (!cv) return;
        var pinsBox = document.getElementById('ios-pins');
        var ctx = cv.getContext('2d');
        var dpr = Math.min(devicePixelRatio || 1, 2);
        var proj, mainlandPx, corsicaPx, dots = [], cities = [], arcs = [];
        var mouse = { x: 0.5, y: 0.5 }, par = { x: 0, y: 0 };
        var lastSpawn = 0;
        var K = Math.cos(46.5 * Math.PI / 180); /* compression des longitudes */

        function makeProj(w, h) {
            var lonMin = -5.1, lonMax = 9.9, latMin = 41.2, latMax = 51.3;
            var spanX = (lonMax - lonMin) * K, spanY = latMax - latMin;
            var s = Math.min((w - 40) / spanX, (h - 60) / spanY);
            var ox = (w - spanX * s) / 2, oy = (h - spanY * s) / 2;
            return function (pt) {
                return [ox + (pt[0] - lonMin) * K * s, oy + (latMax - pt[1]) * s];
            };
        }
        function inPoly(x, y, poly) {
            var inside = false;
            for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                if ((poly[i][1] > y) !== (poly[j][1] > y) &&
                    x < (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) inside = !inside;
            }
            return inside;
        }
        var lastW = 0, lastH = 0;
        function size() {
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w || !h) return;
            /* Ignorer les resize sans effet (barre d'URL mobile) : sinon les
               icônes seraient reconstruites et rejoueraient leur chute */
            if (w === lastW && h === lastH) return;
            lastW = w; lastH = h;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            proj = makeProj(w, h);
            mainlandPx = MAINLAND.map(proj);
            corsicaPx = CORSICA.map(proj);
            cities = CITIES.map(function (c) {
                var p = proj(c.p);
                return { n: c.n.toUpperCase(), x: p[0], y: p[1], lbl: c.lbl };
            });
            /* semis de points intérieurs, déterministe */
            var rnd = mulberry(42);
            dots = [];
            var guard = 0;
            while (dots.length < 130 && guard++ < 9000) {
                var x = rnd() * w, y = rnd() * h;
                if (inPoly(x, y, mainlandPx)) {
                    var r = rnd();
                    dots.push({
                        x: x, y: y,
                        c: r < 0.68 ? '#4d7dff' : r < 0.86 ? '#8eb8ff' : r < 0.95 ? '#f2f5fd' : '#f5483c',
                        r: 0.8 + rnd() * 1.5,
                        ph: rnd() * Math.PI * 2,
                        sp: 0.5 + rnd()
                    });
                }
            }
            /* icônes d'apps sur leurs villes */
            if (pinsBox) {
                pinsBox.innerHTML = MAP_APP_PINS.map(function (mp, i) {
                    var city = cities.filter(function (c) { return c.n === mp[1].toUpperCase(); })[0];
                    if (!city) return '';
                    return '<span class="map-app-pin" style="left:' + city.x.toFixed(1) + 'px;top:' + (city.y - 8).toFixed(1) +
                        'px;--d:-' + (i * 1.4) + 's;--pd:' + (0.8 + i * 0.13) + 's;--glow:' + APPS[mp[0]].accent + '66">' +
                        '<span class="pin-core"><img src="./assets/img/' + mp[0] + '.png" alt=""></span></span>';
                }).join('');
            }
        }
        size();
        addEventListener('resize', size);
        var hero = cv.closest('.range-scene');
        if (hero) hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) / r.width;
            mouse.y = (e.clientY - r.top) / r.height;
        });

        function drawOutline(pts, glow) {
            ctx.beginPath();
            pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
            ctx.closePath();
            if (glow) {
                ctx.save();
                ctx.shadowColor = 'rgba(77,125,255,0.55)';
                ctx.shadowBlur = 14;
                ctx.strokeStyle = 'rgba(140,168,255,0.34)';
                ctx.lineWidth = 1.4;
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = 'rgba(77,125,255,0.035)';
                ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(140,168,255,0.3)';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
        }
        function spawnArc(t) {
            var i = Math.floor(Math.random() * cities.length);
            var j = Math.floor(Math.random() * cities.length);
            if (i === j) return;
            var a = cities[i], b = cities[j];
            var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            var dx = b.x - a.x, dy = b.y - a.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < 40) return;
            var lift = d * 0.24 * (Math.random() < 0.5 ? 1 : -1);
            var r = Math.random();
            arcs.push({
                a: a, b: b,
                cpx: mx - dy / d * lift, cpy: my + dx / d * lift,
                t0: t, dur: 1500 + d * 3,
                c: r < 0.62 ? '#6a93ff' : r < 0.86 ? '#f2f5fd' : '#f5483c'
            });
        }

        return loop(function (t) {
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w) return;
            ctx.clearRect(0, 0, w, h);
            /* parallaxe douce */
            par.x += ((mouse.x - 0.5) * 14 - par.x) * 0.04;
            par.y += ((mouse.y - 0.5) * 10 - par.y) * 0.04;
            ctx.save();
            ctx.translate(par.x, par.y);

            drawOutline(mainlandPx, true);
            drawOutline(corsicaPx, false);

            /* semis scintillant */
            dots.forEach(function (p) {
                var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 1000 * p.sp + p.ph));
                ctx.globalAlpha = tw * 0.8;
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            /* arcs de liaison entre villes */
            if (!reduceMotion) {
                if (t - lastSpawn > 1600 && arcs.length < 4) { lastSpawn = t; spawnArc(t); }
                arcs = arcs.filter(function (arc) {
                    var p = (t - arc.t0) / arc.dur;
                    if (p > 1.35) return false;
                    var head = easeInOutCubic(clamp01(p));
                    var tail = easeInOutCubic(clamp01(p - 0.22));
                    ctx.strokeStyle = arc.c;
                    ctx.lineWidth = 1.3;
                    ctx.lineCap = 'round';
                    var STEPS = 26;
                    for (var s = 0; s < STEPS; s++) {
                        var p1 = tail + (head - tail) * (s / STEPS);
                        var p2 = tail + (head - tail) * ((s + 1) / STEPS);
                        if (p2 - p1 <= 0) continue;
                        var q1 = arcPoint(arc.a, arc.b, arc.cpx, arc.cpy, p1);
                        var q2 = arcPoint(arc.a, arc.b, arc.cpx, arc.cpy, p2);
                        ctx.globalAlpha = 0.55 * (s / STEPS) * (p > 1 ? 1 - (p - 1) / 0.35 : 1);
                        ctx.beginPath();
                        ctx.moveTo(q1[0], q1[1]);
                        ctx.lineTo(q2[0], q2[1]);
                        ctx.stroke();
                    }
                    /* tête lumineuse, avec un vrai éclat */
                    if (p <= 1) {
                        var hp = arcPoint(arc.a, arc.b, arc.cpx, arc.cpy, head);
                        ctx.save();
                        ctx.globalAlpha = 0.95;
                        ctx.shadowColor = arc.c;
                        ctx.shadowBlur = 7;
                        ctx.fillStyle = arc.c;
                        ctx.beginPath();
                        ctx.arc(hp[0], hp[1], 2.1, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else {
                        /* ondulation à l'arrivée */
                        var rp = (p - 1) / 0.35;
                        ctx.globalAlpha = 0.5 * (1 - rp);
                        ctx.strokeStyle = arc.c;
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.arc(arc.b.x, arc.b.y, 4 + rp * 14, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                    return true;
                });
            }

            /* villes */
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
            cities.forEach(function (c) {
                var pulse = 0.5 + 0.5 * Math.sin(t / 1100 + c.x);
                ctx.fillStyle = 'rgba(180,200,255,' + (0.55 + 0.3 * pulse).toFixed(2) + ')';
                ctx.beginPath();
                ctx.arc(c.x, c.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
                if (c.lbl) {
                    ctx.strokeStyle = 'rgba(120,152,255,' + (0.16 * pulse).toFixed(2) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, 3.5 + pulse * 1.5, 0, Math.PI * 2);
                    ctx.stroke();
                }
                if (c.lbl) {
                    ctx.fillStyle = 'rgba(154,164,192,0.75)';
                    ctx.fillText(c.n, c.x + 8, c.y + 1);
                }
            });
            ctx.restore();
            /* Même fondu que la carte mère : les deux scènes se terminent de la
               même façon. */
            fondreBords(ctx, w, h);
        });
    }

    /* ---------------------------------------------------------------------
       Démo iPhone : scène urbaine + itinéraire + fiche
       --------------------------------------------------------------------- */
    function mapDemo(cv) {
        var key = cv.getAttribute('data-demo');
        var app = APPS[key];
        if (!app || !app.demo) return null;
        var ctx = cv.getContext('2d');
        var dpr = Math.min(devicePixelRatio || 1, 2);
        var scene = null;

        /* Palette « Plans » clair, fidèle à l'app réelle */
        /* Palette « cartographie de nuit », cohérente avec le site sombre */
        var P = {
            base: '#0c1120',
            block: '#141c30',
            building: '#1c2740',
            buildingEdge: '#26314c',
            park: 'rgba(34,130,92,0.30)',
            tree: 'rgba(48,170,116,0.45)',
            water: 'rgba(46,96,190,0.34)',
            street: 'rgba(150,170,220,0.16)',
            casing: 'rgba(120,140,190,0.05)',
            major: 'rgba(122,157,255,0.30)',
            majorCasing: 'rgba(122,157,255,0.10)',
            label: 'rgba(150,166,205,0.42)'
        };
        var STREETS = ['AV. DE LA RÉPUBLIQUE', 'RUE PASTEUR', 'BD VICTOR HUGO', 'RUE DES LILAS', 'AV. JEAN JAURÈS', 'RUE DU MARCHÉ', 'RUE DE LA GARE', 'BD SAINT-MICHEL'];

        function buildScene(w, h) {
            var rnd = mulberry(1000 + key.length * 37);
            var cols = 5, rows = 9;
            var xs = [0], ys = [0];
            for (var i = 1; i < cols; i++) xs.push(Math.round(w * i / cols + (rnd() - 0.5) * 9));
            xs.push(w);
            for (var j = 1; j < rows; j++) ys.push(Math.round(h * j / rows + (rnd() - 0.5) * 8));
            ys.push(h);
            var majorX = 1 + Math.floor(rnd() * (cols - 1));
            var majorY = 2 + Math.floor(rnd() * (rows - 4));
            var parkC = Math.floor(rnd() * cols), parkR = 1 + Math.floor(rnd() * (rows - 2));
            var park2C = Math.floor(rnd() * cols), park2R = 1 + Math.floor(rnd() * (rows - 2));
            var waterC = Math.floor(rnd() * cols), waterR = 1 + Math.floor(rnd() * (rows - 2));
            var cells = [];
            for (var c = 0; c < cols; c++) {
                for (var r = 0; r < rows; r++) {
                    var kind = 'block';
                    if ((c === parkC && r === parkR) || (c === park2C && r === park2R)) kind = 'park';
                    else if (c === waterC && r === waterR) kind = 'water';
                    var cell = { x: xs[c], y: ys[r], w: xs[c + 1] - xs[c], h: ys[r + 1] - ys[r], kind: kind };
                    if (kind === 'park') {
                        cell.trees = [];
                        var nt = 4 + Math.floor(rnd() * 4);
                        for (var tk = 0; tk < nt; tk++) cell.trees.push([0.15 + rnd() * 0.7, 0.15 + rnd() * 0.7, 2 + rnd() * 2.4]);
                    } else if (kind === 'block') {
                        /* empreintes de bâtiments dans le pâté */
                        cell.builds = [];
                        var nb = 1 + Math.floor(rnd() * 3);
                        for (var bb = 0; bb < nb; bb++) {
                            cell.builds.push([0.12 + rnd() * 0.4, 0.12 + rnd() * 0.4, 0.25 + rnd() * 0.35, 0.2 + rnd() * 0.4]);
                        }
                    }
                    cells.push(cell);
                }
            }
            /* noms de rues : deux horizontaux, un vertical */
            var names = [];
            var shuffled = STREETS.slice();
            for (var sh = shuffled.length - 1; sh > 0; sh--) {
                var sj = Math.floor(rnd() * (sh + 1));
                var tmp = shuffled[sh]; shuffled[sh] = shuffled[sj]; shuffled[sj] = tmp;
            }
            names.push({ txt: shuffled[0], y: ys[majorY], x: w * 0.5, vert: false, major: true });
            var otherY = majorY + 2 < rows ? majorY + 2 : majorY - 2;
            names.push({ txt: shuffled[1], y: ys[Math.max(1, otherY)], x: w * 0.32, vert: false, major: false });
            names.push({ txt: shuffled[2], x: xs[majorX], y: h * 0.62, vert: true, major: false });
            return { cells: cells, xs: xs, ys: ys, majorX: majorX, majorY: majorY, names: names, w: w, h: h };
        }
        function size() {
            var w = cv.clientWidth, h = cv.clientHeight;
            if (!w || !h) return;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            scene = buildScene(w, h);
        }
        size();
        addEventListener('resize', size);
        function roundRect(x, y, w2, h2, rd) {
            rd = Math.min(rd, w2 / 2, h2 / 2);
            ctx.beginPath();
            ctx.moveTo(x + rd, y);
            ctx.arcTo(x + w2, y, x + w2, y + h2, rd);
            ctx.arcTo(x + w2, y + h2, x, y + h2, rd);
            ctx.arcTo(x, y + h2, x, y, rd);
            ctx.arcTo(x, y, x + w2, y, rd);
            ctx.closePath();
        }

        return loop(function (now) {
            if (!scene) { size(); if (!scene) return; }
            var w = scene.w, h = scene.h, xs = scene.xs, ys = scene.ys;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = P.base;
            ctx.fillRect(0, 0, w, h);

            /* Dérive très lente de la caméra */
            ctx.save();
            ctx.translate(Math.sin(now / 9000) * 1.6, Math.cos(now / 10000) * 1.4);

            /* 1. Pâtés (fond légèrement plus soutenu que les rues) */
            var inset = 4;
            scene.cells.forEach(function (cell) {
                var bx = cell.x + inset, by = cell.y + inset, bw = cell.w - inset * 2, bh = cell.h - inset * 2;
                if (bw < 6 || bh < 6) return;
                if (cell.kind === 'water') {
                    roundRect(bx - 2, by - 2, bw + 4, bh + 4, 8);
                    ctx.fillStyle = P.water;
                    ctx.fill();
                    return;
                }
                if (cell.kind === 'park') {
                    roundRect(bx, by, bw, bh, 6);
                    ctx.fillStyle = P.park;
                    ctx.fill();
                    cell.trees.forEach(function (tr) {
                        ctx.fillStyle = P.tree;
                        ctx.beginPath();
                        ctx.arc(bx + bw * tr[0], by + bh * tr[1], tr[2], 0, Math.PI * 2);
                        ctx.fill();
                    });
                    return;
                }
                roundRect(bx, by, bw, bh, 3.5);
                ctx.fillStyle = P.block;
                ctx.fill();
                /* bâtiments */
                cell.builds.forEach(function (bd) {
                    var rx = bx + bw * bd[0], ry = by + bh * bd[1];
                    var rw = Math.min(bw * bd[2], bx + bw - rx - 2), rh = Math.min(bh * bd[3], by + bh - ry - 2);
                    if (rw < 4 || rh < 4) return;
                    ctx.fillStyle = P.building;
                    ctx.fillRect(rx, ry, rw, rh);
                    ctx.strokeStyle = P.buildingEdge;
                    ctx.lineWidth = 0.8;
                    ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
                });
            });

            /* 2. Rues : liseré puis chaussée blanche ; axe majeur jaune */
            function road(x1, y1, x2, y2, major) {
                ctx.lineCap = 'round';
                ctx.strokeStyle = major ? P.majorCasing : P.casing;
                ctx.lineWidth = major ? 10 : 7;
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                ctx.strokeStyle = major ? P.major : P.street;
                ctx.lineWidth = major ? 7.5 : 5;
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
            for (var xi = 1; xi < xs.length - 1; xi++) road(xs[xi], -8, xs[xi], h + 8, xi === scene.majorX);
            for (var yi = 1; yi < ys.length - 1; yi++) road(-8, ys[yi], w + 8, ys[yi], yi === scene.majorY);

            /* 3. Noms de rues */
            ctx.fillStyle = P.label;
            ctx.font = '600 6.6px -apple-system, ui-sans-serif, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            scene.names.forEach(function (nm) {
                ctx.save();
                if (nm.vert) {
                    ctx.translate(nm.x, nm.y);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText(nm.txt, 0, 0);
                } else {
                    ctx.fillText(nm.txt, nm.x, nm.y);
                }
                ctx.restore();
            });

            ctx.restore();

            /* 4. Lueur d'accent en haut + vignette froide, comme le reste du site */
            var amb = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.1, h * 0.55);
            amb.addColorStop(0, 'rgba(122,157,255,0.10)');
            amb.addColorStop(1, 'rgba(122,157,255,0)');
            ctx.fillStyle = amb;
            ctx.fillRect(0, 0, w, h);
            var vig = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.34, w * 0.5, h * 0.5, h * 0.82);
            vig.addColorStop(0, 'rgba(4,7,16,0)');
            vig.addColorStop(1, 'rgba(4,7,16,0.5)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, w, h);
        });
    }


    /* ---------------------------------------------------------------------
       Démo MacTuner : jauges interpolées en douceur
       --------------------------------------------------------------------- */
    function macDemo() {
        var win = document.querySelector('.mac-window');
        if (!win) return;
        /* La fenêtre DNSTuner n'a pas de jauges MacTuner : sans ce garde, on
           faisait tourner une boucle d'animation pour rien sur sa page. */
        if (!win.querySelector('[data-mt-ring]')) return;
        var C = 2 * Math.PI * 30;
        var fr = lang === 'fr';
        function q(sel) { return win.querySelector(sel); }
        function ring(id, frac) {
            var el = q('[data-mt-ring="' + id + '"]');
            if (el) el.style.strokeDashoffset = String(C * (1 - Math.max(0.02, Math.min(0.97, frac))));
        }
        /* état lissé, mêmes grandeurs que le vrai tableau de bord */
        var st = {
            cpu: { v: 34, tgt: 34, min: 9, max: 86 },
            mem: { v: 12.4, tgt: 12.4, min: 9.5, max: 14.6 },   /* Go sur 16 */
            down: { v: 6, tgt: 6, min: 0.2, max: 24 },          /* Mo/s */
            up: { v: 1.4, tgt: 1.4, min: 0.1, max: 6 }
        };
        var cores = [], history = [];
        for (var i = 0; i < 8; i++) cores.push({ v: 0.3, tgt: 0.3 });
        var spark = q('[data-mt-spark]');
        var sctx = spark ? spark.getContext('2d') : null;
        var lastPick = -1e9;
        var fmt1 = function (v) { return v.toFixed(1).replace('.', fr ? ',' : '.'); };

        /* disque : quasi statique, comme en vrai */
        ring('disk', 0.41);
        var dv = q('[data-mt-val="disk"]'), ds = q('[data-mt-sub="disk"]');
        if (dv) dv.textContent = fr ? '412 Go' : '412 GB';
        if (ds) ds.textContent = fr ? 'sur 1 To' : 'of 1 TB';

        return loop(function (t) {
            if (t - lastPick > 2200) {
                lastPick = t;
                Object.keys(st).forEach(function (k) {
                    st[k].tgt = st[k].min + Math.random() * (st[k].max - st[k].min);
                });
                cores.forEach(function (c) { c.tgt = 0.08 + Math.random() * 0.85; });
            }
            var e = reduceMotion ? 1 : 0.04;
            Object.keys(st).forEach(function (k) { st[k].v += (st[k].tgt - st[k].v) * e; });
            cores.forEach(function (c) { c.v += (c.tgt - c.v) * (reduceMotion ? 1 : 0.07); });

            /* CPU */
            ring('cpu', st.cpu.v / 100);
            var cv2 = q('[data-mt-val="cpu"]'), cs = q('[data-mt-sub="cpu"]');
            if (cv2) cv2.textContent = Math.round(st.cpu.v) + ' %';
            if (cs) cs.textContent = fr ? 'charge' : 'load';
            cores.forEach(function (c, ci) {
                var bar = q('[data-mt-core="' + ci + '"]');
                if (bar) bar.style.height = Math.round(15 + c.v * 85) + '%';
            });
            var temp = q('[data-mt-temp]');
            if (temp) {
                var tv = Math.round(40 + st.cpu.v * 0.38);
                temp.textContent = tv + ' °C';
                temp.style.color = tv < 60 ? '#30d158' : '#ff9f0a';
            }

            /* Mémoire */
            ring('mem', st.mem.v / 16);
            var mv = q('[data-mt-val="mem"]'), ms = q('[data-mt-sub="mem"]');
            if (mv) mv.textContent = fmt1(st.mem.v) + (fr ? ' Go' : ' GB');
            if (ms) ms.textContent = fr ? 'sur 16 Go' : 'of 16 GB';
            var parts = [st.mem.v * 0.22, st.mem.v * 0.09, st.mem.v * 0.52];
            parts.forEach(function (p, pi) {
                var el2 = q('[data-mt-mem="' + pi + '"]');
                if (el2) el2.textContent = fmt1(p) + (fr ? ' Go' : ' GB');
            });

            /* Réseau + sparkline */
            var nd = q('[data-mt-net="0"]'), nu = q('[data-mt-net="1"]');
            if (nd) nd.textContent = fmt1(st.down.v) + (fr ? ' Mo/s' : ' MB/s');
            if (nu) nu.textContent = fmt1(st.up.v) + (fr ? ' Mo/s' : ' MB/s');

            /* Ventilateur : léger battement autour du régime silencieux */
            var rpm = q('[data-mt-rpm]');
            if (rpm) rpm.textContent = (998 + Math.round(Math.sin(t / 1150) * 9)).toLocaleString(fr ? 'fr-FR' : 'en-US');
            if (sctx) {
                history.push(st.down.v);
                if (history.length > 60) history.shift();
                var W = spark.width, H = spark.height;
                sctx.clearRect(0, 0, W, H);
                sctx.beginPath();
                history.forEach(function (v, hi) {
                    var x = W - (history.length - 1 - hi) * (W / 59);
                    var y = H - 3 - (v / 26) * (H - 8);
                    hi === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
                });
                sctx.strokeStyle = '#30d158';
                sctx.lineWidth = 1.8;
                sctx.lineJoin = 'round';
                sctx.stroke();
                sctx.lineTo(W, H); sctx.lineTo(W - (history.length - 1) * (W / 59), H);
                sctx.closePath();
                sctx.fillStyle = 'rgba(48,209,88,0.12)';
                sctx.fill();
            }
        });
    }

    /* ---------------------------------------------------------------------
       Showcase : onglets de démo
       --------------------------------------------------------------------- */
    var showcaseTimer = null;
    var macShowcaseTimer;
    var macTabsTimer = null;

    /* Onglets de la fenêtre MacTuner : cycle automatique + clic */
    /* Remonte une fenêtre Mac et relance ce qui l'anime. Sert au chargement
       comme au changement d'app dans la vitrine de l'accueil. */
    function mountMacWindow(key, slot) {
        clearInterval(macTabsTimer);
        slot.innerHTML = macWindowHTML(key);
        macDemo();
        dnsDemo();
        attachMacTabs();
        attachMacTilt();
    }

    /* Vitrine macOS de l'accueil : les apps se succèdent, et les deux
       boutons suivent celle qui est affichée. */
    function attachMacShowcase() {
        var tabs = document.querySelectorAll('[data-mac-tab]');
        var slot = document.getElementById('showcase-mac');
        if (!tabs.length || !slot) return;
        var store = document.querySelector('[data-mac-store]');
        var page = document.querySelector('[data-mac-page]');
        var order = MAC_ORDER.slice();
        var idx = 0;

        function show(key) {
            idx = order.indexOf(key);
            mountMacWindow(key, slot);
            tabs.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-mac-tab') === key); });
            if (store) store.href = APPS[key].store;
            /* Le libellé est déjà posé par le gabarit : le réécrire ici avait
               fait réapparaître l'ancien texte après un renommage. */
            if (page) page.href = withLang('./' + key + '.html');
        }

        tabs.forEach(function (b) {
            b.addEventListener('click', function () {
                clearInterval(macShowcaseTimer);
                show(b.getAttribute('data-mac-tab'));
                if (!reduceMotion) macShowcaseTimer = setInterval(next, 11000);
            });
        });
        function next() { show(order[(idx + 1) % order.length]); }
        if (!reduceMotion) macShowcaseTimer = setInterval(next, 11000);
    }

    function attachMacTabs() {
        var win = document.querySelector('.mac-window');
        if (!win) return;
        var tabs = win.querySelectorAll('[data-mt-tab]');
        var views = win.querySelectorAll('[data-mt-view]');
        if (!tabs.length || !views.length) return;
        var idx = 0;
        function show(i) {
            idx = i;
            tabs.forEach(function (t, ti) { t.classList.toggle('is-on', ti === i); });
            views.forEach(function (v, vi) { v.classList.toggle('is-live', vi === i); });
            /* garder l'onglet actif visible dans la barre */
            var tb = tabs[i], cont = tb.parentElement;
            cont.scrollTo({
                left: tb.offsetLeft - cont.clientWidth / 2 + tb.clientWidth / 2,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }
        tabs.forEach(function (t, ti) {
            t.addEventListener('click', function () {
                clearInterval(macTabsTimer);
                show(ti);
                if (!reduceMotion) macTabsTimer = setInterval(next, 5200);
            });
        });
        function next() { show((idx + 1) % views.length); }
        if (!reduceMotion) macTabsTimer = setInterval(next, 5200);
    }
    function attachShowcase() {
        var tabs = document.querySelectorAll('[data-demo-tab]');
        var slot = document.getElementById('showcase-phone');
        if (!tabs.length || !slot) return;
        var order = IOS_ORDER.slice();
        var idx = 0;
        var demoLoop = null;

        var store = document.querySelector('[data-demo-store]');
        var page = document.querySelector('[data-demo-page]');

        function show(key) {
            if (demoLoop) { demoLoop.stop = true; cancelAnimationFrame(demoLoop.v); }
            slot.innerHTML = iphoneHTML(key);
            var cv = slot.querySelector('canvas[data-demo]');
            demoLoop = cv ? mapDemo(cv) : null;
            tabs.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-demo-tab') === key); });
            /* Les boutons suivent l'onglet, comme du côté Mac. */
            if (store) store.href = APPS[key].store;
            if (page) page.href = withLang('./' + key + '.html');
            idx = order.indexOf(key);
        }

        tabs.forEach(function (b) {
            b.addEventListener('click', function () {
                clearInterval(showcaseTimer);
                show(b.getAttribute('data-demo-tab'));
                showcaseTimer = setInterval(next, 10000);
            });
        });
        function next() { show(order[(idx + 1) % order.length]); }
        show(order[0]);
        if (!reduceMotion) showcaseTimer = setInterval(next, 10000);
    }

    function attachCopy() {
        document.querySelectorAll('[data-copy]').forEach(function (b) {
            b.addEventListener('click', function () {
                var txt = b.getAttribute('data-copy');
                var done = function () {
                    var old = b.textContent;
                    b.textContent = pick(T.composerCopied);
                    setTimeout(function () { b.textContent = old; }, 1800);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(txt).then(done, done);
                } else { done(); }
            });
        });
    }

    /* Champs interactifs du composeur : objet, appareil et version système
       sont éditables ; sans interaction, les valeurs détectées restent. */
    function attachComposerFields() {
        var comp = document.getElementById('composer');
        if (!comp) return;
        var app = APPS[comp.getAttribute('data-app')];
        var pre = comp.querySelector('pre');
        var send = comp.querySelector('[data-cf-send]');
        var title = comp.querySelector('[data-cf-title]');
        var fSubject = comp.querySelector('[data-cf="subject"]');
        var fDevice = comp.querySelector('[data-cf="device"]');
        var fOS = comp.querySelector('[data-cf="os"]');
        if (!app || !pre || !send) return;
        var tpl = pick(T.mailBody).join('\n')
            .replace('{app}', app.name)
            .replace('{locale}', deviceInfo().locale);
        function sync() {
            /* si le mail était en train de « se taper », on l'achève */
            clearInterval(typeTimer);
            pre.classList.remove('is-typing');
            var body = tpl.replace('{device}', fDevice.value.trim()).replace('{os}', fOS.value.trim());
            pre.textContent = body;
            title.textContent = fSubject.value;
            send.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(fSubject.value) + '&body=' + encodeURIComponent(body);
        }
        [fSubject, fDevice, fOS].forEach(function (f) {
            f.addEventListener('input', function () {
                /* le badge « détecté » n'a plus de sens dès que l'utilisateur écrit */
                var badge = f.closest('.composer-field').querySelector('.cf-auto');
                if (badge) badge.remove();
                sync();
            });
        });
    }

    /* Le corps du mail se tape tout seul dans le composeur, avec un curseur */
    var typeTimer = 0;
    function attachComposerType() {
        var pre = document.querySelector('.composer pre');
        if (!pre || reduceMotion) return;
        var txt = pre.textContent;
        /* figer la hauteur pour que la fenêtre ne grandisse pas pendant la frappe */
        pre.style.minHeight = pre.offsetHeight + 'px';
        pre.textContent = '';
        pre.classList.add('is-typing');
        var i = 0;
        typeTimer = setInterval(function () {
            i += 3;
            pre.textContent = txt.slice(0, i);
            if (i >= txt.length) {
                clearInterval(typeTimer);
                pre.textContent = txt;
                pre.classList.remove('is-typing');
            }
        }, 16);
    }

    function attachPicker() {
        var picker = document.querySelector('[data-picker]');
        if (!picker) return;
        picker.addEventListener('click', function (e) {
            var b = e.target.closest('[data-pick]');
            if (!b) return;
            var url = new URL(location.href);
            url.searchParams.set('app', b.getAttribute('data-pick'));
            history.replaceState(null, '', url);
            render();
        });
    }

    /* ---------------------------------------------------------------------
       Compteur de visiteurs de la semaine (footer)
       Service Abacus, gratuit et sans compte. Le service ne sachant pas
       remettre un compteur à zéro à heure fixe, la clé du compteur porte la
       date du lundi de la semaine en cours (heure de Paris) : chaque lundi
       à minuit la clé change et le compte repart de zéro. Une visite est
       comptée une seule fois par session et par semaine ; le badge reste
       caché si le service ne répond pas.
       --------------------------------------------------------------------- */
    var visitTotal = 0;
    function visitWeekKey() {
        var now = new Date();
        try {
            /* Date du jour en heure de Paris ; midi pour éviter tout effet
               de bord au changement d'heure */
            var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
            now = new Date(p + 'T12:00:00');
        } catch (e) { }
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        d.setDate(d.getDate() - (d.getDay() + 6) % 7); /* recule au lundi */
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        return 'week-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    }
    function attachVisitCounter() {
        var badge = document.querySelector('[data-visit-badge]');
        if (!badge) return;
        function show(n) {
            if (!n) return;
            visitTotal = n;
            badge.querySelector('[data-visit-n]').textContent = n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');
            badge.hidden = false;
        }
        if (visitTotal) { show(visitTotal); return; }
        var week = visitWeekKey();
        var counted = false;
        try { counted = sessionStorage.getItem('rv-visited') === week; } catch (e) { }
        fetch('https://abacus.jasoncameron.dev/' + (counted ? 'get' : 'hit') + '/bodyroro-github-io/' + week)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!counted) { try { sessionStorage.setItem('rv-visited', week); } catch (e) { } }
                show(d && d.value);
            })
            .catch(function () { });
    }

    /* ---------------------------------------------------------------------
       Routeur
       --------------------------------------------------------------------- */
    function render() {
        stopLoops();
        clearInterval(showcaseTimer);
        clearInterval(macTabsTimer);
        clearInterval(macShowcaseTimer);
        clearInterval(typeTimer);
        var root = document.getElementById('site-root');
        if (!root) return;
        var page = document.body.getAttribute('data-page');
        var appKey = document.body.getAttribute('data-app');
        document.documentElement.lang = lang;

        if (page === 'v2-home') root.innerHTML = renderHome();
        else if (page === 'v2-app' && APPS[appKey]) root.innerHTML = renderApp(appKey);
        else if (page === 'v2-contact') root.innerHTML = renderContact();
        else if (page === 'v2-about') root.innerHTML = renderAbout();
        else return;

        attachNavChrome();
        attachVisitCounter();
        attachReveals();
        attachTilt();
        attachCounts();
        attachCopy();
        attachPicker();
        attachComposerFields();
        attachComposerType();
        heroBackdrop();
        franceCanvas();
        chipCanvas();
        document.querySelectorAll('canvas[data-demo]').forEach(function (cv) {
            if (!cv.closest('#showcase-phone')) mapDemo(cv);
        });
        macDemo();
        dnsDemo();
        attachMacTabs();
        attachMacTilt();
        attachShowcase();
        attachMacShowcase();
    }

    render();
})();
