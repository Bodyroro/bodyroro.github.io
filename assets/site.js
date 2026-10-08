/* ==========================================================================
   site.js : moteur de la vitrine
   ==========================================================================
   Rend l'accueil, les pages d'application, À propos et Contact, en français
   et en anglais. Une application par écran : un titre, trois lignes, un
   appareil qui se redresse quand on défile, un bouton.

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
    /* Fiches des deux jeux, sous la forme courte sans pays : l'App Store ouvre
       la vitrine du pays du visiteur. */
    var STORE_TC = 'https://apps.apple.com/app/id6816639945';
    var STORE_MG = 'https://apps.apple.com/app/id6817347087';
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
    /* Un visuel dans le téléphone dessiné par le site. Le titre du visuel occupe
       le haut de l'image : l'écran garde donc une barre d'état, peinte de la
       couleur du bord supérieur de chaque visuel (`shotTops`), pour que l'îlot
       ne recouvre pas le titre. */
    function telephoneJeu(cle, n, alt, paresseux, sizes, classe) {
        var fond = (APPS[cle].shotTops || [])[n - 1] || '#000';
        return '<div class="phone' + (classe ? ' ' + classe : '') + '">' +
            '<div class="phone-screen is-store" style="background:' + fond + '">' +
            captureJeu(cle, n, alt, paresseux, sizes) + '</div></div>';
    }

    /* Les captures iPad (2064 x 2752, sans îlot à éviter) existent en 480 et 960
       pixels de large, plus un JPEG de 720 : un iPad s'affiche plus large qu'un iPhone. */
    function tabletteJeu(cle, n, alt, sizes) {
        return '<div class="tablet"><div class="tablet-screen">' +
            captureJeu(cle, n, alt, true, sizes, true) + '</div></div>';
    }

    function captureJeu(cle, n, alt, paresseux, sizes, ipad) {
        var base = './assets/img/shots/' + cle + (ipad ? '-ipad-' : '-') + lang + '-' + n;
        var t = ipad ? [480, 960, 720, 2064, 2752] : [360, 720, 540, 1320, 2868];
        function jeu(ext) { return base + '-' + t[0] + '.' + ext + ' ' + t[0] + 'w, ' + base + '-' + t[1] + '.' + ext + ' ' + t[1] + 'w'; }
        return '<picture>' +
            '<source type="image/avif" srcset="' + jeu('avif') + '" sizes="' + sizes + '">' +
            '<source type="image/webp" srcset="' + jeu('webp') + '" sizes="' + sizes + '">' +
            '<img src="' + base + '-' + t[2] + '.jpg" width="' + t[3] + '" height="' + t[4] + '" alt="' + esc(alt) + '"' +
            (paresseux ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async">' +
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

        footerLine: { fr: 'Sur iPhone et iPad, trois jeux avec Gloup et les services publics français du quotidien. Sur Mac, des utilitaires libres qui font une chose et la font bien.', en: 'On iPhone and iPad, three games starring Gloup and everyday French public services. On Mac, free utilities that do one thing and do it well.' },
        footerSite: { fr: 'Site', en: 'Site' },
        footerApps: { fr: 'Apps iPhone', en: 'iPhone apps' },
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
           personne : un site de sept pages n'a pas besoin d'une page pour cela. */
        legalTitleSite: { fr: 'Mentions légales', en: 'Legal notice' },
        legalEditor: { fr: 'Éditeur', en: 'Publisher' },
        legalEditorText: {
            fr: 'Rodolphe Vandaele, développeur indépendant, particulier. BodyCorp n’est pas une société : c’est le nom d’éditeur sous lequel il publie les jeux Trou Chromatique et Mon Gloup. Directeur de la publication : Rodolphe Vandaele.',
            en: 'Rodolphe Vandaele, independent developer, private individual. BodyCorp is not a company: it is the publisher name under which he releases the games Trou Chromatique and Mon Gloup. Publication director: Rodolphe Vandaele.'
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
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/CapturesAppStore.py puis .mjs), dans leur ordre. */
            shotTops: ['#d4e4f8', '#d4e4f8', '#d4e4f8', '#d4e4f8', '#d4e4f8'],
            storeShots: {
                fr: ['Les stations autour de vous', 'Comparez sans effort', 'Le détail utile', 'Votre budget carburant', 'Le marché en clair'],
                en: ['Stations around you', 'Compare effortlessly', 'The details that matter', 'Your fuel budget', 'The market made clear']
            }
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
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/CapturesAppStore.py puis .mjs), dans leur ordre. */
            shotTops: ['#c9ebda', '#c9ebda', '#c9ebda', '#c9ebda', '#c9ebda'],
            storeShots: {
                fr: ['Les bornes autour de vous', 'Filtrez selon votre véhicule', 'Le détail de la borne', 'Calculez votre recharge', 'Suivez vos recharges'],
                en: ['Chargers around you', 'Filter by your vehicle', 'Charger details', 'Plan your charge', 'Track your charging']
            }
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
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/CapturesAppStore.py puis .mjs), dans leur ordre. */
            shotTops: ['#cce6ef', '#cce6ef', '#cce6ef', '#cce6ef'],
            storeShots: {
                fr: ['Les toilettes autour de vous', 'Le détail qui compte', 'Gratuites, accessibles, ouvertes', 'La plus proche, tout de suite'],
                en: ['Toilets around you', 'The details that count', 'Free, accessible, open', 'The nearest one, right away']
            }
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
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/CapturesAppStore.py puis .mjs), dans leur ordre. */
            shotTops: ['#f7d6d2', '#f7d6d2', '#f7d6d2', '#f7d6d2'],
            storeShots: {
                fr: ['Les défibrillateurs autour de vous', 'Le détail précis', 'Chaque seconde compte', 'Les gestes qui sauvent'],
                en: ['Defibrillators around you', 'Precise details', 'Every second counts', 'Life-saving steps']
            }
        },
        dvffrance: {
            name: 'DVFFrance', platform: 'ios', accent: '#0a7d3c', glyph: '\u20ac',
            store: STORE + 'dvffrance/id6813079672',
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
                   Elle affiche le prix au mètre carré abrégé, « 2,1 k », dans une
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
            /* Visuels de la fiche App Store (Outils/Bodyroro.github.io/CapturesAppStore.py puis .mjs), dans leur ordre. */
            shotTops: ['#caefdb', '#caefdb', '#caefdb', '#caefdb', '#caefdb'],
            storeShots: {
                fr: ['Les prix autour de vous', 'Le détail d’une vente', 'Le marché de votre commune', 'Votre quartier en un coup d’œil', 'Tout ce qui vous entoure'],
                en: ['Prices around you', 'The details of a sale', 'Your town’s market', 'Your neighbourhood at a glance', 'Everything around you']
            }
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
                    '34 langues, iPhone et iPad, portrait et paysage. Le jeu se joue hors connexion, sans compte.'
                ],
                en: [
                    'Slide your finger to move Gloup: he only catches objects of his color, grows with every catch, and switches color when he grabs a gem.',
                    'Ten islands of ten levels, from the kitchen to the moon base, each with its own scenery, music, friend and a giant boss on the tenth level.',
                    'A full story: cutscenes, voiced dialogue, ten friends and Baron Grisaille, who stole the archipelago’s colors.',
                    'A daily challenge, the same for everyone, a daily gift and a booster of your choice before each level.',
                    'Looks for Gloup, side quests and a collection, all earned by playing.',
                    '34 languages, iPhone and iPad, portrait and landscape. The game plays offline, with no account.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seule la publicité utilise le réseau.', en: 'No external data: the islands, levels, music and texts are built into the game, which plays offline. Only advertising uses the network.' },
            business: { fr: 'Jeu 100 % gratuit, financé par la publicité Google AdMob : vidéos facultatives pour un bonus, et courte publicité entre deux niveaux. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free game, funded by Google AdMob ads: optional videos for a bonus, and a short ad between two levels. No in-app purchases, no payment card data in the app.' },
            promo: {
                fr: 'Attrape tout ce qui a ta couleur. Dix îles, cent niveaux et une vraie histoire.',
                en: 'Catch everything of your color. Ten islands, a hundred levels and a real story.'
            },
            stats: {
                fr: [['10', 'îles flottantes'], ['100', 'niveaux'], ['34', 'langues'], ['0', 'achat intégré']],
                en: [['10', 'floating islands'], ['100', 'levels'], ['34', 'languages'], ['0', 'in-app purchases']]
            },
            /* Les huit captures App Store V0.1 (docs/screenshots du projet), dans
               l'ordre de la fiche. Légendes tirées du README des captures. */
            shotTops: ['#feaf46', '#794bfd', '#3e83fc', '#546ff2', '#582c9c', '#2b86ff', '#be51ee', '#ff8a3d'],
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
                    '34 langues, iPhone et iPad. Le jeu se joue hors connexion, sans compte, avec des rappels facultatifs quand Gloup a besoin de vous.'
                ],
                en: [
                    'A cutaway house with a bedroom, living room, kitchen and bathroom: Gloup eats what you slide to his mouth, cooks 14 recipes with you, takes a bubble bath and goes to bed after an evening ritual.',
                    'A garden to grow: sow, water and harvest the vegetable patch, shake the apple tree, push the swing, search the hiding spots. When it rains, the vegetable patch loves it.',
                    'Four needs, hunger, joy, cleanliness and energy, follow real time. At adoption you choose: Never dies, Gloup never gets sick; Can pass away, neglected for too long he gets sick and may leave, always after warnings.',
                    'He grows from baby to adult over 60 levels and builds a personality from five traits: foodie, playful, stylish, dreamer or gardener.',
                    '33 foods, 20 hats, 14 looks, 24 colors, and wallpapers, floors and furniture to decorate every room.',
                    '9 mini-games, 18 activities, daily and weekly quests, a memory album, a friend visiting each day and 20 trophies, also in Game Center.',
                    '34 languages, iPhone and iPad. The game plays offline, with no account, with optional reminders when Gloup needs you.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : la maison, le jardin, les aliments, les looks, les mini-jeux, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Les rappels sont programmés sur l’appareil, sans serveur.', en: 'No external data: the house, garden, foods, looks, mini-games, music and texts are built into the game, which plays offline. Reminders are scheduled on the device, with no server.' },
            business: { fr: 'Jeu 100 % gratuit, financé par la publicité Google AdMob : vidéos facultatives pour un coup de pouce, 12 par jour au plus, et courte publicité possible après un mini-jeu. Aucun achat intégré, aucune donnée bancaire dans l’app.', en: 'Fully free game, funded by Google AdMob ads: optional videos for a small boost, 12 a day at most, and a short ad that may appear after a mini-game. No in-app purchases, no payment card data in the app.' },
            promo: {
                fr: 'Gloup emménage chez vous. Nourrissez-le, lavez-le, couchez-le et regardez-le grandir.',
                en: 'Gloup moves in with you. Feed him, bathe him, tuck him in and watch him grow.'
            },
            stats: {
                fr: [['60', 'niveaux, de bébé à adulte'], ['9', 'mini-jeux'], ['33', 'aliments'], ['34', 'langues']],
                en: [['60', 'levels, from baby to adult'], ['9', 'mini-games'], ['33', 'foods'], ['34', 'languages']]
            },
            shotTops: ['#6cbfff', '#feb045', '#7bd4ff', '#674acc', '#8add69', '#ff8fc8', '#fb87d9', '#39c16c'],
            storeShots: {
                fr: ['La maison et son jardin', 'La cuisine, un gâteau pour Gloup', 'Le bain moussant', 'Pyjama, doudou et au lit', 'Le potager à cultiver', 'De bébé à adulte', 'La garde-robe', 'Neuf mini-jeux'],
                en: ['The house and its garden', 'The kitchen, a cake for Gloup', 'The bubble bath', 'Pajamas, teddy and bedtime', 'The vegetable patch to grow', 'From baby to adult', 'The wardrobe', 'Nine mini-games']
            }
        },
        /* Pas encore en vente : `store: ''` donne la pastille « Bientôt disponible » et, dans le
           premier écran et la section des jeux, « Bientôt sur l'App Store » à la place du badge. Le jour
           de la sortie : `store: STORE_CF` (fiche App Store), et les pastilles `chips` peuvent partir :
           elles disent « achats facultatifs » parce que le jeu en propose, contrairement aux deux
           autres. Les captures (`assets/img/shots/chromafight-*`, issues de
           `Docs/ChromaFight/Screenshots`, iPhone et iPad) sont provisoires : les régénérer par
           `Outils/Parc/Marque/CapturesSite.mjs`, mêmes noms, et recaler `shotTops` et `storeShots`
           si les écrans changent. */
        chromafight: {
            name: 'ChromaFight', platform: 'ios', game: true, accent: '#ff7a3d', accent2: '#2d2366',
            store: '',
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
                    'iPhone et iPad, portrait et paysage. Sans compte : la progression reste sur l’appareil et dans votre iCloud, jamais chez l’éditeur.'
                ],
                en: [
                    'Gloup’s tummy is a grid: drag objects to arrange them. Each time one recharges, Gloup spits it at the Greylings, and you can rearrange mid-fight.',
                    'Two identical objects dragged onto each other merge, over four levels. Three objects of the same color that touch form a chord, five a grand chord: eight colors in play.',
                    'Eleven islands and 105 levels, from the kitchen to the moon base, then a secret island. Each has its four Greylings, a mini-boss on level 5 and a boss on level 10.',
                    'Eleven friends to unlock, one per island: each gives Gloup a starting object, a tummy shape and a power. A workshop of eight upgrades makes Gloup stronger over time.',
                    'Chests on the wave bar and a chest at the end of every island, daily and weekly quests, missions, a bestiary of 44 Greylings, a free progress track and a gift every day.',
                    'No ads during a level: videos are optional, and any purchase, such as “No ads”, removes the short ad between two levels. On each island, an optional island offer, only in the Shop.',
                    'iPhone and iPad, portrait and landscape. No account: progress stays on the device and in your iCloud, never with the publisher.'
                ]
            },
            sources: { fr: 'Aucune donnée externe : les îles, les niveaux, les objets, les Grisons, les musiques et les textes sont intégrés au jeu, qui se joue hors connexion. Seules la publicité, les achats (App Store) et la copie iCloud de la sauvegarde utilisent le réseau.', en: 'No external data: the islands, levels, objects, Greylings, music and texts are built into the game, which plays offline. Only advertising, purchases (App Store) and the iCloud copy of the save use the network.' },
            business: { fr: 'Jeu gratuit, financé par la publicité Google AdMob (vidéos facultatives, et courte publicité entre deux niveaux, jamais pendant un niveau) et par des achats intégrés facultatifs : gemmes, pack de départ, « Sans pub » (suppression de la petite publicité) et offres d’île. Aucune puissance n’est vendue, aucune donnée bancaire dans l’app.', en: 'Free game, funded by Google AdMob ads (optional videos, and a short ad between two levels, never during a level) and by optional in-app purchases: gems, a starter pack, “No ads” (removal of the short ad) and island offers. No power is for sale, no payment card data in the app.' },
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
        }
    };
    var IOS_ORDER = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance', 'dvffrance'];
    /* Les jeux forment leur propre gamme : ni données publiques, ni utilitaire. */
    var GAME_ORDER = ['trouchromatique', 'mongloup', 'chromafight'];

    var MAC_ORDER = ['mactuner', 'dnstuner'];
    /* ---------------------------------------------------------------------
       Réglages propres à la vitrine
       --------------------------------------------------------------------- */

    /* Textes ajoutés par la refonte. Les autres viennent de T, inchangés. */
    var V = {
        heroKicker: { fr: 'Développeur indépendant · France', en: 'Independent developer · France' },
        heroLead: {
            fr: 'Des applications natives qui font une chose et la font bien. Sur iPhone et iPad, trois jeux avec Gloup, la petite créature aux grands yeux, et les données publiques françaises du quotidien. Sur Mac, des utilitaires libres au code entièrement ouvert.',
            en: 'Native apps that do one thing and do it well. On iPhone and iPad, three games starring Gloup, the little creature with big eyes, and everyday French public data. On Mac, free utilities with fully open source code.'
        },
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
        backAll: { fr: '← Toutes les applications', en: '← All the apps' },
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
        onGame: { fr: 'Jeu · iPhone et iPad', en: 'Game · iPhone and iPad' },
        gamesSub: { fr: 'iPhone et iPad · iOS 18 ou plus', en: 'iPhone and iPad · iOS 18 or later' },

        /* Textes ajoutés par la refonte de septembre 2026. */
        /* Refonte du 5 octobre 2026 : trois jeux, ils passent en tête de l'accueil. */
        heroTitleHTML: {
            fr: 'Des jeux, des apps, <br><span class="grad">un seul principe.</span>',
            en: 'Games and apps, <br><span class="grad">one principle.</span>'
        },
        heroShort: {
            fr: 'Trois jeux pour iPhone et iPad avec Gloup, la petite créature aux grands yeux. Cinq services publics du quotidien, natifs, gratuits et sans compte. Et deux utilitaires libres pour Mac.',
            en: 'Three games for iPhone and iPad starring Gloup, the little creature with big eyes. Five everyday public services, native, free and with no account. Plus two free utilities for Mac.'
        },
        heroGamesLabel: { fr: 'Les trois jeux', en: 'The three games' },
        onStore: { fr: 'Sur l’App Store', en: 'On the App Store' },
        soonStore: { fr: 'Bientôt sur l’App Store', en: 'Coming soon to the App Store' },
        indexTitle: { fr: 'Toutes les applications.', en: 'All the apps.' },
        discover: { fr: 'Découvrir', en: 'Discover' },
        menuApps: { fr: 'Applications', en: 'Apps' },
        menuOpen: { fr: 'Ouvrir le menu', en: 'Open the menu' },
        galleryLabel: { fr: 'Captures d’écran, défilement horizontal', en: 'Screenshots, horizontal scroll' },
        contactFinalTitle: { fr: 'Une question, une idée ?', en: 'A question, an idea?' },

        /* Refonte du 30 septembre 2026 : jeux publiés, filtre, questions, sous-barre. */
        badgeAlt: { fr: 'Télécharger {app} dans l’App Store', en: 'Download {app} on the App Store' },
        newEyebrow: { fr: 'Jeux · iPhone et iPad', en: 'Games · iPhone and iPad' },
        newTitle: { fr: 'Trois jeux avec Gloup.', en: 'Three games starring Gloup.' },
        learnMore: { fr: 'En savoir plus', en: 'Learn more' },
        get: { fr: 'Obtenir', en: 'Get' },
        getAria: { fr: 'Obtenir {app} sur l’App Store', en: 'Get {app} on the App Store' },
        filterLabel: { fr: 'Filtrer les applications', en: 'Filter the apps' },
        filterAll: { fr: 'Tout', en: 'All' },
        subOverview: { fr: 'Aperçu', en: 'Overview' },
        subFeatures: { fr: 'Fonctionnalités', en: 'Features' },
        subShots: { fr: 'Captures', en: 'Screenshots' },
        subData: { fr: 'Données', en: 'Data' },
        prev: { fr: 'Captures précédentes', en: 'Previous screenshots' },
        next: { fr: 'Captures suivantes', en: 'Next screenshots' },
        storeShotsTitle: { fr: 'Les huit écrans de la fiche App Store.', en: 'The eight App Store screens.' },
        deviceLabel: { fr: 'Choisir l’appareil', en: 'Choose the device' },
        statsEyebrow: { fr: 'En chiffres', en: 'By the numbers' },
        faqEyebrow: { fr: 'Questions fréquentes', en: 'Frequent questions' },
        faqTitle: { fr: 'Tout ce qu’il faut savoir.', en: 'Everything you need to know.' },
        /* Chaque réponse reprend un fait déjà écrit ailleurs sur le site : rien
           n'est affirmé ici qui ne soit dit sur la page d'une application. */
        faq: {
            fr: [
                ['Les applications sont-elles gratuites ?', 'Oui. Les cinq applications iPhone et les jeux Trou Chromatique et Mon Gloup se téléchargent gratuitement et sont financés par une publicité discrète. ChromaFight, bientôt sur l’App Store, sera gratuit lui aussi, avec des achats intégrés facultatifs. IRVEFrance propose des outils Premium facultatifs, DefibFrance un don facultatif qui retire la publicité. Les deux utilitaires Mac sont libres et open source, sans publicité ni achat.'],
                ['Faut-il créer un compte ?', 'Non. Aucune application ne demande de compte ni d’inscription. Favoris et réglages restent sur votre appareil.'],
                ['Fonctionnent-elles sans connexion ?', 'Les applications iPhone mettent en cache les données publiques pour rester utilisables hors connexion. Les trois jeux se jouent hors connexion ; seuls la publicité et, pour ChromaFight, les achats et la copie iCloud de la sauvegarde utilisent le réseau.'],
                ['Sur quels appareils ?', 'iPhone et iPad sous iOS 18 ou plus pour les applications et les jeux. Mac Apple Silicon sous macOS 26 ou 27 pour MacTuner et DNSTuner.'],
                ['Où trouver de l’aide ?', 'Chaque application a sa page d’assistance. Je réponds moi-même à chaque message, en général sous 24 à 48 heures.']
            ],
            en: [
                ['Are the apps free?', 'Yes. The five iPhone apps and the games Trou Chromatique and Mon Gloup are free to download and funded by discreet advertising. ChromaFight, coming soon to the App Store, will be free too, with optional in-app purchases. IRVEFrance offers optional Premium tools, DefibFrance an optional donation that removes ads. The two Mac utilities are free and open source, with no ads and no purchases.'],
                ['Do I need an account?', 'No. None of the apps asks for an account or a sign-up. Favorites and settings stay on your device.'],
                ['Do they work offline?', 'The iPhone apps cache public data so they keep working offline. The three games play offline; only advertising and, for ChromaFight, purchases and the iCloud copy of the save use the network.'],
                ['Which devices?', 'iPhone and iPad on iOS 18 or later for the apps and games. Apple Silicon Macs on macOS 26 or 27 for MacTuner and DNSTuner.'],
                ['Where can I get help?', 'Each app has its own support page. I answer every message myself, usually within 24 to 48 hours.']
            ]
        }
    };

    /*
     * Panneau des utilitaires Mac.
     *
     * Il n'existe pas de capture d'écran pour MacTuner ni pour DNSTuner : le
     * dossier n'en contient que pour les cinq applications iPhone. Plutôt qu'une
     * fenêtre vide autour d'une icône, on montre ce que l'application affiche
     * réellement à l'ouverture : ses chiffres. Le jour où des captures existent,
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


    /* ---------------------------------------------------------------------
       Fragments partagés
       --------------------------------------------------------------------- */

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function svg(corps, classe) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"' +
            ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
            (classe ? ' class="' + classe + '"' : '') + '>' + corps + '</svg>';
    }

    var CHEVRON = svg('<path d="m9 5 7 7-7 7"/>');
    var GLOBE = svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.2-3.3-8.5s1.1-6.1 3.3-8.5Z"/>', 'btn-glyph');
    var COCHE = svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.6 2.6 5.4-5.8"/>');

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
        star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>'
    };

    function icone(nom) {
        return '<span class="card-icon">' + svg(ICONES[nom] || ICONES.star) + '</span>';
    }

    function eyebrow(texte) {
        return '<p class="eyebrow"><span class="dot" aria-hidden="true"></span>' + esc(texte) + '</p>';
    }

    function rise(html, delai, classe) {
        return '<div class="rise' + (classe ? ' ' + classe : '') + '"' +
            (delai ? ' style="--d:' + delai + 'ms"' : '') + '>' + html + '</div>';
    }

    function boutonStore(cle) {
        var app = APPS[cle];
        if (!app.store) {
            return '<span class="btn btn-quiet" aria-disabled="true">' + esc(pick(V.soonBadge)) + '</span>';
        }
        if (app.platform === 'mac') {
            return '<a class="btn btn-primary" href="' + app.store + '" target="_blank" rel="noopener">' +
                esc(pick(V.openSource)) + '</a>';
        }
        return badgeAppStore(app.store, pick(V.badgeAlt).replace('{app}', app.name)) + boutonWeb(cle);
    }

    /* Le site de l'application, à côté du badge de l'App Store. Il mène à la même
       donnée sans rien installer : c'est une porte d'entrée, pas un doublon. */
    function boutonWeb(cle) {
        var url = SITES_WEB[cle];
        if (!url) { return ''; }
        return '<a class="btn btn-ghost" href="' + url + '" target="_blank" rel="noopener">' +
            GLOBE + esc(pick(V.webVersion)) + '</a>';
    }

    /* Le badge officiel d'Apple (Marketing Resources), jamais redessiné : noir
       sur fond clair, blanc sur fond sombre, dans la langue de la page. Hauteur
       48 pixels, 40 dans le pied, au-dessus du minimum de 40 que fixent ses
       règles d'usage. Les largeurs suivent les proportions de chaque fichier. */
    var BADGE = { fr: ['app-store-fr', 152, 127], en: ['app-store-en', 144, 120] };

    function badgeAppStore(url, texte, petit) {
        var b = BADGE[lang] || BADGE.fr;
        return '<a class="store-badge' + (petit ? ' is-small' : '') + '" href="' + url + '" target="_blank" rel="noopener">' +
            '<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/img/' + b[0] + '-white.svg">' +
            '<img src="./assets/img/' + b[0] + '.svg" width="' + (petit ? b[2] : b[1]) + '" height="' + (petit ? 40 : 48) + '"' +
            ' decoding="async" alt="' + esc(texte) + '"></picture></a>';
    }

    function lienPlus(href, texte) {
        return '<a class="link-more" href="' + href + '">' + esc(texte) + CHEVRON + '</a>';
    }

    /**
     * L'appareil d'une application, prêt à être incliné.
     *
     * Trois couches, chacune avec une seule transformation : `device` porte la
     * perspective, `device-3d` le redressement lié au défilement, `tilt`
     * l'inclinaison vers le pointeur. Superposées sur un même élément, la
     * dernière écraserait les deux autres.
     */
    function appareil(cle, charger) {
        var app = APPS[cle];
        var chargement = charger ? '' : ' loading="lazy"';
        var interieur;
        if (app.platform === 'mac') {
            var lignes = (MAC_PANNEAU[cle] ? pick(MAC_PANNEAU[cle]) : []).map(function (l) {
                return '<div class="macwin-row"><span>' + esc(l[0]) + '</span>' +
                    '<b>' + esc(l[1]) + '</b></div>';
            }).join('');
            interieur = '<div class="device-3d is-mac"><div class="tilt shine">' +
                '<div class="macwin"><div class="macwin-bar" aria-hidden="true">' +
                '<i></i><i></i><i></i><span class="macwin-title">' + esc(app.name) + '</span></div>' +
                '<div class="macwin-body"><div class="macwin-head">' +
                picture('./assets/img/' + cle + '.png', ' width="60" height="60" alt=""' + chargement + ' decoding="async"') +
                '<div><b>' + esc(app.name) + '</b><span>' + esc(pick(app.tag)) + '</span></div></div>' +
                '<div class="macwin-rows">' + lignes + '</div></div></div>' +
                '</div></div>';
        } else if (app.storeShots) {
            interieur = '<div class="device-3d is-phone"><div class="tilt">' +
                telephoneJeu(cle, 1, app.name + ', ' + pick(app.storeShots)[0], !charger,
                    '(max-width: 560px) 70vw, 300px', 'float') +
                '</div></div>';
        } else {
            return '';
        }
        return '<div class="device" data-tilt>' + interieur + '</div>';
    }

    /**
     * Une tuile d'application : l'icône, le nom, une ligne, un appel.
     *
     * L'accueil et la page Contact s'en servent toutes deux : l'une pour ouvrir la
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

        return '<a class="app-tile shine" data-tilt="self" href="' + href + '"' + externe +
            ' style="--accent:' + app.accent + '">' +
            '<span class="app-tile-icon">' +
            picture('./assets/img/' + cle + '.png', ' width="64" height="64" alt="" loading="lazy" decoding="async"') +
            '</span>' +
            '<span class="app-tile-text"><b>' + esc(app.name) + '</b>' +
            '<span class="app-tile-tag">' + esc(sousTitre) + '</span></span>' +
            bientot +
            '<span class="app-tile-go" aria-hidden="true">' + esc(options.appel || pick(V.discover)) + CHEVRON + '</span>' +
            '</a>';
    }

    function pastilles(cle) {
        var app = APPS[cle];
        var faits = pick(app.chips || (app.platform === 'mac' ? V.chipsMac : (app.game ? V.chipsGame : V.chipsIOS))) || [];
        return '<ul class="facts">' + faits.map(function (f) {
            return '<li>' + esc(f) + '</li>';
        }).join('') + '</ul>';
    }

    function listePoints(items, limite) {
        return '<ul class="points">' + items.slice(0, limite || items.length).map(function (texte) {
            return '<li>' + COCHE + '<span>' + esc(texte) + '</span></li>';
        }).join('') + '</ul>';
    }

    function carte(contenu) {
        return '<article class="card shine" data-tilt="self">' + contenu + '</article>';
    }

    /* ---------------------------------------------------------------------
       Barre de navigation et menu
       --------------------------------------------------------------------- */

    function navHTML(page) {
        function lien(href, texte, actif) {
            return '<a href="' + withLang(href) + '"' + (actif ? ' aria-current="page"' : '') + '>' +
                esc(texte) + '</a>';
        }
        var entrees = [
            ['./index.html#jeux', pick(V.navGames), false],
            ['./index.html#ios', pick(T.navIOS), false],
            ['./index.html#mac', pick(T.navMac), false],
            ['./about.html', pick(T.navAbout), page === 'v2-about'],
            ['./contact.html', pick(T.navContact), page === 'v2-contact']
        ];
        var menu = entrees.map(function (e, i) {
            return '<a href="' + withLang(e[0]) + '" style="--i:' + i + '">' + esc(e[1]) + '</a>';
        }).join('') +
            '<small>' + esc(pick(V.menuApps)) + '</small>' +
            GAME_ORDER.concat(IOS_ORDER, MAC_ORDER).map(function (k, i) {
                return '<a class="nav-menu-app" href="' + withLang('./' + k + '.html') + '" style="--i:' + (i + entrees.length) + '">' +
                    esc(APPS[k].name) + '</a>';
            }).join('');

        return '<a class="skip-link" href="#main">' + esc(pick(T.skipLink)) + '</a>' +
            '<header class="nav" id="nav"><div class="nav-inner">' +
            '<a class="nav-brand" href="' + withLang('./index.html') + '">' +
            '<img src="./assets/img/favicon.svg" width="26" height="26" alt="" decoding="async">' +
            '<span>Rodolphe Vandaele</span></a>' +
            '<nav class="nav-links" aria-label="Navigation">' +
            entrees.map(function (e) { return lien(e[0], e[1], e[2]); }).join('') +
            '<span class="lang-switch">' +
            '<a href="?lang=fr" data-lang="fr" lang="fr" aria-current="' + (lang === 'fr') + '">FR</a>' +
            '<a href="?lang=en" data-lang="en" lang="en" aria-current="' + (lang === 'en') + '">EN</a>' +
            '</span></nav>' +
            '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"' +
            ' aria-label="' + esc(pick(V.menuOpen)) + '"><span></span><span></span></button>' +
            '</div></header>' +
            '<nav class="nav-menu" id="nav-menu" aria-label="Menu" inert>' + menu + '</nav>';
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
        /* Les pages légales de chaque application iPhone, telles que déclarées sur
           l'App Store. Les utilitaires Mac n'en ont pas. */
        function ligneDocs(titre, suffixe) {
            return '<p><b>' + esc(titre) + '</b>' + IOS_ORDER.concat(GAME_ORDER).map(function (k) {
                return '<a href="' + withLang('./' + k + '-' + suffixe + '.html') + '">' + esc(APPS[k].name) + '</a>';
            }).join('') + '</p>';
        }

        return '<footer class="footer"><div class="wrap">' +
            '<div class="footer-grid">' +
            '<div class="footer-brand"><b>Rodolphe Vandaele</b><p>' + esc(pick(T.footerLine)) + '</p></div>' +
            colonne(pick(T.footerApps), IOS_ORDER) +
            colonne(pick(V.navGames), GAME_ORDER) +
            colonne(pick(T.navMac), MAC_ORDER) +
            '<nav aria-label="' + esc(pick(T.footerSite)) + '"><h2>' + esc(pick(T.footerSite)) + '</h2>' +
            '<a href="' + withLang('./about.html') + '">' + esc(pick(T.navAbout)) + '</a>' +
            '<a href="' + withLang('./contact.html') + '">' + esc(pick(T.navContact)) + '</a>' +
            '<a href="' + withLang('./about.html') + '#mentions">' + esc(pick(T.legalTitleSite)) + '</a>' +
            '<a href="' + LIBERAPAY + '" target="_blank" rel="noopener">Liberapay</a>' +
            '<a href="mailto:' + MAIL + '">' + MAIL + '</a></nav>' +
            '</div>' +
            '<div class="footer-band">' +
            badgeAppStore(STORE_DEV, pick(T.footerStore), true) +
            (partenaires ? '<div class="footer-side">' +
                '<span class="partner-label">' + esc(pick(T.footerPartners)) + '</span>' +
                partenaires + '</div>' : '') +
            '</div>' +
            '<div class="footer-docs">' + ligneDocs(pick(T.privacyLink), 'privacy') +
            ligneDocs(pick(T.supportLink), 'support') + '</div>' +
            '<div class="footer-legal"><span>© 2026 Rodolphe Vandaele</span>' +
            '<span>' + esc(pick(T.footerTagline)) + '</span></div>' +
            '</div></footer>';
    }

    /* ---------------------------------------------------------------------
       Accueil
       --------------------------------------------------------------------- */

    /* Les icônes des dix applications sur leur anneau. L'anneau double l'index qui suit : il est
       décoratif pour les lecteurs d'écran, et ses liens sortent de l'ordre de
       tabulation. */
    function anneau() {
        var cles = IOS_ORDER.concat(GAME_ORDER, MAC_ORDER);
        return '<div class="orbit-stage" aria-hidden="true"><div class="orbit"><div class="orbit-scroll">' +
            '<div class="orbit-ring" style="--n:' + cles.length + '">' +
            cles.map(function (k, i) {
                return '<div class="orbit-item" style="--i:' + i + '">' +
                    '<a href="' + withLang('./' + k + '.html') + '" tabindex="-1">' +
                    picture('./assets/img/' + k + '.png', ' width="118" height="118" alt="" decoding="async"') +
                    '</a></div>';
            }).join('') +
            '</div></div></div></div>';
    }

    function sectionApp(cle, index) {
        var app = APPS[cle];
        var mac = app.platform === 'mac';
        var classes = 'scene is-screen' + (mac ? ' theme-dark' : (index % 2 ? ' alt' : ''));
        var plateforme = mac ? pick(V.onMac) : pick(app.game ? V.onGame : V.onIPhone);

        return '<section class="' + classes + '" id="' + cle + '" style="--accent:' + app.accent + '">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap split">' +
            '<div class="split-copy">' +
            rise(eyebrow(plateforme) + '<h2>' + esc(app.name) + '</h2>' +
                '<p class="lead">' + esc(pick(app.desc)) + '</p>') +
            rise(pastilles(cle), 80) +
            rise(listePoints(pick(app.features) || [], 3), 140) +
            rise('<div class="btn-row">' + boutonStore(cle) +
                lienPlus(withLang('./' + cle + '.html'), pick(T.iosPage)) + '</div>', 200) +
            '</div>' +
            rise(appareil(cle), 60) +
            '</div></section>';
    }

    function renderHome() {
        /* Les trois jeux dès le premier écran : icône, nom, statut. Un jeu à venir
           le dit ici plutôt que de promettre une fiche App Store. */
        var jeuxHero = '<nav class="hero-games" aria-label="' + esc(pick(V.heroGamesLabel)) + '">' +
            GAME_ORDER.map(function (k) {
                var app = APPS[k];
                return '<a class="hero-game shine" data-tilt="self" href="' + withLang('./' + k + '.html') + '"' +
                    ' style="--accent:' + app.accent + '">' +
                    picture('./assets/img/' + k + '.png', ' width="56" height="56" alt="" decoding="async"') +
                    '<span><b>' + esc(app.name) + '</b>' +
                    '<small' + (app.store ? '' : ' class="is-soon"') + '>' +
                    esc(pick(app.store ? V.onStore : V.soonStore)) + '</small></span></a>';
            }).join('') + '</nav>';

        var hero = '<section class="scene is-hero center" id="main">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap">' +
            rise(eyebrow(pick(V.heroKicker)) +
                '<h1>' + pick(V.heroTitleHTML) + '</h1>' +
                '<p class="lead">' + esc(pick(V.heroShort)) + '</p>') +
            rise('<div class="btn-row">' +
                '<a class="btn btn-primary" href="#les-jeux">' + esc(pick(V.seeGames)) + '</a>' +
                '<a class="btn btn-ghost" href="#apps">' + esc(pick(V.seeApps)) + '</a>' +
                badgeAppStore(STORE_DEV, pick(T.footerStore)) +
                '</div>', 80) +
            rise(jeuxHero, 140) +
            '</div>' + anneau() + '</section>';

        /*
         * Les trois jeux, en tuiles côte à côte comme les nouveautés d'une page
         * d'accueil de constructeur : un nom, une phrase, le badge (ou « Bientôt
         * sur l'App Store »), et trois captures en éventail qui s'écartent au survol.
         */
        function promo(cle) {
            var app = APPS[cle];
            var legendes = pick(app.storeShots);
            var eventail = [3, 1, 5].map(function (n, i) {
                return '<div class="promo-shot" style="--k:' + (i - 1) + '">' +
                    telephoneJeu(cle, n, i === 1 ? app.name + ', ' + legendes[n - 1] : '', true,
                        '(max-width: 560px) 34vw, 220px') + '</div>';
            }).join('');
            return '<article class="promo" style="--accent:' + app.accent + ';--accent-2:' + app.accent2 + '">' +
                '<div class="promo-copy">' +
                picture('./assets/img/' + cle + '.png', ' class="promo-icon" width="76" height="76" alt="" loading="lazy" decoding="async"') +
                '<p class="promo-kicker">' + esc(pick(app.tag)) + '</p>' +
                '<h3>' + esc(app.name) + '</h3>' +
                '<p class="promo-line">' + esc(pick(app.promo)) + '</p>' +
                '<div class="btn-row">' + (app.store
                    ? badgeAppStore(app.store, pick(V.badgeAlt).replace('{app}', app.name))
                    : '<span class="btn btn-quiet" aria-disabled="true">' + esc(pick(V.soonStore)) + '</span>') +
                lienPlus(withLang('./' + cle + '.html'), pick(V.learnMore)) + '</div>' +
                '</div>' +
                '<div class="promo-fan">' + eventail + '</div>' +
                '</article>';
        }

        var nouveautes = '<section class="scene alt is-tight" id="les-jeux" aria-labelledby="nouveau-titre">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(V.newEyebrow)) + '<h2 class="small" id="nouveau-titre">' + esc(pick(V.newTitle)) + '</h2>') +
            '<div class="promo-grid' + (GAME_ORDER.length === 3 ? ' is-three' : '') + '">' +
            GAME_ORDER.map(function (k, i) { return rise(promo(k), i * 100); }).join('') +
            '</div></div></section>';

        var manifeste = '<section class="scene is-tight center">' +
            '<div class="wrap"><p class="manifesto" style="margin-inline:auto">' + esc(pick(V.heroLead)) + '</p></div>' +
            '</section>';

        /*
         * L'index des applications, rangé par gamme : trois jeux, cinq apps sur
         * iPhone, deux sur Mac. Trois publics, et le site les sépare partout ailleurs.
         */
        function groupe(titre, cles, sousTitre, classe, filtre) {
            return '<section class="app-group" data-group="' + filtre + '" aria-label="' + esc(titre) + '">' +
                '<h3 class="app-group-head">' + esc(titre) + '<span>' + esc(sousTitre) + '</span></h3>' +
                '<div class="app-tiles' + (classe ? ' ' + classe : '') + '">' +
                cles.map(function (k) { return tuileApp(k); }).join('') +
                '</div></section>';
        }

        var index = '<section class="scene alt is-tight" id="apps">' +
            '<div class="wrap">' +
            rise('<div class="index-head"><h2 class="small">' + esc(pick(V.indexTitle)) + '</h2>' +
                '<div class="segmented" role="group" aria-label="' + esc(pick(V.filterLabel)) + '">' +
                [['all', pick(V.filterAll)], ['games', pick(V.navGames)], ['ios', pick(T.navIOS)], ['mac', pick(T.navMac)]]
                    .map(function (f, i) {
                        return '<button type="button" data-filter="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + esc(f[1]) + '</button>';
                    }).join('') +
                '</div></div>') +
            rise('<div class="app-index">' +
                groupe(pick(V.navGames), GAME_ORDER, pick(V.gamesSub), 'is-three', 'games') +
                groupe(pick(T.navIOS), IOS_ORDER, pick(V.onIPhone), '', 'ios') +
                groupe(pick(T.navMac), MAC_ORDER, pick(V.onMac), 'is-two', 'mac') +
                '</div>', 80) +
            '</div></section>';

        var sections = '<div id="jeux"></div>' +
            GAME_ORDER.map(function (k, i) { return sectionApp(k, i); }).join('') +
            '<div id="ios"></div>' +
            IOS_ORDER.map(function (k, i) { return sectionApp(k, GAME_ORDER.length + i); }).join('') +
            '<div id="mac"></div>' +
            MAC_ORDER.map(function (k, i) { return sectionApp(k, i); }).join('');

        var valeurs = '<section class="scene alt">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.valuesEyebrow)) + '<h2 class="small">' + esc(pick(T.valuesTitle)) + '</h2>') +
            '<div class="cards">' +
            pick(T.values).map(function (v, i) {
                return rise(carte(icone(v[0]) + '<h3>' + esc(v[1]) + '</h3><p>' + esc(v[2]) + '</p>'), i * 90);
            }).join('') +
            '</div></div></section>';

        var questions = '<section class="scene" aria-labelledby="faq-titre">' +
            '<div class="wrap narrow">' +
            rise(eyebrow(pick(V.faqEyebrow)) + '<h2 class="small" id="faq-titre">' + esc(pick(V.faqTitle)) + '</h2>') +
            rise('<div class="faq">' + pick(V.faq).map(function (q) {
                return '<details><summary>' + esc(q[0]) + '<span class="faq-sign" aria-hidden="true"></span></summary>' +
                    '<p>' + esc(q[1]) + '</p></details>';
            }).join('') + '</div>', 80) +
            '</div></section>';

        var contact = '<section class="scene center">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.contactEyebrow)) +
                '<h2>' + esc(pick(V.contactFinalTitle)) + '</h2>' +
                '<p class="lead">' + esc(pick(V.contactLead)) + '</p>') +
            rise('<div class="btn-row">' +
                '<a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(V.contactWrite)) + '</a>' +
                lienPlus(withLang('./about.html'), pick(T.navAbout)) +
                '</div>', 100) +
            '</div></section>';

        return navHTML('v2-home') + '<main>' + hero + nouveautes + manifeste + index + sections + valeurs + questions + contact + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Page d'une application
       --------------------------------------------------------------------- */

    /* La grille des fonctions : la première carte occupe deux colonnes sur trois.
       La dernière s'élargit pour fermer la rangée, sans quoi une carte isolée
       pendrait sous la grille. */
    function fonctionsBento(items) {
        var reste = (items.length + 1) % 3;
        return items.map(function (texte, i) {
            var classe = i === items.length - 1 && i > 0
                ? (reste === 1 ? 'span-3' : (reste === 2 ? 'span-2' : ''))
                : '';
            return rise(carte('<span class="card-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span><p>' + esc(texte) + '</p>'),
                (i % 3) * 80, classe);
        }).join('');
    }

    function renderApp(cle) {
        var app = APPS[cle];
        var mac = app.platform === 'mac';
        var plateforme = mac ? pick(V.onMac) : pick(app.game ? V.onGame : V.onIPhone);
        var liens = mac ? '' :
            '<a class="btn btn-quiet" href="' + withLang('./' + cle + '-support.html') + '">' +
            esc(pick(T.supportLink)) + '</a>' +
            '<a class="btn btn-quiet" href="' + withLang('./' + cle + '-privacy.html') + '">' +
            esc(pick(T.privacyLink)) + '</a>';

        var hero = '<section class="scene is-hero center' + (mac ? ' theme-dark' : '') + '" id="main" style="--accent:' + app.accent + '">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap">' +
            rise('<p>' + '<a class="link-more back" href="' + withLang('./index.html') + '">' + CHEVRON +
                esc(pick(V.allApps)) + '</a></p>') +
            rise('<div class="app-hero-icon" data-tilt><div class="tilt shine">' +
                picture('./assets/img/' + cle + '.png', ' width="136" height="136" alt="" decoding="async"') +
                '</div></div>', 40) +
            rise(eyebrow(plateforme) + '<h1>' + esc(app.name) + '</h1>' +
                '<p class="lead wide">' + esc(pick(app.desc)) + '</p>', 80) +
            rise('<div class="facts-center">' + pastilles(cle) + '</div>', 120) +
            rise('<div class="btn-row">' + boutonStore(cle) + liens + '</div>', 160) +
            '<div class="hero-device">' + appareil(cle, true) + '</div>' +
            '</div></section>';

        /* La sous-barre des pages produit : le nom, les sections, et l'appel à
           télécharger, toujours à portée pendant la lecture. */
        var appel = '';
        if (app.store) {
            appel = mac
                ? '<a class="subnav-cta" href="' + app.store + '" target="_blank" rel="noopener">' + esc(pick(V.openSource)) + '</a>'
                : '<a class="subnav-cta" href="' + app.store + '" target="_blank" rel="noopener" aria-label="' +
                  esc(pick(V.getAria).replace('{app}', app.name)) + '">' + esc(pick(V.get)) + '</a>';
        }
        var aCaptures = !!app.storeShots;
        var sousBarre = '<nav class="subnav" aria-label="' + esc(app.name) + '"><div class="subnav-inner">' +
            '<a class="subnav-title" href="#main">' + esc(app.name) + '</a>' +
            '<div class="subnav-links">' +
            '<a href="#main">' + esc(pick(V.subOverview)) + '</a>' +
            '<a href="#fonctions">' + esc(pick(V.subFeatures)) + '</a>' +
            (aCaptures ? '<a href="#captures">' + esc(pick(V.subShots)) + '</a>' : '') +
            '<a href="#donnees">' + esc(pick(V.subData)) + '</a>' +
            '</div>' + appel + '</div></nav>';

        var chiffres = '';
        if (app.stats) {
            chiffres = '<section class="scene is-tight stats-band" style="--accent:' + app.accent + '" aria-label="' + esc(pick(V.statsEyebrow)) + '">' +
                '<div class="wrap"><dl class="stats">' +
                pick(app.stats).map(function (st, i) {
                    return '<div class="stat rise"' + (i ? ' style="--d:' + i * 80 + 'ms"' : '') + '>' +
                        '<dt>' + esc(st[1]) + '</dt>' +
                        '<dd data-count="' + esc(st[0]) + '">' + esc(st[0]) + '</dd></div>';
                }).join('') +
                '</dl></div></section>';
        }

        var fonctions = '<section class="scene alt" id="fonctions" style="--accent:' + app.accent + '">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.featEyebrow)) + '<h2 class="small">' + esc(pick(app.game ? V.featuresTitleGame : V.featuresTitle)) + '</h2>') +
            '<div class="cards bento">' +
            fonctionsBento(pick(app.features) || []) +
            '</div></div></section>';

        var captures = '';
        if (app.storeShots) {
            var legendes = pick(app.storeShots);
            /* Une bande par appareil, iPhone d'abord ; le sélecteur montre l'une ou
               l'autre. Les images de la bande cachée, différées, ne se chargent pas.
               Les applications n'ont que l'iPhone : ni sélecteur ni bande d'iPad. */
            var ipad = !!app.game;
            var bande = function (appareil, figure) {
                return '<div class="gallery is-rail" data-device="' + appareil + '"' + (appareil === 'ipad' ? ' hidden' : '') +
                    ' tabindex="0" role="region" aria-label="' + esc(pick(V.galleryLabel) + ', ' + (appareil === 'ipad' ? 'iPad' : 'iPhone')) + '">' +
                    legendes.map(function (legende, i) {
                        return '<figure class="shot">' + figure(i + 1, app.name + ', ' + legende) +
                            '<figcaption>' + esc(legende) + '</figcaption></figure>';
                    }).join('') + '</div>';
            };
            captures = '<section class="scene theme-dark" id="captures" style="--accent:' + app.accent + '">' +
                '<span class="glow" aria-hidden="true"></span>' +
                '<div class="wrap rail-head">' +
                rise(eyebrow(pick(T.shotsEyebrow)) + '<h2 class="small">' + esc(pick(ipad ? V.storeShotsTitle : V.shotsTitle)) + '</h2>') +
                '<div class="rail-tools">' +
                (ipad ? '<div class="segmented" role="group" aria-label="' + esc(pick(V.deviceLabel)) + '">' +
                '<button type="button" data-device="iphone" aria-pressed="true">iPhone</button>' +
                '<button type="button" data-device="ipad" aria-pressed="false">iPad</button></div>' : '') +
                '<div class="rail-nav">' +
                '<button class="rail-btn" type="button" data-dir="-1" aria-label="' + esc(pick(V.prev)) + '">' + CHEVRON + '</button>' +
                '<button class="rail-btn" type="button" data-dir="1" aria-label="' + esc(pick(V.next)) + '">' + CHEVRON + '</button>' +
                '</div></div></div>' +
                bande('iphone', function (n, alt) {
                    return telephoneJeu(cle, n, alt, true, '(max-width: 560px) 62vw, 280px');
                }) +
                (ipad ? bande('ipad', function (n, alt) {
                    return tabletteJeu(cle, n, alt, '(max-width: 560px) 80vw, 440px');
                }) : '') +
                '</section>';
        }

        var methode = '<section class="scene" id="donnees" style="--accent:' + app.accent + '">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.dataEyebrow)) + '<h2 class="small">' + esc(pick(V.methodTitle)) + '</h2>') +
            '<div class="cards">' +
            rise(carte(icone('book') + '<h3>' + esc(pick(T.dataSources)) + '</h3><p>' + esc(pick(app.sources)) + '</p>')) +
            rise(carte(icone('shield') + '<h3>' + esc(pick(T.dataBusiness)) + '</h3><p>' + esc(pick(app.business)) + '</p>'), 90) +
            '</div>' +
            rise('<div class="btn-row">' + boutonStore(cle) +
                lienPlus(withLang('./index.html'), pick(V.allApps)) + '</div>', 120) +
            '</div></section>';

        return navHTML('v2-app') + '<main>' + sousBarre + hero + chiffres + fonctions + captures + methode + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       À propos
       --------------------------------------------------------------------- */

    function renderAbout() {
        var hero = '<section class="scene is-hero center" id="main">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap">' +
            rise('<div class="portrait-wrap" data-tilt><div class="tilt">' +
                picture('./assets/img/profile.jpg',
                    ' class="portrait" width="200" height="200" alt="Rodolphe Vandaele" decoding="async"') +
                '</div></div>') +
            rise(eyebrow(pick(T.profileEyebrow)) +
                '<h1><span class="grad">' + esc(pick(V.aboutTitle)) + '</span></h1>' +
                '<p class="lead wide">' + esc(pick(T.profileBio)) + '</p>', 80) +
            rise('<div class="btn-row">' +
                '<a class="btn btn-primary" href="' + withLang('./contact.html') + '">' + esc(pick(T.profileCTA)) + '</a>' +
                lienPlus(withLang('./index.html'), pick(V.allApps)) +
                '</div>', 140) +
            '</div></section>';

        var gammes = '<section class="scene alt">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.aboutLinesEyebrow)) + '<h2 class="small">' + esc(pick(T.aboutLinesTitle)) + '</h2>') +
            '<div class="cards">' +
            pick(T.aboutLines).map(function (l, i) {
                return rise(carte(icone(l[0]) + '<h3>' + esc(l[1]) + '</h3><p>' + esc(l[2]) + '</p>'), i * 90);
            }).join('') +
            '</div></div></section>';

        var methode = '<section class="scene">' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.aboutMethodEyebrow)) + '<h2 class="small">' + esc(pick(T.aboutMethodTitle)) + '</h2>') +
            '<div class="cards">' +
            pick(T.aboutMethod).map(function (m, i) {
                return rise(carte(icone(m[0]) + '<h3>' + esc(m[1]) + '</h3><p>' + esc(m[2]) + '</p>'), (i % 2) * 90);
            }).join('') +
            '</div></div></section>';

        /* Section volontairement sobre : une mention légale n'a pas à parler
           aussi fort qu'un titre de produit. */
        var legal = '<section class="scene alt is-tight is-legal" id="mentions">' +
            '<div class="wrap">' +
            rise('<h2>' + esc(pick(T.legalTitleSite)) + '</h2>') +
            '<div class="cards">' +
            rise('<article class="card"><h3>' + esc(pick(T.legalEditor)) + '</h3>' +
                '<p>' + esc(pick(T.legalEditorText)) + '<br>' +
                '<a class="legal-mail" href="mailto:' + MAIL + '">' + MAIL + '</a></p></article>') +
            rise('<article class="card"><h3>' + esc(pick(T.legalHost)) + '</h3>' +
                '<p>' + esc(pick(T.legalHostText)) + '</p></article>', 80) +
            rise('<article class="card"><h3>' + esc(pick(T.legalContent)) + '</h3>' +
                '<p>' + esc(pick(T.legalContentText)) + '</p></article>', 160) +
            '</div></div></section>';

        return navHTML('v2-about') + '<main>' + hero + gammes + methode + legal + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Contact
       --------------------------------------------------------------------- */

    function renderContact() {
        var sujets = IOS_ORDER.concat(GAME_ORDER, MAC_ORDER).map(function (k) {
            var app = APPS[k];
            return tuileApp(k, {
                href: app.platform === 'mac' ? app.store : withLang('./' + k + '-support.html'),
                externe: app.platform === 'mac',
                sousTitre: pick(T.supportLink),
                appel: pick(T.iosPage)
            });
        }).join('');

        var objet = encodeURIComponent(pick(T.mailSubject) || 'Contact');
        var hero = '<section class="scene is-hero center" id="main">' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="wrap">' +
            rise(eyebrow(pick(T.contactEyebrow)) +
                '<h1>' + esc(pick(V.contactTitle)) + '</h1>' +
                '<p class="lead">' + esc(pick(V.contactLead)) + '</p>') +
            rise('<div class="btn-row">' +
                '<a class="btn btn-primary contact-mail" href="mailto:' + MAIL + '?subject=' + objet + '">' +
                svg(ICONES.mail, 'btn-glyph') + MAIL + '</a>' +
                '</div>', 100) +
            '</div></section>';

        var parApp = '<section class="scene alt">' +
            '<div class="wrap">' +
            rise('<h2 class="small">' + esc(pick(V.contactPerApp)) + '</h2>' +
                '<p class="lead wide">' + esc(pick(V.contactPerAppLead)) + '</p>') +
            rise('<div class="app-tiles is-ten" style="margin-top:48px">' + sujets + '</div>', 80) +
            '</div></section>';

        return navHTML('v2-contact') + '<main>' + hero + parApp + '</main>' + footerHTML();
    }

    /* ---------------------------------------------------------------------
       Comportements
       --------------------------------------------------------------------- */

    var reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pointeurFin = window.matchMedia
        && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Chaque bloc marqué `rise` monte à son entrée dans le cadre. Sans
       observateur, ou si le mouvement est réduit, tout est montré d'emblée :
       une décoration ne doit jamais coûter le contenu. */
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
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
        blocs.forEach(function (b) { io.observe(b); });
    }

    /* La barre prend les couleurs d'une section toujours sombre dès qu'elle en
       recouvre le haut, et gagne son filet dès que la page a défilé. Les
       écouteurs ne s'installent qu'une fois ; la barre et les sections sont
       relues à chaque passage, parce qu'un changement de langue les reconstruit. */
    function attacheNav() {
        var enAttente = false;

        function maj() {
            enAttente = false;
            var nav = document.getElementById('nav');
            if (!nav) { return; }
            nav.classList.toggle('is-scrolled', scrollY > 8);
            var repere = nav.offsetHeight + 2;
            var sections = document.querySelectorAll('.scene');
            var sombre = false;
            for (var i = 0; i < sections.length; i++) {
                var r = sections[i].getBoundingClientRect();
                if (r.top <= repere && r.bottom > repere) {
                    sombre = sections[i].classList.contains('theme-dark');
                    break;
                }
            }
            nav.classList.toggle('on-dark', sombre);

            var sous = document.querySelector('.subnav');
            if (sous) {
                var repereSous = nav.offsetHeight + sous.offsetHeight + 2;
                var sousSombre = false;
                for (var j = 0; j < sections.length; j++) {
                    var rs = sections[j].getBoundingClientRect();
                    if (rs.top <= repereSous && rs.bottom > repereSous) {
                        sousSombre = sections[j].classList.contains('theme-dark');
                        break;
                    }
                }
                sous.classList.toggle('on-dark', sousSombre);
            }
        }

        addEventListener('scroll', function () {
            if (enAttente) { return; }
            enAttente = true;
            requestAnimationFrame(maj);
        }, { passive: true });
        addEventListener('resize', maj);
        return maj;
    }

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
        var large = matchMedia('(min-width: 761px)');
        var fermer = function (m) { if (m.matches) { basculerMenu(false); } };
        if (large.addEventListener) { large.addEventListener('change', fermer); }
    }

    /**
     * Inclinaison vers le pointeur.
     *
     * Une zone `[data-tilt]` suit le curseur sur deux axes, de quelques degrés :
     * assez pour donner du relief à une image plate, trop peu pour distraire.
     * La cible est l'enfant `.tilt`, ou la zone elle-même si elle porte
     * `data-tilt="self"`. Les valeurs passent par des propriétés personnalisées,
     * et la feuille de style garde la main sur la composition. Rien ne
     * s'installe sur un écran tactile : un doigt n'a pas de survol.
     */
    function attacheInclinaison() {
        if (reduceMotion || !pointeurFin) { return; }

        document.querySelectorAll('[data-tilt]').forEach(function (zone) {
            var cible = zone.getAttribute('data-tilt') === 'self' ? zone : zone.querySelector('.tilt');
            if (!cible) { return; }
            var force = cible === zone ? 8 : 14;
            var attente = false;
            var dernier = null;

            zone.addEventListener('pointermove', function (e) {
                dernier = e;
                if (attente) { return; }
                attente = true;
                requestAnimationFrame(function () {
                    attente = false;
                    var r = zone.getBoundingClientRect();
                    var x = (dernier.clientX - r.left) / r.width;
                    var y = (dernier.clientY - r.top) / r.height;
                    cible.style.setProperty('--ry', ((x - 0.5) * force).toFixed(2) + 'deg');
                    cible.style.setProperty('--rx', ((0.5 - y) * force * 0.75).toFixed(2) + 'deg');
                    cible.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
                    cible.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
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

    /* L'anneau d'icônes penche vers le pointeur, sur tout le premier écran. */
    function attacheAnneau() {
        if (reduceMotion || !pointeurFin) { return; }
        var anneauEl = document.querySelector('.orbit');
        var scene = anneauEl && anneauEl.closest('.scene');
        if (!scene) { return; }
        var attente = false;
        var dernier = null;
        scene.addEventListener('pointermove', function (e) {
            dernier = e;
            if (attente) { return; }
            attente = true;
            requestAnimationFrame(function () {
                attente = false;
                var r = scene.getBoundingClientRect();
                anneauEl.style.setProperty('--px', ((dernier.clientX - r.left) / r.width - 0.5).toFixed(3));
                anneauEl.style.setProperty('--py', ((dernier.clientY - r.top) / r.height - 0.5).toFixed(3));
            });
        });
        scene.addEventListener('pointerleave', function () {
            anneauEl.style.setProperty('--px', '0');
            anneauEl.style.setProperty('--py', '0');
        });
    }

    /* Le filtre de l'index : un groupe à la fois, ou tous. Les groupes écartés
       prennent `hidden`, et sortent donc aussi de la lecture d'écran. */
    function attacheFiltre() {
        var boutons = document.querySelectorAll('.segmented [data-filter]');
        boutons.forEach(function (b) {
            b.addEventListener('click', function () {
                var f = b.getAttribute('data-filter');
                boutons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                document.querySelectorAll('.app-group[data-group]').forEach(function (g) {
                    g.hidden = f !== 'all' && g.getAttribute('data-group') !== f;
                });
            });
        });
    }

    /* Les flèches de la bande de captures : un écran de défilement par clic,
       et chacune s'éteint en butée. Elles agissent sur la bande visible, que le
       sélecteur d'appareil choisit. */
    function attacheBandes() {
        document.querySelectorAll('.rail-nav').forEach(function (nav) {
            var section = nav.closest('.scene');
            var bandes = section.querySelectorAll('.gallery.is-rail');
            var fleches = nav.querySelectorAll('.rail-btn');
            var appareils = section.querySelectorAll('button[data-device]');
            function visible() {
                for (var i = 0; i < bandes.length; i++) { if (!bandes[i].hidden) { return bandes[i]; } }
                return bandes[0];
            }
            function maj() {
                var bande = visible();
                var fin = bande.scrollWidth - bande.clientWidth - 2;
                fleches.forEach(function (f) {
                    var avant = f.getAttribute('data-dir') === '-1';
                    f.disabled = avant ? bande.scrollLeft <= 2 : bande.scrollLeft >= fin;
                });
            }
            fleches.forEach(function (f) {
                f.addEventListener('click', function () {
                    var bande = visible();
                    bande.scrollBy({
                        left: Number(f.getAttribute('data-dir')) * bande.clientWidth * 0.8,
                        behavior: reduceMotion ? 'auto' : 'smooth'
                    });
                });
            });
            appareils.forEach(function (b) {
                b.addEventListener('click', function () {
                    var choix = b.getAttribute('data-device');
                    appareils.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                    bandes.forEach(function (g) { g.hidden = g.getAttribute('data-device') !== choix; });
                    maj();
                });
            });
            bandes.forEach(function (bande) {
                bande.addEventListener('scroll', function () { requestAnimationFrame(maj); }, { passive: true });
            });
            addEventListener('resize', maj);
            maj();
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

    var majNav = null;

    function render() {
        var root = document.getElementById('site-root');
        if (!root) { return; }
        var page = document.body.getAttribute('data-page');
        var appKey = document.body.getAttribute('data-app');
        document.documentElement.lang = lang;

        var html;
        if (page === 'v2-home') { html = renderHome(); }
        else if (page === 'v2-app' && APPS[appKey]) { html = renderApp(appKey); }
        else if (page === 'v2-contact') { html = renderContact(); }
        else if (page === 'v2-about') { html = renderAbout(); }
        else { return; }

        /* `.js` avant le contenu : les blocs à révéler naissent masqués, au lieu
           d'apparaître puis de disparaître. */
        document.documentElement.classList.add('js');
        document.body.classList.remove('menu-open');
        root.innerHTML = html;

        attacheReveals();
        if (!majNav) {
            majNav = attacheNav();
            attacheMenuGlobal();
        }
        majNav();
        attacheMenu();
        attacheInclinaison();
        attacheAnneau();
        attacheFiltre();
        attacheBandes();
        attacheCompteurs();
        attacheLangue();
    }

    render();
})();
