import DOMPurify from "isomorphic-dompurify";
import { deepFreeze } from "./deep-freeze";

// configuring dompurify to allow `iframe` tags
DOMPurify.addHook("uponSanitizeElement", (node: any, data) => {
  if (data.tagName !== "iframe") return;

  const src = node.getAttribute("src") || "";
  if (!src.startsWith("https://www.youtube.com/embed/"))
    return node.parentNode.removeChild(node);
});

const sanitizeOptions = deepFreeze({
  ADD_TAGS: ["iframe"],
  USE_PROFILES: { html: true },
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
});

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, sanitizeOptions).trim();
}
