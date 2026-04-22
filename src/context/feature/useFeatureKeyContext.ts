import {useContext} from "react";
import {FeatureKeyContext} from "@/context/feature/FeatureKeyContext.ts";

export const useFeatureKeyContext = () => {
  const context = useContext(FeatureKeyContext);
  if (context === undefined) throw new Error("useFeatureKeyContext must be used within useFeatureKeyContext");
  return context;
}
