import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText, EmptyState, Pill } from '../common';
import colors from '../../constants/colors';
import { createOfflineMapStore, downloadMapArea, findMapPlaces } from '../../maps/offlineMaps';
import OfflineMapCanvas from './OfflineMapCanvas';

const maps = createOfflineMapStore(AsyncStorage);

export default function MapPreview({ query }) {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState(query);
  const [searchedText, setSearchedText] = useState('');
  const [busy, setBusy] = useState('Loading saved map…');
  const [error, setError] = useState('');
  const operation = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    maps
      .load(query)
      .then((saved) => {
        if (active) setMap(saved);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setBusy('');
      });
    return () => {
      active = false;
      mounted.current = false;
      operation.current?.abort();
    };
  }, [query]);

  const run = async (label, action) => {
    if (operation.current || busy) return;
    const controller = new AbortController();
    operation.current = controller;
    setBusy(label);
    setError('');
    try {
      await action(controller.signal);
    } catch (err) {
      if (mounted.current && !controller.signal.aborted)
        setError(err.message || 'Could not load this map. Please try again.');
    } finally {
      if (operation.current === controller) operation.current = null;
      if (mounted.current) setBusy('');
    }
  };

  const findPlaces = () => {
    const text = searchText.trim();
    if (!text) {
      setError('Enter a place name or address to search.');
      return;
    }
    setSearchOpen(true);
    return run('Finding this location…', async (signal) => {
      setPlaces([]);
      setSearchedText(text);
      const results = await findMapPlaces(text, signal);
      if (!signal.aborted) setPlaces(results);
    });
  };

  const download = (place) =>
    run('Downloading and saving streets…', async (signal) => {
      const downloaded = await downloadMapArea(query, place, signal);
      if (signal.aborted) return;
      await maps.save(query, downloaded);
      if (mounted.current) {
        setMap(downloaded);
        setPlaces([]);
        setSearchOpen(false);
      }
    });

  return (
    <View>
      {map ? (
        <>
          <OfflineMapCanvas key={map.savedAt} map={map} />
          <AppText variant="subheading" className="mt-4">
            Available offline
          </AppText>
          <AppText variant="muted" className="mt-1">
            {map.place.label}
          </AppText>
          <AppText variant="caption" className="mt-1">
            Saved {new Date(map.savedAt).toLocaleDateString()} · Approx. 3 × 3 km
          </AppText>
          {!busy ? (
            <View className="mt-3 flex-row flex-wrap gap-3">
              <Pill label="Update map" onPress={() => download(map.place)} />
              <Pill label="Change area" onPress={findPlaces} />
              <Pill
                label="Remove download"
                onPress={() =>
                  run('Removing download…', async () => {
                    await maps.remove(query);
                    if (mounted.current) {
                      setMap(null);
                      setPlaces([]);
                      setSearchOpen(false);
                    }
                  })
                }
              />
            </View>
          ) : null}
        </>
      ) : !busy && !searchOpen ? (
        <EmptyState
          title="Save a map for offline use"
          message="Connect once to download streets around this location. Your saved map will be available here without internet."
          actionLabel="Find area to download"
          onActionPress={findPlaces}
        />
      ) : null}
      {searchOpen ? (
        <View className="mt-4 gap-3">
          <AppText variant="subheading">Search for an area</AppText>
          <TextInput
            accessibilityLabel="Map area search"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setPlaces([]);
              setSearchedText('');
              setError('');
            }}
            editable={!busy}
            onSubmitEditing={findPlaces}
            returnKeyType="search"
            placeholder="Town, landmark, or full address"
            className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 font-sans text-base text-ink"
          />
          <AppText variant="caption">
            Include the city or country for better matches. Searching needs an internet connection.
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: Boolean(busy) || !searchText.trim() }}
            disabled={Boolean(busy) || !searchText.trim()}
            onPress={findPlaces}
            className="items-center rounded-full bg-brand-500 px-4 py-3"
            style={{ opacity: busy || !searchText.trim() ? 0.5 : 1 }}
          >
            <AppText className="font-sans-semibold text-white">Search areas</AppText>
          </Pressable>
          {!busy ? (
            <Pill
              label="Cancel selection"
              onPress={() => {
                setSearchOpen(false);
                setPlaces([]);
                setError('');
              }}
            />
          ) : null}
        </View>
      ) : null}
      {busy ? (
        <View className="items-center gap-3 rounded-2xl bg-brand-50 p-6">
          <ActivityIndicator color={colors.brand[500]} />
          <AppText accessibilityLiveRegion="polite" variant="muted">
            {busy}
          </AppText>
          {busy !== 'Loading saved map…' && busy !== 'Removing download…' ? (
            <Pill label="Cancel" onPress={() => operation.current?.abort()} />
          ) : null}
        </View>
      ) : searchOpen && places.length > 0 ? (
        <View className="mt-4 gap-3">
          <AppText variant="subheading">Choose the area to save</AppText>
          <AppText variant="caption">
            {places.length} {places.length === 1 ? 'match' : 'matches'} for “{searchedText}”. Refine
            the search above if your place is missing.
          </AppText>
          {places.map((place, index) => (
            <Pressable
              key={`${place.lat},${place.lon},${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Download map of ${place.label}`}
              onPress={() => download(place)}
              className="rounded-2xl border border-brand-200 bg-brand-50 p-4"
            >
              <AppText>{place.label}</AppText>
              <AppText variant="caption" className="mt-1">
                Download nearby streets · Approx. 3 × 3 km
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? (
        <AppText accessibilityRole="alert" className="mt-3 text-sm text-red-500">
          {error}
        </AppText>
      ) : null}
      <AppText variant="caption" className="mt-3">
        Saved streets, waterways, and parks work offline. Download each stop before your trip.
        Directions require a separate maps app.
      </AppText>
      <AppText variant="caption" className="mt-2">
        Google Maps downloads are separate from maps saved here. Use “Open in Google Maps” below to
        open that app.
      </AppText>
      <Pressable
        accessibilityRole="link"
        className="mt-2 py-2"
        onPress={() =>
          Linking.openURL('https://www.openstreetmap.org/copyright').catch(() =>
            setError('OpenStreetMap data © OpenStreetMap contributors, licensed under ODbL 1.0.')
          )
        }
      >
        <AppText variant="caption">© OpenStreetMap contributors · ODbL</AppText>
      </Pressable>
    </View>
  );
}
