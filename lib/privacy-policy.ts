import type { Locale } from "@/i18n";

export type PrivacyPolicyLanguage = Locale;

export type PrivacyPolicySection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PrivacyPolicyContent = {
  language: PrivacyPolicyLanguage;
  languageLabel: string;
  title: string;
  subtitle: string;
  languageVersionsLabel: string;
  versionLabel: string;
  lastUpdatedLabel: string;
  version: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  contactLabel: string;
  contactValue: string;
  consentNote: string;
};

export const privacyPolicyLanguages: Array<{
  code: PrivacyPolicyLanguage;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const companyName = "BEA VITA TOURS";
const companyContact = "info@beavitatours.com";

export const privacyPolicies: Record<PrivacyPolicyLanguage, PrivacyPolicyContent> = {
  en: {
    language: "en",
    languageLabel: "English",
    title: "Privacy Policy",
    subtitle:
      "This notice explains how BEA VITA TOURS processes personal data when you browse the website, contact us, or use the cookie preferences provided on this site.",
    languageVersionsLabel: "Language versions",
    versionLabel: "Version",
    lastUpdatedLabel: "Last updated",
    version: "1.0",
    lastUpdated: "28 March 2026",
    sections: [
      {
        heading: "1. Controller",
        paragraphs: [
          `${companyName} acts as the data controller for the personal data processed through this website.`,
          `For privacy requests, contact us at ${companyContact}.`,
        ],
      },
      {
        heading: "2. Data we process",
        paragraphs: [
          "We process only the data that is necessary to operate the website and to respond to your requests.",
        ],
        bullets: [
          "Contact details and message content you submit through forms or by e-mail.",
          "Technical information such as IP address, browser type, device information, pages visited, and timestamps.",
          "Consent records that document your choice, timestamp, and selected categories.",
          "Privacy-friendly analytics data collected by Umami in our current configuration without cookies.",
        ],
      },
      {
        heading: "3. Purposes and legal bases",
        paragraphs: [
          "We use strictly necessary data to operate the website, secure the service, and provide language and booking functionality.",
          "We use Umami for aggregate usage statistics in a configuration that does not rely on cookies. We rely on our legitimate interests for this limited analytics processing, subject to applicable law.",
          "Meta Pixel and Google Tag Manager are only activated after explicit consent for the relevant categories. Where they run, they are used to measure advertising performance, understand campaign effectiveness, and manage tags that you have allowed.",
        ],
      },
      {
        heading: "4. Cookies and consent management",
        paragraphs: [
          "Necessary cookies and equivalent technologies remain active because they are required for the site to function.",
          "Analytics and marketing technologies stay disabled until you choose to enable them through the cookie banner or cookie settings.",
          "You may withdraw or modify your choices at any time from the cookie settings link in the footer. When you withdraw consent, we stop loading the relevant scripts and delete related first-party cookies where technically possible.",
        ],
      },
      {
        heading: "5. Third-party services and transfers",
        paragraphs: [
          "The website currently uses the following services:",
        ],
        bullets: [
          "Umami Analytics for privacy-friendly usage statistics.",
          "Meta Pixel for marketing and conversion measurement, only after marketing consent.",
          "Google Tag Manager as a container for consent-based tags, only after the relevant consent is granted.",
        ],
      },
      {
        heading: "6. Retention and your rights",
        paragraphs: [
          "Consent records are retained for as long as needed to demonstrate your choice or until the policy version changes and we request a fresh decision.",
          "You may request access, rectification, erasure, restriction, objection, portability, and withdrawal of consent, subject to legal limits.",
          "You also have the right to lodge a complaint with your competent data protection authority.",
        ],
      },
    ],
    contactLabel: "Contact",
    contactValue: companyContact,
    consentNote:
      "This policy reflects the current website configuration. If the tooling changes, the policy and consent choices should be reviewed and updated accordingly.",
  },
  it: {
    language: "it",
    languageLabel: "Italiano",
    title: "Informativa sulla privacy",
    subtitle:
      "La presente informativa spiega come BEA VITA TOURS tratta i dati personali quando navighi il sito, ci contatti o utilizzi le preferenze sui cookie presenti su questo sito.",
    languageVersionsLabel: "Versioni linguistiche",
    versionLabel: "Versione",
    lastUpdatedLabel: "Ultimo aggiornamento",
    version: "1.0",
    lastUpdated: "28 marzo 2026",
    sections: [
      {
        heading: "1. Titolare del trattamento",
        paragraphs: [
          `${companyName} è il titolare del trattamento dei dati personali trattati tramite questo sito web.`,
          `Per richieste privacy puoi scriverci a ${companyContact}.`,
        ],
      },
      {
        heading: "2. Dati trattati",
        paragraphs: [
          "Trattiamo solo i dati necessari per far funzionare il sito e rispondere alle tue richieste.",
        ],
        bullets: [
          "Dati di contatto e contenuto dei messaggi inviati tramite form o e-mail.",
          "Informazioni tecniche come indirizzo IP, tipo di browser, dispositivo, pagine visitate e timestamp.",
          "Registro del consenso che documenta la tua scelta, l'orario e le categorie selezionate.",
          "Dati analitici raccolti da Umami nella configurazione attuale senza cookie.",
        ],
      },
      {
        heading: "3. Finalità e basi giuridiche",
        paragraphs: [
          "Usiamo i dati strettamente necessari per far funzionare il sito, proteggerlo e offrire funzionalità di lingua e prenotazione.",
          "Usiamo Umami per statistiche aggregate di utilizzo in una configurazione che non si basa sui cookie. Per questo trattamento limitato facciamo affidamento sul legittimo interesse, nei limiti della normativa applicabile.",
          "Meta Pixel e Google Tag Manager vengono attivati solo dopo il consenso esplicito per le categorie pertinenti. Quando sono attivi, servono a misurare le performance pubblicitarie, comprendere l'efficacia delle campagne e gestire i tag che hai autorizzato.",
        ],
      },
      {
        heading: "4. Cookie e gestione del consenso",
        paragraphs: [
          "I cookie necessari e le tecnologie equivalenti restano attivi perché indispensabili al funzionamento del sito.",
          "Le tecnologie analitiche e di marketing restano disattivate finché non le abiliti tramite il banner cookie o le impostazioni cookie.",
          "Puoi revocare o modificare le tue scelte in qualsiasi momento tramite il link alle impostazioni cookie nel footer. Quando revochi il consenso, interrompiamo il caricamento degli script interessati ed eliminiamo i cookie di prima parte collegati, quando tecnicamente possibile.",
        ],
      },
      {
        heading: "5. Servizi terzi e trasferimenti",
        paragraphs: [
          "Il sito utilizza attualmente i seguenti servizi:",
        ],
        bullets: [
          "Umami Analytics per statistiche di utilizzo rispettose della privacy.",
          "Meta Pixel per marketing e misurazione delle conversioni, solo dopo il consenso marketing.",
          "Google Tag Manager come contenitore per tag basati sul consenso, solo dopo il consenso pertinente.",
        ],
      },
      {
        heading: "6. Conservazione e diritti",
        paragraphs: [
          "I registri di consenso vengono conservati per il tempo necessario a dimostrare la tua scelta o fino al cambio della versione dell'informativa, quando potrebbe essere richiesto un nuovo consenso.",
          "Puoi richiedere accesso, rettifica, cancellazione, limitazione, opposizione, portabilità e revoca del consenso, salvo limiti di legge.",
          "Hai inoltre il diritto di proporre reclamo all'autorità competente per la protezione dei dati personali.",
        ],
      },
    ],
    contactLabel: "Contatto",
    contactValue: companyContact,
    consentNote:
      "Questa informativa riflette la configurazione attuale del sito. Se gli strumenti cambiano, l'informativa e le scelte di consenso devono essere riviste e aggiornate di conseguenza.",
  },
  ja: {
    language: "ja",
    languageLabel: "日本語",
    title: "プライバシーポリシー",
    subtitle:
      "この通知は、BEA VITA TOURS が、サイトの閲覧、お問い合わせ、または本サイトで提供する Cookie 設定の利用に際して、個人データをどのように取り扱うかを説明するものです。",
    languageVersionsLabel: "言語版",
    versionLabel: "版",
    lastUpdatedLabel: "最終更新",
    version: "1.0",
    lastUpdated: "2026年3月28日",
    sections: [
      {
        heading: "1. 管理者",
        paragraphs: [
          `${companyName} は、本ウェブサイトを通じて処理される個人データの管理者です。`,
          `プライバシーに関するお問い合わせは ${companyContact} までご連絡ください。`,
        ],
      },
      {
        heading: "2. 処理するデータ",
        paragraphs: [
          "当社は、サイトの運営およびお問い合わせへの対応に必要なデータのみを処理します。",
        ],
        bullets: [
          "フォームまたはメールで送信された連絡先情報およびメッセージ内容。",
          "IP アドレス、ブラウザの種類、端末情報、閲覧ページ、タイムスタンプなどの技術情報。",
          "お客様の選択、タイムスタンプ、選択カテゴリを記録する同意記録。",
          "現在の設定では Cookie を使用しない形で Umami により収集されるプライバシー配慮型の分析データ。",
        ],
      },
      {
        heading: "3. 利用目的と法的根拠",
        paragraphs: [
          "当社は、サイトの運営、サービスの保護、言語表示および予約機能の提供に必要不可欠なデータのみを使用します。",
          "Umami は Cookie に依存しない設定で、集計済みの利用統計を取得するために使用しています。この限定的な分析処理については、適用法令の範囲で当社の正当な利益に基づきます。",
          "Meta Pixel と Google Tag Manager は、関連カテゴリについて明示的な同意がある場合にのみ有効化されます。有効な場合は、広告効果の測定、キャンペーン成果の把握、および許可されたタグの管理に使用されます。",
        ],
      },
      {
        heading: "4. Cookie と同意管理",
        paragraphs: [
          "必要不可欠な Cookie および同等技術は、サイトの機能に必要であるため有効なままです。",
          "分析およびマーケティング技術は、Cookie バナーまたは Cookie 設定で有効にするまで無効のままです。",
          "同意は、フッターの Cookie 設定リンクからいつでも撤回または変更できます。同意を撤回した場合、関連スクリプトの読み込みを停止し、技術的に可能な範囲で関連するファーストパーティ Cookie を削除します。",
        ],
      },
      {
        heading: "5. 第三者サービスと移転",
        paragraphs: [
          "現在、本サイトでは以下のサービスを利用しています。",
        ],
        bullets: [
          "Umami Analytics: プライバシーに配慮した利用統計。",
          "Meta Pixel: マーケティングおよびコンバージョン測定（マーケティング同意後のみ）。",
          "Google Tag Manager: 同意に基づくタグのコンテナ（該当する同意後のみ）。",
        ],
      },
      {
        heading: "6. 保存期間とお客様の権利",
        paragraphs: [
          "同意記録は、お客様の選択を証明するために必要な期間、またはポリシーの版が変更され再確認が必要になるまで保存されます。",
          "お客様は、法的制限の範囲内で、アクセス、訂正、消去、処理制限、異議申立て、データポータビリティ、および同意の撤回を求めることができます。",
          "また、管轄のデータ保護監督機関に苦情を申し立てる権利があります。",
        ],
      },
    ],
    contactLabel: "お問い合わせ",
    contactValue: companyContact,
    consentNote:
      "このポリシーは現在のサイト構成を反映しています。利用ツールが変更された場合は、ポリシーと同意設定を見直し、必要に応じて更新してください。",
  },
  zh: {
    language: "zh",
    languageLabel: "中文",
    title: "隐私政策",
    subtitle:
      "本说明解释了 BEA VITA TOURS 在您浏览网站、联系我们或使用本网站提供的 Cookie 设置时如何处理个人数据。",
    languageVersionsLabel: "语言版本",
    versionLabel: "版本",
    lastUpdatedLabel: "最后更新",
    version: "1.0",
    lastUpdated: "2026年3月28日",
    sections: [
      {
        heading: "1. 数据控制方",
        paragraphs: [
          `${companyName} 是通过本网站处理个人数据的数据控制方。`,
          `如需隐私相关咨询，请联系 ${companyContact}。`,
        ],
      },
      {
        heading: "2. 我们处理的数据",
        paragraphs: [
          "我们仅处理运行网站和回应您的请求所必需的数据。",
        ],
        bullets: [
          "您通过表单或电子邮件提交的联系方式和消息内容。",
          "IP 地址、浏览器类型、设备信息、访问页面和时间戳等技术信息。",
          "记录您的选择、时间戳和所选类别的同意记录。",
          "在当前配置下由 Umami 收集且不依赖 Cookie 的隐私友好型分析数据。",
        ],
      },
      {
        heading: "3. 处理目的和法律依据",
        paragraphs: [
          "我们仅使用网站运行、服务安全以及语言和预订功能所必需的数据。",
          "我们使用 Umami 获取汇总式访问统计，并采用不依赖 Cookie 的配置。对于此类有限分析处理，我们在适用法律允许的范围内依据我们的合法利益。",
          "Meta Pixel 和 Google Tag Manager 仅在相关类别获得明确同意后启用。启用后，它们用于衡量广告效果、了解营销活动表现以及管理您允许的标签。",
        ],
      },
      {
        heading: "4. Cookie 与同意管理",
        paragraphs: [
          "必要 Cookie 和等效技术会保持启用，因为它们是网站正常运行所必需的。",
          "分析和营销技术会保持关闭，直到您在 Cookie 横幅或 Cookie 设置中选择启用。",
          "您可随时通过页脚中的 Cookie 设置链接撤回或修改选择。撤回同意后，我们会停止加载相关脚本，并在技术可行的情况下删除相关的一方 Cookie。",
        ],
      },
      {
        heading: "5. 第三方服务与数据传输",
        paragraphs: [
          "本网站当前使用以下服务：",
        ],
        bullets: [
          "Umami Analytics：用于尊重隐私的访问统计。",
          "Meta Pixel：用于营销和转化衡量，仅在营销同意后启用。",
          "Google Tag Manager：用于基于同意的标签容器，仅在获得相应同意后启用。",
        ],
      },
      {
        heading: "6. 保存期限与您的权利",
        paragraphs: [
          "同意记录会保存至证明您的选择所需的期限，或直到政策版本变更并需要重新确认同意。",
          "在法律允许的范围内，您可以要求访问、更正、删除、限制处理、反对处理、数据可携性以及撤回同意。",
          "您也有权向主管数据保护机构提出投诉。",
        ],
      },
    ],
    contactLabel: "联系方式",
    contactValue: companyContact,
    consentNote:
      "本政策反映了当前的网站配置。如果所使用的工具发生变化，应相应审查并更新本政策和同意设置。",
  },
};

export function resolvePrivacyPolicyLanguage(
  locale: string | undefined
): PrivacyPolicyLanguage {
  if (
    locale === "en" ||
    locale === "it" ||
    locale === "ja" ||
    locale === "zh"
  ) {
    return locale;
  }

  return "en";
}
