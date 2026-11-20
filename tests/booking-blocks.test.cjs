const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const React = require("react");
const createLoader = require("./load-ts.cjs");

const nodes = tree => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
  ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const text = tree => tree == null || typeof tree === "boolean" ? "" : typeof tree !== "object"
  ? String(tree) : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);

test("public calendar disables selected weekdays only and rechecks before confirming", async () => {
  let cursor = 0;
  const state = [];
  const alerts = [];
  let requests = 0;
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : ["2026-11-30T12:00:00Z"])); } }
  const hooks = { ...React, useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
  }, useEffect() {}, useRef() { return { current: null }; } };
  const load = createLoader({ react: hooks }, {
    Date: FixedDate, alert: message => alerts.push(message),
    fetch: async () => { requests++; throw new Error("Unexpected request"); },
  });
  const Booking = load(path.resolve(__dirname, "../pages/Booking.tsx")).default;
  const { buildBlockRule } = load(path.resolve(__dirname, "../utils/blockForm.ts"));
  const { DEFAULT_SCHEDULE } = load(path.resolve(__dirname, "../constants.ts"));
  const rule = buildBlockRule({ date: "2026-12-01", endDate: "2026-12-31", time: "14:00", endTime: "18:00",
    allDay: false, weekdays: [1, 4] }, DEFAULT_SCHEDULE, () => false);
  const props = { service: { id: "service", name: "Servicio", duration: 60, price: 100 },
    schedule: DEFAULT_SCHEDULE, promotions: [], coupons: [], promotionsLoading: false,
    occupiedSlots: [], blockedSlots: [rule], currentUserId: null,
    initialData: { name: "Cliente", phone: "099000000", email: "test@example.test" },
    onConfirm() {}, onRequireLogin() {}, onCancel() {} };
  function render() { cursor = 0; return Booking(props); }
  const dateButton = date => nodes(render()).find(node => node.type === "button" && node.key === date);
  const timeButton = time => nodes(render()).find(node => node.type === "button" && node.key === time);
  dateButton("2026-12-07").props.onClick();
  assert.equal(timeButton("14:00").props.disabled, true);
  assert.equal(timeButton("09:00").props.disabled, false);
  dateButton("2026-12-08").props.onClick();
  assert.equal(timeButton("14:00").props.disabled, false);
  timeButton("14:00").props.onClick();
  const next = () => nodes(render()).find(node => node.type === "button" && text(node).includes("CONTINUAR"));
  await next().props.onClick();
  await next().props.onClick();
  // A new rule arrives from the realtime subscription while the user is on step 3.
  props.blockedSlots = [buildBlockRule({ ...rule, weekdays: [2, 5] }, DEFAULT_SCHEDULE, () => false)];
  const confirm = nodes(render()).find(node => node.type === "button" && text(node).includes("PAGAR CON MERCADO PAGO"));
  await confirm.props.onClick();
  assert.equal(requests, 0);
  assert.equal(alerts.length, 1);
  assert.ok(alerts[0].includes("ya no está disponible"));
  assert.equal(timeButton("14:00").props.disabled, true);
});
