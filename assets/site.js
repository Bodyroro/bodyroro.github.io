/* ==========================================================================
   site.js : moteur de la vitrine V2
   ==========================================================================
   Rend l'accueil (scène 3D d'appareils, anneau d'icônes, un chapitre par
   famille, catalogue filtrable), les pages produit (appareils mis en scène,
   galerie par appareil : iPhone, iPad, iPhone Duo, Apple Watch, Apple TV),
   les pages Confidentialité et Assistance du site, À propos et Contact, en
   français et en anglais.

   Les pages légales lues par les applications (<app>-privacy.html,
   <app>-support.html) ne passent pas par ici : elles gardent styles.css et
   site-pages.js. Les pages <app>-confidentialite.html et <app>-assistance.html
   chargent site-pages.js, qui rend le texte (source unique, onze langues),
   puis ce fichier, qui le replace dans la fiche du produit (`renderLegal`).
   ========================================================================== */
(function () {
    'use strict';

    var MAIL = 'rodolphe_vandaele@hotmail.fr';
    var LIBERAPAY = 'https://liberapay.com/Rodolphe_Vandaele/donate';
    var GITHUB_MACTUNER = 'https://github.com/Bodyroro/MacTuner';
    var GITHUB_DNSTUNER = 'https://github.com/Bodyroro/DNSTuner';
    var STORE = 'https://apps.apple.com/fr/app/';
    /* Page développeur : elle réunit toutes les applications et tous les jeux. Le badge
       d'Apple doit conduire à l'App Store, pas à une section de ce site. */
    var STORE_DEV = 'https://apps.apple.com/fr/developer/rodolphe-vandaele/id1884012478';
    /* Fiches des jeux, sous la forme courte sans pays : l'App Store ouvre
       la vitrine du pays du visiteur. */
    var STORE_TC = 'https://apps.apple.com/app/id6816639945';
    var STORE_MG = 'https://apps.apple.com/app/id6817347087';
    var STORE_CF = 'https://apps.apple.com/app/id6819280350';
    var STORE_CT = 'https://apps.apple.com/app/id6822791450';
    var STORE_CFM = 'https://apps.apple.com/app/id6824902491';
    var STORE_CC = 'https://apps.apple.com/app/id6825533556';
    /* Les applications qui ont aussi un site : le bouton « version web » n'apparaît
       que pour celles-là. */
    var SITES_WEB = {
        carbufrance: 'https://carbufrance.fr',
        toilettefrance: 'https://toilettefrance.fr'
    };

    var PARTENAIRES = [
        { nom: 'CandyClem', site: 'candyclem.com', url: 'https://candyclem.com', img: './assets/img/candyclem.jpg' }
    ];

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
        /* Changement de langue en place : fondu de vue là où il existe, sauf mouvement réduit. */
        if (document.startViewTransition && !reduceMotion) { document.startViewTransition(render); } else { render(); }
    }
    function pick(o) { return o[lang] !== undefined ? o[lang] : o.fr; }


    /* ---------------------------------------------------------------------
       Images

       Les icônes existent en AVIF, WebP et dans leur format d'origine, PNG ou
       JPEG : le navigateur retient le premier qu'il sait décoder. L'original
       reste le repli des navigateurs anciens et des aperçus de réseaux sociaux.
       `picture { display: contents }` : l'<img> reste la boîte.
       --------------------------------------------------------------------- */
    function picture(src, attrs) {
        var base = src.replace(/\.(png|jpe?g)$/i, '');
        return '<picture>' +
            '<source type="image/avif" srcset="' + base + '.avif">' +
            '<source type="image/webp" srcset="' + base + '.webp">' +
            '<img src="' + src + '"' + (attrs || '') + '>' +
            '</picture>';
    }

    /* Captures et écrans de assets/img/shots (CapturesAppStore.mjs pour les apps, Marque/CapturesSite.mjs pour les
       jeux), dans la langue de la page : [préfixe, petite largeur, grande, JPEG de repli, largeur et hauteur réelles].
       `sizes` dit la largeur affichée, le navigateur choisit le fichier selon la densité de l'écran. */
    var FORMATS = {
        iphone: ['-', 360, 720, 540, 1320, 2868],
        paysage: ['-', 640, 1280, 960, 2868, 1320],
        ipad: ['-ipad-', 480, 960, 720, 2064, 2752],
        ipadl: ['-ipad-', 640, 1280, 960, 2752, 2064],
        duo: ['-duo-', 360, 720, 540, 1398, 2034],
        duoi: ['-duoi-', 480, 960, 720, 2007, 2853],
        watch: ['-watch-', 208, 416, 312, 416, 496],
        tv: ['-tv-', 640, 1280, 960, 1920, 1080]
    };

    /* `n` : rang du visuel, ou 'ecran' pour l'écran brut montré dans un appareil dessiné. `charge` : true pour
       l'image du premier écran (priorité haute), sinon chargement différé. */
    function capture(cle, format, n, alt, sizes, charge) {
        var f = FORMATS[format];
        var base = './assets/img/shots/' + cle + f[0] + lang + '-' + n;
        function jeu(ext) { return base + '-' + f[1] + '.' + ext + ' ' + f[1] + 'w, ' + base + '-' + f[2] + '.' + ext + ' ' + f[2] + 'w'; }
        return '<picture>' +
            '<source type="image/avif" srcset="' + jeu('avif') + '" sizes="' + sizes + '">' +
            '<source type="image/webp" srcset="' + jeu('webp') + '" sizes="' + sizes + '">' +
            '<img src="' + base + '-' + f[3] + '.jpg" width="' + f[4] + '" height="' + f[5] + '" alt="' + esc(alt) + '"' +
            (charge ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
            '</picture>';
    }

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
        navMac: { fr: 'Mac', en: 'Mac' },
        navAbout: { fr: 'À propos', en: 'About' },
        navContact: { fr: 'Contact', en: 'Contact' },
        skipLink: { fr: 'Aller au contenu', en: 'Skip to content' },

        iosTitle: { fr: 'Des applications utiles au quotidien.', en: 'Apps for everyday life.' },
        macTitle: { fr: 'Des utilitaires pour votre Mac Apple Silicon.', en: 'Utilities for your Apple Silicon Mac.' },
        macLead: {
            fr: 'Elles fonctionnent sur tous les Mac Apple Silicon, sans compte ni publicité. Applications libres et open source, chacune sur un sujet précis.',
            en: 'They run on any Apple Silicon Mac, with no account and no ads. Free, open-source apps, each on one precise subject.'
        },
        macStore: { fr: 'Sur GitHub', en: 'On GitHub' },
        valuesEyebrow: { fr: 'Engagements', en: 'Commitments' },
        valuesTitle: { fr: 'Les mêmes principes sur iPhone et sur Mac.', en: 'The same principles on iPhone and Mac.' },
        values: {
            fr: [
                ['shield', 'Vie privée locale', 'Aucun compte à créer. Favoris et réglages restent sur votre appareil ; seules la publicité (avec votre accord), les achats et iCloud ou Game Center utilisent le réseau.'],
                ['map', 'Données publiques', 'Sources ouvertes et officielles, mises en cache pour fonctionner hors connexion.'],
                ['heart', 'Support direct', 'Un développeur indépendant qui répond personnellement à chaque message.']
            ],
            en: [
                ['shield', 'Local privacy', 'No account to create. Favorites and settings stay on your device; only advertising (with your consent), purchases, and iCloud or Game Center use the network.'],
                ['map', 'Public data', 'Open, official sources, cached so everything keeps working offline.'],
                ['heart', 'Direct support', 'An independent developer who answers every message personally.']
            ]
        },

        profileEyebrow: { fr: 'À propos', en: 'About' },
        profileBio: {
            fr: 'Développeur autodidacte basé en France, je construis des jeux et des apps simples, utiles et respectueuses de la vie privée, en Swift et SwiftUI, avec les frameworks d’Apple d’abord pour une expérience cohérente.',
            en: 'Self-taught developer based in France, I build games and simple, useful, privacy-minded apps in Swift and SwiftUI, with Apple’s frameworks first for a coherent experience.'
        },
        profileCTA: { fr: 'Me contacter', en: 'Get in touch' },
        footerLine: { fr: 'Des jeux avec Gloup, des apps de données publiques pour la France, des outils pour le salon (Telzo, Telora, Ambiro), la photo (Netta) et le budget du foyer (Foyo) sur iPhone et iPad, et des utilitaires libres pour Mac.', en: 'Games starring Gloup, apps built on French public data, tools for the living room (Telzo, Telora, Ambiro), photos (Netta) and the household budget (Foyo) on iPhone and iPad, and free utilities for Mac.' },
        footerSite: { fr: 'Site', en: 'Site' },
        footerTagline: { fr: 'Conçu et développé en France.', en: 'Designed and built in France.' },
        footerStore: { fr: 'Toutes les applications sur l\u2019App Store', en: 'All apps on the App Store' },
        footerPartners: { fr: 'Partenaire', en: 'Partner' },

        supportLink: { fr: 'Assistance', en: 'Support' },
        privacyLink: { fr: 'Confidentialité', en: 'Privacy' },
        featEyebrow: { fr: 'Fonctionnalités', en: 'Features' },
        dataEyebrow: { fr: 'Données et confidentialité', en: 'Data & privacy' },
        dataSources: { fr: 'Sources', en: 'Sources' },
        dataBusiness: { fr: 'Publicité et achats', en: 'Ads & purchases' },
        contactEyebrow: { fr: 'Contact', en: 'Contact' },
        mailSubject: { fr: 'Support', en: 'Support' },
        /* Mentions légales. La loi pour la confiance dans l'économie numérique
           demande l'éditeur, un moyen de le joindre, et l'hébergeur nommé avec son
           adresse. Elles tiennent en trois blocs, sur la page qui parle déjà de la
           personne : un site de sept pages n'a pas besoin d'une page pour cela. */
        legalTitleSite: { fr: 'Mentions légales', en: 'Legal notice' },
        legalEditor: { fr: 'Éditeur', en: 'Publisher' },
        legalEditorText: {
            fr: 'BodyCorp. BodyCorp n’est pas une société : c’est le nom d’éditeur d’un développeur indépendant, particulier, sous lequel sont publiés les jeux et les applications présentés sur ce site.',
            en: 'BodyCorp. BodyCorp is not a company: it is the publisher name of an independent developer, a private individual, under which the games and apps shown on this site are released.'
        },
        legalHost: { fr: 'Hébergeur', en: 'Host' },
        legalHostText: {
            fr: 'GitHub Pages, par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
            en: 'GitHub Pages, by GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.'
        },
        legalContent: { fr: 'Contenus', en: 'Content' },
        legalContentText: {
            fr: 'Les captures et les icônes des applications appartiennent à leur auteur. Les marques citées appartiennent à leurs titulaires respectifs.',
            en: 'App screenshots and icons belong to their author. Trademarks mentioned belong to their respective owners.'
        },

        /* Les six familles n'ont ni le même public, ni le même mode de
           distribution. La page À propos est l'endroit où le dire une fois,
           clairement, plutôt que de le laisser deviner app par app. */
        aboutLinesEyebrow: { fr: 'Six familles', en: 'Six families' },
        aboutLinesTitle: { fr: 'Jeux, données publiques, salon, photo, foyer et Mac.',
                           en: 'Games, public data, living room, photos, household and Mac.' },
        aboutLines: {
            fr: [
                ['star', 'Jeux avec Gloup',
                 'Six jeux pour iPhone et iPad avec Gloup, la petite créature aux grands yeux : aventure, compagnon virtuel, combat, déduction, ferme et RPG. Gratuits, financés par la publicité, avec des achats facultatifs dans quatre d’entre eux.'],
                ['map', 'Données publiques, pour la France',
                 'Des applications bâties sur les jeux de données publics français : carburants, bornes de recharge, toilettes, défibrillateurs et prix de l’immobilier. Distribuées sur l’App Store, financées par une publicité discrète, sans compte ni inscription.'],
                ['phone', 'Pour le salon',
                 'Telzo transforme l’iPhone en télécommande universelle par Wi-Fi, gratuite avec publicité. Telora lit vos films, séries et chaînes depuis vos propres sources, sur iPhone, iPad et Apple TV, avec un abonnement et sans publicité. Ambiro transforme l’Apple TV en écran ambiant : horloge, météo, musique et fonds animés, sans publicité.'],
                ['shield', 'Pour vos photos',
                 'Netta trie et nettoie la photothèque de l’iPhone et de l’iPad : doublons, photos floues, captures d’écran. L’analyse se fait sur l’appareil, sans compte. Gratuite, financée par la publicité.'],
                ['heart', 'Pour le foyer',
                 'Foyo répertorie les abonnements et prélèvements récurrents de la famille : total par mois et par an, échéances à venir, rappels avant chaque prélèvement. Un foyer partagé par iCloud, sans compte ni connexion à une banque. Gratuite avec publicité, abonnement Foyo Plus facultatif.'],
                ['laptop', 'Mac, en open source',
                 'Des utilitaires pour Mac Apple Silicon, chacun sur un sujet précis. Publiés sous licence MIT sur GitHub, code complet consultable et à compiler soi-même, sans publicité.']
            ],
            en: [
                ['star', 'Games starring Gloup',
                 'Six games for iPhone and iPad starring Gloup, the little creature with big eyes: adventure, virtual pet, battle, deduction, farming and RPG. Free, funded by advertising, with optional purchases in four of them.'],
                ['map', 'Public data, built for France',
                 'Apps built on French public datasets: fuel prices, EV chargers, public toilets, defibrillators and property prices. Shipped on the App Store, funded by discreet advertising, with no account or sign-up.'],
                ['phone', 'For the living room',
                 'Telzo turns the iPhone into a universal Wi-Fi remote, free with ads. Telora plays your movies, shows and channels from your own sources, on iPhone, iPad and Apple TV, with a subscription and no ads. Ambiro turns the Apple TV into an ambient display: clock, weather, music and animated backgrounds, with no ads.'],
                ['shield', 'For your photos',
                 'Netta sorts and cleans the photo library of the iPhone and iPad: duplicates, blurry photos, screenshots. Analysis happens on the device, with no account. Free, funded by advertising.'],
                ['heart', 'For the household',
                 'Foyo lists the family’s recurring subscriptions and direct debits: total per month and per year, upcoming due dates, reminders before every charge. A household shared through iCloud, with no account and no bank connection. Free with ads, optional Foyo Plus subscription.'],
                ['laptop', 'Mac, open source',
                 'Utilities for Apple Silicon Macs, each on one precise subject. Published under the MIT license on GitHub, full source readable and yours to build, with no ads.']
            ]
        },

        /* Volontairement différent des « valeurs » de l'accueil, qui parlent du
           produit. Ici c'est la méthode : comment c'est fait et entretenu. */
        aboutMethodEyebrow: { fr: 'Méthode', en: 'Method' },
        aboutMethodTitle: { fr: 'Comment tout cela est fabriqué.', en: 'How all of it is built.' },
        aboutMethod: {
            fr: [
                ['gear', 'Swift, SwiftUI et frameworks d’Apple',
                 'Les apps sont écrites en Swift et SwiftUI, avec les frameworks d’Apple d’abord. Seules dépendances : Google AdMob pour la publicité, et VLC dans Telora. Les jeux sont des moteurs web (three.js) dans une enveloppe iOS native.'],
                ['book', 'Des sources nommées',
                 'Les sources sont citées sur la page de chaque application, y compris communautaires (OpenStreetMap). Rien n’est recopié d’une source que je ne peux pas montrer.'],
                ['shield', 'Vie privée locale',
                 'Aucun compte à créer. Favoris, historique et réglages restent sur votre appareil ; seules la publicité (avec votre accord), les achats et iCloud ou Game Center utilisent le réseau.'],
                ['mail', 'Une seule personne répond',
                 'Le support, c’est moi. Chaque message reçoit une réponse, et les corrections partent dans la mise à jour suivante.']
            ],
            en: [
                ['gear', 'Swift, SwiftUI and Apple frameworks',
                 'The apps are written in Swift and SwiftUI, with Apple’s frameworks first. The only dependencies are Google AdMob for advertising and VLC in Telora. The games are web engines (three.js) in a native iOS shell.'],
                ['book', 'Named sources',
                 'Sources are cited on the page of each app, community ones included (OpenStreetMap). Nothing is copied from a source I cannot show you.'],
                ['shield', 'Local privacy',
                 'No account to create. Favorites, history and settings stay on your device; only advertising (with your consent), purchases, and iCloud or Game Center use the network.'],
                ['mail', 'One person answers',
                 'Support is me. Every message gets a reply, and fixes ship in the next update.']
            ]
        }
    };

    var APPS = {
        carbufrance: {
            name: 'CarbuFrance', platform: 'ios', accent: '#4d7dff',
            store: STORE + 'carbufrance/id6760407573',
            tag: { fr: 'Prix des carburants', en: 'Fuel prices' },
            promo: { fr: 'Le prix des carburants station par station, avec carnet de bord et widget.', en: 'Fuel prices station by station, with a logbook and a widget.' },
            desc: {
                fr: 'Prix des carburants en France : carte, liste, favoris, widget station la moins chère, carnet de bord avec CO₂ et consommation, observatoire des marchés et CarPlay. Toutes les fonctions sont gratuites ; un abonnement facultatif retire la publicité.',
                en: 'French fuel prices: map, list, favorites, cheapest station widget, logbook with CO₂ and fuel economy, market observatory and CarPlay. Every feature is free; an optional subscription removes ads.'
            },
            features: {
                fr: [
                    'Carte et liste des stations avec prix carburants en France, tri par prix ou distance, favoris, stations masquées et cache hors connexion.',
                    'Évolution du prix dans la station suivie : courbe interactive des relevés quotidiens sur 45 jours.',
                    'Carnet de bord : consommation et autonomie calculées depuis vos pleins, CO₂ émis (facteurs ADEME) et écart de prix payé face à la moyenne nationale du mois.',
                    'Véhicules et entretien : motorisation thermique, hybride ou hybride rechargeable, capacité du réservoir, dépenses par catégorie et budget.',
                    'Analyse du marché : baril de Brent, euro/dollar, stations les moins chères et ruptures par carburant, plus les actualités du secteur.',
                    'Widget station la moins chère, CarPlay et Centre de contrôle. Abonnement facultatif « Sans pub », et vidéo récompensée pour 6 h sans publicité.'
                ],
                en: [
                    'Map and list of French fuel stations with prices, sorted by price or distance, favorites, hidden stations and offline cache.',
                    'Price history for the station you follow: an interactive curve of daily readings over 45 days.',
                    'Logbook: fuel economy and range computed from your fill-ups, CO₂ emitted (ADEME factors) and how the price you paid compares to the national monthly average.',
                    'Vehicles and maintenance: combustion, hybrid or plug-in hybrid powertrain, tank capacity, spending by category and budget.',
                    'Market analysis: Brent crude, EUR/USD, cheapest stations and out-of-stock counts per fuel, plus sector news.',
                    'Cheapest station widget, CarPlay and Control Center widget. Optional “Ad-Free” subscription, and a rewarded video for 6 ad-free hours.'
                ]
            },
            sources: { fr: 'Prix publics officiels des carburants en France, mis en cache localement, stations complétées par OpenStreetMap. Historique des prix, cours du Brent (Yahoo Finance) et taux de change (Frankfurter) issus de sources publiques ; facteurs CO₂ de l’ADEME.', en: 'Official public French fuel prices, cached locally, with stations completed from OpenStreetMap. Price history, Brent crude (Yahoo Finance) and exchange rates (Frankfurter) from public sources; CO₂ factors from ADEME.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par l’App Store et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by the App Store and your Apple account: no payment card data in the app.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: { ipad: [0, 2, 3, 4], duo: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['Les stations autour de vous', 'Comparez sans effort', 'Chaque station en détail', 'Votre budget carburant', 'Le marché en clair'],
                en: ['Fuel stations near you', 'Compare effortlessly', 'Every station in detail', 'Your fuel budget', 'The market made clear']
            }
        },
        irvefrance: {
            name: 'IRVEFrance', platform: 'ios', accent: '#6a5cff',
            store: STORE + 'irvefrance/id6760716931',
            tag: { fr: 'Bornes de recharge', en: 'EV charging' },
            promo: { fr: 'Les bornes de recharge, leur puissance, leurs connecteurs et leur disponibilité.', en: 'EV chargers, their power, connectors and availability.' },
            desc: {
                fr: 'Bornes de recharge électrique : réseaux, connecteurs, puissance, disponibilité, guidage et calculateur de recharge.',
                en: 'EV charging stations: networks, connectors, power, availability, directions and a charging calculator.'
            },
            features: {
                fr: ['Carte des bornes avec connecteurs, puissance, opérateur et disponibilité.', 'Filtres CCS2, CHAdeMO, Type 2, puissance minimale et rayon 5 à 50 km.', 'Look Around, vue 3D, favoris, hors connexion, CarPlay, Siri et calculateur de recharge.', 'Prix spot, coût avec tarif saisi, conseils et actualités de la mobilité électrique. Abonnement facultatif « Sans pub ».'],
                en: ['Charger map with connectors, power, operator and availability.', 'CCS2, CHAdeMO, Type 2, minimum power and 5 to 50 km radius filters.', 'Look Around, 3D map, favorites, offline mode, CarPlay, Siri and charging calculator.', 'Spot price, cost with your tariff, advice and EV news. Optional “Ad-Free” subscription.']
            },
            sources: { fr: 'Données ouvertes des infrastructures de recharge (IRVE), mises en cache localement. Autres sources : Open Charge Map, Energy-Charts (prix spot) et OpenStreetMap.', en: 'Open data on French charging infrastructure (IRVE), cached locally. Other sources: Open Charge Map, Energy-Charts (spot prices) and OpenStreetMap.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par l’App Store et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by the App Store and your Apple account: no payment card data in the app.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: { ipad: [0, 2, 3, 4], duo: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['Les bornes autour de vous', 'Comparez les bornes', 'Le détail de la borne', 'Calculez votre recharge', 'Suivez vos recharges'],
                en: ['Chargers near you', 'Compare chargers', 'Every charger in detail', 'Plan your charge', 'Track your charging']
            }
        },
        toilettefrance: {
            name: 'ToiletteFrance', platform: 'ios', accent: '#3d9bff',
            store: STORE + 'toilettefrance/id6760978805',
            on: { fr: 'iPhone, iPad et Apple Watch · iOS 18 et watchOS 11 ou plus', en: 'iPhone, iPad and Apple Watch · iOS 18 and watchOS 11 or later' },
            tag: { fr: 'Toilettes publiques', en: 'Public toilets' },
            promo: { fr: 'Les toilettes publiques, leurs horaires et leur accessibilité.', en: 'Public toilets, their opening hours and accessibility.' },
            desc: {
                fr: 'Toilettes publiques en France : carte, filtres utiles, accessibilité, horaires et guidage.',
                en: 'Public toilets in France: map, useful filters, accessibility, opening hours and directions.'
            },
            features: {
                fr: ['Carte des toilettes publiques en France avec distance et guidage.', 'Filtres d’accessibilité, horaires et informations selon les données ouvertes.', 'Favoris, préférences et données locales sans compte utilisateur.', 'Application gratuite financée par publicité AdMob, abonnement facultatif « Sans pub ».'],
                en: ['Map of public toilets in France with distance and directions.', 'Accessibility filters, opening hours and details from open data.', 'Favorites, preferences and local data with no user account.', 'Free app funded by AdMob ads, optional “Ad-Free” subscription.']
            },
            sources: { fr: 'Données ouvertes françaises sur les toilettes publiques, mises en cache localement. Autres sources : geodatamine (dérivé d’OpenStreetMap) et Wikimedia Commons.', en: 'French open data on public toilets, cached locally. Other sources: geodatamine (derived from OpenStreetMap) and Wikimedia Commons.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par l’App Store et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by the App Store and your Apple account: no payment card data in the app.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: {
                ipad: [0, 2, 4], duo: [0, 1, 2, 4, 3],
                watch: [{ fr: 'Les toilettes à votre poignet', en: 'Toilets on your wrist' }, { fr: 'Distance et tarif d’un regard', en: 'Distance and price at a glance' }, { fr: 'Y aller en un geste', en: 'Get there in one tap' }]
            },
            storeShots: {
                fr: ['Les toilettes autour de vous', 'La plus proche, tout de suite', 'Le détail utile', 'Gratuites, ouvertes, accessibles', 'Toutes les toilettes à proximité'],
                en: ['Public toilets near you', 'The nearest one, right now', 'Useful details', 'Free, open, accessible', 'Every toilet nearby']
            }
        },
        defibfrance: {
            name: 'DefibFrance', platform: 'ios', accent: '#17b26a',
            store: STORE + 'defibfrance/id6761717722',
            tag: { fr: 'Défibrillateurs', en: 'Defibrillators' },
            promo: { fr: 'Les défibrillateurs, avec mode Urgence et guide de réanimation.', en: 'Defibrillators, with an Emergency mode and a CPR guide.' },
            desc: {
                fr: 'Défibrillateurs (DAE) : disponibilité, accessibilité, mode Urgence, appel SAMU 15 et guide RCP avec métronome haptique.',
                en: 'AEDs: availability, accessibility, Emergency mode, SAMU 15 call and CPR guide with haptic metronome.'
            },
            features: {
                fr: ['Carte des DAE proches avec code couleur par accessibilité.', 'Filtres accès public, 24 h/24, intérieur/extérieur et rayon 500 m à 10 km.', 'Mode Urgence, appel SAMU 15 avec confirmation et guide RCP avec métronome haptique.', 'Abonnement facultatif « Sans pub » pour retirer toute publicité, et vidéo récompensée pour 6 h sans publicité.'],
                en: ['Nearby AED map with color coding by accessibility.', 'Public access, 24/7, indoor/outdoor and 500 m to 10 km radius filters.', 'Emergency mode, confirmed SAMU 15 call and CPR guide with haptic metronome.', 'Optional “Ad-Free” subscription removes every ad; a rewarded video gives 6 ad-free hours.']
            },
            sources: { fr: 'Base nationale des défibrillateurs (GeoDAE), mise en cache localement. Autres sources : OpenStreetMap, openAEDmap et, pour les photos, Wikimedia Commons.', en: 'The national defibrillator database (GeoDAE), cached locally. Other sources: OpenStreetMap, openAEDmap and, for photos, Wikimedia Commons.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par l’App Store et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by the App Store and your Apple account: no payment card data in the app.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: { ipad: [0, 2, 3], duo: [0, 4, 2, 1, 3] },
            storeShots: {
                fr: ['Les défibrillateurs autour de vous', 'Chaque seconde compte', 'Le détail précis', 'Les gestes qui sauvent', 'Tous les DAE à portée de main'],
                en: ['Defibrillators near you', 'Every second counts', 'Precise details', 'Life-saving actions', 'Every AED at hand']
            }
        },
        dvffrance: {
            name: 'DVFFrance', platform: 'ios', accent: '#0a7d3c',
            store: STORE + 'dvffrance/id6813079672',
            tag: { fr: 'Prix de l\u2019immobilier', en: 'Property prices' },
            promo: { fr: 'Le prix de l’immobilier d’après les ventes réellement enregistrées.', en: 'Property prices from the sales actually recorded.' },
            desc: {
                fr: 'Prix de l\u2019immobilier d\u2019apr\u00e8s les ventes r\u00e9ellement enregistr\u00e9es par l\u2019administration fiscale : carte, m\u00e9dianes par commune, plan cadastral, fiche de quartier et fourchette d\u2019estimation. Gratuit, financé par la publicité.',
                en: 'Property prices from sales actually recorded by the tax authority: map, medians by town, cadastral plan, neighborhood profile and valuation range. Free, funded by ads.'
            },
            features: {
                fr: [
                    'Carte \u00e0 trois \u00e9chelles : une pastille par commune sur toute la France, puis chaque vente \u00e0 son adresse, puis le plan cadastral avec les parcelles vendues en \u00e9vidence.',
                    'Prix m\u00e9dians par type de bien et par mill\u00e9sime, avec premier et troisi\u00e8me quartiles, nombre de ventes et surface m\u00e9diane. Jamais de moyenne : une seule vente exceptionnelle l\u2019emporterait.',
                    'Nombre de ventes par ann\u00e9e : le volume se retourne avant le prix, et un march\u00e9 qui perd ses transactions sans baisser est un march\u00e9 bloqu\u00e9.',
                    'Comparaison \u00e0 deux \u00e9chelles : \u00e9cart au d\u00e9partement et \u00e9cart \u00e0 la France. Le premier dit ce que vaut la commune, le second ce que vaut la r\u00e9gion.',
                    'Fiche de quartier : \u00e9coles avec taux de r\u00e9ussite et valeur ajout\u00e9e, commerces nomm\u00e9s, lignes et arr\u00eats, risques d\u00e9clar\u00e9s, catastrophes reconnues, radon, air et sols.',
                    'Loyers d\u2019annonce, raccordement \u00e0 la fibre, couverture mobile, diagnostics \u00e9nerg\u00e9tiques de l\u2019adresse exacte et rendement locatif brut. Aucun compte.'
                ],
                en: [
                    'A map at three scales: one pill per town across France, then every recorded sale at its address, then the cadastral plan with sold parcels highlighted.',
                    'Median prices by property type and year, with first and third quartiles, sale counts and median floor area. Never an average: a single exceptional sale would carry it away.',
                    'Sales volume per year: volume turns before price, and a market losing transactions without falling is a stalled market.',
                    'Two benchmarks: the gap to the department and the gap to France. The first tells you what the town is worth, the second what the region is worth.',
                    'Neighborhood profile: schools with pass rates and value added, named shops, lines and stops, declared hazards, recognized disasters, radon, air and soil.',
                    'Advertised rents, fiber broadband and mobile coverage, energy certificates for the exact address and gross rental yield. No account.'
                ]
            },
            sources: { fr: 'Demandes de valeurs fonci\u00e8res de la Direction g\u00e9n\u00e9rale des finances publiques, g\u00e9olocalis\u00e9es par Etalab. Carte des loyers du minist\u00e8re du Logement, diagnostics de l\u2019ADEME, risques de G\u00e9orisques, plan cadastral de l\u2019IGN, annuaire et r\u00e9sultats de l\u2019\u00c9ducation nationale, faits enregistr\u00e9s du minist\u00e8re de l\u2019Int\u00e9rieur, d\u00e9coupage IRIS de l\u2019INSEE et OpenStreetMap.', en: 'Property transfer records from the French public finances directorate, geocoded by Etalab. Rent map from the Ministry of Housing, ADEME energy certificates, G\u00e9orisques hazards, IGN cadastral plan, schools directory and results from the Ministry of Education, recorded offences from the Interior Ministry, INSEE IRIS boundaries and OpenStreetMap.' },
            business: { fr: 'Application gratuite, financée par la publicité ; une vidéo récompensée offre 6 h sans publicité. Aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads; a rewarded video gives 6 hours ad-free. No payment card data in the app.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: { ipad: [0, 1, 2, 3], duo: [0, { fr: 'Chaque vente de la commune', en: 'Every sale in town' }, 1, 2, 3] },
            storeShots: {
                fr: ['Les prix autour de vous', 'Le détail d’une vente', 'Le marché de votre commune', 'Votre quartier en un coup d’œil', 'Tout ce qui vous entoure'],
                en: ['Property prices near you', 'Every sale in detail', 'Your town’s market', 'Your area at a glance', 'Everything around you']
            }
        },
        /* Ni données publiques ni publicité, d'où `chips` et `on` propres. */
        telora: {
            name: 'Telora', platform: 'ios', accent: '#8b5cf6',
            store: 'https://apps.apple.com/app/id6821877987',
            on: { fr: 'iPhone, iPad et Apple TV', en: 'iPhone, iPad and Apple TV' },
            tag: { fr: 'Lecteur multimédia', en: 'Media player' },
            promo: { fr: 'Vos films, séries et chaînes, depuis vos propres sources, sur iPhone, iPad et Apple TV.', en: 'Your movies, shows and channels, from your own sources, on iPhone, iPad and Apple TV.' },
            desc: {
                fr: 'Lecteur multimédia pour iPhone, iPad et Apple TV : vos films, séries et chaînes, depuis vos propres sources (liste de lecture, Plex, Jellyfin, Emby, NAS, fichiers). Telora ne fournit aucun contenu.',
                en: 'Media player for iPhone, iPad and Apple TV: your movies, shows and channels, from your own sources (playlist, Plex, Jellyfin, Emby, NAS, files). Telora provides no content.'
            },
            chips: {
                fr: ['Abonnement Telora+', 'Sans publicité', 'Sans compte'],
                en: ['Telora+ subscription', 'No ads', 'No account']
            },
            features: {
                fr: [
                    'Vos sources, réunies : liste de lecture (lien M3U ou accès par identifiant), Plex, Jellyfin, Emby, NAS (WebDAV, SMB via Fichiers) et fichiers de l’appareil.',
                    'Une seule bibliothèque pour toutes vos sources : les doublons sont réunis, une fiche par film ou série avec toutes ses versions.',
                    'La meilleure source choisie dans votre langue, jusqu’en 4K, avec ses vraies caractéristiques (résolution, codec, HDR, audio).',
                    'Le direct en bouquets numérotés, programme en cours et à suivre, logos officiels des chaînes.',
                    'Sagas, studios, plateformes et acteurs, logos des titres, listes personnelles, profils et contrôle parental.',
                    'Lecteur d’Apple (image dans l’image, AirPlay, HDR) et VLC intégré pour tous les autres formats.',
                    'DNS chiffré, aucune publicité, aucun pistage. Abonnement Telora+ au mois ou à l’année, essai gratuit de 7 jours.'
                ],
                en: [
                    'Your sources, together: playlist (M3U link or account login), Plex, Jellyfin, Emby, NAS (WebDAV, SMB via Files) and files on the device.',
                    'One library for all your sources: duplicates merged, one page per movie or show with every version.',
                    'The best source picked in your language, up to 4K, with its real details (resolution, codec, HDR, audio).',
                    'Live TV in numbered lineups, now and next, official channel logos.',
                    'Collections, studios, platforms and cast, title logos, personal lists, profiles and parental controls.',
                    'Apple’s player (Picture in Picture, AirPlay, HDR) and built-in VLC for every other format.',
                    'Encrypted DNS, no ads, no tracking. Telora+ subscription, monthly or yearly, with a 7-day free trial.'
                ]
            },
            sources: { fr: 'Telora ne fournit aucun contenu : films, séries et chaînes viennent uniquement des sources que vous connectez. Logos, affiches de secours, photos des acteurs, sagas et studios proviennent de bases ouvertes : Wikidata (CC0), Wikimedia Commons et Wikipédia (licences libres), TVmaze (CC BY-SA).', en: 'Telora provides no content: movies, shows and channels come only from the sources you connect. Logos, fallback artwork, cast photos, collections and studios come from open databases: Wikidata (CC0), Wikimedia Commons and Wikipedia (free licenses), TVmaze (CC BY-SA).' },
            business: { fr: 'Aucune publicité, aucun pistage. Telora s’utilise avec l’abonnement Telora+, au mois ou à l’année, après un essai gratuit de 7 jours. L’abonnement est géré par l’App Store et votre compte Apple : l’application ne reçoit aucune donnée bancaire.', en: 'No ads, no tracking. Telora is used with the Telora+ subscription, monthly or yearly, after a 7-day free trial. The subscription is handled by the App Store and your Apple account: the app never receives payment card data.' },
            shots: { ipad: [0, 1, 2, 3, 4], duo: [0, 1, 2, 3, 4], tv: [{ fr: 'Votre vidéothèque sur grand écran', en: 'Your library on the big screen' }, 2, 3, 4] },
            storeShots: {
                fr: ['Votre vidéothèque réunie', 'Vos films à l’affiche', 'Chaque titre en détail', 'Trouvez en un instant', 'Une interface à votre goût'],
                en: ['Your media library, all in one place', 'Your movies in the spotlight', 'Every title in detail', 'Find it in an instant', 'Make it your own']
            }
        },
        telzo: {
            name: 'Telzo', platform: 'ios', accent: '#3b5bdb',
            store: 'https://apps.apple.com/app/id6822364165',
            on: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
            tag: { fr: 'Télécommande TV', en: 'TV remote' },
            promo: { fr: 'La télécommande universelle par Wi-Fi : téléviseurs, Chromecast et box TV.', en: 'The universal Wi-Fi remote: smart TVs, Chromecast and TV boxes.' },
            desc: {
                fr: 'Télécommande universelle par Wi-Fi pour iPhone et iPad : téléviseurs connectés, Chromecast et box TV, avec clavier, pavé tactile et applications. Aucun compte : les commandes vont directement de l’iPhone au téléviseur, sur votre réseau local.',
                en: 'Universal Wi-Fi remote for iPhone and iPad: smart TVs, Chromecast and TV boxes, with keyboard, touchpad and apps. No account: commands go straight from the iPhone to the TV, over your local network.'
            },
            chips: {
                fr: ['Gratuite', 'Sans compte', '7 jours d’essai Sans pub'],
                en: ['Free', 'No account', '7-day Ad-Free trial']
            },
            features: {
                fr: [
                    'Pavé directionnel ou pavé tactile, volume, chaînes, lecture et alimentation, avec retour haptique.',
                    'Le clavier de l’iPhone pour écrire vos recherches sur la télévision, et vos applications (Netflix, YouTube…) en un geste.',
                    'Téléviseurs Samsung, LG, Google TV et Android TV (Sony, TCL, Philips, Xiaomi, Hisense…), Roku et Sony Bravia, Chromecast, box Orange, Freebox, Sky Q, TiVo et DirecTV ; aussi Vizio, Panasonic Viera, LG NetCast, Philips non Android, Kodi, les amplificateurs Denon et Marantz, Yamaha MusicCast, les projecteurs PJLink et les enceintes Sonos.',
                    'Recherche automatique sur le Wi-Fi, plusieurs appareils associés et bascule rapide.',
                    'Siri, widget et commande du Centre de contrôle.',
                    'Aucun compte : les commandes vont directement de l’iPhone au téléviseur, sur votre réseau local.'
                ],
                en: [
                    'D-pad or touchpad, volume, channels, playback and power, with haptic feedback.',
                    'The iPhone keyboard to type searches on your TV, and your apps (Netflix, YouTube…) in one tap.',
                    'Samsung, LG, Google TV and Android TV (Sony, TCL, Philips, Xiaomi, Hisense…), Roku and Sony Bravia TVs, Chromecast, Orange, Freebox, Sky Q, TiVo and DirecTV boxes; also Vizio, Panasonic Viera, LG NetCast, non-Android Philips, Kodi, Denon and Marantz receivers, Yamaha MusicCast, PJLink projectors and Sonos speakers.',
                    'Automatic search on your Wi-Fi, several paired devices with quick switching.',
                    'Siri, a widget and a Control Center control.',
                    'No account: commands go straight from the iPhone to the TV, over your local network.'
                ]
            },
            sources: { fr: 'Aucune source de données externe : Telzo ne communique qu’avec les appareils de votre réseau local. Telzo n’est affilié à aucun fabricant de téléviseurs ; les marques citées appartiennent à leurs propriétaires.', en: 'No external data source: Telzo only talks to devices on your local network. Telzo is not affiliated with any TV manufacturer; the brands mentioned belong to their owners.' },
            business: { fr: 'Gratuite, toutes les touches comprises, financée par la publicité ; une vidéo facultative offre 6 h sans publicité. Abonnement facultatif « Sans pub » à 0,99 € par mois ou 4,99 € par an, avec 7 jours d’essai gratuit, géré par l’App Store et votre compte Apple.', en: 'Free, every button included, funded by advertising; an optional video gives 6 hours ad-free. Optional “Ad-Free” subscription at €0.99 per month or €4.99 per year, with a 7-day free trial, handled by the App Store and your Apple account.' },
            /* Galerie : visuels App Store de chaque appareil (CapturesAppStore.mjs) ; iPad et Duo reprennent les légendes de rang donné. */
            shots: { ipad: [0, 2, 1, 4], duo: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['La télécommande dans votre poche', 'Naviguez du bout du doigt', 'Tous vos écrans en un geste', 'Écrivez sur la TV', 'Une aide pour chaque marque'],
                en: ['Your TV remote in your pocket', 'Navigate with a swipe', 'All your screens one tap away', 'Type on your TV', 'Step-by-step help for every brand']
            }
        },
        /* Pas encore sur l'App Store (`store: ''` : pastille « Bientôt disponible »). */
        netta: {
            name: 'Netta', platform: 'ios', accent: '#0d9488', accent2: '#ccfbf1',
            store: '',
            on: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
            tag: { fr: 'Tri de la photothèque', en: 'Photo library cleanup' },
            promo: { fr: 'Triez et nettoyez votre photothèque, et retrouvez les photos de ce jour-là, année après année.', en: 'Sort and clean your photo library, and revisit the photos from this day, year after year.' },
            desc: {
                fr: 'Tri et nettoyage de la photothèque de l’iPhone et de l’iPad : doublons, photos similaires et floues, captures d’écran, vidéos lourdes, et « Ce jour-là », vos photos du même jour les années passées. Tout se fait sur l’iPhone et l’iPad, aucun compte.',
                en: 'Photo library sorting and cleanup for iPhone and iPad: duplicates, similar and blurry photos, screenshots, heavy videos, and “On This Day”, your photos from the same day in past years. Everything happens on the iPhone and iPad, no account.'
            },
            chips: {
                fr: ['Gratuite', 'Sans compte', 'Analyse sur l’appareil'],
                en: ['Free', 'No account', 'Analysis on the device']
            },
            features: {
                fr: [
                    'Doublons, photos similaires et rafales (Netta garde la meilleure), photos floues, captures d’écran et vidéos lourdes : tout ce qui encombre la photothèque est repéré.',
                    '« Ce jour-là » : les photos prises le même jour les années passées, classées par année, à garder ou à supprimer.',
                    'Le tri du jour par glissement : à gauche la corbeille, à droite on garde.',
                    'La corbeille de Netta se relit avant toute suppression ; iOS demande ensuite confirmation et les éléments restent 30 jours dans « Supprimés récemment ».',
                    'Widget Ce jour-là et raccourcis Siri.',
                    'Toute l’analyse se fait sur l’iPhone ou l’iPad : aucune photo envoyée, aucun compte, aucun serveur.'
                ],
                en: [
                    'Duplicates, similar photos and bursts (Netta keeps the best one), blurry photos, screenshots and heavy videos: everything cluttering your library is spotted.',
                    '“On This Day”: the photos taken on the same day in past years, grouped by year, to keep or delete.',
                    'Daily sorting by swiping: left for the trash, right to keep.',
                    'Netta’s trash is reviewed before anything is deleted; iOS then asks for confirmation and items stay 30 days in “Recently Deleted”.',
                    'An On This Day widget and Siri shortcuts.',
                    'All analysis happens on the iPhone or iPad: no photo sent, no account, no server.'
                ]
            },
            sources: { fr: 'Aucune source de données externe : Netta analyse vos photos sur l’appareil et ne communique avec aucun serveur du développeur. Photos, vignettes et décisions restent sur l’appareil.', en: 'No external data source: Netta analyzes your photos on the device and talks to no server of the developer. Photos, thumbnails and decisions stay on the device.' },
            business: { fr: 'Gratuite, toutes les fonctions comprises, financée par la publicité (une bannière discrète, jamais pendant le tri) ; une vidéo facultative offre 6 h sans publicité. Abonnement annuel facultatif « Sans pub » à 4,99 € par an, géré par l’App Store et votre compte Apple.', en: 'Free, every feature included, funded by advertising (a discreet banner, never while sorting); an optional video gives 6 hours ad-free. Optional yearly “Ad-Free” subscription at €4.99 per year, handled by the App Store and your Apple account.' },
            shots: { ipad: [0, 2, 1, 3], duo: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['Libérez de la place', 'Gardez ou jetez d’un geste', 'Vos souvenirs de ce jour', 'La meilleure de chaque série', 'Rien ne part sans vous'],
                en: ['Free up space', 'Keep or toss with a swipe', 'Your memories of this day', 'The best shot of every set', 'Nothing goes without you']
            }
        },
        /* Pas encore sur l'App Store (`store: ''`). Captures attendues : voir `shots` et `storeShots`. */
        foyo: {
            name: 'Foyo', platform: 'ios', accent: '#FF6B57', accent2: '#7C3AED',
            store: '',
            on: { fr: 'iPhone, iPad et iPhone Duo', en: 'iPhone, iPad and iPhone Duo' },
            tag: { fr: 'Abonnements du foyer', en: 'Household subscriptions' },
            promo: { fr: 'Tous les abonnements de la famille au même endroit : combien, quand, et qui paie quoi.', en: 'Every family subscription in one place: how much, when, and who pays what.' },
            desc: {
                fr: 'Suivi des abonnements et prélèvements récurrents de la famille : streaming, forfaits, énergie, assurances, crédits, loyer. Total par mois et par an, échéances des 12 prochains mois, rappels avant chaque prélèvement et avant la fin d’un essai gratuit, foyer partagé par iCloud. Aucun compte, aucune connexion à une banque.',
                en: 'Tracking of the family’s recurring subscriptions and direct debits: streaming, phone plans, energy, insurance, loans, rent. Total per month and per year, due dates for the next 12 months, reminders before every charge and before a free trial ends, a household shared through iCloud. No account, no bank connection.'
            },
            chips: {
                fr: ['Gratuite', 'Sans compte', 'Aucune banque connectée'],
                en: ['Free', 'No account', 'No bank connection']
            },
            features: {
                fr: [
                    'Tous les abonnements et prélèvements récurrents de la famille (streaming, forfaits, énergie, assurances, crédits, loyer), avec le total par mois et par an.',
                    'Les échéances des 12 prochains mois, des rappels avant chaque prélèvement et avant la fin d’un essai gratuit.',
                    'Des catégories et des comptes de paiement à votre façon : de simples étiquettes, aucune donnée bancaire, aucune connexion à une banque.',
                    'Des pastilles aux couleurs des services, dessinées dans l’application : aucun logo officiel.',
                    'Un foyer partagé par iCloud : le créateur invite par un lien iCloud, les invités rejoignent gratuitement. Votre espace personnel reste privé. Seul l’auteur d’un abonnement le modifie, les autres demandent une modification.',
                    'Un widget, et avec Foyo Plus : synchronisation iCloud, création du foyer, devises et export CSV.'
                ],
                en: [
                    'Every recurring subscription and direct debit of the family (streaming, phone plans, energy, insurance, loans, rent), with the total per month and per year.',
                    'Due dates for the next 12 months, and reminders before every charge and before a free trial ends.',
                    'Categories and payment accounts your way: plain labels, no banking data, no connection to a bank.',
                    'Badges in the colors of the services, drawn inside the app: no official logo.',
                    'A household shared through iCloud: the creator invites with an iCloud link, guests join for free. Your personal space stays private. Only the author of a subscription edits it; the others ask for a change.',
                    'A widget, and with Foyo Plus: iCloud sync, creating the household, currencies and CSV export.'
                ]
            },
            sources: { fr: 'Aucune source de données externe : Foyo ne communique avec aucun serveur du développeur, qui ne voit aucune donnée. Vos abonnements restent sur l’appareil et, avec Foyo Plus ou dans un foyer, dans votre iCloud.', en: 'No external data source: Foyo talks to no server of the developer, who sees no data. Your subscriptions stay on the device and, with Foyo Plus or in a household, in your iCloud.' },
            business: { fr: 'Gratuite, financée par la publicité Google AdMob (une bannière, et une vidéo récompensée facultative qui offre 6 h sans publicité), jusqu’à 5 abonnements, données sur l’appareil. Foyo Plus, à 0,99 € par mois ou 6,99 € par an, avec 7 jours d’essai gratuit et le partage familial Apple : sans publicité, abonnements sans limite, synchronisation iCloud, création du foyer, devises et export CSV. Rejoindre un foyer est gratuit. Abonnement géré par l’App Store et votre compte Apple.', en: 'Free, funded by Google AdMob advertising (a banner, and an optional rewarded video that gives 6 hours ad-free), up to 5 subscriptions, data on the device. Foyo Plus, at €0.99 per month or €6.99 per year, with a 7-day free trial and Apple Family Sharing: no ads, unlimited subscriptions, iCloud sync, creating the household, currencies and CSV export. Joining a household is free. Subscription handled by the App Store and your Apple account.' },
            shots: { ipad: [0, 1, 2, 3], duo: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['Tout ce que la famille paie', 'Les échéances des 12 prochains mois', 'Prévenu avant chaque prélèvement', 'Un foyer partagé par iCloud', 'Vos catégories et vos comptes'],
                en: ['Everything the family pays', 'The next 12 months of due dates', 'Reminded before every charge', 'A household shared through iCloud', 'Your categories and your accounts']
            }
        },
        /* Apple TV seule (`tvSeul` : scène et galerie sans iPhone ni iPad), pas encore sur l'App Store (`store: ''`). */
        ambiro: {
            name: 'Ambiro', platform: 'ios', tvSeul: true, accent: '#5B6CFF', accent2: '#FF8A6B',
            store: '',
            on: { fr: 'Apple TV', en: 'Apple TV' },
            tag: { fr: 'Écran ambiant', en: 'Ambient display' },
            promo: { fr: 'Une horloge élégante, la météo, votre musique et des fonds animés sur l’Apple TV, à la place de l’écran de veille.', en: 'An elegant clock, the weather, your music and animated backgrounds on Apple TV, instead of the screen saver.' },
            desc: {
                fr: 'Écran ambiant pour l’Apple TV : une horloge élégante, la météo d’une ville choisie, le morceau joué par l’app Musique et des fonds animés, à la place de l’écran de veille.',
                en: 'Ambient display for Apple TV: an elegant clock, the weather of a city you pick, the song playing in the Music app and animated backgrounds, instead of the screen saver.'
            },
            chips: {
                fr: ['Ambiro Pro', 'Sans publicité', 'Sans compte'],
                en: ['Ambiro Pro', 'No ads', 'No account']
            },
            features: {
                fr: [
                    'Une horloge à votre goût : cadrans numérique, superposé, géant, à aiguilles, en toutes lettres, palettes rétro et binaire ; polices, couleurs, dégradé, contour ou verre, effet et carillon facultatifs à l’heure pile.',
                    'Des fonds animés en shaders (onde liquide, aurore, soie, nébuleuse, prisme, aquarelle, ciel étoilé, pluie sur la vitre...), des particules, ou le diaporama de vos photos ; les couleurs de la pochette du morceau en cours.',
                    'La météo d’un lieu choisi à la main, sans localisation : conditions actuelles, heure par heure et dix jours.',
                    'Le morceau joué par l’app Musique, avec pochette et avancement, en carte ou en plein écran, piloté à la télécommande. Apple Music seulement.',
                    'Des sons d’ambiance enregistrés dans la nature, en boucle sans coupure (pluie, orage, vagues, vent, feu, ruisseau, forêt, nuit d’été, bruits blanc, rose et brun), avec arrêt programmé.',
                    'La carte Maison : caméras, sonnette, température, lumières, serrures, portes et piles faibles.',
                    'Des réglages à la manière de tvOS, des styles prêts, des thèmes synchronisés par iCloud, une plage de nuit, un délai de veille et la protection des écrans OLED.'
                ],
                en: [
                    'A clock your way: digital, overlapping, giant, analog and spelled-out faces, retro and binary palettes; fonts, colors, gradient, outline or glass, with an optional effect and chime on the hour.',
                    'Animated shader backgrounds (liquid wave, aurora, silk, nebula, prism, watercolor, starry sky, rain on the window...), particles, or a slideshow of your photos; the colors of the current song’s cover.',
                    'The weather of a place you pick by hand, with no location: current conditions, hour by hour and ten days.',
                    'The song playing in the Music app, with cover and progress, as a card or full screen, controlled from the remote. Apple Music only.',
                    'Ambient sounds recorded in nature, looped seamlessly (rain, thunderstorm, waves, wind, fire, stream, forest, summer night, white, pink and brown noise), with a sleep timer.',
                    'The Home card: cameras, doorbell, temperature, lights, locks, doors and low batteries.',
                    'tvOS-style settings, ready-made styles, themes synced through iCloud, a night window, a sleep delay and OLED screen protection.'
                ]
            },
            shots: { tv: [0, 1, 2, 3, 4] },
            storeShots: {
                fr: ['Votre salon prend vie', 'Le morceau en grand', 'Une horloge à votre goût', 'Tout se règle à la télécommande', 'La pluie, les vagues, le feu'],
                en: ['Your living room comes alive', 'Your song on the big screen', 'A clock that suits you', 'Tune everything with the remote', 'Rain, waves, fire']
            },
            sources: { fr: 'Aucune source de données externe : Ambiro ne communique avec aucun serveur du développeur, qui ne voit aucune donnée. Seuls Apple Météo et MapKit (la météo et la recherche d’une ville), iCloud (les réglages) et l’App Store (l’abonnement) utilisent Internet.', en: 'No external data source: Ambiro talks to no server of the developer, who sees no data. Only Apple Weather and MapKit (the weather and finding a city), iCloud (the settings) and the App Store (the subscription) use the Internet.' },
            business: { fr: 'Aucune publicité, aucun pistage. L’horloge, les fonds de base, les bruits blanc, rose et brun et les réglages de veille sont gratuits. Ambiro Pro, à 0,99 € par mois ou 5,99 € par an, avec 7 jours d’essai gratuit et le partage familial Apple : météo, lecteur de musique, carte Maison, tous les fonds, polices, sons et styles, thèmes illimités. Abonnement géré par l’App Store et votre compte Apple : l’application ne reçoit aucune donnée bancaire.', en: 'No ads, no tracking. The clock, the basic backgrounds, the white, pink and brown noises and the sleep settings are free. Ambiro Pro, at €0.99 per month or €5.99 per year, with a 7-day free trial and Apple Family Sharing: weather, music player, Home card, every background, font, sound and style, unlimited themes. Subscription handled by the App Store and your Apple account: the app never receives payment card data.' }
        },
        mactuner: {
            name: 'MacTuner', platform: 'mac', accent: '#8eb8ff',
            store: GITHUB_MACTUNER,
            tag: { fr: 'Centre de contrôle Mac', en: 'Mac control center' },
            promo: { fr: 'Le matériel en temps réel, 34 réglages système réversibles, nettoyage et ventilation.', en: 'Hardware in real time, 34 reversible system tweaks, cleanup and fan control.' },
            desc: {
                fr: 'Application macOS libre : tableau de bord temps réel, réglages système réversibles, nettoyage, désinstallation sans résidu, maintenance et contrôle du ventilateur.',
                en: 'Free macOS app: real-time dashboard, reversible system tweaks, cleanup, residue-free uninstall, maintenance and fan control.'
            },
            features: {
                fr: ['Tableau de bord : CPU par cœur, mémoire, disque, réseau, température, batterie et ventilation en temps réel.', '34 réglages système réversibles (ceux qui touchent Siri, Apple Intelligence, la télémétrie et iCloud exigent SIP désactivé).', 'Nettoyage sur 34 catégories et désinstallation sans résidu, protégées par un garde-fou central.', 'Contrôle du ventilateur borné au min/max constructeur, préréglages et réapplication au démarrage.'],
                en: ['Dashboard: per-core CPU, memory, disk, network, temperature, battery and fans in real time.', '34 reversible system tweaks (those touching Siri, Apple Intelligence, telemetry and iCloud require SIP to be disabled).', 'Cleanup across 34 categories and residue-free uninstall, protected by a central safety guard.', 'Fan control capped to maker min/max, presets and reapply at startup.']
            },
            sources: { fr: 'Mécanismes documentés d’Apple uniquement : launchctl, defaults, IOKit SMC. Aucun fichier système modifié.', en: 'Documented Apple mechanisms only: launchctl, defaults, IOKit SMC. No system file is ever modified.' },
            business: { fr: 'Gratuit et open source (MIT) : ni publicité, ni achat, ni compte.', en: 'Free and open source (MIT): no ads, purchases or accounts.' }
        },
        dnstuner: {
            name: 'DNSTuner', platform: 'mac', accent: '#6d5cff',
            store: GITHUB_DNSTUNER,
            tag: { fr: 'Sélecteur de DNS système', en: 'System-wide DNS switcher' },
            promo: { fr: '46 résolveurs publics, DNS chiffré, et la mesure réelle de ce que chacun bloque.', en: '46 public resolvers, encrypted DNS, and a real measurement of what each one blocks.' },
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
        },
        trouchromatique: {
            name: 'Trou Chromatique', platform: 'ios', game: true, accent: '#f26b3a', accent2: '#c2185b',
            store: STORE_TC,
            tag: { fr: 'Jeu d’aventure', en: 'Adventure game' },
            desc: {
                fr: 'Gloup attrape tout ce qui a sa couleur : dix îles flottantes, cent niveaux et une vraie histoire pour rendre ses couleurs à Chromaterre. Gratuit, sans achat intégré.',
                en: 'Gloup catches everything of his color: ten floating islands, a hundred levels and a real story to bring color back to Chromaterre. Free, no in-app purchases.'
            },
            features: {
                fr: [
                    'Faites glisser le doigt pour déplacer Gloup : il n’attrape que les objets de sa couleur, grandit à chaque prise, et change de couleur en attrapant une gemme.',
                    'Dix îles de dix niveaux, de la cuisine à la base lunaire, chacune avec son décor, sa musique, son ami et un boss géant au dixième niveau.',
                    'Une histoire complète : cinématiques, dialogues parlés, dix amis et le Baron Grisaille, qui a volé les couleurs de l’archipel.',
                    'Un défi du jour, le même pour tous, un cadeau quotidien et un bonus au choix avant chaque niveau.',
                    'Des looks pour Gloup, des quêtes annexes et une collection, tout se gagne en jouant.',
                    '45 langues, iPhone et iPad, portrait et paysage. Qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion, sans compte.'
                ],
                en: [
                    'Slide your finger to move Gloup: he only catches objects of his color, grows with every catch, and switches color when he grabs a gem.',
                    'Ten islands of ten levels, from the kitchen to the moon base, each with its own scenery, music, friend and a giant boss on the tenth level.',
                    'A full story: cutscenes, voiced dialogue, ten friends and Baron Grisaille, who stole the archipelago’s colors.',
                    'A daily challenge, the same for everyone, a daily gift and a booster of your choice before each level.',
                    'Looks for Gloup, side quests and a collection, all earned by playing.',
                    '45 languages, iPhone and iPad, portrait and landscape. Graphics quality adjusts automatically to the device. The game plays offline, with no account.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, iCloud (sauvegarde) et Game Center utilisent le réseau.', en: 'No external data: the islands, levels, music and texts are built into the game, which plays offline. Only advertising, iCloud (the save) and Game Center use the network.' },
            business: { fr: 'Jeu 100 % gratuit, financé par la publicité Google AdMob : vidéos facultatives pour un bonus, et courte publicité entre deux niveaux. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free game, funded by Google AdMob ads: optional videos for a bonus, and a short ad between two levels. Offline, optional videos are disabled and give no reward. No in-app purchases, no payment card data in the app.' },
            promo: {
                fr: 'Attrape tout ce qui a ta couleur. Dix îles, cent niveaux et une vraie histoire.',
                en: 'Catch everything of your color. Ten islands, a hundred levels and a real story.'
            },
            stats: {
                fr: [['10', 'îles flottantes'], ['100', 'niveaux'], ['45', 'langues'], ['0', 'achat intégré']],
                en: [['10', 'floating islands'], ['100', 'levels'], ['45', 'languages'], ['0', 'in-app purchases']]
            },
            /* Les huit captures App Store V0.1 (docs/screenshots du projet), dans
               l'ordre de la fiche. Légendes tirées du README des captures. */
            storeShots: {
                fr: ['L’accueil et le logo du jeu', 'Une partie sur la base lunaire', 'Le boss du village de Noël', 'Dix îles à explorer', 'Le Baron Grisaille, qui a volé les couleurs', 'Les dix amis de Gloup', 'Des looks pour Gloup', 'Victoire et cadeau du jour'],
                en: ['The home screen and the game logo', 'A level on the moon base', 'The Christmas village boss', 'Ten islands to explore', 'Baron Grisaille, who stole the colors', 'Gloup’s ten friends', 'Looks for Gloup', 'Victory and daily gift']
            }
        },
        mongloup: {
            name: 'Mon Gloup', platform: 'ios', game: true, accent: '#8a5cf6', accent2: '#4c1d95',
            store: STORE_MG,
            tag: { fr: 'Compagnon virtuel', en: 'Virtual pet' },
            desc: {
                fr: 'Gloup, la petite créature aux grands yeux, emménage dans une maison de poupée et son jardin : nourrissez-le, lavez-le, couchez-le, cultivez le potager et jouez avec lui. Il grandit, se forge un caractère et adore les câlins. Gratuit, sans achat intégré.',
                en: 'Gloup, the little creature with big eyes, moves into a dollhouse and its garden: feed him, bathe him, tuck him in, grow the vegetable patch and play with him. He grows, builds a personality and loves cuddles. Free, no in-app purchases.'
            },
            features: {
                fr: [
                    'Une maison en coupe, chambre, salon, cuisine et salle de bain : Gloup mange ce que vous lui glissez jusqu’à la bouche, cuisine 14 recettes avec vous, prend son bain moussant et se couche au terme d’un rituel du soir.',
                    'Un jardin à cultiver : semer, arroser et récolter au potager, secouer le pommier, pousser la balançoire, fouiller les cachettes. Quand il pleut, le potager se régale.',
                    'Quatre besoins, faim, joie, propreté et énergie, suivent le temps réel. À l’adoption, vous choisissez : Sans mort, Gloup ne tombe jamais malade ; Avec mort, longtemps négligé, il tombe malade et peut partir, toujours après des avertissements.',
                    'Il grandit de bébé à adulte sur 60 niveaux et se forge un caractère parmi cinq traits : gourmand, joueur, coquet, rêveur ou jardinier.',
                    '33 aliments, 20 chapeaux, 14 looks, 24 couleurs, et des papiers peints, sols et meubles pour décorer chaque pièce.',
                    '9 mini-jeux, 18 activités, des quêtes du jour et de la semaine, un album de souvenirs, un ami en visite chaque jour et 20 trophées, aussi dans Game Center.',
                    '45 langues, iPhone et iPad, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion, sans compte, avec des rappels facultatifs quand Gloup a besoin de vous.'
                ],
                en: [
                    'A cutaway house with a bedroom, living room, kitchen and bathroom: Gloup eats what you slide to his mouth, cooks 14 recipes with you, takes a bubble bath and goes to bed after an evening ritual.',
                    'A garden to grow: sow, water and harvest the vegetable patch, shake the apple tree, push the swing, search the hiding spots. When it rains, the vegetable patch loves it.',
                    'Four needs, hunger, joy, cleanliness and energy, follow real time. At adoption you choose: Never dies, Gloup never gets sick; Can pass away, neglected for too long he gets sick and may leave, always after warnings.',
                    'He grows from baby to adult over 60 levels and builds a personality from five traits: foodie, playful, stylish, dreamer or gardener.',
                    '33 foods, 20 hats, 14 looks, 24 colors, and wallpapers, floors and furniture to decorate every room.',
                    '9 mini-games, 18 activities, daily and weekly quests, a memory album, a friend visiting each day and 20 trophies, also in Game Center.',
                    '45 languages, iPhone and iPad, with graphics quality adjusting automatically to the device. The game plays offline, with no account, with optional reminders when Gloup needs you.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : la maison, le jardin, les aliments, les looks, les mini-jeux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Les rappels sont programmés sur l’appareil, sans serveur. Seules la publicité, iCloud (sauvegarde) et Game Center utilisent le réseau.', en: 'No external data: the house, garden, foods, looks, mini-games, music and texts are built into the game, which plays offline. Reminders are scheduled on the device, with no server. Only advertising, iCloud (the save) and Game Center use the network.' },
            business: { fr: 'Jeu 100 % gratuit, financé par la publicité Google AdMob : vidéos facultatives pour un coup de pouce, 12 par jour au plus, et courte publicité possible après un mini-jeu. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free game, funded by Google AdMob ads: optional videos for a small boost, 12 a day at most, and a short ad that may appear after a mini-game. Offline, optional videos are disabled and give no reward. No in-app purchases, no payment card data in the app.' },
            promo: {
                fr: 'Gloup emménage chez vous. Nourrissez-le, lavez-le, couchez-le et regardez-le grandir.',
                en: 'Gloup moves in with you. Feed him, bathe him, tuck him in and watch him grow.'
            },
            stats: {
                fr: [['60', 'niveaux, de bébé à adulte'], ['9', 'mini-jeux'], ['33', 'aliments'], ['45', 'langues']],
                en: [['60', 'levels, from baby to adult'], ['9', 'mini-games'], ['33', 'foods'], ['45', 'languages']]
            },
            storeShots: {
                fr: ['La maison et son jardin', 'La cuisine, un gâteau pour Gloup', 'Le bain moussant', 'Pyjama, doudou et au lit', 'Le potager à cultiver', 'De bébé à adulte', 'La garde-robe', 'Neuf mini-jeux'],
                en: ['The house and its garden', 'The kitchen, a cake for Gloup', 'The bubble bath', 'Pajamas, teddy and bedtime', 'The vegetable patch to grow', 'From baby to adult', 'The wardrobe', 'Nine mini-games']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CF). Un jeu sans fiche reprend `store: ''` : pastille « Bientôt
           disponible » et, dans le premier écran et la section des jeux, « Bientôt sur l'App Store ». Les captures
           (`assets/img/shots/chromafight-*`, issues de `Docs/ChromaFight/Screenshots`, iPhone et iPad) se régénèrent
           par `Outils/Parc/Marque/CapturesSite.mjs`, mêmes noms, en recalant `storeShots`. */
        chromafight: {
            name: 'ChromaFight', platform: 'ios', game: true, accent: '#ff7a3d', accent2: '#2d2366',
            store: STORE_CF,
            tag: { fr: 'Jeu de combat', en: 'Battle game' },
            desc: {
                fr: 'Gloup, la petite créature aux grands yeux, recrache les objets de son ventre sur les Grisons, nés de la Grisaille, une suie vivante échappée de la forge du volcan. Rangez, fusionnez, accordez les couleurs : onze îles à libérer. Gratuit, avec achats intégrés facultatifs.',
                en: 'Gloup, the little creature with big eyes, spits the objects from his tummy at the Greylings, born of the Grisaille, a living soot that escaped from the volcano forge. Arrange, merge, match colors: eleven islands to free. Free, with optional in-app purchases.'
            },
            chips: {
                fr: ['Gratuit', 'Achats facultatifs', 'Sans compte'],
                en: ['Free', 'Optional purchases', 'No account']
            },
            features: {
                fr: [
                    'Le ventre de Gloup est une grille : faites glisser les objets pour les ranger. À chaque recharge, Gloup recrache chacun d’eux sur les Grisons, et vous pouvez réorganiser en plein combat.',
                    'Deux objets identiques glissés l’un sur l’autre fusionnent, sur quatre niveaux. Trois objets de même couleur qui se touchent forment un accord, cinq un grand accord : huit couleurs en jeu.',
                    'Onze îles et 105 niveaux, de la cuisine à la base lunaire, dont l’île secrète du volcan. Chacune a ses quatre Grisons, un mini-boss au niveau 5 et un boss au niveau 10.',
                    'Onze amis à débloquer, un par île : chacun donne à Gloup un objet de départ, une forme de ventre et un pouvoir. Un atelier de huit améliorations rend Gloup plus fort au fil des parties.',
                    'Des coffres sur la barre des vagues et un coffre à la fin de chaque île, des quêtes du jour et de la semaine, des missions, un bestiaire de 44 Grisons, une piste de progression gratuite et un cadeau chaque jour.',
                    'Aucune pub pendant un niveau : les vidéos sont facultatives, et le moindre achat, comme « Sans pub », supprime la courte publicité entre deux niveaux. À chaque île, une offre d’île facultative, seulement dans la Boutique.',
                    '45 langues, iPhone et iPad, portrait et paysage, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion. Sans compte : la progression reste sur l’appareil et dans votre iCloud, jamais chez l’éditeur.'
                ],
                en: [
                    'Gloup’s tummy is a grid: drag objects to arrange them. Each time one recharges, Gloup spits it at the Greylings, and you can rearrange mid-fight.',
                    'Two identical objects dragged onto each other merge, over four levels. Three objects of the same color that touch form a chord, five a grand chord: eight colors in play.',
                    'Eleven islands and 105 levels, from the kitchen to the moon base, including the secret volcano island. Each has its four Greylings, a mini-boss on level 5 and a boss on level 10.',
                    'Eleven friends to unlock, one per island: each gives Gloup a starting object, a tummy shape and a power. A workshop of eight upgrades makes Gloup stronger over time.',
                    'Chests on the wave bar and a chest at the end of every island, daily and weekly quests, missions, a bestiary of 44 Greylings, a free progress track and a gift every day.',
                    'No ads during a level: videos are optional, and any purchase, such as “No ads”, removes the short ad between two levels. On each island, an optional island offer, only in the Shop.',
                    '45 languages, iPhone and iPad, portrait and landscape, with graphics quality adjusting automatically to the device. The game plays offline. No account: progress stays on the device and in your iCloud, never with the publisher.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les objets, les Grisons, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, les achats (App Store), Game Center et la copie iCloud de la sauvegarde utilisent le réseau.', en: 'No external data: the islands, levels, objects, Greylings, music and texts are built into the game, which plays offline. Only advertising, purchases (App Store), Game Center and the iCloud copy of the save use the network.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos facultatives, et courte publicité entre deux niveaux, jamais pendant un niveau) et par des achats intégrés facultatifs : gemmes, pack de départ, « Sans pub » (suppression de la petite publicité) et offres d’île. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Aucune puissance n’est vendue, aucune donnée bancaire dans l’app.', en: 'Free game, funded by Google AdMob ads (optional videos, and a short ad between two levels, never during a level) and by optional in-app purchases: gems, a starter pack, “No ads” (removal of the short ad) and island offers. Offline, optional videos are disabled and give no reward. No power is for sale, no payment card data in the app.' },
            promo: {
                fr: 'Gloup recrache les objets de son ventre sur les Grisons. Range, fusionne, accorde les couleurs et libère onze îles.',
                en: 'Gloup spits the objects from his tummy at the Greylings. Arrange, merge, match colors and free eleven islands.'
            },
            stats: {
                fr: [['11', 'îles'], ['105', 'niveaux'], ['44', 'Grisons'], ['4', 'niveaux de fusion']],
                en: [['11', 'islands'], ['105', 'levels'], ['44', 'Greylings'], ['4', 'merge levels']]
            },
            /* Captures App Store du 8 octobre 2026 (CapturesSite.mjs), ordre des fiches. */
            storeShots: {
                fr: ['L’accueil et la carte de l’île aux pirates', 'Gloup recrache les objets de son ventre', 'Fusionne et accorde les couleurs', 'Des boss géants', 'Onze îles à libérer', 'Onze amis à tes côtés', '44 Grisons à découvrir', 'Améliore ton atelier'],
                en: ['The home screen and the Pirate Island map', 'Gloup spits the objects from his tummy', 'Merge and match colors', 'Giant bosses', 'Eleven islands to free', 'Eleven friends by your side', '44 Greylings to discover', 'Upgrade your workshop']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CT). Captures App Store (`assets/img/shots/chromatraque-*`, iPhone et
           iPad), mêmes noms que ChromaFight, avec `storeShots`. Achats intégrés facultatifs et énergie,
           aucun abonnement. */
        chromatraque: {
            name: 'ChromaTraque', platform: 'ios', game: true, accent: '#7b4dff', accent2: '#f4a300',
            store: STORE_CT,
            tag: { fr: 'Jeu de déduction', en: 'Deduction game' },
            desc: {
                fr: 'Un Grison invisible vole les gâteaux de Chromaterre. Gloup, la petite créature aux grands yeux, et ses amis l’écoutent, devinent sa cachette et fouillent la bonne case avant la fin des tours. Six îles, un défi du jour et une traque sans fin. Gratuit, avec achats intégrés facultatifs.',
                en: 'An invisible Greyling is stealing the cakes of Chromaterre. Gloup, the little creature with big eyes, and his friends listen for it, work out its hiding place and search the right square before the turns run out. Six islands, a daily challenge and an endless hunt. Free, with optional in-app purchases.'
            },
            chips: {
                fr: ['Gratuit', 'Achats facultatifs', 'Sans compte'],
                en: ['Free', 'Optional purchases', 'No account']
            },
            features: {
                fr: [
                    'Sur chaque île de Chromaterre, un Grison invisible se cache dans une grille de cases. Posez un ami pour écouter : il annonce le nombre de pas jusqu’au voleur, murs contournés, ou « … » s’il est trop loin. Puis fouillez la bonne case.',
                    'Le voleur bouge après chacune de vos actions, d’une case ou pas du tout, jamais à travers un mur ni dans la lumière : à vous de déduire où il peut être. L’aide « Déduction » montre les cases où il peut se cacher.',
                    'Six îles de dix niveaux, de la Ferme des Tournesols à la Base lunaire, en passant par la Cuisine, le Manoir hanté, la Ville et le Château, chacune avec sa mécanique : lampes, farine qui garde les empreintes, portes à grelots, voleur furtif, souris mécanique qui fait diversion, deux voleurs à la fois. Un chef au dixième niveau.',
                    'Des pièces à chaque victoire, à dépenser à la Boutique : six gadgets (sonar, lampe, porte, miel, jumelles et sablier), des looks pour Gloup et des offres.',
                    'Un défi du jour, le même pour tous, des cadeaux sur sept jours, une traque sans fin ouverte après la troisième île, une histoire avec le Baron Grisaille et 21 trophées, aussi dans Game Center.',
                    'Gratuit, avec des achats intégrés facultatifs : rien d’exclusif, tout se gagne en jouant. Aucune pub pendant un niveau : les vidéos sont facultatives, et « Sans pub » supprime la petite pub entre deux niveaux. Une énergie s’active après 10 niveaux réussis (6 au plus, 1 de plus toutes les 15 minutes) ; le défi du jour reste gratuit.',
                    '45 langues, iPhone et iPad, portrait et paysage, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion. Sans compte : la progression reste sur l’appareil et dans votre iCloud, avec des rappels facultatifs.'
                ],
                en: [
                    'On each island of Chromaterre, an invisible Greyling hides in a grid of squares. Place a friend to listen: they call out the number of steps to the thief, going around walls, or “…” if it is too far. Then search the right square.',
                    'The thief moves after each of your actions, one square or not at all, never through a wall or into the light: it is up to you to work out where it can be. The “Deduction” aid shows the squares where it may be hiding.',
                    'Six islands of ten levels, from the Sunflower Farm to the Moon Base, by way of the Kitchen, the Haunted Manor, the Town and the Castle, each with its own mechanic: lamps, flour that keeps footprints, belled doors, a stealthy thief, a clockwork mouse as a decoy, two thieves at once. A boss on the tenth level.',
                    'Coins for every win, to spend in the Shop: six gadgets (sonar, lamp, door, honey, binoculars and hourglass), looks for Gloup and offers.',
                    'A daily challenge, the same for everyone, gifts over seven days, an endless hunt unlocked after the third island, a story with Baron Grisaille and 21 trophies, also in Game Center.',
                    'Free, with optional in-app purchases: nothing is exclusive, everything is earned by playing. No ads during a level: videos are optional, and “No ads” removes the short ad between two levels. Energy turns on after 10 levels completed (6 at most, 1 more every 15 minutes); the daily challenge stays free.',
                    '45 languages, iPhone and iPad, portrait and landscape, with graphics quality adjusting automatically to the device. The game plays offline. No account: progress stays on the device and in your iCloud, with optional reminders.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les voleurs, les gadgets, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, les achats (App Store), Game Center et la copie iCloud de la sauvegarde utilisent le réseau. Les rappels sont programmés sur l’appareil, sans serveur.', en: 'No external data: the islands, levels, thieves, gadgets, music and texts are built into the game, which plays offline. Only advertising, purchases (App Store), Game Center and the iCloud copy of the save use the network. Reminders are scheduled on the device, with no server.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos facultatives, et courte publicité entre deux niveaux, jamais pendant un niveau ni avant 10 niveaux réussis) et par des achats intégrés facultatifs : Pack de départ (1 500 pièces, un de chaque gadget, un look et l’énergie pleine), « Sans pub » (suppression de la petite publicité) et pièces. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Rien d’exclusif, aucun abonnement, aucune donnée bancaire dans l’app.', en: 'Free game, funded by Google AdMob ads (optional videos, and a short ad between two levels, never during a level or before 10 levels completed) and by optional in-app purchases: Starter Pack (1,500 coins, one of each gadget, a look and full energy), “No ads” (removal of the short ad) and coins. Offline, optional videos are disabled and give no reward. Nothing is exclusive, no subscription, no payment card data in the app.' },
            promo: {
                fr: 'Un voleur invisible rôde sur les îles de Chromaterre. Écoute, déduis, fouille la bonne case avant la fin des tours.',
                en: 'An invisible thief prowls the islands of Chromaterre. Listen, deduce, search the right square before the turns run out.'
            },
            stats: {
                fr: [['6', 'îles'], ['60', 'niveaux'], ['6', 'gadgets'], ['45', 'langues']],
                en: [['6', 'islands'], ['60', 'levels'], ['6', 'gadgets'], ['45', 'languages']]
            },
            storeShots: {
                fr: ['L’accueil de ChromaTraque', 'Écoute et déduis', 'L’aide Déduction', 'Six îles à protéger', 'Le Baron Grisaille', 'Des gadgets malins', 'Des looks pour Gloup', 'Des cadeaux chaque jour'],
                en: ['The ChromaTraque home screen', 'Listen and deduce', 'The Deduction aid', 'Six islands to protect', 'Baron Grisaille', 'Clever gadgets', 'Cool looks for Gloup', 'Daily gifts']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CFM, app 6824902491 sur App Store Connect). Captures App Store
           (`assets/img/shots/chromaferme-*`, iPhone et iPad, `Outils/Parc/Marque/CapturesSite.mjs`). Faits relevés dans
           le code du jeu le 20 octobre 2026. */
        chromaferme: {
            name: 'ChromaFerme', platform: 'ios', game: true, accent: '#3a9b4f', accent2: '#f2b632',
            store: STORE_CFM,
            tag: { fr: 'Jeu de ferme', en: 'Farming game' },
            desc: {
                fr: 'Le Baron Grisaille a délavé la ferme de Gloup, la petite créature aux grands yeux. Semez, récoltez, élevez, transformez et livrez les commandes de ses amis : chaque récolte, chaque produit et chaque bâtiment rend sa couleur à l’île. Gratuit, avec achats intégrés facultatifs.',
                en: 'Baron Grisaille has washed out the farm of Gloup, the little creature with big eyes. Sow, harvest, raise animals, process goods and deliver his friends’ orders: every harvest, product and building brings color back to the island. Free, with optional in-app purchases.'
            },
            chips: {
                fr: ['Gratuit', 'Achats facultatifs', 'Sans compte'],
                en: ['Free', 'Optional purchases', 'No account']
            },
            features: {
                fr: [
                    'Semez en glissant une semence sur les parcelles vides, récoltez d’un seul glissé sur les parcelles mûres : vingt cultures à faire pousser.',
                    'Quatre animaux (poule, vache, mouton, cochon) à loger et à nourrir avec ce que fait le moulin, pour récolter œufs, lait, laine et truffes.',
                    'Neuf ateliers avec leur file de production : moulin, boulangerie, laiterie, teinturerie (qui mélange les couleurs), filature, cuisine, pressoir, parfumerie et chocolaterie.',
                    'Les commandes de vos amis au tableau, livrées par la charrette ; dès le niveau 9, le bateau emporte des caisses vers sept ports de l’archipel de Chromaterre.',
                    'Soixante niveaux, un terrain à agrandir lot par lot (trente lots), des décorations et des chemins à poser, et une couleur rendue qui gagne l’île peu à peu.',
                    'Une histoire avec le Baron Grisaille, huit actes récompensés, des tâches du jour, un défi de la semaine, des cadeaux sur sept jours et 66 trophées, aussi dans Game Center.',
                    'Gratuit, avec des achats intégrés facultatifs. Aucune publicité pendant l’action : les vidéos récompensées sont facultatives. Aucun achat n’est nécessaire pour progresser ; les éclats servent seulement à gagner du temps, dans la limite du jour.',
                    '45 langues, iPhone et iPad, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion. Sans compte : la progression reste sur l’appareil et dans votre iCloud, avec des rappels facultatifs.'
                ],
                en: [
                    'Sow by dragging a seed over the empty plots, harvest with a single swipe over the ripe ones: twenty crops to grow.',
                    'Four animals (hen, cow, sheep, pig) to house and feed with what the mill makes, for eggs, milk, wool and truffles.',
                    'Nine workshops, each with its production queue: mill, bakery, dairy, dye works (which mixes colors), spinning mill, kitchen, press, perfumery and chocolate factory.',
                    'Your friends’ orders on the board, delivered by the cart; from level 9, the boat carries crates to seven ports of the Chromaterre archipelago.',
                    'Sixty levels, land to expand lot by lot (thirty lots), decorations and paths to lay, and restored color that spreads across the island little by little.',
                    'A story with Baron Grisaille, eight rewarded acts, daily tasks, a weekly challenge, gifts over seven days and 66 trophies, also in Game Center.',
                    'Free, with optional in-app purchases. No ads during the action: rewarded videos are optional. No purchase is needed to progress; gems only save time, within the daily limit.',
                    '45 languages, iPhone and iPad, with graphics quality adjusting automatically to the device. The game plays offline. No account: progress stays on the device and in your iCloud, with optional reminders.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les cultures, les animaux, les ateliers, les commandes, les décors, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, les achats (App Store), Game Center et la copie iCloud de la sauvegarde utilisent le réseau. Les rappels sont programmés sur l’appareil, sans serveur.', en: 'No external data: the crops, animals, workshops, orders, decorations, music and texts are built into the game, which plays offline. Only advertising, purchases (App Store), Game Center and the iCloud copy of the save use the network. Reminders are scheduled on the device, with no server.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos récompensées facultatives seulement, jamais pendant l’action, aucune publicité intercalée) et par des achats intégrés facultatifs : Pack de départ, « Sans pub » (saute le visionnage des vidéos facultatives, mêmes effets et mêmes limites), Pack Arc-en-ciel (six décors) et éclats. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Aucun abonnement, aucune donnée bancaire dans l’app.', en: 'Free game, funded by Google AdMob ads (optional rewarded videos only, never during the action, no interstitial ads) and by optional in-app purchases: Starter Pack, “No ads” (skips the watching of the optional videos, same effects and same limits), Rainbow Pack (six decorations) and gems. Offline, optional videos are disabled and give no reward. No subscription, no payment card data in the app.' },
            promo: {
                fr: 'Le Baron Grisaille a délavé la ferme de Gloup. Sème, récolte, livre : chaque geste lui rend sa couleur.',
                en: 'Baron Grisaille has washed out Gloup’s farm. Sow, harvest, deliver: every move brings its color back.'
            },
            stats: {
                fr: [['20', 'cultures'], ['9', 'ateliers'], ['60', 'niveaux'], ['66', 'trophées']],
                en: [['20', 'crops'], ['9', 'workshops'], ['60', 'levels'], ['66', 'trophies']]
            },
            storeShots: {
                fr: ['Ta ferme en couleurs', 'Sème et récolte', 'Les ateliers', 'Des animaux adorables', 'Les commandes', 'Le bateau', 'Décore ta ferme', 'L’accueil de ChromaFerme'],
                en: ['Your farm in color', 'Sow and harvest', 'The workshops', 'Adorable animals', 'The orders', 'The boat', 'Decorate your farm', 'The ChromaFerme home screen']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CC). Jeu en paysage seul (`paysage`) : captures App Store
           `assets/img/shots/chromaciel-*` (iPhone 2868 x 1320 par `PAYSAGE=1`, iPad, `Outils/Parc/Marque/CapturesSite.mjs`)
           montrées en paysage. Faits fournis par le titulaire le 22 octobre 2026. */
        chromaciel: {
            name: 'ChromaCiel', platform: 'ios', game: true, paysage: true, ecran: true, accent: '#3f9be0', accent2: '#ff9f43',
            store: STORE_CC,
            tag: { fr: 'RPG d’action', en: 'Action RPG' },
            desc: {
                fr: 'Le Baron Grisaille a délavé le ciel : les îles flottantes ont perdu leurs couleurs et leurs habitants sont devenus des monstres gris. Gloup, petite flaque vivante aux grands yeux, rend ses couleurs au monde. Gratuit, avec achats intégrés facultatifs.',
                en: 'Baron Grisaille has washed out the sky: the floating islands have lost their colors and their inhabitants have turned into gray monsters. Gloup, a little living puddle with big eyes, brings the world’s colors back. Free, with optional in-app purchases.'
            },
            chips: {
                fr: ['Gratuit', 'Achats facultatifs', 'Sans compte'],
                en: ['Free', 'Optional purchases', 'No account']
            },
            features: {
                fr: [
                    'Huit grandes îles flottantes et 24 régions reliées sans coupure, un cycle du jour et de la nuit, un paysage riche (herbe en touffes, arbres et rochers propres à chaque île) et le vol pour passer d’une île à l’autre.',
                    'Des villes vivantes : une ville de départ fortifiée avec sa place et sa fontaine, un marché de 14 étals, 14 boutiques (banque, forge, arène, ménagerie, téléporteur…) et 48 habitants ; des hameaux, et des fermes comme le Grenier à grains, sa grange et ses meules.',
                    'Des combats en temps réel : plus de 200 espèces de monstres, des élites, des seigneurs de famille et 8 Gardiens à plusieurs phases.',
                    'Trois styles de combat, Pinceau, Prisme et Aquarelle, et 12 compétences.',
                    'Huit emplacements d’équipement, cinq raretés, huit panoplies, des gemmes et une forge ; sept familiers.',
                    '80 quêtes principales, plus de 140 quêtes secondaires, des quêtes du jour et 7 donjons en normal et en difficile, aux salles détaillées et aux torches animées.',
                    'Des anneaux de vol, des taches de grisaille, un bestiaire, 60 niveaux et 48 trophées, aussi dans Game Center.',
                    'Gratuit, avec des achats intégrés facultatifs. Aucune bannière ni publicité intercalée : seules des vidéos récompensées facultatives sont proposées. Rien de ce qui s’achète ne donne de niveau, de statistique ni de pièces ; seul un bonus temporaire d’expérience, aussi gagné en jeu, existe.',
                    'iPhone et iPad, en paysage, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion. Sans compte : la sauvegarde reste sur l’appareil et dans votre iCloud.'
                ],
                en: [
                    'Eight large floating islands and 24 seamlessly connected regions, a day and night cycle, a rich landscape (tufted grass, trees and rocks of each island’s own) and flight to travel from island to island.',
                    'Living towns: a fortified starting town with its square and fountain, a market of 14 stalls, 14 shops (bank, forge, arena, menagerie, teleporter…) and 48 residents; hamlets, and farms such as the Grain Loft, its barn and its haystacks.',
                    'Real-time combat: over 200 monster species, elites, family lords and 8 multi-phase Guardians.',
                    'Three combat styles, Brush, Prism and Watercolor, and 12 skills.',
                    'Eight equipment slots, five rarities, eight sets, gems and a forge; seven companions.',
                    '80 main quests, over 140 side quests, daily quests and 7 dungeons in normal and hard, with detailed rooms and animated torches.',
                    'Flight rings, gray stains, a bestiary, 60 levels and 48 trophies, also in Game Center.',
                    'Free, with optional in-app purchases. No banners and no interstitial ads: only optional rewarded videos are offered. Nothing you can buy gives a level, a stat or coins; only a temporary experience bonus, also earned in play, exists.',
                    'iPhone and iPad, in landscape, with graphics quality adjusting automatically to the device. The game plays offline. No account: the save stays on the device and in your iCloud.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les villes, les monstres, les quêtes, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Aucun compte : la sauvegarde reste sur l’appareil et dans votre iCloud. Le réseau ne sert que pour la publicité, les achats (App Store), Game Center et iCloud.', en: 'No external data: the islands, towns, monsters, quests, music and texts are built into the game, which plays offline. No account: the save stays on the device and in your iCloud. The network is only used for advertising, purchases (App Store), Game Center and iCloud.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos récompensées facultatives seulement : un coffre bonus de donjon (3 par jour), un butin doublé (2 par jour) et des sachets du jour ; aucune bannière ni publicité intercalée) et par des achats intégrés facultatifs : Pack de départ, « Sans vidéos » (saute le visionnage, mêmes récompenses et mêmes limites), Garde-robe Arc-en-ciel (cinq apparences) et gouttes de Prisme en quatre paliers (apparences, places de sac, coffret de matériaux limité à deux par semaine). Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Rien de ce qui s’achète ne donne de niveau, de statistique ni de pièces ; seul un bonus temporaire d’expérience, aussi gagné en jeu, existe.', en: 'Free game, funded by Google AdMob ads (optional rewarded videos only: a bonus dungeon chest (3 a day), a doubled loot (2 a day) and daily pouches; no banners and no interstitial ads) and by optional in-app purchases: Starter Pack, “No videos” (skips the watching, same rewards and same limits), Rainbow Wardrobe (five looks) and Prism drops in four tiers (looks, bag slots, a materials chest limited to two per week). Offline, optional videos are disabled and give no reward. Nothing you can buy gives a level, a stat or coins; only a temporary experience bonus, also earned in play, exists.' },
            promo: {
                fr: 'Le Baron Grisaille a délavé le ciel. Gloup vole d’île en île pour rendre ses couleurs au monde.',
                en: 'Baron Grisaille has washed out the sky. Gloup flies from island to island to bring the world’s colors back.'
            },
            stats: {
                fr: [['8', 'îles'], ['24', 'régions'], ['60', 'niveaux'], ['48', 'trophées']],
                en: [['8', 'islands'], ['24', 'regions'], ['60', 'levels'], ['48', 'trophies']]
            },
            storeShots: {
                fr: ['Rends ses couleurs au ciel !', 'Des combats en temps réel !', 'Vole entre les îles !', 'Équipe-toi en légende !', 'Forge ton équipement !', 'Quêtes et donjons !', 'Jusqu’au niveau 60 !', 'Des villes pleines de vie !'],
                en: ['Bring color back to the sky!', 'Real-time combat!', 'Fly between islands!', 'Gear up like a legend!', 'Forge your gear!', 'Quests and dungeons!', 'Level up to 60!', 'Towns full of life!']
            }
        }
    };
    var IOS_ORDER = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance', 'dvffrance', 'telora', 'telzo', 'ambiro', 'netta', 'foyo'];
    var FRANCE_ORDER = IOS_ORDER.slice(0, 5);
    var SALON_ORDER = IOS_ORDER.slice(5, 8);
    var PHOTO_ORDER = IOS_ORDER.slice(8, 9);
    var FOYER_ORDER = IOS_ORDER.slice(9);
    /* Les jeux forment leur propre gamme : ni données publiques, ni utilitaire. */
    var GAME_ORDER = ['trouchromatique', 'mongloup', 'chromafight', 'chromatraque', 'chromaferme', 'chromaciel'];

    var MAC_ORDER = ['mactuner', 'dnstuner'];
    /* ---------------------------------------------------------------------
       Réglages propres à la vitrine
       --------------------------------------------------------------------- */

    /* Textes propres à la vitrine. */
    var V = {
        heroKicker: { fr: 'Développeur indépendant · France', en: 'Independent developer · France' },
        seeGames: { fr: 'Voir les jeux', en: 'See the games' },
        seeApps: { fr: 'Les applications', en: 'The apps' },
        allApps: { fr: 'Toutes les applications', en: 'All the apps' },
        onIPhone: { fr: 'iPhone et iPad · iOS 18 ou plus', en: 'iPhone and iPad · iOS 18 or later' },
        onMac: { fr: 'macOS · Apple Silicon', en: 'macOS · Apple Silicon' },
        soonBadge: { fr: 'Bientôt disponible', en: 'Coming soon' },
        openSource: { fr: 'Voir le code', en: 'View the code' },
        webVersion: { fr: 'Version web', en: 'Web version' },
        contactTitle: { fr: 'Une question ?', en: 'A question?' },
        contactLead: {
            fr: 'Développeur indépendant, je réponds moi-même à chaque message, en général sous 24 à 48 heures.',
            en: 'As an independent developer I answer every message myself, usually within 24 to 48 hours.'
        },
        contactWrite: { fr: 'Écrire un message', en: 'Write a message' },
        contactPerApp: { fr: 'Assistance par application', en: 'Per-app support' },
        contactPerAppLead: {
            fr: 'Chaque application a sa page d’assistance : questions fréquentes, limites connues et marche à suivre.',
            en: 'Each app has its own support page: frequently asked questions, known limits and what to do next.'
        },
        aboutTitle: { fr: 'Rodolphe Vandaele', en: 'Rodolphe Vandaele' },
        featuresTitle: { fr: 'Ce que fait l’application', en: 'What the app does' },
        featuresTitleGame: { fr: 'Ce que propose le jeu', en: 'What the game offers' },
        shotsTitle: { fr: 'À quoi elle ressemble', en: 'What it looks like' },
        methodTitle: { fr: 'Sources et modèle', en: 'Sources and model' },

        /* Trois faits par gamme, affichés sous le titre de chaque application.
           Ce sont les mêmes pour toutes celles d'une gamme : ce qui les distingue
           est déjà dit par la description et la liste de fonctions. */
        chipsIOS: {
            fr: ['Gratuit', 'Sans compte', 'Données publiques'],
            en: ['Free', 'No account', 'Public data']
        },
        chipsMac: {
            fr: ['Gratuit', 'Open source', 'Sans démon installé'],
            en: ['Free', 'Open source', 'No daemon installed']
        },
        chipsGame: {
            fr: ['Gratuit', 'Sans achat intégré', 'Hors connexion'],
            en: ['Free', 'No in-app purchase', 'Plays offline']
        },
        navGames: { fr: 'Jeux', en: 'Games' },
        navFrance: { fr: 'Apps France', en: 'French apps' },
        navSalon: { fr: 'Salon', en: 'Living room' },
        navPhoto: { fr: 'Photo', en: 'Photo' },
        navFoyer: { fr: 'Foyer', en: 'Household' },
        chaptersLabel: { fr: 'Les familles d’applications', en: 'App families' },
        gamesLead: {
            fr: 'Aventure, compagnon virtuel, combat, déduction, ferme et RPG : des jeux avec la petite créature aux grands yeux. Gratuits, et jouables hors connexion.',
            en: 'Adventure, virtual pet, battle, deduction, farming and RPG: games starring the little creature with big eyes. Free, and playable offline.'
        },
        reelTitle: { fr: 'Chaque jeu, son univers.', en: 'Every game, its own world.' },
        reelLabel: { fr: 'Un écran de chaque jeu', en: 'One screen from each game' },
        franceLead: {
            fr: 'Carburants, bornes de recharge, toilettes, défibrillateurs et prix de l’immobilier : les données publiques françaises, sur la carte et hors connexion. Sans compte.',
            en: 'Fuel, EV chargers, toilets, defibrillators and property prices: French public data, on the map and offline. No account.'
        },
        salonEyebrow: { fr: 'iPhone, iPad et Apple TV', en: 'iPhone, iPad and Apple TV' },
        salonTitle: { fr: 'Pour le salon.', en: 'For the living room.' },
        salonLead: {
            fr: 'Telora lit vos films, séries et chaînes depuis vos propres sources, jusque sur l’Apple TV. Telzo fait de l’iPhone une télécommande universelle par Wi-Fi. Ambiro fait de l’Apple TV un écran ambiant : horloge, météo, musique et fonds animés.',
            en: 'Telora plays your movies, shows and channels from your own sources, all the way to Apple TV. Telzo turns the iPhone into a universal Wi-Fi remote. Ambiro turns the Apple TV into an ambient display: clock, weather, music and animated backgrounds.'
        },
        photoEyebrow: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
        photoTitle: { fr: 'Pour vos photos.', en: 'For your photos.' },
        photoLead: {
            fr: 'Netta trie et nettoie la photothèque de l’iPhone et de l’iPad : doublons, photos floues, captures d’écran et vidéos lourdes, et « Ce jour-là », les photos du même jour les années passées. Tout se fait sur l’appareil.',
            en: 'Netta sorts and cleans the iPhone and iPad photo library: duplicates, blurry photos, screenshots and heavy videos, and “On This Day”, the photos from the same day in past years. Everything happens on the device.'
        },
        foyerEyebrow: { fr: 'iPhone, iPad et iPhone Duo', en: 'iPhone, iPad and iPhone Duo' },
        foyerTitle: { fr: 'Pour la famille.', en: 'For the family.' },
        foyerLead: {
            fr: 'Foyo répertorie les abonnements et prélèvements récurrents de la famille : total par mois et par an, échéances à venir, rappels avant chaque prélèvement et avant la fin d’un essai gratuit. Un foyer partagé par iCloud, sans compte ni connexion à une banque.',
            en: 'Foyo lists the family’s recurring subscriptions and direct debits: total per month and per year, upcoming due dates, reminders before every charge and before a free trial ends. A household shared through iCloud, with no account and no bank connection.'
        },
        onGame: { fr: 'Jeu · iPhone et iPad', en: 'Game · iPhone and iPad' },
        /* Textes sans nombre d'apps : ils restent justes quand une app ou un jeu s'ajoute. */
        heroTitleHTML: {
            fr: 'Des jeux, des apps, <br><span class="grad">un seul principe.</span>',
            en: 'Games and apps, <br><span class="grad">one principle.</span>'
        },
        heroShort: {
            fr: 'Des jeux pour iPhone et iPad avec Gloup, la petite créature aux grands yeux. Des applications du quotidien, sans compte, gratuites sauf Telora. Et des utilitaires libres pour Mac.',
            en: 'Games for iPhone and iPad starring Gloup, the little creature with big eyes. Everyday apps with no account, free except Telora. Plus free utilities for Mac.'
        },
        soonStore: { fr: 'Bientôt sur l’App Store', en: 'Coming soon to the App Store' },
        menuApps: { fr: 'Applications', en: 'Apps' },
        menuOpen: { fr: 'Ouvrir le menu', en: 'Open the menu' },
        contactFinalTitle: { fr: 'Une question, une idée ?', en: 'A question, an idea?' },

        badgeAlt: { fr: 'Télécharger {app} dans l’App Store', en: 'Download {app} on the App Store' },
        newEyebrow: { fr: 'Jeux · iPhone et iPad', en: 'Games · iPhone and iPad' },
        newTitle: { fr: 'Les jeux avec Gloup.', en: 'Games starring Gloup.' },
        get: { fr: 'Obtenir', en: 'Get' },
        getAria: { fr: 'Obtenir {app} sur l’App Store', en: 'Get {app} on the App Store' },
        subOverview: { fr: 'Aperçu', en: 'Overview' },
        subFeatures: { fr: 'Fonctionnalités', en: 'Features' },
        subShots: { fr: 'Captures', en: 'Screenshots' },
        subData: { fr: 'Données', en: 'Data' },
        storeShotsTitle: { fr: 'Les huit écrans de la fiche App Store.', en: 'The eight App Store screens.' },
        deviceLabel: { fr: 'Choisir l’appareil', en: 'Choose the device' },
        statsEyebrow: { fr: 'En chiffres', en: 'By the numbers' },
        faqEyebrow: { fr: 'Questions fréquentes', en: 'Frequently asked questions' },
        faqTitle: { fr: 'Tout ce qu’il faut savoir.', en: 'Everything you need to know.' },
        /* Chaque réponse reprend un fait déjà écrit ailleurs sur le site : rien
           n'est affirmé ici qui ne soit dit sur la page d'une application. */
        faq: {
            fr: [
                ['Les applications sont-elles gratuites ?', 'Presque toutes : Telora s’utilise avec l’abonnement Telora+, après 7 jours d’essai. Les autres applications iPhone et les jeux se téléchargent gratuitement et sont financés par une publicité discrète ; ChromaFight, ChromaTraque, ChromaFerme et ChromaCiel proposent aussi des achats intégrés facultatifs. CarbuFrance, IRVEFrance, ToiletteFrance, DefibFrance et Telzo proposent un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) qui retire toute publicité, Netta le propose à 4,99 € par an, et Foyo propose Foyo Plus (0,99 € par mois ou 6,99 € par an, 7 jours d’essai) : sans publicité, avec la synchronisation iCloud et la création du foyer. Ambiro est sans publicité : l’horloge et les fonds de base sont gratuits, et Ambiro Pro (0,99 € par mois ou 5,99 € par an, 7 jours d’essai) ajoute la météo, la musique, la carte Maison et tous les fonds. Dans les apps avec publicité, une vidéo facultative offre aussi 6 h sans publicité. Les deux utilitaires Mac sont libres et open source, sans publicité ni achat.'],
                ['Faut-il créer un compte ?', 'Non. Aucune application ne demande de compte ni d’inscription. Favoris et réglages restent sur votre appareil ; seules la publicité (avec votre accord), les achats et iCloud ou Game Center utilisent le réseau.'],
                ['Fonctionnent-elles sans connexion ?', 'Les applications de données publiques les mettent en cache pour rester utilisables hors connexion ; Telora lit vos propres sources et a donc besoin du réseau. Les jeux se jouent hors connexion ; seuls la publicité, iCloud, Game Center et, pour ChromaFight, ChromaTraque, ChromaFerme et ChromaCiel, les achats utilisent le réseau.'],
                ['Sur quels appareils ?', 'iPhone et iPad sous iOS 18 ou plus pour les applications et les jeux, iPhone Duo compris, ouvert comme fermé. ToiletteFrance aussi sur Apple Watch (watchOS 11 ou plus), Telora aussi sur Apple TV (tvOS 18 ou plus), Ambiro sur Apple TV seulement (tvOS 18 ou plus). Mac Apple Silicon sous macOS 26 ou 27 pour MacTuner et DNSTuner.'],
                ['Où trouver de l’aide ?', 'Chaque application a sa page d’assistance. Je réponds moi-même à chaque message, en général sous 24 à 48 heures.']
            ],
            en: [
                ['Are the apps free?', 'Almost all of them: Telora is used with the Telora+ subscription, after a 7-day trial. The other iPhone apps and the games are free to download and funded by discreet advertising; ChromaFight, ChromaTraque, ChromaFerme and ChromaCiel also offer optional in-app purchases. CarbuFrance, IRVEFrance, ToiletteFrance, DefibFrance and Telzo offer an optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) that removes every ad, Netta offers it at €4.99 per year, and Foyo offers Foyo Plus (€0.99 per month or €6.99 per year, 7-day trial): no ads, with iCloud sync and creating the household. Ambiro has no ads: the clock and the basic backgrounds are free, and Ambiro Pro (€0.99 per month or €5.99 per year, 7-day trial) adds the weather, music, the Home card and every background. In the apps with ads, an optional video also gives 6 hours ad-free. The two Mac utilities are free and open source, with no ads and no purchases.'],
                ['Do I need an account?', 'No. None of the apps asks for an account or a sign-up. Favorites and settings stay on your device; only advertising (with your consent), purchases, and iCloud or Game Center use the network.'],
                ['Do they work offline?', 'The public data apps cache it so they keep working offline; Telora plays your own sources and therefore needs the network. The games play offline; only advertising, iCloud, Game Center and, for ChromaFight, ChromaTraque, ChromaFerme and ChromaCiel, purchases use the network.'],
                ['Which devices?', 'iPhone and iPad on iOS 18 or later for the apps and games, iPhone Duo included, open or closed. ToiletteFrance on Apple Watch too (watchOS 11 or later), Telora on Apple TV too (tvOS 18 or later), Ambiro on Apple TV only (tvOS 18 or later). Apple Silicon Macs on macOS 26 or 27 for MacTuner and DNSTuner.'],
                ['Where can I get help?', 'Each app has its own support page. I answer every message myself, usually within 24 to 48 hours.']
            ]
        }
    };

    var MAC_PANNEAU = {
        mactuner: {
            fr: [['Tableau de bord', 'CPU, mémoire, disque, réseau'],
                 ['Réglages système', '34 bascules réversibles'],
                 ['Nettoyage', '34 catégories'],
                 ['Ventilation', 'bornée au min/max constructeur']],
            en: [['Dashboard', 'CPU, memory, disk, network'],
                 ['System tweaks', '34 reversible switches'],
                 ['Cleanup', '34 categories'],
                 ['Fans', 'capped to maker min/max']]
        },
        dnstuner: {
            fr: [['Résolveurs', '46 fournisseurs publics'],
                 ['Chiffrement', 'DoH et DoT par profil'],
                 ['Note de blocage', '40 domaines témoins'],
                 ['Diagnostic', '10 tests de la configuration']],
            en: [['Resolvers', '46 public providers'],
                 ['Encryption', 'DoH and DoT by profile'],
                 ['Blocking score', '40 canary domains'],
                 ['Diagnostic', '10 configuration tests']]
        }
    };


    /* ---------------------------------------------------------------------
       Fragments partagés
       --------------------------------------------------------------------- */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        }).replace(/ ([?!:;»%€])/g, ' $1').replace(/« /g, '« ');
    }

    function svg(corps, classe) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"' +
            ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
            (classe ? ' class="' + classe + '"' : '') + '>' + corps + '</svg>';
    }

    var CHEVRON = svg('<path d="m9 5 7 7-7 7"/>');
    var GLOBE = svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.2-3.3-8.5s1.1-6.1 3.3-8.5Z"/>', 'btn-glyph');
    var CHECK = svg('<path d="m5 12.5 4.2 4.2L19 7"/>', 'check');
    var LOUPE = svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>', 'loupe');

    /* Les pictogrammes nommés par les contenus : [icône, titre, texte]. */
    var ICONES = {
        shield: '<path d="M12 3 19 6v5.2c0 4.5-3 8.2-7 9.8-4-1.6-7-5.3-7-9.8V6l7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
        map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>',
        heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
        gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.8 12h2.6M18.6 12h2.6M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
        book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
        phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.8"/><path d="M10.5 18.5h3"/>',
        laptop: '<rect x="4.5" y="5" width="15" height="10.5" rx="1.6"/><path d="M2.5 19h19"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
        star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>'
    };

    function icone(nom) {
        return '<span class="card-icon">' + svg(ICONES[nom] || ICONES.star) + '</span>';
    }

    function icones(cles, taille, classe) {
        return cles.map(function (k) {
            return picture('./assets/img/' + k + '.png', ' width="' + taille + '" height="' + taille + '" alt="" decoding="async"' +
                (classe ? ' class="' + classe + '"' : ''));
        }).join('');
    }

    function plateforme(app) {
        return pick(app.on || (app.platform === 'mac' ? V.onMac : (app.game ? V.onGame : V.onIPhone)));
    }

    function pastilleBientot(texte, petit) {
        return '<span class="btn btn-quiet' + (petit ? ' is-small' : '') + '" aria-disabled="true">' + esc(texte) + '</span>';
    }

    /* Le site de l'application, à côté du badge de l'App Store : la même donnée sans rien installer. */
    function boutonWeb(cle) {
        var url = SITES_WEB[cle];
        if (!url) { return ''; }
        return '<a class="btn btn-secondary" href="' + url + '" target="_blank" rel="noopener">' + GLOBE + esc(pick(V.webVersion)) + '</a>';
    }

    /* Le badge officiel d'Apple (Marketing Resources), jamais redessiné : noir sur fond clair, blanc sur fond sombre,
       dans la langue de la page. Hauteur 48 pixels, 40 dans le pied, minimum fixé par ses règles d'usage. */
    var BADGE = { fr: ['app-store-fr', 152, 127], en: ['app-store-en', 144, 120] };

    function badgeAppStore(url, texte, petit, sombre) {
        var b = BADGE[lang] || BADGE.fr;
        var img = '<img src="./assets/img/' + b[0] + (sombre ? '-white' : '') + '.svg" width="' + (petit ? b[2] : b[1]) +
            '" height="' + (petit ? 40 : 48) + '" decoding="async" alt="' + esc(texte) + '">';
        return '<a class="store-badge' + (petit ? ' is-small' : '') + '" href="' + url + '" target="_blank" rel="noopener">' +
            (sombre ? img : '<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/img/' + b[0] + '-white.svg">' + img + '</picture>') + '</a>';
    }

    /* `cache` complète le libellé pour les lecteurs d'écran : seize « En savoir plus » identiques ne disent pas où ils mènent. */
    function lienPlus(href, texte, cache) {
        return '<a class="link-more" href="' + href + '">' + esc(texte) +
            (cache ? '<span class="sr-only"> ' + esc(cache) + '</span>' : '') + CHEVRON + '</a>';
    }

    /* Fenêtre des utilitaires Mac : sans capture d'écran, elle montre ce que l'application affiche à l'ouverture. */
    function fenetreMac(cle, k) {
        var app = APPS[cle];
        var lignes = pick(MAC_PANNEAU[cle]).map(function (l) {
            return '<div class="macwin-row"><span>' + esc(l[0]) + '</span><b>' + esc(l[1]) + '</b></div>';
        }).join('');
        return '<div class="macwin" style="--k:' + (k || 0) + '"><div class="macwin-bar" aria-hidden="true">' +
            '<i></i><i></i><i></i><span class="macwin-title">' + esc(app.name) + '</span></div>' +
            '<div class="macwin-body"><div class="macwin-head">' + icones([cle], 56) +
            '<div><b>' + esc(app.name) + '</b><span>' + esc(pick(app.tag)) + '</span></div></div>' +
            '<div class="macwin-rows">' + lignes + '</div></div></div>';
    }

    function carte(contenu, classe) {
        return '<article class="card' + (classe ? ' ' + classe : '') + '">' + contenu + '</article>';
    }

    /* Un appareil dessiné en volume autour d'un écran réel (site.css) : tranches, dos, touches, face avant.
       `format` : clé de FORMATS ; `k` décale le flottement et l'entrée. TOUCHES : [tranche, position, longueur] en %
       de ce côté, comme sur l'appareil réel tourné dans ce sens. L'Apple TV : téléviseur à bord fin, boîtier et télécommande Siri posés à droite. */
    var CLASSES_APPAREIL = { iphone: 'is-iphone', paysage: 'is-iphone is-land', ipad: 'is-ipad', ipadl: 'is-ipad is-land', duoi: 'is-duo', watch: 'is-watch', tv: 'is-tv' };
    var TAILLES_APPAREIL = { iphone: '220px', paysage: '720px', ipad: '460px', ipadl: '640px', duo: '220px', duoi: '300px', watch: '124px', tv: '600px' };
    var PLI = svg('<path d="M12 4v16"/><path d="M8.5 8.5 5 12l3.5 3.5M15.5 8.5 19 12l-3.5 3.5"/>');
    var TOUCHES = {
        iphone: [['l', 17, 5], ['l', 24, 8], ['l', 34, 8], ['r', 27, 13], ['r', 58, 9]],
        paysage: [['b', 17, 5], ['b', 24, 8], ['b', 34, 8], ['t', 27, 13], ['t', 58, 9]],
        ipad: [['t', 78, 9], ['r', 9, 7], ['r', 18, 7]],
        ipadl: [['l', 13, 9], ['t', 9, 7], ['t', 18, 7]],
        duoi: [['l', 15, 7], ['l', 24, 7], ['r', 20, 10]],
        watch: [['r', 56, 20]]
    };

    /* Le Duo se plie et se déplie au toucher (attacheDuo) : écran intérieur ouvert, écran extérieur fermé. */
    function appareil(cle, format, n, alt, k, charge) {
        var nu = APPS[cle].game && format === 'iphone' ? ' is-plain' : '';
        var duo = format === 'duoi';
        var fr = lang === 'fr';
        var ecran = capture(cle, format, n, alt, TAILLES_APPAREIL[format], charge) +
            (duo ? '<span class="dev-ext">' + capture(cle, 'duo', n, alt + (fr ? ', fermé' : ', closed'), TAILLES_APPAREIL.duo, false) + '</span>' : '');
        var ouvre = '<div class="dev ' + CLASSES_APPAREIL[format] + nu + (duo ? ' is-closed' : '') + '" style="--k:' + k + '"' +
            (duo ? ' role="button" tabindex="0" aria-pressed="true" aria-label="' + esc(fr ? 'Déplier l’iPhone Duo' : 'Unfold the iPhone Duo') + '">' +
                '<span class="dev-hint" aria-hidden="true">' + PLI + '<span class="is-o">' + (fr ? 'Plier' : 'Fold') + '</span><span class="is-f">' + (fr ? 'Déplier' : 'Unfold') + '</span></span>' : '>');
        if (format === 'tv') {
            return ouvre + '<div class="dev-screen">' + ecran + '</div><i class="tv-box"></i>' +
                '<i class="tv-remote"><i class="tv-pad"></i><i class="tv-k"></i><i class="tv-k"></i><i class="tv-k"></i><i class="tv-k"></i><i class="tv-vol"></i></i></div>';
        }
        var tranches = [1, 2, 3, 4, 5].map(function (l) { return '<i class="dev-slice" style="--l:' + l + '"></i>'; }).join('');
        var touches = TOUCHES[format].map(function (t) { return '<i class="dev-key is-' + t[0] + '" style="--p:' + t[1] + '%;--s:' + t[2] + '%"></i>'; }).join('');
        var montre = format === 'watch' ? '<i class="dev-crown"></i>' : '';
        return ouvre + '<div class="dev-body">' + montre + tranches + '<div class="dev-back"><i class="dev-cam"></i></div>' + touches +
            '<div class="dev-front"><div class="dev-screen">' + ecran + '<i class="dev-glare"></i></div></div></div></div>';
    }

    var NOMS_APPAREILS = { iphone: 'iPhone', ipad: 'iPad', duo: 'iPhone Duo', watch: 'Apple Watch', tv: 'Apple TV' };

    /* Les appareils d'un produit, dans l'ordre de la scène : iPad derrière, iPhone devant, Duo, montre, téléviseur. */
    function scene(cle, charge) {
        var app = APPS[cle];
        if (app.platform === 'mac') { return fenetreMac(cle, 0); }
        var nom = app.name + ', ';
        if (app.game) {
            /* `ecran` : écran brut du jeu, sans le titre des visuels App Store (Marque/CapturesSite.mjs). */
            var n = app.ecran ? 'ecran' : 1;
            return appareil(cle, app.paysage ? 'paysage' : 'iphone', n, nom + 'iPhone', 0, charge) +
                appareil(cle, 'ipadl', n, nom + 'iPad', 1, charge);
        }
        if (app.tvSeul) { return appareil(cle, 'tv', 'ecran', nom + 'Apple TV', 0, charge); }
        var s = app.shots || {};
        return appareil(cle, 'ipad', 'ecran', nom + 'iPad', 1, charge) +
            appareil(cle, 'iphone', 'ecran', nom + 'iPhone', 0, charge) +
            (s.duo ? appareil(cle, 'duoi', 'ecran', nom + 'iPhone Duo', 2, false) : '') +
            (s.watch ? appareil(cle, 'watch', 'ecran', nom + 'Apple Watch', 3, false) : '') +
            (s.tv ? appareil(cle, 'tv', 'ecran', nom + 'Apple TV', 4, false) : '');
    }

    function etage(classe, contenu, accent) {
        return '<div class="stage ' + classe + '"' + (accent || '') + '><div class="stage-glow" aria-hidden="true"></div>' +
            '<div class="stage-rig">' + contenu + '</div></div>';
    }

    /* ---------------------------------------------------------------------
       Barre de navigation et menu
       --------------------------------------------------------------------- */

    var FAMILLES = [
        ['jeux', V.navGames, GAME_ORDER],
        ['france', V.navFrance, FRANCE_ORDER],
        ['salon', V.navSalon, SALON_ORDER],
        ['photo', V.navPhoto, PHOTO_ORDER],
        ['foyer', V.navFoyer, FOYER_ORDER],
        ['mac', T.navMac, MAC_ORDER]
    ];
    var TOUTES = GAME_ORDER.concat(IOS_ORDER, MAC_ORDER);

    /* Pictogrammes du dock : accueil, familles, pages du site, toutes les apps. */
    var PICTOS_DOCK = {
        home: '<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19v-7.8Z"/>',
        jeux: '<path d="M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-1 3.4a2.3 2.3 0 0 1-3.9.9L14 16h-4l-1.9 2.1a2.3 2.3 0 0 1-3.9-.9l-1-3.4A4.5 4.5 0 0 1 7.5 8Z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="11.5" r=".6"/><circle cx="17.2" cy="13.6" r=".6"/>',
        france: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
        salon: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 17v3.5"/>',
        photo: '<rect x="3.5" y="5.5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.6"/><path d="m4 17.5 4.6-4.4 3.4 3.1 2.7-2.4 5.3 4.6"/>',
        foyer: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.3c2.6-.2 4.5 1.4 5 4.2"/>',
        mac: '<rect x="4.5" y="5" width="15" height="10.5" rx="1.6"/><path d="M2.5 19h19"/>',
        about: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
        contact: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
        apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>'
    };

    /* En haut, la marque et la langue posées sur le premier écran ; la navigation vit dans un dock de verre flottant
       en bas de l'écran, à portée du pouce. Libellés visibles sur grand écran, repliés en descendant. */
    function navHTML(page) {
        var entrees = [['./index.html', lang === 'fr' ? 'Accueil' : 'Home', 'home', page === 'v2-home', true]].concat(
            FAMILLES.map(function (f) { return ['./index.html#' + f[0], pick(f[1]), f[0], false, false]; }),
            [['./about.html', pick(T.navAbout), 'about', page === 'v2-about', false],
                ['./contact.html', pick(T.navContact), 'contact', page === 'v2-contact', false]]);
        var menu = entrees.slice(1).map(function (e, i) {
            return '<a href="' + withLang(e[0]) + '" style="--i:' + i + '">' + esc(e[1]) + '</a>';
        }).join('') +
            '<small>' + esc(pick(V.menuApps)) + '</small>' +
            '<div class="nav-menu-apps">' + TOUTES.map(function (k, i) {
                return '<a class="nav-menu-app" href="' + withLang('./' + k + '.html') + '" style="--i:' + (i + entrees.length) + '">' +
                    icones([k], 28) + esc(APPS[k].name) + '</a>';
            }).join('') + '</div>';

        function lien(e) {
            return '<a class="dock-item' + (e[2] === 'about' || e[2] === 'contact' ? ' is-page' : '') + '" href="' + withLang(e[0]) + '"' +
                (e[2] !== 'home' && e[0].indexOf('#') !== -1 ? ' data-spy="' + e[2] + '"' : '') +
                (e[3] ? ' aria-current="page"' : '') + (e[4] ? ' aria-label="' + esc(e[1]) + '"' : '') + ' data-nom="' + esc(e[1]) + '">' +
                svg(PICTOS_DOCK[e[2]]) + (e[4] ? '' : '<span class="dock-label">' + esc(e[1]) + '</span>') + '</a>';
        }

        return '<a class="skip-link" href="#main">' + esc(pick(T.skipLink)) + '</a>' +
            '<header class="topbar is-dark-zone" id="nav">' +
            '<a class="nav-brand" href="' + withLang('./index.html') + '">' +
            '<img src="./assets/img/favicon.svg" width="28" height="28" alt="" decoding="async">' +
            '<span>Rodolphe Vandaele</span></a>' +
            '<span class="lang-switch">' +
            '<a href="?lang=fr" data-lang="fr" lang="fr" aria-current="' + (lang === 'fr') + '">FR</a>' +
            '<a href="?lang=en" data-lang="en" lang="en" aria-current="' + (lang === 'en') + '">EN</a>' +
            '</span></header>' +
            '<nav class="dock" aria-label="Navigation"><div class="dock-inner">' +
            entrees.slice(0, FAMILLES.length + 1).map(lien).join('') + '<i class="dock-sep" aria-hidden="true"></i>' +
            entrees.slice(FAMILLES.length + 1).map(lien).join('') + '<i class="dock-sep is-page" aria-hidden="true"></i>' +
            '<button class="dock-item nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"' +
            ' aria-label="' + esc(pick(V.menuOpen)) + '" data-nom="' + esc(pick(V.menuApps)) + '">' + svg(PICTOS_DOCK.apps) + '</button>' +
            '<span class="nav-progress" aria-hidden="true"></span></div></nav>' +
            '<nav class="nav-menu" id="nav-menu" aria-label="Menu" inert>' + menu + '</nav>';
    }

    /* ---------------------------------------------------------------------
       Pied de page
       --------------------------------------------------------------------- */

    function footerHTML() {
        function colonne(titre, liens) {
            return '<nav aria-label="' + esc(titre) + '"><h2>' + esc(titre) + '</h2>' + liens.join('') + '</nav>';
        }
        function apps(cles) {
            return cles.map(function (k) { return '<a href="' + withLang('./' + k + '.html') + '">' + esc(APPS[k].name) + '</a>'; });
        }
        var partenaires = PARTENAIRES.map(function (p) {
            return '<a class="partner" href="' + p.url + '" target="_blank" rel="noopener">' +
                '<img src="' + p.img + '" width="36" height="36" alt="" loading="lazy" decoding="async">' +
                '<span><b>' + esc(p.nom) + '</b><small>' + esc(p.site) + '</small></span></a>';
        }).join('');

        return '<footer class="footer"><div class="wrap">' +
            '<p class="footer-line">' + esc(pick(T.footerLine)) + '</p>' +
            '<div class="footer-grid">' +
            FAMILLES.map(function (f) { return colonne(pick(f[1]), apps(f[2])); }).join('') +
            colonne(pick(T.footerSite), [
                '<a href="' + withLang('./about.html') + '">' + esc(pick(T.navAbout)) + '</a>',
                '<a href="' + withLang('./contact.html') + '">' + esc(pick(T.navContact)) + '</a>',
                '<a href="' + withLang('./about.html') + '#mentions">' + esc(pick(T.legalTitleSite)) + '</a>',
                '<a href="' + LIBERAPAY + '" target="_blank" rel="noopener">Liberapay</a>',
                '<a href="mailto:' + MAIL + '">' + esc(pick(V.contactWrite)) + '</a>'
            ]) +
            '</div>' +
            '<div class="footer-band">' + badgeAppStore(STORE_DEV, pick(T.footerStore), true) +
            (partenaires ? '<div class="footer-side"><span>' + esc(pick(T.footerPartners)) + '</span>' + partenaires + '</div>' : '') +
            '</div>' +
            '<div class="footer-legal"><span>© 2026 BodyCorp</span><span>' + esc(pick(T.footerTagline)) + '</span></div>' +
            '</div></footer>';
    }

    /* ---------------------------------------------------------------------
       Fragments du catalogue et des fiches
       --------------------------------------------------------------------- */

    var FAM_TEXTES = {
        jeux: [V.newEyebrow, V.newTitle, V.gamesLead],
        france: [V.onIPhone, T.iosTitle, V.franceLead],
        salon: [V.salonEyebrow, V.salonTitle, V.salonLead],
        photo: [V.photoEyebrow, V.photoTitle, V.photoLead],
        foyer: [V.foyerEyebrow, V.foyerTitle, V.foyerLead],
        mac: [V.onMac, T.macTitle, T.macLead]
    };

    /* Les produits qui ont des pages légales (les utilitaires Mac n'en ont pas). */
    var AVEC_LEGAL = GAME_ORDER.concat(IOS_ORDER);

    function familleDe(cle) {
        for (var i = 0; i < FAMILLES.length; i++) { if (FAMILLES[i][2].indexOf(cle) !== -1) { return FAMILLES[i]; } }
        return FAMILLES[0];
    }

    /* L'icône d'un produit porte le même nom de transition sur une seule carte de l'accueil et en tête de sa page :
       la transition entre pages la fait glisser de l'une à l'autre. */
    function vt(cle) {
        return ' style="view-transition-name:icone-' + cle + '"';
    }

    function styleAccent(app) {
        return ' style="--accent:' + app.accent + (app.accent2 ? ';--accent-2:' + app.accent2 : '') + '"';
    }

    function faitsDe(app) {
        return pick(app.chips || (app.platform === 'mac' ? V.chipsMac : (app.game ? V.chipsGame : V.chipsIOS)));
    }

    /* L'appel d'une fiche : badge App Store, pastille « Bientôt » ou lien GitHub. */
    function appel(cle, petit) {
        var app = APPS[cle];
        if (!app.store) { return pastilleBientot(pick(app.game ? V.soonStore : V.soonBadge), petit); }
        if (app.platform === 'mac') {
            return '<a class="btn btn-primary' + (petit ? ' is-small' : '') + '" href="' + app.store + '" target="_blank" rel="noopener">' +
                esc(pick(V.openSource)) + '</a>';
        }
        return badgeAppStore(app.store, pick(V.badgeAlt).replace('{app}', app.name), petit);
    }

    function lienLegal(cle, sorte) {
        return withLang('./' + cle + '-' + (sorte === 'privacy' ? 'confidentialite' : 'assistance') + '.html');
    }

    function faqHTML() {
        return '<div class="faq">' + pick(V.faq).map(function (q) {
            return '<details><summary>' + esc(q[0]) + '<span class="faq-sign" aria-hidden="true"></span></summary>' +
                '<p>' + esc(q[1]) + '</p></details>';
        }).join('') + '</div>';
    }

    function enTete(sur, titre, chapo, classe, id) {
        return '<header class="head' + (classe ? ' ' + classe : '') + '">' + (sur ? '<p class="eyebrow">' + sur + '</p>' : '') +
            '<h2' + (id ? ' id="' + id + '"' : '') + '>' + titre + '</h2>' + (chapo ? '<p class="lead">' + chapo + '</p>' : '') + '</header>';
    }

    /* Rail à défilement aimanté, avec ses flèches (le script les active selon la position). */
    function rail(classe, contenu, etiquette, attrs) {
        var fr = lang === 'fr';
        return '<div class="rail"' + (attrs || '') + '><div class="rail-track ' + classe + '" tabindex="0" role="group" aria-label="' + esc(etiquette) + '">' + contenu + '</div>' +
            '<div class="rail-nav"><button type="button" data-dir="-1" aria-label="' + (fr ? 'Précédent' : 'Previous') + '">' + CHEVRON + '</button>' +
            '<button type="button" data-dir="1" aria-label="' + (fr ? 'Suivant' : 'Next') + '">' + CHEVRON + '</button></div></div>';
    }

    function chiffres(liste, classe) {
        return '<dl class="numbers' + (classe ? ' ' + classe : '') + '">' + liste.map(function (st) {
            return '<div class="number reveal"><dt>' + esc(st[1]) + '</dt><dd data-count="' + esc(st[0]) + '">' + esc(st[0]) + '</dd></div>';
        }).join('') + '</dl>';
    }

    /* La sous-barre d'une fiche ou d'une page légale : le nom, les sections, l'appel. */
    function sousBarre(cle, sections) {
        var app = APPS[cle];
        var mac = app.platform === 'mac';
        var cta = !app.store ? '' : '<a class="subnav-cta" href="' + app.store + '" target="_blank" rel="noopener"' +
            (mac ? '>' + esc(pick(V.openSource)) : ' aria-label="' + esc(pick(V.getAria).replace('{app}', app.name)) + '">' + esc(pick(V.get))) + '</a>';
        return '<nav class="subnav" aria-label="' + esc(app.name) + '"><div class="subnav-inner">' +
            '<a class="subnav-title" href="' + withLang('./' + cle + '.html') + '">' + icones([cle], 26) + esc(app.name) + '</a>' +
            '<div class="subnav-links">' + sections.map(function (s) {
                return '<a href="' + s[0] + '"' + (s[2] ? ' aria-current="page"' : '') + '>' + esc(s[1]) + '</a>';
            }).join('') + '</div>' + cta + '</div></nav>';
    }

    /* Le fil d'Ariane : toutes les applications, la famille, puis les pages données. */
    function filAriane(cle, suite) {
        var f = familleDe(cle);
        var etapes = [[withLang('./index.html'), pick(V.allApps)], [withLang('./index.html#' + f[0]), pick(f[1])]].concat(suite);
        return '<nav class="crumbs" aria-label="' + esc(lang === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb') + '"><ol>' + etapes.map(function (e, i) {
            return '<li>' + (i ? CHEVRON : '') + (e[0] ? '<a href="' + e[0] + '">' + esc(e[1]) + '</a>' : '<span aria-current="page">' + esc(e[1]) + '</span>') + '</li>';
        }).join('') + '</ol></nav>';
    }

    /* La tête d'une fiche ou d'une page légale : fil, icône, surtitre et titre. */
    function teteProduit(cle, suite, titre, sur) {
        var app = APPS[cle];
        return filAriane(cle, suite) +
            picture('./assets/img/' + cle + '.png', ' class="p-icon app-icon" width="136" height="136" alt="" decoding="async"' + vt(cle)) +
            '<p class="eyebrow">' + esc(sur || pick(app.tag)) + '</p><h1>' + esc(titre || app.name) + '</h1>';
    }

    /* La tuile du catalogue : l'icône sur un fond de sa couleur, le nom et une ligne, toute la tuile en lien.
       `ligne` et `href` remplacent le genre et la fiche (assistance par application). */
    function tuile(cle, ligne, href) {
        var app = APPS[cle];
        var f = familleDe(cle);
        var externe = href && href.indexOf('http') === 0;
        var cherche = (app.name + ' ' + pick(app.tag) + ' ' + pick(app.promo) + ' ' + pick(f[1])).toLowerCase();
        return '<article class="tile is-' + f[0] + '" data-fam="' + f[0] + '" data-search="' + esc(cherche) + '"' + styleAccent(app) + '>' +
            '<div class="tile-art">' + icones([cle], 88) + '</div>' +
            (app.store ? '' : '<span class="tile-flag">' + esc(lang === 'fr' ? 'Bientôt' : 'Soon') + '</span>') +
            '<div class="tile-body"><h3><a class="tile-link" href="' + (href || withLang('./' + cle + '.html')) + '"' +
            (externe ? ' target="_blank" rel="noopener"' : '') + '>' + esc(app.name) + '</a></h3>' +
            '<p>' + esc(ligne || pick(app.tag)) + '</p></div></article>';
    }

    function tuiles(cles, ligne, lien) {
        return '<div class="tiles">' + cles.map(function (k) { return tuile(k, ligne && ligne(k), lien && lien(k)); }).join('') + '</div>';
    }

    /* La carte d'un produit dans la grille de son chapitre : identité, promesse et appareil. `etendue` : colonnes
       occupées sur six, sur grand écran puis sur tablette. Une carte large passe le texte à gauche (requête de conteneur). */
    function vitrine(cle, etendue) {
        var app = APPS[cle];
        var art = app.platform === 'mac' ? fenetreMac(cle, 0) : app.tvSeul ? appareil(cle, 'tv', 'ecran', app.name + ', Apple TV', 0, false) :
            appareil(cle, app.paysage ? 'paysage' : 'iphone', app.game && !app.ecran ? 1 : 'ecran', app.name + ', iPhone', 0, false);
        var style = styleAccent(app).replace('"', '"--s:' + etendue[0] + ';--st:' + etendue[1] + ';');
        return '<article class="show' + (app.paysage || app.tvSeul ? ' is-land' : '') + (app.platform === 'mac' ? ' is-mac' : '') + '"' + style + '><div class="show-in">' +
            (app.store ? '' : '<span class="show-flag">' + esc(lang === 'fr' ? 'Bientôt' : 'Soon') + '</span>') +
            '<div class="show-text"><div class="show-id">' + picture('./assets/img/' + cle + '.png', ' width="52" height="52" alt="" loading="lazy" decoding="async"' + vt(cle)) +
            '<span class="show-tag">' + esc(pick(app.tag)) + '</span></div>' +
            '<h3><a class="show-link" href="' + withLang('./' + cle + '.html') + '">' + esc(app.name) + '</a></h3>' +
            '<p>' + esc(pick(app.promo)) + '</p>' +
            '<span class="show-more" aria-hidden="true">' + esc(lang === 'fr' ? 'Découvrir' : 'Discover') + CHEVRON + '</span></div>' +
            '<div class="show-art" aria-hidden="true">' + art + '</div></div></article>';
    }

    /* Une carte de lien : pictogramme, titre, une ligne. Pages légales, version web, code, mentions. */
    function carteLien(href, icon, titre, ligne, externe) {
        return '<a class="link-card" href="' + href + '"' + (externe ? ' target="_blank" rel="noopener"' : '') + '>' +
            icone(icon) + '<span><b>' + esc(titre) + '</b><small>' + esc(ligne) + '</small></span>' + CHEVRON + '</a>';
    }

    /* Les cartes « Aide et informations » d'une fiche, ou du pied d'une page légale (`sauf` : la page courante). */
    function cartesLiens(cle, sauf, avecLangue) {
        var app = APPS[cle];
        var fr = lang === 'fr';
        var l = avecLangue || function (h) { return h; };
        var c = [];
        if (sauf) { c.push(carteLien(withLang('./' + cle + '.html'), app.platform === 'mac' ? 'laptop' : 'phone', app.name, pick(app.tag))); }
        if (AVEC_LEGAL.indexOf(cle) !== -1) {
            if (sauf !== 'support') { c.push(carteLien(l(lienLegal(cle, 'support')), 'mail', pick(T.supportLink), fr ? 'Questions fréquentes et contact' : 'Frequently asked questions and contact')); }
            if (sauf !== 'privacy') { c.push(carteLien(l(lienLegal(cle, 'privacy')), 'shield', pick(T.privacyLink), fr ? 'Données traitées et vos droits' : 'Data processed and your rights')); }
        }
        if (SITES_WEB[cle] && !sauf) { c.push(carteLien(SITES_WEB[cle], 'globe', pick(V.webVersion), SITES_WEB[cle].replace('https://', ''), true)); }
        if (app.platform === 'mac' && !sauf) { c.push(carteLien(app.store, 'book', pick(V.openSource), pick(T.macStore), true)); }
        c.push(carteLien(withLang('./about.html') + '#mentions', 'book', pick(T.legalTitleSite), fr ? 'Éditeur, hébergement, contenus' : 'Publisher, hosting, content'));
        return '<div class="link-cards">' + c.join('') + '</div>';
    }

    /* ---------------------------------------------------------------------
       Accueil
       --------------------------------------------------------------------- */

    /* Les familles en bandes alternées, sombres et claires : chacune son chapitre et sa grille bento. */
    var FONDS = { jeux: ' is-dark', france: ' is-alt', salon: ' is-dark', photo: '', foyer: ' is-alt', mac: ' is-dark' };

    /* Colonnes de chaque carte sur six, pour que chaque rangée soit pleine : un produit en paysage prend toute la
       largeur ; les autres vont par trois, les premiers par deux quand le compte ne tombe pas juste. Sur tablette
       (deux colonnes), une carte seule en tête prend la largeur. */
    function etendues(cles) {
        var portrait = cles.filter(function (k) { return !APPS[k].paysage; }).length;
        var tete = portrait === 1 ? 1 : [0, 4, 2][portrait % 3];
        var rang = 0;
        return cles.map(function (k) {
            if (APPS[k].paysage) { return [6, 6]; }
            var i = rang++;
            return [portrait === 1 ? 6 : (i < tete ? 3 : 2), (portrait % 2 && i === 0) ? 6 : 3];
        });
    }

    function chapitre(f) {
        var t = FAM_TEXTES[f[0]];
        var e = etendues(f[2]);
        return '<section class="band chapter' + FONDS[f[0]] + '" id="' + f[0] + '" aria-labelledby="' + f[0] + '-titre">' +
            '<div class="wrap">' + enTete('<i class="dot is-' + f[0] + '"></i>' + esc(pick(t[0])),
                esc(pick(f[1])) + '<span class="count">' + f[2].length + '</span>',
                '<b>' + esc(pick(t[1])) + '</b> ' + esc(pick(t[2])), 'reveal', f[0] + '-titre') + '</div>' +
            '<div class="wrap bento">' + f[2].map(function (k, i) { return vitrine(k, e[i]); }).join('') + '</div></section>';
    }

    /* Premier écran : quatre apps sur quatre appareils, ou un seul produit sur tous ses appareils (selecteur). */
    function sceneAccueil() {
        return appareil('carbufrance', 'ipad', 'ecran', 'CarbuFrance, iPad', 1, true) +
            appareil('telzo', 'iphone', 'ecran', 'Telzo, iPhone', 0, true) +
            appareil('netta', 'duoi', 'ecran', 'Netta, iPhone Duo', 2, false) +
            appareil('toilettefrance', 'watch', 'ecran', 'ToiletteFrance, Apple Watch', 3, false);
    }

    function selecteur() {
        var fr = lang === 'fr';
        var cles = TOUTES.filter(function (k) { return appareilsDe(APPS[k]).length; });
        return '<div class="hero-pick"><div class="pick-row" role="group" aria-label="' + esc(fr ? 'Montrer un produit sur les appareils' : 'Show one product on the devices') + '">' +
            '<button type="button" class="pick-item is-mix" data-pick="" aria-pressed="true" aria-label="' + esc(fr ? 'Sélection' : 'Selection') + '">' + svg(PICTOS_DOCK.apps) + '</button>' +
            cles.map(function (k) {
                return '<button type="button" class="pick-item" data-pick="' + k + '" aria-pressed="false" aria-label="' + esc(APPS[k].name) + '">' + icones([k], 40) + '</button>';
            }).join('') + '</div>' +
            '<p class="pick-name" aria-live="polite">' + esc(fr ? 'Touchez une icône : elle s’affiche sur chaque appareil.' : 'Tap an icon to see it on every device.') + '</p></div>';
    }

    function renderHome() {
        var fr = lang === 'fr';
        var hero = '<section class="hero is-dark-zone" id="main"><div class="hero-sky" aria-hidden="true"></div><div class="wrap">' +
            '<p class="eyebrow">' + esc(pick(V.heroKicker)) + '</p>' +
            '<h1>' + pick(V.heroTitleHTML) + '</h1>' +
            '<p class="hero-lead">' + esc(pick(V.heroShort)) + '</p>' +
            '<div class="btn-row"><a class="btn btn-primary" href="#jeux">' + esc(pick(V.seeGames)) + '</a>' +
            '<a class="btn btn-secondary" href="#catalogue">' + esc(pick(V.allApps)) + '</a></div></div>' +
            etage('hero-stage', sceneAccueil()) + selecteur() +
            '<a class="hero-cue" href="#decouvrir" aria-label="' + (fr ? 'Découvrir la suite' : 'Discover more') + '">' + CHEVRON + '</a>' +
            '</section>';

        var n = TOUTES.length;
        var anneau = '<section class="band orbit-band" id="decouvrir" aria-labelledby="anneau-titre"><div class="wrap">' +
            enTete(esc(pick(V.heroKicker)), fr ? n + ' apps et jeux.<br><span class="grad">Une seule exigence.</span>' : n + ' apps and games.<br><span class="grad">One standard.</span>',
                esc(fr ? 'Aucun compte à créer, aucune donnée personnelle envoyée au développeur. Touchez une icône pour ouvrir sa fiche.' : 'No account to create, no personal data sent to the developer. Tap an icon to open its page.'), 'is-center reveal', 'anneau-titre') +
            '</div><div class="orbit"><ul class="orbit-ring" style="--n:' + n + '">' + TOUTES.map(function (k, i) {
                return '<li style="--i:' + i + '"><a href="' + withLang('./' + k + '.html') + '" aria-label="' + esc(APPS[k].name) + '">' + icones([k], 112) + '</a></li>';
            }).join('') + '</ul><nav class="icon-dock orbit-static wrap" aria-label="' + esc(pick(V.allApps)) + '">' + TOUTES.map(function (k) {
                return '<a href="' + withLang('./' + k + '.html') + '" aria-label="' + esc(APPS[k].name) + '">' + icones([k], 64) + '</a>';
            }).join('') + '</nav></div></section>';

        var filtres = '<div class="filters">' +
            '<div class="filter-chips" role="group" aria-label="' + esc(pick(V.chaptersLabel)) + '">' +
            '<button type="button" data-fam="tout" aria-pressed="true">' + esc(fr ? 'Tout' : 'All') + ' <span>' + n + '</span></button>' +
            FAMILLES.map(function (f) {
                return '<button type="button" class="is-' + f[0] + '" data-fam="' + f[0] + '" aria-pressed="false"><i class="dot"></i>' + esc(pick(f[1])) + ' <span>' + f[2].length + '</span></button>';
            }).join('') + '</div>' +
            '<label class="search">' + LOUPE + '<span class="sr-only">' + esc(fr ? 'Rechercher une application' : 'Search an app') + '</span>' +
            '<input id="recherche" type="search" autocomplete="off" placeholder="' + esc(fr ? 'Rechercher' : 'Search') + '"></label>' +
            '<p class="bilan" id="bilan" aria-live="polite">' + n + (fr ? ' applications' : ' apps') + '</p></div>';

        var catalogue = '<section class="band" id="catalogue" aria-labelledby="catalogue-titre"><div class="wrap">' +
            enTete(esc(fr ? 'Catalogue' : 'Catalog'), esc(pick(V.allApps)), null, 'reveal', 'catalogue-titre') + filtres +
            '<div class="tiles" id="tuiles">' + TOUTES.map(function (k) { return tuile(k); }).join('') + '</div>' +
            '<p class="empty" id="catalogue-vide" hidden>' + esc(fr ? 'Aucune application ne correspond à cette recherche.' : 'No app matches this search.') + '</p></div></section>';

        var nombres = '<section class="band is-tight is-alt"><div class="wrap">' + chiffres(fr ?
            [[String(n), 'applications et jeux'], [String(GAME_ORDER.length), 'jeux avec Gloup'], ['0', 'compte à créer'], ['6', 'appareils : iPhone, iPad, iPhone Duo, Apple Watch, Apple TV et Mac']] :
            [[String(n), 'apps and games'], [String(GAME_ORDER.length), 'games starring Gloup'], ['0', 'accounts to create'], ['6', 'devices: iPhone, iPad, iPhone Duo, Apple Watch, Apple TV and Mac']]) + '</div></section>';

        var valeurs = '<section class="band"><div class="wrap">' + enTete(esc(pick(T.valuesEyebrow)), esc(pick(T.valuesTitle)), null, 'reveal') +
            '<div class="cards">' + pick(T.values).map(function (v) {
                return carte(icone(v[0]) + '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p>', 'reveal');
            }).join('') + '</div></div></section>';

        var questions = '<section class="band is-alt" aria-labelledby="faq-titre"><div class="wrap">' +
            enTete(esc(pick(V.faqEyebrow)), esc(pick(V.faqTitle)), null, 'reveal', 'faq-titre') + faqHTML() + '</div></section>';

        return navHTML('v2-home') + '<main>' + hero + anneau + FAMILLES.map(chapitre).join('') + catalogue + nombres + valeurs + questions +
            boiteContact() + '</main>' + footerHTML();
    }

    function boiteContact() {
        return '<section class="band"><div class="wrap"><div class="cta-box reveal">' +
            '<h2>' + esc(pick(V.contactFinalTitle)) + '</h2><p>' + esc(pick(V.contactLead)) + '</p>' +
            '<div class="btn-row is-center"><a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(V.contactWrite)) + '</a>' +
            lienPlus(withLang('./about.html'), pick(T.navAbout)) + '</div></div></div></section>';
    }

    /* ---------------------------------------------------------------------
       Page produit
       --------------------------------------------------------------------- */

    /* Les légendes d'un appareil : rangs dans `storeShots`, ou textes propres ({ fr, en }). Un jeu montre sur l'iPad
       les mêmes écrans que sur l'iPhone. */
    function legendes(app, a) {
        var base = pick(app.storeShots);
        var refs = app.shots && app.shots[a];
        if (!refs) { return base; }
        return refs.map(function (r) { return typeof r === 'number' ? base[r] : pick(r); });
    }

    function appareilsDe(app) {
        if (app.platform === 'mac' || !app.storeShots) { return []; }
        if (app.game) { return ['iphone', 'ipad']; }
        if (app.tvSeul) { return ['tv']; }
        return ['iphone', 'ipad', 'duo', 'watch', 'tv'].filter(function (a) { return a === 'iphone' || (app.shots && app.shots[a]); });
    }

    function galerie(cle) {
        var app = APPS[cle];
        var appareils = appareilsDe(app);
        if (!appareils.length) { return ''; }
        var fr = lang === 'fr';
        var format = {
            iphone: [app.paysage ? 'paysage' : 'iphone', app.paysage ? '(max-width: 700px) 84vw, 640px' : '(max-width: 700px) 60vw, 290px'],
            ipad: [app.game ? 'ipadl' : 'ipad', app.game ? '(max-width: 700px) 84vw, 640px' : '(max-width: 700px) 70vw, 420px'],
            watch: ['watch', '240px'],
            tv: ['tv', '(max-width: 700px) 84vw, 640px']
        };
        function cartes(a) {
            var l = legendes(app, a);
            if (a === 'duo') {
                var faces = [['duo', fr ? 'Fermé' : 'Closed', '(max-width: 700px) 60vw, 320px'], ['duoi', fr ? 'Ouvert' : 'Open', '(max-width: 700px) 60vw, 320px']];
                return faces.map(function (face) {
                    return l.map(function (legende, i) {
                        return '<figure class="shot">' + '<div class="vis">' + capture(cle, face[0], i + 1, app.name + ', iPhone Duo ' + face[1].toLowerCase() + ', ' + legende, face[2]) + '</div>' +
                            '<figcaption><b>' + esc(face[1]) + '</b> · ' + esc(legende) + '</figcaption></figure>';
                    }).join('');
                }).join('');
            }
            return l.map(function (legende, i) {
                return '<figure class="shot' + (a === 'watch' ? ' is-watch' : '') + '"><div class="vis">' +
                    capture(cle, format[a][0], i + 1, app.name + ', ' + NOMS_APPAREILS[a] + ', ' + legende, format[a][1]) + '</div>' +
                    '<figcaption>' + esc(legende) + '</figcaption></figure>';
            }).join('');
        }
        var paysage = function (a) { return (a === 'iphone' && app.paysage) || (a === 'ipad' && app.game); };
        return '<section class="band is-alt" id="captures" aria-labelledby="captures-titre">' +
            '<div class="gallery-head"><h2 id="captures-titre" class="reveal">' + esc(pick(app.game ? V.storeShotsTitle : V.shotsTitle)) + '</h2>' +
            (appareils.length > 1 ? '<div class="segmented" role="group" aria-label="' + esc(pick(V.deviceLabel)) + '">' +
                appareils.map(function (a, i) {
                    return '<button type="button" data-device="' + a + '" aria-pressed="' + (i === 0) + '">' + NOMS_APPAREILS[a] + '</button>';
                }).join('') + '</div>' : '') + '</div>' +
            appareils.map(function (a, i) {
                return rail('shots' + (paysage(a) ? ' is-land' : ''), cartes(a), app.name + ', ' + NOMS_APPAREILS[a],
                    ' data-device="' + a + '"' + (i ? ' hidden' : '')).replace('class="rail-track shots', 'data-device="' + a + '" class="rail-track shots');
            }).join('') + '</section>';
    }

    function renderApp(cle) {
        var app = APPS[cle];
        var f = familleDe(cle);
        var fr = lang === 'fr';
        var avecGalerie = appareilsDe(app).length > 0;
        var sections = [['#main', pick(V.subOverview)]].concat(avecGalerie ? [['#captures', pick(V.subShots)]] : [])
            .concat([['#fonctions', pick(V.subFeatures)], ['#donnees', pick(V.subData)], ['#aide', fr ? 'Aide' : 'Help']]);

        var tete = '<section class="p-hero is-dark-zone" id="main"' + styleAccent(app) + '><div class="wrap p-head">' +
            teteProduit(cle, [[null, app.name]]) +
            '<p class="p-promo">' + esc(pick(app.promo)) + '</p>' +
            '<div class="btn-row">' + appel(cle) + boutonWeb(cle) + '</div>' +
            '<ul class="chips"><li>' + esc(plateforme(app)) + '</li>' + faitsDe(app).map(function (x) { return '<li>' + CHECK + esc(x) + '</li>'; }).join('') + '</ul>' +
            '</div>' + etage('p-stage', scene(cle, true)) +
            (app.stats ? '<div class="wrap p-numbers">' + chiffres(pick(app.stats)) + '</div>' : '') + '</section>';

        var fonctions = '<section class="band" id="fonctions"' + styleAccent(app) + '><div class="wrap">' +
            enTete(esc(pick(V.subFeatures)), esc(pick(app.game ? V.featuresTitleGame : V.featuresTitle)), null, 'reveal') +
            '<p class="p-desc reveal">' + esc(pick(app.desc)) + '</p>' +
            '<ul class="feat-grid">' + pick(app.features).map(function (t) { return '<li class="feat reveal"><p>' + esc(t) + '</p></li>'; }).join('') + '</ul></div></section>';

        var donnees = '<section class="band is-dark" id="donnees"' + styleAccent(app) + '><div class="wrap">' +
            enTete(esc(pick(T.dataEyebrow)), esc(pick(V.methodTitle)), null, 'reveal') +
            '<div class="cards">' + carte(icone('book') + '<h3>' + esc(pick(T.dataSources)) + '</h3><p>' + esc(pick(app.sources)) + '</p>', 'reveal') +
            carte(icone('shield') + '<h3>' + esc(pick(T.dataBusiness)) + '</h3><p>' + esc(pick(app.business)) + '</p>', 'reveal') + '</div></div></section>';

        var aide = '<section class="band is-tight" id="aide"' + styleAccent(app) + '><div class="wrap">' +
            enTete(null, esc(fr ? 'Aide et informations' : 'Help and information'), null, 'reveal') + cartesLiens(cle) + '</div></section>';

        var voisins = f[2].filter(function (k) { return k !== cle; });
        var memes = !voisins.length ? '' : '<section class="band is-alt"><div class="wrap">' +
            enTete(esc(pick(f[1])), esc(fr ? 'Dans la même famille' : 'In the same family'), null, 'reveal') +
            tuiles(voisins) + '<p style="margin-top:24px">' + lienPlus(withLang('./index.html#catalogue'), pick(V.allApps)) + '</p></div></section>';

        return navHTML('v2-app') + '<main>' + sousBarre(cle, sections) + tete + galerie(cle) + fonctions + donnees + aide + memes + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Pages Confidentialité et Assistance du site

       site-pages.js a déjà rendu le texte dans #site-root, dans l'une des onze
       langues (adresse ?lang=, sinon langue du navigateur). On garde ses
       sections, on jette son en-tête et son pied, et on les replace dans la
       fiche du produit. Barre et pied du site : français si le texte l'est,
       anglais sinon.
       --------------------------------------------------------------------- */

    var LANGUES_LEGALES = [['fr', 'Français'], ['en', 'English'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'],
        ['ja', '日本語'], ['ko', '한국어'], ['zh-Hans', '简体中文'], ['uk', 'Українська'], ['ru', 'Русский'], ['ar', 'العربية']];

    function renderLegal(cle, sorte, root) {
        var app = APPS[cle];
        var langueTexte = document.documentElement.lang || 'fr';
        lang = langueTexte === 'fr' ? 'fr' : 'en';
        var titre = root.querySelector('.page-title');
        var sous = root.querySelector('.page-subtitle');
        var premier = root.querySelector('main .page-card:not(.premium-hero-clean) li');
        if (sous && premier && premier.textContent.trim() === sous.textContent.trim()) { sous = null; }
        var corps = root.querySelectorAll('main .page-card:not(.premium-hero-clean)');
        var fragment = document.createDocumentFragment();
        corps.forEach(function (n) { fragment.appendChild(n); });
        var nomPage = titre ? titre.textContent : pick(sorte === 'privacy' ? T.privacyLink : T.supportLink);
        var avecLangue = function (href) { return href.replace(/([?&])lang=[^&#]*/, '$1lang=' + langueTexte); };

        var courante = LANGUES_LEGALES.filter(function (l) { return l[0] === langueTexte; })[0] || LANGUES_LEGALES[0];
        var langues = '<details class="langs"><summary>' + svg(ICONES.globe, 'btn-glyph') + '<span lang="' + courante[0] + '">' + courante[1] + '</span>' +
            '<span class="sr-only">' + esc(lang === 'fr' ? ', changer de langue' : ', change language') + '</span></summary><ul>' +
            LANGUES_LEGALES.map(function (l) {
                return '<li><a href="?lang=' + l[0] + '" lang="' + l[0] + '"' + (l[0] === langueTexte ? ' aria-current="true"' : '') + '>' + l[1] + '</a></li>';
            }).join('') + '</ul></details>';

        var sections = [[withLang('./' + cle + '.html'), app.name], [avecLangue(lienLegal(cle, 'support')), pick(T.supportLink), sorte === 'support'],
            [avecLangue(lienLegal(cle, 'privacy')), pick(T.privacyLink), sorte === 'privacy']];

        var tete = '<section class="p-hero is-legal is-dark-zone" id="main"' + styleAccent(app) + '><div class="wrap p-head">' +
            teteProduit(cle, [[withLang('./' + cle + '.html'), app.name], [null, nomPage]], nomPage, app.name) +
            (sous ? '<p class="p-promo">' + esc(sous.textContent) + '</p>' : '') + langues + '</div></section>';

        var pied = '<section class="band is-tight is-alt"><div class="wrap">' + cartesLiens(cle, sorte, avecLangue) + '</div></section>';

        root.className = '';
        root.innerHTML = navHTML('v2-legal') + '<main>' + sousBarre(cle, sections) + tete +
            '<div class="legal-body"><div class="wrap" id="legal-texte"></div></div>' + pied + '</main>' + footerHTML();
        var texte = document.getElementById('legal-texte');
        texte.appendChild(fragment);
        texte.setAttribute('lang', langueTexte);
        texte.setAttribute('dir', langueTexte === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = lang;
        document.documentElement.dir = 'ltr';

        /* Le menu des langues se ferme comme un menu : Échap (le focus revient au bouton) ou clic hors de lui. */
        var menu = root.querySelector('.langs');
        document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) { menu.open = false; } });
        menu.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
        });
    }

    /* ---------------------------------------------------------------------
       À propos et Contact
       --------------------------------------------------------------------- */

    function renderAbout() {
        var hero = '<section class="page-hero is-dark-zone" id="main"><div class="wrap">' +
            picture('./assets/img/profile.jpg', ' class="portrait" width="180" height="180" alt="Rodolphe Vandaele" decoding="async" fetchpriority="high"') +
            '<p class="eyebrow">' + esc(pick(T.profileEyebrow)) + '</p><h1>' + esc(pick(V.aboutTitle)) + '</h1>' +
            '<p class="lead">' + esc(pick(T.profileBio)) + '</p>' +
            '<div class="btn-row"><a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(T.profileCTA)) + '</a>' +
            lienPlus(withLang('./index.html'), pick(V.allApps)) + '</div>' +
            '<nav class="icon-dock" aria-label="' + esc(pick(V.allApps)) + '">' + TOUTES.map(function (k) {
                return '<a href="' + withLang('./' + k + '.html') + '" aria-label="' + esc(APPS[k].name) + '">' + icones([k], 48) + '</a>';
            }).join('') + '</nav></div></section>';

        function grille(sur, titre, items, classe) {
            return '<section class="band' + (classe || '') + '"><div class="wrap">' + enTete(esc(sur), esc(titre), null, 'reveal') +
                '<div class="cards">' + items.map(function (l) {
                    return carte(icone(l[0]) + '<h3>' + esc(l[1]) + '</h3><p>' + esc(l[2]) + '</p>', 'reveal');
                }).join('') + '</div></div></section>';
        }

        var legal = '<section class="band is-alt" id="mentions" aria-labelledby="mentions-titre"><div class="wrap">' + enTete(null, esc(pick(T.legalTitleSite)), null, '', 'mentions-titre') +
            '<div class="cards">' +
            carte('<h3>' + esc(pick(T.legalEditor)) + '</h3><p>' + esc(pick(T.legalEditorText)) + '<br><a class="legal-mail" href="mailto:' + MAIL + '">' + MAIL + '</a></p>') +
            carte('<h3>' + esc(pick(T.legalHost)) + '</h3><p>' + esc(pick(T.legalHostText)) + '</p>') +
            carte('<h3>' + esc(pick(T.legalContent)) + '</h3><p>' + esc(pick(T.legalContentText)) + '</p>') +
            '</div></div></section>';

        return navHTML('v2-about') + '<main>' + hero +
            grille(pick(T.aboutLinesEyebrow), pick(T.aboutLinesTitle), pick(T.aboutLines), ' is-dark') +
            grille(pick(T.aboutMethodEyebrow), pick(T.aboutMethodTitle), pick(T.aboutMethod)) +
            legal + '</main>' + footerHTML();
    }

    function renderContact() {
        var objet = encodeURIComponent(pick(T.mailSubject));
        var hero = '<section class="page-hero is-dark-zone" id="main"><div class="wrap"><p class="eyebrow">' + esc(pick(T.contactEyebrow)) + '</p>' +
            '<h1>' + esc(pick(V.contactTitle)) + '</h1><p class="lead">' + esc(pick(V.contactLead)) + '</p>' +
            '<div class="btn-row"><a class="btn btn-primary contact-mail" href="mailto:' + MAIL + '?subject=' + objet + '">' +
            svg(ICONES.mail, 'btn-glyph') + MAIL + '</a></div></div></section>';

        var parApp = '<section class="band is-alt"><div class="wrap">' +
            enTete(esc(pick(T.supportLink)), esc(pick(V.contactPerApp)), esc(pick(V.contactPerAppLead)), 'reveal') +
            '<div class="support-groups">' + FAMILLES.map(function (f) {
                return '<div class="is-' + f[0] + '"><h3><i class="dot"></i>' + esc(pick(f[1])) + '</h3>' +
                    tuiles(f[2], function (k) { return pick(APPS[k].platform === 'mac' ? T.macStore : T.supportLink); },
                        function (k) { return APPS[k].platform === 'mac' ? APPS[k].store : lienLegal(k, 'support'); }) + '</div>';
            }).join('') + '</div></div></section>';

        return navHTML('v2-contact') + '<main>' + hero + parApp + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Comportements
       --------------------------------------------------------------------- */

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var survol = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Le menu des écrans étroits. Fermé, il est `inert` : ses liens ne reçoivent ni le focus ni les lecteurs d'écran. */
    function basculerMenu(ouvrir) {
        var bouton = document.querySelector('.nav-toggle');
        var menu = document.getElementById('nav-menu');
        if (!bouton || !menu) { return; }
        bouton.setAttribute('aria-expanded', String(ouvrir));
        menu.classList.toggle('is-open', ouvrir);
        document.body.classList.toggle('menu-open', ouvrir);
        if (ouvrir) {
            menu.removeAttribute('inert');
            var premier = menu.querySelector('a');
            if (premier) { premier.focus({ preventScroll: true }); }
        } else {
            menu.setAttribute('inert', '');
        }
    }

    function menuOuvert() {
        var menu = document.getElementById('nav-menu');
        return !!menu && menu.classList.contains('is-open');
    }

    function attacheMenu() {
        var bouton = document.querySelector('.nav-toggle');
        var menu = document.getElementById('nav-menu');
        if (!bouton || !menu) { return; }
        bouton.addEventListener('click', function () { basculerMenu(!menuOuvert()); });
        menu.addEventListener('click', function (e) { if (e.target.closest('a')) { basculerMenu(false); } });
    }

    function attacheMenuGlobal() {
        addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || !menuOuvert()) { return; }
            basculerMenu(false);
            var bouton = document.querySelector('.nav-toggle');
            if (bouton) { bouton.focus(); }
        });
        document.addEventListener('click', function (e) {
            if (menuOuvert() && !e.target.closest('#nav-menu, .nav-toggle')) { basculerMenu(false); }
        });
        attacheBarre();
        attacheDuo();
    }

    /* Le Duo se plie comme le vrai : tenu en portrait, sa charnière est horizontale. Une doublure `.pli` remplace
       l'appareil le temps du geste : la moitié haute se rabat vers soi sur la basse (ombre et lumière selon l'angle)
       et montre au dos l'écran extérieur, couché ; puis le bloc se redresse d'un quart de tour et prend la place du
       Duo fermé. Ouverture : le même geste à l'envers. Délégation : le sélecteur remplace les appareils du premier
       écran. */
    var PLI_TOUR = { duration: 560, easing: 'cubic-bezier(.32, .72, 0, 1)', fill: 'forwards' };

    function doublurePli(d) {
        var interieur = d.querySelector('.dev-screen > picture img');
        var exterieur = d.querySelector('.dev-ext img');
        function image(src) { return '<img src="' + (src.currentSrc || src.src) + '" alt="">'; }
        var p = document.createElement('div');
        p.className = 'pli';
        p.setAttribute('aria-hidden', 'true');
        p.innerHTML = '<div class="pli-bas"><div class="pli-p"><div class="pli-s">' + image(interieur) + '</div></div><i class="pli-ombre"></i></div>' +
            '<div class="pli-haut"><div class="pli-p pli-face"><div class="pli-s">' + image(interieur) + '</div><i class="pli-ombre"></i></div>' +
            '<div class="pli-p pli-dos"><div class="pli-s">' + image(exterieur) + '</div><i class="pli-ombre"></i></div></div>';
        d.appendChild(p);
        var ecran = p.querySelector('.pli-dos .pli-s');
        var couche = ecran.querySelector('img');
        couche.style.width = ecran.clientHeight + 'px';
        couche.style.height = ecran.clientWidth + 'px';
        return p;
    }

    function plierDuo(d) {
        if (d.querySelector('.pli')) { return; }
        var ferme = !d.classList.contains('is-closed');
        var fr = lang === 'fr';
        function etiquette() {
            d.setAttribute('aria-pressed', String(ferme));
            d.setAttribute('aria-label', ferme ? (fr ? 'Déplier l’iPhone Duo' : 'Unfold the iPhone Duo') : (fr ? 'Plier l’iPhone Duo' : 'Fold the iPhone Duo'));
        }
        if (reduceMotion || !d.animate) { d.classList.toggle('is-closed', ferme); etiquette(); return; }
        d.classList.remove('is-closed');
        d.classList.add('is-pliant');
        var p = doublurePli(d);
        var debout = 'translateX(' + d.offsetHeight / 2 + 'px) rotate(-90deg)';
        var volet = p.querySelector('.pli-haut');
        var face = volet.querySelector('.pli-face');
        var dos = volet.querySelector('.pli-dos');
        var dessous = p.querySelector('.pli-bas .pli-ombre');
        /* Rotation en deux moitiés égales : à 90°, volet vu de profil, l'autre face prend le relais (WebKit n'honore pas
           toujours backface-visibility sous un enfant animé). */
        function rabat(de, a) {
            var montre = de === 0 ? dos : face;
            var cache = de === 0 ? face : dos;
            cache.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0, offset: .5 }, { opacity: 0 }], { duration: 760, fill: 'forwards' });
            montre.animate([{ opacity: 0 }, { opacity: 0, offset: .5 }, { opacity: 1, offset: .5 }, { opacity: 1 }], { duration: 760, fill: 'forwards' });
            cache.querySelector('.pli-ombre').animate([{ opacity: 0 }, { opacity: .9 }], { duration: 380, easing: 'ease-in', fill: 'forwards' });
            montre.querySelector('.pli-ombre').animate([{ opacity: .9 }, { opacity: 0 }], { duration: 380, delay: 380, easing: 'ease-out', fill: 'forwards' });
            dessous.animate([{ opacity: 0 }, { opacity: .55, offset: .6 }, { opacity: 0 }], { duration: 760 });
            p.animate([{ transform: 'translateZ(0)' }, { transform: 'translateZ(40px)', offset: .5 }, { transform: 'translateZ(0)' }], { duration: 760, easing: 'ease-in-out' });
            return volet.animate([
                { transform: 'translateZ(2px) rotateX(' + de + 'deg)', easing: 'cubic-bezier(.55, 0, .9, .45)' },
                { transform: 'translateZ(2px) rotateX(' + (de + a) / 2 + 'deg)', offset: .5, easing: 'cubic-bezier(.1, .55, .3, 1)' },
                { transform: 'translateZ(2px) rotateX(' + a + 'deg)' }
            ], { duration: 760, fill: 'forwards' }).finished;
        }
        function fin() {
            d.classList.toggle('is-closed', ferme);
            d.classList.remove('is-pliant');
            p.remove();
            etiquette();
        }
        if (ferme) {
            rabat(0, -180).then(function () { return p.animate([{ transform: 'none' }, { transform: debout }], PLI_TOUR).finished; }).then(fin);
        } else {
            p.style.transform = debout;
            volet.style.transform = 'translateZ(2px) rotateX(-180deg)';
            face.style.opacity = 0;
            dos.style.opacity = 1;
            p.animate([{ transform: debout }, { transform: 'none' }], PLI_TOUR).finished.then(function () { return rabat(-180, 0); }).then(fin);
        }
    }

    function attacheDuo() {
        document.addEventListener('click', function (e) {
            var d = e.target.closest('.dev.is-duo[role="button"]');
            if (d) { plierDuo(d); }
        });
        document.addEventListener('keydown', function (e) {
            var d = e.target.closest && e.target.closest('.dev.is-duo[role="button"]');
            if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); plierDuo(d); }
        });
    }

    /* Le sélecteur du premier écran garde les appareils en place, comme une page produit : les écrans s'éteignent,
       chaque appareil glisse vers sa nouvelle place (FLIP sur .dev-body, sans relancer l'entrée ni le flottement),
       l'iPad pivote s'il passe en paysage, ceux qui ne servent plus s'effacent, les nouveaux apparaissent, puis les
       écrans se rallument quand leur image est décodée. Survoler une icône prépare ses images. */
    var ROLES_APPAREIL = ['ipad', 'iphone', 'duo', 'watch', 'tv'];

    function roleAppareil(d) {
        return ROLES_APPAREIL.filter(function (r) { return d.classList.contains('is-' + r); })[0];
    }

    function sansEntree(d) {
        var corps = d.querySelector('.dev-body');
        if (corps) { corps.classList.add('sans-entree'); }
    }

    function attacheSelecteur() {
        var boutons = document.querySelectorAll('.hero-pick .pick-item');
        var rig = document.querySelector('.hero-stage .stage-rig');
        var nom = document.querySelector('.hero-pick .pick-name');
        if (!boutons.length || !rig) { return; }
        var fr = lang === 'fr';
        var invite = nom.innerHTML;
        var prets = {};
        var geste = 0;

        function preparer(cle) {
            if (prets[cle]) { return prets[cle]; }
            var t = document.createElement('div');
            t.innerHTML = cle ? scene(cle, true) : sceneAccueil();
            var images = Array.prototype.slice.call(t.querySelectorAll('img'));
            images.forEach(function (i) { i.removeAttribute('loading'); });
            prets[cle] = {
                devs: Array.prototype.slice.call(t.querySelectorAll('.dev')),
                decode: Promise.all(images.map(function (i) { return i.decode ? i.decode().catch(function () {}) : null; }))
            };
            return prets[cle];
        }

        function montrer(cle) {
            var pret = preparer(cle);
            delete prets[cle];
            var n = ++geste;
            var anciens = {};
            rig.querySelectorAll('.dev').forEach(function (d) { anciens[roleAppareil(d)] = d; });
            var nouveaux = {};
            pret.devs.forEach(function (d) { nouveaux[roleAppareil(d)] = d; });
            if (reduceMotion || !rig.animate) {
                rig.innerHTML = '';
                pret.devs.forEach(function (d) { sansEntree(d); rig.appendChild(d); });
                return;
            }
            Object.keys(anciens).forEach(function (r) {
                anciens[r].classList.add('is-eteint');
                if (!nouveaux[r]) { anciens[r].classList.add('is-sortie'); }
            });
            setTimeout(function () {
                if (n !== geste) { return; }
                var avant = {};
                Object.keys(anciens).forEach(function (r) {
                    if (nouveaux[r]) { avant[r] = anciens[r].getBoundingClientRect(); }
                    else { anciens[r].remove(); }
                });
                var entrants = [];
                pret.devs.forEach(function (neuf) {
                    var r = roleAppareil(neuf);
                    var vieux = anciens[r];
                    sansEntree(neuf);
                    if (!vieux) {
                        neuf.classList.add('is-eteint', 'is-entree');
                        rig.appendChild(neuf);
                        entrants.push(neuf);
                        return;
                    }
                    Array.prototype.slice.call(neuf.attributes).forEach(function (a) {
                        if (a.name !== 'style') { vieux.setAttribute(a.name, a.value); }
                    });
                    Array.prototype.slice.call(vieux.attributes).forEach(function (a) {
                        if (a.name !== 'style' && !neuf.hasAttribute(a.name)) { vieux.removeAttribute(a.name); }
                    });
                    vieux.classList.add('is-eteint');
                    vieux.replaceChildren.apply(vieux, Array.prototype.slice.call(neuf.childNodes));
                });
                Object.keys(avant).forEach(function (r) {
                    var d = anciens[r];
                    var a = avant[r];
                    var b = d.getBoundingClientRect();
                    var tourne = (a.width > a.height) !== (b.width > b.height);
                    var s = tourne ? a.height / b.width : a.width / b.width;
                    var dx = a.left + a.width / 2 - (b.left + b.width / 2);
                    var dy = a.top + a.height / 2 - (b.top + b.height / 2);
                    (d.querySelector('.dev-body') || d).animate([
                        { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + (tourne ? (b.width > b.height ? 90 : -90) : 0) + 'deg) scale(' + s + ')' },
                        { transform: 'none' }
                    ], { duration: 820, easing: 'cubic-bezier(.32, .72, 0, 1)' });
                });
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () { entrants.forEach(function (d) { d.classList.remove('is-entree'); }); });
                });
                Promise.all([pret.decode, new Promise(function (ok) { setTimeout(ok, 380); })]).then(function () {
                    if (n !== geste) { return; }
                    rig.querySelectorAll('.dev').forEach(function (d, i) {
                        setTimeout(function () { d.classList.remove('is-eteint'); }, i * 90);
                    });
                });
            }, 240);
        }

        boutons.forEach(function (b) {
            var cle = b.getAttribute('data-pick');
            b.addEventListener('pointerenter', function () { preparer(cle); });
            b.addEventListener('focus', function () { preparer(cle); });
            b.addEventListener('click', function () {
                if (b.getAttribute('aria-pressed') === 'true') { return; }
                boutons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                var rangee = b.parentNode;
                rangee.scrollTo({ left: b.offsetLeft - (rangee.clientWidth - b.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
                nom.innerHTML = cle ? '<b>' + esc(APPS[cle].name) + '</b> · ' + esc(plateforme(APPS[cle])) +
                    ' · <a href="' + withLang('./' + cle + '.html') + '">' + esc(fr ? 'Voir la fiche' : 'View page') + '</a>' : invite;
                montrer(cle);
            });
        });
    }

    /* La barre se resserre dès qu'on défile, se cache quand on descend et revient dès qu'on remonte. Jamais cachée
       en haut de page, menu ouvert ou focus dans la barre (le CSS la montre alors). Sur l'accueil, le dock attend
       qu'on ait quitté le premier écran (dock-attente). */
    function attacheBarre() {
        var racine = document.documentElement;
        var avant = scrollY;
        var image = 0;
        function etat() {
            var y = scrollY;
            racine.classList.toggle('barre-defile', y > 24);
            racine.classList.toggle('dock-attente', !!document.querySelector('.hero') && y < innerHeight * .4);
            return y;
        }
        etat();
        addEventListener('scroll', function () {
            if (image) { return; }
            image = requestAnimationFrame(function () {
                image = 0;
                var y = etat();
                if (Math.abs(y - avant) < 8) { return; }
                racine.classList.toggle('barre-cachee', y > avant && y > 240 && !menuOuvert());
                avant = y;
            });
        }, { passive: true });
    }

    /* Les flèches d'un rail : un écran de cartes à la fois, désactivées aux extrémités. */
    function attacheRails() {
        document.querySelectorAll('.rail').forEach(function (r) {
            var piste = r.querySelector('.rail-track');
            var boutons = r.querySelectorAll('.rail-nav button');
            function etat() {
                var max = piste.scrollWidth - piste.clientWidth - 2;
                var x = Math.abs(piste.scrollLeft);
                boutons[0].disabled = x <= 2;
                boutons[1].disabled = x >= max;
                r.querySelector('.rail-nav').hidden = max <= 2;
            }
            boutons.forEach(function (b) {
                b.addEventListener('click', function () {
                    piste.scrollBy({ left: Number(b.getAttribute('data-dir')) * piste.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
                });
            });
            piste.addEventListener('scroll', etat, { passive: true });
            addEventListener('resize', etat, { passive: true });
            etat();
            r.etatRail = etat;
        });
    }

    /* Le sélecteur d'appareil des captures : il montre le rail choisi. Les flèches passent d'un appareil à l'autre,
       comme dans un contrôle segmenté natif. */
    function attacheAppareils() {
        document.querySelectorAll('#captures .segmented').forEach(function (groupe) {
            var section = groupe.closest('section');
            var rails = section.querySelectorAll('.rail[data-device]');
            var appareils = groupe.querySelectorAll('button[data-device]');
            appareils.forEach(function (b, i) {
                b.addEventListener('click', function () {
                    var choix = b.getAttribute('data-device');
                    appareils.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                    rails.forEach(function (r) {
                        r.hidden = r.getAttribute('data-device') !== choix;
                        if (!r.hidden && r.etatRail) { r.etatRail(); }
                    });
                });
                b.addEventListener('keydown', function (e) {
                    var pas = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
                    if (!pas) { return; }
                    e.preventDefault();
                    var cible = appareils[(i + pas + appareils.length) % appareils.length];
                    cible.focus();
                    cible.click();
                });
            });
        });
    }

    /* Le filtre par famille et la recherche du catalogue. */
    function attacheFiltres() {
        var barre = document.querySelector('.filter-chips');
        if (!barre) { return; }
        var boutons = barre.querySelectorAll('button[data-fam]');
        var champ = document.getElementById('recherche');
        var bilan = document.getElementById('bilan');
        var vide = document.getElementById('catalogue-vide');
        function appliquer() {
            var fam = barre.querySelector('button[aria-pressed="true"]').getAttribute('data-fam');
            var q = (champ.value || '').trim().toLowerCase();
            var n = 0;
            document.querySelectorAll('#tuiles .tile').forEach(function (c) {
                var ok = (fam === 'tout' || c.getAttribute('data-fam') === fam) && (!q || c.getAttribute('data-search').indexOf(q) !== -1);
                c.hidden = !ok;
                if (ok) { n++; }
            });
            vide.hidden = n > 0;
            bilan.textContent = n + (lang === 'fr' ? (n > 1 ? ' applications' : ' application') : (n > 1 ? ' apps' : ' app'));
        }
        boutons.forEach(function (b) {
            b.addEventListener('click', function () {
                boutons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                appliquer();
            });
        });
        champ.addEventListener('input', appliquer);
    }

    /* Les chiffres comptent jusqu'à leur valeur quand ils entrent dans l'écran. La valeur finale est déjà dans la
       page : sans script ou sans mouvement, elle s'affiche telle quelle. */
    function attacheCompteurs() {
        if (reduceMotion || !('IntersectionObserver' in window)) { return; }
        var cibles = document.querySelectorAll('[data-count]');
        if (!cibles.length) { return; }
        var io = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                if (!e.isIntersecting) { return; }
                io.unobserve(e.target);
                var fin = parseInt(e.target.getAttribute('data-count'), 10);
                var depart = performance.now();
                (function pas(t) {
                    var k = Math.min(1, (t - depart) / 1100);
                    e.target.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
                    if (k < 1) { requestAnimationFrame(pas); }
                })(depart);
            });
        }, { threshold: 0.4 });
        cibles.forEach(function (c) {
            if (!isNaN(parseInt(c.getAttribute('data-count'), 10))) { c.textContent = '0'; io.observe(c); }
        });
    }

    /* Apparition au défilement. Avec les animations liées au défilement (Safari 26, Chrome 115), le CSS s'en charge ;
       sinon un IntersectionObserver pose `is-in`. Sans l'une ni l'autre, rien n'est masqué. */
    var defileNatif = window.CSS && CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

    function attacheApparitions() {
        if (reduceMotion || (!defileNatif && !('IntersectionObserver' in window))) { return; }
        document.documentElement.classList.add('js-reveal');
        if (defileNatif) { return; }
        var io = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });
    }

    /* La scène 3D suit le pointeur, à la souris seulement : quelques degrés, lissés par la transition CSS. */
    function attacheScenes() {
        if (reduceMotion || !survol) { return; }
        document.querySelectorAll('.stage').forEach(function (s) {
            var rig = s.querySelector('.stage-rig');
            var image = 0;
            s.addEventListener('pointermove', function (e) {
                if (image) { return; }
                image = requestAnimationFrame(function () {
                    image = 0;
                    var b = s.getBoundingClientRect();
                    var x = (e.clientX - b.left) / b.width - 0.5;
                    rig.style.setProperty('--ry', x * 26 + 'deg');
                    rig.style.setProperty('--rx', (0.5 - (e.clientY - b.top) / b.height) * 12 + 'deg');
                    rig.style.setProperty('--gx', x * -40);
                });
            });
            s.addEventListener('pointerleave', function () {
                rig.style.setProperty('--ry', '0deg');
                rig.style.setProperty('--rx', '0deg');
                rig.style.setProperty('--gx', 0);
            });
        });
        /* Un halo suit le pointeur sur les cartes ; les grandes cartes s'inclinent aussi vers lui. */
        document.querySelectorAll('.show, .tile, .card, .feat, .link-card, .number').forEach(function (c) {
            var grande = c.classList.contains('show');
            c.addEventListener('pointermove', function (e) {
                var b = c.getBoundingClientRect();
                var x = (e.clientX - b.left) / b.width;
                var y = (e.clientY - b.top) / b.height;
                c.style.setProperty('--mx', x * 100 + '%');
                c.style.setProperty('--my', y * 100 + '%');
                if (grande) { c.style.transform = 'perspective(1200px) rotateY(' + (x - 0.5) * 5 + 'deg) rotateX(' + (0.5 - y) * 4 + 'deg)'; }
            });
            c.addEventListener('pointerleave', function () { c.style.transform = ''; });
        });
    }

    /* Le dock allume la famille dont le chapitre occupe le milieu de l'écran (accueil seulement). */
    function attacheDock() {
        var liens = document.querySelectorAll('.dock [data-spy]');
        if (!liens.length || !('IntersectionObserver' in window)) { return; }
        var io = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                var lien = document.querySelector('.dock [data-spy="' + e.target.id + '"]');
                if (lien) { lien.classList.toggle('is-active', e.isIntersecting); }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        liens.forEach(function (l) {
            var section = document.getElementById(l.getAttribute('data-spy'));
            if (section) { io.observe(section); }
        });
    }

    function attacheLangue() {
        document.querySelectorAll('[data-lang]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                setLang(a.getAttribute('data-lang'));
            });
        });
    }

    /* ---------------------------------------------------------------------
       Rendu
       --------------------------------------------------------------------- */

    var menuGlobal = false;

    function render() {
        var root = document.getElementById('site-root');
        if (!root) { return; }
        var page = document.body.getAttribute('data-page');
        var appKey = document.body.getAttribute('data-app');
        var legale = (page === 'privacy' || page === 'support') && AVEC_LEGAL.indexOf(appKey) !== -1;

        if (legale) {
            /* Sans le texte de site-pages.js (script absent ou en erreur), le repli HTML reste affiché. */
            if (!root.querySelector('main .page-card')) { return; }
            renderLegal(appKey, page, root);
        } else {
            var html;
            if (page === 'v2-home') { html = renderHome(); }
            else if (page === 'v2-app' && APPS[appKey]) { html = renderApp(appKey); }
            else if (page === 'v2-contact') { html = renderContact(); }
            else if (page === 'v2-about') { html = renderAbout(); }
            else { return; }
            document.documentElement.lang = lang;
            document.body.classList.remove('menu-open');
            root.innerHTML = html;
            attacheLangue();
        }

        var premier = !menuGlobal;
        if (!menuGlobal) { menuGlobal = true; attacheMenuGlobal(); }
        attacheMenu();
        attacheRails();
        attacheAppareils();
        attacheCompteurs();
        attacheFiltres();
        attacheApparitions();
        attacheScenes();
        attacheSelecteur();
        attacheDock();
        /* Le rendu remplace la page : l'ancre de l'adresse (#jeux...) n'existait pas au chargement. */
        if (premier && location.hash.length > 1) {
            var cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (cible) { cible.scrollIntoView(); }
        }
    }

    render();
})();
