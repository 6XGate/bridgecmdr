- [x] Add system to ktor client interactions to determine is a continuous series of failure are occurring, and return to
      the scanning view.
- [x] Implement the double click/tap shutdown.
- [x] Implement the device power off.
- [x] macOS is POSIX, and while iOS could be too, it ain't from an app standpoint, right?
- [x] TypeScript version should be able to migrate its button order and settings to the SQLite store.
- [x] Kotlin version should be able to migrate it settings from the SQLite store.
- [x] Need to add v4 import format to v2.3.0 (TypeScript) to remove order and add buttonOrder setting.
- [x] Allow settings import from import functionality, will be similar objects to legacy settings.
- [x] Database migration system for v3, at least supporting the SQLite migration set.
- [x] Migrate the first-run state to the database in v2.3.0, so that v3 can start in the same place.
- [ ] v3 needs the first-start flow. (Auto-start question mainly)
- [ ] Depending on deployment, determine how updates will work, and how auto-start will work.
- [ ] Deployment setup for Kotlin desktop version.
- [ ] Fix the momentary flash of "Unknown error" when dismissing an error modal.
- [ ] Don't ignore the 500 server error as a troubling status code.
- [ ] Release v2.3.0 of TypeScript version.
- [ ] Need short snackbar to show when clicking the Power off button with double-tap enabled.
- [ ] Need an interface flow to explain the mobile remote control apps from the server code view. Maybe the first time
      the code view is opened. Maybe even a link to show the information again. QR Codes to the app stores would be
      nice.
