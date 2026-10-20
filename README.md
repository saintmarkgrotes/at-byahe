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

Trip status follows calendar dates. Reviewed days are marked manually, separately from individual activity checkboxes; changing a plan clears its reviewed-day marker. The weather placeholder is hidden until implemented.

## Offline maps

In Itinerary → Map, select the destination or a planned stop, tap **Find area to download**, and choose the matching place while connected. After **Available offline** appears, its street map can be reopened, panned, and zoomed without a connection, including after restarting the native app. Download each stop separately before traveling. **Update map** refreshes a saved area online; **Remove download** frees its storage.

The area picker lets you edit the place search and requests up to ten matches. Search by town, landmark, or full address, including the city/country when necessary. The selected area remains associated with the original itinerary location; searching does not rename your trip or remove its existing download. Google Maps downloads are separate and do not add places or coverage to this picker; use **Open in Google Maps** to open that app.

Each area covers approximately 3 × 3 km around the selected result. These simplified maps show mapped streets, street names, waterways, and simple park/water polygons. They do not include satellite imagery, turn-by-turn navigation, live location, or an entire city. Areas crossing the date line and polar locations are not supported. The Google Maps link opens a separate app/site and is not part of the offline download.

Maps use the existing AsyncStorage database, independently of trip records. They are shared by matching location names and retained until explicitly removed or app/browser data is cleared. Storage failures preserve an existing download and do not display a false saved status. In the web app, saved maps work without network once the app is open; loading the web app itself from a cold offline browser is not supported (there is no service worker).

Downloads use [Photon](https://github.com/komoot/photon) place search and [Overpass](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html) for small, user-requested extracts of [OpenStreetMap data (ODbL)](https://www.openstreetmap.org/copyright). There is no tile prefetching and no requests while viewing saved maps. Public services have limited capacity and may be unavailable; larger deployments should host their own endpoints. Configure `EXPO_PUBLIC_PHOTON_URL` (search endpoint) and `EXPO_PUBLIC_OVERPASS_URL` (interpreter endpoint) before building to use other compatible services.

## Checks

```sh
npm test
npm run lint
npx expo export --platform all
```

For device verification: create an empty trip, add plans on multiple dates, edit and delete plans, pack/rename items, switch trips, edit trip dates, add notes/name, close and reopen the app, and delete the selected trip. Test keyboard behavior and date/time pickers on both Android and iOS.

For offline map verification: download a destination, enable airplane mode, restart the native app, and open the same Map tab. Verify streets/names, zoom/drag/reset, and switching to another saved stop. An unsaved stop should offer a download, with a connection error if attempted offline; a failed refresh should keep the previous map. Remove a download and verify other maps and trip records remain.
