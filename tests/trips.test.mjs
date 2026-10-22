import test from 'node:test';
import assert from 'node:assert/strict';
import {
  changeState,
  emptyState,
  selectedTripOf,
  tripStatus,
  encodeState,
  decodeState,
  sortEntries,
} from '../src/state/trips.js';
import { parseTimeLabel, isValidIsoDate, getTripLength, getTripDayDate } from '../src/utils/date.js';
import { createTripStorage, STORAGE_KEY } from '../src/state/storage.js';
const form = {
  destination: 'Baguio',
  startDate: '2026-10-01',
  endDate: '2026-10-04',
  activities: [],
  packingItems: [],
};
const plan = { date: '2026-10-02', time: '9:00 AM', location: 'Park', activities: ['Walk'] };
const addTrip = (state = emptyState(), id = 'trip1') =>
  changeState(state, { type: 'addTrip', id, form });

test('new trip activities use the selected day and keep it after reloading', () => {
  for (const activityDate of [form.startDate, '2026-10-02', form.endDate]) {
    const state = changeState(emptyState(), {
      type: 'addTrip',
      id: 'trip1',
      form: { ...form, activityDate, activities: ['Walk'], activityTime: '9:00 AM' },
    });
    const entry = decodeState(encodeState(state)).itinerary[0];
    assert.equal(entry.date, activityDate);
    assert.equal(entry.activities[0].title, 'Walk');
    assert.equal(entry.time, '9:00 AM');
  }
});

test('new trip activity dates default to Day One and reject days outside the trip', () => {
  const initial = emptyState();
  const withActivities = { ...form, activities: ['Walk'], activityTime: '9:00 AM' };
  const state = changeState(initial, { type: 'addTrip', id: 'trip1', form: withActivities });
  assert.equal(state.itinerary[0].date, form.startDate);
  for (const activityDate of ['2026-09-30', '2026-10-05', '2026-02-31', '']) {
    assert.throws(() => changeState(initial, {
      type: 'addTrip', id: 'trip1', form: { ...withActivities, activityDate },
    }), /within the trip dates/);
  }
  assert.throws(() => changeState(initial, {
    type: 'addTrip', id: 'trip1',
    form: { ...withActivities, endDate: form.startDate, activityDate: '2026-10-02' },
  }), /within the trip dates/);
  assert.deepEqual(initial, emptyState());
});

test('trip day choices resolve calendar boundaries and reject invalid day numbers', () => {
  assert.equal(getTripDayDate('2026-12-31', 2), '2027-01-01');
  assert.equal(getTripDayDate('2028-02-28', 2), '2028-02-29');
  assert.equal(getTripDayDate('2026-02-28', 2), '2026-03-01');
  assert.equal(getTripDayDate('2026-03-07', 3), '2026-03-09');
  for (const day of [0, -1, 1.5, NaN]) assert.equal(getTripDayDate(form.startDate, day), '');
  assert.equal(getTripDayDate('', 1), '');
});

test('empty trip accepts a later-day plan, and can replace its last deleted plan', () => {
  let s = addTrip();
  s = changeState(s, { type: 'addEntry', id: 'entry1', tripId: 'trip1', form: plan });
  assert.equal(s.itinerary[0].date, '2026-10-02');
  s = changeState(s, { type: 'deleteEntry', id: 'entry1' });
  s = changeState(s, { type: 'addEntry', id: 'entry2', tripId: 'trip1', form: plan });
  assert.equal(s.itinerary.length, 1);
});
test('invalid trip and plan dates are rejected without modifying existing data', () => {
  const s = addTrip();
  assert.throws(
    () => changeState(s, { type: 'addTrip', id: 'bad', form: { ...form, endDate: '2026-09-30' } }),
    /End date/
  );
  for (const date of ['2026-09-30', '2026-10-05', '2026-02-31'])
    assert.throws(
      () =>
        changeState(s, { type: 'addEntry', id: 'bad', tripId: 'trip1', form: { ...plan, date } }),
      /within/
    );
  assert.equal(s.itinerary.length, 0);
});
test('trip edits protect plans outside the proposed dates and retain notes', () => {
  let s = changeState(addTrip(), { type: 'addEntry', id: 'entry1', tripId: 'trip1', form: plan });
  s = changeState(s, { type: 'notes', id: 'trip1', notes: 'Bring a jacket' });
  assert.throws(
    () =>
      changeState(s, {
        type: 'updateTrip',
        id: 'trip1',
        form: { ...form, startDate: '2026-10-03' },
      }),
    /2026-10-02/
  );
  s = changeState(s, {
    type: 'updateTrip',
    id: 'trip1',
    form: { ...form, destination: 'Baguio City' },
  });
  assert.equal(s.trips[0].notes, 'Bring a jacket');
  assert.equal(s.itinerary[0].date, plan.date);
});
test('deleting a selected trip cleans related data and selects a remaining trip', () => {
  let s = addTrip(addTrip(), 'trip2');
  s = changeState(s, { type: 'addEntry', id: 'entry2', tripId: 'trip2', form: plan });
  s = changeState(s, { type: 'addPacking', id: 'item2', tripId: 'trip2', title: 'Jacket' });
  s = changeState(s, { type: 'toggleDay', id: 'trip2', date: plan.date });
  s = changeState(s, { type: 'notes', id: 'trip2', notes: 'Private note' });
  s = changeState(s, { type: 'deleteTrip', id: 'trip2' });
  assert.equal(selectedTripOf(s).id, 'trip1');
  assert.equal(s.itinerary.length, 0);
  assert.equal(s.packingLists.length, 0);
  assert.equal(s.doneDatesByTrip.trip2, undefined);
  s = changeState(s, { type: 'deleteTrip', id: 'trip1' });
  assert.equal(selectedTripOf(s), null);
});
test('selection controls the current trip and survives serialization', () => {
  let s = addTrip(addTrip(), 'trip2');
  s = changeState(s, { type: 'select', id: 'trip1' });
  assert.equal(selectedTripOf(decodeState(encodeState(s))).id, 'trip1');
  assert.equal(changeState(s, { type: 'select', id: 'missing' }), s);
});
test('plan edits keep matching activity completion and reset reviewed days', () => {
  let s = changeState(addTrip(), { type: 'addEntry', id: 'entry1', tripId: 'trip1', form: plan });
  const activityId = s.itinerary[0].activities[0].id;
  s = changeState(s, { type: 'toggleActivity', id: 'entry1', activityId });
  s = changeState(s, { type: 'toggleDay', id: 'trip1', date: plan.date });
  s = changeState(s, {
    type: 'updateEntry',
    id: 'entry1',
    activitySeed: 'new',
    form: { ...plan, date: '2026-10-03', activities: ['Walk', 'Lunch'] },
  });
  assert.equal(s.itinerary[0].activities[0].done, true);
  assert.equal(s.itinerary[0].activities[1].done, false);
  assert.deepEqual(s.doneDatesByTrip.trip1, []);
  assert.equal(new Set(s.itinerary[0].activities.map((a) => a.id)).size, 2);
});
test('round trip restores profile, notes, packing and activity progress', () => {
  let s = changeState(emptyState(), {
    type: 'addTrip',
    id: 'trip1',
    form: { ...form, activities: ['Walk'], packingItems: ['Jacket'], activityTime: '9:00 AM' },
  });
  s = changeState(s, { type: 'togglePacked', id: 'trip1-packing', itemId: 'trip1-p0' });
  s = changeState(s, { type: 'toggleActivity', id: 'trip1-first', activityId: 'trip1-first-a0' });
  s = changeState(s, { type: 'notes', id: 'trip1', notes: 'A note' });
  s = changeState(s, { type: 'profile', firstName: 'Kokoy' });
  const restored = decodeState(encodeState(s));
  assert.equal(restored.profile.firstName, 'Kokoy');
  assert.equal(restored.trips[0].notes, 'A note');
  assert.equal(restored.packingLists[0].items[0].packed, true);
  assert.equal(restored.itinerary[0].activities[0].done, true);
});
test('unknown versions, corrupt JSON, and orphan data do not silently reset', () => {
  assert.throws(() => decodeState('{'));
  assert.throws(
    () => decodeState(JSON.stringify({ version: 2, data: emptyState() })),
    /unsupported/
  );
  assert.throws(
    () =>
      decodeState(
        encodeState({
          ...emptyState(),
          packingLists: [{ id: 'list', tripId: 'missing', items: [] }],
        })
      ),
    /invalid/
  );
  assert.deepEqual(decodeState(null), emptyState());
});
test('status handles inclusive start/end dates; entries sort by actual time', () => {
  assert.equal(tripStatus(form, '2026-09-30'), 'planned');
  assert.equal(tripStatus(form, '2026-10-01'), 'ongoing');
  assert.equal(tripStatus(form, '2026-10-04'), 'ongoing');
  assert.equal(tripStatus(form, '2026-10-05'), 'completed');
  assert.deepEqual(
    sortEntries(['1:00 PM', '12:00 AM', '9:00 AM'].map((time) => ({ date: plan.date, time }))).map(
      (e) => e.time
    ),
    ['12:00 AM', '9:00 AM', '1:00 PM']
  );
});
test('calendar and time validation reject overflowing values', () => {
  assert.equal(isValidIsoDate('2026-02-29'), false);
  assert.equal(isValidIsoDate('2028-02-29'), true);
  for (const time of ['0:00 AM', '13:30 PM', '9:60 AM']) assert.equal(parseTimeLabel(time), null);
  assert.equal(parseTimeLabel('12:00 AM').getHours(), 0);
  assert.equal(parseTimeLabel('12:00 PM').getHours(), 12);
  assert.equal(getTripLength('2026-10-01', '2026-10-01'), 1);
});
test('storage cannot write before hydration, including when loading fails', async () => {
  let writes = 0;
  const store = createTripStorage({
    getItem: async () => '{bad',
    setItem: async () => {
      writes++;
    },
  });
  await assert.rejects(store.save(emptyState()), /loaded/);
  await assert.rejects(store.load());
  await assert.rejects(store.save(emptyState()), /loaded/);
  assert.equal(writes, 0);
});
test('storage serializes overlapping saves and can retry after a write failure', async () => {
  let stored = null;
  let release;
  let calls = 0;
  const store = createTripStorage({
    getItem: async (key) => {
      assert.equal(key, STORAGE_KEY);
      return stored;
    },
    setItem: async (key, value) => {
      calls++;
      if (calls === 1)
        await new Promise((resolve) => {
          release = resolve;
        });
      if (calls === 3) throw new Error('Disk full');
      stored = value;
    },
  });
  await store.load();
  const first = store.save(addTrip());
  await new Promise((resolve) => setImmediate(resolve));
  const latest = changeState(addTrip(), { type: 'profile', firstName: 'Latest' });
  const second = store.save(latest);
  assert.equal(calls, 1);
  release();
  await Promise.all([first, second]);
  assert.equal(decodeState(stored).profile.firstName, 'Latest');
  await assert.rejects(store.save(latest), /Disk full/);
  await store.save(latest);
  assert.equal(calls, 4);
});
