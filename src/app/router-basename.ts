/** Aligns with Vite `base` — React Router `basename` for HTML5 history on a subpath. */
const trimmed = import.meta.env.BASE_URL.replace(/\/$/, "");
export const routerBasename = trimmed.length > 0 ? trimmed : undefined;
