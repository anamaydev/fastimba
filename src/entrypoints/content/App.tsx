import {useState, useEffect} from "react";
import Header from "@/components/Header.tsx";
import FeatureCard from "@/components/FeatureCard.tsx";
import CodeBlock from "@/components/CodeBlock.tsx";
import ToggleButton from "@/components/ToggleButton.tsx";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext.ts";

const LINE_COUNT = 9;

/* Each entry: [targetIndex (0-based), (delayMs before moving to this index)] */
const RLN_SEQUENCE: [number, number][] = [
  [3, 200],
  [4, 200],
  [5, 200],
  [6, 200],
  [7, 200],
  [6, 2000],
  [5, 150],
  [4, 800],
  [3, 800],
  [2, 800],
  [3, 800],
  [4, 800],
  [5, 150],
  [6, 2000],
];
const RLN_RESTART_DELAY = 2000;

/* badge: text shown in the badge */
/* steps: how many lines to move */
/* dir:   - k => -1, j => 1 */
const VIM_COMMANDS = [
  {badge: "4k", steps: 4, dir: -1},
  {badge: "2j", steps: 2, dir:  1},
  {badge: "3k", steps: 3, dir: -1},
  {badge: "1j", steps: 1, dir:  1},
] as const;
const VIM_GUTTER_SIZE = 6;
const VIM_TYPE_MS = 300;  /* ms per character in the typewriter phase */
const VIM_PAUSE_MS = 800; /* pause after full command is typed, before movement starts */
const VIM_HOLD_MS = 2000; /* ms to hold after all steps complete, before next command */

const EMMET_EXPRESSION = "nav>ul>li*2";
const EMMET_LINES = [
  {indent: 0, text: "<nav>"},
  {indent: 1, text: "<ul>"},
  {indent: 2, text: "<li></li>"},
  {indent: 2, text: "<li></li>"},
  {indent: 1, text: "</ul>"},
  {indent: 0, text: "</nav>"},
] as const;
const EMMET_TYPE_MS = 100;  /* ms per character during typewriter phase */
const EMMET_PAUSE_MS = 400; /* pause after full expression is typed, before code reveals */
const EMMET_HOLD_MS = 1500; /* ms to hold all lines visible before resetting */

const App = () => {
  const {isOpen} = usePreferencesContext();

  const [activeLineIndex, setActiveLineIndex] = useState(4);
  const [vimBadge, setVimBadge] = useState("");
  const [vimActiveLine, setVimActiveLine] = useState(3);
  const [emmetBadge, setEmmetBadge] = useState("");
  const [emmetRevealedLines, setEmmetRevealedLines] = useState(0);

  /* Vim Animation */
  useEffect(() => {
    if (!isOpen) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let commandIndex = 0;
    let currentLine = 5;
    setVimActiveLine(currentLine);

    const runCommand = () => {
      const {badge, steps, dir} = VIM_COMMANDS[commandIndex];

      /* Clear the badge and type the command character by character */
      setVimBadge("");
      let charIndex = 0;
      const typeChar = () => {
        charIndex++;
        setVimBadge(badge.slice(0, charIndex));

        if (charIndex < badge.length) {
          timeoutId = setTimeout(typeChar, VIM_TYPE_MS);
          return;
        }

        timeoutId = setTimeout(() => {
          /* Jump straight to the destination */
          currentLine = Math.max(1, Math.min(VIM_GUTTER_SIZE, currentLine + steps * dir));
          setVimActiveLine(currentLine);

          /* Hold on the target line, then move to the next command */
          commandIndex = (commandIndex + 1) % VIM_COMMANDS.length;
          timeoutId = setTimeout(runCommand, VIM_HOLD_MS);
        }, VIM_PAUSE_MS);
      };

      typeChar();
    };

    runCommand();
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  /* Emmet Animation */
  useEffect(() => {
    if (!isOpen) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      /* Reset both badge and code, then type the expression character by character */
      setEmmetBadge("");
      setEmmetRevealedLines(0);
      let charIndex = 0;

      const typeChar = () => {
        charIndex++;
        setEmmetBadge(EMMET_EXPRESSION.slice(0, charIndex));

        if (charIndex < EMMET_EXPRESSION.length) {
          /* Reveal expression letters one by one */
          timeoutId = setTimeout(typeChar, EMMET_TYPE_MS);
          return;
        }

        /* Type full expression, Pause, Reveal all code lines at once */
        timeoutId = setTimeout(() => {
          setEmmetRevealedLines(EMMET_LINES.length);
          timeoutId = setTimeout(loop, EMMET_HOLD_MS);
        }, EMMET_PAUSE_MS);
      };

      typeChar();
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  /* Relative Line Numbers Animation */
  useEffect(() => {
    if (!isOpen) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let step = 0;

    const run = () => {
      const [index, delay] = RLN_SEQUENCE[step];

      timeoutId = setTimeout(() => {
        setActiveLineIndex(index);
        step++;
        if (step >= RLN_SEQUENCE.length) {
          step = 0;
          timeoutId = setTimeout(run, RLN_RESTART_DELAY);
        } else run();
      }, delay);
    };

    run();
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  return (
    <div className={`${isOpen ? "flex" : "hidden"} w-78 h-auto fixed z-10000 top-2 right-2 flex flex-col gap-1`}>
      <Header/>

      {/* Relative Line Numbers */}
      <FeatureCard className="">
        <FeatureCard.Visual className="w-14">
          <div className="w-full h-full flex flex-col justify-center items-center gap-1">
            {Array.from({length: LINE_COUNT}, (_, index) => (
              <span key={index} className={`transition-all duration-150 ${index === activeLineIndex ? "text-primary" : ""}`}>
                {index === activeLineIndex ? activeLineIndex + 1 : Math.abs(index - activeLineIndex)}
              </span>
            ))}
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
          <CodeBlock className="flex-1 w-full">
            <CodeBlock.Gutter
              lines={Array.from({length: VIM_GUTTER_SIZE}, (_, i) => {
                const pos = i + 1;
                return pos === vimActiveLine ? vimActiveLine : Math.abs(pos - vimActiveLine);
              })}
              activeLine={vimActiveLine}
            />
            <CodeBlock.Code>
              {[
                <><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>name</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>'John'</CodeBlock.String>;</>,
                <><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>age</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>23</CodeBlock.String>;</>,
                <><CodeBlock.Keyword>const</CodeBlock.Keyword> <CodeBlock.Variable>course</CodeBlock.Variable> <CodeBlock.Keyword>=</CodeBlock.Keyword> <CodeBlock.String>'React'</CodeBlock.String>;</>,
                <>&nbsp;</>,
                <><CodeBlock.ConsoleToken>console</CodeBlock.ConsoleToken><CodeBlock.Punctuation>.</CodeBlock.Punctuation>log(<CodeBlock.Variable>name</CodeBlock.Variable>);</>,
                <><CodeBlock.ConsoleToken>console</CodeBlock.ConsoleToken><CodeBlock.Punctuation>.</CodeBlock.Punctuation>log(<CodeBlock.Variable>age</CodeBlock.Variable>);</>,
              ].map((line, i) => (
                <p key={i} className="relative">
                  <span className={`absolute left-0 top-0 w-1.25 h-2.5 bg-primary transition-opacity duration-150 ${i + 1 === vimActiveLine ? "opacity-25" : "opacity-0"}`} />
                  {line}
                </p>
              ))}
            </CodeBlock.Code>
          </CodeBlock>
          <FeatureCard.Badge>{vimBadge}</FeatureCard.Badge>
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
          <CodeBlock className="flex-1 w-full">
            <CodeBlock.Gutter lines={[1, 1, 2, 3, 4, 5]} activeLine={1} />
            <CodeBlock.Code className="text-syntax-tag">
              {emmetRevealedLines === 0 ? (
                /* Mirror the badge text on line 1, as if the user is typing there */
                <p className="text-bright">{emmetBadge}</p>
              ) : (
                /* Display full HTML structure at once after typing line is gone */
                EMMET_LINES.map((line, i) => (
                  <p key={i} className={line.indent === 1 ? "pl-3" : line.indent === 2 ? "pl-6" : ""}>
                    {line.text}
                  </p>
                ))
              )}
            </CodeBlock.Code>
          </CodeBlock>
          <FeatureCard.Badge>{emmetBadge}</FeatureCard.Badge>
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
