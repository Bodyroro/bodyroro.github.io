/* ==========================================================================
   site.js : moteur de la vitrine
   ==========================================================================
   Rend l'accueil (catalogue de tuiles filtrable par famille, avec recherche),
   les pages produit, les pages Confidentialité et Assistance du site, À propos
   et Contact, en français et en anglais. Un seul design, celui du catalogue :
   toutes les fiches suivent le même gabarit en grilles de cartes, seules
   l'icône et la couleur d'accent de la tuile sont propres au produit.

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
    /* Page développeur : elle réunit les cinq applications iPhone. Le badge
       d'Apple doit conduire à l'App Store, pas à une section de ce site. */
    var STORE_DEV = 'https://apps.apple.com/fr/developer/rodolphe-vandaele/id1884012478';
    /* Fiches des jeux, sous la forme courte sans pays : l'App Store ouvre
       la vitrine du pays du visiteur. */
    var STORE_TC = 'https://apps.apple.com/app/id6816639945';
    var STORE_MG = 'https://apps.apple.com/app/id6817347087';
    var STORE_CF = 'https://apps.apple.com/app/id6819280350';
    var STORE_CT = 'https://apps.apple.com/app/id6822791450';
    var STORE_CFM = 'https://apps.apple.com/app/id6824902491';
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

       Chaque image du site existe en trois formats : AVIF, WebP, et l'original
       PNG ou JPEG. Le navigateur retient le premier qu'il sait décoder, et ne
       télécharge que celui-là. L'original reste en place : c'est le repli des
       navigateurs anciens, et c'est lui que lisent les aperçus des réseaux
       sociaux, qui ne négocient pas de format.

       <picture> plutôt que l'attribut `srcset` d'<img> : ici les variantes sont
       des formats, pas des tailles, et seul <source type=""> sait exprimer ça.
       Le CSS pose `picture { display: contents }` pour que l'enveloppe ne
       s'intercale pas dans les mises en page : l'<img> reste la boîte.
       --------------------------------------------------------------------- */
    function picture(src, attrs) {
        var base = src.replace(/\.(png|jpe?g)$/i, '');
        return '<picture>' +
            '<source type="image/avif" srcset="' + base + '.avif">' +
            '<source type="image/webp" srcset="' + base + '.webp">' +
            '<img src="' + src + '"' + (attrs || '') + '>' +
            '</picture>';
    }

    /* Les visuels des jeux (captures App Store) et des apps (visuels de leur fiche, CapturesAppStore.mjs),
       dans la langue de la page. Chacun existe en 360 et 720 pixels de large, en
       AVIF et en WebP, plus un JPEG de 540 pour les navigateurs qui ne lisent ni
       l'un ni l'autre. `sizes` dit au navigateur la largeur affichée : il choisit
       le fichier selon la densité de l'écran. */
    var FORMATS_CAPTURES = {
        iphone: ['-', [360, 720, 540, 1320, 2868]],
        ipad: ['-ipad-', [640, 1280, 960, 2752, 2064]],
        ipadv: ['-ipad-', [480, 960, 720, 1536, 2048]],
        paysage: ['-', [640, 1280, 960, 2868, 1320]],
        tv: ['-tv-', [640, 1280, 960, 1920, 1080]]
    };

    function captureJeu(cle, n, alt, paresseux, sizes, appareil) {
        var f = FORMATS_CAPTURES[appareil || 'iphone'];
        var base = './assets/img/shots/' + cle + f[0] + lang + '-' + n;
        var t = f[1];
        function jeu(ext) { return base + '-' + t[0] + '.' + ext + ' ' + t[0] + 'w, ' + base + '-' + t[1] + '.' + ext + ' ' + t[1] + 'w'; }
        return '<picture>' +
            '<source type="image/avif" srcset="' + jeu('avif') + '" sizes="' + sizes + '">' +
            '<source type="image/webp" srcset="' + jeu('webp') + '" sizes="' + sizes + '">' +
            '<img src="' + base + '-' + t[2] + '.jpg" width="' + t[3] + '" height="' + t[4] + '" alt="' + esc(alt) + '"' +
            (paresseux === true ? ' loading="lazy"' : paresseux === false ? ' fetchpriority="high"' : '') + ' decoding="async">' +
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
            fr: 'Contrairement aux apps iPhone, celles-ci ne sont pas limitées à la France : elles fonctionnent sur tous les Mac Apple Silicon. Applications natives, libres et open source, chacune sur un sujet précis, sans compte, sans publicité et sans dépendance.',
            en: 'Unlike the iPhone apps, these are not tied to France: they run on any Apple Silicon Mac. Native, free and open source apps, each on one precise subject, with no account, no ads and no dependency.'
        },
        macStore: { fr: 'Sur GitHub', en: 'On GitHub' },
        macPreview: { fr: 'La fenêtre', en: 'The window' },
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

        profileEyebrow: { fr: 'À propos', en: 'About' },
        profileBio: {
            fr: 'Développeur autodidacte basé en France, je construis des apps simples, utiles et respectueuses de la vie privée, en privilégiant SwiftUI, MapKit, StoreKit, WidgetKit et les composants natifs Apple pour une expérience cohérente.',
            en: 'Self taught developer based in France, I build simple, useful, privacy minded apps, favoring SwiftUI, MapKit, StoreKit, WidgetKit and native Apple components for a coherent experience.'
        },
        profileCTA: { fr: 'Me contacter', en: 'Get in touch' },
        footerLine: { fr: 'Sur iPhone et iPad, des jeux avec Gloup et les services publics français du quotidien. Sur Mac, des utilitaires libres qui font une chose et la font bien.', en: 'On iPhone and iPad, games starring Gloup and everyday French public services. On Mac, free utilities that do one thing and do it well.' },
        footerSite: { fr: 'Site', en: 'Site' },
        footerApps: { fr: 'Apps iPhone', en: 'iPhone apps' },
        footerTagline: { fr: 'Conçu et développé en France.', en: 'Designed and built in France.' },
        footerStore: { fr: 'Toutes les applications sur l\u2019App Store', en: 'All apps on the App Store' },
        footerPartners: { fr: 'Partenaire', en: 'Partner' },

        supportLink: { fr: 'Assistance', en: 'Support' },
        privacyLink: { fr: 'Confidentialité', en: 'Privacy' },
        featEyebrow: { fr: 'Fonctionnalités', en: 'Features' },
        shotsEyebrow: { fr: 'Captures réelles', en: 'Real screenshots' },
        dataEyebrow: { fr: 'Données & confidentialité', en: 'Data & privacy' },
        dataSources: { fr: 'Sources', en: 'Sources' },
        dataBusiness: { fr: 'Publicité & achats', en: 'Ads & purchases' },
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

        /* Les deux gammes n'ont ni le même public, ni le même mode de
           distribution. La page À propos est l'endroit où le dire une fois,
           clairement, plutôt que de le laisser deviner app par app. */
        aboutLinesEyebrow: { fr: 'Deux gammes', en: 'Two ranges' },
        aboutLinesTitle: { fr: 'Deux publics, deux façons de distribuer.',
                           en: 'Two audiences, two ways of shipping.' },
        aboutLines: {
            fr: [
                ['phone', 'iPhone, pour la France',
                 'Des applications gratuites, dont des services bâtis sur les jeux de données publics français : carburants, bornes de recharge, toilettes, défibrillateurs et prix de l’immobilier. Distribuées sur l’App Store, financées par une publicité discrète, sans compte ni inscription.'],
                ['laptop', 'Mac, en open source',
                 'Des utilitaires natifs pour Mac Apple Silicon, chacun sur un sujet précis. Publiés sous licence MIT sur GitHub, code complet consultable, sans publicité ni dépendance tierce.']
            ],
            en: [
                ['phone', 'iPhone, built for France',
                 'Free apps, including services built on French public datasets: fuel prices, EV chargers, public toilets, defibrillators and property prices. Shipped on the App Store, funded by discreet advertising, with no account or sign-up.'],
                ['laptop', 'Mac, open source',
                 'Native utilities for Apple Silicon Macs, each on one precise subject. Published under the MIT licence on GitHub, full source readable, with no ads and no third-party dependency.']
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
                    'Carte et liste des stations avec prix carburants en France, tri par prix ou distance, favoris, stations masquées et cache hors-ligne.',
                    'Évolution du prix dans la station suivie : courbe interactive des relevés quotidiens sur 45 jours.',
                    'Carnet de bord : consommation et autonomie calculées depuis vos pleins, CO₂ émis (facteurs ADEME) et écart de prix payé face à la moyenne nationale du mois.',
                    'Véhicules et entretien : motorisation thermique, hybride ou hybride rechargeable, capacité du réservoir, dépenses par catégorie et budget.',
                    'Analyse du marché : baril de Brent, euro/dollar, stations les moins chères et ruptures par carburant, plus les actualités du secteur.',
                    'Widget station la moins chère, CarPlay et Contrôle rapide. Abonnement facultatif « Sans pub », et vidéo récompensée pour 6 h sans publicité.'
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
            sources: { fr: 'Prix publics officiels des carburants en France, mis en cache localement. Historique des prix, cours du Brent et taux de change issus de sources publiques ; facteurs CO₂ de l’ADEME.', en: 'Official public French fuel prices, cached locally. Price history, Brent crude and exchange rates from public sources; CO₂ factors from ADEME.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par StoreKit et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by StoreKit and your Apple account: no payment card data in the app.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#1e336a', '#0a1a4c', '#233970', '#0b1b4d', '#20356c'],
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
                fr: ['Carte des bornes avec connecteurs, puissance, opérateur et disponibilité.', 'Filtres CCS2, CHAdeMO, Type 2, puissance minimale et rayon 5 à 50 km.', 'Look Around, vue 3D, favoris, hors-ligne, Siri et calculateur de recharge.', 'Prix spot, coût avec tarif saisi, conseils et actualités de la mobilité électrique. Abonnement facultatif « Sans pub ».'],
                en: ['Charger map with connectors, power, operator and availability.', 'CCS2, CHAdeMO, Type 2, minimum power and 5 to 50 km radius filters.', 'Look Around, 3D map, favorites, offline mode, Siri and charging calculator.', 'Spot price, cost with your tariff, advice and EV news. Optional “Ad-Free” subscription.']
            },
            sources: { fr: 'Données ouvertes des infrastructures de recharge (IRVE), mises en cache localement.', en: 'Open data on French charging infrastructure (IRVE), cached locally.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par StoreKit et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by StoreKit and your Apple account: no payment card data in the app.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#1b5155', '#073139', '#20585c', '#08313a', '#1e5459'],
            storeShots: {
                fr: ['Les bornes autour de vous', 'Comparez les bornes', 'Le détail de la borne', 'Calculez votre recharge', 'Suivez vos recharges'],
                en: ['Chargers near you', 'Compare chargers', 'Every charger in detail', 'Plan your charge', 'Track your charging']
            }
        },
        toilettefrance: {
            name: 'ToiletteFrance', platform: 'ios', accent: '#3d9bff',
            store: STORE + 'toilettefrance/id6760978805',
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
            sources: { fr: 'Données ouvertes françaises sur les toilettes publiques, mises en cache localement.', en: 'French open data on public toilets, cached locally.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par StoreKit et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by StoreKit and your Apple account: no payment card data in the app.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#23547a', '#0a3760', '#285b80', '#0b3861', '#26587d'],
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
                fr: ['Carte des DAE proches avec code couleur par accessibilité.', 'Filtres accès public, 24h/24, intérieur/extérieur et rayon 500 m à 10 km.', 'Mode Urgence, appel SAMU 15 avec confirmation et guide RCP avec métronome haptique.', 'Abonnement facultatif « Sans pub » pour retirer toute publicité, et vidéo récompensée pour 6 h sans publicité.'],
                en: ['Nearby AED map with color coding by accessibility.', 'Public access, 24/7, indoor/outdoor and 500 m to 10 km radius filters.', 'Emergency mode, confirmed SAMU 15 call and CPR guide with haptic metronome.', 'Optional “Ad-Free” subscription removes every ad; a rewarded video gives 6 ad-free hours.']
            },
            sources: { fr: 'Base nationale des défibrillateurs, mise en cache localement.', en: 'The national defibrillator database, cached locally.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par StoreKit et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by StoreKit and your Apple account: no payment card data in the app.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#6a212c', '#4d0914', '#712732', '#4e0a15', '#6d242f'],
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
                fr: 'Prix de l\u2019immobilier d\u2019apr\u00e8s les ventes r\u00e9ellement enregistr\u00e9es par l\u2019administration fiscale : carte, m\u00e9dianes par commune, plan cadastral, fiche de quartier et fourchette d\u2019estimation. 100 % gratuit.',
                en: 'Property prices from sales actually recorded by the tax authority: map, medians by town, cadastral plan, neighbourhood profile and valuation range. 100% free.'
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
                    'Neighbourhood profile: schools with pass rates and value added, named shops, lines and stops, declared hazards, recognised disasters, radon, air and soil.',
                    'Advertised rents, fibre broadband and mobile coverage, energy certificates for the exact address and gross rental yield. No account.'
                ]
            },
            sources: { fr: 'Demandes de valeurs fonci\u00e8res de la Direction g\u00e9n\u00e9rale des finances publiques, g\u00e9olocalis\u00e9es par Etalab. Carte des loyers du minist\u00e8re du Logement, diagnostics de l\u2019ADEME, risques de G\u00e9orisques, plan cadastral de l\u2019IGN, annuaire et r\u00e9sultats de l\u2019\u00c9ducation nationale, faits enregistr\u00e9s du minist\u00e8re de l\u2019Int\u00e9rieur, d\u00e9coupage IRIS de l\u2019INSEE et OpenStreetMap.', en: 'Property transfer records from the French public finances directorate, geocoded by Etalab. Rent map from the Ministry of Housing, ADEME energy certificates, G\u00e9orisques hazards, IGN cadastral plan, schools directory and results from the Ministry of Education, recorded offences from the Interior Ministry, INSEE IRIS boundaries and OpenStreetMap.' },
            business: { fr: 'Application gratuite, financée par la publicité. Un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) retire toute publicité tant qu’il est actif ; une vidéo récompensée offre aussi 6 h sans publicité. Géré par StoreKit et votre compte Apple : aucune donnée bancaire dans l’app.', en: 'Free app, funded by ads. An optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) removes every ad while it is active; a rewarded video also gives 6 hours ad-free. Handled by StoreKit and your Apple account: no payment card data in the app.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#1e4d38', '#072e1e', '#23553e', '#082e1f', '#21513b'],
            storeShots: {
                fr: ['Les prix autour de vous', 'Le détail d’une vente', 'Le marché de votre commune', 'Votre quartier en un coup d’œil', 'Tout ce qui vous entoure'],
                en: ['Property prices near you', 'Every sale in detail', 'Your town’s market', 'Your area at a glance', 'Everything around you']
            }
        },
        /* Ni données publiques ni publicité, d'où `chips` et `on` propres. Sans visuels Premium, la galerie montre ses écrans bruts dans le téléphone
           (`rawShots`), avec ceux de l'iPad et de l'Apple TV (`devices`, mêmes légendes), produits par
           CapturesAppStore.mjs depuis Docs/Telora/Screenshots/<appareil>(-en). */
        telora: {
            name: 'Telora', platform: 'ios', accent: '#8b5cf6',
            store: 'https://apps.apple.com/app/id6821877987',
            on: { fr: 'iPhone, iPad et Apple TV', en: 'iPhone, iPad and Apple TV' },
            tag: { fr: 'Lecteur multimédia', en: 'Media player' },
            promo: { fr: 'Vos films, séries et chaînes, depuis vos propres sources, sur iPhone, iPad et Apple TV.', en: 'Your movies, shows and channels, from your own sources, on iPhone, iPad and Apple TV.' },
            ipadPortrait: true,
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
            business: { fr: 'Aucune publicité, aucun pistage. Telora s’utilise avec l’abonnement Telora+, au mois ou à l’année, après un essai gratuit de 7 jours. L’abonnement est géré par StoreKit et votre compte Apple : l’application ne reçoit aucune donnée bancaire.', en: 'No ads, no tracking. Telora is used with the Telora+ subscription, monthly or yearly, after a 7-day free trial. The subscription is handled by StoreKit and your Apple account: the app never receives payment card data.' },
            rawShots: true,
            devices: ['iphone', 'ipad', 'tv'],
            storeShots: {
                fr: ['L’accueil', 'Les films, nouveautés en tête', 'La fiche d’un film', 'La fiche d’une série', 'La recherche dans vos sources', 'Une interface à votre goût'],
                en: ['The home screen', 'Movies, newest first', 'A movie page', 'A show page', 'Search across your sources', 'An interface your way']
            }
        },
        telzo: {
            name: 'Telzo', platform: 'ios', accent: '#3b5bdb',
            store: 'https://apps.apple.com/app/id6822364165',
            on: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
            tag: { fr: 'Télécommande TV', en: 'TV remote' },
            promo: { fr: 'La télécommande universelle par Wi-Fi : téléviseurs, Chromecast et box TV.', en: 'The universal Wi-Fi remote: smart TVs, Chromecast and TV boxes.' },
            desc: {
                fr: 'Télécommande universelle par Wi-Fi pour iPhone et iPad : téléviseurs connectés, Chromecast et box TV, avec clavier, pavé tactile et applications. Aucun compte, rien ne quitte votre domicile.',
                en: 'Universal Wi-Fi remote for iPhone and iPad: smart TVs, Chromecast and TV boxes, with keyboard, touchpad and apps. No account, nothing leaves your home.'
            },
            chips: {
                fr: ['Gratuite', 'Sans compte', '7 jours d’essai Sans pub'],
                en: ['Free', 'No account', '7-day Ad-Free trial']
            },
            features: {
                fr: [
                    'Pavé directionnel ou pavé tactile, volume, chaînes, lecture et alimentation, avec retour haptique.',
                    'Le clavier de l’iPhone pour écrire vos recherches sur la télévision, et vos applications (Netflix, YouTube…) en un geste.',
                    'Téléviseurs Samsung, LG, Google TV et Android TV (Sony, TCL, Philips, Xiaomi, Hisense…), Roku et Sony Bravia, Chromecast, box Orange, Freebox, Sky Q, TiVo et DirecTV ; aussi Vizio, Panasonic Viera, LG NetCast, Philips non Android et les enceintes Sonos.',
                    'Recherche automatique sur le Wi-Fi, plusieurs appareils associés et bascule rapide.',
                    'Siri, widget et commande du Centre de contrôle.',
                    'Aucun compte, aucun serveur : les commandes vont directement de l’iPhone au téléviseur.'
                ],
                en: [
                    'D-pad or touchpad, volume, channels, playback and power, with haptic feedback.',
                    'The iPhone keyboard to type searches on your TV, and your apps (Netflix, YouTube…) in one tap.',
                    'Samsung, LG, Google TV and Android TV (Sony, TCL, Philips, Xiaomi, Hisense…), Roku and Sony Bravia TVs, Chromecast, Orange, Freebox, Sky Q, TiVo and DirecTV boxes; also Vizio, Panasonic Viera, LG NetCast, non-Android Philips and Sonos speakers.',
                    'Automatic search on your Wi-Fi, several paired devices with quick switching.',
                    'Siri, a widget and a Control Center control.',
                    'No account, no server: commands go straight from the iPhone to the TV.'
                ]
            },
            sources: { fr: 'Aucune source de données externe : Telzo ne communique qu’avec les appareils de votre réseau local. Telzo n’est affilié à aucun fabricant de téléviseurs ; les marques citées appartiennent à leurs propriétaires.', en: 'No external data source: Telzo only talks to devices on your local network. Telzo is not affiliated with any TV manufacturer; the brands mentioned belong to their owners.' },
            business: { fr: 'Gratuite, toutes les touches comprises, financée par la publicité. Abonnement facultatif « Sans pub » à 0,99 € par mois ou 4,99 € par an, avec 7 jours d’essai gratuit, géré par StoreKit et votre compte Apple.', en: 'Free, every button included, funded by advertising. Optional “Ad-Free” subscription at €0.99 per month or €4.99 per year, with a 7-day free trial, handled by StoreKit and your Apple account.' },
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/VisuelsApps.mjs puis CapturesAppStore.mjs), dans leur ordre. */
            shotTops: ['#293160', '#0f1640', '#2f3767', '#101741', '#2c3463'],
            storeShots: {
                fr: ['La télécommande dans votre poche', 'Naviguez du bout du doigt', 'Tous vos écrans en un geste', 'Écrivez sur la TV', 'Une aide pour chaque marque'],
                en: ['Your TV remote in your pocket', 'Navigate with a swipe', 'All your screens one tap away', 'Type on your TV', 'Step-by-step help for every brand']
            }
        },
        /* Pas encore sur l'App Store (`store: ''` : pastille « Bientôt disponible »), sans visuels App Store ni capture
           (`storeShots` absent : pas de galerie, `galerie` et la sous-barre l'omettent pour une app iOS). */
        netta: {
            name: 'Netta', platform: 'ios', accent: '#0d9488', accent2: '#ccfbf1',
            store: '',
            on: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
            tag: { fr: 'Tri de la photothèque', en: 'Photo library cleanup' },
            promo: { fr: 'Triez et nettoyez votre photothèque, et retrouvez les photos de ce jour-là, année après année.', en: 'Sort and clean your photo library, and revisit the photos from this day, year after year.' },
            desc: {
                fr: 'Tri et nettoyage de la photothèque de l’iPhone : doublons, photos similaires et floues, captures d’écran, vidéos lourdes, et « Ce jour-là », vos photos du même jour les années passées. Tout se fait sur l’iPhone, aucun compte.',
                en: 'Photo library sorting and cleanup for iPhone: duplicates, similar and blurry photos, screenshots, heavy videos, and “On This Day”, your photos from the same day in past years. Everything happens on the iPhone, no account.'
            },
            chips: {
                fr: ['Gratuite', 'Sans compte', 'Analyse sur l’iPhone'],
                en: ['Free', 'No account', 'Analysis on the iPhone']
            },
            features: {
                fr: [
                    'Doublons, photos similaires et rafales (Netta garde la meilleure), photos floues, captures d’écran et vidéos lourdes : tout ce qui encombre la photothèque est repéré.',
                    '« Ce jour-là » : les photos prises le même jour les années passées, classées par année, à garder ou à supprimer.',
                    'Le tri du jour par glissement : à gauche la corbeille, à droite on garde.',
                    'La corbeille de Netta se relit avant toute suppression ; iOS demande ensuite confirmation et les éléments restent 30 jours dans « Supprimés récemment ».',
                    'Widget Ce jour-là et raccourcis Siri.',
                    'Toute l’analyse se fait sur l’iPhone : aucune photo envoyée, aucun compte, aucun serveur.'
                ],
                en: [
                    'Duplicates, similar photos and bursts (Netta keeps the best one), blurry photos, screenshots and heavy videos: everything cluttering your library is spotted.',
                    '“On This Day”: the photos taken on the same day in past years, grouped by year, to keep or delete.',
                    'Daily sorting by swiping: left for the trash, right to keep.',
                    'Netta’s trash is reviewed before anything is deleted; iOS then asks for confirmation and items stay 30 days in “Recently Deleted”.',
                    'An On This Day widget and Siri shortcuts.',
                    'All analysis happens on the iPhone: no photo sent, no account, no server.'
                ]
            },
            sources: { fr: 'Aucune source de données externe : Netta analyse vos photos sur l’iPhone et ne communique avec aucun serveur du développeur. Photos, vignettes et décisions restent sur l’appareil.', en: 'No external data source: Netta analyzes your photos on the iPhone and talks to no server of the developer. Photos, thumbnails and decisions stay on the device.' },
            business: { fr: 'Gratuite, toutes les fonctions comprises, financée par la publicité (une bannière discrète, jamais pendant le tri). Abonnement annuel facultatif « Sans pub » à 4,99 € par an, géré par StoreKit et votre compte Apple.', en: 'Free, every feature included, funded by advertising (a discreet banner, never while sorting). Optional yearly “Ad-Free” subscription at €4.99 per year, handled by StoreKit and your Apple account.' }
        },
        mactuner: {
            name: 'MacTuner', platform: 'mac', accent: '#8eb8ff',
            store: GITHUB_MACTUNER,
            tag: { fr: 'Centre de contrôle Mac', en: 'Mac control center' },
            promo: { fr: 'Le matériel en temps réel, 34 réglages système réversibles, nettoyage et ventilation.', en: 'Hardware in real time, 34 reversible system tweaks, cleanup and fan control.' },
            desc: {
                fr: 'Application macOS libre : tableau de bord temps réel, réglages système réversibles, nettoyage, désinstallation sans résidu, maintenance et contrôle du ventilateur.',
                en: 'Free macOS app: real time dashboard, reversible system tweaks, cleanup, residue free uninstall, maintenance and fan control.'
            },
            features: {
                fr: ['Tableau de bord : CPU par cœur, mémoire, disque, réseau, température, batterie et ventilation en temps réel.', '34 réglages système désactivables et 100 % réversibles : Siri, Apple Intelligence, télémétrie, iCloud…', 'Nettoyage sur 34 catégories et désinstallation sans résidu, protégées par un garde-fou central.', 'Contrôle du ventilateur borné au min/max constructeur, presets et réapplication au démarrage.'],
                en: ['Dashboard: per core CPU, memory, disk, network, temperature, battery and fans in real time.', '34 fully reversible system tweaks: Siri, Apple Intelligence, telemetry, iCloud…', 'Cleanup across 34 categories and residue free uninstall, protected by a central safety guard.', 'Fan control capped to maker min/max, presets and reapply at startup.']
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
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seule la publicité utilise le réseau.', en: 'No external data: the islands, levels, music and texts are built into the game, which plays offline. Only advertising uses the network.' },
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
            shotTops: ['#feaf46', '#794bfd', '#3e83fc', '#546ff2', '#582c9c', '#2b86ff', '#be51ed', '#ff893d'],
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
            sources: { fr: 'Aucune donnée externe : la maison, le jardin, les aliments, les looks, les mini-jeux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Les rappels sont programmés sur l’appareil, sans serveur.', en: 'No external data: the house, garden, foods, looks, mini-games, music and texts are built into the game, which plays offline. Reminders are scheduled on the device, with no server.' },
            business: { fr: 'Jeu 100 % gratuit, financé par la publicité Google AdMob : vidéos facultatives pour un coup de pouce, 12 par jour au plus, et courte publicité possible après un mini-jeu. Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free game, funded by Google AdMob ads: optional videos for a small boost, 12 a day at most, and a short ad that may appear after a mini-game. Offline, optional videos are disabled and give no reward. No in-app purchases, no payment card data in the app.' },
            promo: {
                fr: 'Gloup emménage chez vous. Nourrissez-le, lavez-le, couchez-le et regardez-le grandir.',
                en: 'Gloup moves in with you. Feed him, bathe him, tuck him in and watch him grow.'
            },
            stats: {
                fr: [['60', 'niveaux, de bébé à adulte'], ['9', 'mini-jeux'], ['33', 'aliments'], ['45', 'langues']],
                en: [['60', 'levels, from baby to adult'], ['9', 'mini-games'], ['33', 'foods'], ['45', 'languages']]
            },
            shotTops: ['#6cbfff', '#feb045', '#7bd4ff', '#674acc', '#8add69', '#fe8ec8', '#fb87d9', '#39c06c'],
            storeShots: {
                fr: ['La maison et son jardin', 'La cuisine, un gâteau pour Gloup', 'Le bain moussant', 'Pyjama, doudou et au lit', 'Le potager à cultiver', 'De bébé à adulte', 'La garde-robe', 'Neuf mini-jeux'],
                en: ['The house and its garden', 'The kitchen, a cake for Gloup', 'The bubble bath', 'Pajamas, teddy and bedtime', 'The vegetable patch to grow', 'From baby to adult', 'The wardrobe', 'Nine mini-games']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CF). Un jeu sans fiche reprend `store: ''` : pastille « Bientôt
           disponible » et, dans le premier écran et la section des jeux, « Bientôt sur l'App Store ». Les captures
           (`assets/img/shots/chromafight-*`, issues de `Docs/ChromaFight/Screenshots`, iPhone et iPad) se régénèrent
           par `Outils/Parc/Marque/CapturesSite.mjs`, mêmes noms, en recalant `shotTops` et `storeShots`. */
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
                    'Onze îles et 105 niveaux, de la cuisine à la base lunaire, puis une île secrète. Chacune a ses quatre Grisons, un mini-boss au niveau 5 et un boss au niveau 10.',
                    'Onze amis à débloquer, un par île : chacun donne à Gloup un objet de départ, une forme de ventre et un pouvoir. Un atelier de huit améliorations rend Gloup plus fort au fil des parties.',
                    'Des coffres sur la barre des vagues et un coffre à la fin de chaque île, des quêtes du jour et de la semaine, des missions, un bestiaire de 44 Grisons, une piste de progression gratuite et un cadeau chaque jour.',
                    'Aucune pub pendant un niveau : les vidéos sont facultatives, et le moindre achat, comme « Sans pub », supprime la courte publicité entre deux niveaux. À chaque île, une offre d’île facultative, seulement dans la Boutique.',
                    '45 langues, iPhone et iPad, portrait et paysage, qualité graphique réglée automatiquement selon l’appareil. Le jeu se joue hors connexion. Sans compte : la progression reste sur l’appareil et dans votre iCloud, jamais chez l’éditeur.'
                ],
                en: [
                    'Gloup’s tummy is a grid: drag objects to arrange them. Each time one recharges, Gloup spits it at the Greylings, and you can rearrange mid-fight.',
                    'Two identical objects dragged onto each other merge, over four levels. Three objects of the same color that touch form a chord, five a grand chord: eight colors in play.',
                    'Eleven islands and 105 levels, from the kitchen to the moon base, then a secret island. Each has its four Greylings, a mini-boss on level 5 and a boss on level 10.',
                    'Eleven friends to unlock, one per island: each gives Gloup a starting object, a tummy shape and a power. A workshop of eight upgrades makes Gloup stronger over time.',
                    'Chests on the wave bar and a chest at the end of every island, daily and weekly quests, missions, a bestiary of 44 Greylings, a free progress track and a gift every day.',
                    'No ads during a level: videos are optional, and any purchase, such as “No ads”, removes the short ad between two levels. On each island, an optional island offer, only in the Shop.',
                    '45 languages, iPhone and iPad, portrait and landscape, with graphics quality adjusting automatically to the device. The game plays offline. No account: progress stays on the device and in your iCloud, never with the publisher.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les objets, les Grisons, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, les achats (App Store) et la copie iCloud de la sauvegarde utilisent le réseau.', en: 'No external data: the islands, levels, objects, Greylings, music and texts are built into the game, which plays offline. Only advertising, purchases (App Store) and the iCloud copy of the save use the network.' },
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
            shotTops: ['#6cbfff', '#fecf47', '#8add69', '#fc7677', '#674acc', '#fb87d9', '#7bd4ff', '#feb045'],
            storeShots: {
                fr: ['L’accueil et la carte de l’île aux pirates', 'Gloup recrache les objets de son ventre', 'Fusionne et accorde les couleurs', 'Des boss géants', 'Onze îles à libérer', 'Onze amis à tes côtés', '44 Grisons à découvrir', 'Améliore ton atelier'],
                en: ['The home screen and the Pirate Island map', 'Gloup spits the objects from his tummy', 'Merge and match colors', 'Giant bosses', 'Eleven islands to free', 'Eleven friends by your side', '44 Greylings to discover', 'Upgrade your workshop']
            }
        },
        /* En vente depuis octobre 2026 (STORE_CT). Captures App Store (`assets/img/shots/chromatraque-*`, iPhone et
           iPad), mêmes noms que ChromaFight, avec `shotTops` et `storeShots`. Achats intégrés facultatifs et énergie,
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
            shotTops: ['#8bceff', '#fecb57', '#ae87fe', '#7bdd87', '#fd8697', '#fdacdd', '#99e1ff', '#fed565'],
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
            shotTops: ['#8add87', '#fed565', '#feaf75', '#99e1ff', '#fecb57', '#8bceff', '#fdacdd', '#ae87fe'],
            storeShots: {
                fr: ['Ta ferme en couleurs', 'Sème et récolte', 'Les ateliers', 'Des animaux adorables', 'Les commandes', 'Le bateau', 'Décore ta ferme', 'L’accueil de ChromaFerme'],
                en: ['Your farm in color', 'Sow and harvest', 'The workshops', 'Adorable animals', 'The orders', 'The boat', 'Decorate your farm', 'The ChromaFerme home screen']
            }
        },
        /* Pas encore sur l'App Store (`store: ''`). Jeu en paysage seul (`paysage`) : captures App Store
           `assets/img/shots/chromaciel-*` (iPhone 2868 x 1320 par `PAYSAGE=1`, iPad, `Outils/Parc/Marque/CapturesSite.mjs`)
           montrées dans le cadre large de la galerie ; l'icône en grand tient lieu de téléphone dans l'en-tête et
           d'éventail dans la tuile (`promo-solo`), sans `shotTops`. Faits fournis par le titulaire le 22 octobre 2026. */
        chromaciel: {
            name: 'ChromaCiel', platform: 'ios', game: true, paysage: true, accent: '#3f9be0', accent2: '#ff9f43',
            store: '',
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
                    'Gratuit, avec des achats intégrés facultatifs. Aucune bannière ni publicité intercalée : seules des vidéos récompensées facultatives sont proposées. Rien de ce qui s’achète ne donne de niveau, de statistique, d’objet, de pièces ni d’expérience.',
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
                    'Free, with optional in-app purchases. No banners and no interstitial ads: only optional rewarded videos are offered. Nothing you can buy gives a level, a stat, an item, coins or experience.',
                    'iPhone and iPad, in landscape, with graphics quality adjusting automatically to the device. The game plays offline. No account: the save stays on the device and in your iCloud.'
                ]
            },
            sources: { fr: 'Aucun compte : la sauvegarde reste sur l’appareil et dans votre iCloud. Le jeu se joue hors connexion. Le réseau ne sert que pour la publicité, les achats (App Store), Game Center et iCloud.', en: 'No account: the save stays on the device and in your iCloud. The game plays offline. The network is only used for advertising, purchases (App Store), Game Center and iCloud.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos récompensées facultatives seulement : un coffre bonus de donjon, 2 par jour, et un sachet de matériaux, 1 par jour ; aucune bannière ni publicité intercalée) et par des achats intégrés facultatifs : Pack de départ, « Sans vidéos » (saute le visionnage, mêmes récompenses et mêmes limites), Garde-robe Arc-en-ciel (cinq apparences) et gouttes de Prisme en quatre paliers (apparences, places de sac, coffret de matériaux limité à deux par semaine). Hors connexion, les vidéos facultatives sont désactivées et ne rapportent rien. Rien n’achète de niveau, de statistique, d’objet, de pièces ni d’expérience.', en: 'Free game, funded by Google AdMob ads (optional rewarded videos only: a bonus dungeon chest, 2 a day, and a materials pouch, 1 a day; no banners and no interstitial ads) and by optional in-app purchases: Starter Pack, “No videos” (skips the watching, same rewards and same limits), Rainbow Wardrobe (five looks) and Prism drops in four tiers (looks, bag slots, a materials chest limited to two per week). Offline, optional videos are disabled and give no reward. Nothing buys a level, a stat, an item, coins or experience.' },
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
    var NOMS_APPAREILS = { iphone: 'iPhone', ipad: 'iPad', tv: 'Apple TV' };
    var IOS_ORDER = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance', 'dvffrance', 'telora', 'telzo', 'netta'];
    var FRANCE_ORDER = IOS_ORDER.slice(0, 5);
    var SALON_ORDER = IOS_ORDER.slice(5, 7);
    var PHOTO_ORDER = IOS_ORDER.slice(7);
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
        onIPhone: { fr: 'iPhone · iOS 18 ou plus', en: 'iPhone · iOS 18 or later' },
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
            en: 'Each app has its own support page: frequent questions, known limits and what to do next.'
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
            fr: 'Telora lit vos films, séries et chaînes depuis vos propres sources, jusque sur l’Apple TV. Telzo fait de l’iPhone une télécommande universelle par Wi-Fi.',
            en: 'Telora plays your movies, shows and channels from your own sources, all the way to Apple TV. Telzo turns the iPhone into a universal Wi-Fi remote.'
        },
        photoEyebrow: { fr: 'iPhone et iPad', en: 'iPhone and iPad' },
        photoTitle: { fr: 'Pour vos photos.', en: 'For your photos.' },
        photoLead: {
            fr: 'Netta trie et nettoie la photothèque de l’iPhone : doublons, photos floues, captures d’écran et vidéos lourdes, et « Ce jour-là », les photos du même jour les années passées. Tout se fait sur l’iPhone.',
            en: 'Netta sorts and cleans the iPhone photo library: duplicates, blurry photos, screenshots and heavy videos, and “On This Day”, the photos from the same day in past years. Everything happens on the iPhone.'
        },
        onGame: { fr: 'Jeu · iPhone et iPad', en: 'Game · iPhone and iPad' },
        /* Textes sans nombre d'apps : ils restent justes quand une app ou un jeu s'ajoute. */
        heroTitleHTML: {
            fr: 'Des jeux, des apps, <br><span class="grad">un seul principe.</span>',
            en: 'Games and apps, <br><span class="grad">one principle.</span>'
        },
        heroShort: {
            fr: 'Des jeux pour iPhone et iPad avec Gloup, la petite créature aux grands yeux. Des applications du quotidien, natives, gratuites et sans compte. Et des utilitaires libres pour Mac.',
            en: 'Games for iPhone and iPad starring Gloup, the little creature with big eyes. Everyday apps, native, free and with no account. Plus free utilities for Mac.'
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
        faqEyebrow: { fr: 'Questions fréquentes', en: 'Frequent questions' },
        faqTitle: { fr: 'Tout ce qu’il faut savoir.', en: 'Everything you need to know.' },
        /* Chaque réponse reprend un fait déjà écrit ailleurs sur le site : rien
           n'est affirmé ici qui ne soit dit sur la page d'une application. */
        faq: {
            fr: [
                ['Les applications sont-elles gratuites ?', 'Oui. Les applications iPhone et les jeux se téléchargent gratuitement et sont financés par une publicité discrète. ChromaFight, ChromaTraque, ChromaFerme et ChromaCiel sont gratuits eux aussi, avec des achats intégrés facultatifs. CarbuFrance, IRVEFrance, ToiletteFrance et DefibFrance proposent un abonnement facultatif « Sans pub » (0,99 € par mois ou 4,99 € par an) qui retire toute publicité ; une vidéo facultative y offre aussi 6 h sans publicité. Telzo propose le sien à 0,99 € par mois ou 4,99 € par an. Les deux utilitaires Mac sont libres et open source, sans publicité ni achat. Telora est sans publicité et s’utilise avec l’abonnement Telora+, au mois ou à l’année, après un essai gratuit de 7 jours.'],
                ['Faut-il créer un compte ?', 'Non. Aucune application ne demande de compte ni d’inscription. Favoris et réglages restent sur votre appareil.'],
                ['Fonctionnent-elles sans connexion ?', 'Les applications de données publiques les mettent en cache pour rester utilisables hors connexion ; Telora lit vos propres sources et a donc besoin du réseau. Les jeux se jouent hors connexion ; seuls la publicité et, pour ChromaFight, ChromaTraque, ChromaFerme et ChromaCiel, les achats et la copie iCloud de la sauvegarde utilisent le réseau.'],
                ['Sur quels appareils ?', 'iPhone et iPad sous iOS 18 ou plus pour les applications et les jeux. Telora aussi sur Apple TV (tvOS 18 ou plus). Mac Apple Silicon sous macOS 26 ou 27 pour MacTuner et DNSTuner.'],
                ['Où trouver de l’aide ?', 'Chaque application a sa page d’assistance. Je réponds moi-même à chaque message, en général sous 24 à 48 heures.']
            ],
            en: [
                ['Are the apps free?', 'Yes. The iPhone apps and the games are free to download and funded by discreet advertising. ChromaFight, ChromaTraque, ChromaFerme and ChromaCiel are free too, with optional in-app purchases. CarbuFrance, IRVEFrance, ToiletteFrance and DefibFrance offer an optional “Ad-Free” subscription (€0.99 per month or €4.99 per year) that removes every ad; an optional video also gives 6 hours ad-free. Telzo offers its own at €0.99 per month or €4.99 per year. The two Mac utilities are free and open source, with no ads and no purchases. Telora has no ads and is used with the Telora+ subscription, monthly or yearly, after a 7-day free trial.'],
                ['Do I need an account?', 'No. None of the apps asks for an account or a sign-up. Favorites and settings stay on your device.'],
                ['Do they work offline?', 'The public data apps cache it so they keep working offline; Telora plays your own sources and therefore needs the network. The games play offline; only advertising and, for ChromaFight, ChromaTraque, ChromaFerme and ChromaCiel, purchases and the iCloud copy of the save use the network.'],
                ['Which devices?', 'iPhone and iPad on iOS 18 or later for the apps and games. Telora on Apple TV too (tvOS 18 or later). Apple Silicon Macs on macOS 26 or 27 for MacTuner and DNSTuner.'],
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
        }).replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
    }

    function svg(corps, classe) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"' +
            ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
            (classe ? ' class="' + classe + '"' : '') + '>' + corps + '</svg>';
    }

    var CHEVRON = svg('<path d="m9 5 7 7-7 7"/>');
    var GLOBE = svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.2-3.3-8.5s1.1-6.1 3.3-8.5Z"/>', 'btn-glyph');

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

    function plateforme(app) {
        return pick(app.on || (app.platform === 'mac' ? V.onMac : (app.game ? V.onGame : V.onIPhone)));
    }

    function pastilleBientot(texte, petit) {
        return '<span class="btn btn-quiet' + (petit ? ' is-small' : '') + '" aria-disabled="true">' + esc(texte) + '</span>';
    }

    /* Le site de l'application, à côté du badge de l'App Store. Il mène à la même
       donnée sans rien installer : c'est une porte d'entrée, pas un doublon. */
    function boutonWeb(cle) {
        var url = SITES_WEB[cle];
        if (!url) { return ''; }
        return '<a class="btn btn-secondary" href="' + url + '" target="_blank" rel="noopener">' +
            GLOBE + esc(pick(V.webVersion)) + '</a>';
    }

    /* Le badge officiel d'Apple (Marketing Resources), jamais redessiné : noir
       sur fond clair, blanc sur fond sombre, dans la langue de la page. Hauteur
       48 pixels, 40 dans les tuiles et le pied, minimum fixé par ses règles
       d'usage. */
    var BADGE = { fr: ['app-store-fr', 152, 127], en: ['app-store-en', 144, 120] };

    function badgeAppStore(url, texte, petit) {
        var b = BADGE[lang] || BADGE.fr;
        var img = '<img src="./assets/img/' + b[0] + '.svg" width="' + (petit ? b[2] : b[1]) +
            '" height="' + (petit ? 40 : 48) + '" decoding="async" alt="' + esc(texte) + '">';
        return '<a class="store-badge' + (petit ? ' is-small' : '') + '" href="' + url + '" target="_blank" rel="noopener">' +
            '<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/img/' + b[0] + '-white.svg">' +
                img + '</picture></a>';
    }

    /* `cache` complète le libellé pour les lecteurs d'écran et les moteurs : quinze
       « En savoir plus » identiques ne disent pas où ils mènent. */
    function lienPlus(href, texte, cache) {
        return '<a class="link-more" href="' + href + '">' + esc(texte) +
            (cache ? '<span class="sr-only"> ' + esc(cache) + '</span>' : '') + CHEVRON + '</a>';
    }

    /*
     * Panneau des utilitaires Mac : sans capture d'écran, la fenêtre montre ce que
     * l'application affiche réellement à l'ouverture, ses chiffres.
     */
    function fenetreMac(cle, charger) {
        var app = APPS[cle];
        var lignes = pick(MAC_PANNEAU[cle]).map(function (l) {
            return '<div class="macwin-row"><span>' + esc(l[0]) + '</span><b>' + esc(l[1]) + '</b></div>';
        }).join('');
        return '<div class="macwin"><div class="macwin-bar" aria-hidden="true">' +
            '<i></i><i></i><i></i><span class="macwin-title">' + esc(app.name) + '</span></div>' +
            '<div class="macwin-body"><div class="macwin-head">' +
            picture('./assets/img/' + cle + '.png', ' width="60" height="60" alt=""' + (charger ? '' : ' loading="lazy"') + ' decoding="async"') +
            '<div><b>' + esc(app.name) + '</b><span>' + esc(pick(app.tag)) + '</span></div></div>' +
            '<div class="macwin-rows">' + lignes + '</div></div></div>';
    }


    function carte(contenu, classe) {
        return '<article class="card' + (classe ? ' ' + classe : '') + '">' + contenu + '</article>';
    }

    function icones(cles, taille) {
        return cles.map(function (k) {
            return picture('./assets/img/' + k + '.png', ' width="' + taille + '" height="' + taille + '" alt="" decoding="async"');
        }).join('');
    }

    /* ---------------------------------------------------------------------
       Barre de navigation et menu
       --------------------------------------------------------------------- */

    var FAMILLES = [
        ['jeux', V.navGames, GAME_ORDER],
        ['france', V.navFrance, FRANCE_ORDER],
        ['salon', V.navSalon, SALON_ORDER],
        ['photo', V.navPhoto, PHOTO_ORDER],
        ['mac', T.navMac, MAC_ORDER]
    ];

    function navHTML(page) {
        var entrees = FAMILLES.map(function (f) { return ['./index.html#' + f[0], pick(f[1]), false]; }).concat([
            ['./about.html', pick(T.navAbout), page === 'v2-about'],
            ['./contact.html', pick(T.navContact), page === 'v2-contact']
        ]);
        var menu = entrees.map(function (e, i) {
            return '<a href="' + withLang(e[0]) + '" style="--i:' + i + '">' + esc(e[1]) + '</a>';
        }).join('') +
            '<small>' + esc(pick(V.menuApps)) + '</small>' +
            '<div class="nav-menu-apps">' + GAME_ORDER.concat(IOS_ORDER, MAC_ORDER).map(function (k, i) {
                return '<a class="nav-menu-app" href="' + withLang('./' + k + '.html') + '" style="--i:' + (i + entrees.length) + '">' +
                    icones([k], 28) + esc(APPS[k].name) + '</a>';
            }).join('') + '</div>';

        return '<a class="skip-link" href="#main">' + esc(pick(T.skipLink)) + '</a>' +
            '<header class="nav" id="nav"><div class="nav-inner">' +
            '<a class="nav-brand" href="' + withLang('./index.html') + '">' +
            '<img src="./assets/img/favicon.svg" width="24" height="24" alt="" decoding="async">' +
            '<span>Rodolphe Vandaele</span></a>' +
            '<nav class="nav-links" aria-label="Navigation">' +
            entrees.map(function (e) {
                return '<a href="' + withLang(e[0]) + '"' + (e[2] ? ' aria-current="page"' : '') + '>' + esc(e[1]) + '</a>';
            }).join('') + '</nav>' +
            '<span class="lang-switch">' +
            '<a href="?lang=fr" data-lang="fr" lang="fr" aria-current="' + (lang === 'fr') + '">FR</a>' +
            '<a href="?lang=en" data-lang="en" lang="en" aria-current="' + (lang === 'en') + '">EN</a>' +
            '</span>' +
            '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"' +
            ' aria-label="' + esc(pick(V.menuOpen)) + '"><span></span><span></span></button>' +
            '</div></header>' +
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

    var TOUTES = GAME_ORDER.concat(IOS_ORDER, MAC_ORDER);
    var CHECK = svg('<path d="m5 12.5 4.2 4.2L19 7"/>', 'check');
    var LOUPE = svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>', 'loupe');

    var FAM_TEXTES = {
        jeux: [V.newEyebrow, V.newTitle, V.gamesLead],
        france: [V.onIPhone, T.iosTitle, V.franceLead],
        salon: [V.salonEyebrow, V.salonTitle, V.salonLead],
        photo: [V.photoEyebrow, V.photoTitle, V.photoLead],
        mac: [V.onMac, T.macTitle, T.macLead]
    };

    /* Les produits qui ont des pages légales (les utilitaires Mac n'en ont pas). */
    var AVEC_LEGAL = GAME_ORDER.concat(IOS_ORDER);

    function familleDe(cle) {
        for (var i = 0; i < FAMILLES.length; i++) { if (FAMILLES[i][2].indexOf(cle) !== -1) { return FAMILLES[i]; } }
        return FAMILLES[0];
    }

    /* L'icône d'un produit porte le même nom de transition sur sa fiche du catalogue et en tête de sa page :
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

    /* Un visuel posé à plat : le visuel App Store porte déjà son titre et son appareil. */
    function visuel(cle, n, alt, paresseux, sizes, appareil, classe) {
        return '<div class="vis' + (classe ? ' ' + classe : '') + (appareil && appareil !== 'iphone' ? ' is-' + appareil : '') + '">' +
            captureJeu(cle, n, alt, paresseux, sizes, appareil) + '</div>';
    }

    function faqHTML() {
        return '<div class="faq">' + pick(V.faq).map(function (q) {
            return '<details><summary>' + esc(q[0]) + '<span class="faq-sign" aria-hidden="true"></span></summary>' +
                '<p>' + esc(q[1]) + '</p></details>';
        }).join('') + '</div>';
    }

    /* Colonnes de la grille de captures sur grand écran : un nombre qui divise le compte, sinon le premier choix.
       Portrait : 8 visuels en 4 colonnes, 5 en 5, 6 en 6 ; paysage : 6 en 3, 8 en 4. */
    function colonnes(n, choix) {
        for (var i = 0; i < choix.length; i++) { if (n % choix[i] === 0) { return choix[i]; } }
        return choix[0];
    }

    /* Les captures en grille de cartes, une grille par appareil et le sélecteur. Les utilitaires Mac, sans captures,
       montrent leur fenêtre dans une carte de même format. */
    function galerie(cle, titre) {
        var app = APPS[cle];
        if (!app.storeShots && app.platform === 'ios') { return ''; }
        if (!app.storeShots) {
            return '<section class="band sec-shots" id="captures"><div class="wrap"><div class="rail-head"><h2>' + esc(titre) + '</h2></div>' +
                '<div class="shots is-wide" style="--cols:2"><div class="shot-card is-mac">' + fenetreMac(cle, true) + '</div></div></div></section>';
        }
        var legendes = pick(app.storeShots);
        var appareils = app.devices || (app.game ? ['iphone', 'ipad'] : ['iphone']);
        var formats = {
            iphone: [app.paysage ? 'paysage' : 'iphone', app.paysage ? '(max-width: 700px) 92vw, 440px' : '(max-width: 700px) 46vw, 300px'],
            ipad: [app.ipadPortrait ? 'ipadv' : 'ipad', app.ipadPortrait ? '(max-width: 700px) 46vw, 300px' : '(max-width: 700px) 92vw, 440px'],
            tv: ['tv', '(max-width: 700px) 92vw, 440px']
        };
        var grille = function (a) {
            var large = formats[a][0] === 'paysage' || formats[a][0] === 'ipad' || a === 'tv';
            var n = colonnes(legendes.length, large ? [3, 4, 2] : [4, 5, 6, 3]);
            return '<div class="shots' + (large ? ' is-wide' : '') + '" data-device="' + a + '" style="--cols:' + n + '"' + (a !== 'iphone' ? ' hidden' : '') + '>' +
                legendes.map(function (legende, i) {
                    return '<figure class="shot-card">' + visuel(cle, i + 1, app.name + ', ' + legende, true, formats[a][1], formats[a][0]) +
                        '<figcaption>' + esc(legende) + '</figcaption></figure>';
                }).join('') + '</div>';
        };
        return '<section class="band sec-shots" id="captures"><div class="wrap">' +
            '<div class="rail-head"><h2>' + esc(titre) + '</h2>' +
            (appareils.length > 1 ? '<div class="segmented" role="group" aria-label="' + esc(pick(V.deviceLabel)) + '">' +
                appareils.map(function (a, i) {
                    return '<button type="button" data-device="' + a + '" aria-pressed="' + (i === 0) + '">' + NOMS_APPAREILS[a] + '</button>';
                }).join('') + '</div>' : '') +
            '</div>' + appareils.map(grille).join('') + '</div></section>';
    }

    function statsHTML(app) {
        if (!app.stats) { return ''; }
        return '<dl class="p-stats">' + pick(app.stats).map(function (st) {
            return '<div class="stat"><dt>' + esc(st[1]) + '</dt><dd data-count="' + esc(st[0]) + '">' + esc(st[0]) + '</dd></div>';
        }).join('') + '</dl>';
    }

    /* La sous-barre d'une fiche ou d'une page légale : le nom, les sections, l'appel. */
    function sousBarre(cle, sections) {
        var app = APPS[cle];
        var mac = app.platform === 'mac';
        var cta = !app.store ? '' : '<a class="subnav-cta" href="' + app.store + '" target="_blank" rel="noopener"' +
            (mac ? '>' + esc(pick(V.openSource)) : ' aria-label="' + esc(pick(V.getAria).replace('{app}', app.name)) + '">' + esc(pick(V.get))) + '</a>';
        return '<nav class="subnav" aria-label="' + esc(app.name) + '"><div class="subnav-inner">' +
            '<a class="subnav-title" href="' + withLang('./' + cle + '.html') + '">' + icones([cle], 24) + esc(app.name) + '</a>' +
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

    /* L'identité d'une fiche : icône et nom. `titre` remplace le nom par celui d'une page légale. */
    function identite(cle, titre, sur) {
        var app = APPS[cle];
        var nom = '<h1>' + esc(titre || app.name) + '</h1>';
        return '<div class="p-id">' + picture('./assets/img/' + cle + '.png', ' class="p-icon" width="128" height="128" alt="" decoding="async"' + vt(cle)) +
            '<div><p class="eyebrow">' + esc(sur || pick(app.tag)) + '</p>' + nom + '</div></div>';
    }

    /* ---------------------------------------------------------------------
       Accueil : le catalogue
       --------------------------------------------------------------------- */

    /* La tuile du catalogue : l'icône sur un fond de sa couleur, le nom et une ligne, toute la tuile en lien. Accueil,
       produits de la même famille, assistance par application. `ligne` et `href` remplacent le genre et la fiche ;
       `rang` : les six premières tuiles de l'accueil sont visibles dès l'arrivée et ne sont pas différées. */
    function tuile(cle, ligne, href, rang) {
        var app = APPS[cle];
        var f = familleDe(cle);
        var externe = href && href.indexOf('http') === 0;
        var cherche = (app.name + ' ' + pick(app.tag) + ' ' + pick(app.promo) + ' ' + pick(f[1])).toLowerCase();
        return '<article class="tile is-' + f[0] + '" data-fam="' + f[0] + '" data-search="' + esc(cherche) + '"' + styleAccent(app) + '>' +
            '<div class="tile-art">' + picture('./assets/img/' + cle + '.png', ' width="96" height="96" alt=""' +
                (rang < 6 ? '' : ' loading="lazy"') + ' decoding="async"' + (externe ? '' : vt(cle))) +
            (app.store ? '' : '<span class="tile-flag">' + esc(lang === 'fr' ? 'Bientôt' : 'Soon') + '</span>') + '</div>' +
            '<div class="tile-body"><h3><a class="tile-link" href="' + (href || withLang('./' + cle + '.html')) + '"' +
            (externe ? ' target="_blank" rel="noopener"' : '') + '>' + esc(app.name) + '</a></h3>' +
            '<p>' + esc(ligne || pick(app.tag)) + '</p></div></article>';
    }

    function tuiles(cles, ligne, lien) {
        return '<div class="tiles">' + cles.map(function (k, i) { return tuile(k, ligne && ligne(k), lien && lien(k), i); }).join('') + '</div>';
    }

    function rayon(f, n) {
        var t = FAM_TEXTES[f[0]];
        return '<section class="shelf" id="' + f[0] + '" data-fam="' + f[0] + '" aria-labelledby="' + f[0] + '-titre">' +
            '<header class="shelf-head is-stacked"><div><p class="eyebrow"><i class="dot is-' + f[0] + '"></i>' + esc(pick(t[0])) + '</p>' +
            '<h2 id="' + f[0] + '-titre">' + esc(pick(f[1])) + ' <span class="count">' + f[2].length + '</span></h2></div>' +
            '<p class="shelf-lead"><b>' + esc(pick(t[1])) + '</b> ' + esc(pick(t[2])) + '</p></header>' +
            '<div class="tiles">' + f[2].map(function (k, i) { return tuile(k, null, null, n ? 9 : i); }).join('') + '</div></section>';
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
            if (sauf !== 'support') { c.push(carteLien(l(lienLegal(cle, 'support')), 'mail', pick(T.supportLink), fr ? 'Questions fréquentes et contact' : 'Frequent questions and contact')); }
            if (sauf !== 'privacy') { c.push(carteLien(l(lienLegal(cle, 'privacy')), 'shield', pick(T.privacyLink), fr ? 'Données traitées et vos droits' : 'Data processed and your rights')); }
        }
        if (SITES_WEB[cle] && !sauf) { c.push(carteLien(SITES_WEB[cle], 'globe', pick(V.webVersion), SITES_WEB[cle].replace('https://', ''), true)); }
        if (app.platform === 'mac' && !sauf) { c.push(carteLien(app.store, 'book', pick(V.openSource), pick(T.macStore), true)); }
        c.push(carteLien(withLang('./about.html') + '#mentions', 'book', pick(T.legalTitleSite), fr ? 'Éditeur, hébergement, contenus' : 'Publisher, hosting, content'));
        return '<div class="link-cards">' + c.join('') + '</div>';
    }

    /* Le filtre par famille et la recherche. La famille choisie suit l'ancre de l'adresse (#jeux...) : un lien
       de la barre ou du pied ouvre le catalogue sur elle. */
    function attacheFiltres() {
        var barre = document.querySelector('.filters');
        if (!barre) { return; }
        var boutons = barre.querySelectorAll('button[data-fam]');
        var champ = document.getElementById('recherche');
        var bilan = document.getElementById('bilan');
        var vide = document.getElementById('catalogue-vide');
        function appliquer() {
            var fam = barre.querySelector('button[aria-pressed="true"]').getAttribute('data-fam');
            var q = (champ.value || '').trim().toLowerCase();
            var n = 0;
            document.querySelectorAll('.shelf').forEach(function (s) {
                var vus = 0;
                s.querySelectorAll('.tile').forEach(function (c) {
                    var ok = (fam === 'tout' || c.getAttribute('data-fam') === fam) && (!q || c.getAttribute('data-search').indexOf(q) !== -1);
                    c.hidden = !ok;
                    if (ok) { vus++; }
                });
                s.hidden = !vus;
                n += vus;
            });
            vide.hidden = n > 0;
            bilan.textContent = n + (lang === 'fr' ? (n > 1 ? ' applications' : ' application') : (n > 1 ? ' apps' : ' app'));
        }
        function choisir(fam) {
            boutons.forEach(function (o) { o.setAttribute('aria-pressed', String(o.getAttribute('data-fam') === fam)); });
            appliquer();
        }
        boutons.forEach(function (b) {
            b.addEventListener('click', function () {
                var fam = b.getAttribute('data-fam');
                choisir(fam);
                history.replaceState(null, '', fam === 'tout' ? location.pathname + location.search : '#' + fam);
            });
        });
        champ.addEventListener('input', appliquer);
        var ancre = location.hash.slice(1);
        if (FAM_TEXTES[ancre]) { choisir(ancre); }
    }

    /* Les quinze icônes, chacune vers sa fiche : en-tête de la page À propos. */
    function mosaique(classe, taille) {
        return '<nav class="' + classe + '" aria-label="' + esc(pick(V.allApps)) + '"><ul>' + TOUTES.map(function (k) {
            return '<li><a href="' + withLang('./' + k + '.html') + '" title="' + esc(APPS[k].name) + '">' + icones([k], taille) +
                '<span class="sr-only">' + esc(APPS[k].name) + '</span></a></li>';
        }).join('') + '</ul></nav>';
    }

    function renderHome() {
        var intro = '<section class="intro" id="main"><div class="wrap">' +
            '<p class="eyebrow">' + esc(pick(V.heroKicker)) + '</p>' +
            '<h1>' + pick(V.heroTitleHTML).replace(' class="grad"', ' class="hl"').replace('<br>', ' ') + '</h1>' +
            '<p class="intro-lead">' + esc(pick(V.heroShort)) + '</p>' +
            '</div></section>';

        var filtres = '<div class="filters-bar"><div class="wrap filters">' +
            '<div class="chips" role="group" aria-label="' + esc(pick(V.chaptersLabel)) + '">' +
            '<button type="button" data-fam="tout" aria-pressed="true">' + esc(lang === 'fr' ? 'Tout' : 'All') + ' <span>' + TOUTES.length + '</span></button>' +
            FAMILLES.map(function (f) {
                return '<button type="button" data-fam="' + f[0] + '" aria-pressed="false"><i class="dot is-' + f[0] + '"></i>' + esc(pick(f[1])) + ' <span>' + f[2].length + '</span></button>';
            }).join('') + '</div>' +
            '<label class="search">' + LOUPE + '<span class="sr-only">' + esc(lang === 'fr' ? 'Rechercher une application' : 'Search an app') + '</span>' +
            '<input id="recherche" type="search" autocomplete="off" placeholder="' + esc(lang === 'fr' ? 'Rechercher' : 'Search') + '"></label>' +
            '<p class="bilan" id="bilan" aria-live="polite">' + TOUTES.length + (lang === 'fr' ? ' applications' : ' apps') + '</p>' +
            '</div></div>';

        var catalogue = '<div class="wrap catalogue">' + FAMILLES.map(function (f, i) { return rayon(f, i); }).join('') +
            '<p class="empty" id="catalogue-vide" hidden>' + esc(lang === 'fr' ? 'Aucune application ne correspond à cette recherche.' : 'No app matches this search.') + '</p></div>';

        var valeurs = '<section class="band principles"><div class="wrap">' +
            '<header class="shelf-head is-simple"><div><p class="eyebrow">' + esc(pick(T.valuesEyebrow)) + '</p><h2>' + esc(pick(T.valuesTitle)) + '</h2></div></header>' +
            '<div class="cards is-three">' + pick(T.values).map(function (v) {
                return carte(icone(v[0]) + '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p>');
            }).join('') + '</div></div></section>';

        var questions = '<section class="band" aria-labelledby="faq-titre"><div class="wrap faq-grid">' +
            '<header><p class="eyebrow">' + esc(pick(V.faqEyebrow)) + '</p><h2 id="faq-titre">' + esc(pick(V.faqTitle)) + '</h2></header>' +
            faqHTML() + '</div></section>';

        return navHTML('v2-home') + '<main>' + intro + filtres + catalogue + valeurs + questions + boiteContact() + '</main>' + footerHTML();
    }

    function boiteContact() {
        return '<section class="band"><div class="wrap"><div class="contact-box">' +
            '<div><h2>' + esc(pick(V.contactFinalTitle)) + '</h2><p>' + esc(pick(V.contactLead)) + '</p></div>' +
            '<div class="btn-row"><a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(V.contactWrite)) + '</a>' +
            lienPlus(withLang('./about.html'), pick(T.navAbout)) + '</div></div></div></section>';
    }

    /* ---------------------------------------------------------------------
       Page produit : un seul gabarit catalogue
       --------------------------------------------------------------------- */

    /* La boîte de la fiche : téléchargement, faits, chiffres, pages légales. */
    function boiteFiche(cle) {
        var app = APPS[cle];
        var f = familleDe(cle);
        return '<aside class="p-aside" aria-label="' + esc(app.name) + '"><div class="p-box">' +
            '<div class="btn-row">' + appel(cle) + boutonWeb(cle) + '</div>' +
            '<dl class="p-facts"><div><dt>' + esc(lang === 'fr' ? 'Appareils' : 'Devices') + '</dt><dd>' + esc(plateforme(app)) + '</dd></div>' +
            '<div><dt>' + esc(lang === 'fr' ? 'Catégorie' : 'Category') + '</dt><dd>' + esc(pick(f[1])) + '</dd></div></dl>' +
            '<ul class="p-chips">' + faitsDe(app).map(function (x) { return '<li>' + CHECK + esc(x) + '</li>'; }).join('') + '</ul>' +
            statsHTML(app) +
            '</div></aside>';
    }

    function enveloppe(page, contenu) {
        return navHTML(page) + '<main class="fiche">' + contenu + '</main>' + footerHTML();
    }

    function renderApp(cle) {
        var app = APPS[cle];
        var f = familleDe(cle);
        var sections = [['#main', pick(V.subOverview)], ['#fonctions', pick(V.subFeatures)]]
            .concat(app.storeShots || app.platform === 'mac' ? [['#captures', pick(app.storeShots ? V.subShots : T.macPreview)]] : []).concat([['#donnees', pick(V.subData)], ['#aide', lang === 'fr' ? 'Aide' : 'Help']]);

        var tete = '<section class="p-hero" id="main"><div class="wrap p-grid">' +
            '<header class="p-head">' + filAriane(cle, [[null, app.name]]) + identite(cle) +
            '<p class="p-promo">' + esc(pick(app.promo)) + '</p></header>' +
            boiteFiche(cle) + '</div></section>';

        var desc = '<section class="p-sec" id="fonctions"><h2>' + esc(pick(app.game ? V.featuresTitleGame : V.featuresTitle)) + '</h2>' +
            '<p class="p-desc">' + esc(pick(app.desc)) + '</p>' +
            '<ul class="feat-grid" style="--cols:' + colonnes(pick(app.features).length, [3, 4, 2]) + '">' + pick(app.features).map(function (t) { return '<li class="feat">' + CHECK + '<p>' + esc(t) + '</p></li>'; }).join('') + '</ul></section>';

        var donnees = '<section class="p-sec" id="donnees"><h2>' + esc(pick(V.methodTitle)) + '</h2>' +
            '<div class="cards is-two">' + carte(icone('book') + '<h3>' + esc(pick(T.dataSources)) + '</h3><p>' + esc(pick(app.sources)) + '</p>') +
            carte(icone('shield') + '<h3>' + esc(pick(T.dataBusiness)) + '</h3><p>' + esc(pick(app.business)) + '</p>') + '</div></section>';

        var aide = '<section class="p-sec" id="aide"><h2>' + esc(lang === 'fr' ? 'Aide et informations' : 'Help and information') + '</h2>' +
            cartesLiens(cle) + '</section>';

        var voisins = f[2].filter(function (k) { return k !== cle; });
        var memes = !voisins.length ? '' : '<section class="band related"><div class="wrap"><header class="shelf-head is-simple"><div><p class="eyebrow">' + esc(pick(f[1])) + '</p>' +
            '<h2>' + esc(lang === 'fr' ? 'Dans la même famille' : 'In the same family') + '</h2></div>' +
            lienPlus(withLang('./index.html'), pick(V.allApps)) + '</header>' +
            tuiles(voisins) + '</div></section>';

        return enveloppe('v2-app', sousBarre(cle, sections) + tete +
            galerie(cle, pick(app.game ? V.storeShotsTitle : (app.storeShots ? V.shotsTitle : T.macPreview))) +
            '<div class="p-body"><div class="wrap">' + desc + donnees + aide + '</div></div>' + memes);
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

        var tete = '<section class="p-hero is-legal" id="main"><div class="wrap">' +
            '<header class="p-head">' + filAriane(cle, [[withLang('./' + cle + '.html'), app.name], [null, nomPage]]) +
            identite(cle, nomPage, app.name) +
            (sous ? '<p class="p-promo">' + esc(sous.textContent) + '</p>' : '') + langues + '</header></div></section>';

        var pied = '<section class="band legal-next"><div class="wrap">' + cartesLiens(cle, sorte, avecLangue) + '</div></section>';

        root.className = '';
        root.innerHTML = enveloppe('v2-legal', sousBarre(cle, sections) + tete +
            '<div class="p-body legal-body"><div class="wrap" id="legal-texte"></div></div>' + pied);
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

    function introPage(sur, titre, chapo, suite) {
        return '<section class="intro" id="main"><div class="wrap intro-page"><p class="eyebrow">' + esc(sur) + '</p><h1>' + esc(titre) + '</h1>' +
            '<p class="intro-lead">' + esc(chapo) + '</p>' + (suite || '') + '</div></section>';
    }

    function renderAbout() {
        var hero = '<section class="intro" id="main"><div class="wrap about-grid">' +
            picture('./assets/img/profile.jpg', ' class="portrait" width="200" height="200" alt="Rodolphe Vandaele" decoding="async"') +
            '<div><p class="eyebrow">' + esc(pick(T.profileEyebrow)) + '</p><h1>' + esc(pick(V.aboutTitle)) + '</h1>' +
            '<p class="intro-lead">' + esc(pick(T.profileBio)) + '</p>' +
            '<div class="btn-row"><a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(T.profileCTA)) + '</a>' +
            lienPlus(withLang('./index.html'), pick(V.allApps)) + '</div>' + mosaique('about-icons', 44) + '</div></div></section>';

        function grille(sur, titre, items, colonnes) {
            return '<section class="band"><div class="wrap"><header class="shelf-head is-simple"><div><p class="eyebrow">' + esc(sur) + '</p><h2>' + esc(titre) + '</h2></div></header>' +
                '<div class="cards ' + colonnes + '">' + items.map(function (l) {
                    return carte(icone(l[0]) + '<h3>' + esc(l[1]) + '</h3><p>' + esc(l[2]) + '</p>');
                }).join('') + '</div></div></section>';
        }

        var legal = '<section class="band is-legal" id="mentions"><div class="wrap"><header class="shelf-head is-simple"><div><h2>' + esc(pick(T.legalTitleSite)) + '</h2></div></header>' +
            '<div class="cards is-three">' +
            carte('<h3>' + esc(pick(T.legalEditor)) + '</h3><p>' + esc(pick(T.legalEditorText)) + '<br><a class="legal-mail" href="mailto:' + MAIL + '">' + MAIL + '</a></p>') +
            carte('<h3>' + esc(pick(T.legalHost)) + '</h3><p>' + esc(pick(T.legalHostText)) + '</p>') +
            carte('<h3>' + esc(pick(T.legalContent)) + '</h3><p>' + esc(pick(T.legalContentText)) + '</p>') +
            '</div></div></section>';

        return navHTML('v2-about') + '<main>' + hero +
            grille(pick(T.aboutLinesEyebrow), pick(T.aboutLinesTitle), pick(T.aboutLines), 'is-two') +
            grille(pick(T.aboutMethodEyebrow), pick(T.aboutMethodTitle), pick(T.aboutMethod), 'is-two') +
            legal + '</main>' + footerHTML();
    }

    function renderContact() {
        var objet = encodeURIComponent(pick(T.mailSubject));
        var hero = introPage(pick(T.contactEyebrow), pick(V.contactTitle), pick(V.contactLead),
            '<div class="btn-row"><a class="btn btn-primary contact-mail" href="mailto:' + MAIL + '?subject=' + objet + '">' +
            svg(ICONES.mail, 'btn-glyph') + MAIL + '</a></div>');

        var parApp = '<section class="band"><div class="wrap">' +
            '<header class="shelf-head is-stacked"><div><p class="eyebrow">' + esc(pick(T.supportLink)) + '</p><h2>' + esc(pick(V.contactPerApp)) + '</h2></div>' +
            '<p class="shelf-lead">' + esc(pick(V.contactPerAppLead)) + '</p></header><div class="catalogue">' +
            FAMILLES.map(function (f) {
                return '<div class="link-group"><h3><i class="dot is-' + f[0] + '"></i>' + esc(pick(f[1])) + '</h3>' +
                    tuiles(f[2], function (k) { return pick(APPS[k].platform === 'mac' ? T.macStore : T.supportLink); },
                        function (k) { return APPS[k].platform === 'mac' ? APPS[k].store : lienLegal(k, 'support'); }) + '</div>';
            }).join('') +
            '</div></div></section>';

        return navHTML('v2-contact') + '<main>' + hero + parApp + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Comportements
       --------------------------------------------------------------------- */

    var reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Le chapitre de l'accueil en cours de lecture s'allume dans la barre des familles. */
    /* Le menu des écrans étroits. Fermé, il est `inert` : ses liens ne
       reçoivent ni le focus ni les lecteurs d'écran. */
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
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) { basculerMenu(false); }
        });
    }

    function attacheMenuGlobal() {
        addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || !menuOuvert()) { return; }
            basculerMenu(false);
            var bouton = document.querySelector('.nav-toggle');
            if (bouton) { bouton.focus(); }
        });
        var large = matchMedia('(min-width: 834px)');
        var fermer = function (m) { if (m.matches) { basculerMenu(false); } };
        if (large.addEventListener) { large.addEventListener('change', fermer); }
    }

    /* Le sélecteur d'appareil des captures : il montre la grille choisie. Les flèches passent d'un appareil à
       l'autre, comme dans un contrôle segmenté natif. */
    function attacheAppareils() {
        document.querySelectorAll('.sec-shots .segmented').forEach(function (groupe) {
            var section = groupe.closest('.band');
            var grilles = section.querySelectorAll('.shots');
            var appareils = groupe.querySelectorAll('button[data-device]');
            appareils.forEach(function (b, i) {
                b.addEventListener('click', function () {
                    var choix = b.getAttribute('data-device');
                    appareils.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                    grilles.forEach(function (g) { g.hidden = g.getAttribute('data-device') !== choix; });
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

    /* Les chiffres comptent jusqu'à leur valeur quand ils entrent dans l'écran.
       La valeur finale est déjà dans la page : sans script ou sans mouvement,
       elle s'affiche telle quelle. */
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

        if (!menuGlobal) { menuGlobal = true; attacheMenuGlobal(); }
        attacheMenu();
        attacheAppareils();
        attacheCompteurs();
        attacheFiltres();
    }

    render();
})();
