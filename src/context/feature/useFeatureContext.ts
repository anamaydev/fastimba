import {useContext} from "react";
import {FeatureContext} from "@/context/feature/FeatureContext";

export const useFeatureContext = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) throw new Error("useFeatureContext must be used within the context");
  return context;
}