import {ReactNode} from "react";

interface FeatureCardProps {children: ReactNode, className?: string}
interface FeatureCardVisualProps {children: ReactNode, className?: string}
interface FeatureCardBadgeProps {children: ReactNode, className?: string}
interface FeatureCardContextProps {children: ReactNode, className?: string}
interface FeatureCardContextTitleProps {children: string}
interface FeatureCardContextDescriptionProps {children: ReactNode}
interface FeatureCardContextToggleProps {children: string}

const FeatureCard = ({children, className}: FeatureCardProps) => {
  return (
    <div
      className={`w-full h-39 min-h-39 max-h-39 p-1 flex justify-center shrink-0 rounded-card glass-card ${className ?? ""}`}
    >
      {children}
    </div>
  )
};
export default FeatureCard;

const FeatureCardVisual = ({children, className}: FeatureCardVisualProps) => (
  <div
    className={`h-full min-w-14 max-w-37 p-5 flex flex-col justify-between items-center shrink-0 font-medium rounded-panel text-light glass-overlay ${className}`}>
    {children}
  </div>
);

const FeatureCardContext = ({children, className}: FeatureCardContextProps) => (
  <div
    className={`h-full flex pl-6 py-5 pr-5 flex-col justify-between shrink-0 text-center rounded-panel text-secondary ${className}`}
  >
    {children}
  </div>
);

const FeatureCardContextTitle = ({children}: FeatureCardContextTitleProps) => (
  <p className="font-bold text-bright"><strong>{children}</strong></p>
);

const FeatureCardContextDescription = ({children}: FeatureCardContextDescriptionProps) => (
  <>{children}</>
);

const FeatureCardContextToggle = ({children}: FeatureCardContextToggleProps) => (
  <>{children}</>
);

const FeatureCardBadge = ({children, className}: FeatureCardBadgeProps) => (
  <div
    className={`glass-overlay-light w-full flex h-6 items-center justify-center p-0.5 rounded-toggle-track ${className ?? ""}`}
  >
      <span className="text-2xs font-bold whitespace-nowrap leading-none text-bright">
          {children}
      </span>
  </div>
);

FeatureCard.Visual = FeatureCardVisual;
FeatureCard.Context = FeatureCardContext;
FeatureCard.Badge = FeatureCardBadge;

FeatureCardContext.Title = FeatureCardContextTitle;
FeatureCardContext.Description = FeatureCardContextDescription;
FeatureCardContext.Toggle = FeatureCardContextToggle;
