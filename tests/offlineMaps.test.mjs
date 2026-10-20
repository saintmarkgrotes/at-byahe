import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areaBounds,
  projectPoint,
  prepareMap,
  createOfflineMapStore,
  downloadMapArea,
  findMapPlaces,
  validMap,
} from '../src/maps/offlineMaps.js';

const place = { lat: 16.41, lon: 120.6, label: 'Baguio, Philippines' };
const query = 'Baguio';
const streets = {
  elements: [
    {
      type: 'way',
      id: 1,
      tags: { highway: 'primary', name: 'Session Road' },
      geometry: [
        { lat: 16.41, lon: 120.6 },
        { lat: 16.411, lon: 120.601 },
      ],
    },
  ],
};
const map = () => prepareMap(query, place, streets, 12345);
const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
    values,
  };
};

test('saved map reopens from persistent data with the network completely unavailable', async () => {
  const disk = memoryStorage();
  const response = await downloadMapArea(query, place, undefined, async () => ({
    ok: true,
    json: async () => streets,
  }));
  await createOfflineMapStore(disk).save(query, response);
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw new Error('Airplane mode');
  };
  try {
    const reopened = await createOfflineMapStore(disk).load('  BAGUIO  ');
    assert.deepEqual(reopened, response);
    assert.equal(reopened.features[0].name, 'Session Road');
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test('locations are isolated, and removing a map leaves trip data and other maps intact', async () => {
  const disk = memoryStorage();
  const store = createOfflineMapStore(disk);
  await disk.setItem('@at-byahe/state-v1', 'trip data');
  await store.save(query, map());
  const other = { ...map(), query: 'manila' };
  await store.save('Manila', other);
  assert.equal(await store.load('Cebu'), null);
  await store.remove(query);
  assert.equal(await store.load(query), null);
  assert.deepEqual(await store.load('Manila'), other);
  assert.equal(await disk.getItem('@at-byahe/state-v1'), 'trip data');
});

test('failed writes do not report a map saved or replace the previous usable map', async () => {
  const disk = memoryStorage();
  await createOfflineMapStore(disk).save(query, map());
  const full = createOfflineMapStore({
    ...disk,
    setItem: async () => {
      throw new Error('Disk full');
    },
  });
  await assert.rejects(full.save(query, { ...map(), savedAt: 99999 }), /Could not save/);
  assert.equal((await full.load(query)).savedAt, 12345);
});

test('corrupt maps and incompatible versions fail without being overwritten', async () => {
  const disk = memoryStorage();
  const store = createOfflineMapStore(disk);
  await store.save(query, map());
  const key = [...disk.values.keys()][0];
  for (const raw of [
    '{broken',
    'null',
    JSON.stringify({ ...map(), version: 99 }),
    JSON.stringify({ ...map(), features: [null] }),
  ]) {
    await disk.setItem(key, raw);
    await assert.rejects(store.load(query), /cannot be read/);
    assert.equal(await disk.getItem(key), raw);
  }
  assert.equal(validMap({ ...map(), query: 'elsewhere' }, query), false);
});

test('partial service responses, empty areas, and oversized maps are never saved as complete', async () => {
  assert.throws(() => prepareMap(query, place, { ...streets, remark: 'timed out' }), /incomplete/);
  assert.throws(() => prepareMap(query, place, { elements: [] }), /No mapped streets/);
  const huge = {
    ...map(),
    features: [{ ...map().features[0], path: 'M1,2' + 'L3,4'.repeat(200000) }],
  };
  await assert.rejects(createOfflineMapStore(memoryStorage()).save(query, huge), /too large/);
});

test('projection centers the saved location and preserves gaps in clipped road geometry', () => {
  const projected = projectPoint(place.lat, place.lon, areaBounds(place.lat, place.lon));
  assert.ok(projected.every((n) => Math.abs(n - 500) < 0.00001));
  const geometry = [...streets.elements[0].geometry, null, { lat: 16.412, lon: 120.603 }];
  const result = prepareMap(query, place, { elements: [{ ...streets.elements[0], geometry }] });
  assert.equal((result.features[0].path.match(/M/g) ?? []).length, 2);
  assert.throws(() => areaBounds(NaN, 120), /outside/);
  assert.throws(() => areaBounds(16, 180), /date line/);
});

test('place lookup encodes names and filters invalid coordinates', async () => {
  const results = await findMapPlaces('Park & Museum', undefined, async (url) => {
    assert.ok(url.includes('q=Park%20%26%20Museum'));
    return {
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [120.6, 16.41] },
            properties: { name: 'Park', city: 'Baguio' },
          },
          { geometry: { coordinates: ['invalid', 16] } },
        ],
      }),
    };
  });
  assert.deepEqual(results, [{ lat: 16.41, lon: 120.6, label: 'Park, Baguio' }]);
});

test('area search accepts a refined address and returns more than three distinct matches', async () => {
  const results = await findMapPlaces('  Burnham   Park, Baguio  ', undefined, async (url) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get('q'), 'Burnham Park, Baguio');
    assert.equal(params.get('limit'), '10');
    return {
      ok: true,
      json: async () => ({
        features: Array.from({ length: 10 }, (_, index) => ({
          geometry: { coordinates: [120.6 + index * 0.001, 16.41] },
          properties: { name: `Place ${index + 1}`, city: 'Baguio' },
        })),
      }),
    };
  });
  assert.equal(results.length, 10);
  assert.equal(results[9].label, 'Place 10, Baguio');
});

test('empty searches make no request and unmatched searches invite refining the input', async () => {
  let requests = 0;
  const fetcher = async () => {
    requests++;
    return { ok: true, json: async () => ({ features: [] }) };
  };
  await assert.rejects(findMapPlaces('   ', undefined, fetcher), /Enter a place name/);
  assert.equal(requests, 0);
  await assert.rejects(findMapPlaces('Unmatched place', undefined, fetcher), /Try another name/);
  assert.equal(requests, 1);
});

test('dense areas combine street segments without discarding their geometry', () => {
  const elements = Array.from({ length: 4100 }, (_, index) => ({
    ...streets.elements[0],
    id: index + 1,
  }));
  const result = prepareMap(query, place, { elements });
  assert.equal(result.features.length, 1);
  assert.equal((result.features[0].path.match(/M/g) ?? []).length, 4100);
  assert.equal(validMap(result, query), true);
});

test('network errors and cancellation leave the last saved map available', async () => {
  const disk = memoryStorage();
  const store = createOfflineMapStore(disk);
  await store.save(query, map());
  await assert.rejects(
    downloadMapArea(query, place, undefined, async () => {
      throw new TypeError('Failed to fetch');
    }),
    /Connect to the internet/
  );
  await assert.rejects(
    downloadMapArea(query, place, undefined, async () => ({ ok: false })),
    /busy or unavailable/
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    downloadMapArea(query, place, controller.signal, async (_, options) => {
      assert.equal(options.signal.aborted, true);
      throw new Error('Canceled');
    }),
    /Canceled/
  );
  assert.deepEqual(await store.load(query), map());
});
