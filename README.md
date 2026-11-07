# Application Autofill

A Chrome extension for reusing your profile in project and grant applications. Preview matches, edit or uncheck individual answers, then fill the selected fields. Profile data is stored locally by Chrome. The extension makes no API calls and does not submit forms.

## Install locally

1. Extract the ZIP.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** and click **Load unpacked**.
4. Select the extracted folder containing `manifest.json`.

## Try the demo

Open PowerShell in the extracted folder and run:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory demo
```

Open `http://127.0.0.1:8765` in Chrome. Click **Application Autofill** from Chrome's extensions menu. Add fictional details and click **Save profile**, then **Preview matches**. Edit or uncheck an answer and click **Fill checked fields**. The usage question stays blank. Press Ctrl+C in PowerShell to stop the demo server.

## Scope

This version uses a fixed list of known labels and reuses saved values. It does not generate answers. It handles empty text inputs and text areas in the main page. Dropdowns, embedded frames, shadow DOM, and browser settings pages are outside the initial scope. Existing values are skipped. After filling, review the answers on the page before submitting.

## Test the label matcher

```sh
node --test tests/matcher.test.mjs
```
