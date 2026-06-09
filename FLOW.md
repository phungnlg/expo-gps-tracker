# Screenshot regeneration flow

The screenshots in `screenshots/` are real captures from the iOS Simulator.

## Steps

1. Boot a simulator and open it:

   ```bash
   xcrun simctl boot "iPhone 17 Pro"
   open -a Simulator
   ```

2. Install deps and build the dev client (react-native-maps + background location
   are native modules, so Expo Go will not work):

   ```bash
   npm install
   npx expo run:ios --device "iPhone 17 Pro"
   ```

   This runs `expo prebuild` (generates `ios/`), `pod install`, builds, installs,
   and starts Metro.

3. Grant location and seed a position so the map renders:

   ```bash
   xcrun simctl privacy booted grant location com.gps.tracker.poc
   xcrun simctl location booted set 10.7769,106.7009
   xcrun simctl terminate booted com.gps.tracker.poc
   xcrun simctl launch booted com.gps.tracker.poc
   ```

4. Capture each screen:

   ```bash
   xcrun simctl io booted screenshot screenshots/01-tracking.png
   # navigate to History / Geofences tabs, then:
   xcrun simctl io booted screenshot screenshots/02-trip-history.png
   xcrun simctl io booted screenshot screenshots/03-geofences.png
   ```

## How it works

- The Trip History and Geofences stores ship with demo fallback data
  (`DEMO_TRIPS` / `DEMO_ZONES`) so the screens are populated on a fresh install
  with no recorded trips - the same data you see in the screenshots.
- iOS uses Apple Maps via `PROVIDER_DEFAULT`, so no Google Maps API key is needed
  on the simulator.
