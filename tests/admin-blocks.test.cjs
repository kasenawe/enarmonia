const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const React = require("react");
const createLoader = require("./load-ts.cjs");

function harness() {
  const state = [];
  let cursor = 0;
  const records = new Map();
  const writes = [];
  const hooks = { ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useEffect() {}, useMemo(fn) { return fn(); }, useRef() { return { current: null }; },
  };
  const firebase = {
    db: {}, collection: (_, name) => name, doc: (_, collection, id) => id || collection,
    async addDoc(_, data) { writes.push("add"); records.set("rule", { id: "rule", ...data }); },
    async setDoc(id, data) { writes.push("edit"); records.set(id, { ...records.get(id), ...data }); },
    async deleteDoc(id) { writes.push("delete"); records.delete(id); },
    writeBatch() { return {
      update(id, patch) { records.set(id, { ...records.get(id), ...patch }); },
      delete(id) { records.delete(id); }, async commit() {},
    }; },
  };
  const load = createLoader({ react: hooks, "../firebase": firebase,
    "../contexts/AuthContext": { useAuth: () => ({ currentUser: { uid: "admin" } }) },
    "../components/ClinicalRecordsPanel": { __esModule: true, default: () => null },
  }, { window: { confirm: () => true } });
  const Admin = load(path.resolve(__dirname, "../pages/Admin.tsx")).default;
  const { DEFAULT_SCHEDULE } = load(path.resolve(__dirname, "../constants.ts"));
  const props = { appointments: [], occupiedSlots: [], services: [], promotions: [], schedule: DEFAULT_SCHEDULE,
    servicesLoading: false, promotionsLoading: false, serviceError: null, promotionError: null,
    onDelete: async () => {}, onBack() {} };
  function render() { cursor = 0; return Admin({ ...props, blockedSlots: [...records.values()] }); }
  return { render, records, writes, props, load };
}

function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  return Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
}
const find = (tree, type, label) => nodes(tree).find(node => node.type === type && text(node).includes(label));
const blockForm = tree => find(tree, "form", "Días de la semana");
const checkbox = (tree, label) => nodes(find(tree, "label", label)).find(node => node.type === "input");
const input = (tree, type, index = 0) => nodes(tree).filter(node => node.type === "input" && node.props.type === type)[index];
const change = (node, value) => node.props.onChange({ target: { value, checked: value } });
const submit = node => node.props.onSubmit({ preventDefault() {} });

test("admin create, view, edit, partial unblock and delete a weekly rule through real event handlers", async () => {
  const h = harness();
  find(h.render(), "button", "Bloqueos").props.onClick();
  let form = blockForm(h.render());
  change(input(form, "date", 0), "2026-12-01");
  change(input(form, "date", 1), "2026-12-31");
  change(checkbox(form, "Todos los días"), false);
  form = blockForm(h.render());
  change(checkbox(form, "Lunes"), true);
  change(checkbox(form, "Jueves"), true);
  change(checkbox(form, "Todo el horario"), false);
  form = blockForm(h.render());
  change(input(form, "time", 0), "14:00");
  change(input(form, "time", 1), "18:00");
  await submit(blockForm(h.render()));
  assert.equal(h.records.size, 1);
  assert.deepEqual([...h.records.get("rule").weekdays], [1, 4]);
  assert.ok(text(h.render()).includes("Lunes, Jueves"));
  find(h.render(), "button", "Editar").props.onClick();
  form = blockForm(h.render());
  assert.equal(checkbox(form, "Lunes").props.checked, true);
  change(checkbox(form, "Lunes"), false);
  change(checkbox(form, "Jueves"), false);
  change(checkbox(form, "Martes"), true);
  change(checkbox(form, "Viernes"), true);
  await submit(blockForm(h.render()));
  assert.equal(h.records.size, 1);
  assert.deepEqual([...h.records.get("rule").weekdays], [2, 5]);
  const { slotOverlapsBlocked } = h.load(path.resolve(__dirname, "../utils/scheduleUtils.ts"));
  const blocked = date => slotOverlapsBlocked(date, "14:00", 60, [...h.records.values()], 60);
  assert.equal(blocked("2026-12-07"), false);
  assert.equal(blocked("2026-12-08"), true);
  let unblock = find(h.render(), "form", "Desbloqueo por rango");
  change(input(unblock, "date", 0), "2026-12-08");
  change(input(unblock, "date", 1), "2026-12-08");
  await submit(find(h.render(), "form", "Desbloqueo por rango"));
  assert.equal(blocked("2026-12-08"), false);
  assert.equal(blocked("2026-12-15"), true);
  find(h.render(), "button", "Desbloquear").props.onClick();
  // deleteDoc is async; the local mock removes the record synchronously.
  assert.equal(h.records.size, 0);
  assert.deepEqual(h.writes, ["add", "edit", "delete"]);
});

test("admin rejects empty weekday selection without writes and edits legacy records as all days", async () => {
  const h = harness();
  find(h.render(), "button", "Bloqueos").props.onClick();
  change(checkbox(blockForm(h.render()), "Todos los días"), false);
  await submit(blockForm(h.render()));
  assert.equal(h.records.size, 0);
  assert.ok(text(h.render()).includes("Seleccioná al menos un día"));
  h.records.set("old", { id: "old", date: "2026-12-01", time: "14:00" });
  find(h.render(), "button", "Editar").props.onClick();
  assert.equal(checkbox(blockForm(h.render()), "Todos los días").props.checked, true);
});
