export default {
  editorStyles: `
    /* Relative line Numbers */
    .active-line-number {
      color: #d4d4d899 !important;
    }

    /* Vim Status Bar */
    #fastimba-status-bar[data-parent="ide-console-panel"] {
      position: absolute !important;
      height: 1.75rem !important;
      width: 100% !important;
      top: -1.75rem !important;
      left: 0 !important;
      right: 0 !important;
      color: lch(47.87 5.19 285.84) !important;
    }
    
    #fastimba-status-bar[data-parent="si-viewgroup-view"] {
      position: absolute !important;
      height: 1.75rem !important;
      width: 100% !important;
      // top: -1.75rem !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      color: lch(47.87 5.19 285.84) !important;
    }
    
    .status-bar {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      font-size: 0.75rem !important;
      line-height: 1 !important;
    }
    
    .status-bar__panel {
      position: absolute !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      background-color: lch(8.13 5.06 129.78) !important;
    }
    
    .status-bar__content{
      z-index: 2 !important;
      padding: 0.25rem !important;
      flex-direction: row !important;
      justify-content: space-between !important;
    }
    
    .status-bar__section {
      height: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 0.5rem;
    }

    .status-bar__mode-indicator {
      min-width: 4rem !important;
      position: relative !important;
      z-index: 0 !important;
      padding: 0.25rem !important;
      border-radius: 0.25rem !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }

    .status-bar__mode-indicator--normal {
      --bgi: linear-gradient(to bottom, lch(20 14 161.4 / 1), lch(20 14 161.4 / 1)); 
      color: lch(75 56.2 161.4 / 1) !important; 
    }
    
    .status-bar__mode-indicator--insert {
      --bgi: linear-gradient(to bottom, lch(20 14 83.1 / 1), lch(20 14 83.1 / 1));
      color: lch(75 82.3 83.1 / 1) !important;
    }

    .status-bar__mode-indicator--visual {
      --bgi: linear-gradient(to bottom, lch(20 14 271.44 / 1), lch(20 14 271.44 / 1)); 
      color: lch(75 65.4 271.44 / 1) !important; 
    }

    .status-bar__mode-indicator--replace {
      --bgi: linear-gradient(to bottom, lch(20 14 18.6 / 1), lch(20 14 18.6 / 1));
      color: lch(75 66.7 18.6 / 1) !important; 
    }
    
    .status-bar__mode-indicator--normal:before, 
    .status-bar__mode-indicator--insert:before, 
    .status-bar__mode-indicator--visual:before,
    .status-bar__mode-indicator--replace:before,
    .status-bar__notification-item:before {
      content: "" !important;
      position: absolute !important;
      z-index: -1 !important;
      inset: 0 !important;
      background-origin: border-box !important;
      border-radius: inherit !important;
      background-image: var(--bgi) !important;
    }
    
    .status-bar__command-input {
      box-sizing: border-box !important;
      padding: 0.25rem !important;
      max-width: 15rem !important;
      border-radius: 0.25rem !important;
      background-color: lch(12.11 5.85 125.09 / 0%);
    }

    .status-bar__key-buffer,
    .status-bar__cursor-position {
      padding: 0.25rem !important;
      border-radius: 0.25rem !important;
      background-color: lch(12.11 5.85 125.09 / 75%) !important; 
    }
    
    .status-bar__notification{
      z-index: 1 !important;
      justify-content: start !important;
      padding-left: 0.25rem !important;
    }
    
    .status-bar__notification-item{
      position: relative !important;
      width: fit-content !important;
      padding: 0.25rem !important;
      border-radius: 0.25rem !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 0.5rem !important;
      --bgi: linear-gradient(to bottom, lch(20 14 18.6 / 1), lch(20 14 18.6 / 1));
      color: lch(75 66.7 18.6 / 1) !important; 
    }
    
    .status-bar__notification-item--in {
      transform: translateY(-2rem) !important;
      transition: transform 0.3s ease-out;
    }
    
    .status-bar__notification-item--out {
      transform: translateY(0) !important;
      transition: transform 0.3s ease-in;
    }
  `
}