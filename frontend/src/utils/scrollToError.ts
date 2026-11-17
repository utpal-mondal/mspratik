export const scrollToFirstError = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>("[data-field-error]");
      if (!el) return;

      const section = el.closest<HTMLElement>(
        '[class*="rounded-lg"], [class*="rounded-md"]'
      );
      const target =
        section && section.offsetHeight < window.innerHeight
          ? section
          : el.parentElement ?? el;

      target.style.scrollMarginTop = "90px";
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
};
