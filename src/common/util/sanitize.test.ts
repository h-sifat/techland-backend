import { sanitizeHTML } from "./sanitize";

it(`removes script tags`, () => {
  const html = `<script>alert(1)</script>`;
  const sanitized = sanitizeHTML(html);

  expect(sanitized.includes("<script")).toBeFalsy();
});

it(`allows iframe tags if it's from YouTube`, () => {
  const html = `<iframe width="560" height="315" src="https://www.youtube.com/embed/7d16CpWp-ok" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  const sanitized = sanitizeHTML(html);

  expect(sanitized.includes("<iframe")).toBeTruthy();
});

it(`removes iframe tags if it's not from YouTube`, () => {
  const html = `<iframe width="560" height="315" src="https://www.video.com/embed/7d16CpWp-ok" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  const sanitized = sanitizeHTML(html);

  expect(sanitized.includes("<iframe")).toBeFalsy();
});
