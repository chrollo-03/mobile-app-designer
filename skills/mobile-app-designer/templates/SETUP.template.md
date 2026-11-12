# What to install

Keep only the section for the chosen stack.

## Android (Kotlin + Compose)

- **Easiest:** Android Studio (<https://developer.android.com/studio>), includes the SDK, platform
  tools and a JDK. Set `ANDROID_HOME` to the SDK path it shows.
- **Command line:** JDK 17 (Temurin), Android command-line tools, then
  `sdkmanager --licenses` and `sdkmanager "platform-tools" "platforms;android-<N>" "build-tools;<N>.0.0"`.
  The project's Gradle wrapper (`./gradlew`) downloads Gradle itself.
- **Phone:** Settings → About phone → tap Build number 7× → Developer options → USB debugging on →
  plug in → accept the prompt → `adb devices` shows `device`. Linux "no permissions": install
  `android-udev-rules`.
- Build and install: `./gradlew installDebug`. Screenshot: `adb exec-out screencap -p > shot.png`.

## iOS (SwiftUI)

- A Mac with Xcode from the App Store; open once to install components.
- Phone: connect, trust the computer, enable Developer Mode (Settings → Privacy & Security), sign
  with a free Apple ID team in Xcode.
- Simulator screenshots: `xcrun simctl io booted screenshot shot.png`.

## Flutter

- Flutter SDK (<https://docs.flutter.dev/get-started/install>), plus Android Studio or Xcode for the
  platform toolchains. `flutter doctor` lists what's missing.

## Fonts

<List the fonts from DESIGN-TOKENS.md with their source (e.g. Google Fonts, SIL OFL) and where they
go in the project.>

## Libraries

| Library | Why |
|---|---|
| <name> | <purpose> |

Use the latest stable versions.

## Optional

- FigCraft, to open `design/<App>.figcraft` and click through the prototype (every screen is also a PNG).
- Python 3, to run reference tests: `cd reference && python3 <tests>.py`.
