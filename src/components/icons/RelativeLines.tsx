interface RelativeLinesProps {
  className?: string; 
}

const RelativeLines = ({className}: RelativeLinesProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path d="M7.33331 3.33331H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.33331 8H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.33331 12.6667H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.66669 2.66669H3.33335V6.00002" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.66669 6H4.00002" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.33333 13.3333H2.26666C2.26666 12.6667 4 12.05 4 11C4.00002 10.799 3.93947 10.6026 3.82623 10.4366C3.713 10.2705 3.55233 10.1424 3.36521 10.069C3.17808 9.99554 2.97317 9.98023 2.7772 10.025C2.58124 10.0698 2.40333 10.1726 2.26666 10.32" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default RelativeLines;