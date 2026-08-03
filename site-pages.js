(function () {
    var supported = ['fr', 'ar', 'en', 'de', 'it', 'ja', 'ko', 'es', 'uk', 'ru', 'zh-Hans'];
    var toiletteSupported = supported.slice();
    var legalSupported = supported.slice();
    var legalToiletteSupported = supported.slice();
    var appStore = 'https://apps.apple.com/fr/app/';
    var mail = 'rodolphe_vandaele@hotmail.fr';

    var ui = {
        fr: { home: 'Accueil', apps: 'Applications', support: 'Assistance', privacy: 'Confidentialité', premium: 'Premium', about: 'À propos', available: 'Disponible', soon: 'Bientôt disponible', appStore: 'Voir sur l’App Store', email: 'Contacter le support', updated: 'Mise à jour : 6 mai 2026', developer: 'Développeur indépendant', profile: 'Profil développeur', rightsTitle: 'Vos droits', rights: 'Conformément au RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité ou l’opposition au traitement de vos données personnelles. Vous pouvez aussi saisir la CNIL.', contactTitle: 'Contact', deleteTitle: 'Suppression des données', faqTitle: 'Questions fréquentes', quickSupport: 'Support rapide', dataUsed: 'Données utilisées', business: 'Publicité et achats', sources: 'Sources de données', retention: 'Conservation', download: 'Télécharger', included: 'Inclus', free: 'Gratuit', yes: 'Oui', no: 'Non' },
        en: { home: 'Home', apps: 'Apps', support: 'Support', privacy: 'Privacy', premium: 'Premium', about: 'About', available: 'Available', soon: 'Coming soon', appStore: 'View on the App Store', email: 'Contact support', updated: 'Updated: May 6, 2026', developer: 'Independent developer', profile: 'Developer profile', rightsTitle: 'Your rights', rights: 'Under the GDPR, you may request access, rectification, erasure, restriction, portability or objection regarding your personal data. You may also contact your data protection authority.', contactTitle: 'Contact', deleteTitle: 'Data deletion', faqTitle: 'FAQ', quickSupport: 'Quick support', dataUsed: 'Data used', business: 'Advertising and purchases', sources: 'Data sources', retention: 'Retention', download: 'Download', included: 'Included', free: 'Free', yes: 'Yes', no: 'No' },
        es: { home: 'Inicio', apps: 'Apps', support: 'Soporte', privacy: 'Privacidad', premium: 'Premium', about: 'Acerca de', available: 'Disponible', soon: 'Próximamente', appStore: 'Ver en el App Store', email: 'Contactar soporte', updated: 'Actualizado: 6 de mayo de 2026', developer: 'Desarrollador independiente', profile: 'Perfil del desarrollador', rightsTitle: 'Tus derechos', rights: 'Según el RGPD, puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición respecto a tus datos personales. También puedes contactar con tu autoridad de protección de datos.', contactTitle: 'Contacto', deleteTitle: 'Eliminación de datos', faqTitle: 'Preguntas frecuentes', quickSupport: 'Soporte rápido', dataUsed: 'Datos usados', business: 'Publicidad y compras', sources: 'Fuentes de datos', retention: 'Conservación', download: 'Descargar', included: 'Incluido', free: 'Gratis', yes: 'Sí', no: 'No' },
        it: { home: 'Home', apps: 'App', support: 'Supporto', privacy: 'Privacy', premium: 'Premium', about: 'Info', available: 'Disponibile', soon: 'Presto disponibile', appStore: 'Vedi su App Store', email: 'Contatta il supporto', updated: 'Aggiornata: 6 maggio 2026', developer: 'Sviluppatore indipendente', profile: 'Profilo sviluppatore', rightsTitle: 'I tuoi diritti', rights: 'Ai sensi del GDPR puoi richiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione al trattamento dei tuoi dati personali. Puoi anche contattare l’autorità per la protezione dei dati.', contactTitle: 'Contatto', deleteTitle: 'Eliminazione dei dati', faqTitle: 'Domande frequenti', quickSupport: 'Supporto rapido', dataUsed: 'Dati usati', business: 'Pubblicità e acquisti', sources: 'Fonti dei dati', retention: 'Conservazione', download: 'Scarica', included: 'Incluso', free: 'Gratis', yes: 'Sì', no: 'No' },
        de: { home: 'Start', apps: 'Apps', support: 'Support', privacy: 'Datenschutz', premium: 'Premium', about: 'Über', available: 'Verfügbar', soon: 'Demnächst', appStore: 'Im App Store ansehen', email: 'Support kontaktieren', updated: 'Aktualisiert: 6. Mai 2026', developer: 'Unabhängiger Entwickler', profile: 'Entwicklerprofil', rightsTitle: 'Deine Rechte', rights: 'Nach der DSGVO kannst du Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit oder Widerspruch bezüglich deiner personenbezogenen Daten verlangen. Du kannst dich auch an deine Datenschutzbehörde wenden.', contactTitle: 'Kontakt', deleteTitle: 'Daten löschen', faqTitle: 'Häufige Fragen', quickSupport: 'Schneller Support', dataUsed: 'Verwendete Daten', business: 'Werbung und Käufe', sources: 'Datenquellen', retention: 'Aufbewahrung', download: 'Laden', included: 'Enthalten', free: 'Kostenlos', yes: 'Ja', no: 'Nein' },
        ja: { home: 'ホーム', apps: 'アプリ', support: 'サポート', privacy: 'プライバシー', premium: 'Premium', about: '概要', available: '利用可能', soon: '近日公開', appStore: 'App Storeで見る', email: 'サポートへ連絡', updated: '更新日：2026年5月6日', developer: '個人開発者', profile: '開発者プロフィール', rightsTitle: 'あなたの権利', rights: 'GDPRに基づき、個人データへのアクセス、訂正、削除、制限、ポータビリティ、または処理への異議申し立てを請求できます。監督機関に連絡することもできます。', contactTitle: '連絡先', deleteTitle: 'データ削除', faqTitle: 'よくある質問', quickSupport: 'クイックサポート', dataUsed: '使用されるデータ', business: '広告と購入', sources: 'データソース', retention: '保存期間', download: 'ダウンロード', included: '含まれるもの', free: '無料', yes: 'はい', no: 'いいえ' },
        'zh-Hans': { home: '首页', apps: '应用', support: '支持', privacy: '隐私', premium: 'Premium', about: '关于', available: '可用', soon: '即将推出', appStore: '在App Store查看', email: '联系支持', updated: '更新：2026年5月6日', developer: '独立开发者', profile: '开发者资料', rightsTitle: '你的权利', rights: '根据GDPR，你可以请求访问、更正、删除、限制、转移或反对处理你的个人数据。你也可以联系数据保护机构。', contactTitle: '联系方式', deleteTitle: '数据删除', faqTitle: '常见问题', quickSupport: '快速支持', dataUsed: '使用的数据', business: '广告和购买', sources: '数据来源', retention: '保留', download: '下载', included: '包含', free: '免费', yes: '是', no: '否' },
        ko: { home: '홈', apps: '앱', support: '지원', privacy: '개인정보 보호', premium: 'Premium', about: '정보', available: '사용 가능', soon: '곧 출시', appStore: 'App Store에서 보기', email: '지원팀에 문의', updated: '업데이트: 2026년 5월 6일', developer: '독립 개발자', profile: '개발자 프로필', rightsTitle: '권리', rights: 'GDPR에 따라 개인 데이터에 대한 접근, 정정, 삭제, 제한, 이동 또는 처리 반대를 요청할 수 있습니다. 데이터 보호 기관에 문의할 수도 있습니다.', contactTitle: '연락처', deleteTitle: '데이터 삭제', faqTitle: '자주 묻는 질문', quickSupport: '빠른 지원', dataUsed: '사용되는 데이터', business: '광고 및 구매', sources: '데이터 출처', retention: '보관', download: '다운로드', included: '포함', free: '무료', yes: '예', no: '아니요' },
        ar: { home: 'الرئيسية', apps: 'التطبيقات', support: 'الدعم', privacy: 'الخصوصية', premium: 'بريميوم', about: 'حول', available: 'متاح', soon: 'قريبًا', appStore: 'عرض في App Store', email: 'الاتصال بالدعم', updated: 'آخر تحديث: 6 مايو 2026', developer: 'مطوّر مستقل', profile: 'ملف المطوّر', rightsTitle: 'حقوقك', rights: 'بموجب اللائحة العامة لحماية البيانات، يمكنك طلب الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها أو تقييد معالجتها أو نقلها أو الاعتراض على معالجتها. يمكنك أيضًا التواصل مع سلطة حماية البيانات المختصة.', contactTitle: 'الاتصال', deleteTitle: 'حذف البيانات', faqTitle: 'الأسئلة الشائعة', quickSupport: 'دعم سريع', dataUsed: 'البيانات المستخدمة', business: 'الإعلانات والمشتريات', sources: 'مصادر البيانات', retention: 'الاحتفاظ', download: 'تنزيل', included: 'مضمن', free: 'مجاني', yes: 'نعم', no: 'لا' }
    };

    var landingLabels = {
        fr: { discover: 'Découvrir', highlights: 'Points forts', privacyData: 'Données et confidentialité', usefulLinks: 'Liens utiles', webOverview: 'Vue web', preparation: 'Préparation App Store', legalNote: 'Les pages légales utilisées par les applications restent sur leurs URL actuelles.', openApp: 'Ouvrir la page' },
        en: { discover: 'Discover', highlights: 'Highlights', privacyData: 'Data and privacy', usefulLinks: 'Useful links', webOverview: 'Web overview', preparation: 'App Store preparation', legalNote: 'The legal pages used by the apps remain at their current URLs.', openApp: 'Open page' },
        es: { discover: 'Descubrir', highlights: 'Puntos fuertes', privacyData: 'Datos y privacidad', usefulLinks: 'Enlaces útiles', webOverview: 'Vista web', preparation: 'Preparación App Store', legalNote: 'Las páginas legales usadas por las apps permanecen en sus URL actuales.', openApp: 'Abrir página' },
        it: { discover: 'Scopri', highlights: 'Punti forti', privacyData: 'Dati e privacy', usefulLinks: 'Link utili', webOverview: 'Vista web', preparation: 'Preparazione App Store', legalNote: 'Le pagine legali usate dalle app restano agli URL attuali.', openApp: 'Apri pagina' },
        de: { discover: 'Entdecken', highlights: 'Stärken', privacyData: 'Daten und Datenschutz', usefulLinks: 'Nützliche Links', webOverview: 'Web-Überblick', preparation: 'App-Store-Vorbereitung', legalNote: 'Die von den Apps verwendeten rechtlichen Seiten bleiben unter ihren aktuellen URLs.', openApp: 'Seite öffnen' },
        ja: { discover: '詳細を見る', highlights: '主な特徴', privacyData: 'データとプライバシー', usefulLinks: '関連リンク', webOverview: 'Web概要', preparation: 'App Store準備中', legalNote: 'アプリで使われる法的ページは現在のURLのままです。', openApp: 'ページを開く' },
        'zh-Hans': { discover: '了解详情', highlights: '亮点', privacyData: '数据与隐私', usefulLinks: '实用链接', webOverview: '网页概览', preparation: 'App Store准备中', legalNote: '应用使用的法律页面仍保留在当前URL。', openApp: '打开页面' },
        ko: { discover: '자세히 보기', highlights: '주요 기능', privacyData: '데이터 및 개인정보', usefulLinks: '유용한 링크', webOverview: '웹 개요', preparation: 'App Store 준비 중', legalNote: '앱에서 사용하는 법적 페이지는 현재 URL에 유지됩니다.', openApp: '페이지 열기' }
    };

    var apps = {
        carbufrance: {
            name: 'CarbuFrance', icon: 'carbufrance.png', type: 'fuel', status: 'available', store: appStore + 'carbufrance/id6760407573', premium: false,
            description: {
                fr: 'Prix des carburants en France, carte, liste, favoris, carnet de bord, widget et CarPlay. 100 % gratuit.',
                en: 'French fuel prices, map, list, favorites, logbook, widget and CarPlay. 100% free.',
                es: 'Precios de carburantes en Francia, mapa, lista, favoritos, cuaderno de a bordo, widget y CarPlay. 100 % gratis.',
                it: 'Prezzi carburanti in Francia, mappa, lista, preferiti, libretto di bordo, widget e CarPlay. 100% gratis.',
                de: 'Kraftstoffpreise in Frankreich, Karte, Liste, Favoriten, Fahrtenbuch, Widget und CarPlay. 100 % kostenlos.',
                ar: 'أسعار الوقود في فرنسا، خريطة، قائمة، مفضلات، سجل قيادة، ويدجت وCarPlay. مجاني 100٪.'
            }
        },
        irvefrance: {
            name: 'IRVEFrance', icon: 'irvefrance.png', type: 'ev', status: 'available', store: appStore + 'irvefrance/id6760716931', premium: false,
            description: {
                fr: 'Bornes de recharge électriques, réseaux, connecteurs, puissance réelle et guidage. 100 % gratuit.',
                en: 'EV charging stations, networks, connectors, real power and directions. 100% free.',
                es: 'Puntos de recarga eléctrica, redes, conectores, potencia real y rutas. 100 % gratis.',
                it: 'Colonnine di ricarica, reti, connettori, potenza reale e navigazione. 100% gratis.',
                de: 'Ladestationen, Netze, Anschlüsse, tatsächliche Leistung und Navigation. 100 % kostenlos.',
                ar: 'محطات شحن المركبات الكهربائية، الشبكات، الموصلات، القدرة الفعلية والإرشاد. مجاني 100٪.'
            }
        },
        toilettefrance: {
            name: 'ToiletteFrance', icon: 'toilettefrance.png', type: 'toilet', status: 'available', store: appStore + 'toilettefrance/id6760978805', premium: false,
            description: {
                fr: 'Toilettes publiques en France, carte, filtres utiles, accessibilité, horaires et guidage.',
                en: 'Public toilets in France, map, useful filters, accessibility, opening hours and directions.',
                es: 'Baños públicos en Francia, mapa, filtros útiles, accesibilidad, horarios y rutas.',
                it: 'Bagni pubblici in Francia, mappa, filtri utili, accessibilità, orari e navigazione.',
                de: 'Öffentliche Toiletten in Frankreich, Karte, Filter, Barrierefreiheit, Öffnungszeiten und Navigation.',
                ja: 'フランスの公衆トイレ、地図、便利なフィルター、バリアフリー、営業時間、経路案内。',
                'zh-Hans': '法国公共厕所、地图、实用筛选、无障碍、开放时间和路线。',
                ko: '프랑스 공공 화장실, 지도, 유용한 필터, 접근성, 운영시간, 길안내.',
                ar: 'دورات مياه عامة في فرنسا، خريطة، فلاتر مفيدة، إمكانية الوصول، ساعات العمل والإرشاد.'
            }
        },
        defibfrance: {
            name: 'DefibFrance', icon: 'defibfrance.png', type: 'defib', status: 'available', store: appStore + 'defibfrance/id6761717722', premium: false,
            description: {
                fr: 'Défibrillateurs automatisés externes, disponibilité, accessibilité et guidage d’urgence.',
                en: 'Automated external defibrillators, availability, accessibility and emergency directions.',
                es: 'Desfibriladores externos automáticos, disponibilidad, accesibilidad y rutas de emergencia.',
                it: 'Defibrillatori automatici esterni, disponibilità, accessibilità e navigazione di emergenza.',
                de: 'Automatisierte externe Defibrillatoren, Verfügbarkeit, Zugänglichkeit und Notfallnavigation.',
                ar: 'أجهزة مزيل الرجفان الخارجي الآلي، التوفر، إمكانية الوصول والإرشاد في حالات الطوارئ.'
            }
        },
        mactuner: {
            name: 'MacTuner', icon: 'mactuner.png', type: 'mac', status: 'available', platform: 'macOS',
            store: 'https://github.com/Bodyroro/MacTuner', premium: false, web: true,
            description: {
                fr: 'Application macOS libre : tableau de bord, réglages système, nettoyage, désinstallation sans résidu, maintenance et contrôle du ventilateur. Apple Silicon, macOS 26–27.',
                en: 'Free macOS app: dashboard, system tuning, cleanup, residue-free uninstall, maintenance and fan control. Apple Silicon, macOS 26–27.',
                es: 'App macOS gratuita: panel, ajustes del sistema, limpieza, desinstalación sin residuos, mantenimiento y control del ventilador. Apple Silicon, macOS 26–27.',
                it: 'App macOS gratuita: dashboard, impostazioni di sistema, pulizia, disinstallazione senza residui, manutenzione e controllo ventola. Apple Silicon, macOS 26–27.',
                de: 'Kostenlose macOS-App: Dashboard, Systemeinstellungen, Bereinigung, rückstandsfreie Deinstallation, Wartung und Lüftersteuerung. Apple Silicon, macOS 26–27.',
                ar: 'تطبيق macOS مجاني: لوحة تحكم، إعدادات النظام، تنظيف، إزالة دون أي أثر، صيانة والتحكم في المروحة. Apple Silicon، macOS 26–27.'
            }
        }
    };

    var commonCopy = {
        fr: { homeLead: 'Applications iOS pensées pour le quotidien, les urgences, la mobilité et les services publics en France.', deletion: 'L’application ne crée pas de compte utilisateur. Les données locales se suppriment en désinstallant l’application ou depuis les réglages quand l’option existe.', adDetails: 'Google AdMob peut traiter des identifiants publicitaires, l’adresse IP, le modèle d’appareil, des données de performance et les interactions publicitaires. Consultez la politique de confidentialité de Google.', retention: 'Les données locales restent sur votre appareil jusqu’à suppression de l’app ou réinitialisation des réglages. Les données publicitaires suivent les règles de Google AdMob et les achats suivent les règles Apple quand ils existent.', feature: 'Fonction', featuresTitle: 'Fonctionnalités' },
        en: { homeLead: 'iOS apps designed for everyday needs, emergencies, mobility and public services in France.', deletion: 'The app does not create a user account. Local data can be removed by deleting the app or from settings when an option exists.', adDetails: 'Google AdMob may process advertising identifiers, IP address, device model, performance data and ad interactions. See Google’s privacy policy.', retention: 'Local data remains on your device until you delete the app or reset settings. Advertising data follows Google AdMob rules and purchases follow Apple rules when they exist.', feature: 'Feature', featuresTitle: 'Features' },
        es: { homeLead: 'Apps iOS pensadas para el día a día, emergencias, movilidad y servicios públicos en Francia.', deletion: 'La app no crea una cuenta de usuario. Los datos locales se eliminan al desinstalar la app o desde los ajustes cuando existe la opción.', adDetails: 'Google AdMob puede tratar identificadores publicitarios, dirección IP, modelo del dispositivo, datos de rendimiento e interacciones con anuncios. Consulta la política de privacidad de Google.', retention: 'Los datos locales permanecen en tu dispositivo hasta que eliminas la app o restableces los ajustes. Los datos publicitarios siguen las reglas de Google AdMob y las compras siguen las reglas de Apple cuando existen.', feature: 'Función', featuresTitle: 'Funciones' },
        it: { homeLead: 'App iOS pensate per quotidiano, emergenze, mobilità e servizi pubblici in Francia.', deletion: 'L’app non crea un account utente. I dati locali si eliminano disinstallando l’app o dalle impostazioni quando l’opzione esiste.', adDetails: 'Google AdMob può trattare identificatori pubblicitari, indirizzo IP, modello del dispositivo, dati di prestazione e interazioni con gli annunci. Consulta la privacy policy di Google.', retention: 'I dati locali restano sul dispositivo finché elimini l’app o ripristini le impostazioni. I dati pubblicitari seguono le regole Google AdMob e gli acquisti seguono le regole Apple quando esistono.', feature: 'Funzione', featuresTitle: 'Funzionalità' },
        de: { homeLead: 'iOS-Apps für Alltag, Notfälle, Mobilität und öffentliche Dienste in Frankreich.', deletion: 'Die App erstellt kein Benutzerkonto. Lokale Daten können durch Löschen der App oder in den Einstellungen entfernt werden, wenn eine Option vorhanden ist.', adDetails: 'Google AdMob kann Werbe-IDs, IP-Adresse, Gerätemodell, Leistungsdaten und Anzeigeninteraktionen verarbeiten. Siehe die Datenschutzerklärung von Google.', retention: 'Lokale Daten bleiben auf deinem Gerät, bis du die App löschst oder Einstellungen zurücksetzt. Werbedaten folgen den Regeln von Google AdMob und Käufe den Regeln von Apple, wenn sie existieren.', feature: 'Funktion', featuresTitle: 'Funktionen' },
        ja: { homeLead: 'フランスの日常、緊急時、移動、公共サービスのためのiOSアプリです。', deletion: 'アプリはユーザーアカウントを作成しません。ローカルデータはアプリの削除、または設定に削除項目がある場合はそこから削除できます。', adDetails: 'Google AdMobは広告ID、IPアドレス、端末モデル、パフォーマンスデータ、広告操作を処理する場合があります。Googleのプライバシーポリシーをご確認ください。', retention: 'ローカルデータは、アプリを削除するか設定をリセットするまで端末に残ります。広告データはGoogle AdMobの規則に従います。', feature: '機能', featuresTitle: '機能' },
        'zh-Hans': { homeLead: '面向法国日常、紧急、出行和公共服务的iOS应用。', deletion: '应用不会创建用户账户。本地数据可通过删除应用，或在提供相关选项时从设置中删除。', adDetails: 'Google AdMob可能会处理广告标识符、IP地址、设备型号、性能数据和广告互动。请查看Google隐私政策。', retention: '本地数据会保留在你的设备上，直到你删除应用或重置设置。广告数据遵循Google AdMob规则。', feature: '功能', featuresTitle: '功能' },
        ko: { homeLead: '프랑스의 일상, 긴급 상황, 이동, 공공서비스를 위한 iOS 앱입니다.', deletion: '앱은 사용자 계정을 만들지 않습니다. 로컬 데이터는 앱을 삭제하거나 해당 옵션이 있을 때 설정에서 삭제할 수 있습니다.', adDetails: 'Google AdMob은 광고 식별자, IP 주소, 기기 모델, 성능 데이터, 광고 상호작용을 처리할 수 있습니다. Google 개인정보 처리방침을 확인하세요.', retention: '로컬 데이터는 앱을 삭제하거나 설정을 초기화할 때까지 기기에 남아 있습니다. 광고 데이터는 Google AdMob 규칙을 따릅니다.', feature: '기능', featuresTitle: '기능' },
        ar: { homeLead: 'تطبيقات iOS مصممة للحياة اليومية والطوارئ والتنقل والخدمات العامة في فرنسا.', deletion: 'لا ينشئ التطبيق حساب مستخدم. يمكن حذف البيانات المحلية بإزالة التطبيق أو من الإعدادات عندما يتوفر هذا الخيار.', adDetails: 'قد يعالج Google AdMob معرّفات الإعلانات وعنوان IP وطراز الجهاز وبيانات الأداء والتفاعلات مع الإعلانات. راجع سياسة خصوصية Google.', retention: 'تبقى البيانات المحلية على جهازك حتى تحذف التطبيق أو تعيد ضبط الإعدادات. تتبع بيانات الإعلانات قواعد Google AdMob وتتبع المشتريات قواعد Apple عند وجودها.', feature: 'الميزة', featuresTitle: 'الميزات' }
    };

    var supportMailCopy = {
        fr: { write: 'Écrire au support', copy: 'Copier l’adresse', copied: 'Adresse copiée', fallback: 'Si le bouton n’ouvre pas votre messagerie, copiez l’adresse ci-dessous.', body: ['Bonjour,', '', 'Application : {app}', 'Version de l’app : ', 'Appareil : ', 'Version iOS : ', '', 'Description du problème : ', '', 'Étapes pour reproduire : ', '', 'Capture d’écran jointe si possible.', '', 'Merci.'] },
        en: { write: 'Write to support', copy: 'Copy address', copied: 'Address copied', fallback: 'If the button does not open your mail app, copy the address below.', body: ['Hello,', '', 'App: {app}', 'App version: ', 'Device: ', 'iOS version: ', '', 'Issue description: ', '', 'Steps to reproduce: ', '', 'Screenshot attached if possible.', '', 'Thank you.'] },
        es: { write: 'Escribir al soporte', copy: 'Copiar dirección', copied: 'Dirección copiada', fallback: 'Si el botón no abre tu correo, copia la dirección siguiente.', body: ['Hola,', '', 'App: {app}', 'Versión de la app: ', 'Dispositivo: ', 'Versión de iOS: ', '', 'Descripción del problema: ', '', 'Pasos para reproducirlo: ', '', 'Captura adjunta si es posible.', '', 'Gracias.'] },
        it: { write: 'Scrivi al supporto', copy: 'Copia indirizzo', copied: 'Indirizzo copiato', fallback: 'Se il pulsante non apre la posta, copia l’indirizzo qui sotto.', body: ['Ciao,', '', 'App: {app}', 'Versione app: ', 'Dispositivo: ', 'Versione iOS: ', '', 'Descrizione del problema: ', '', 'Passaggi per riprodurlo: ', '', 'Screenshot allegato se possibile.', '', 'Grazie.'] },
        de: { write: 'Support schreiben', copy: 'Adresse kopieren', copied: 'Adresse kopiert', fallback: 'Falls die Schaltfläche deine Mail-App nicht öffnet, kopiere die folgende Adresse.', body: ['Hallo,', '', 'App: {app}', 'App-Version: ', 'Gerät: ', 'iOS-Version: ', '', 'Problembeschreibung: ', '', 'Schritte zum Reproduzieren: ', '', 'Screenshot wenn möglich angehängt.', '', 'Danke.'] },
        ja: { write: 'サポートへ連絡', copy: 'アドレスをコピー', copied: 'アドレスをコピーしました', fallback: 'ボタンでメールアプリが開かない場合は、下のアドレスをコピーしてください。', body: ['こんにちは。', '', 'アプリ：{app}', 'アプリバージョン：', '端末：', 'iOSバージョン：', '', '問題の内容：', '', '再現手順：', '', '可能であればスクリーンショットを添付します。', '', 'よろしくお願いします。'] },
        'zh-Hans': { write: '联系支持', copy: '复制地址', copied: '地址已复制', fallback: '如果按钮无法打开邮件应用，请复制下面的地址。', body: ['你好，', '', '应用：{app}', '应用版本：', '设备：', 'iOS 版本：', '', '问题描述：', '', '复现步骤：', '', '如有可能请附上截图。', '', '谢谢。'] },
        ko: { write: '지원팀에 문의', copy: '주소 복사', copied: '주소가 복사됨', fallback: '버튼으로 메일 앱이 열리지 않으면 아래 주소를 복사하세요.', body: ['안녕하세요.', '', '앱: {app}', '앱 버전: ', '기기: ', 'iOS 버전: ', '', '문제 설명: ', '', '재현 단계: ', '', '가능하면 스크린샷을 첨부합니다.', '', '감사합니다.'] },
        ar: { write: 'مراسلة الدعم', copy: 'نسخ العنوان', copied: 'تم نسخ العنوان', fallback: 'إذا لم يفتح الزر تطبيق البريد، انسخ العنوان أدناه.', body: ['مرحبًا،', '', 'التطبيق: {app}', 'إصدار التطبيق: ', 'الجهاز: ', 'إصدار iOS: ', '', 'وصف المشكلة: ', '', 'خطوات إعادة الإنتاج: ', '', 'لقطة شاشة مرفقة إن أمكن.', '', 'شكرًا.'] }
    };

    var appFeatures = {
        carbufrance: {
            fr: ['Carte et liste des stations avec prix carburants en France.', 'Tri par prix ou distance, favoris, stations masquées et cache hors-ligne.', 'Widget station la moins chère, widget écran verrouillé et CarPlay.', 'Carnet de bord, entretien et observatoire des marchés inclus, sans abonnement.'],
            en: ['Map and list of French fuel stations with prices.', 'Sort by price or distance, favorites, hidden stations and offline cache.', 'Cheapest-station widget, Lock Screen widget and CarPlay.', 'Logbook, maintenance and market observatory included, no subscription.'],
            es: ['Mapa y lista de estaciones francesas con precios.', 'Orden por precio o distancia, favoritos, ocultar estaciones y caché offline.', 'Widget de estación más barata, widget de pantalla bloqueada y CarPlay.', 'Registro, mantenimiento y observatorio de mercados incluidos, sin suscripción.'],
            it: ['Mappa e lista delle stazioni francesi con prezzi.', 'Ordina per prezzo o distanza, preferiti, stazioni nascoste e cache offline.', 'Widget stazione più economica, widget schermata di blocco e CarPlay.', 'Registro, manutenzione e osservatorio mercati inclusi, senza abbonamento.'],
            de: ['Karte und Liste französischer Tankstellen mit Preisen.', 'Sortierung nach Preis oder Entfernung, Favoriten, ausgeblendete Stationen und Offline-Cache.', 'Widget für die günstigste Tankstelle, Sperrbildschirm-Widget und CarPlay.', 'Fahrtenbuch, Wartung und Marktüberblick enthalten, ohne Abo.'],
            ar: ['خريطة وقائمة لمحطات الوقود في فرنسا مع الأسعار.', 'فرز حسب السعر أو المسافة، مفضلات، محطات مخفية وذاكرة تخزين دون اتصال.', 'ويدجت لأرخص محطة وويدجت شاشة القفل وCarPlay.', 'سجل الوقود والصيانة ومرصد السوق مضمّنة، بلا اشتراك.']
        },
        irvefrance: {
            fr: ['Carte des bornes avec connecteurs, puissance réelle et opérateur.', 'Filtres CCS2, CHAdeMO, Type 2, puissance minimale et rayon 5 à 50 km.', 'Look Around, vue 3D, favoris, hors-ligne, Siri et calculateur de recharge.', 'Marché de l’électricité, carnet de recharge, widget et CarPlay inclus, sans abonnement.'],
            en: ['Charger map with connectors, real power and operator.', 'CCS2, CHAdeMO, Type 2, minimum power and 5 to 50 km radius filters.', 'Look Around, 3D map, favorites, offline mode, Siri and charging calculator.', 'Electricity market, charging logbook, widget and CarPlay included, no subscription.'],
            es: ['Mapa de cargadores con conectores, potencia real y operador.', 'Filtros CCS2, CHAdeMO, Type 2, potencia mínima y radio de 5 a 50 km.', 'Look Around, mapa 3D, favoritos, offline, Siri y calculadora de recarga.', 'Mercado eléctrico, cuaderno de recargas, widget y CarPlay incluidos, sin suscripción.'],
            it: ['Mappa colonnine con connettori, potenza reale e operatore.', 'Filtri CCS2, CHAdeMO, Type 2, potenza minima e raggio da 5 a 50 km.', 'Look Around, mappa 3D, preferiti, offline, Siri e calcolatore ricarica.', 'Mercato elettrico, libretto di ricarica, widget e CarPlay inclusi, senza abbonamento.'],
            de: ['Ladekarte mit Anschlüssen, tatsächlicher Leistung und Betreiber.', 'Filter für CCS2, CHAdeMO, Type 2, Mindestleistung und 5 bis 50 km Radius.', 'Look Around, 3D-Karte, Favoriten, Offline-Modus, Siri und Laderechner.', 'Strommarkt, Ladetagebuch, Widget und CarPlay enthalten, ohne Abo.'],
            ar: ['خريطة شحن تعرض الموصلات والقدرة الفعلية والمشغل.', 'فلاتر CCS2 وCHAdeMO وType 2 والقدرة الدنيا ونطاق من 5 إلى 50 كم.', 'Look Around وخريطة ثلاثية الأبعاد ومفضلات ووضع دون اتصال وSiri وحاسبة الشحن.', 'سوق الكهرباء وسجل الشحن والويدجت وCarPlay مضمّنة، بلا اشتراك.']
        },
        defibfrance: {
            fr: ['Carte des DAE proches avec code couleur par accessibilité.', 'Filtres accès public, 24h/24, intérieur/extérieur et rayon 500 m à 10 km.', 'Mode Urgence, appel SAMU 15 avec confirmation et guide RCP avec métronome haptique.', 'Publicités possibles avec consentement et vidéo récompensée offrant 6 h sans publicité. Aucun achat, aucun don intégré.'],
            en: ['Nearby AED map with color coding by accessibility.', 'Public access, 24/7, indoor/outdoor and 500 m to 10 km radius filters.', 'Emergency mode, SAMU 15 call confirmation and CPR guide with haptic metronome.', 'Ads may appear with consent, and a rewarded video gives 6 hours ad-free. No purchase, no in-app donation.'],
            es: ['Mapa de DAE cercanos con colores por accesibilidad.', 'Filtros acceso público, 24/7, interior/exterior y radio de 500 m a 10 km.', 'Modo Emergencia, confirmación de llamada SAMU 15 y guía RCP con metrónomo háptico.', 'Puede mostrar anuncios con consentimiento y un vídeo recompensado da 6 h sin anuncios. Sin compras ni donaciones integradas.'],
            it: ['Mappa DAE vicini con colori per accessibilità.', 'Filtri accesso pubblico, 24/7, interno/esterno e raggio da 500 m a 10 km.', 'Modalità Emergenza, conferma chiamata SAMU 15 e guida RCP con metronomo aptico.', 'Annunci possibili con consenso e un video premiato offre 6 h senza annunci. Nessun acquisto, nessuna donazione integrata.'],
            de: ['Karte naher AEDs mit Farbcodierung nach Zugänglichkeit.', 'Filter für öffentlichen Zugang, 24/7, innen/außen und 500 m bis 10 km Radius.', 'Notfallmodus, SAMU-15-Anrufbestätigung und CPR-Anleitung mit haptischem Metronom.', 'Werbung nach Zustimmung möglich, ein belohntes Video schenkt 6 h ohne Werbung. Kein Kauf, keine Spende in der App.'],
            ar: ['خريطة لأجهزة مزيل الرجفان القريبة مع ألوان حسب إمكانية الوصول.', 'فلاتر للوصول العام، 24/7، داخلي/خارجي ونطاق من 500 م إلى 10 كم.', 'وضع الطوارئ، تأكيد الاتصال بـ SAMU 15 ودليل إنعاش قلبي رئوي مع مترونوم لمسي.', 'قد تظهر الإعلانات بعد الموافقة، ومقطع بمكافأة يمنح 6 ساعات بلا إعلانات. بلا شراء ولا تبرع داخل التطبيق.']
        },
        toilettefrance: {
            fr: ['Carte des toilettes publiques en France avec distance et guidage.', 'Filtres d’accessibilité, horaires et informations disponibles selon les données ouvertes.', 'Favoris, préférences et données locales sans compte utilisateur.', 'Application gratuite financée par publicité AdMob.'],
            en: ['Map of public toilets in France with distance and directions.', 'Accessibility filters, opening hours and available details from open data.', 'Favorites, preferences and local data with no user account.', 'Free app funded by AdMob ads.'],
            es: ['Mapa de baños públicos en Francia con distancia y rutas.', 'Filtros de accesibilidad, horarios e información disponible desde datos abiertos.', 'Favoritos, preferencias y datos locales sin cuenta de usuario.', 'App gratuita financiada con anuncios AdMob.'],
            it: ['Mappa dei bagni pubblici in Francia con distanza e navigazione.', 'Filtri accessibilità, orari e dettagli disponibili da dati aperti.', 'Preferiti, preferenze e dati locali senza account utente.', 'App gratuita finanziata da annunci AdMob.'],
            de: ['Karte öffentlicher Toiletten in Frankreich mit Entfernung und Route.', 'Barrierefreiheitsfilter, Öffnungszeiten und verfügbare Details aus offenen Daten.', 'Favoriten, Einstellungen und lokale Daten ohne Benutzerkonto.', 'Kostenlose App, finanziert durch AdMob-Werbung.'],
            ja: ['距離と経路案内付きのフランス公衆トイレ地図。', 'オープンデータに基づくバリアフリーフィルター、営業時間、利用可能な詳細。', 'ユーザーアカウントなしで使えるお気に入り、設定、ローカルデータ。', 'AdMob広告で支えられる無料アプリ。'],
            'zh-Hans': ['带距离和路线的法国公共厕所地图。', '基于开放数据的无障碍筛选、开放时间和可用详情。', '无需用户账户的收藏、偏好和本地数据。', '由AdMob广告支持的免费应用。'],
            ko: ['거리와 길안내가 포함된 프랑스 공공 화장실 지도.', '오픈 데이터 기반 접근성 필터, 운영시간, 제공되는 상세정보.', '사용자 계정 없이 사용하는 즐겨찾기, 설정, 로컬 데이터.', 'AdMob 광고로 운영되는 무료 앱.'],
            ar: ['خريطة لدورات المياه العامة في فرنسا مع المسافة والإرشاد.', 'فلاتر إمكانية الوصول وساعات العمل والتفاصيل المتاحة من البيانات المفتوحة.', 'مفضلات وتفضيلات وبيانات محلية دون حساب مستخدم.', 'تطبيق مجاني ممول بإعلانات AdMob.']
        },
    };

    var appOrder = ['carbufrance', 'irvefrance', 'toilettefrance', 'defibfrance', 'mactuner'];

    var typeText = {
        fuel: {
            fr: { data: 'La position sert à afficher les stations proches, calculer les distances et ouvrir un itinéraire. Les favoris, stations masquées, préférences, langue, cache hors-ligne, carnet de bord et entretien restent sur l’appareil.', source: 'Les prix viennent du jeu de données public du Ministère de l’Économie. Les informations de marché peuvent provenir de flux publics financiers ou d’actualité.', support: [['Les prix ne sont pas à jour ?', 'Les prix dépendent des déclarations des stations. Si aucune mise à jour récente n’existe, l’app conserve la dernière valeur disponible.'], ['Le widget affiche mal les actions ?', 'Le widget gratuit montre la station la moins chère. Les actions rapides sont Premium et utilisent des icônes compactes pour rester lisibles.'], ['Comment restaurer Premium ?', 'Ouvrez CarbuFrance puis Réglages › Premium. StoreKit et votre compte Apple gèrent la restauration.']] },
            en: { data: 'Location is used to show nearby stations, calculate distances and open directions. Favorites, hidden stations, preferences, language, offline cache, logbook and maintenance stay on device.', source: 'Prices come from the public dataset of the French Ministry of Economy. Market information may come from public financial or news feeds.', support: [['Prices are not up to date?', 'Prices depend on station reports. If no recent update exists, the app keeps the latest available value.'], ['Widget actions look wrong?', 'The free widget shows the cheapest station. Quick actions are Premium and use compact icons to remain readable.'], ['How do I restore Premium?', 'Open CarbuFrance then Settings › Premium. StoreKit and your Apple account handle restoration.']] },
            es: { data: 'La ubicación sirve para mostrar estaciones cercanas, calcular distancias y abrir rutas. Favoritos, estaciones ocultas, preferencias, idioma, caché, registro y mantenimiento permanecen en el dispositivo.', source: 'Los precios vienen del conjunto público del Ministerio de Economía francés. La información de mercado puede venir de fuentes públicas financieras o de noticias.', support: [['¿Los precios no están actualizados?', 'Los precios dependen de las declaraciones de las estaciones. Si no hay una actualización reciente, la app conserva el último valor disponible.'], ['¿Las acciones del widget se ven mal?', 'El widget gratuito muestra la estación más barata. Las acciones rápidas son Premium y usan iconos compactos para ser legibles.'], ['¿Cómo restauro Premium?', 'Abre CarbuFrance y Ajustes › Premium. StoreKit y tu cuenta Apple gestionan la restauración.']] },
            it: { data: 'La posizione serve per mostrare le stazioni vicine, calcolare le distanze e aprire itinerari. Preferiti, stazioni nascoste, preferenze, lingua, cache, registro e manutenzione restano sul dispositivo.', source: 'I prezzi provengono dal dataset pubblico del Ministero dell’Economia francese. Le informazioni di mercato possono arrivare da fonti finanziarie o notizie pubbliche.', support: [['I prezzi non sono aggiornati?', 'I prezzi dipendono dalle dichiarazioni delle stazioni. Se non esiste un aggiornamento recente, l’app mantiene l’ultimo valore disponibile.'], ['Le azioni del widget sono visualizzate male?', 'Il widget gratuito mostra la stazione più economica. Le azioni rapide sono Premium e usano icone compatte per restare leggibili.'], ['Come ripristino Premium?', 'Apri CarbuFrance e Impostazioni › Premium. StoreKit e il tuo account Apple gestiscono il ripristino.']] },
            de: { data: 'Der Standort zeigt nahe Tankstellen, berechnet Entfernungen und öffnet Routen. Favoriten, ausgeblendete Tankstellen, Einstellungen, Sprache, Offline-Cache, Fahrtenbuch und Wartung bleiben auf dem Gerät.', source: 'Die Preise stammen aus dem öffentlichen Datensatz des französischen Wirtschaftsministeriums. Marktinformationen können aus öffentlichen Finanz- oder Nachrichtenquellen stammen.', support: [['Sind Preise nicht aktuell?', 'Preise hängen von Meldungen der Tankstellen ab. Ohne neue Meldung behält die App den letzten verfügbaren Wert.'], ['Sehen Widget-Aktionen falsch aus?', 'Das kostenlose Widget zeigt die günstigste Tankstelle. Schnellaktionen sind Premium und nutzen kompakte Symbole.'], ['Wie stelle ich Premium wieder her?', 'Öffne CarbuFrance und Einstellungen › Premium. StoreKit und dein Apple-Konto übernehmen die Wiederherstellung.']] },
            ar: { data: 'يُستخدم الموقع لعرض محطات الوقود القريبة وحساب المسافات وفتح الاتجاهات. تبقى المفضلات والمحطات المخفية والتفضيلات واللغة والذاكرة دون اتصال وسجل الوقود والصيانة على الجهاز.', source: 'تأتي الأسعار من مجموعة البيانات العامة لوزارة الاقتصاد الفرنسية. قد تأتي معلومات السوق من مصادر مالية أو إخبارية عامة.', support: [['الأسعار غير محدثة؟', 'تعتمد الأسعار على تصريحات المحطات. إذا لم توجد أي تحديثات حديثة، يحتفظ التطبيق بآخر قيمة متاحة.'], ['إجراءات الويدجت تظهر بشكل غير صحيح؟', 'يعرض الويدجت المجاني أرخص محطة. الإجراءات السريعة Premium وتستخدم أيقونات مدمجة لتبقى مقروءة.'], ['كيف أستعيد Premium؟', 'افتح CarbuFrance ثم الإعدادات › Premium. يتولى StoreKit وحساب Apple الخاص بك الاستعادة.']] }
        },
        ev: {
            fr: { data: 'La position sert à afficher les bornes proches, les connecteurs, la puissance, les réseaux et le guidage. Favoris, filtres et préférences restent localement.', source: 'Les bornes proviennent d’OpenChargeMap, OpenStreetMap et de données publiques agrégées selon les disponibilités.', support: [['Une borne manque ?', 'Les données dépendent des opérateurs et bases ouvertes. Une borne peut apparaître avec retard.'], ['La disponibilité semble fausse ?', 'Les informations temps réel varient selon les réseaux. Vérifiez toujours sur place avant un trajet critique.'], ['Comment restaurer Premium ?', 'Ouvrez IRVEFrance › Réglages › Premium. StoreKit et votre compte Apple gèrent la restauration.']] },
            en: { data: 'Location shows nearby chargers, connectors, power, networks and directions. Favorites, filters and preferences stay local.', source: 'Chargers come from OpenChargeMap, OpenStreetMap and aggregated public datasets depending on availability.', support: [['A charger is missing?', 'Data depends on operators and open databases. Some chargers may appear later.'], ['Availability looks wrong?', 'Live availability varies by network. Always check on site before a critical trip.'], ['How do I restore Premium?', 'Open IRVEFrance › Settings › Premium. StoreKit and your Apple account handle restoration.']] },
            es: { data: 'La ubicación muestra cargadores cercanos, conectores, potencia, redes y rutas. Favoritos, filtros y preferencias permanecen localmente.', source: 'Los cargadores proceden de OpenChargeMap, OpenStreetMap y datos públicos agregados según disponibilidad.', support: [['¿Falta un cargador?', 'Los datos dependen de operadores y bases abiertas. Algunos cargadores pueden aparecer más tarde.'], ['¿La disponibilidad parece errónea?', 'La disponibilidad en vivo varía por red. Comprueba siempre antes de un viaje crítico.'], ['¿Cómo restauro Premium?', 'Abre IRVEFrance › Ajustes › Premium. StoreKit y tu cuenta Apple gestionan la restauración.']] },
            it: { data: 'La posizione mostra colonnine vicine, connettori, potenza, reti e navigazione. Preferiti, filtri e preferenze restano locali.', source: 'Le colonnine provengono da OpenChargeMap, OpenStreetMap e dataset pubblici aggregati secondo disponibilità.', support: [['Manca una colonnina?', 'I dati dipendono da operatori e basi aperte. Alcune colonnine possono apparire in ritardo.'], ['La disponibilità sembra errata?', 'La disponibilità live varia per rete. Verifica sempre prima di un viaggio critico.'], ['Come ripristino Premium?', 'Apri IRVEFrance › Impostazioni › Premium. StoreKit e il tuo account Apple gestiscono il ripristino.']] },
            de: { data: 'Der Standort zeigt nahe Ladepunkte, Anschlüsse, Leistung, Netze und Routen. Favoriten, Filter und Einstellungen bleiben lokal.', source: 'Ladepunkte stammen aus OpenChargeMap, OpenStreetMap und aggregierten öffentlichen Datensätzen.', support: [['Fehlt ein Ladepunkt?', 'Daten hängen von Betreibern und offenen Datenbanken ab. Manche Ladepunkte erscheinen später.'], ['Wirkt Verfügbarkeit falsch?', 'Live-Verfügbarkeit variiert je Netz. Prüfe vor kritischen Fahrten zusätzlich vor Ort.'], ['Wie stelle ich Premium wieder her?', 'Öffne IRVEFrance › Einstellungen › Premium. StoreKit und dein Apple-Konto übernehmen die Wiederherstellung.']] },
            ar: { data: 'يعرض الموقع محطات الشحن القريبة والموصلات والقدرة والشبكات والاتجاهات. تبقى المفضلات والفلاتر والتفضيلات محليًا.', source: 'تأتي محطات الشحن من OpenChargeMap وOpenStreetMap ومجموعات بيانات عامة مجمعة بحسب التوفر.', support: [['محطة شحن مفقودة؟', 'تعتمد البيانات على المشغلين وقواعد البيانات المفتوحة. قد تظهر بعض المحطات لاحقًا.'], ['التوفر يبدو غير صحيح؟', 'تختلف بيانات التوفر المباشر حسب الشبكة. تحقق دائمًا في الموقع قبل رحلة مهمة.'], ['كيف أستعيد Premium؟', 'افتح IRVEFrance › الإعدادات › Premium. يتولى StoreKit وحساب Apple الخاص بك الاستعادة.']] }
        },
        defib: {
            fr: { data: 'La position sert à afficher les défibrillateurs proches, leur accessibilité et le guidage d’urgence. Favoris et préférences restent localement.', source: 'Les données proviennent de bases ouvertes comme data.gouv.fr et OpenStreetMap selon les zones.', support: [['Un défibrillateur manque ?', 'Les bases ouvertes peuvent être incomplètes. En urgence, appelez toujours les secours.'], ['Que signifient les couleurs ?', 'Elles indiquent l’accès public, restreint ou incertain selon les informations disponibles.'], ['La localisation ne fonctionne pas ?', 'Vérifiez l’autorisation de localisation dans les réglages iOS de DefibFrance.']] },
            en: { data: 'Location shows nearby defibrillators, accessibility and emergency directions. Favorites and preferences stay local.', source: 'Data comes from open databases such as data.gouv.fr and OpenStreetMap depending on the area.', support: [['A defibrillator is missing?', 'Open databases may be incomplete. In an emergency, always call emergency services.'], ['What do colors mean?', 'They indicate public, limited or uncertain access based on available information.'], ['Location is not working?', 'Check location permission in iOS settings for DefibFrance.']] },
            es: { data: 'La ubicación muestra desfibriladores cercanos, accesibilidad y rutas de emergencia. Favoritos y preferencias permanecen localmente.', source: 'Los datos proceden de bases abiertas como data.gouv.fr y OpenStreetMap según la zona.', support: [['¿Falta un desfibrilador?', 'Las bases abiertas pueden estar incompletas. En emergencia, llama siempre a los servicios de emergencia.'], ['¿Qué significan los colores?', 'Indican acceso público, limitado o incierto según la información disponible.'], ['¿La ubicación no funciona?', 'Comprueba el permiso de ubicación en los ajustes iOS de DefibFrance.']] },
            it: { data: 'La posizione mostra defibrillatori vicini, accessibilità e navigazione di emergenza. Preferiti e preferenze restano locali.', source: 'I dati provengono da basi aperte come data.gouv.fr e OpenStreetMap secondo le zone.', support: [['Manca un defibrillatore?', 'Le basi aperte possono essere incomplete. In emergenza chiama sempre i soccorsi.'], ['Cosa indicano i colori?', 'Indicano accesso pubblico, limitato o incerto secondo le informazioni disponibili.'], ['La posizione non funziona?', 'Controlla il permesso di localizzazione nelle impostazioni iOS di DefibFrance.']] },
            de: { data: 'Der Standort zeigt nahe Defibrillatoren, Zugänglichkeit und Notfallnavigation. Favoriten und Einstellungen bleiben lokal.', source: 'Daten stammen je nach Gebiet aus offenen Quellen wie data.gouv.fr und OpenStreetMap.', support: [['Fehlt ein Defibrillator?', 'Offene Datenbanken können unvollständig sein. Im Notfall immer den Rettungsdienst rufen.'], ['Was bedeuten die Farben?', 'Sie zeigen öffentlichen, eingeschränkten oder unklaren Zugang nach verfügbaren Informationen.'], ['Funktioniert der Standort nicht?', 'Prüfe die Standortberechtigung in den iOS-Einstellungen von DefibFrance.']] },
            ar: { data: 'يعرض الموقع أجهزة مزيل الرجفان القريبة وإمكانية الوصول إليها والإرشاد في حالات الطوارئ. تبقى المفضلات والتفضيلات محليًا.', source: 'تأتي البيانات من قواعد بيانات مفتوحة مثل data.gouv.fr وOpenStreetMap بحسب المنطقة.', support: [['جهاز مزيل رجفان مفقود؟', 'قد تكون قواعد البيانات المفتوحة غير مكتملة. في حالات الطوارئ، اتصل دائمًا بخدمات الإسعاف.'], ['ماذا تعني الألوان؟', 'تشير إلى وصول عام أو محدود أو غير مؤكد وفق المعلومات المتاحة.'], ['الموقع لا يعمل؟', 'تحقق من إذن الموقع في إعدادات iOS الخاصة بـ DefibFrance.']] }
        },
        toilet: {
            fr: { data: 'La position sert à afficher les toilettes publiques proches, calculer les distances, filtrer l’accessibilité et ouvrir un itinéraire. Favoris et préférences restent localement.', source: 'Les données proviennent de data.gouv.fr, OpenStreetMap et de bases ouvertes locales selon les communes.', support: [['Des toilettes manquent ?', 'Les bases ouvertes ne sont pas toujours complètes. Les communes publient les données à des rythmes différents.'], ['L’accessibilité est inconnue ?', 'Certaines données ne renseignent pas encore l’accessibilité. L’app affiche l’information quand elle existe.'], ['La localisation ne fonctionne pas ?', 'Vérifiez l’autorisation de localisation dans les réglages iOS de ToiletteFrance.']] },
            en: { data: 'Location shows nearby public toilets, calculates distances, filters accessibility and opens directions. Favorites and preferences stay local.', source: 'Data comes from data.gouv.fr, OpenStreetMap and local open datasets depending on municipalities.', support: [['A toilet is missing?', 'Open datasets are not always complete. Municipalities publish data at different rhythms.'], ['Accessibility is unknown?', 'Some datasets do not include accessibility yet. The app shows it when available.'], ['Location is not working?', 'Check location permission in iOS settings for ToiletteFrance.']] },
            es: { data: 'La ubicación muestra baños públicos cercanos, calcula distancias, filtra accesibilidad y abre rutas. Favoritos y preferencias permanecen localmente.', source: 'Los datos proceden de data.gouv.fr, OpenStreetMap y datos abiertos locales según los municipios.', support: [['¿Falta un baño?', 'Las bases abiertas no siempre están completas. Los municipios publican datos a ritmos distintos.'], ['¿La accesibilidad es desconocida?', 'Algunas bases aún no incluyen accesibilidad. La app la muestra cuando existe.'], ['¿La ubicación no funciona?', 'Comprueba el permiso de ubicación en los ajustes iOS de ToiletteFrance.']] },
            it: { data: 'La posizione mostra bagni pubblici vicini, calcola distanze, filtra accessibilità e apre itinerari. Preferiti e preferenze restano locali.', source: 'I dati provengono da data.gouv.fr, OpenStreetMap e dataset locali aperti secondo i comuni.', support: [['Manca un bagno?', 'Le basi aperte non sono sempre complete. I comuni pubblicano i dati con ritmi diversi.'], ['Accessibilità sconosciuta?', 'Alcuni dataset non includono ancora l’accessibilità. L’app la mostra quando disponibile.'], ['La posizione non funziona?', 'Controlla il permesso di localizzazione nelle impostazioni iOS di ToiletteFrance.']] },
            de: { data: 'Der Standort zeigt nahe öffentliche Toiletten, berechnet Entfernungen, filtert Barrierefreiheit und öffnet Routen. Favoriten und Einstellungen bleiben lokal.', source: 'Daten stammen aus data.gouv.fr, OpenStreetMap und lokalen offenen Datensätzen je nach Gemeinde.', support: [['Fehlt eine Toilette?', 'Offene Datensätze sind nicht immer vollständig. Gemeinden veröffentlichen Daten unterschiedlich schnell.'], ['Barrierefreiheit unbekannt?', 'Manche Daten enthalten noch keine Barrierefreiheit. Die App zeigt sie, wenn verfügbar.'], ['Funktioniert der Standort nicht?', 'Prüfe die Standortberechtigung in den iOS-Einstellungen von ToiletteFrance.']] },
            ja: { data: '位置情報は近くの公衆トイレの表示、距離計算、バリアフリーフィルター、経路案内の起動に使われます。お気に入りと設定は端末内に残ります。', source: 'データは自治体に応じてdata.gouv.fr、OpenStreetMap、地域のオープンデータから取得されます。', support: [['トイレが表示されませんか？', 'オープンデータは常に完全とは限りません。自治体によって公開の頻度が異なります。'], ['バリアフリー情報が不明ですか？', '一部のデータにはまだバリアフリー情報が含まれていません。利用可能な場合に表示されます。'], ['位置情報が動作しませんか？', 'iOS設定でToiletteFranceの位置情報許可を確認してください。']] },
            'zh-Hans': { data: '位置用于显示附近公共厕所、计算距离、筛选无障碍信息并打开路线。收藏和偏好会保留在本地。', source: '数据来自data.gouv.fr、OpenStreetMap以及各市镇提供的本地开放数据。', support: [['缺少厕所？', '开放数据并不总是完整。各市镇发布数据的节奏不同。'], ['无障碍信息未知？', '部分数据尚未包含无障碍信息。应用会在信息存在时显示。'], ['定位无法使用？', '请在iOS设置中检查ToiletteFrance的位置权限。']] },
            ko: { data: '위치는 가까운 공공 화장실 표시, 거리 계산, 접근성 필터링, 길안내 열기에 사용됩니다. 즐겨찾기와 설정은 기기에만 저장됩니다.', source: '데이터는 지자체에 따라 data.gouv.fr, OpenStreetMap, 지역 오픈 데이터에서 제공됩니다.', support: [['화장실이 누락되었나요?', '오픈 데이터는 항상 완전하지 않을 수 있습니다. 지자체마다 데이터 공개 주기가 다릅니다.'], ['접근성 정보가 알 수 없음으로 표시되나요?', '일부 데이터에는 아직 접근성 정보가 없습니다. 정보가 있을 때 앱에 표시됩니다.'], ['위치가 작동하지 않나요?', 'iOS 설정에서 ToiletteFrance 위치 권한을 확인하세요.']] },
            ar: { data: 'يُستخدم الموقع لعرض دورات المياه العامة القريبة وحساب المسافات وتصفية إمكانية الوصول وفتح الاتجاهات. تبقى المفضلات والتفضيلات محليًا.', source: 'تأتي البيانات من data.gouv.fr وOpenStreetMap وقواعد بيانات محلية مفتوحة بحسب البلديات.', support: [['دورات مياه مفقودة؟', 'قواعد البيانات المفتوحة ليست كاملة دائمًا. تنشر البلديات البيانات بوتائر مختلفة.'], ['إمكانية الوصول غير معروفة؟', 'بعض مجموعات البيانات لا تتضمن إمكانية الوصول بعد. يعرض التطبيق المعلومة عندما تكون متاحة.'], ['الموقع لا يعمل؟', 'تحقق من إذن الموقع في إعدادات iOS الخاصة بـ ToiletteFrance.']] }
        },
    };

    var premium = {
        carbufrance: {
        fr: { title: 'Pass Premium', subtitle: 'Prix, marché, carnet et widget sans publicité.', eyebrow: 'CarbuFrance Premium', heading: 'Tout ce qui aide vraiment à décider où faire le plein.', lead: 'La version gratuite garde l’essentiel. Premium retire la publicité et ajoute les outils d’analyse, de suivi véhicule et d’action rapide.', note: '7 jours d’essai gratuit, puis prix affiché dans l’app', features: [['Sans publicité', 'Plus de bannière, interstitiel ou vidéo récompensée.'], ['Observatoire des marchés', 'Brent, EUR/USD, tendances et actualités.'], ['Carnet de bord', 'Pleins, litres, dépenses, L/100 km et budget.'], ['Entretien véhicule', 'Interventions, rappels et coût total.'], ['Actions widget', 'Navigation, ajout d’un plein et actualisation.']], rows: [['Prix, carte, liste, favoris', true, true], ['Widget station la moins chère', true, true], ['Publicités supprimées', false, true], ['Marchés et moyennes', false, true], ['Carnet, entretien, actions widget', false, true]], activate: 'Ouvrez CarbuFrance › Réglages › Premium. StoreKit et votre compte Apple gèrent l’essai, l’achat, le renouvellement, l’annulation et la restauration.' },
        en: { title: 'Premium Pass', subtitle: 'Prices, market, logbook and widget with no ads.', eyebrow: 'CarbuFrance Premium', heading: 'Everything that helps you decide where to refuel.', lead: 'The free version keeps the essentials. Premium removes ads and adds analysis, vehicle tracking and quick actions.', note: '7-day free trial, then the price shown in the app', features: [['No ads', 'No banners, interstitials or rewarded videos.'], ['Market observatory', 'Brent, EUR/USD, trends and news.'], ['Logbook', 'Fill-ups, liters, spending, L/100 km and budget.'], ['Vehicle maintenance', 'Service events, reminders and total cost.'], ['Widget actions', 'Directions, add fill-up and refresh.']], rows: [['Prices, map, list, favorites', true, true], ['Cheapest-station widget', true, true], ['Ads removed', false, true], ['Markets and averages', false, true], ['Logbook, maintenance, widget actions', false, true]], activate: 'Open CarbuFrance › Settings › Premium. StoreKit and your Apple account handle trial, purchase, renewal, cancellation and restoration.' },
        es: { title: 'Pass Premium', subtitle: 'Precios, mercado, registro y widget sin publicidad.', eyebrow: 'CarbuFrance Premium', heading: 'Todo lo que ayuda a decidir dónde repostar.', lead: 'La versión gratuita mantiene lo esencial. Premium elimina anuncios y añade análisis, seguimiento del vehículo y acciones rápidas.', note: '7 días de prueba gratis, luego el precio mostrado en la app', features: [['Sin publicidad', 'Sin banners, intersticiales ni vídeos recompensados.'], ['Observatorio de mercados', 'Brent, EUR/USD, tendencias y noticias.'], ['Registro', 'Repostajes, litros, gastos, L/100 km y presupuesto.'], ['Mantenimiento', 'Intervenciones, recordatorios y coste total.'], ['Acciones widget', 'Ruta, añadir repostaje y actualizar.']], rows: [['Precios, mapa, lista, favoritos', true, true], ['Widget de estación más barata', true, true], ['Anuncios eliminados', false, true], ['Mercados y medias', false, true], ['Registro, mantenimiento, acciones widget', false, true]], activate: 'Abre CarbuFrance › Ajustes › Premium. StoreKit y tu cuenta Apple gestionan prueba, compra, renovación, cancelación y restauración.' },
        it: { title: 'Pass Premium', subtitle: 'Prezzi, mercato, registro e widget senza pubblicità.', eyebrow: 'CarbuFrance Premium', heading: 'Tutto ciò che aiuta a decidere dove fare rifornimento.', lead: 'La versione gratuita mantiene l’essenziale. Premium elimina annunci e aggiunge analisi, gestione veicolo e azioni rapide.', note: '7 giorni di prova gratuita, poi il prezzo mostrato nell’app', features: [['Senza pubblicità', 'Nessun banner, interstitial o video premiato.'], ['Osservatorio mercati', 'Brent, EUR/USD, tendenze e notizie.'], ['Registro', 'Rifornimenti, litri, spese, L/100 km e budget.'], ['Manutenzione', 'Interventi, promemoria e costo totale.'], ['Azioni widget', 'Navigazione, aggiungi rifornimento e aggiorna.']], rows: [['Prezzi, mappa, lista, preferiti', true, true], ['Widget stazione più economica', true, true], ['Annunci rimossi', false, true], ['Mercati e medie', false, true], ['Registro, manutenzione, azioni widget', false, true]], activate: 'Apri CarbuFrance › Impostazioni › Premium. StoreKit e il tuo account Apple gestiscono prova, acquisto, rinnovo, annullamento e ripristino.' },
        de: { title: 'Premium-Pass', subtitle: 'Preise, Markt, Fahrtenbuch und Widget ohne Werbung.', eyebrow: 'CarbuFrance Premium', heading: 'Alles, was bei der Tankentscheidung hilft.', lead: 'Die kostenlose Version enthält das Wesentliche. Premium entfernt Werbung und ergänzt Analyse, Fahrzeugverwaltung und Schnellaktionen.', note: '7 Tage kostenlos testen, danach der in der App angezeigte Preis', features: [['Keine Werbung', 'Keine Banner, Interstitials oder belohnten Videos.'], ['Marktüberblick', 'Brent, EUR/USD, Trends und Nachrichten.'], ['Fahrtenbuch', 'Tankvorgänge, Liter, Ausgaben, L/100 km und Budget.'], ['Fahrzeugwartung', 'Wartungen, Erinnerungen und Gesamtkosten.'], ['Widget-Aktionen', 'Route, Tankvorgang hinzufügen und aktualisieren.']], rows: [['Preise, Karte, Liste, Favoriten', true, true], ['Widget für günstigste Tankstelle', true, true], ['Werbung entfernt', false, true], ['Märkte und Durchschnitte', false, true], ['Fahrtenbuch, Wartung, Widget-Aktionen', false, true]], activate: 'Öffne CarbuFrance › Einstellungen › Premium. StoreKit und dein Apple-Konto übernehmen Testphase, Kauf, Verlängerung, Kündigung und Wiederherstellung.' }
        },
        irvefrance: {
        fr: { title: 'Pass Premium', subtitle: 'Recharge, prix saisi et mobilité électrique sans publicité.', eyebrow: 'IRVEFrance Premium', heading: 'Des décisions de recharge plus claires avant d’arriver à la borne.', lead: 'La version gratuite garde la carte, les bornes, les filtres, les favoris, le mode hors-ligne et le calculateur. Premium retire la publicité et ajoute l’analyse du prix spot, le calcul de coût avec saisie du tarif réel et les conseils de recharge.', note: '7 jours d’essai gratuit, puis 0,99 €/mois dans l’app', features: [['Sans publicité', 'Suppression des bannières, interstitiels et vidéos récompensées.'], ['Prix saisi', 'Renseignez le tarif affiché sur la borne ou dans l’app opérateur.'], ['Analyse du coût', 'Décomposition du prix de recharge, énergie et évolution du marché électrique.'], ['Conseils de recharge', 'Repères pour optimiser durée, puissance, coût et batterie.'], ['Actualités mobilité', 'Informations utiles sur les réseaux et la mobilité électrique.']], rows: [['Carte, liste, détail borne et guidage', true, true], ['Filtres connecteurs, puissance et rayon', true, true], ['Favoris, hors-ligne, Siri et calculateur', true, true], ['Publicités supprimées', false, true], ['Calcul avec prix saisi', false, true], ['Analyse de coût et conseils', false, true]], activate: 'Ouvrez IRVEFrance › Réglages › Premium. StoreKit et votre compte Apple gèrent l’essai, l’achat, le renouvellement, l’annulation et la restauration.' },
        en: { title: 'Premium Pass', subtitle: 'Charging, manual pricing and electric mobility with no ads.', eyebrow: 'IRVEFrance Premium', heading: 'Clearer charging decisions before you reach the station.', lead: 'The free version keeps the map, chargers, filters, favorites, offline mode and calculator. Premium removes ads and adds spot-price analysis, cost calculation with the real tariff you enter, and charging advice.', note: '7-day free trial, then €0.99/month in the app', features: [['No ads', 'No banners, interstitials or rewarded videos.'], ['Manual price entry', 'Enter the tariff shown at the charger or in the operator app.'], ['Cost analysis', 'Charging price breakdown, energy and electricity-market changes.'], ['Charging advice', 'Guidance to optimize duration, power, cost and battery.'], ['EV news', 'Useful updates about charging networks and electric mobility.']], rows: [['Map, list, charger detail and directions', true, true], ['Connector, power and radius filters', true, true], ['Favorites, offline, Siri and calculator', true, true], ['Ads removed', false, true], ['Cost with entered price', false, true], ['Cost analysis and advice', false, true]], activate: 'Open IRVEFrance › Settings › Premium. StoreKit and your Apple account handle trial, purchase, renewal, cancellation and restoration.' },
        es: { title: 'Pass Premium', subtitle: 'Recarga, precio introducido y movilidad eléctrica sin anuncios.', eyebrow: 'IRVEFrance Premium', heading: 'Decisiones de recarga más claras antes de llegar al punto.', lead: 'La versión gratuita conserva mapa, cargadores, filtros, favoritos, modo sin conexión y calculadora. Premium elimina anuncios y añade análisis del precio spot, cálculo de coste con la tarifa real que introduces y consejos de recarga.', note: '7 días de prueba gratis, luego 0,99 €/mes en la app', features: [['Sin publicidad', 'Sin banners, intersticiales ni vídeos recompensados.'], ['Precio introducido', 'Introduce la tarifa mostrada en el cargador o en la app del operador.'], ['Análisis del coste', 'Desglose del precio de recarga, energía y evolución eléctrica.'], ['Consejos de recarga', 'Ayuda para optimizar duración, potencia, coste y batería.'], ['Noticias de movilidad', 'Información útil sobre redes y movilidad eléctrica.']], rows: [['Mapa, lista, detalle y ruta', true, true], ['Filtros por conector, potencia y radio', true, true], ['Favoritos, offline, Siri y calculadora', true, true], ['Anuncios eliminados', false, true], ['Coste con precio introducido', false, true], ['Análisis de coste y consejos', false, true]], activate: 'Abre IRVEFrance › Ajustes › Premium. StoreKit y tu cuenta Apple gestionan prueba, compra, renovación, cancelación y restauración.' },
        it: { title: 'Pass Premium', subtitle: 'Ricarica, prezzo inserito e mobilità elettrica senza pubblicità.', eyebrow: 'IRVEFrance Premium', heading: 'Decisioni di ricarica più chiare prima di arrivare alla colonnina.', lead: 'La versione gratuita mantiene mappa, colonnine, filtri, preferiti, offline e calcolatore. Premium elimina annunci e aggiunge analisi del prezzo spot, calcolo del costo con la tariffa reale inserita e consigli di ricarica.', note: '7 giorni di prova gratuita, poi 0,99 €/mese nell’app', features: [['Senza pubblicità', 'Nessun banner, interstitial o video premiato.'], ['Prezzo inserito', 'Inserisci la tariffa mostrata sulla colonnina o nell’app operatore.'], ['Analisi costi', 'Scomposizione del prezzo, energia ed evoluzione del mercato elettrico.'], ['Consigli di ricarica', 'Indicazioni per ottimizzare durata, potenza, costo e batteria.'], ['Notizie mobilità', 'Aggiornamenti utili su reti e mobilità elettrica.']], rows: [['Mappa, lista, dettaglio e navigazione', true, true], ['Filtri connettori, potenza e raggio', true, true], ['Preferiti, offline, Siri e calcolatore', true, true], ['Annunci rimossi', false, true], ['Costo con prezzo inserito', false, true], ['Analisi costi e consigli', false, true]], activate: 'Apri IRVEFrance › Impostazioni › Premium. StoreKit e il tuo account Apple gestiscono prova, acquisto, rinnovo, annullamento e ripristino.' },
        de: { title: 'Premium-Pass', subtitle: 'Laden, eingegebener Preis und Elektromobilität ohne Werbung.', eyebrow: 'IRVEFrance Premium', heading: 'Klarere Ladeentscheidungen, bevor du die Säule erreichst.', lead: 'Die kostenlose Version enthält Karte, Ladepunkte, Filter, Favoriten, Offline-Modus und Rechner. Premium entfernt Werbung und ergänzt Spotpreis-Analyse, Kostenberechnung mit dem eingegebenen realen Tarif und Ladehinweise.', note: '7 Tage kostenlos testen, danach 0,99 €/Monat in der App', features: [['Keine Werbung', 'Keine Banner, Interstitials oder belohnten Videos.'], ['Eingegebener Preis', 'Gib den Tarif ein, der an der Säule oder in der Betreiber-App angezeigt wird.'], ['Kostenanalyse', 'Preisaufschlüsselung, Energie und Entwicklung des Strommarkts.'], ['Ladehinweise', 'Tipps zur Optimierung von Dauer, Leistung, Kosten und Batterie.'], ['E-Mobility-News', 'Nützliche Infos zu Ladenetzen und Elektromobilität.']], rows: [['Karte, Liste, Details und Route', true, true], ['Filter für Anschluss, Leistung und Radius', true, true], ['Favoriten, offline, Siri und Rechner', true, true], ['Werbung entfernt', false, true], ['Kosten mit eingegebenem Preis', false, true], ['Kostenanalyse und Hinweise', false, true]], activate: 'Öffne IRVEFrance › Einstellungen › Premium. StoreKit und dein Apple-Konto übernehmen Testphase, Kauf, Verlängerung, Kündigung und Wiederherstellung.' }
        }
    };

    Object.assign(ui, {
        uk: { home: 'Головна', apps: 'Застосунки', support: 'Підтримка', privacy: 'Конфіденційність', premium: 'Premium', about: 'Про нас', available: 'Доступно', soon: 'Незабаром', appStore: 'Переглянути в App Store', email: 'Звернутися до підтримки', updated: 'Оновлено: 6 травня 2026', developer: 'Незалежний розробник', profile: 'Профіль розробника', rightsTitle: 'Ваші права', rights: 'Відповідно до GDPR ви можете попросити доступ, виправлення, видалення, обмеження, перенесення або заперечити проти обробки ваших персональних даних. Ви також можете звернутися до компетентного органу захисту даних.', contactTitle: 'Контакт', deleteTitle: 'Видалення даних', faqTitle: 'Поширені запитання', quickSupport: 'Швидка підтримка', dataUsed: 'Використані дані', business: 'Реклама та покупки', sources: 'Джерела даних', retention: 'Зберігання', download: 'Завантажити', included: 'Включено', free: 'Безкоштовно', yes: 'Так', no: 'Ні' },
        ru: { home: 'Главная', apps: 'Приложения', support: 'Поддержка', privacy: 'Конфиденциальность', premium: 'Premium', about: 'О проекте', available: 'Доступно', soon: 'Скоро', appStore: 'Открыть в App Store', email: 'Связаться с поддержкой', updated: 'Обновлено: 6 мая 2026', developer: 'Независимый разработчик', profile: 'Профиль разработчика', rightsTitle: 'Ваши права', rights: 'В соответствии с GDPR вы можете запросить доступ, исправление, удаление, ограничение, переносимость или возразить против обработки ваших персональных данных. Вы также можете обратиться в компетентный орган по защите данных.', contactTitle: 'Контакт', deleteTitle: 'Удаление данных', faqTitle: 'Частые вопросы', quickSupport: 'Быстрая поддержка', dataUsed: 'Используемые данные', business: 'Реклама и покупки', sources: 'Источники данных', retention: 'Хранение', download: 'Загрузить', included: 'Включено', free: 'Бесплатно', yes: 'Да', no: 'Нет' }
    });

    Object.assign(landingLabels, {
        ar: { discover: 'اكتشاف', highlights: 'أبرز الميزات', privacyData: 'البيانات والخصوصية', usefulLinks: 'روابط مفيدة', webOverview: 'نظرة ويب', preparation: 'قيد التحضير لـ App Store', legalNote: 'تبقى الصفحات القانونية المستخدمة من التطبيقات على روابطها الحالية.', openApp: 'فتح الصفحة' },
        uk: { discover: 'Дізнатися більше', highlights: 'Основне', privacyData: 'Дані та конфіденційність', usefulLinks: 'Корисні посилання', webOverview: 'Огляд', preparation: 'Підготовка до App Store', legalNote: 'Юридичні сторінки, які використовують застосунки, залишаються за поточними URL.', openApp: 'Відкрити сторінку' },
        ru: { discover: 'Подробнее', highlights: 'Главное', privacyData: 'Данные и конфиденциальность', usefulLinks: 'Полезные ссылки', webOverview: 'Обзор', preparation: 'Подготовка к App Store', legalNote: 'Юридические страницы, используемые приложениями, остаются по текущим URL.', openApp: 'Открыть страницу' }
    });

    Object.assign(commonCopy, {
        uk: { homeLead: 'iOS-застосунки для щоденних потреб, екстрених ситуацій, мобільності та публічних сервісів у Франції.', deletion: 'Застосунок не створює обліковий запис користувача. Локальні дані можна видалити, вилучивши застосунок або через налаштування, якщо така опція доступна.', adDetails: 'Google AdMob може обробляти рекламні ідентифікатори, IP-адресу, модель пристрою, дані продуктивності та взаємодії з рекламою. Перегляньте політику конфіденційності Google.', retention: 'Локальні дані залишаються на вашому пристрої, доки ви не видалите застосунок або не скинете налаштування. Рекламні дані підпорядковуються правилам Google AdMob, а покупки — правилам Apple, коли вони існують.', feature: 'Функція', featuresTitle: 'Функції' },
        ru: { homeLead: 'iOS-приложения для повседневных задач, экстренных ситуаций, мобильности и общественных сервисов во Франции.', deletion: 'Приложение не создает учетную запись пользователя. Локальные данные можно удалить, удалив приложение или через настройки, если такая опция доступна.', adDetails: 'Google AdMob может обрабатывать рекламные идентификаторы, IP-адрес, модель устройства, данные производительности и взаимодействия с рекламой. Ознакомьтесь с политикой конфиденциальности Google.', retention: 'Локальные данные остаются на вашем устройстве, пока вы не удалите приложение или не сбросите настройки. Рекламные данные следуют правилам Google AdMob, а покупки — правилам Apple, если они есть.', feature: 'Функция', featuresTitle: 'Функции' }
    });

    Object.assign(supportMailCopy, {
        uk: { write: 'Написати в підтримку', copy: 'Скопіювати адресу', copied: 'Адресу скопійовано', fallback: 'Якщо кнопка не відкриває пошту, скопіюйте адресу нижче.', body: ['Вітаю,', '', 'Застосунок: {app}', 'Версія застосунку: ', 'Пристрій: ', 'Версія iOS: ', '', 'Опис проблеми: ', '', 'Кроки для відтворення: ', '', 'Скріншот додано, якщо можливо.', '', 'Дякую.'] },
        ru: { write: 'Написать в поддержку', copy: 'Скопировать адрес', copied: 'Адрес скопирован', fallback: 'Если кнопка не открывает почту, скопируйте адрес ниже.', body: ['Здравствуйте,', '', 'Приложение: {app}', 'Версия приложения: ', 'Устройство: ', 'Версия iOS: ', '', 'Описание проблемы: ', '', 'Шаги для воспроизведения: ', '', 'Скриншот приложен, если возможно.', '', 'Спасибо.'] }
    });

    Object.assign(apps.carbufrance.description, {
        ja: 'フランスの燃料価格、地図、リスト、お気に入り、ウィジェット、StoreKit Premiumツール。', ko: '프랑스 연료 가격, 지도, 목록, 즐겨찾기, 위젯 및 StoreKit Premium 도구.', 'zh-Hans': '法国燃油价格、地图、列表、收藏、小组件和 StoreKit Premium 工具。', uk: 'Ціни на пальне у Франції, карта, список, обране, віджет і Premium-інструменти StoreKit.', ru: 'Цены на топливо во Франции, карта, список, избранное, виджет и Premium-инструменты StoreKit.'
    });
    Object.assign(apps.irvefrance.description, {
        ja: 'EV充電ステーション、ネットワーク、コネクタ、出力、空き状況、経路案内。', ko: '전기차 충전소, 네트워크, 커넥터, 전력, 사용 가능 여부와 길안내.', 'zh-Hans': '电动汽车充电站、网络、接口、功率、可用性和路线。', uk: 'Зарядні станції для електромобілів, мережі, роз’єми, потужність, доступність і навігація.', ru: 'Зарядные станции для электромобилей, сети, разъемы, мощность, доступность и навигация.'
    });
    Object.assign(apps.toilettefrance.description, {
        uk: 'Громадські туалети у Франції, карта, корисні фільтри, доступність, години роботи та навігація.', ru: 'Общественные туалеты во Франции, карта, полезные фильтры, доступность, часы работы и навигация.'
    });
    Object.assign(apps.defibfrance.description, {
        ja: 'AED、自動体外式除細動器の位置、利用可否、アクセス性、緊急時の経路案内。', ko: '자동심장충격기 위치, 사용 가능 여부, 접근성 및 긴급 길안내.', 'zh-Hans': '自动体外除颤器、可用性、无障碍信息和紧急路线。', uk: 'Автоматичні зовнішні дефібрилятори, доступність, умови доступу та екстрена навігація.', ru: 'Автоматические наружные дефибрилляторы, доступность, условия доступа и экстренная навигация.'
    });

    Object.assign(appFeatures.carbufrance, {
        ja: ['フランスの給油所を価格付きで地図とリストに表示。', '価格または距離で並べ替え、お気に入り、非表示ステーション、オフラインキャッシュ。', '最安ステーションのウィジェットとPremiumアクション。', 'Premiumで給油記録、メンテナンス、市場ウォッチ。'],
        ko: ['프랑스 주유소를 가격과 함께 지도와 목록으로 표시.', '가격 또는 거리 정렬, 즐겨찾기, 숨긴 주유소, 오프라인 캐시.', '가장 저렴한 주유소 위젯과 Premium 동작.', 'Premium의 주유 기록, 정비, 시장 관측.'],
        'zh-Hans': ['带价格的法国加油站地图和列表。', '按价格或距离排序、收藏、隐藏站点和离线缓存。', '最便宜加油站小组件和 Premium 操作。', 'Premium 中的加油日志、维护和市场观察。'],
        uk: ['Карта й список АЗС у Франції з цінами на пальне.', 'Сортування за ціною або відстанню, обране, приховані станції та офлайн-кеш.', 'Віджет найдешевшої станції з Premium-діями.', 'Журнал пального, обслуговування та огляд ринків у Premium.'],
        ru: ['Карта и список АЗС во Франции с ценами на топливо.', 'Сортировка по цене или расстоянию, избранное, скрытые станции и офлайн-кэш.', 'Виджет самой дешевой станции с Premium-действиями.', 'Журнал топлива, обслуживание и обзор рынков в Premium.']
    });
    Object.assign(appFeatures.irvefrance, {
        ja: ['充電器の地図にコネクタ、出力、事業者、空き状況を表示。', 'CCS2、CHAdeMO、Type 2、最低出力、5〜50 km範囲のフィルター。', 'Look Around、3D地図、お気に入り、オフライン、Siri、充電計算機。', 'Premium：スポット価格、入力料金によるコスト、充電アドバイス、EVニュース。'],
        ko: ['충전기 지도에 커넥터, 전력, 운영사, 사용 가능 여부 표시.', 'CCS2, CHAdeMO, Type 2, 최소 전력, 5~50km 반경 필터.', 'Look Around, 3D 지도, 즐겨찾기, 오프라인, Siri, 충전 계산기.', 'Premium: 현물 가격, 입력 요금 기반 비용, 충전 조언, 전기차 뉴스.'],
        'zh-Hans': ['充电站地图显示接口、功率、运营商和可用性。', 'CCS2、CHAdeMO、Type 2、最低功率和 5 到 50 公里半径筛选。', 'Look Around、3D 地图、收藏、离线、Siri 和充电计算器。', 'Premium：现货电价、输入费率成本、充电建议和电动出行新闻。'],
        uk: ['Карта зарядних станцій з роз’ємами, потужністю, оператором і доступністю.', 'Фільтри CCS2, CHAdeMO, Type 2, мінімальної потужності та радіуса 5–50 км.', 'Look Around, 3D-карта, обране, офлайн, Siri та калькулятор заряджання.', 'Premium: спотова ціна, вартість за введеним тарифом, поради та новини електромобільності.'],
        ru: ['Карта зарядных станций с разъемами, мощностью, оператором и доступностью.', 'Фильтры CCS2, CHAdeMO, Type 2, минимальной мощности и радиуса 5–50 км.', 'Look Around, 3D-карта, избранное, офлайн, Siri и калькулятор зарядки.', 'Premium: спотовая цена, стоимость по введенному тарифу, советы и новости электромобильности.']
    });
    Object.assign(appFeatures.defibfrance, {
        ja: ['近くのAEDをアクセス性に応じた色で地図表示。', '公共アクセス、24時間、屋内/屋外、500 m〜10 km範囲のフィルター。', '緊急モード、SAMU 15通話確認、触覚メトロノーム付きCPRガイド。', '同意に応じた広告、1時間広告なしのリワード動画、広告を完全に外すStoreKit寄付。'],
        ko: ['주변 AED 지도를 접근성 색상으로 표시.', '공개 접근, 24시간, 실내/실외, 500m~10km 반경 필터.', '긴급 모드, SAMU 15 전화 확인, 햅틱 메트로놈 CPR 가이드.', '동의 기반 광고, 1시간 광고 제거 보상 영상, 광고를 영구 제거하는 StoreKit 기부.'],
        'zh-Hans': ['按无障碍状态着色显示附近 AED 地图。', '公共访问、24/7、室内/室外以及 500 米到 10 公里半径筛选。', '紧急模式、SAMU 15 呼叫确认和带触觉节拍器的 CPR 指南。', '经同意可显示广告，奖励视频提供 1 小时无广告，StoreKit 捐赠可永久移除广告。'],
        uk: ['Карта найближчих AED з кольорами за доступністю.', 'Фільтри публічного доступу, 24/7, приміщення/вулиця та радіус 500 м – 10 км.', 'Екстрений режим, підтвердження виклику SAMU 15 і гід СЛР з тактильним метрономом.', 'Реклама за згодою, відео з винагородою на 1 год без реклами та донат StoreKit для остаточного видалення реклами.'],
        ru: ['Карта ближайших AED с цветами по доступности.', 'Фильтры публичного доступа, 24/7, внутри/снаружи и радиуса 500 м – 10 км.', 'Экстренный режим, подтверждение звонка SAMU 15 и гид СЛР с тактильным метрономом.', 'Реклама с согласия, видео с наградой на 1 час без рекламы и донат StoreKit для окончательного удаления рекламы.']
    });
    Object.assign(appFeatures.toilettefrance, {
        uk: ['Карта громадських туалетів у Франції з відстанню та маршрутом.', 'Фільтри доступності, години роботи та доступні дані з відкритих джерел.', 'Обране, налаштування та локальні дані без облікового запису.', 'Безкоштовний застосунок, що фінансується рекламою AdMob.'],
        ru: ['Карта общественных туалетов во Франции с расстоянием и маршрутом.', 'Фильтры доступности, часы работы и доступные сведения из открытых данных.', 'Избранное, настройки и локальные данные без учетной записи.', 'Бесплатное приложение, финансируемое рекламой AdMob.']
    });

    Object.assign(typeText.fuel, {
        ja: { data: '位置情報は近くの給油所の表示、距離計算、経路案内に使われます。お気に入り、非表示ステーション、設定、言語、オフラインキャッシュ、給油記録、メンテナンスは端末内に残ります。', source: '価格はフランス経済省の公開データセットから取得されます。市場情報は公開の金融データまたはニュース配信から取得される場合があります。', support: [['価格が最新ではありませんか？', '価格は給油所の申告に依存します。最近の更新がない場合、アプリは最後に利用できる値を保持します。'], ['ウィジェットの操作が正しく表示されませんか？', '無料ウィジェットは最安ステーションを表示します。クイック操作はPremiumで、読みやすさのためコンパクトなアイコンを使います。'], ['Premiumを復元するには？', 'CarbuFranceの設定 › Premiumを開きます。StoreKitとAppleアカウントが復元を管理します。']] },
        ko: { data: '위치는 가까운 주유소 표시, 거리 계산, 길안내 열기에 사용됩니다. 즐겨찾기, 숨긴 주유소, 설정, 언어, 오프라인 캐시, 주유 기록, 정비는 기기에만 저장됩니다.', source: '가격은 프랑스 경제부 공개 데이터셋에서 제공됩니다. 시장 정보는 공개 금융 또는 뉴스 피드에서 제공될 수 있습니다.', support: [['가격이 최신이 아닌가요?', '가격은 주유소 신고에 따라 달라집니다. 최근 업데이트가 없으면 앱은 마지막 값을 유지합니다.'], ['위젯 동작이 이상하게 보이나요?', '무료 위젯은 가장 저렴한 주유소를 표시합니다. 빠른 동작은 Premium이며 읽기 쉬운 작은 아이콘을 사용합니다.'], ['Premium은 어떻게 복원하나요?', 'CarbuFrance에서 설정 › Premium을 여세요. StoreKit과 Apple 계정이 복원을 처리합니다.']] },
        'zh-Hans': { data: '位置用于显示附近加油站、计算距离并打开路线。收藏、隐藏站点、偏好、语言、离线缓存、加油日志和维护记录会保留在设备上。', source: '价格来自法国经济部公开数据集。市场信息可能来自公开金融或新闻来源。', support: [['价格不是最新？', '价格取决于加油站申报。如果没有近期更新，应用会保留最后可用值。'], ['小组件操作显示不正确？', '免费小组件显示最便宜的加油站。快捷操作属于Premium，并使用紧凑图标以保持可读。'], ['如何恢复Premium？', '打开CarbuFrance，然后进入设置 › Premium。StoreKit和你的Apple账户负责恢复。']] },
        uk: { data: 'Позиція використовується для показу найближчих АЗС, обчислення відстаней і відкриття маршруту. Обране, приховані станції, налаштування, мова, офлайн-кеш, журнал пального й обслуговування залишаються на пристрої.', source: 'Ціни надходять із відкритого набору даних Міністерства економіки Франції. Ринкова інформація може надходити з відкритих фінансових або новинних джерел.', support: [['Ціни не оновлені?', 'Ціни залежать від повідомлень станцій. Якщо немає свіжого оновлення, застосунок зберігає останнє доступне значення.'], ['Дії віджета відображаються неправильно?', 'Безкоштовний віджет показує найдешевшу станцію. Швидкі дії належать до Premium і використовують компактні іконки.'], ['Як відновити Premium?', 'Відкрийте CarbuFrance › Налаштування › Premium. StoreKit і ваш Apple-акаунт керують відновленням.']] },
        ru: { data: 'Местоположение используется для показа ближайших АЗС, расчета расстояний и открытия маршрута. Избранное, скрытые станции, настройки, язык, офлайн-кэш, журнал топлива и обслуживание остаются на устройстве.', source: 'Цены поступают из открытого набора данных Министерства экономики Франции. Рыночная информация может поступать из открытых финансовых или новостных источников.', support: [['Цены не обновлены?', 'Цены зависят от сообщений станций. Если свежего обновления нет, приложение сохраняет последнее доступное значение.'], ['Действия виджета отображаются неверно?', 'Бесплатный виджет показывает самую дешевую станцию. Быстрые действия относятся к Premium и используют компактные значки.'], ['Как восстановить Premium?', 'Откройте CarbuFrance › Настройки › Premium. StoreKit и ваш Apple ID выполняют восстановление.']] }
    });
    Object.assign(typeText.ev, {
        ja: { data: '位置情報は近くの充電器、コネクタ、出力、ネットワーク、経路案内の表示に使われます。お気に入り、フィルター、設定はローカルに残ります。', source: '充電器データはOpenChargeMap、OpenStreetMap、利用可能な公開集約データから取得されます。', support: [['充電器が見つかりませんか？', 'データは事業者とオープンデータベースに依存します。一部の充電器は遅れて表示される場合があります。'], ['空き状況が違って見えますか？', 'リアルタイム情報はネットワークにより異なります。重要な移動前には現地でも確認してください。'], ['Premiumを復元するには？', 'IRVEFrance › 設定 › Premiumを開きます。StoreKitとAppleアカウントが復元を管理します。']] },
        ko: { data: '위치는 가까운 충전기, 커넥터, 전력, 네트워크, 길안내를 표시하는 데 사용됩니다. 즐겨찾기, 필터, 설정은 로컬에 저장됩니다.', source: '충전기는 OpenChargeMap, OpenStreetMap 및 사용 가능한 공개 집계 데이터셋에서 제공됩니다.', support: [['충전기가 누락되었나요?', '데이터는 운영사와 오픈 데이터베이스에 따라 달라집니다. 일부 충전기는 나중에 나타날 수 있습니다.'], ['사용 가능 여부가 이상한가요?', '실시간 정보는 네트워크마다 다릅니다. 중요한 이동 전에는 현장에서 확인하세요.'], ['Premium은 어떻게 복원하나요?', 'IRVEFrance › 설정 › Premium을 여세요. StoreKit과 Apple 계정이 복원을 처리합니다.']] },
        'zh-Hans': { data: '位置用于显示附近充电站、接口、功率、网络和路线。收藏、筛选和偏好会保留在本地。', source: '充电站数据来自OpenChargeMap、OpenStreetMap以及可用的公开聚合数据集。', support: [['缺少充电站？', '数据取决于运营商和开放数据库。有些充电站可能稍后出现。'], ['可用性看起来不对？', '实时可用性因网络而异。关键行程前请始终现场确认。'], ['如何恢复Premium？', '打开IRVEFrance › 设置 › Premium。StoreKit和你的Apple账户负责恢复。']] },
        uk: { data: 'Позиція показує найближчі зарядні станції, роз’єми, потужність, мережі та маршрути. Обране, фільтри й налаштування залишаються локально.', source: 'Зарядні станції надходять з OpenChargeMap, OpenStreetMap та агрегованих відкритих наборів даних залежно від доступності.', support: [['Станція відсутня?', 'Дані залежать від операторів і відкритих баз. Деякі станції можуть з’явитися пізніше.'], ['Доступність здається неправильною?', 'Жива доступність відрізняється за мережами. Перед критичною поїздкою перевіряйте на місці.'], ['Як відновити Premium?', 'Відкрийте IRVEFrance › Налаштування › Premium. StoreKit і ваш Apple-акаунт керують відновленням.']] },
        ru: { data: 'Местоположение показывает ближайшие зарядные станции, разъемы, мощность, сети и маршруты. Избранное, фильтры и настройки остаются локально.', source: 'Зарядные станции поступают из OpenChargeMap, OpenStreetMap и агрегированных открытых наборов данных в зависимости от доступности.', support: [['Станция отсутствует?', 'Данные зависят от операторов и открытых баз. Некоторые станции могут появиться позже.'], ['Доступность кажется неверной?', 'Онлайн-доступность отличается по сетям. Перед важной поездкой всегда проверяйте на месте.'], ['Как восстановить Premium?', 'Откройте IRVEFrance › Настройки › Premium. StoreKit и ваш Apple ID выполняют восстановление.']] }
    });
    Object.assign(typeText.defib, {
        ja: { data: '位置情報は近くの除細動器、アクセス性、緊急経路を表示するために使われます。お気に入りと設定はローカルに残ります。', source: 'データは地域に応じてdata.gouv.frやOpenStreetMapなどのオープンデータベースから取得されます。', support: [['除細動器が見つかりませんか？', 'オープンデータベースは不完全な場合があります。緊急時は必ず救急サービスに連絡してください。'], ['色は何を意味しますか？', '利用可能な情報に基づいて、公共、制限付き、不確かなアクセスを示します。'], ['位置情報が動作しませんか？', 'iOS設定でDefibFranceの位置情報許可を確認してください。']] },
        ko: { data: '위치는 가까운 제세동기, 접근성, 긴급 길안내를 표시하는 데 사용됩니다. 즐겨찾기와 설정은 로컬에 저장됩니다.', source: '데이터는 지역에 따라 data.gouv.fr 및 OpenStreetMap 같은 오픈 데이터베이스에서 제공됩니다.', support: [['제세동기가 누락되었나요?', '오픈 데이터베이스는 불완전할 수 있습니다. 긴급 상황에서는 항상 구조 서비스를 호출하세요.'], ['색상은 무엇을 의미하나요?', '사용 가능한 정보에 따라 공개, 제한, 불확실 접근을 나타냅니다.'], ['위치가 작동하지 않나요?', 'iOS 설정에서 DefibFrance 위치 권한을 확인하세요.']] },
        'zh-Hans': { data: '位置用于显示附近除颤器、无障碍信息和紧急路线。收藏和偏好保留在本地。', source: '数据根据地区来自data.gouv.fr和OpenStreetMap等开放数据库。', support: [['缺少除颤器？', '开放数据库可能不完整。紧急情况下请始终呼叫急救服务。'], ['颜色是什么意思？', '它们根据可用信息表示公共、受限或不确定的访问。'], ['定位无法使用？', '请在iOS设置中检查DefibFrance的位置权限。']] },
        uk: { data: 'Позиція показує найближчі дефібрилятори, доступність і екстрені маршрути. Обране й налаштування залишаються локально.', source: 'Дані надходять з відкритих баз, як data.gouv.fr і OpenStreetMap, залежно від зони.', support: [['Дефібрилятор відсутній?', 'Відкриті бази можуть бути неповними. В екстреній ситуації завжди викликайте служби порятунку.'], ['Що означають кольори?', 'Вони показують публічний, обмежений або невідомий доступ за наявною інформацією.'], ['Позиція не працює?', 'Перевірте дозвіл геолокації в налаштуваннях iOS для DefibFrance.']] },
        ru: { data: 'Местоположение показывает ближайшие дефибрилляторы, доступность и экстренные маршруты. Избранное и настройки остаются локально.', source: 'Данные поступают из открытых баз, таких как data.gouv.fr и OpenStreetMap, в зависимости от зоны.', support: [['Дефибриллятор отсутствует?', 'Открытые базы могут быть неполными. В экстренной ситуации всегда вызывайте службы спасения.'], ['Что означают цвета?', 'Они показывают публичный, ограниченный или неизвестный доступ по имеющейся информации.'], ['Местоположение не работает?', 'Проверьте разрешение геолокации в настройках iOS для DefibFrance.']] }
    });
    Object.assign(typeText.toilet, {
        uk: { data: 'Позиція використовується для показу найближчих громадських туалетів, обчислення відстаней, фільтрації доступності та відкриття маршруту. Обране й налаштування залишаються локально.', source: 'Дані надходять з data.gouv.fr, OpenStreetMap і локальних відкритих баз залежно від громад.', support: [['Туалетів бракує?', 'Відкриті бази не завжди повні. Громади публікують дані з різною частотою.'], ['Доступність невідома?', 'Деякі дані ще не містять інформації про доступність. Застосунок показує її, коли вона є.'], ['Позиція не працює?', 'Перевірте дозвіл геолокації в налаштуваннях iOS для ToiletteFrance.']] },
        ru: { data: 'Местоположение используется для показа ближайших общественных туалетов, расчета расстояний, фильтра доступности и открытия маршрута. Избранное и настройки остаются локально.', source: 'Данные поступают из data.gouv.fr, OpenStreetMap и локальных открытых баз в зависимости от муниципалитетов.', support: [['Туалеты отсутствуют?', 'Открытые базы не всегда полные. Муниципалитеты публикуют данные с разной частотой.'], ['Доступность неизвестна?', 'Некоторые данные еще не содержат информацию о доступности. Приложение показывает ее, когда она есть.'], ['Местоположение не работает?', 'Проверьте разрешение геолокации в настройках iOS для ToiletteFrance.']] }
    });

    function availableLanguages() {
        var base = document.body.getAttribute('data-app') === 'toilettefrance' ? toiletteSupported : supported;
        if (!isLegalPage()) return base;
        return document.body.getAttribute('data-app') === 'toilettefrance' ? legalToiletteSupported : legalSupported;
    }

    function isLegalPage() {
        var page = document.body.getAttribute('data-page') || 'home';
        return page === 'privacy' || page === 'support';
    }

    function normalizedLang(value) {
        if (!value) return 'en';
        if (value.toLowerCase().indexOf('zh') === 0) return 'zh-Hans';
        return value.slice(0, 2).toLowerCase();
    }

    function langFromPage() {
        var queryValue = new URLSearchParams(window.location.search).get('lang');
        var queryLang = queryValue ? normalizedLang(queryValue) : '';
        var browserLang = normalizedLang(navigator.language || 'en');
        var lang = queryLang || browserLang;
        if (lang === 'zh') lang = 'zh-Hans';
        var languages = availableLanguages();
        return languages.indexOf(lang) === -1 ? 'en' : lang;
    }

    function withLang(path, lang) {
        if (!path || path.indexOf('http') === 0 || path.indexOf('mailto:') === 0) return path;
        return path + (path.indexOf('?') === -1 ? '?' : '&') + 'lang=' + lang;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"]/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character];
        });
    }

    function paragraph(text) { return '<p>' + text + '</p>'; }
    function icon(app) { return './icons/' + app.icon; }
    function localized(map, lang) { return map && (map[lang] || map.fr || map.en || ''); }
    function supportLabels(lang) {
        return supportMailCopy[lang] || supportMailCopy.fr;
    }

    function supportMailBody(lang, appName) {
        return supportLabels(lang).body.map(function (line) {
            return line.replace('{app}', appName);
        }).join('\n');
    }

    function supportMailHref(lang, appName) {
        return 'mailto:' + mail + '?subject=' + encodeURIComponent('Support ' + appName) + '&body=' + encodeURIComponent(supportMailBody(lang, appName));
    }

    function supportMailCard(lang, appName, extraClass) {
        var copy = supportLabels(lang);
        var className = extraClass ? 'support-mail-card ' + extraClass : 'support-mail-card';
        return '<div class="' + className + '"><a href="' + escapeHTML(supportMailHref(lang, appName)) + '" class="store-link support-mail-primary">' + escapeHTML(copy.write) + '</a><p>' + escapeHTML(copy.fallback) + '</p><div class="support-mail-fallback"><code>' + escapeHTML(mail) + '</code><button type="button" class="support-copy-button" data-copy-value="' + escapeHTML(mail) + '" data-copy-default="' + escapeHTML(copy.copy) + '" data-copy-done="' + escapeHTML(copy.copied) + '">' + escapeHTML(copy.copy) + '</button></div></div>';
    }

    function header(lang, app, title, subtitle) {
        return '<header class="page-header site-page-header"><div class="page-header-inner"><a href="' + withLang('./index.html', lang) + '" class="page-icon-link" aria-label="' + ui[lang].home + '"><img src="' + icon(app) + '" alt="' + app.name + '" class="page-icon"></a><div><p class="premium-eyebrow">' + escapeHTML(app.name) + '</p><h1 class="page-title">' + escapeHTML(title) + '</h1></div></div><p class="page-subtitle">' + escapeHTML(subtitle) + '</p></header>';
    }

    function footer(lang, appName) {
        return '<footer class="page-footer"><p>&copy; 2026 ' + escapeHTML(appName) + ' — Rodolphe Vandaele</p></footer>';
    }

    function renderSections(sections) {
        return sections.map(function (section) {
            var body = section.html ? section.html : section.items ? '<ul class="summary-list">' + section.items.map(function (item) { return '<li><p>' + item + '</p></li>'; }).join('') + '</ul>' : section.paragraphs.map(paragraph).join('');
            return '<div class="page-section"><h2>' + escapeHTML(section.title) + '</h2>' + body + '</div>';
        }).join('');
    }

    function renderFAQ(items) {
        return items.map(function (item) { return '<div class="faq-item"><p class="faq-q">' + escapeHTML(item[0]) + '</p><p class="faq-a">' + escapeHTML(item[1]) + '</p></div>'; }).join('');
    }

    function renderSupport(lang, app) {
        var labels = ui[lang];
        var text = typeText[app.type][lang];
        var appKey = Object.keys(apps).filter(function (key) { return apps[key] === app; })[0];
        var features = appFeatures[appKey] ? appFeatures[appKey][lang] : [app.description[lang]];
        var sections = [
            { title: labels.quickSupport, items: [app.description[lang], text.source, app.name + ' iOS 18+', labels.email + ' : ' + mail] },
            { title: commonCopy[lang].featuresTitle, items: features },
            { title: labels.faqTitle, html: renderFAQ(text.support) },
            { title: labels.contactTitle, html: supportMailCard(lang, app.name, '') },
            { title: labels.deleteTitle, paragraphs: [commonCopy[lang].deletion] }
        ];
        return header(lang, app, labels.support, app.description[lang]) + '<main class="premium-page"><section class="page-card premium-hero-clean"><p class="premium-eyebrow">' + labels.support + '</p><h2 class="premium-heading">' + escapeHTML(app.name) + '</h2><p class="premium-lead">' + escapeHTML(app.description[lang]) + '</p></section><section class="page-card">' + renderSections(sections) + '</section></main>' + footer(lang, app.name);
    }

    function adText(lang, app) {
        var storeKit = {
            fr: 'Les achats intégrés sont gérés par StoreKit et votre compte Apple. Aucune donnée bancaire n’est reçue par l’application.',
            en: 'In-app purchases are handled by StoreKit and your Apple account. The app never receives payment card data.',
            es: 'Las compras integradas las gestionan StoreKit y tu cuenta Apple. La app no recibe datos bancarios.',
            it: 'Gli acquisti in-app sono gestiti da StoreKit e dal tuo account Apple. L’app non riceve dati bancari.',
            de: 'In-App-Käufe werden von StoreKit und deinem Apple-Konto verwaltet. Die App erhält keine Zahlungsdaten.',
            ja: 'アプリ内購入はStoreKitとAppleアカウントで管理されます。アプリが支払いカード情報を受け取ることはありません。',
            ko: '앱 내 구입은 StoreKit과 Apple 계정으로 처리됩니다. 앱은 결제 카드 정보를 받지 않습니다.',
            uk: 'Покупки в застосунку обробляються StoreKit і вашим Apple-акаунтом. Застосунок не отримує дані платіжної картки.',
            ru: 'Встроенные покупки обрабатываются StoreKit и вашим Apple ID. Приложение не получает данные платежной карты.',
            'zh-Hans': '应用内购买由 StoreKit 和你的 Apple 账户处理。应用不会接收支付卡数据。',
            ar: 'تُدار عمليات الشراء داخل التطبيق عبر StoreKit وحساب Apple الخاص بك. لا يتلقى التطبيق أي بيانات بطاقات دفع.'
        };
        var ads = {
            fr: 'La version gratuite peut afficher des publicités via Google AdMob selon votre consentement App Tracking Transparency.',
            en: 'The free version may display ads through Google AdMob depending on your App Tracking Transparency consent.',
            es: 'La versión gratuita puede mostrar anuncios mediante Google AdMob según tu consentimiento de App Tracking Transparency.',
            it: 'La versione gratuita può mostrare annunci tramite Google AdMob secondo il consenso App Tracking Transparency.',
            de: 'Die kostenlose Version kann je nach App-Tracking-Transparency-Einwilligung Werbung über Google AdMob anzeigen.',
            ja: '無料版ではApp Tracking Transparencyの同意状況に応じてGoogle AdMobの広告が表示される場合があります。',
            'zh-Hans': '免费版本可能会根据你的App Tracking Transparency同意状态通过Google AdMob显示广告。',
            ko: '무료 버전은 App Tracking Transparency 동의 상태에 따라 Google AdMob 광고를 표시할 수 있습니다.',
            uk: 'Безкоштовна версія може показувати рекламу через Google AdMob залежно від вашої згоди App Tracking Transparency.',
            ru: 'Бесплатная версия может показывать рекламу через Google AdMob в зависимости от вашего согласия App Tracking Transparency.',
            ar: 'قد يعرض الإصدار المجاني إعلانات عبر Google AdMob بحسب موافقتك على App Tracking Transparency.'
        };
        // Aucune des quatre apps iOS ne propose plus d'achat ni de don
        // intégré : la publicité est la seule ressource, et une vidéo
        // récompensée offre six heures sans publicité.
        var donations = {
            fr: app.name + ' ne propose aucun achat intégré ni don dans l’application. Une vidéo récompensée offre 6 h sans publicité. Aucune donnée bancaire n’est reçue par l’application.',
            en: app.name + ' offers no in-app purchase or donation. A rewarded video gives 6 hours ad-free. The app never receives payment card data.',
            es: app.name + ' no ofrece compras integradas ni donaciones. Un vídeo recompensado da 6 h sin anuncios. La app no recibe datos bancarios.',
            it: app.name + ' non propone acquisti in-app né donazioni. Un video premiato offre 6 h senza annunci. L’app non riceve dati bancari.',
            de: app.name + ' bietet keine In-App-Käufe und keine Spenden. Ein belohntes Video schenkt 6 h ohne Werbung. Die App erhält keine Zahlungsdaten.',
            ja: app.name + ' はアプリ内課金も寄付も提供していません。リワード動画で6時間広告なしになります。アプリが決済情報を受け取ることはありません。',
            'zh-Hans': app.name + ' 不提供任何内购或捐赠。观看激励视频可获得 6 小时无广告。应用不会接收任何支付信息。',
            ko: app.name + '은(는) 앱 내 구매나 후원을 제공하지 않습니다. 보상형 동영상으로 6시간 광고 없이 이용할 수 있습니다. 앱은 결제 정보를 받지 않습니다.',
            ar: app.name + ' لا يقدّم أي شراء داخل التطبيق ولا تبرعات. مقطع بمكافأة يمنح 6 ساعات بلا إعلانات. لا يستقبل التطبيق أي بيانات بنكية.'
        };
        if (app.type === 'toilet') return ads[lang] + ' ' + (lang === 'fr' ? 'Aucun achat Premium n’est utilisé.' : lang === 'en' ? 'No Premium purchase is used.' : lang === 'es' ? 'No se usa compra Premium.' : lang === 'it' ? 'Non viene usato alcun acquisto Premium.' : lang === 'de' ? 'Es wird kein Premium-Kauf verwendet.' : lang === 'ja' ? 'Premium購入は使用していません。' : lang === 'zh-Hans' ? '未使用Premium购买。' : lang === 'ko' ? 'Premium 구매는 사용하지 않습니다.' : lang === 'uk' ? 'Покупка Premium не використовується.' : lang === 'ru' ? 'Покупка Premium не используется.' : 'لا تُستخدم أي عملية شراء Premium.');
        if (app.type === 'sos' || app.type === 'defib') return ads[lang] + ' ' + donations[lang];
        return ads[lang] + ' ' + storeKit[lang];
    }

    function renderPrivacy(lang, app) {
        var labels = ui[lang];
        var text = typeText[app.type][lang];
        var sections = [
            { title: '1. ' + labels.dataUsed, paragraphs: [text.data] },
            { title: '2. ' + labels.business, paragraphs: [adText(lang, app), commonCopy[lang].adDetails] },
            { title: '3. ' + labels.sources, paragraphs: [text.source] },
            { title: '4. ' + labels.retention, paragraphs: [commonCopy[lang].retention] },
            { title: '5. ' + labels.rightsTitle, paragraphs: [labels.rights] },
            { title: '6. ' + labels.contactTitle, paragraphs: ['<a href="mailto:' + mail + '">' + mail + '</a>'] }
        ];
        return header(lang, app, labels.privacy, app.name + ' — ' + labels.updated) + '<main class="premium-page"><section class="page-card premium-hero-clean"><p class="premium-eyebrow">' + labels.privacy + '</p><h2 class="premium-heading">' + escapeHTML(app.name) + '</h2><p class="premium-lead">' + escapeHTML(text.data) + '</p></section><section class="page-card">' + renderSections(sections) + '</section></main>' + footer(lang, app.name);
    }









    var appStoreBadgeCopy = {
        fr: { small: 'Télécharger dans', main: 'l’App Store' },
        en: { small: 'Download on the', main: 'App Store' },
        es: { small: 'Descargar en', main: 'App Store' },
        it: { small: 'Scarica su', main: 'App Store' },
        de: { small: 'Laden im', main: 'App Store' },
        ja: { small: 'App Storeから', main: 'ダウンロード' },
        ko: { small: 'App Store에서', main: '다운로드' },
        'zh-Hans': { small: '在 App Store', main: '下载' },
        uk: { small: 'Завантажити в', main: 'App Store' },
        ru: { small: 'Загрузить в', main: 'App Store' },
        ar: { small: 'تنزيل من', main: 'App Store' }
    };


























    function attachSupportInteractions() {
        document.querySelectorAll('[data-copy-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-copy-value') || mail;
                var done = button.getAttribute('data-copy-done') || 'Copié';
                var initial = button.getAttribute('data-copy-default') || button.textContent;
                function markDone() {
                    button.textContent = done;
                    window.setTimeout(function () { button.textContent = initial; }, 3500);
                }
                function copyWithSelection() {
                    var textarea = document.createElement('textarea');
                    textarea.value = value;
                    textarea.setAttribute('readonly', '');
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    var success = document.execCommand && document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return success;
                }
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    markDone();
                    navigator.clipboard.writeText(value).catch(function () {
                        copyWithSelection();
                    });
                    return;
                }
                copyWithSelection();
                markDone();
            });
        });
    }



    function render() {
        var root = document.getElementById('site-root');
        if (!root) return;
        /* Ce moteur ne sert plus que les pages légales des apps iPhone.
           La vitrine (accueil, à propos, contact, pages produit) est rendue par
           assets/site.js. Les gabarits « home / app / about / premium / web-* »
           ont été retirés le 3 août 2026 : aucune page ne les déclarait. */
        var page = document.body.getAttribute('data-page');
        var lang = langFromPage();
        var appKey = document.body.getAttribute('data-app');
        var app = apps[appKey];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        if (!isLegalPage() || !app) return;
        document.title = (page === 'privacy' ? ui[lang].privacy : ui[lang].support) + ' — ' + app.name;
        root.className = 'site-shell';
        root.innerHTML = page === 'privacy' ? renderPrivacy(lang, app) : renderSupport(lang, app);
        attachSupportInteractions();
    }

    render();
})();