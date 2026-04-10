import {useContext} from "react";
import {PreferencesContext} from "@/context/preferences/PreferencesContext.ts";

export const usePreferencesContext = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) throw new Error("usePreferencesContext must be used within the context");
  return context;
}