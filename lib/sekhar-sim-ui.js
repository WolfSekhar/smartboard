/**
 * Sekhar Teaching Hub — Unified Simulation HUD & GUI Engine (SekharSimUI)
 * Version: 1.0.0
 * Standard: GTK4 / Libadwaita Zero-Radius Design System (GNOME 45+ HIG)
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
      /* Adwaita Dark */
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
      --adw-hud-bg: rgba(24, 24, 27, 0.92);
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
      --adw-accent-badge-bg: rgba(0, 71, 186, 0.1);
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
      --adw-hud-bg: rgba(255, 255, 255, 0.95);
      --adw-hud-border: #cbd5e1;
    }

    html, body {
      width: 100%; height: 100%; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none; -webkit-user-select: none;
    }

    .sim-layout {
      display: flex; width: 100%; height: 100%;
      gap: 8px; padding: 8px; background: var(--adw-window-bg);
    }

    .controls-panel {
      width: 270px; min-width: 270px; max-width: 270px; flex: 0 0 270px;
      display: flex; flex-direction: column; gap: 8px;
      background: var(--adw-sidebar-bg); border: 1px solid var(--adw-sidebar-border);
      padding: 10px; overflow-y: auto; scrollbar-width: thin;
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
      display: flex; align-items: center; justify-content: center; gap: 4px;
      transition: background-color 0.15s ease;
    }
    .adw-btn-primary { background: var(--adw-btn-primary-bg); color: var(--adw-btn-primary-text); flex: 2; border: none; }
    .adw-btn-sec { background: var(--adw-btn-sec-bg); color: var(--adw-btn-sec-text); flex: 1; }

    .adw-action-row {
      background: var(--adw-card-bg); border: 1px solid var(--adw-card-border);
      padding: 8px; display: flex; flex-direction: column; gap: 4px;
    }
    .row-header { display: flex; justify-content: space-between; align-items: center; }
    .row-title { font-size: 11px; font-weight: 500; color: var(--adw-text-color); }
    .adw-value-badge {
      font-size: 11px; font-weight: 500; font-family: monospace;
      color: var(--adw-accent-badge-text); background: var(--adw-accent-badge-bg);
      padding: 2px 6px;
    }
    .adw-scale-slider {
      width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
      background: var(--adw-scale-track-bg); outline: none; cursor: pointer; margin: 4px 0;
    }
    .adw-scale-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 16px; height: 16px;
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

    .canvas-container {
      flex: 1; height: 100%; position: relative;
      background: var(--adw-canvas-bg); border: 1px solid var(--adw-canvas-border);
      overflow: hidden; min-width: 0;
    }
    .sim-canvas-host { width: 100%; height: 100%; }

    .hud-overlay {
      position: absolute; top: 12px; right: 12px;
      background: var(--adw-hud-bg); border: 1px solid var(--adw-hud-border);
      padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; pointer-events: none;
    }
    .hud-item {
      font-size: 11.5px; font-weight: 400; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: var(--adw-text-color); white-space: nowrap;
    }
    .hud-item-label { color: var(--adw-subtitle-color); margin-right: 6px; }

    @media (max-width: 680px) {
      .sim-layout { flex-direction: column; }
      .controls-panel { width: 100%; min-width: 100%; max-width: 100%; flex: 0 0 auto; max-height: 40%; }
    }
  `;

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
      
      this.values = {};
      this.hudElements = {};
      this.listeners = {
        playChange: [],
        reset: [],
        speedChange: [],
        controlChange: [],
        resize: [],
        themeChange: []
      };

      if (options.onPlayChange) this.listeners.playChange.push(options.onPlayChange);
      if (options.onReset) this.listeners.reset.push(options.onReset);
      if (options.onSpeedChange) this.listeners.speedChange.push(options.onSpeedChange);
      if (options.onControlChange) this.listeners.controlChange.push(options.onControlChange);
      if (options.onResize) this.listeners.resize.push(options.onResize);
      if (options.onThemeChange) this.listeners.themeChange.push(options.onThemeChange);

      this._injectStyles();
      this._buildDOM();
      this._bindEvents();
      this._syncTheme();
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

      // Left Sidebar
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
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>
      `;
      sidebar.appendChild(headerBar);

      // Playback Deck
      const deckCard = document.createElement("div");
      deckCard.className = "adw-deck-card";
      deckCard.innerHTML = `
        <div class="deck-btn-row">
          <button class="adw-btn adw-btn-primary" id="sim-play-btn">▶ Play</button>
          <button class="adw-btn adw-btn-sec" id="sim-reset-btn">↺ Reset</button>
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

      // Toggles
      if (this.togglesConfig.length > 0) {
        const toggleCard = document.createElement("div");
        toggleCard.className = "adw-action-row";
        this.togglesConfig.forEach((t) => {
          this.values[t.id] = t.checked !== false;
          const row = document.createElement("label");
          row.className = "switch-row";
          row.innerHTML = `
            <span>${t.label}</span>
            <input type="checkbox" id="toggle-${t.id}" ${this.values[t.id] ? "checked" : ""}>
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

      // Right Canvas Stage
      const canvasContainer = document.createElement("div");
      canvasContainer.className = "canvas-container";
      canvasContainer.id = "sim-canvas-container";

      const host = document.createElement("div");
      host.className = "sim-canvas-host";
      host.id = "sim-canvas-host";
      canvasContainer.appendChild(host);

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

      this.canvasHost = host;
      this.canvasContainer = canvasContainer;
    }

    _bindEvents() {
      if (typeof document === "undefined") return;

      // Play / Pause Toggle
      const playBtn = document.getElementById("sim-play-btn");
      if (playBtn) {
        playBtn.onclick = () => {
          this.isRunning = !this.isRunning;
          playBtn.textContent = this.isRunning ? "❚❚ Pause" : "▶ Play";
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

      // Sliders
      this.slidersConfig.forEach((s) => {
        const slider = document.getElementById(`slider-${s.id}`);
        const badge = document.getElementById(`badge-${s.id}`);
        if (slider) {
          slider.oninput = (e) => {
            const val = parseFloat(e.target.value);
            this.values[s.id] = val;
            const unitStr = s.unit ? ` ${s.unit}` : "";
            if (badge) badge.textContent = `${val}${unitStr}`;
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
          this._syncTheme();
        };
      }

      // Window Resize Dispatcher
      if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("resize", () => {
          this.listeners.resize.forEach((fn) => fn(this.width, this.height));
        });
      }
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
  }

  return SekharSimUI;
});
