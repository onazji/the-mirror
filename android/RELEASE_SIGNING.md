# Mirror Android release signing

Mirror uses Google Play App Signing with a separate developer-controlled upload key. Google Play will hold the production app-signing key; the local key documented here is only for authenticating uploads.

## Upload key identity

- Keystore: `%USERPROFILE%\.mirror-signing\mirror-upload.jks`
- Alias: `mirror-upload`
- Created: October 7, 2026
- Valid: October 7, 2026 through February 22, 2054
- Certificate subject: `CN=The Mirror Upload Key, OU=Android Release, O=The Mirror, C=US`
- Key: 4096-bit RSA
- Signature algorithm: SHA256withRSA
- SHA-256: `6B:48:EA:10:F9:60:AA:BA:FD:27:2C:0C:F4:94:4F:65:F9:7A:82:0B:BA:53:C0:52:F5:8A:D2:CD:78:ED:E3:CA`

The private keystore and both passwords must never be added to this repository. The keystore has an offline backup on the Pandora Box removable drive. Keep the keystore backup and password-manager records separate where practical.

## Gradle inputs

`android/app/build.gradle` reads release credentials from four process-scoped environment variables:

- `MIRROR_RELEASE_STORE_FILE`
- `MIRROR_RELEASE_STORE_PASSWORD`
- `MIRROR_RELEASE_KEY_ALIAS`
- `MIRROR_RELEASE_KEY_PASSWORD`

Use an interactive local script or terminal prompt so the password values do not enter source files, command history, build logs, or chat. Clear the variables after the Gradle process exits.

The repository ignores common keystore, private-key, and signing-property file extensions. Before every release, still verify that no credential file is staged.

## Release build

From the repository root:

1. Run `npm test`.
2. Run `npm run build`.
3. Run `npx cap sync android` when the web build or native configuration changed.
4. Set the four signing variables only in the current local process.
5. Run `android\gradlew.bat -p android :app:bundleRelease`.
6. Clear the signing variables.

The signed bundle is written to:

`android/app/build/outputs/bundle/release/app-release.aab`

Verify the bundle certificate after every release and confirm that its SHA-256 fingerprint matches the upload certificate above.

## Current release baseline

- Package: `com.themirror.app`
- Version code: `1`
- Version name: `1.0`
- Minimum SDK: 24
- Target SDK: 36
- INTERNET permission: absent
- VIBRATE permission: intentional
- Android backup: disabled
- Cloud backup and device-to-device transfer: excluded

## Physical-device caution

The current Blackview development installation is signed with Android's debug certificate. A release APK signed with the upload key cannot update that installation in place. Do not uninstall or replace it until its local reflection data is no longer needed or a deliberate migration/export procedure exists. Use a separate test device for release-signed physical validation.
