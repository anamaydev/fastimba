import Header from "@/components/Header.tsx";
import FeatureCard from "@/components/FeatureCard.tsx";
import CodeBlock from "@/components/CodeBlock.tsx";
import ToggleButton from "@/components/ToggleButton.tsx";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext.ts";

const App = () => {
  const {isOpen} = usePreferencesContext();
  const demoGutterLines = [4, 3, 2, 1, 5, 1];

  return (
    <div
      className={
        `${isOpen ? "flex" : "hidden"} w-78 h-auto fixed z-10000 top-2 right-2 flex flex-col gap-1`
      }
    >
      <Header/>

      {/* Relative Line Numbers */}
      <FeatureCard className="">
        <FeatureCard.Visual className="w-14">
          {/* TODO: Animate Line Numbers */}
          <div className="w-full h-full flex flex-col justify-center items-center gap-1">
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
            <span className="text-secondary">5</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </FeatureCard.Visual>

        <FeatureCard.Context className="flex-1">
          <FeatureCard.Context.Title>Line Numbers</FeatureCard.Context.Title>
          <FeatureCard.Context.Description>
            <p>
              <strong className="text-primary">Relative</strong>{" "}
              <span>Line Numbers shows</span>{" "}
              <strong className="text-primary">distance from cursor</strong>
              <span>. Great for quick movement and jumps.</span>
            </p>
          </FeatureCard.Context.Description>
          <ToggleButton name="relativeLineNumbers" className="w-full" leftOption="Absolute" rightOption="Relative" />
        </FeatureCard.Context>
      </FeatureCard>

      {/* Vim */}
      <FeatureCard className="">
        <FeatureCard.Visual className="flxe-1 w-full">
          {/* TODO: Animate Vim */}
          <CodeBlock className="flex-1 w-full">
            <CodeBlock.Gutter lines={demoGutterLines} activeLine={5} />
            <CodeBlock.Code>
              <p><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>name</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>'John'</CodeBlock.String>;</p>
              <p><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>age</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>23</CodeBlock.String>;</p>
              <p><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>course</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>'React'</CodeBlock.String>;</p>
              <p>&nbsp;</p>
              <p><CodeBlock.ConsoleToken>console</CodeBlock.ConsoleToken><CodeBlock.Punctuation>.</CodeBlock.Punctuation>log(<CodeBlock.Variable>name</CodeBlock.Variable>);</p>
              <p><CodeBlock.ConsoleToken>console</CodeBlock.ConsoleToken><CodeBlock.Punctuation>.</CodeBlock.Punctuation>log(<CodeBlock.Variable>age</CodeBlock.Variable>);</p>
            </CodeBlock.Code>
          </CodeBlock>
          <FeatureCard.Badge>4k</FeatureCard.Badge>
        </FeatureCard.Visual>

        <FeatureCard.Context className="flex-1">
          <FeatureCard.Context.Title>Vim</FeatureCard.Context.Title>
          <FeatureCard.Context.Description>
            <p>
              <strong className="text-primary">Vim </strong>
              <span>keybindings for faster editing, </span>
              <strong className="text-primary">avoid </strong>
              <span>the </span>
              <strong className="text-primary">mouse</strong>
              <span>.</span>
            </p>
          </FeatureCard.Context.Description>
          <ToggleButton name="vim"/>
        </FeatureCard.Context>
      </FeatureCard>

      {/* Emmet */}
      <FeatureCard className="">
        <FeatureCard.Visual className="flxe-1 w-full">
          {/* TODO: Animate Emmet */}
          <CodeBlock className="flex-1 w-full">
            <CodeBlock.Gutter lines={demoGutterLines} activeLine={5} />
            <CodeBlock.Code className="text-syntax-tag">
              <p>&lt;nav&gt;</p>
              <div className="pl-3 flex flex-col gap-1">
                <p>&lt;ul&gt;</p>
                <div className="pl-3 flex flex-col gap-1">
                  <p>&lt;li&gt;&lt;/li&gt;</p>
                  <p>&lt;li&gt;&lt;/li&gt;</p>
                </div>
                <p>&lt;/ul&gt;</p>
              </div>
              <p>&lt;/nav&gt;</p>
            </CodeBlock.Code>
          </CodeBlock>
          <FeatureCard.Badge>nav&gt;ul&gt;li*2</FeatureCard.Badge>
        </FeatureCard.Visual>

        <FeatureCard.Context className="flex-1">
          <FeatureCard.Context.Title>Emmet</FeatureCard.Context.Title>
          <FeatureCard.Context.Description>
            <p>
              <span>Turn short expressions into </span>
              <span className="text-primary">HTML</span>
              <span> and </span>
              <span className="text-primary">CSS</span>
              <span> using </span>
              <strong className="text-primary">Emmet </strong>
              <span>syntax</span>.
            </p>
          </FeatureCard.Context.Description>
          <ToggleButton name="emmet" className="max-w-26" />
        </FeatureCard.Context>
      </FeatureCard>
    </div>
  )
};
export default App;
