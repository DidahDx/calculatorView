// Runs before page styles. Only this presentation preference is persisted.
(() => {
  const key = "kenya-paye-calculator:theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const normalize = (value) =>
    value === "light" || value === "dark" ? value : "system";
  const read = () => {
    try {
      return normalize(localStorage.getItem(key));
    } catch {
      return "system";
    }
  };
  let preference = read();
  function apply() {
    const resolved =
      preference === "system"
        ? system.matches
          ? "dark"
          : "light"
        : preference;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === "dark" ? "#101713" : "#f5f4ef";
    document
      .querySelectorAll("select[data-theme-control]")
      .forEach((select) => {
        select.value = preference;
      });
    document.dispatchEvent(new Event("paye-theme-change"));
  }
  function choose(value) {
    preference = normalize(value);
    try {
      if (preference === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, preference);
    } catch {
      /* The choice still works for this page when storage is blocked. */
    }
    apply();
  }
  function requested(event) {
    choose(event.detail);
  }
  function changed(event) {
    if (
      event.target instanceof HTMLSelectElement &&
      event.target.hasAttribute("data-theme-control")
    )
      choose(event.target.value);
  }
  function stored(event) {
    if (event.key === key || event.key === null) {
      preference = read();
      apply();
    }
  }
  function systemChanged() {
    if (preference === "system") apply();
  }
  let controller;
  function connect() {
    controller?.abort();
    controller = new AbortController();
    const options = { signal: controller.signal };
    document.addEventListener("paye-theme-request", requested, options);
    document.addEventListener("change", changed, options);
    window.addEventListener("storage", stored, options);
    system.addEventListener("change", systemChanged, options);
    apply();
  }
  window.addEventListener("pagehide", () => controller?.abort());
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      preference = read();
      connect();
    }
  });
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  connect();
})();
