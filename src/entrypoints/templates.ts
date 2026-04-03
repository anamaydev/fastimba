export default {
  relativeLineNumbersStyles: `
    .active-line-number {
      color: #d4d4d899 !important;
    }
  `,
  vimStatusBarStyles: `
    #fastimba-status-bar {
      position: absolute !important;
      height: 1.75rem !important;
      width: 100% !important;
      top: -1.75rem !important;
      left: 0 !important;
      right: 0 !important;
      color: lch(47.87 5.19 285.84) !important;
      background-color: lch(8.13 5.06 129.78) !important;
    }
    
    .status-bar-container {
      width: 100% !important;
      height: 100% !important;
      padding: 0.25rem !important;
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-size: 0.75rem !important;
      line-height: 1 !important;
    }
    
    .section{
      height: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 0.5rem;
    }

    .mode-indicator {
      min-width: 4rem !important;
      position: relative !important;
      z-index: 0 !important;
      padding: 0.25rem !important;
      border-radius: 0.25rem !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }

    .mode-normal {
      --bgi: linear-gradient(to bottom, lch(20 14 161.4 / 1), lch(20 14 161.4 / 1)); 
      color: lch(75 56.2 161.4 / 1) !important; 
    }
    
    .mode-insert {
      --bgi: linear-gradient(to bottom, lch(20 14 83.1 / 1), lch(20 14 83.1 / 1));
      color: lch(75 82.3 83.1 / 1) !important;
    }

    .mode-visual {
      --bgi: linear-gradient(to bottom, lch(20 14 271.44 / 1), lch(20 14 271.44 / 1)); 
      color: lch(75 65.4 271.44 / 1) !important; 
    }

    .mode-replace {
      --bgi: linear-gradient(to bottom, lch(20 14 18.6 / 1), lch(20 14 18.6 / 1));
      color: lch(75 66.7 18.6 / 1) !important; 
    }
    
    .mode-normal:before, 
    .mode-insert:before, 
    .mode-visual:before,
    .mode-replace:before{
      content: "" !important;
      position: absolute !important;
      z-index: -1 !important;
      inset: 0 !important;
      background-origin: border-box !important;
      border-radius: inherit !important;
      background-image: var(--bgi) !important;
    }
    
    .command-input {
      box-sizing: border-box !important;
      padding: 0.25rem !important;
      max-width: 15rem !important;
      border-radius: 0.25rem !important;
      background-color: lch(12.11 5.85 125.09 / 0%);
    }

    .key-buffer,
    .cursor-position {
      padding: 0.25rem !important;
      border-radius: 0.25rem !important;
      background-color: lch(12.11 5.85 125.09 / 75%) !important; 
    }
  `
}