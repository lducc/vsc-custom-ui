(() => {
  "use strict";

  const WORKBENCH_SELECTOR = ".monaco-workbench";
  const QUICK_INPUT_SELECTOR = ".quick-input-widget";
  const OPEN_CLASS = "custom-command-palette-open";
  const OVERLAY_ID = "command-blur";

  let workbench;
  let quickInput;
  let quickInputObserver;

  function showBlur() {
    workbench?.classList.add(OPEN_CLASS);
  }

  function hideBlur() {
    workbench?.classList.remove(OPEN_CLASS);
  }

  function ensureOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    workbench.appendChild(overlay);
  }

  function syncFromQuickInput() {
    if (!quickInput?.isConnected) {
      quickInputObserver?.disconnect();
      quickInputObserver = undefined;
      quickInput = undefined;
      hideBlur();
      return;
    }

    const hidden =
      quickInput.hidden ||
      quickInput.style.display === "none" ||
      quickInput.getAttribute("aria-hidden") === "true";

    if (hidden) hideBlur();
    else showBlur();
  }

  function bindQuickInput() {
    const current = document.querySelector(QUICK_INPUT_SELECTOR);

    if (!current || current === quickInput) return Boolean(current);

    quickInputObserver?.disconnect();
    quickInput = current;

    quickInputObserver = new MutationObserver(syncFromQuickInput);
    quickInputObserver.observe(quickInput, {
      attributes: true,
      attributeFilter: ["style", "hidden", "aria-hidden"]
    });

    syncFromQuickInput();
    return true;
  }

  function openPalette() {
    showBlur();

    if (!bindQuickInput()) {
      setTimeout(bindQuickInput, 0);
      setTimeout(bindQuickInput, 60);
    }
  }

  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    const modifier = event.ctrlKey || event.metaKey;

    const commandPalette =
      modifier && event.shiftKey && key === "p";

    const quickOpen =
      modifier &&
      !event.shiftKey &&
      (key === "p" || key === "e");

    if (commandPalette || quickOpen || key === "f1") {
      openPalette();
      return;
    }

    if (
      workbench.classList.contains(OPEN_CLASS) &&
      (key === "escape" || key === "enter")
    ) {
      setTimeout(syncFromQuickInput, 0);
    }
  }

  function initialize() {
    workbench = document.querySelector(WORKBENCH_SELECTOR);

    if (!workbench) {
      setTimeout(initialize, 100);
      return;
    }

    ensureOverlay();
    bindQuickInput();

    document.addEventListener("keydown", handleKeydown, true);

    document.addEventListener(
      "click",
      () => {
        if (workbench.classList.contains(OPEN_CLASS)) {
          setTimeout(syncFromQuickInput, 0);
        }
      },
      true
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hideBlur();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
