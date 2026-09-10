/* ==========================================================================
   site.js — moteur de la vitrine « Vitrine produit »
   ==========================================================================
   Rend l'accueil, les pages d'application, À propos et Contact, en français
   et en anglais. Une application par écran : un titre, trois lignes, une
   capture, un bouton.

   Les pages légales et d'assistance des applications ne passent pas par ici :
   elles gardent styles.css et site-pages.js, parce qu'elles s'affichent dans
   les applications elles-mêmes.
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
        render();
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
       s'intercale pas dans les mises en page — l'<img> reste la boîte.
       --------------------------------------------------------------------- */
    function picture(src, attrs) {
        var base = src.replace(/\.(png|jpe?g)$/i, '');
        return '<picture>' +
            '<source type="image/avif" srcset="' + base + '.avif">' +
            '<source type="image/webp" srcset="' + base + '.webp">' +
            '<img src="' + src + '"' + (attrs || '') + '>' +
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

        iosTitle: { fr: 'Cinq applications conçues pour la France.', en: 'Five apps built for France.' },
        iosLead: {
            fr: 'Les données publiques françaises, sur la carte et hors connexion : les services du quotidien, et les prix que l’administration enregistre. Interface native SwiftUI, sources officielles, résultats géolocalisés. Aucun compte, aucune inscription.',
            en: 'French public data, on the map and offline: everyday services, and the prices the administration records. Native SwiftUI interface, official sources, geolocated results. No account, no sign-up.'
        },
        /* Un point par application, comme la section Mac : les deux gammes se
           présentent exactement de la même façon. */
        iosPoints: {
            fr: [
                ['CarbuFrance', 'Le prix des carburants station par station, avec carnet de bord et widget.'],
                ['IRVEFrance', 'Les bornes de recharge, leur puissance, leurs connecteurs et leur disponibilité.'],
                ['ToiletteFrance', 'Les toilettes publiques, leurs horaires et leur accessibilité.'],
                ['DefibFrance', 'Les défibrillateurs, avec mode Urgence et guide de réanimation.'],
                ['DVFFrance', 'Le prix de l’immobilier d’après les ventes réellement enregistrées.']
            ],
            en: [
                ['CarbuFrance', 'Fuel prices station by station, with a logbook and a widget.'],
                ['IRVEFrance', 'EV chargers, their power, connectors and availability.'],
                ['ToiletteFrance', 'Public toilets, their opening hours and accessibility.'],
                ['DefibFrance', 'Defibrillators, with an Emergency mode and a CPR guide.'],
                ['DVFFrance', 'Property prices from the sales actually recorded.']
            ]
        },
        iosCTA: { fr: 'Les cinq applications', en: 'The five apps' },
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
        footerStore: { fr: 'Toutes les applications sur l\u2019App Store', en: 'All apps on the App Store' },
        footerPartners: { fr: 'Partenaire', en: 'Partner' },

        available: { fr: 'Disponible', en: 'Available' },
        /* Une application peut être finie sans être encore en vente : la vitrine
           doit pouvoir le dire plutôt que de promettre un lien App Store qui
           n'existe pas. */
        soon: { fr: 'Bientôt disponible', en: 'Coming soon' },
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

        /* Mentions légales. La loi pour la confiance dans l'économie numérique
           demande l'éditeur, un moyen de le joindre, et l'hébergeur nommé avec son
           adresse. Elles tiennent en trois blocs, sur la page qui parle déjà de la
           personne — un site de sept pages n'a pas besoin d'une page pour cela. */
        legalTitleSite: { fr: 'Mentions légales', en: 'Legal notice' },
        legalEditor: { fr: 'Éditeur', en: 'Publisher' },
        legalEditorText: {
            fr: 'Rodolphe Vandaele, développeur indépendant. Directeur de la publication : Rodolphe Vandaele.',
            en: 'Rodolphe Vandaele, independent developer. Publication director: Rodolphe Vandaele.'
        },
        legalHost: { fr: 'Hébergeur', en: 'Host' },
        legalHostText: {
            fr: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
            en: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.'
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
                 'Cinq applications gratuites bâties sur les jeux de données publics français : carburants, bornes de recharge, toilettes, défibrillateurs et prix de l’immobilier. Distribuées sur l’App Store, financées par une publicité discrète, sans compte ni inscription.'],
                ['laptop', 'Mac, en open source',
                 'Deux utilitaires natifs pour Mac Apple Silicon, chacun sur un sujet précis. Publiés sous licence MIT sur GitHub, code complet consultable, sans publicité ni dépendance tierce.']
            ],
            en: [
                ['phone', 'iPhone, built for France',
                 'Five free apps built on French public datasets: fuel prices, EV chargers, public toilets, defibrillators and property prices. Shipped on the App Store, funded by discreet advertising, with no account or sign-up.'],
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
        dvffrance: {
            name: 'DVFFrance', platform: 'ios', accent: '#0a7d3c', glyph: '\u20ac',
            store: '',
            tag: { fr: 'Prix de l\u2019immobilier', en: 'Property prices' },
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
                    'Loyers d\u2019annonce, raccordement \u00e0 la fibre, couverture mobile, diagnostics \u00e9nerg\u00e9tiques de l\u2019adresse exacte et rendement locatif brut. Aucun compte, aucun achat int\u00e9gr\u00e9.'
                ],
                en: [
                    'A map at three scales: one pill per town across France, then every recorded sale at its address, then the cadastral plan with sold parcels highlighted.',
                    'Median prices by property type and year, with first and third quartiles, sale counts and median floor area. Never an average: a single exceptional sale would carry it away.',
                    'Sales volume per year: volume turns before price, and a market losing transactions without falling is a stalled market.',
                    'Two benchmarks: the gap to the department and the gap to France. The first tells you what the town is worth, the second what the region is worth.',
                    'Neighbourhood profile: schools with pass rates and value added, named shops, lines and stops, declared hazards, recognised disasters, radon, air and soil.',
                    'Advertised rents, fibre broadband and mobile coverage, energy certificates for the exact address and gross rental yield. No account, no in-app purchase.'
                ]
            },
            sources: { fr: 'Demandes de valeurs fonci\u00e8res de la Direction g\u00e9n\u00e9rale des finances publiques, g\u00e9olocalis\u00e9es par Etalab. Carte des loyers du minist\u00e8re du Logement, diagnostics de l\u2019ADEME, risques de G\u00e9orisques, plan cadastral de l\u2019IGN, annuaire et r\u00e9sultats de l\u2019\u00c9ducation nationale, faits enregistr\u00e9s du minist\u00e8re de l\u2019Int\u00e9rieur, d\u00e9coupage IRIS de l\u2019INSEE et OpenStreetMap.', en: 'Property transfer records from the French public finances directorate, geocoded by Etalab. Rent map from the Ministry of Housing, ADEME energy certificates, G\u00e9orisques hazards, IGN cadastral plan, schools directory and results from the Ministry of Education, recorded offences from the Interior Ministry, INSEE IRIS boundaries and OpenStreetMap.' },
            business: { fr: 'Application 100 % gratuite, financ\u00e9e par la publicit\u00e9. Aucun achat int\u00e9gr\u00e9, aucune donn\u00e9e bancaire dans l\u2019app.', en: 'Fully free app, funded by ads. No in-app purchases, no payment card data in the app.' },
            demo: {
                title: { fr: 'Communes', en: 'Towns' },
                /* Pas de badge de marque : l'app ne pose pas de nom sur ses pastilles.
                   Elle affiche le prix au mètre carré abrégé — « 2,1 k » — dans une
                   capsule dont la couleur vient de l'échelle des prix. La démo dit donc
                   la même chose, avec les mêmes six teintes. */
                icon: 'pin',
                pins: [
                    { top: '', tag: '2,1 k', tone: '#0e746b', x: 26, y: 36 },
                    { top: '', tag: '2,5 k', tone: '#a16207', x: 64, y: 30, main: true },
                    { top: '', tag: '2,4 k', tone: '#15803d', x: 44, y: 56 },
                    { top: '', tag: '2,8 k', tone: '#c2410c', x: 71, y: 63 },
                    { top: '', tag: '1,9 k', tone: '#0e746b', x: 36, y: 72 }
                ],
                selector: { fr: ['2025', '2024', '2023', '2022', '2021'], en: ['2025', '2024', '2023', '2022', '2021'] },
                active: 0,
                tabs: { fr: [['pin', 'Carte'], ['list', 'Ventes'], ['chart', 'March\u00e9'], ['book', 'Autour'], ['gear', 'R\u00e9glages']], en: [['pin', 'Map'], ['list', 'Sales'], ['chart', 'Market'], ['book', 'Around'], ['gear', 'Settings']] }
            },
            shots: [
                { file: 'dvffrance-map', caption: { fr: 'Carte des prix, une pastille par commune', en: 'Price map, one pill per town' } },
                { file: 'dvffrance-list', caption: { fr: 'Les ventes enregistr\u00e9es, adresse et prix au m\u00b2', en: 'Recorded sales, address and price per m\u00b2' } },
                { file: 'dvffrance-detail', caption: { fr: 'Fiche de vente, \u00e9cart au march\u00e9 et parcelle', en: 'Sale sheet, gap to the market and land parcel' } }
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
    var IOS_ORDER = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance', 'dvffrance'];

    /* Les applications réellement en vente, et elles seules.
       ------------------------------------------------------
       « 7 apps en ligne » compté sur la liste entière deviendrait faux le jour où une
       application est finie mais pas encore publiée — c'est le cas de DVFFrance, qui
       porte `store: ''` et une pastille « Bientôt disponible ». Une vitrine peut
       présenter ce qui arrive ; elle ne peut pas le compter parmi ce qui est en ligne.
       Le jour où la fiche App Store existe, remplir `store` suffit : le chiffre suit. */
    function publiees(cles) {
        return cles.filter(function (k) { return !!APPS[k].store; });
    }
    var MAC_ORDER = ['mactuner', 'dnstuner'];
    /* ---------------------------------------------------------------------
       Réglages propres à la vitrine
       --------------------------------------------------------------------- */

    /* Textes ajoutés par la refonte. Les autres viennent de T, inchangés. */
    var V = {
        heroKicker: { fr: 'Développeur indépendant · France', en: 'Independent developer · France' },
        heroTitle: { fr: 'Sept applications,<br>un seul principe.', en: 'Seven apps,<br>one principle.' },
        heroLead: {
            fr: 'Des applications natives qui font une chose et la font bien. Sur iPhone, les données publiques françaises du quotidien. Sur Mac, des utilitaires libres au code entièrement ouvert.',
            en: 'Native apps that do one thing and do it well. On iPhone, everyday French public data. On Mac, free utilities with fully open source code.'
        },
        seeApps: { fr: 'Voir les applications', en: 'See the apps' },
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
        backAll: { fr: '← Toutes les applications', en: '← All the apps' },
        featuresTitle: { fr: 'Ce que fait l’application', en: 'What the app does' },
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
        }
    };

    /*
     * Panneau des utilitaires Mac.
     *
     * Il n'existe pas de capture d'écran pour MacTuner ni pour DNSTuner : le
     * dossier n'en contient que pour les cinq applications iPhone. Plutôt qu'une
     * fenêtre vide autour d'une icône, on montre ce que l'application affiche
     * réellement à l'ouverture — ses chiffres. Le jour où des captures existent,
     * remplacer ce panneau par le même cadre d'image que sur iPhone.
     */
    var MAC_PANNEAU = {
        mactuner: {
            fr: [['Tableau de bord', 'CPU, mémoire, disque, réseau'],
                 ['Réglages système', '34 bascules réversibles'],
                 ['Nettoyage', '18 catégories'],
                 ['Ventilation', 'bornée au min/max constructeur']],
            en: [['Dashboard', 'CPU, memory, disk, network'],
                 ['System tweaks', '34 reversible switches'],
                 ['Cleanup', '18 categories'],
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

    /* Une section sur deux passe au noir. Les utilitaires Mac y restent toujours :
       leurs captures sont sombres, et cela sépare les deux gammes sans le dire. */
    function fondDe(index, cle) {
        if (APPS[cle] && APPS[cle].platform === 'mac') { return 'on-dark'; }
        return index % 2 === 0 ? 'on-light' : 'on-light-2';
    }

    /* ---------------------------------------------------------------------
       Fragments partagés
       --------------------------------------------------------------------- */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    var FLECHE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M3 8h9M8.5 4l4 4-4 4"/></svg>';

    var GLOBE = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="btn-glyph">' +
        '<circle cx="10" cy="10" r="7"/>' +
        '<path d="M3 10h14M10 3c1.8 2 2.7 4.4 2.7 7s-.9 5-2.7 7c-1.8-2-2.7-4.4-2.7-7s.9-5 2.7-7Z"/></svg>';

    var COCHE = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="10" cy="10" r="7.4"/><path d="m6.8 10.3 2.1 2.1 4.3-4.6"/></svg>';

    function eyebrow(texte, accent) {
        return '<span class="eyebrow"' + (accent ? ' style="--accent:' + accent + '"' : '') + '>' +
            '<span class="dot"></span>' + esc(texte) + '</span>';
    }

    function boutonStore(cle) {
        var app = APPS[cle];
        if (!app.store) {
            return '<span class="btn btn-ghost" aria-disabled="true">' + esc(pick(V.soonBadge)) + '</span>';
        }
        if (app.platform === 'mac') {
            return '<a class="btn btn-primary" href="' + app.store + '" target="_blank" rel="noopener">' +
                esc(pick(V.openSource)) + '</a>';
        }
        return badgeAppStore(app.store, pick(T.iosStore)) + boutonWeb(cle);
    }

    /* Le site de l'application, à côté du badge de l'App Store. Il mène à la même
       donnée sans rien installer : c'est une porte d'entrée, pas un doublon. */
    function boutonWeb(cle) {
        var url = SITES_WEB[cle];
        if (!url) { return ''; }
        return '<a class="btn btn-ghost" href="' + url + '" target="_blank" rel="noopener">' +
            GLOBE + esc(pick(V.webVersion)) + '</a>';
    }

    /* Le badge d'Apple est un fichier unique : `picture` chercherait des variantes
       AVIF et WebP qui n'existent pas. On le sert directement. */
    function badgeAppStore(url, texte) {
        return '<a class="store-badge" href="' + url + '" target="_blank" rel="noopener">' +
            '<img src="./assets/img/app-store-fr.svg" width="126" height="40" loading="lazy"' +
            ' decoding="async" alt="' + esc(texte) + '"></a>';
    }

    function appareil(cle) {
        var app = APPS[cle];
        if (app.platform === 'mac') {
            var lignes = (MAC_PANNEAU[cle] ? pick(MAC_PANNEAU[cle]) : []).map(function (l) {
                return '<div class="macwin-row"><span>' + esc(l[0]) + '</span>' +
                    '<b>' + esc(l[1]) + '</b></div>';
            }).join('');
            return '<div class="macwin"><div class="macwin-bar" aria-hidden="true">' +
                '<i></i><i></i><i></i><span class="macwin-title">' + esc(app.name) + '</span></div>' +
                '<div class="macwin-body">' +
                '<div class="macwin-head">' +
                picture('./assets/img/' + cle + '.png', ' width="56" height="56" alt="" loading="lazy" decoding="async"') +
                '<div><b>' + esc(app.name) + '</b><span>' + esc(pick(app.tag)) + '</span></div></div>' +
                '<div class="macwin-rows">' + lignes + '</div>' +
                '</div></div>';
        }
        var shot = (app.shots || [])[0];
        if (!shot) { return ''; }
        return '<div class="phone"><div class="phone-screen">' +
            picture('./assets/img/shots/' + shot.file + '.jpg',
                ' width="289" height="627" alt="' + esc(app.name + ' — ' + pick(shot.caption)) +
                '" loading="lazy" decoding="async"') +
            '</div></div>';
    }

    /**
     * Une tuile d'application : l'icône, le nom, une ligne de description.
     *
     * L'accueil et la page Contact s'en servent toutes deux — l'une pour ouvrir la
     * page de l'application, l'autre pour ouvrir son assistance. Le libellé de la
     * seconde ligne change donc, le reste non.
     */
    function tuileApp(cle, options) {
        options = options || {};
        var app = APPS[cle];
        var href = options.href || withLang('./' + cle + '.html');
        var sousTitre = options.sousTitre || pick(app.tag);
        var externe = options.externe ? ' target="_blank" rel="noopener"' : '';
        // Une application finie mais pas encore en vente le dit ici : sans cela, la
        // tuile promet une fiche App Store qui n'existe pas.
        var bientot = !app.store && !options.href
            ? '<span class="app-tile-soon">' + esc(pick(V.soonBadge)) + '</span>'
            : '';

        return '<a class="app-tile" href="' + href + '"' + externe + '>' +
            '<span class="app-tile-icon">' +
            picture('./assets/img/' + cle + '.png',
                ' width="60" height="60" alt="" decoding="async"') +
            '</span>' +
            '<span class="app-tile-text">' +
            '<b>' + esc(app.name) + '</b>' +
            '<span class="app-tile-tag">' + esc(sousTitre) + '</span>' +
            bientot + '</span></a>';
    }

    /* Les faits saillants, en pastilles. */
    function pastilles(cle) {
        var app = APPS[cle];
        var faits = pick(app.platform === 'mac' ? V.chipsMac : V.chipsIOS) || [];
        return '<ul class="facts">' + faits.map(function (f) {
            return '<li>' + esc(f) + '</li>';
        }).join('') + '</ul>';
    }

    function listePoints(items, limite) {
        var lignes = items.slice(0, limite || items.length);
        return '<ul class="points">' + lignes.map(function (texte) {
            return '<li>' + COCHE + '<span>' + esc(texte) + '</span></li>';
        }).join('') + '</ul>';
    }

    /* ---------------------------------------------------------------------
       Barre de navigation
       --------------------------------------------------------------------- */

    function navHTML(page) {
        function lien(href, texte, actif, garder) {
            return '<a href="' + withLang(href) + '"' + (actif ? ' aria-current="page"' : '') +
                (garder ? ' class="nav-keep"' : '') + '>' + esc(texte) + '</a>';
        }
        return '<a class="skip-link" href="#main">' + esc(pick(T.skipLink)) + '</a>' +
            '<header class="nav" id="nav"><div class="nav-inner">' +
            '<a class="nav-brand" href="' + withLang('./index.html') + '">' +
            picture('./assets/img/carbufrance.png', ' width="24" height="24" alt="" decoding="async"') +
            '<span>Rodolphe Vandaele</span></a>' +
            '<nav class="nav-links" aria-label="Navigation">' +
            lien('./index.html#ios', pick(T.navIOS), false) +
            lien('./index.html#mac', pick(T.navMac), false) +
            lien('./about.html', pick(T.navAbout), page === 'v2-about') +
            lien('./contact.html', pick(T.navContact), page === 'v2-contact', true) +
            '<span class="lang-switch">' +
            '<a href="?lang=fr" data-lang="fr" aria-current="' + (lang === 'fr') + '">FR</a>' +
            '<a href="?lang=en" data-lang="en" aria-current="' + (lang === 'en') + '">EN</a>' +
            '</span></nav></div></header>';
    }

    /* ---------------------------------------------------------------------
       Pied de page
       --------------------------------------------------------------------- */

    function footerHTML() {
        function colonne(titre, cles) {
            return '<nav aria-label="' + esc(titre) + '"><h2>' + esc(titre) + '</h2>' +
                cles.map(function (k) {
                    return '<a href="' + withLang('./' + k + '.html') + '">' + APPS[k].name + '</a>';
                }).join('') + '</nav>';
        }
        var partenaires = PARTENAIRES.map(function (p) {
            return '<a class="partner" href="' + p.url + '" target="_blank" rel="noopener">' +
                '<img src="' + p.img + '" width="40" height="40" alt="" loading="lazy" decoding="async">' +
                '<span><span class="partner-name">' + esc(p.nom) + '</span>' +
                '<span class="partner-site">' + esc(p.site) + '</span></span></a>';
        }).join('');

        return '<footer class="footer"><div class="wrap">' +
            '<div class="footer-grid">' +
            '<div class="footer-brand"><b>Rodolphe Vandaele</b><p>' + esc(pick(T.footerLine)) + '</p></div>' +
            colonne(pick(T.navIOS), IOS_ORDER) +
            colonne(pick(T.navMac), MAC_ORDER) +
            '<nav aria-label="' + esc(pick(T.footerSite)) + '"><h2>' + esc(pick(T.footerSite)) + '</h2>' +
            '<a href="' + withLang('./about.html') + '">' + esc(pick(T.navAbout)) + '</a>' +
            '<a href="' + withLang('./contact.html') + '">' + esc(pick(T.navContact)) + '</a>' +
            '<a href="' + withLang('./about.html') + '#mentions">' + esc(pick(T.legalTitleSite)) + '</a>' +
            '<a href="' + LIBERAPAY + '" target="_blank" rel="noopener">Liberapay</a>' +
            '<a href="mailto:' + MAIL + '">' + MAIL + '</a></nav>' +
            '</div>' +
            '<div class="footer-band">' +
            badgeAppStore(STORE_DEV, pick(T.footerStore)) +
            (partenaires ? '<div class="footer-side">' +
                '<span class="partner-label">' + esc(pick(T.footerPartners)) + '</span>' +
                partenaires + '</div>' : '') +
            '</div>' +
            '<div class="footer-legal"><span>© 2026 Rodolphe Vandaele</span>' +
            '<span>' + esc(pick(T.footerTagline)) + '</span></div>' +
            '</div></footer>';
    }

    /* ---------------------------------------------------------------------
       Accueil : une application par écran
       --------------------------------------------------------------------- */

    function sectionApp(cle, index) {
        var app = APPS[cle];
        var fond = fondDe(index, cle);
        var plateforme = app.platform === 'mac' ? pick(V.onMac) : pick(V.onIPhone);
        var points = pick(app.features) || [];

        /* Le texte d'un côté, l'appareil de l'autre : empilés, les deux dépassent
           la hauteur de la fenêtre et la section perd son unité. */
        return '<section class="scene ' + fond + '" id="' + cle + '" style="--accent:' + app.accent + '">' +
            '<span class="scene-glow" aria-hidden="true"></span>' +
            '<div class="wrap scene-inner scene-split">' +
            '<div class="scene-copy">' +
            '<div class="scene-head rise">' +
            eyebrow(plateforme) +
            '<h2>' + esc(app.name) + '</h2>' +
            '<p class="lead">' + esc(pick(app.desc)) + '</p>' +
            '</div>' +
            '<div class="rise" style="--delai:70ms">' + pastilles(cle) + '</div>' +
            '<div class="rise" style="--delai:120ms">' + listePoints(points, 3) + '</div>' +
            '<div class="btn-row rise" style="--delai:160ms">' +
            boutonStore(cle) +
            '<a class="btn btn-ghost" href="' + withLang('./' + cle + '.html') + '">' +
            esc(pick(T.iosPage)) + '</a>' +
            '</div>' +
            '</div>' +
            '<div class="scene-device rise" style="--delai:60ms" data-tilt>' + appareil(cle) + '</div>' +
            '</div></section>';
    }

    function renderHome() {
        var toutes = IOS_ORDER.concat(MAC_ORDER);
        var enLigne = publiees(toutes).length;

        var hero = '<section class="scene on-light" id="main">' +
            '<span class="scene-glow" aria-hidden="true"></span>' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(V.heroKicker)) +
            '<h1>' + pick(V.heroTitle) + '</h1>' +
            '<p class="lead">' + esc(pick(V.heroLead)) + '</p>' +
            '</div>' +
            '<div class="btn-row rise" style="--delai:120ms">' +
            '<a class="btn btn-primary" href="#' + IOS_ORDER[0] + '">' + esc(pick(V.seeApps)) + '</a>' +
            badgeAppStore(STORE_DEV, pick(T.footerStore)) +
            '</div>' +
            '</div></section>';

        /*
         * L'index des applications.
         *
         * Cinq sur iPhone, deux sur Mac : deux gammes qui n'ont ni le même public ni
         * le même mode de distribution, et que le site sépare partout ailleurs. Les
         * réunir en une seule grille laissait une rangée de quatre puis trois tuiles
         * centrées sous elle, sans que ce décrochage veuille dire quoi que ce soit.
         * Rangées par gamme, les cinq tiennent sur une ligne et les deux sur la
         * suivante : la mise en page dit enfin ce que le contenu est.
         */
        function groupe(titre, cles, sousTitre) {
            return '<section class="app-group">' +
                '<h2 class="app-group-head">' + esc(titre) +
                '<span>' + esc(sousTitre) + '</span></h2>' +
                '<div class="app-tiles">' +
                cles.map(function (k) { return tuileApp(k); }).join('') +
                '</div></section>';
        }

        var index = '<section class="scene is-index on-light-2">' +
            '<div class="wrap scene-inner">' +
            '<div class="app-index rise">' +
            groupe(pick(T.navIOS), IOS_ORDER, pick(V.onIPhone)) +
            groupe(pick(T.navMac), MAC_ORDER, pick(V.onMac)) +
            '</div></div></section>';

        var sections = '<div id="ios"></div>' +
            IOS_ORDER.map(function (k, i) { return sectionApp(k, i); }).join('') +
            '<div id="mac"></div>' +
            MAC_ORDER.map(function (k, i) { return sectionApp(k, i); }).join('');

        var valeurs = '<section class="scene on-light-2">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(T.valuesEyebrow)) +
            '<h2>' + esc(pick(T.valuesTitle)) + '</h2>' +
            '</div>' +
            '<div class="cards rise" style="--delai:80ms">' +
            pick(T.values).map(function (v) {
                return '<article class="card"><span class="card-icon">' + COCHE + '</span>' +
                    '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p></article>';
            }).join('') +
            '</div></div></section>';

        var contact = '<section class="scene on-light">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(T.contactEyebrow)) +
            '<h2>' + esc(pick(V.contactTitle)) + '</h2>' +
            '<p class="lead">' + esc(pick(V.contactLead)) + '</p>' +
            '</div>' +
            '<div class="btn-row rise" style="--delai:80ms">' +
            '<a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(V.contactWrite)) + '</a>' +
            '<a class="btn btn-ghost" href="' + withLang('./about.html') + '">' + esc(pick(T.navAbout)) + '</a>' +
            '</div></div></section>';

        return navHTML('v2-home') + '<main>' + hero + index + sections + valeurs + contact + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Page d'une application
       --------------------------------------------------------------------- */

    function renderApp(cle) {
        var app = APPS[cle];
        var plateforme = app.platform === 'mac' ? pick(V.onMac) : pick(V.onIPhone);
        var liens = app.platform === 'mac'
            ? ''
            : '<a class="btn btn-ghost" href="' + withLang('./' + cle + '-support.html') + '">' +
              esc(pick(T.supportLink)) + '</a>' +
              '<a class="btn btn-ghost" href="' + withLang('./' + cle + '-privacy.html') + '">' +
              esc(pick(T.privacyLink)) + '</a>';

        var hero = '<section class="scene on-light" id="main" style="--accent:' + app.accent + '">' +
            '<span class="scene-glow" aria-hidden="true"></span>' +
            '<div class="wrap scene-inner scene-split">' +
            '<div class="scene-copy">' +
            '<div class="scene-head rise">' +
            '<a class="link-more" href="' + withLang('./index.html') + '">' + esc(pick(V.backAll)) + '</a>' +
            eyebrow(plateforme) +
            '<h1>' + esc(app.name) + '</h1>' +
            '<p class="lead">' + esc(pick(app.desc)) + '</p>' +
            '</div>' +
            '<div class="btn-row rise" style="--delai:140ms">' + boutonStore(cle) + liens + '</div>' +
            '</div>' +
            '<div class="scene-device rise" style="--delai:60ms" data-tilt>' + appareil(cle) + '</div>' +
            '</div></section>';

        var fonctions = '<section class="scene on-light-2" style="--accent:' + app.accent + '">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise"><h2>' + esc(pick(V.featuresTitle)) + '</h2></div>' +
            '<div class="rise" style="--delai:80ms">' + listePoints(pick(app.features)) + '</div>' +
            '</div></section>';

        var captures = '';
        if (app.shots && app.shots.length) {
            captures = '<section class="scene on-dark" style="--accent:' + app.accent + '">' +
                '<span class="scene-glow" aria-hidden="true"></span>' +
                '<div class="wrap scene-inner">' +
                '<div class="scene-head rise"><h2>' + esc(pick(V.shotsTitle)) + '</h2></div>' +
                '<div class="shots rise" style="--delai:80ms">' +
                app.shots.map(function (s) {
                    return '<figure class="shot"><div class="phone"><div class="phone-screen">' +
                        picture('./assets/img/shots/' + s.file + '.jpg',
                            ' width="289" height="627" alt="' + esc(app.name + ' — ' + pick(s.caption)) +
                            '" loading="lazy" decoding="async"') +
                        '</div></div><figcaption>' + esc(pick(s.caption)) + '</figcaption></figure>';
                }).join('') +
                '</div></div></section>';
        }

        var methode = '<section class="scene on-light">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise"><h2>' + esc(pick(V.methodTitle)) + '</h2></div>' +
            '<div class="cards rise" style="--delai:80ms">' +
            '<article class="card"><h3>' + esc(pick(T.dataSources)) + '</h3>' +
            '<p>' + esc(pick(app.sources)) + '</p></article>' +
            '<article class="card"><h3>' + esc(pick(T.dataBusiness)) + '</h3>' +
            '<p>' + esc(pick(app.business)) + '</p></article>' +
            '</div>' +
            '<div class="btn-row rise" style="--delai:140ms">' + boutonStore(cle) +
            '<a class="btn btn-ghost" href="' + withLang('./index.html') + '">' + esc(pick(V.allApps)) + '</a>' +
            '</div></div></section>';

        return navHTML('v2-app') + '<main>' + hero + fonctions + captures + methode + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       À propos
       --------------------------------------------------------------------- */

    function renderAbout() {
        var hero = '<section class="scene on-light" id="main">' +
            '<span class="scene-glow" aria-hidden="true"></span>' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(T.profileEyebrow)) +
            '<h1>' + esc(pick(V.aboutTitle)) + '</h1>' +
            '<p class="lead">' + esc(pick(T.profileBio)) + '</p>' +
            '</div>' +
            '<div class="rise" style="--delai:80ms">' +
            picture('./assets/img/profile.jpg',
                ' class="portrait" width="180" height="180" alt="Rodolphe Vandaele"' +
                ' loading="lazy" decoding="async"') +
            '</div>' +
            '<div class="btn-row rise" style="--delai:140ms">' +
            '<a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(T.profileCTA)) + '</a>' +
            '<a class="btn btn-ghost" href="' + withLang('./index.html') + '">' + esc(pick(V.allApps)) + '</a>' +
            '</div></div></section>';

        var methode = '<section class="scene on-light-2">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(T.aboutMethodEyebrow)) +
            '<h2>' + esc(pick(T.aboutMethodTitle)) + '</h2>' +
            '</div>' +
            '<div class="cards rise" style="--delai:80ms">' +
            pick(T.aboutMethod).map(function (m) {
                /* Chaque entrée est [icône, titre, texte] : la première case nomme
                   un pictogramme, elle ne s'affiche pas. */
                return '<article class="card"><h3>' + esc(m[1]) + '</h3><p>' + esc(m[2]) + '</p></article>';
            }).join('') +
            '</div></div></section>';

        /* Section volontairement sobre : une mention légale n'a pas à parler
           aussi fort qu'un titre de produit. Le titre reprend la taille d'un
           intitulé de carte, et la section se contente d'un fond neutre. */
        var legal = '<section class="scene on-light is-legal" id="mentions">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            '<h2>' + esc(pick(T.legalTitleSite)) + '</h2>' +
            '</div>' +
            '<div class="cards rise" style="--delai:80ms">' +
            '<article class="card"><h3>' + esc(pick(T.legalEditor)) + '</h3>' +
            '<p>' + esc(pick(T.legalEditorText)) + '<br>' +
            '<a class="legal-mail" href="mailto:' + MAIL + '">' + MAIL + '</a></p></article>' +
            '<article class="card"><h3>' + esc(pick(T.legalHost)) + '</h3>' +
            '<p>' + esc(pick(T.legalHostText)) + '</p></article>' +
            '<article class="card"><h3>' + esc(pick(T.legalContent)) + '</h3>' +
            '<p>' + esc(pick(T.legalContentText)) + '</p></article>' +
            '</div></div></section>';

        return navHTML('v2-about') + '<main>' + hero + methode + legal + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Contact
       --------------------------------------------------------------------- */

    function renderContact() {
        var sujets = IOS_ORDER.concat(MAC_ORDER).map(function (k) {
            var app = APPS[k];
            return tuileApp(k, {
                href: app.platform === 'mac' ? app.store : withLang('./' + k + '-support.html'),
                externe: app.platform === 'mac',
                sousTitre: pick(T.supportLink)
            });
        }).join('');

        var objet = encodeURIComponent(pick(T.mailSubject) || 'Contact');
        var hero = '<section class="scene on-light" id="main">' +
            '<span class="scene-glow" aria-hidden="true"></span>' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise">' +
            eyebrow(pick(T.contactEyebrow)) +
            '<h1>' + esc(pick(V.contactTitle)) + '</h1>' +
            '<p class="lead">' + esc(pick(V.contactLead)) + '</p>' +
            '</div>' +
            '<div class="btn-row rise" style="--delai:80ms">' +
            '<a class="btn btn-primary" href="mailto:' + MAIL + '?subject=' + objet + '">' + MAIL + '</a>' +
            '</div></div></section>';

        var parApp = '<section class="scene on-light-2">' +
            '<div class="wrap scene-inner">' +
            '<div class="scene-head rise"><h2>' + esc(pick(V.contactPerApp)) + '</h2>' +
            '<p class="lead">' + esc(pick(V.contactPerAppLead)) + '</p></div>' +
            '<div class="app-tiles rise" style="--delai:80ms">' + sujets + '</div>' +
            '</div></section>';

        return navHTML('v2-contact') + '<main>' + hero + parApp + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Comportements
       --------------------------------------------------------------------- */

    var reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Chaque bloc marqué `rise` monte à son entrée dans le cadre. Sans
       observateur — navigateur ancien, mouvement réduit — tout est montré
       d'emblée : une décoration ne doit jamais coûter le contenu. */
    function attacheReveals() {
        var blocs = document.querySelectorAll('.rise');
        if (!blocs.length) { return; }
        if (reduceMotion || !('IntersectionObserver' in window)) {
            document.documentElement.classList.add('no-motion');
            return;
        }
        var io = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                if (!e.isIntersecting) { return; }
                io.unobserve(e.target);
                e.target.classList.add('is-in');
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
        blocs.forEach(function (b) { io.observe(b); });
    }

    /* La barre passe en blanc sur noir dès qu'une section sombre occupe le haut
       de la fenêtre, et gagne son filet dès que la page a défilé. */
    function attacheNav() {
        var nav = document.getElementById('nav');
        if (!nav) { return; }
        var sections = [].slice.call(document.querySelectorAll('.scene'));
        var enAttente = false;

        function maj() {
            enAttente = false;
            nav.classList.toggle('is-scrolled', scrollY > 8);
            var repere = nav.offsetHeight + 4;
            var sombre = false;
            for (var i = 0; i < sections.length; i++) {
                var r = sections[i].getBoundingClientRect();
                if (r.top <= repere && r.bottom > repere) {
                    sombre = sections[i].classList.contains('on-dark');
                    break;
                }
            }
            nav.classList.toggle('on-dark', sombre);
        }

        addEventListener('scroll', function () {
            if (enAttente) { return; }
            enAttente = true;
            requestAnimationFrame(maj);
        }, { passive: true });
        addEventListener('resize', maj);
        maj();
    }

    /**
     * Inclinaison de l'appareil au passage du pointeur.
     *
     * L'appareil suit le curseur sur deux axes, de quelques degrés seulement :
     * assez pour donner du relief à une image plate, trop peu pour distraire.
     * L'effet ne s'installe que sur un pointeur fin — un doigt n'a pas de survol,
     * et l'inclinaison resterait figée après un appui.
     *
     * Les valeurs passent par des propriétés personnalisées : la feuille de style
     * garde la main sur la composition finale, et rien n'est écrit dans `transform`
     * depuis le script, ce qui laisse l'animation d'entrée intacte.
     */
    function attacheInclinaison() {
        if (reduceMotion) { return; }
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) { return; }

        document.querySelectorAll('[data-tilt]').forEach(function (zone) {
            var cible = zone.firstElementChild;
            if (!cible) { return; }
            var attente = false;
            var rx = 0;
            var ry = 0;

            zone.addEventListener('pointermove', function (e) {
                var r = zone.getBoundingClientRect();
                // -0,5 à 0,5 depuis le centre, puis 7 degrés au maximum.
                ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
                rx = (0.5 - (e.clientY - r.top) / r.height) * 10;
                if (attente) { return; }
                attente = true;
                requestAnimationFrame(function () {
                    attente = false;
                    cible.style.setProperty('--rx', rx.toFixed(2) + 'deg');
                    cible.style.setProperty('--ry', ry.toFixed(2) + 'deg');
                    cible.style.setProperty('--lift', '1');
                });
            });

            zone.addEventListener('pointerleave', function () {
                cible.style.setProperty('--rx', '0deg');
                cible.style.setProperty('--ry', '0deg');
                cible.style.setProperty('--lift', '0');
            });
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

    function render() {
        var root = document.getElementById('site-root');
        if (!root) { return; }
        var page = document.body.getAttribute('data-page');
        var appKey = document.body.getAttribute('data-app');
        document.documentElement.lang = lang;

        if (page === 'v2-home') { root.innerHTML = renderHome(); }
        else if (page === 'v2-app' && APPS[appKey]) { root.innerHTML = renderApp(appKey); }
        else if (page === 'v2-contact') { root.innerHTML = renderContact(); }
        else if (page === 'v2-about') { root.innerHTML = renderAbout(); }
        else { return; }

        attacheReveals();
        attacheNav();
        attacheInclinaison();
        attacheLangue();
    }

    render();
})();
