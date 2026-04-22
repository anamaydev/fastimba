import {createContext} from 'react';

interface FeatureContextProps {
  expandedFeatures: Set<string>;
  toggleExpandedFeatures: (key:string) => void;
  isExpanded: (key: string) => boolean;
}

export const FeatureContext = createContext<FeatureContextProps | undefined>(undefined);
