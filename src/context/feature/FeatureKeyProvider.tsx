import type {ReactNode} from "react";
import {FeatureKeyContext} from "@/context/feature/FeatureKeyContext.ts";

interface FeatureKeyProviderProps {
  children: ReactNode;
  featureKey: string;
}

const FeatureKeyProvider = ({children, featureKey}: FeatureKeyProviderProps) => {
  return (
    <FeatureKeyContext.Provider value={{featureKey}}>
      {children}
    </FeatureKeyContext.Provider>
  )
};

export default FeatureKeyProvider;
