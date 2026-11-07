import { matchField } from "./matcher.js";
import { interactWithPage } from "./page.js";

const form = document.querySelector("#profile");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const scan = document.querySelector("#scan");
const apply = document.querySelector("#apply");
const save = form.querySelector("button");
let profile = {};
let preview;
let busy = false;

function clearPreview() {
  preview = undefined;
  results.replaceChildren();
  apply.hidden = true;
}

async function run(action) {
  if (busy) return;
  busy = scan.disabled = apply.disabled = save.disabled = true;
  status.textContent = "";
  try {
    await action();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    busy = scan.disabled = apply.disabled = save.disabled = false;
  }
}

async function interact(target, operation, selected = null) {
  const [response] = await chrome.scripting.executeScript({
    target, func: interactWithPage, args: [operation, selected],
  });
  return response;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  run(async () => {
    const next = Object.fromEntries(
      Array.from(new FormData(form), ([key, value]) => [key, value.trim()])
    );
    await chrome.storage.local.set({ profile: next });
    profile = next;
    clearPreview();
    status.textContent = "Profile saved in this browser.";
  });
});

scan.addEventListener("click", () => run(async () => {
  clearPreview();
  if (!Object.values(profile).some(Boolean)) {
    status.textContent = "Save at least one profile value first.";
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let response;
  try {
    response = await interact({ tabId: tab.id }, "scan");
  } catch {
    status.textContent = "Open an application form on a regular web page and try again.";
    return;
  }
  const entries = [];
  response.result.labels.forEach((labels, index) => {
    const value = profile[matchField(labels)];
    if (!value) return;
    const row = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    row.append(checkbox, " " + labels.find((label) => label.trim()));
    const editor = document.createElement("textarea");
    editor.rows = value.includes("\n") ? 3 : 1;
    editor.value = value;
    row.append(editor);
    results.append(row);
    entries.push({ index, checkbox, editor });
  });
  if (!entries.length) {
    status.textContent = "No empty fields matched your saved profile.";
    return;
  }
  preview = { tabId: tab.id, documentId: response.documentId,
    token: response.result.token, entries };
  apply.hidden = false;
}));

apply.addEventListener("click", () => run(async () => {
  if (!preview) return;
  const { tabId, documentId, token, entries } = preview;
  const selected = entries.filter(({ checkbox, editor }) => checkbox.checked && editor.value.trim())
    .map(({ index, editor }) => ({ index, value: editor.value }));
  if (!selected.length) {
    status.textContent = "Choose at least one field with an answer.";
    return;
  }
  clearPreview();
  let response;
  try {
    response = await interact({ tabId, documentIds: [documentId] }, "fill", { token, entries: selected });
  } catch {
    status.textContent = "The page changed. Preview the form again.";
    return;
  }
  const filled = response.result;
  status.textContent = filled == null ? "Preview expired. Scan the page again." :
    `Filled ${filled} of ${selected.length} selected fields. Review the form before submitting.`;
}));

await run(async () => {
  ({ profile = {} } = await chrome.storage.local.get("profile"));
  for (const [key, value] of Object.entries(profile)) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
});
