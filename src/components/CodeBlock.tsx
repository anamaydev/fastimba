import {ReactNode} from "react";

interface CodeBlockProps {children: ReactNode, className?: string}
interface CodeBlockGutterProps {lines: number[], activeLine?: number, className?: string}
interface CodeBlockCodeProps {children: ReactNode, className?: string}
interface TokenProps {children: ReactNode}

const CodeBlock = ({children, className}: CodeBlockProps) => {
  return (
    <div className={`w-full h-full pl-2 flex gap-1 text-3xs ${className ?? ""}`}>
      {children}
    </div>
  )
};
export default CodeBlock;

CodeBlock.Gutter = function CodeBlockGutter({lines, activeLine, className}: CodeBlockGutterProps) {
  return (
    <div
      className={`flex flex-col gap-1 text-center whitespace-nowrap shrink-0 ${className ?? ""}`}
    >
      {lines.map((lineNimber, index) => (
        <span
          key={index}
          className={index + 1 === activeLine ? "text-primary" : "text-light"}
        >
          {lineNimber}
        </span>
      ))}
    </div>
  )
}

CodeBlock.Code = function CodeBlockCode({ children, className }: CodeBlockCodeProps) {
  return (
    <div
      className={`flex flex-col gap-1 justify-start items-start font-normal ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

CodeBlock.Keyword = function CodeBlockKeyword({ children }: TokenProps) {
  return <span className="text-syntax-keyword">{children}</span>;
}

CodeBlock.Variable = function CodeBlockVariable({ children }: TokenProps) {
  return <span className="text-syntax-variable">{children}</span>;
}

CodeBlock.String = function CodeBlockString({ children }: TokenProps) {
  return <span className="text-syntax-string">{children}</span>;
}

CodeBlock.ConsoleToken = function CodeBlockConsoleToken({ children }: TokenProps) {
  return <span className="text-syntax-console">{children}</span>;
}

CodeBlock.Punctuation =  function CodeBlockPunctuation({ children }: TokenProps) {
  return <span className="text-syntax-punctuation">{children}</span>;
}

CodeBlock.Tag =  function CodeBlockTag({ children }: TokenProps) {
  return <span className="text-syntax-tag">{children}</span>;
}