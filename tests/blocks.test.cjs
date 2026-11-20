const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const load = require("./load-ts.cjs")();
const root = path.resolve(__dirname, "..");
const rules = load(path.join(root, "utils/blockRules.ts"));
const { buildBlockRule, blockFormFromRecord, validateBlockForm } = load(path.join(root, "utils/blockForm.ts"));
const { slotOverlapsBlocked, generateTimeSlots, getScheduleSegmentForDay } = load(path.join(root, "utils/scheduleUtils.ts"));
const { DEFAULT_SCHEDULE } = load(path.join(root, "constants.ts"));
const plain = value => JSON.parse(JSON.stringify(value));
const form = { date: "2026-12-01", endDate: "2026-12-31", time: "14:00", endTime: "18:00", allDay: false, weekdays: [1, 4] };
const make = (overrides = {}, occupied = () => false) => ({ id: "rule", ...buildBlockRule({ ...form, ...overrides }, DEFAULT_SCHEDULE, occupied) });
const overlaps = (block, date, time = "14:00", duration = 60) => slotOverlapsBlocked(date, time, duration, [block], 60);

test("Monday/Thursday, Tuesday/Friday, unselected days and inclusive date boundaries", () => {
  for (const weekdays of [[1, 4], [2, 5]]) {
    const block = make({ weekdays });
    for (let day = 1; day <= 31; day++) {
      const date = `2026-12-${String(day).padStart(2, "0")}`;
      assert.equal(overlaps(block, date), weekdays.includes(rules.isoWeekday(date)), date);
    }
    assert.equal(overlaps(block, "2026-11-30"), false);
    assert.equal(overlaps(block, "2027-01-01"), false);
  }
});

test("all days exactly reproduce the former bulk expansion, including final start time", () => {
  const block = make({ weekdays: rules.ALL_WEEKDAYS });
  for (let day = 1; day <= 31; day++) {
    const date = `2026-12-${String(day).padStart(2, "0")}`;
    const segment = getScheduleSegmentForDay(DEFAULT_SCHEDULE, rules.isoWeekday(date) % 7);
    const oldTimes = generateTimeSlots(segment, segment.slotIntervalMinutes).filter(time => time >= form.time && time <= form.endTime);
    for (const time of ["09:00", "13:00", "14:00", "16:00", "18:00", "19:00"]) {
      assert.equal(overlaps(block, date, time), oldTimes.includes(time), `${date} ${time}`);
    }
  }
});

test("half-open overlap: before, across start, inside, after final window", () => {
  const block = make();
  assert.equal(overlaps(block, "2026-12-07", "13:00"), false);
  assert.equal(overlaps(block, "2026-12-07", "13:30"), true);
  assert.equal(overlaps(block, "2026-12-07", "16:00"), true);
  assert.equal(overlaps(block, "2026-12-07", "19:00"), false);
});

test("legacy records and records with missing weekdays apply on every date of their range", () => {
  const legacy = { id: "old", date: "2026-12-01", time: "14:00" };
  assert.equal(overlaps(legacy, "2026-12-01"), true);
  assert.equal(overlaps(legacy, "2026-12-02"), false);
  assert.equal(overlaps(legacy, "2026-12-01", "15:00"), false);
  const range = { ...make({ weekdays: rules.ALL_WEEKDAYS }) };
  delete range.weekdays;
  assert.equal(overlaps(range, "2026-12-01"), true);
  assert.equal(overlaps(range, "2026-12-07"), true);
  assert.deepEqual(plain(blockFormFromRecord(legacy).weekdays), [1, 2, 3, 4, 5, 6, 7]);
});

test("serialization and edit retain selection and update effective availability", () => {
  const saved = JSON.parse(JSON.stringify(make()));
  const edited = buildBlockRule({ ...blockFormFromRecord(saved), weekdays: [2, 5] }, DEFAULT_SCHEDULE, () => false);
  assert.deepEqual(plain(edited.weekdays), [2, 5]);
  assert.equal(overlaps(edited, "2026-12-07"), false);
  assert.equal(overlaps(edited, "2026-12-08"), true);
});

test("occupied exceptions do not affect adjacent dates or other times", () => {
  const block = make({}, (date, time) => date === "2026-12-07" && time === "14:00");
  assert.equal(overlaps(block, "2026-12-07"), false);
  assert.equal(overlaps(block, "2026-12-07", "15:00"), true);
  assert.equal(overlaps(block, "2026-12-14"), true);
});

test("calendar arithmetic across week/year, leap day and DST dates", () => {
  for (const [date, expected] of [["2026-12-06", 7], ["2026-12-07", 1], ["2027-01-01", 5], ["2028-02-29", 2], ["2026-03-08", 7], ["2026-11-01", 7]]) {
    assert.equal(rules.isoWeekday(date), expected);
  }
  const block = make({ date: "2026-12-31", endDate: "2027-01-04" });
  assert.equal(overlaps(block, "2026-12-31"), true);
  assert.equal(overlaps(block, "2027-01-04"), true);
});

test("working days, breaks and durations stay frozen after schedule changes", () => {
  const block = make({ allDay: true, weekdays: rules.ALL_WEEKDAYS });
  assert.equal(overlaps(block, "2026-12-07", "12:00"), false);
  assert.equal(overlaps(block, "2026-12-06"), false);
  assert.equal(slotOverlapsBlocked("2026-12-07", "14:30", 30, [block], 15), true);
});

test("invalid dates, weekdays and times are rejected", () => {
  for (const overrides of [{ weekdays: [] }, { weekdays: [0] }, { weekdays: [1, 1] }, { date: "2026-02-30" }, { endDate: "2026-11-30" }, { time: "24:00" }, { time: "19:00" }]) {
    assert.ok(validateBlockForm({ ...form, ...overrides }));
    assert.throws(() => make(overrides));
  }
});

test("empty working ranges and fully occupied ranges produce no rule", () => {
  assert.throws(() => make({ date: "2026-12-06", endDate: "2026-12-06", weekdays: [7] }));
  assert.throws(() => make({}, () => true));
});

test("partial unblock follows frozen windows even if the working schedule changed", () => {
  const block = make();
  const keys = rules.blockKeysInRange(block, "2026-12-07", "2026-12-07", false, "14:00", "15:00");
  assert.deepEqual(plain(keys), ["2026-12-07__14:00", "2026-12-07__15:00"]);
  const updated = { ...block, excludedSlots: keys };
  assert.equal(overlaps(updated, "2026-12-07"), false);
  assert.equal(overlaps(updated, "2026-12-14"), true);
  assert.equal(overlaps(updated, "2026-12-07", "16:00"), true);
});
