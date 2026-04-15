import {useState, useEffect} from "react";
import Header from "@/components/Header.tsx";
import CodeBlock from "@/components/CodeBlock.tsx";
import ToggleButton from "@/components/ToggleButton.tsx";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext.ts";
import {clsx} from "clsx";
import Feature from "@/components/Feature.tsx";
import {Emmet, RelativeLines, Terminal} from "@/components/icons";

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
/* dir:   k => -1, j => 1 */
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
    <div className={clsx(
      "w-78 h-auto p-1 rounded-[0.625rem] fixed z-10000 top-6 right-16 flex-col gap-1 container-shadow backdrop-blur-sm bg-obsidian-400/80 text-ash-100",
      isOpen ? "flex" : "hidden"
    )}>
      <Header/>

      <hr className="h-[0.5px] rounded-full text-white/10" />

      {/* settings */}
      <div className="flex flex-col gap-0">
        <Feature>
          <Feature.Visual className="w-14">
            <div className="w-full h-full flex flex-col justify-center items-center gap-1">
              {Array.from({length: LINE_COUNT}, (_, index) => (
                <span key={index} className={clsx("transition-all duration-150", index === activeLineIndex && "text-primary")}>
                {index === activeLineIndex ? activeLineIndex + 1 : Math.abs(index - activeLineIndex)}
              </span>
              ))}
            </div>
          </Feature.Visual>

          <Feature.Context>
            <Feature.Context.Toggle>
              <RelativeLines className="size-4 text-sapphire-300"/>
            </Feature.Context.Toggle>
            <Feature.Context.Title>Line Numbers</Feature.Context.Title>
            <Feature.Context.Description>
              <p className="text-center">Relative Line Numbers shows distance from cursor. Great for quick movement and jumps.</p>
            </Feature.Context.Description>
            <ToggleButton name="relativeLineNumbers"/>
          </Feature.Context>
        </Feature>

        <Feature>
          <Feature.Visual className="flxe-1 w-full">
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
                    <span className={clsx("absolute left-0 top-0 w-1.25 h-2.5 bg-iris-400 transition-opacity duration-150", i + 1 === vimActiveLine ? "opacity-25" : "opacity-0")} />
                    {line}
                  </p>
                ))}
              </CodeBlock.Code>
            </CodeBlock>
            <Feature.Badge>{vimBadge}</Feature.Badge>
          </Feature.Visual>

          <Feature.Context>
            <Feature.Context.Toggle>
              <Terminal className="size-4 text-sapphire-300"/>
            </Feature.Context.Toggle>
            <Feature.Context.Title>Vim</Feature.Context.Title>
            <Feature.Context.Description>
              <p className="text-center">Vim keybindings for faster editing, avoid the mouse.</p>
            </Feature.Context.Description>
            <ToggleButton name="vim"/>
          </Feature.Context>
        </Feature>

        <Feature>
          <Feature.Visual className="flxe-1 w-full">
            <CodeBlock className="flex-1 w-full">
              <CodeBlock.Gutter lines={[1, 1, 2, 3, 4, 5]} activeLine={1} />
              <CodeBlock.Code className="text-syntax-tag">
                {emmetRevealedLines === 0 ? (
                  /* Mirror the badge text on line 1, as if the user is typing there */
                  <p className="text-bright">{emmetBadge}</p>
                ) : (
                  /* Display full HTML structure at once after typing line is gone */
                  EMMET_LINES.map((line, i) => (
                    <p key={i} className={clsx(line.indent === 1 && "pl-3", line.indent === 2 && "pl-6")}>
                      {line.text}
                    </p>
                  ))
                )}
              </CodeBlock.Code>
            </CodeBlock>
            <Feature.Badge>{emmetBadge}</Feature.Badge>
          </Feature.Visual>

          <Feature.Context>
            <Feature.Context.Toggle>
              <Emmet className="size-4 text-sapphire-300"/>
            </Feature.Context.Toggle>
            <Feature.Context.Title>Emmet</Feature.Context.Title>
            <Feature.Context.Description>
              <p className="text-center">Turn short expressions into HTML and CSS using Emmet syntax.</p>
            </Feature.Context.Description>
            <ToggleButton name="emmet"/>
          </Feature.Context>
        </Feature>
      </div>
    </div>
  )
};
export default App;
