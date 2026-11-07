export function interactWithPage(operation, selected) {
  const storeKey = "__applicationAutofillPreview";
  const supportedTypes = ["text", "email", "url", "search"];
  const labels = (field) => [
    Array.from(field.labels ?? [], (label) => label.textContent).join(" "),
    (field.getAttribute("aria-labelledby") ?? "").split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "").join(" "),
    field.getAttribute("aria-label") ?? "",
    field.placeholder,
    field.name,
  ];
  const eligible = (field) => field.isConnected &&
    (field instanceof HTMLTextAreaElement || supportedTypes.includes(field.type)) &&
    !field.matches(":disabled, [readonly], [hidden], [aria-hidden=true]") &&
    !field.closest("[hidden], [aria-hidden=true], [inert]") &&
    field.getClientRects().length > 0 && getComputedStyle(field).visibility === "visible" &&
    !field.value;
  if (operation === "scan") {
    const token = crypto.randomUUID();
    const fields = Array.from(document.querySelectorAll("input, textarea"))
      .filter(eligible).map((field) => ({ field, labels: labels(field) }));
    globalThis[storeKey] = { token, fields };
    return { token, labels: fields.map((item) => item.labels) };
  }

  const preview = globalThis[storeKey];
  if (!preview || preview.token !== selected.token) return null;
  delete globalThis[storeKey];
  let filled = 0;
  for (const { index, value } of selected.entries) {
    const item = preview.fields[index];
    if (!item || !eligible(item.field) ||
        JSON.stringify(labels(item.field)) !== JSON.stringify(item.labels)) continue;
    const field = item.field;
    if (field.maxLength >= 0 && value.length > field.maxLength) continue;
    const prototype = field instanceof HTMLTextAreaElement ?
      HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    if (field.value === value) filled += 1;
  }
  return filled;
}
