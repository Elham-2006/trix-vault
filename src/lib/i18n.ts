import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: { translation: {
    brand: { name: "Trix", ticker: "TX" },
    nav: { dashboard: "Dashboard", deposit: "Deposit", withdraw: "Withdraw", vip: "VIP Plans", referrals: "Referrals", transactions: "Transactions", profile: "Profile", notifications: "Notifications", admin: "Admin", logout: "Logout", login: "Login", register: "Register" },
    landing: {
      tagline: "The next-gen crypto wealth platform",
      title: "Grow your crypto with Trix",
      subtitle: "VIP plans, daily profit, instant USDT TRC20 deposits and a transparent 2% fee on every transaction.",
      cta_primary: "Get started",
      cta_secondary: "View VIP plans",
      stat_users: "Active users",
      stat_volume: "Total volume",
      stat_paid: "Paid to members",
      feature_1_title: "Daily profit",
      feature_1_desc: "Earn passive yield from VIP plans, credited every 24h.",
      feature_2_title: "2% transparent fee",
      feature_2_desc: "Every transfer carries a flat 2% network fee, fully auditable.",
      feature_3_title: "Referral rewards",
      feature_3_desc: "Earn from a 3-tier affiliate network the moment friends join.",
      feature_4_title: "Bank-grade security",
      feature_4_desc: "JWT auth, rate limiting, input validation and admin review.",
    },
    auth: {
      welcome_back: "Welcome back",
      create_account: "Create your account",
      email: "Email", password: "Password", name: "Full name", referral: "Referral code (optional)",
      no_account: "Don't have an account?", have_account: "Already have an account?",
      sign_in: "Sign in", sign_up: "Sign up",
    },
    dashboard: {
      hello: "Welcome back",
      wallet_balance: "Wallet balance", todays_profit: "Today's profit", total_earned: "Total earned", active_plan: "Active plan", none: "None",
      quick_deposit: "Deposit", quick_withdraw: "Withdraw", recent_tx: "Recent transactions", view_all: "View all", empty: "Nothing here yet.",
    },
    deposit: {
      title: "Deposit USDT (TRC20)",
      desc: "Send USDT on the TRON network to the wallet below, then submit your transaction hash for approval.",
      wallet_label: "Platform wallet",
      copy: "Copy", copied: "Copied!",
      amount: "Amount (USDT)", txid: "Transaction hash (TXID)", submit: "Submit deposit",
      note: "Deposits are reviewed by an admin and credited after 1 confirmation. Minimum 10 USDT.",
    },
    withdraw: {
      title: "Withdraw USDT (TRC20)", to_wallet: "Destination wallet", amount: "Amount (USDT)",
      fee: "Network fee (2%)", net: "You receive", submit: "Request withdrawal",
      min: "Minimum withdrawal: 10 USDT.",
    },
    vip: {
      title: "VIP Membership Plans",
      subtitle: "Pick a tier. Earn daily profit. Withdraw any time.",
      daily: "Daily profit", duration: "Duration", min: "Minimum", choose: "Activate",
      days: "days",
    },
    referrals: {
      title: "Referrals & Affiliates",
      your_link: "Your invite link", invites: "Invites", earnings: "Affiliate earnings",
      tier: "Tier", commission: "Commission",
    },
    transactions: {
      title: "Transaction history", id: "ID", type: "Type", from: "From", to: "To",
      amount: "Amount", fee: "Fee", status: "Status", date: "Date",
      pending: "Pending", approved: "Approved", rejected: "Rejected", completed: "Completed",
    },
    profile: { title: "Profile", language: "Language", save: "Save changes" },
    notifications: { title: "Notifications", empty: "No notifications yet." },
    admin: {
      title: "Admin panel",
      users: "Users", deposits: "Deposits", withdrawals: "Withdrawals", plans: "VIP plans", stats: "Statistics", wallets: "Wallets",
      total_users: "Total users", total_volume: "Total volume", total_fees: "Platform earnings (2%)", pending_count: "Pending actions",
      approve: "Approve", reject: "Reject", block: "Block", unblock: "Unblock",
    },
    common: { loading: "Loading…", confirm: "Confirm", cancel: "Cancel", back: "Back" },
  }},
  fa: { translation: {
    brand: { name: "تریکس", ticker: "TX" },
    nav: { dashboard: "داشبورد", deposit: "واریز", withdraw: "برداشت", vip: "پلن‌های VIP", referrals: "زیرمجموعه‌گیری", transactions: "تراکنش‌ها", profile: "پروفایل", notifications: "اعلان‌ها", admin: "مدیریت", logout: "خروج", login: "ورود", register: "ثبت‌نام" },
    landing: {
      tagline: "پلتفرم نسل جدید ثروت کریپتو",
      title: "ارز دیجیتال خود را با تریکس رشد دهید",
      subtitle: "پلن‌های VIP، سود روزانه، واریز فوری USDT TRC20 و کارمزد شفاف ۲٪ روی هر تراکنش.",
      cta_primary: "شروع کنید", cta_secondary: "مشاهده پلن‌ها",
      stat_users: "کاربران فعال", stat_volume: "حجم کل", stat_paid: "پرداختی به اعضا",
      feature_1_title: "سود روزانه", feature_1_desc: "از پلن‌های VIP هر ۲۴ ساعت سود غیرفعال کسب کنید.",
      feature_2_title: "کارمزد شفاف ۲٪", feature_2_desc: "هر انتقال شامل کارمزد ۲٪ کاملاً قابل ممیزی است.",
      feature_3_title: "پاداش معرفی", feature_3_desc: "از شبکه ۳ سطحی همکاری درآمد کسب کنید.",
      feature_4_title: "امنیت بانکی", feature_4_desc: "JWT، محدودیت نرخ، اعتبارسنجی ورودی و بازبینی ادمین.",
    },
    auth: { welcome_back: "خوش آمدید", create_account: "حساب کاربری بسازید", email: "ایمیل", password: "رمز عبور", name: "نام کامل", referral: "کد معرف (اختیاری)", no_account: "حساب ندارید؟", have_account: "قبلاً ثبت‌نام کرده‌اید؟", sign_in: "ورود", sign_up: "ثبت‌نام" },
    dashboard: { hello: "خوش برگشتید", wallet_balance: "موجودی کیف پول", todays_profit: "سود امروز", total_earned: "کل درآمد", active_plan: "پلن فعال", none: "هیچ", quick_deposit: "واریز", quick_withdraw: "برداشت", recent_tx: "تراکنش‌های اخیر", view_all: "مشاهده همه", empty: "چیزی اینجا نیست." },
    deposit: { title: "واریز USDT (TRC20)", desc: "USDT را در شبکه TRON به آدرس زیر ارسال کنید و سپس هش تراکنش را برای تایید ثبت کنید.", wallet_label: "کیف پول پلتفرم", copy: "کپی", copied: "کپی شد!", amount: "مقدار (USDT)", txid: "هش تراکنش (TXID)", submit: "ثبت واریز", note: "واریزها توسط ادمین بررسی و پس از ۱ تاییدیه واریز می‌شود. حداقل ۱۰ USDT." },
    withdraw: { title: "برداشت USDT (TRC20)", to_wallet: "آدرس مقصد", amount: "مقدار (USDT)", fee: "کارمزد شبکه (۲٪)", net: "دریافتی شما", submit: "درخواست برداشت", min: "حداقل برداشت: ۱۰ USDT." },
    vip: { title: "پلن‌های عضویت VIP", subtitle: "یک سطح انتخاب کنید. سود روزانه بگیرید. هر زمان برداشت کنید.", daily: "سود روزانه", duration: "مدت", min: "حداقل", choose: "فعال‌سازی", days: "روز" },
    referrals: { title: "معرفی و همکاری", your_link: "لینک دعوت شما", invites: "دعوت‌ها", earnings: "درآمد همکاری", tier: "سطح", commission: "کمیسیون" },
    transactions: { title: "تاریخچه تراکنش‌ها", id: "شناسه", type: "نوع", from: "از", to: "به", amount: "مقدار", fee: "کارمزد", status: "وضعیت", date: "تاریخ", pending: "در انتظار", approved: "تایید شده", rejected: "رد شده", completed: "تکمیل شده" },
    profile: { title: "پروفایل", language: "زبان", save: "ذخیره تغییرات" },
    notifications: { title: "اعلان‌ها", empty: "هنوز اعلانی نیست." },
    admin: { title: "پنل مدیریت", users: "کاربران", deposits: "واریزها", withdrawals: "برداشت‌ها", plans: "پلن‌های VIP", stats: "آمار", wallets: "کیف پول‌ها", total_users: "کل کاربران", total_volume: "حجم کل", total_fees: "درآمد پلتفرم (۲٪)", pending_count: "اقدامات در انتظار", approve: "تایید", reject: "رد", block: "مسدود", unblock: "رفع مسدودی" },
    common: { loading: "در حال بارگذاری…", confirm: "تایید", cancel: "لغو", back: "بازگشت" },
  }},
  ru: { translation: {
    brand: { name: "Trix", ticker: "TX" },
    nav: { dashboard: "Панель", deposit: "Депозит", withdraw: "Вывод", vip: "VIP-планы", referrals: "Рефералы", transactions: "Транзакции", profile: "Профиль", notifications: "Уведомления", admin: "Админ", logout: "Выход", login: "Войти", register: "Регистрация" },
    landing: { tagline: "Криптоплатформа нового поколения", title: "Развивайте крипту с Trix", subtitle: "VIP-планы, ежедневная прибыль, мгновенные депозиты USDT TRC20 и прозрачная комиссия 2%.", cta_primary: "Начать", cta_secondary: "VIP-планы", stat_users: "Активные пользователи", stat_volume: "Общий объём", stat_paid: "Выплачено", feature_1_title: "Ежедневная прибыль", feature_1_desc: "Пассивный доход от VIP-планов каждые 24 часа.", feature_2_title: "Прозрачная комиссия 2%", feature_2_desc: "Каждый перевод — фиксированные 2%, всё проверяемо.", feature_3_title: "Реферальные награды", feature_3_desc: "Доход от 3-уровневой партнёрской сети.", feature_4_title: "Безопасность", feature_4_desc: "JWT, лимиты, валидация и модерация." },
    auth: { welcome_back: "С возвращением", create_account: "Создайте аккаунт", email: "Email", password: "Пароль", name: "Полное имя", referral: "Код приглашения", no_account: "Нет аккаунта?", have_account: "Уже есть аккаунт?", sign_in: "Войти", sign_up: "Регистрация" },
    dashboard: { hello: "С возвращением", wallet_balance: "Баланс кошелька", todays_profit: "Прибыль за сегодня", total_earned: "Всего заработано", active_plan: "Активный план", none: "Нет", quick_deposit: "Депозит", quick_withdraw: "Вывод", recent_tx: "Последние транзакции", view_all: "Все", empty: "Пока пусто." },
    deposit: { title: "Депозит USDT (TRC20)", desc: "Отправьте USDT в сети TRON на адрес ниже и укажите хеш транзакции.", wallet_label: "Кошелёк платформы", copy: "Копировать", copied: "Скопировано!", amount: "Сумма (USDT)", txid: "Хеш транзакции (TXID)", submit: "Отправить", note: "Депозиты проверяются админом. Минимум 10 USDT." },
    withdraw: { title: "Вывод USDT (TRC20)", to_wallet: "Адрес получателя", amount: "Сумма (USDT)", fee: "Комиссия (2%)", net: "Вы получите", submit: "Запросить вывод", min: "Минимум: 10 USDT." },
    vip: { title: "VIP-планы", subtitle: "Выберите уровень. Получайте ежедневную прибыль.", daily: "Ежедневно", duration: "Срок", min: "Минимум", choose: "Активировать", days: "дней" },
    referrals: { title: "Рефералы", your_link: "Ваша ссылка", invites: "Приглашения", earnings: "Заработок", tier: "Уровень", commission: "Комиссия" },
    transactions: { title: "История транзакций", id: "ID", type: "Тип", from: "От", to: "Кому", amount: "Сумма", fee: "Комиссия", status: "Статус", date: "Дата", pending: "Ожидание", approved: "Одобрено", rejected: "Отклонено", completed: "Завершено" },
    profile: { title: "Профиль", language: "Язык", save: "Сохранить" },
    notifications: { title: "Уведомления", empty: "Уведомлений нет." },
    admin: { title: "Админ-панель", users: "Пользователи", deposits: "Депозиты", withdrawals: "Выводы", plans: "VIP-планы", stats: "Статистика", wallets: "Кошельки", total_users: "Всего пользователей", total_volume: "Объём", total_fees: "Доход платформы (2%)", pending_count: "Ожидают", approve: "Одобрить", reject: "Отклонить", block: "Блок", unblock: "Разблок" },
    common: { loading: "Загрузка…", confirm: "Подтвердить", cancel: "Отмена", back: "Назад" },
  }},
  de: { translation: {
    brand: { name: "Trix", ticker: "TX" },
    nav: { dashboard: "Dashboard", deposit: "Einzahlung", withdraw: "Auszahlung", vip: "VIP-Pläne", referrals: "Empfehlungen", transactions: "Transaktionen", profile: "Profil", notifications: "Benachrichtigungen", admin: "Admin", logout: "Abmelden", login: "Anmelden", register: "Registrieren" },
    landing: { tagline: "Die Krypto-Plattform der nächsten Generation", title: "Wachse mit Trix", subtitle: "VIP-Pläne, tägliche Gewinne, USDT TRC20 Einzahlungen und transparente 2% Gebühr.", cta_primary: "Loslegen", cta_secondary: "VIP-Pläne", stat_users: "Aktive Nutzer", stat_volume: "Gesamtvolumen", stat_paid: "Ausgezahlt", feature_1_title: "Täglicher Gewinn", feature_1_desc: "Passives Einkommen aus VIP-Plänen alle 24h.", feature_2_title: "Transparente 2%", feature_2_desc: "Jede Transaktion mit fester 2% Gebühr.", feature_3_title: "Empfehlungsprämien", feature_3_desc: "3-stufiges Partnernetzwerk.", feature_4_title: "Sicherheit", feature_4_desc: "JWT, Rate-Limiting, Validierung." },
    auth: { welcome_back: "Willkommen zurück", create_account: "Konto erstellen", email: "E-Mail", password: "Passwort", name: "Voller Name", referral: "Empfehlungscode", no_account: "Noch kein Konto?", have_account: "Bereits ein Konto?", sign_in: "Anmelden", sign_up: "Registrieren" },
    dashboard: { hello: "Willkommen zurück", wallet_balance: "Wallet-Guthaben", todays_profit: "Heutiger Gewinn", total_earned: "Gesamt verdient", active_plan: "Aktiver Plan", none: "Keiner", quick_deposit: "Einzahlen", quick_withdraw: "Auszahlen", recent_tx: "Letzte Transaktionen", view_all: "Alle ansehen", empty: "Noch nichts hier." },
    deposit: { title: "USDT (TRC20) Einzahlung", desc: "Sende USDT im TRON-Netzwerk an die Wallet unten und reiche den Transaktions-Hash ein.", wallet_label: "Plattform-Wallet", copy: "Kopieren", copied: "Kopiert!", amount: "Betrag (USDT)", txid: "Transaktions-Hash (TXID)", submit: "Einzahlung senden", note: "Einzahlungen werden vom Admin geprüft. Mindestens 10 USDT." },
    withdraw: { title: "USDT (TRC20) Auszahlung", to_wallet: "Ziel-Wallet", amount: "Betrag (USDT)", fee: "Gebühr (2%)", net: "Du erhältst", submit: "Auszahlung anfordern", min: "Minimum: 10 USDT." },
    vip: { title: "VIP-Mitgliedschaftspläne", subtitle: "Wähle eine Stufe. Tägliche Gewinne.", daily: "Täglicher Gewinn", duration: "Dauer", min: "Minimum", choose: "Aktivieren", days: "Tage" },
    referrals: { title: "Empfehlungen", your_link: "Dein Einladungslink", invites: "Einladungen", earnings: "Verdienst", tier: "Stufe", commission: "Provision" },
    transactions: { title: "Transaktionsverlauf", id: "ID", type: "Typ", from: "Von", to: "An", amount: "Betrag", fee: "Gebühr", status: "Status", date: "Datum", pending: "Ausstehend", approved: "Genehmigt", rejected: "Abgelehnt", completed: "Abgeschlossen" },
    profile: { title: "Profil", language: "Sprache", save: "Speichern" },
    notifications: { title: "Benachrichtigungen", empty: "Keine Benachrichtigungen." },
    admin: { title: "Admin-Panel", users: "Nutzer", deposits: "Einzahlungen", withdrawals: "Auszahlungen", plans: "VIP-Pläne", stats: "Statistik", wallets: "Wallets", total_users: "Nutzer gesamt", total_volume: "Volumen", total_fees: "Plattformerlös (2%)", pending_count: "Ausstehend", approve: "Genehmigen", reject: "Ablehnen", block: "Sperren", unblock: "Entsperren" },
    common: { loading: "Lädt…", confirm: "Bestätigen", cancel: "Abbrechen", back: "Zurück" },
  }},
  es: { translation: {
    brand: { name: "Trix", ticker: "TX" },
    nav: { dashboard: "Panel", deposit: "Depósito", withdraw: "Retiro", vip: "Planes VIP", referrals: "Referidos", transactions: "Transacciones", profile: "Perfil", notifications: "Notificaciones", admin: "Admin", logout: "Salir", login: "Entrar", register: "Registrarse" },
    landing: { tagline: "La plataforma cripto de nueva generación", title: "Haz crecer tu cripto con Trix", subtitle: "Planes VIP, beneficio diario, depósitos USDT TRC20 y comisión transparente del 2%.", cta_primary: "Empezar", cta_secondary: "Ver planes", stat_users: "Usuarios activos", stat_volume: "Volumen total", stat_paid: "Pagado", feature_1_title: "Beneficio diario", feature_1_desc: "Ingreso pasivo desde planes VIP cada 24h.", feature_2_title: "2% transparente", feature_2_desc: "Cada transferencia con comisión fija del 2%.", feature_3_title: "Recompensas de referidos", feature_3_desc: "Red de afiliados de 3 niveles.", feature_4_title: "Seguridad", feature_4_desc: "JWT, rate limiting, validación." },
    auth: { welcome_back: "Bienvenido", create_account: "Crea tu cuenta", email: "Email", password: "Contraseña", name: "Nombre completo", referral: "Código de referido", no_account: "¿Sin cuenta?", have_account: "¿Ya tienes cuenta?", sign_in: "Entrar", sign_up: "Registrarse" },
    dashboard: { hello: "Bienvenido", wallet_balance: "Saldo del wallet", todays_profit: "Beneficio de hoy", total_earned: "Total ganado", active_plan: "Plan activo", none: "Ninguno", quick_deposit: "Depositar", quick_withdraw: "Retirar", recent_tx: "Transacciones recientes", view_all: "Ver todo", empty: "Nada aún." },
    deposit: { title: "Depósito USDT (TRC20)", desc: "Envía USDT en la red TRON a la wallet de abajo y envía el hash de la transacción.", wallet_label: "Wallet de la plataforma", copy: "Copiar", copied: "¡Copiado!", amount: "Cantidad (USDT)", txid: "Hash de transacción (TXID)", submit: "Enviar depósito", note: "Los depósitos los revisa un admin. Mínimo 10 USDT." },
    withdraw: { title: "Retiro USDT (TRC20)", to_wallet: "Wallet destino", amount: "Cantidad (USDT)", fee: "Comisión (2%)", net: "Recibirás", submit: "Solicitar retiro", min: "Mínimo: 10 USDT." },
    vip: { title: "Planes VIP", subtitle: "Elige un nivel. Gana beneficio diario.", daily: "Beneficio diario", duration: "Duración", min: "Mínimo", choose: "Activar", days: "días" },
    referrals: { title: "Referidos y afiliados", your_link: "Tu enlace de invitación", invites: "Invitaciones", earnings: "Ganancias", tier: "Nivel", commission: "Comisión" },
    transactions: { title: "Historial de transacciones", id: "ID", type: "Tipo", from: "De", to: "Para", amount: "Cantidad", fee: "Comisión", status: "Estado", date: "Fecha", pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado", completed: "Completado" },
    profile: { title: "Perfil", language: "Idioma", save: "Guardar" },
    notifications: { title: "Notificaciones", empty: "Sin notificaciones." },
    admin: { title: "Panel de administración", users: "Usuarios", deposits: "Depósitos", withdrawals: "Retiros", plans: "Planes VIP", stats: "Estadísticas", wallets: "Wallets", total_users: "Usuarios totales", total_volume: "Volumen", total_fees: "Ingresos plataforma (2%)", pending_count: "Pendientes", approve: "Aprobar", reject: "Rechazar", block: "Bloquear", unblock: "Desbloquear" },
    common: { loading: "Cargando…", confirm: "Confirmar", cancel: "Cancelar", back: "Atrás" },
  }},
};

if (typeof window !== "undefined" && !i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "fa", "ru", "de", "es"],
      interpolation: { escapeValue: false },
      detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
    });

  const applyDir = (lng: string) => {
    document.documentElement.dir = lng === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };
  applyDir(i18n.language);
  i18n.on("languageChanged", applyDir);
}

export default i18n;
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];
