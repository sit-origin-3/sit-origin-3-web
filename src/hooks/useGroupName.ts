import { useTranslation } from "react-i18next";

export const useGroupName = () => {
  const { i18n } = useTranslation();
  
  return (
    group?: { name?: string; nameAlt?: string } | string | null,
    altName?: string | null
  ) => {
    const isEn = i18n.language.startsWith("en");
    if (!group) return "";
    
    if (typeof group === "string") {
      return isEn && altName ? altName : group;
    }
    
    return isEn && group.nameAlt ? group.nameAlt : (group.name || "");
  };
};
