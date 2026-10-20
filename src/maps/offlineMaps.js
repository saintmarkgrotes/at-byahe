// Download raw OSM data, not tiles from servers that prohibit offline downloads.
const PHOTON_URL = process.env.EXPO_PUBLIC_PHOTON_URL || 'https://photon.komoot.io/api/';
const OVERPASS_URL =
  process.env.EXPO_PUBLIC_OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
const PREFIX = '@at-byahe/offline-map-v1/';
const MAX_MAP_LENGTH = 750000;
export const MAP_SIZE = 1000;
export const normalizeQuery = (query) => query.trim().replace(/\s+/g, ' ').toLowerCase();
const keyFor = (query) => PREFIX + encodeURIComponent(normalizeQuery(query));
const coordinate = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 85 && Math.abs(lon) <= 180;

export function areaBounds(lat, lon) {
  if (!coordinate(lat, lon)) throw new Error('This location is outside the supported map area.');
  const dy = 1.5 / 111.32;
  const dx = dy / Math.cos((lat * Math.PI) / 180);
  if (lon - dx < -180 || lon + dx > 180)
    throw new Error('Areas crossing the date line are not supported yet.');
  return [lat - dy, lon - dx, lat + dy, lon + dx];
}

export function projectPoint(lat, lon, [south, west, north, east]) {
  return [((lon - west) / (east - west)) * MAP_SIZE, ((north - lat) / (north - south)) * MAP_SIZE];
}

export function prepareMap(query, place, response, now = Date.now()) {
  if (response.remark || !Array.isArray(response.elements))
    throw new Error('The map service returned an incomplete area. Please try again.');
  const bounds = areaBounds(place.lat, place.lon);
  const groups = new Map();
  for (const way of response.elements) {
    if (way.type !== 'way' || !Array.isArray(way.geometry)) continue;
    const tags = way.tags ?? {};
    const kind = tags.highway
      ? 'road'
      : tags.waterway
        ? 'river'
        : tags.natural === 'water'
          ? 'water'
          : tags.leisure === 'park'
            ? 'park'
            : null;
    if (!kind) continue;
    let path = '';
    let connected = false;
    const points = [];
    for (const point of way.geometry) {
      if (!point || !coordinate(point.lat, point.lon)) {
        connected = false;
        continue;
      }
      const [x, y] = projectPoint(point.lat, point.lon, bounds).map((n) => Math.round(n * 10) / 10);
      path += `${connected ? 'L' : 'M'}${x},${y}`;
      points.push([x, y]);
      connected = true;
    }
    if (points.length < 2) continue;
    // Only close complete polygons; clipped geometry may contain gaps.
    const closed =
      way.geometry.every(Boolean) &&
      points[0][0] === points.at(-1)[0] &&
      points[0][1] === points.at(-1)[1];
    if ((kind === 'water' || kind === 'park') && !closed) continue;
    const feature = {
      id: String(way.id),
      kind,
      path: path + (closed && kind !== 'road' ? 'Z' : ''),
      major: /^(motorway|trunk|primary|secondary|tertiary)/.test(tags.highway ?? ''),
      name: typeof tags.name === 'string' ? tags.name.slice(0, 120) : '',
      label: points[Math.floor(points.length / 2)],
    };
    // Combine segments of the same street to keep storage and SVG rendering small.
    const groupKey = JSON.stringify([feature.kind, feature.major, feature.name]);
    const existing = groups.get(groupKey);
    if (existing) {
      existing.path += feature.path;
      if (existing.label.some((n) => n < 0 || n > MAP_SIZE)) existing.label = feature.label;
    } else groups.set(groupKey, feature);
  }
  const features = [...groups.values()];
  if (!features.some((feature) => feature.kind === 'road'))
    throw new Error(
      'No mapped streets were found here. Try a nearby town or a more specific location.'
    );
  if (features.length > 4000)
    throw new Error('This area has too much detail to save. Try a nearby location.');
  const map = { version: 1, query: normalizeQuery(query), place, bounds, features, savedAt: now };
  if (JSON.stringify(map).length > MAX_MAP_LENGTH)
    throw new Error('This area is too large to save. Try a nearby location.');
  return map;
}

export function validMap(map, query) {
  return (
    map?.version === 1 &&
    map.query === normalizeQuery(query) &&
    coordinate(map.place?.lat, map.place?.lon) &&
    typeof map.place?.label === 'string' &&
    Number.isFinite(map.savedAt) &&
    Array.isArray(map.bounds) &&
    map.bounds.length === 4 &&
    map.bounds.every(Number.isFinite) &&
    map.bounds[0] < map.bounds[2] &&
    map.bounds[1] < map.bounds[3] &&
    Array.isArray(map.features) &&
    map.features.length > 0 &&
    map.features.length <= 4000 &&
    map.features.some((f) => f?.kind === 'road') &&
    map.features.every(
      (f) =>
        f &&
        typeof f.id === 'string' &&
        ['road', 'river', 'water', 'park'].includes(f.kind) &&
        typeof f.path === 'string' &&
        /^[MLZ\d., -]+$/.test(f.path) &&
        typeof f.name === 'string' &&
        Array.isArray(f.label) &&
        f.label.length === 2 &&
        f.label.every(Number.isFinite)
    )
  );
}

export function createOfflineMapStore(storage) {
  return {
    async load(query) {
      const raw = await storage.getItem(keyFor(query));
      if (raw === null) return null;
      let map;
      try {
        map = JSON.parse(raw);
      } catch {
        /* Report corrupt data without overwriting it. */
      }
      if (!validMap(map, query))
        throw new Error('This saved map cannot be read. Download it again while online.');
      return map;
    },
    async save(query, map) {
      if (!validMap(map, query))
        throw new Error('The downloaded map is incomplete. Please try again.');
      const raw = JSON.stringify(map);
      if (raw.length > MAX_MAP_LENGTH) throw new Error('This map is too large to save.');
      try {
        await storage.setItem(keyFor(query), raw);
      } catch {
        throw new Error(
          'Could not save the map. Free some device storage or remove an unused offline map, then retry.'
        );
      }
    },
    remove: (query) => storage.removeItem(keyFor(query)),
  };
}

async function requestJson(url, options, signal, fetcher) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel);
  const timer = setTimeout(cancel, 60000);
  try {
    const response = await fetcher(url, { ...options, signal: controller.signal });
    if (!response.ok)
      throw new Error('The map service is busy or unavailable. Please try again later.');
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted)
      throw new Error('The map download timed out. Please try again.');
    if (error instanceof TypeError)
      throw new Error(
        'Connect to the internet to download this area. Saved maps still work offline.'
      );
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function findMapPlaces(query, signal, fetcher = fetch) {
  const searchText = query.trim().replace(/\s+/g, ' ');
  if (!searchText) throw new Error('Enter a place name or address to search.');
  const data = await requestJson(
    `${PHOTON_URL}?q=${encodeURIComponent(searchText)}&limit=10`,
    {},
    signal,
    fetcher
  );
  if (!Array.isArray(data.features))
    throw new Error('The place search service is unavailable. Please try again.');
  const places = (data.features ?? []).flatMap((feature) => {
    const [lon, lat] = feature.geometry?.coordinates ?? [];
    if (!coordinate(lat, lon)) return [];
    const p = feature.properties ?? {};
    return [
      {
        lat,
        lon,
        label:
          [...new Set([p.name, p.street, p.city, p.state, p.country].filter(Boolean))].join(', ') ||
          searchText,
      },
    ];
  });
  if (!places.length)
    throw new Error('No matching place found. Try another name, address, or nearby town.');
  return places;
}

export async function downloadMapArea(query, place, signal, fetcher = fetch) {
  const box = areaBounds(place.lat, place.lon).join(',');
  const data = `[out:json][timeout:40][maxsize:16777216];(way[highway](${box});way[waterway](${box});way[natural=water](${box});way[leisure=park](${box}););out geom(${box});`;
  const response = await requestJson(
    `${OVERPASS_URL}?data=${encodeURIComponent(data)}`,
    // Native requests identify the app; browsers keep their own User-Agent/Referer.
    { headers: { Accept: 'application/json', 'User-Agent': 'AtByahe/1.0' } },
    signal,
    fetcher
  );
  return prepareMap(query, place, response);
}
