import {ReactNode} from "react";
import {FeatureContext} from "@/context/feature/FeatureContext.ts";

interface FeatureProviderProps {
  children: ReactNode;
}

const FeatureProvider = ({children}:FeatureProviderProps) => {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  /* add or remove the expanded feature */
  const toggleExpandedFeatures = (key: string) => {
    setExpandedFeatures(prevExpandedFeatures => {
      const tempExpandedFeatures = new Set(prevExpandedFeatures);
      tempExpandedFeatures.has(key) ? tempExpandedFeatures.delete(key) : tempExpandedFeatures.add(key)
      return tempExpandedFeatures;
    })
  }

  const isExpanded = (key: string) => expandedFeatures.has(key);

  return (
    <FeatureContext.Provider value={{isExpanded, expandedFeatures, toggleExpandedFeatures}}>
      {children}
    </FeatureContext.Provider>
  )
};
export default FeatureProvider;
