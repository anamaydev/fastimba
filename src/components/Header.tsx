import {useState} from "react";
import Button from "@/components/Button";
import {Logo, Github, Chain} from "@/components/icons";
import {getBrowserStoreLink} from "@/utils/browser";

const Header = () => {
  const [copyLabel, setCopyLabel] = useState("Copy link");

  /* Open GitHub repository link in new tab */
  const handleGithub = () => {
    window.open("https://github.com/anamaydev/fastimba", "_blank");
  };

  /* Copy extension link to the clipboard */
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getBrowserStoreLink());
    setCopyLabel("Copied");
    setTimeout(() => setCopyLabel("Copy link"), 2000);
  };

  return (
    <div className="flex justify-between items-center gap-2">
      <span className="flex items-center gap-2">
        <Logo className="size-4"/>
        <span className="text-sm">Fastimba</span>
      </span>

      <div className="relative flex justify-center items-center gap-2">
        <Button onClick={handleGithub} colorScheme="slate">
          <p>Github</p>
          <Github className="size-4"/>
        </Button>
        <Button onClick={handleCopyLink} colorScheme="slate">
          <p>{copyLabel}</p>
          <Chain className="size-4"/>
        </Button>
      </div>
    </div>
  )
};

export default Header;