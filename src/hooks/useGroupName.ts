import { useTranslation } from "react-i18next";

export interface GroupDisplayInfo {
  id: string;
  name: string;
  nameAlt: string;
  displayName: string;
  formatted: string;
}

export const useGroupName = () => {
  const { i18n } = useTranslation();
  
  return (
    group?: { id?: string; name?: string; nameAlt?: string } | string | null,
    altName?: string | null
  ): GroupDisplayInfo | null => {
    const isEn = i18n.language.startsWith("en");
    if (!group) return null;
    
    let id = "";
    let name = "";
    let nameAlt = altName || "";

    if (typeof group === "string") {
      name = group;
    } else {
      id = group.id || "";
      name = group.name || "";
      nameAlt = group.nameAlt || altName || "";
    }
    
    const displayName = isEn && nameAlt ? nameAlt : name;
    
    let formatted = displayName;
    if (id && id !== "-" && displayName) {
      formatted = `${id}: ${displayName}`;
    } else if (id && id !== "-") {
      formatted = id;
    }

    return {
      id,
      name,
      nameAlt,
      displayName,
      formatted
    };
  };
};
