/**
 * Sekhar Teaching Hub — Unified Simulation HUD & GUI Engine (SekharSimUI)
 * Version: 2.0.0 (High-Density Smartboard Edition)
 * Standard: GTK4 / Libadwaita Zero-Radius Design System (GNOME 45+ HIG)
 * Features:
 *   - Built-in GTK4 Adwaita Light/Dark Styling (Zero <style> boilerplate)
 *   - Built-in Resizable Splitter (.adw-pane-splitter with pointer capture)
 *   - Built-in Dynamic Range Slider Active Track Fill Gradients
 *   - Built-in Crisp Inline Lucide SVG Icons (Play, Pause, Reset, Sun, Moon)
 *   - Built-in Canvas Zoom & Pan Engine ([ - ] [ 100% ] [ + ] [ ⟲ Fit ])
 *   - Built-in 3.75× Smartboard Loupe Magnifier Lens with Reticle Crosshair
 *   - Built-in NOSLE Spatial Label Occlusion Manager (sim.labels)
 *   - Built-in Host Device Telemetry & DPR Bridge (HOST_FRAME_DATA & SIM_READY)
 * License: MIT
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SekharSimUI = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  "use strict";

  const STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; border-radius: 0px !important; }
    
    :root {
      /* Adwaita Dark (GNOME 45+ HIG) */
      --adw-window-bg: #18181b;
      --adw-sidebar-bg: #222226;
      --adw-sidebar-border: rgba(255, 255, 255, 0.12);
      --adw-card-bg: #2a2a2e;
      --adw-card-border: rgba(255, 255, 255, 0.08);
      --adw-text-color: #fcfcfc;
      --adw-subtitle-color: #a1a1aa;
      --adw-accent-color: #38bdf8;
      --adw-accent-badge-bg: rgba(56, 189, 248, 0.18);
      --adw-accent-badge-text: #7dd3fc;
      --adw-scale-track-bg: #3f3f46;
      --adw-scale-track-fill: #38bdf8;
      --adw-scale-thumb-bg: #ffffff;
      --adw-btn-primary-bg: #38bdf8;
      --adw-btn-primary-text: #09090b;
      --adw-btn-sec-bg: #333338;
      --adw-btn-sec-text: #ffffff;
      --adw-btn-sec-hover: #3f3f46;
      --adw-canvas-bg: #18181b;
      --adw-canvas-border: rgba(255, 255, 255, 0.12);
      --adw-grid-color: #27272a;
      --adw-hud-bg: rgba(24, 24, 27, 0.94);
      --adw-hud-border: rgba(255, 255, 255, 0.14);
    }

    body.light-theme {
      /* Adwaita Light */
      --adw-window-bg: #f4f4f6;
      --adw-sidebar-bg: #e6e6ea;
      --adw-sidebar-border: #cfcfd6;
      --adw-card-bg: #ffffff;
      --adw-card-border: #cfcfd6;
      --adw-text-color: #0f172a;
      --adw-subtitle-color: #475569;
      --adw-accent-color: #0047ba;
      --adw-accent-badge-bg: rgba(0, 71, 186, 0.12);
      --adw-accent-badge-text: #00358c;
      --adw-scale-track-bg: #cbd5e1;
      --adw-scale-track-fill: #0047ba;
      --adw-scale-thumb-bg: #ffffff;
      --adw-btn-primary-bg: #0047ba;
      --adw-btn-primary-text: #ffffff;
      --adw-btn-sec-bg: #dadadd;
      --adw-btn-sec-text: #0f172a;
      --adw-btn-sec-hover: #cbccd1;
      --adw-canvas-bg: #ffffff;
      --adw-canvas-border: #cfcfd6;
      --adw-grid-color: #e2e8f0;
      --adw-hud-bg: rgba(255, 255, 255, 0.96);
      --adw-hud-border: #cbd5e1;
    }

    html, body {
      width: 100%; height: 100%; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none; -webkit-user-select: none;
      background: var(--adw-window-bg); color: var(--adw-text-color);
    }

    .sim-layout {
      display: flex; width: 100%; height: 100%;
      gap: 0px; padding: 0px; background: var(--adw-window-bg);
      position: relative; overflow: hidden;
    }

    /* Resizable Sidebar Panel */
    .controls-panel {
      width: 270px; min-width: 200px; max-width: 500px; flex: 0 0 270px;
      display: flex; flex-direction: column; gap: 8px;
      background: var(--adw-sidebar-bg); border-right: 1px solid var(--adw-sidebar-border);
      padding: 10px; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin;
      z-index: 10;
    }

    /* Draggable Resizable Splitter */
    .adw-pane-splitter {
      width: 6px; flex: 0 0 6px; height: 100%; cursor: col-resize;
      position: relative; display: flex; align-items: center; justify-content: center;
      user-select: none; touch-action: none; z-index: 20; background: transparent;
      transition: background-color 0.15s ease;
    }
    .adw-pane-splitter:hover, .adw-pane-splitter.dragging {
      background-color: var(--adw-accent-badge-bg);
    }
    .adw-pane-splitter::after {
      content: ""; width: 2px; height: 32px;
      background-color: var(--adw-subtitle-color); transition: background-color 0.15s ease, height 0.15s ease;
    }
    .adw-pane-splitter:hover::after, .adw-pane-splitter.dragging::after {
      background-color: var(--adw-accent-color); height: 48px;
    }

    .adw-header-bar {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--adw-sidebar-border); padding-bottom: 6px;
    }
    .adw-header-title { font-size: 13px; font-weight: 600; color: var(--adw-text-color); }
    .adw-header-subtitle { font-size: 10px; font-weight: 500; color: var(--adw-subtitle-color); text-transform: uppercase; }
    
    .theme-toggle-btn {
      background: var(--adw-btn-sec-bg); color: var(--adw-btn-sec-text);
      border: 1px solid var(--adw-sidebar-border); width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .theme-toggle-btn:hover { background: var(--adw-btn-sec-hover); border-color: var(--adw-accent-color); }

    .adw-deck-card {
      background: var(--adw-card-bg); border: 1px solid var(--adw-card-border);
      padding: 8px; display: flex; flex-direction: column; gap: 6px;
    }
    .deck-btn-row { display: flex; gap: 4px; }
    .speed-btn-row { display: flex; gap: 3px; }
    .speed-btn {
      flex: 1; height: 20px; font-size: 9.5px; font-weight: 500;
      background: transparent; border: 1px solid var(--adw-card-border);
      color: var(--adw-subtitle-color); cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .speed-btn.active {
      background: var(--adw-accent-color); color: #ffffff; border-color: var(--adw-accent-color);
    }

    .adw-btn {
      height: 28px; padding: 0 8px; font-size: 11px; font-weight: 500;
      border: 1px solid var(--adw-card-border); cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 5px;
      transition: background-color 0.15s ease;
    }
    .adw-btn-primary { background: var(--adw-btn-primary-bg); color: var(--adw-btn-primary-text); flex: 2; border: none; font-weight: 600; }
    .adw-btn-sec { background: var(--adw-btn-sec-bg); color: var(--adw-btn-sec-text); flex: 1; }
    .adw-btn:hover { filter: brightness(1.08); }

    .adw-action-row {
      background: var(--adw-card-bg); border: 1px solid var(--adw-card-border);
      padding: 8px; display: flex; flex-direction: column; gap: 4px;
    }
    .row-header { display: flex; justify-content: space-between; align-items: center; }
    .row-title { font-size: 11px; font-weight: 500; color: var(--adw-text-color); }
    .adw-value-badge {
      font-size: 11px; font-weight: 500; font-family: ui-monospace, SFMono-Regular, monospace;
      color: var(--adw-accent-badge-text); background: var(--adw-accent-badge-bg);
      padding: 2px 6px;
    }

    /* Continuous Active Fill Slider */
    .adw-scale-slider {
      width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
      background: var(--adw-scale-track-bg); outline: none; cursor: pointer; margin: 4px 0;
      transition: background 0.05s ease;
    }
    .adw-scale-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 16px; height: 16px;
      background: var(--adw-scale-thumb-bg); border: 1px solid rgba(0,0,0,0.3); cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.35);
    }
    .adw-scale-slider::-moz-range-thumb {
      width: 16px; height: 16px;
      background: var(--adw-scale-thumb-bg); border: 1px solid rgba(0,0,0,0.3); cursor: pointer;
    }

    .switch-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 0; font-size: 11px; font-weight: 500; color: var(--adw-text-color); cursor: pointer;
    }
    .switch-row input[type="checkbox"] { accent-color: var(--adw-accent-color); cursor: pointer; }

    .preset-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .preset-chip {
      font-size: 10px; font-weight: 500; background: var(--adw-btn-sec-bg);
      color: var(--adw-btn-sec-text); border: 1px solid var(--adw-card-border);
      padding: 3px 6px; cursor: pointer; transition: all 0.15s ease;
    }
    .preset-chip:hover { background: var(--adw-accent-color); color: #ffffff; border-color: var(--adw-accent-color); }

    /* Canvas Viewport */
    .canvas-container {
      flex: 1; height: 100%; position: relative;
      background: var(--adw-canvas-bg); overflow: hidden; min-width: 0; min-height: 0;
      touch-action: none;
    }
    .sim-canvas-host { width: 100%; height: 100%; position: relative; }
    .sim-canvas-host canvas { display: block; width: 100%; height: 100%; }

    /* Floating Viewport Controls (Zoom/Pan & Loupe) */
    .canvas-viewport-toolbar {
      position: absolute; top: 12px; right: 12px; z-index: 25;
      display: flex; align-items: center; gap: 6px;
    }
    .canvas-zoom-badge {
      background: var(--adw-hud-bg); border: 1px solid var(--adw-hud-border);
      padding: 2px 4px; display: inline-flex; align-items: center; gap: 2px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .zoom-btn {
      background: transparent; border: 1px solid transparent; color: var(--adw-text-color);
      width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s ease;
    }
    .zoom-btn:hover { background: var(--adw-btn-sec-hover); border-color: var(--adw-card-border); }
    .zoom-scale-text {
      font-size: 10px; font-weight: 600; font-family: ui-monospace, monospace;
      color: var(--adw-accent-color); min-width: 38px; text-align: center;
    }
    .loupe-toggle-btn {
      background: var(--adw-hud-bg); border: 1px solid var(--adw-hud-border);
      color: var(--adw-text-color); font-size: 10px; font-weight: 600;
      height: 28px; padding: 0 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25); transition: all 0.15s ease;
    }
    .loupe-toggle-btn:hover { border-color: var(--adw-accent-color); }
    .loupe-toggle-btn.active {
      background: var(--adw-accent-badge-bg); color: var(--adw-accent-color); border-color: var(--adw-accent-color);
    }

    /* 3.75x Smartboard Loupe Lens Overlay */
    .sim-loupe-lens {
      position: absolute; width: 240px; height: 240px; border-radius: 50% !important;
      border: 2.5px solid var(--adw-accent-color); pointer-events: none; z-index: 40;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45), inset 0 0 12px rgba(0,0,0,0.25);
      overflow: hidden; display: none; transform: translate(-50%, -50%);
      background: var(--adw-canvas-bg);
    }
    .sim-loupe-lens.active { display: block; }
    .sim-loupe-canvas { width: 240px; height: 240px; display: block; border-radius: 50% !important; }

    /* On-Canvas Telemetry HUD */
    .hud-overlay {
      position: absolute; bottom: 12px; right: 12px;
      background: var(--adw-hud-bg); border: 1px solid var(--adw-hud-border);
      padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; pointer-events: none;
      z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .hud-item {
      font-size: 11px; font-weight: 400; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: var(--adw-text-color); white-space: nowrap;
    }
    .hud-item-label { color: var(--adw-subtitle-color); margin-right: 6px; }

    @media (max-width: 680px) {
      .sim-layout { flex-direction: column; }
      .controls-panel { width: 100%; min-width: 100%; max-width: 100%; flex: 0 0 auto; max-height: 42%; border-right: none; border-bottom: 1px solid var(--adw-sidebar-border); }
      .adw-pane-splitter { display: none; }
    }
  `;

  // Inline Lucide SVGs
  const ICONS = {
    play: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    zoomIn: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    zoomOut: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    fit: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
    loupe: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><circle cx="11" cy="11" r="3"/></svg>`
  };

  /**
   * Non-Overlapping Spatial Label Engine (NOSLE Standard)
   */
  class LabelOcclusionManager {
    constructor() {
      this.obstacles = [];
      this.placedLabels = [];
    }
    reset() {
      this.obstacles.length = 0;
      this.placedLabels.length = 0;
    }
    addBoxObstacle(x, y, w, h, pad = 6) {
      if (this.obstacles.length > 80) this.obstacles.shift();
      this.obstacles.push({ left: x - pad, top: y - pad, right: x + w + pad, bottom: y + h + pad, type: "box" });
    }
    addCircleObstacle(cx, cy, r, pad = 6) {
      const totalR = r + pad;
      if (this.obstacles.length > 80) this.obstacles.shift();
      this.obstacles.push({ left: cx - totalR, top: cy - totalR, right: cx + totalR, bottom: cy + totalR, cx, cy, r: totalR, type: "circle" });
    }
    isCollision(box) {
      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (obs.type === "circle") {
          const closestX = Math.max(box.left, Math.min(obs.cx, box.right));
          const closestY = Math.max(box.top, Math.min(obs.cy, box.bottom));
          if ((obs.cx - closestX) ** 2 + (obs.cy - closestY) ** 2 < obs.r * obs.r) return true;
        } else if (!(box.right < obs.left || box.left > obs.right || box.bottom < obs.top || box.top > obs.bottom)) {
          return true;
        }
      }
      for (let i = 0; i < this.placedLabels.length; i++) {
        const lbl = this.placedLabels[i];
        if (!(box.right < lbl.left - 4 || box.left > lbl.right + 4 || box.bottom < lbl.top - 4 || box.top > lbl.bottom + 4)) return true;
      }
      return false;
    }
    addPlacedLabel(box) {
      if (this.placedLabels.length > 80) this.placedLabels.shift();
      this.placedLabels.push(box);
    }
  }

  /**
   * Main SekharSimUI Engine
   */
  class SekharSimUI {
    constructor(options = {}) {
      this.title = options.title || "Physics Simulation";
      this.subtitle = options.subtitle || "Sekhar Teaching Hub";
      this.slidersConfig = options.sliders || [];
      this.togglesConfig = options.toggles || [];
      this.presetsConfig = options.presets || [];
      this.hudKeys = options.hud || [];
      this.isDark = options.theme === "dark" ? true : false;
      this.isRunning = false;
      this.speed = 1.0;

      // Viewport Instruments State
      this.zoomScale = 1.0;
      this.panOffset = { x: 0, y: 0 };
      this.loupeActive = Boolean(options.loupe);
      this.loupeRadius = 120; // 120px radius = 240px diameter
      this.loupeZoom = 3.75;  // 3.75x magnification
      this.showZoomPan = options.zoomPan !== false; // Enabled by default

      // Algorithmic Engines
      this.labels = new LabelOcclusionManager();

      this.values = {};
      this.hudElements = {};
      this.listeners = {
        playChange: [],
        reset: [],
        speedChange: [],
        controlChange: [],
        resize: [],
        themeChange: [],
        zoomChange: []
      };

      if (options.onPlayChange) this.listeners.playChange.push(options.onPlayChange);
      if (options.onReset) this.listeners.reset.push(options.onReset);
      if (options.onSpeedChange) this.listeners.speedChange.push(options.onSpeedChange);
      if (options.onControlChange) this.listeners.controlChange.push(options.onControlChange);
      if (options.onResize) this.listeners.resize.push(options.onResize);
      if (options.onThemeChange) this.listeners.themeChange.push(options.onThemeChange);
      if (options.onZoomChange) this.listeners.zoomChange.push(options.onZoomChange);

      this._injectStyles();
      this._buildDOM();
      this._bindEvents();
      this._initLoupe();
      this._setupHostBridge();
      this._syncTheme();
      this._updateAllSliderFills();
    }

    _injectStyles() {
      if (typeof document === "undefined") return;
      if (document.getElementById("sekhar-sim-ui-styles")) return;
      const styleEl = document.createElement("style");
      styleEl.id = "sekhar-sim-ui-styles";
      styleEl.textContent = STYLES;
      if (document.head) document.head.appendChild(styleEl);
    }

    _buildDOM() {
      if (typeof document === "undefined") return;
      if (!this.isDark) {
        document.body.classList.add("light-theme");
      } else {
        document.body.classList.remove("light-theme");
      }

      const layout = document.createElement("div");
      layout.className = "sim-layout";

      // 1. Left Sidebar
      const sidebar = document.createElement("div");
      sidebar.className = "controls-panel";

      // Header Bar
      const headerBar = document.createElement("div");
      headerBar.className = "adw-header-bar";
      headerBar.innerHTML = `
        <div>
          <div class="adw-header-title">${this.title}</div>
          <div class="adw-header-subtitle">${this.subtitle}</div>
        </div>
        <button class="theme-toggle-btn" id="sim-theme-btn" title="Toggle Light/Dark Theme">
          ${this.isDark ? ICONS.sun : ICONS.moon}
        </button>
      `;
      sidebar.appendChild(headerBar);

      // Playback Deck
      const deckCard = document.createElement("div");
      deckCard.className = "adw-deck-card";
      deckCard.innerHTML = `
        <div class="deck-btn-row">
          <button class="adw-btn adw-btn-primary" id="sim-play-btn">
            ${ICONS.play}<span>Play</span>
          </button>
          <button class="adw-btn adw-btn-sec" id="sim-reset-btn" title="Reset Simulation">
            ${ICONS.reset}<span>Reset</span>
          </button>
        </div>
        <div class="speed-btn-row">
          <button class="speed-btn" data-speed="0.5">0.5x</button>
          <button class="speed-btn active" data-speed="1.0">1.0x</button>
          <button class="speed-btn" data-speed="2.0">2.0x</button>
        </div>
      `;
      sidebar.appendChild(deckCard);

      // Sliders
      this.slidersConfig.forEach((s) => {
        this.values[s.id] = Number(s.value);
        const card = document.createElement("div");
        card.className = "adw-action-row";
        const unitStr = s.unit ? ` ${s.unit}` : "";
        card.innerHTML = `
          <div class="row-header">
            <span class="row-title">${s.label}</span>
            <span class="adw-value-badge" id="badge-${s.id}">${s.value}${unitStr}</span>
          </div>
          <input type="range" class="adw-scale-slider" id="slider-${s.id}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}">
        `;
        sidebar.appendChild(card);
      });

      // Toggles (Strict Unticked Default when unspecified)
      if (this.togglesConfig.length > 0) {
        const toggleCard = document.createElement("div");
        toggleCard.className = "adw-action-row";
        this.togglesConfig.forEach((t) => {
          const isChecked = Boolean(t.checked);
          this.values[t.id] = isChecked;
          const row = document.createElement("label");
          row.className = "switch-row";
          row.innerHTML = `
            <span>${t.label}</span>
            <input type="checkbox" id="toggle-${t.id}" ${isChecked ? "checked" : ""}>
          `;
          toggleCard.appendChild(row);
        });
        sidebar.appendChild(toggleCard);
      }

      // Presets
      if (this.presetsConfig.length > 0) {
        const presetCard = document.createElement("div");
        presetCard.className = "adw-action-row";
        const label = document.createElement("span");
        label.className = "row-title";
        label.textContent = "Preset Scenarios:";
        presetCard.appendChild(label);

        const chipsWrap = document.createElement("div");
        chipsWrap.className = "preset-chips";
        this.presetsConfig.forEach((p) => {
          const chip = document.createElement("button");
          chip.className = "preset-chip";
          chip.textContent = p.label;
          chip.onclick = () => this.applyPreset(p.values);
          chipsWrap.appendChild(chip);
        });
        presetCard.appendChild(chipsWrap);
        sidebar.appendChild(presetCard);
      }

      layout.appendChild(sidebar);

      // 2. Built-in Draggable Resizable Splitter
      const splitter = document.createElement("div");
      splitter.className = "adw-pane-splitter";
      splitter.id = "sim-pane-splitter";
      splitter.title = "Drag to resize sidebar (Double-click to reset)";
      layout.appendChild(splitter);

      // 3. Right Canvas Stage
      const canvasContainer = document.createElement("div");
      canvasContainer.className = "canvas-container";
      canvasContainer.id = "sim-canvas-container";

      const host = document.createElement("div");
      host.className = "sim-canvas-host";
      host.id = "sim-canvas-host";
      canvasContainer.appendChild(host);

      // Floating Viewport Controls (Zoom/Pan & Loupe Toggle)
      const vpToolbar = document.createElement("div");
      vpToolbar.className = "canvas-viewport-toolbar";
      vpToolbar.innerHTML = `
        <button class="loupe-toggle-btn ${this.loupeActive ? "active" : ""}" id="sim-loupe-toggle" title="Toggle 3.75× Smartboard Loupe Lens">
          ${ICONS.loupe}<span>3.75× Loupe</span>
        </button>
        <div class="canvas-zoom-badge" id="sim-zoom-badge">
          <button class="zoom-btn" id="sim-zoom-out" title="Zoom Out">${ICONS.zoomOut}</button>
          <span class="zoom-scale-text" id="sim-zoom-text">100%</span>
          <button class="zoom-btn" id="sim-zoom-in" title="Zoom In">${ICONS.zoomIn}</button>
          <button class="zoom-btn" id="sim-zoom-reset" title="Reset Zoom (Fit)">${ICONS.fit}</button>
        </div>
      `;
      canvasContainer.appendChild(vpToolbar);

      // 3.75x Smartboard Loupe Lens Overlay
      const loupeLens = document.createElement("div");
      loupeLens.className = `sim-loupe-lens ${this.loupeActive ? "active" : ""}`;
      loupeLens.id = "sim-loupe-lens";
      const loupeCanvas = document.createElement("canvas");
      loupeCanvas.className = "sim-loupe-canvas";
      loupeCanvas.width = 240;
      loupeCanvas.height = 240;
      loupeLens.appendChild(loupeCanvas);
      canvasContainer.appendChild(loupeLens);

      // HUD Overlay
      if (this.hudKeys.length > 0) {
        const hud = document.createElement("div");
        hud.className = "hud-overlay";
        hud.id = "sim-hud-overlay";
        this.hudKeys.forEach((key) => {
          const item = document.createElement("div");
          item.className = "hud-item";
          item.id = `hud-${key}`;
          item.textContent = `${key.toUpperCase()}: --`;
          this.hudElements[key] = item;
          hud.appendChild(item);
        });
        canvasContainer.appendChild(hud);
      }

      layout.appendChild(canvasContainer);
      document.body.appendChild(layout);

      this.sidebar = sidebar;
      this.splitter = splitter;
      this.canvasHost = host;
      this.canvasContainer = canvasContainer;
      this.loupeLens = loupeLens;
      this.loupeCanvas = loupeCanvas;
      this.loupeCtx = loupeCanvas && typeof loupeCanvas.getContext === "function" ? loupeCanvas.getContext("2d") : null;
    }

    _bindEvents() {
      if (typeof document === "undefined") return;

      // Play / Pause Toggle
      const playBtn = document.getElementById("sim-play-btn");
      if (playBtn) {
        playBtn.onclick = () => {
          this.isRunning = !this.isRunning;
          playBtn.innerHTML = this.isRunning
            ? `${ICONS.pause}<span>Pause</span>`
            : `${ICONS.play}<span>Play</span>`;
          this.listeners.playChange.forEach((fn) => fn(this.isRunning));
        };
      }

      // Reset
      const resetBtn = document.getElementById("sim-reset-btn");
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.listeners.reset.forEach((fn) => fn());
        };
      }

      // Speed Buttons
      if (document.querySelectorAll) {
        document.querySelectorAll(".speed-btn").forEach((btn) => {
          btn.onclick = () => {
            document.querySelectorAll(".speed-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            this.speed = parseFloat(btn.dataset.speed) || 1.0;
            this.listeners.speedChange.forEach((fn) => fn(this.speed));
          };
        });
      }

      // Sliders & Gradient Track Fills
      this.slidersConfig.forEach((s) => {
        const slider = document.getElementById(`slider-${s.id}`);
        const badge = document.getElementById(`badge-${s.id}`);
        if (slider) {
          slider.oninput = (e) => {
            const val = parseFloat(e.target.value);
            this.values[s.id] = val;
            const unitStr = s.unit ? ` ${s.unit}` : "";
            if (badge) badge.textContent = `${val}${unitStr}`;
            this._updateSliderFill(slider);
            this.listeners.controlChange.forEach((fn) => fn(s.id, val));
          };
        }
      });

      // Toggles
      this.togglesConfig.forEach((t) => {
        const toggle = document.getElementById(`toggle-${t.id}`);
        if (toggle) {
          toggle.onchange = (e) => {
            const val = e.target.checked;
            this.values[t.id] = val;
            this.listeners.controlChange.forEach((fn) => fn(t.id, val));
          };
        }
      });

      // Theme Button
      const themeBtn = document.getElementById("sim-theme-btn");
      if (themeBtn) {
        themeBtn.onclick = () => {
          this.isDark = !this.isDark;
          themeBtn.innerHTML = this.isDark ? ICONS.sun : ICONS.moon;
          this._syncTheme();
          this._updateAllSliderFills();
        };
      }

      // Resizable Splitter Logic
      this._bindSplitterEvents();

      // Zoom & Pan Events
      this._bindZoomPanEvents();

      // Window Resize Dispatcher
      if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("resize", () => {
          this.listeners.resize.forEach((fn) => fn(this.width, this.height));
        });
      }
    }

    _bindSplitterEvents() {
      if (!this.splitter || !this.sidebar) return;
      let isResizing = false;

      this.splitter.addEventListener("pointerdown", (e) => {
        isResizing = true;
        this.splitter.classList.add("dragging");
        this.splitter.setPointerCapture(e.pointerId);
      });

      this.splitter.addEventListener("pointermove", (e) => {
        if (!isResizing) return;
        const rect = document.body.getBoundingClientRect();
        const newWidth = Math.max(200, Math.min(500, e.clientX - rect.left - 3));
        this.sidebar.style.width = newWidth + "px";
        this.sidebar.style.minWidth = newWidth + "px";
        this.sidebar.style.maxWidth = newWidth + "px";
        this.sidebar.style.flex = `0 0 ${newWidth}px`;
        this.listeners.resize.forEach((fn) => fn(this.width, this.height));
      });

      const stop = (e) => {
        if (!isResizing) return;
        isResizing = false;
        this.splitter.classList.remove("dragging");
        try { this.splitter.releasePointerCapture(e.pointerId); } catch (err) {}
      };
      this.splitter.addEventListener("pointerup", stop);
      this.splitter.addEventListener("pointercancel", stop);

      this.splitter.addEventListener("dblclick", () => {
        this.sidebar.style.width = "270px";
        this.sidebar.style.minWidth = "270px";
        this.sidebar.style.maxWidth = "270px";
        this.sidebar.style.flex = "0 0 270px";
        this.listeners.resize.forEach((fn) => fn(this.width, this.height));
      });
    }

    _bindZoomPanEvents() {
      const zoomIn = document.getElementById("sim-zoom-in");
      const zoomOut = document.getElementById("sim-zoom-out");
      const zoomReset = document.getElementById("sim-zoom-reset");
      const loupeBtn = document.getElementById("sim-loupe-toggle");

      if (zoomIn) zoomIn.onclick = () => this.setZoom(this.zoomScale + 0.15);
      if (zoomOut) zoomOut.onclick = () => this.setZoom(this.zoomScale - 0.15);
      if (zoomReset) zoomReset.onclick = () => this.resetZoom();
      if (loupeBtn) {
        loupeBtn.onclick = () => {
          this.loupeActive = !this.loupeActive;
          loupeBtn.classList.toggle("active", this.loupeActive);
          if (this.loupeLens) this.loupeLens.classList.toggle("active", this.loupeActive);
        };
      }

      // Wheel Zoom on Canvas Container
      if (this.canvasContainer) {
        this.canvasContainer.addEventListener("wheel", (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.1 : -0.1;
            this.setZoom(this.zoomScale + delta);
          }
        }, { passive: false });
      }
    }

    _initLoupe() {
      if (typeof document === "undefined" || !this.canvasContainer) return;

      const updateLoupeAt = (clientX, clientY) => {
        if (!this.loupeActive || !this.loupeLens || !this.loupeCtx) return;
        const rect = this.canvasContainer.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        this.loupeLens.style.left = `${mouseX}px`;
        this.loupeLens.style.top = `${mouseY}px`;

        const activeCanvas = this.canvasHost ? this.canvasHost.querySelector("canvas") : null;
        if (!activeCanvas) return;

        const R = this.loupeRadius; // 120
        const z = this.loupeZoom;   // 3.75
        const srcW = (R * 2) / z;
        const srcH = (R * 2) / z;
        const srcX = mouseX - srcW / 2;
        const srcY = mouseY - srcH / 2;

        this.loupeCtx.clearRect(0, 0, 240, 240);
        this.loupeCtx.save();
        this.loupeCtx.beginPath();
        this.loupeCtx.arc(120, 120, 118, 0, Math.PI * 2);
        this.loupeCtx.clip();
        this.loupeCtx.imageSmoothingEnabled = false;

        try {
          this.loupeCtx.drawImage(activeCanvas, srcX, srcY, srcW, srcH, 0, 0, 240, 240);
        } catch (err) {}

        // Precision Reticle Crosshairs
        this.loupeCtx.strokeStyle = this.theme.accent;
        this.loupeCtx.lineWidth = 1.4;
        this.loupeCtx.beginPath();
        this.loupeCtx.moveTo(20, 120); this.loupeCtx.lineTo(112, 120);
        this.loupeCtx.moveTo(128, 120); this.loupeCtx.lineTo(220, 120);
        this.loupeCtx.moveTo(120, 20); this.loupeCtx.lineTo(120, 112);
        this.loupeCtx.moveTo(120, 128); this.loupeCtx.lineTo(120, 220);
        this.loupeCtx.arc(120, 120, 8, 0, Math.PI * 2);
        this.loupeCtx.stroke();
        this.loupeCtx.restore();
      };

      this.canvasContainer.addEventListener("pointermove", (e) => {
        updateLoupeAt(e.clientX, e.clientY);
      });
    }

    _setupHostBridge() {
      if (typeof window === "undefined") return;
      window.addEventListener("message", (e) => {
        if (!e.data || typeof e.data !== "object") return;
        if (e.data.type === "HOST_FRAME_DATA") {
          if (typeof e.data.theme === "string") {
            const shouldBeDark = (e.data.theme === "dark");
            if (this.isDark !== shouldBeDark) {
              this.isDark = shouldBeDark;
              const themeBtn = document.getElementById("sim-theme-btn");
              if (themeBtn) themeBtn.innerHTML = this.isDark ? ICONS.sun : ICONS.moon;
              this._syncTheme();
              this._updateAllSliderFills();
            }
          }
        }
      });

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "SIM_READY" }, "*");
        }
      } catch (err) {}
    }

    _updateSliderFill(slider) {
      if (!slider) return;
      const min = parseFloat(slider.min || 0);
      const max = parseFloat(slider.max || 100);
      const val = parseFloat(slider.value);
      const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
      slider.style.background = `linear-gradient(to right, var(--adw-scale-track-fill) 0%, var(--adw-scale-track-fill) ${pct}%, var(--adw-scale-track-bg) ${pct}%, var(--adw-scale-track-bg) 100%)`;
    }

    _updateAllSliderFills() {
      if (typeof document === "undefined") return;
      this.slidersConfig.forEach((s) => {
        const slider = document.getElementById(`slider-${s.id}`);
        if (slider) this._updateSliderFill(slider);
      });
    }

    _syncTheme() {
      if (typeof document !== "undefined" && document.body) {
        if (!this.isDark) {
          document.body.classList.add("light-theme");
        } else {
          document.body.classList.remove("light-theme");
        }
      }
      this.theme = {
        isDark: this.isDark,
        isLightTheme: !this.isDark,
        canvasBg: this.isDark ? "#18181b" : "#ffffff",
        text: this.isDark ? "#fcfcfc" : "#0f172a",
        subtitle: this.isDark ? "#a1a1aa" : "#475569",
        accent: this.isDark ? "#38bdf8" : "#0047ba",
        grid: this.isDark ? "#27272a" : "#e2e8f0",
        border: this.isDark ? "rgba(255,255,255,0.12)" : "#cfcfd6",
        gold: this.isDark ? "#ffd700" : "#b45309",
        emerald: this.isDark ? "#00ff88" : "#059669",
        coral: this.isDark ? "#ff3366" : "#dc2626"
      };
      this.listeners.themeChange.forEach((fn) => fn(this.theme));
    }

    setZoom(scale) {
      this.zoomScale = Math.max(0.5, Math.min(3.0, Number(scale.toFixed(2))));
      const text = document.getElementById("sim-zoom-text");
      if (text) text.textContent = `${Math.round(this.zoomScale * 100)}%`;
      this.listeners.zoomChange.forEach((fn) => fn(this.zoomScale, this.panOffset));
    }

    resetZoom() {
      this.zoomScale = 1.0;
      this.panOffset = { x: 0, y: 0 };
      const text = document.getElementById("sim-zoom-text");
      if (text) text.textContent = "100%";
      this.listeners.zoomChange.forEach((fn) => fn(this.zoomScale, this.panOffset));
    }

    get width() {
      return this.canvasContainer ? this.canvasContainer.clientWidth : (typeof window !== "undefined" ? window.innerWidth : 800);
    }

    get height() {
      return this.canvasContainer ? this.canvasContainer.clientHeight : (typeof window !== "undefined" ? window.innerHeight : 500);
    }

    get(id) {
      return this.values[id];
    }

    set(id, val) {
      this.values[id] = val;
      if (typeof document !== "undefined") {
        const slider = document.getElementById(`slider-${id}`);
        const toggle = document.getElementById(`toggle-${id}`);
        const badge = document.getElementById(`badge-${id}`);
        if (slider) {
          slider.value = val;
          const config = this.slidersConfig.find((s) => s.id === id);
          const unitStr = config && config.unit ? ` ${config.unit}` : "";
          if (badge) badge.textContent = `${val}${unitStr}`;
          this._updateSliderFill(slider);
        }
        if (toggle) toggle.checked = Boolean(val);
      }
      this.listeners.controlChange.forEach((fn) => fn(id, val));
    }

    applyPreset(presetMap) {
      Object.keys(presetMap).forEach((id) => {
        this.set(id, presetMap[id]);
      });
    }

    setHud(keyOrMap, maybeVal) {
      if (typeof keyOrMap === "object" && keyOrMap !== null) {
        Object.keys(keyOrMap).forEach((k) => {
          this._updateHudItem(k, keyOrMap[k]);
        });
      } else if (typeof keyOrMap === "string") {
        this._updateHudItem(keyOrMap, maybeVal);
      }
    }

    _updateHudItem(key, val) {
      let item = this.hudElements[key];
      if (!item && typeof document !== "undefined") {
        const hud = document.getElementById("sim-hud-overlay");
        if (hud) {
          item = document.createElement("div");
          item.className = "hud-item";
          item.id = `hud-${key}`;
          hud.appendChild(item);
          this.hudElements[key] = item;
        }
      }
      if (item) {
        item.textContent = `${key.toUpperCase()}: ${val}`;
      }
    }

    onPlayChange(fn) { this.listeners.playChange.push(fn); }
    onReset(fn) { this.listeners.reset.push(fn); }
    onSpeedChange(fn) { this.listeners.speedChange.push(fn); }
    onControlChange(fn) { this.listeners.controlChange.push(fn); }
    onResize(fn) { this.listeners.resize.push(fn); }
    onThemeChange(fn) { this.listeners.themeChange.push(fn); }
    onZoomChange(fn) { this.listeners.zoomChange.push(fn); }
  }

  SekharSimUI.LabelManager = LabelOcclusionManager;
  return SekharSimUI;
});
