"use client";

/**
 * GlobalNav — sticky top bar with product name, read-only project chip,
 * and a settings menu.
 *
 * The project chip is intentionally read-only this phase (decision Q5 / B3):
 * multi-project management is deferred. The chip shows the current
 * `config.projectName` (fallback: "Untitled program") so the user always
 * knows which scenario they are looking at when switching tabs.
 *
 * The settings popover hosts the operations that used to live in the old
 * workspace header: loading the pilot sample, clearing saved state, and
 * (later, Phase E) opening the glossary.
 *
 * © Yanhao FU
 */

import { useEffect, useRef, useState } from "react";

import { pilotMY2027BEV } from "../../../fixtures/pilot-my2027-bev";
import { useAppShellStore } from "@/state/app-shell-store";

export function GlobalNav() {
  const projectName = useAppShellStore((state) => state.config.projectName);
  const setConfig = useAppShellStore((state) => state.setConfig);
  const clearSavedState = useAppShellStore((state) => state.clearSavedState);
  const resetOnboarding = useAppShellStore((state) => state.resetOnboarding);

  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or ESC.
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointer(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleLoadSample = () => {
    setConfig(pilotMY2027BEV);
    setMenuOpen(false);
  };

  const handleClear = () => {
    clearSavedState();
    resetOnboarding();
    setMenuOpen(false);
  };

  return (
    <div className="global-nav" ref={rootRef}>
      <div className="global-nav-brand">
        <span className="global-nav-logo" aria-hidden="true">
          EVCN
        </span>
        <span className="global-nav-title">EU Compliance Navigator</span>
      </div>
      <div className="global-nav-project" aria-label="Current project">
        <span className="global-nav-project-label">Project:</span>
        <span className="global-nav-project-name">
          {projectName || "Untitled program"}
        </span>
      </div>
      <div className="global-nav-actions">
        <button
          type="button"
          className="global-nav-settings-button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open settings menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span aria-hidden="true">⚙</span>
        </button>
        {menuOpen ? (
          <div role="menu" className="global-nav-menu">
            <button
              type="button"
              role="menuitem"
              className="global-nav-menu-item"
              onClick={handleLoadSample}
            >
              Load MY2027 BEV sample
            </button>
            <button
              type="button"
              role="menuitem"
              className="global-nav-menu-item"
              onClick={handleClear}
            >
              Clear saved state
            </button>
            {/* Phase E: add Open glossary menu item */}
          </div>
        ) : null}
      </div>
    </div>
  );
}
