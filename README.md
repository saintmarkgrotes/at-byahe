# At Byahe

An offline travel planner built with Expo SDK 57, React Native, and NativeWind. No account, server, or API keys are required.

## Run

Use Node 22.13 or newer (Node 24 works).

```sh
npm install
npm start
npm run android
npm run ios
npm run web
```

Android/iOS require an emulator, simulator, or a compatible Expo Go/development build. iOS simulators require macOS.

## Local data

Trips, plans, packing lists, notes, and your first name are saved with AsyncStorage on the current device/browser. Data loads before editing is enabled. Failed reads do not overwrite existing data; failed saves show a retry action. Data is not synced or backed up remotely. Uninstalling the app or clearing app/browser data removes it.

Select a trip from Home or use the trip switcher in Itinerary/Packing. Add plans to any day within the trip dates. To shorten trip dates, first move or delete any plans outside the new range. Deleting a trip removes its plans, notes, packing list, and reviewed-day progress.

Trip status follows calendar dates. Reviewed days are marked manually, separately from individual activity checkboxes; changing a plan clears its reviewed-day marker. The Map and weather placeholders are hidden until those features are implemented.

## Checks

```sh
npm test
npm run lint
npx expo export --platform all
```

For device verification: create an empty trip, add plans on multiple dates, edit and delete plans, pack/rename items, switch trips, edit trip dates, add notes/name, close and reopen the app, and delete the selected trip. Test keyboard behavior and date/time pickers on both Android and iOS.
