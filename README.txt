COGNITIVE MIRROR — DEPLOYMENT PREPARATION

1. Keep index.html at the root of the deployment folder.
2. This is a standalone HTML export with embedded CSS and JavaScript.
3. The non-AI interface, canvas effects, themes, navigation, games, and browser-local progress are implemented in the page.
4. AI-dependent features still call Claude's Artifact-only runtime (claude.use("sample")); they need to be redirected to a secure server-side API before they will work on an ordinary public host.
5. Do not put an AI provider API key in index.html or any other browser-visible file.
6. User progress is stored in each visitor's browser localStorage; it is not shared or synchronized between friends/devices.

This package preserves the original exported HTML unchanged. It is a starting point, not the finished hybrid AI deployment.
