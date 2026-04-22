import { createContext } from "react";

interface FeatureKeyContextType {
  featureKey: string;
}

export const FeatureKeyContext = createContext<FeatureKeyContextType | undefined>(undefined);
