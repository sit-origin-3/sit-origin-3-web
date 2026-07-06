import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("th") ? "en" : "th";
    i18n.changeLanguage(nextLang);
  };

  const isThai = i18n.language.startsWith("th");

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex min-h-[44px] min-w-[88px] items-center justify-center gap-1 rounded-full border-2 border-white/60 bg-white/40 p-1 shadow-cartoon backdrop-blur-md transition-all active:scale-95"
      aria-label="Toggle Language"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center flex-grow rounded-full transition-all ${
          isThai
            ? "bg-zpd-500 text-white shadow-sm"
            : "bg-transparent text-zpd-800 hover:bg-white/50"
        }`}
      >
        <span className="text-caption font-bold">TH</span>
      </div>
      <div
        className={`flex h-8 w-8 items-center justify-center flex-grow rounded-full transition-all ${
          !isThai
            ? "bg-zpd-500 text-white shadow-sm"
            : "bg-transparent text-zpd-800 hover:bg-white/50"
        }`}
      >
        <span className="text-caption font-bold">EN</span>
      </div>
    </button>
  );
}
