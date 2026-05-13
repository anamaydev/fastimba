export const features = {
  fastimba: {
    name: "fastimba",
    title: "Fastimba",
    description: "Fastimba is a browser extension that transforms Scrimba's code editor into a powerhouse. It brings the tools professional developers rely on every day: Vim keybindings, relative line numbers, Emmet, and built-in Pomodoro focus sessions, directly into your learning environment. No context switching, no friction. Just you and the code.",
    video: "assets/videos/fastimba.mp4",
    storeLinks: [
      {name: "Chrome", browser: "chrome", url: "https://chromewebstore.google.com/detail/lgjlpmdkdpbkcnkfpgighkdomjfkgpgc?utm_source=item-share-cb"},
      {name: "Firefox", browser: "firefox", url: "https://addons.mozilla.org"},
    ],
    icon: `
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M10 12h4v4h-4v4H6V8h4zm8-4h-8V4h8z"/>
      </svg>
    `
  },
  vim: {
    name: "vim",
    title: "Vim Mode",
    description: `Full Vim modal editing inside Scrimba's Monaco editor. Switch between <span class="feature__about-mode mode--normal">NORMAL</span>, <span class="feature__about-mode mode--insert">INSERT</span>, and <span class="feature__about-mode mode--visual">VISUAL</span> modes seamlessly and navigate your code without touching the mouse. Your muscle memory from your editor carries over directly.`,
    video: "assets/videos/vim.mp4",
    resources: [
      {name: "Vim Cheat Sheet", url: "https://vim.rtorr.com/"},
    ],
    icon: `
      <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" >
        <path fill="currentColor" d="M6.90918 1.5c.2761.00005.5.22389.5.5v2.72754c-.00014.27599-.22399.49995-.5.5h-.0459v1.56543l1.80371-1.80371c-.04726-.07631-.07612-.16537-.07617-.26172V2c0-.27611.2239-.49995.5-.5H14c.2761 0 .5.22386.5.5v2.72754a.5007.5007 0 0 1-.1465.35351L5.08105 14.3535a.5007.5007 0 0 1-.35351.1465H3.09082a.5.5 0 0 1-.35352-.1465l-.54492-.5459a.5.5 0 0 1-.14648-.3535V5.22754H2c-.27605 0-.49986-.22398-.5-.5V2c0-.27614.22386-.5.5-.5zM2.5 4.22754h.0459c.27594.00024.5.224.5.5v8.51956l.25195.2529h1.22266L13.5 4.52051V2.5H9.59082v1.72754h.0459c.20209.00014.38458.12186.46188.30859.0773.18675.0345.402-.10837.54492L6.7168 8.35352c-.143.14285-.35817.18575-.54492.10839-.18663-.07747-.3086-.25981-.3086-.46191V4.72754c0-.27602.22402-.49981.5-.5h.0459V2.5H2.5z"/>
      </svg>
    `
  },
  relativeLines: {
    name: "relative-lines",
    title: "Relative Line Numbers",
    description: `Every line shows its distance from your cursor, making Vim motions like <span class="feature__about-kbd">5j</span> or <span class="feature__about-kbd">d8d</span> precise and instant. Your current line always shows its absolute number so you never lose context.`,
    video: "assets/videos/relative-lines.mp4",
    icon: `
      <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M2.66602 9.53809c.29369-.06704.60137-.04451.88183.06543.2804.1101.52165.30289.69141.55178.16956.2489.2607.5435.26074.8447-.00008.4076-.16979.7472-.37109 1.0146-.19835.2635-.4528.4904-.67188.6768-.05904.0502-.11448.0975-.16699.1416h1.04297c.27579.0002.49965.2243.5.5-.00017.2759-.2241.4998-.5.5H2.2666c-.27587-.0002-.49983-.2241-.5-.5.00027-.3771.23768-.6664.41113-.8457.18486-.1911.43576-.3908.63184-.5576.21406-.1822.39393-.3485.52051-.5166.12331-.1639.16984-.2961.16992-.4131-.00004-.1002-.03063-.1984-.08691-.2812-.05654-.0828-.13718-.1479-.23047-.1846-.09335-.0365-.19621-.0438-.29395-.0215-.09786.0224-.1876.0738-.25586.1475-.18768.202-.50366.2136-.70605.0263-.20211-.1877-.2139-.5036-.02637-.70603a1.5005 1.5005 0 0 1 .76563-.44238M14.001 12.167c.2757.0005.5.2242.5.5-.0002.2757-.2244.4995-.5.5H7.33398c-.27604 0-.49983-.224-.5-.5 0-.2762.22386-.5.5-.5zm0-4.667c.2756.00054.4998.22433.5.5-.0002.27567-.2244.49946-.5.5H7.33398c-.27604 0-.49983-.224-.5-.5.00017-.276.22396-.5.5-.5zM3.33398 2.16699c.27586.00034.5.22407.5.5V5.5H4c.2759.00017.49984.2241.5.5-.00016.2759-.2241.49984-.5.5H2.66699c-.27604 0-.49983-.224-.5-.5.00017-.276.22396-.5.5-.5h.16699V3.16699h-.16699c-.27604 0-.49983-.224-.5-.5 0-.27614.22386-.5.5-.5zm10.66702.66699c.2757.00054.5.22419.5.5-.0004.27551-.2246.49947-.5.5H7.33398c-.27591 0-.49963-.22416-.5-.5 0-.27614.22386-.5.5-.5z"/>
      </svg>
    `
  },
  emmet: {
    name: "emmet",
    title: "Emmet",
    description: "Type a short abbreviation, hit Tab, and get full HTML or CSS output. Spend less time writing boilerplate and more time building.",
    video: "assets/videos/emmet.mp4",
    resources: [
      {name: "Emmet Cheat Sheet", url: "https://docs.emmet.io/cheat-sheet/"},
    ],
    icon: `
      <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M5.77636 4.8389c.25576-.10372.54747.01965.65137.27539.10334.25563-.01983.54754-.27539.65136L3.1953 6.96683l3.59473.92675c.31693.08222.60759.24773.83887.4795a1.835 1.835 0 0 1 .47754.83789l.92675 3.59273 1.20211-2.95602c.1039-.25578.3956-.37918.6514-.27539.2555.10408.3783.39568.2744.65141l-1.3906 3.4257c-.06608.1618-.18194.2999-.33008.3926-.14818.0925-.32277.1365-.49707.125-.14829-.0099-.28998-.0624-.41211-.1455a.5.5 0 0 1-.01855-.0127c-.01498-.0108-.03159-.0204-.0459-.0322-.04029-.0334-.07636-.0714-.10938-.1113L2.13378 7.64163c-.03927-.03266-.0774-.06771-.11035-.10742-.1115-.13466-.17769-.30214-.18945-.47656-.01161-.17445.03246-.34876.125-.49707l.07714-.1045a.8356.8356 0 0 1 .31446-.22558zm1.97656 7.0078-.61523-2.38573c-.03704-.14406-.11178-.27651-.2168-.38184-.10507-.10522-.23693-.18041-.38086-.21777l-2.38867-.61621zm5.74028-9.99902.1191.03223a.833.833 0 0 1 .2178.11524l.0947.08105.0801.09375a.836.836 0 0 1 .1152.21777l.0322.12012.0147.12305c.0045.11965-.019.23924-.0654.35058l.0019.00098-1.8525 4.55957c-.1042.25521-.3959.37895-.6514.27539-.2554-.1039-.3787-.39578-.2754-.65137l1.7031-4.19433-4.19332 1.7041c-.25543.10329-.5473-.01929-.65137-.27441-.10386-.25562.01999-.5472.27539-.65137l4.5498-1.84766c.1143-.04945.238-.07302.3613-.06836z"/>
      </svg>
    `
  },
  pomodoro: {
    name: "pomodoro",
    title: "Pomodoro Timer",
    description: "Run focused work sessions with customizable durations for sessions, short breaks, and long breaks. The timer shows up in the Fastimba UI, updates the tab title live, and animates a progress ring in the favicon so your focus is always visible at a glance.",
    video: "assets/videos/pomodoro.mp4",
    icon: `
      <svg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M8.60938 1.5c.20884.0038.44909.05457.68164.10156C12.2629 2.20212 14.4999 4.83251 14.5 7.98633 14.5 11.5826 11.5909 14.5 8 14.5c-3.59091 0-6.5-2.9174-6.5-6.51367.00003-1.82155.74658-3.46972 1.94922-4.65137.19696-.19352.51349-.19009.70703.00684.19353.19697.19111.5135-.00586.70703C3.13156 5.04994 2.50003 6.44362 2.5 7.98633 2.5 11.0324 4.9635 13.5 8 13.5s5.5-2.4676 5.5-5.51367c-.0001-2.66993-1.8934-4.89627-4.40625-5.4043-.26861-.05428-.40514-.08021-.50195-.08203a.29.29 0 0 0-.04102.00195l-.00781.00098-.00391.00098c-.00264.00579-.01086.02617-.01855.07324-.01941.11888-.02051.28986-.02051.59863v.60156c-.00021.27597-.22399.5-.5.5s-.49979-.22403-.5-.5v-.60156c0-.27463-.0014-.54183.03418-.75976.03981-.24372.13522-.49073.36914-.68262l.08398-.0625c.19777-.13208.40927-.17474.62208-.1709m-3.3252 3.1123c.18151-.14767.44121-.14965.625-.00488l3.25195 2.56836c.71451.56435.71855 1.64177.00782 2.21094-.70641.56528-1.76165.33966-2.16797-.47168L5.15234 5.22363c-.10458-.20929-.0495-.46347.13184-.61133m2.61133 3.85547c.11935.23758.43538.30893.64844.13868.20862-.16703.20775-.48071-.00196-.64649L7.05176 6.7832z"/>
      </svg>
    `
  }
}