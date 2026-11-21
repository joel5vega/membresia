import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp(process.env.BACKUP_BUCKET ? { storageBucket: process.env.BACKUP_BUCKET } : undefined);

const db = admin.firestore();
const membersBaseQuery = () => db.collection("members");
const settingsRef = () => db.doc("settings/constellation");

/* ───────────── utilidades ───────────── */
const norm = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const fullNameOf = (m: any) => m.nombreCompleto || `${m.nombre || ""} ${m.apellido || ""}`.trim();

function requireAuth(req: CallableRequest) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Inicia sesión");
}

type Op = (b: FirebaseFirestore.WriteBatch) => void;
async function commit(ops: Op[]) {
  for (let i = 0; i < ops.length; i += 400) {
    const batch = db.batch();
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
}

/** Quita duplicados (por nombre normalizado) y a la propia persona de su genograma. */
function dedupeGenograma(list: any[], selfKey: string) {
  const map = new Map<string, any>();
  list.forEach((p) => {
    const k = norm(p?.nombre);
    if (!k || k === selfKey) return;
    const prev = map.get(k);
    map.set(k, prev
      ? { ...p, ...prev, edad: prev.edad || p.edad || "", viveConElMiembro: !!(prev.viveConElMiembro || p.viveConElMiembro) }
      : p);
  });
  return [...map.values()];
}

/* ───────────── getMembersFiltered (la de siempre) ───────────── */
export const getMembersFiltered = onCall(async (request) => {
  const { filters } = request.data as { filters?: Record<string, any> };
  let query: FirebaseFirestore.Query = membersBaseQuery();
  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, "==", value);
    });
  }
  const snapshot = await query
    .select("apellido", "bautizado", "celular", "clase", "correo", "estadoCivil",
      "fechaNacimiento", "nombre", "zona", "profesion", "discipulado", "sexo", "photoUrl")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});

/* ───────────── edades ───────────── */
function calcularEdadDesdeFecha(fecha: any): number | null {
  if (!fecha) return null;
  if (typeof fecha === "string" && fecha.startsWith("0000")) return null;

  let date: Date;
  if (fecha.toDate) {
    date = fecha.toDate();
  } else {
    date = new Date(fecha);
    if (isNaN(date.getTime())) return null;
  }
  const hoy = new Date();
  let edad = hoy.getFullYear() - date.getFullYear();
  const m = hoy.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < date.getDate())) edad--;
  return edad;
}

export const ageStatsByDecade = onCall(async () => {
  const snapshot = await membersBaseQuery().select("fechaNacimiento").get();
  const stats: Record<string, number> = {};
  let withoutBirthdate = 0;

  snapshot.forEach((doc) => {
    const edad = calcularEdadDesdeFecha(doc.data().fechaNacimiento);
    if (edad == null || edad < 0) { withoutBirthdate++; return; }
    const start = Math.floor(edad / 10) * 10;
    const label = `${start}-${start + 9}`;
    stats[label] = (stats[label] ?? 0) + 1;
  });

  const result = Object.entries(stats)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([decade, count]) => ({ decade, count }));

  return {
    byDecade: result,
    totalWithBirthdate: result.reduce((s, d) => s + d.count, 0),
    totalWithoutBirthdate: withoutBirthdate,
    generatedAt: new Date().toISOString(),
  };
});

/* ───────────── membersLite ───────────── */
const LITE_FIELDS = [
  "nombre", "apellido", "nombreCompleto", "sexo", "clase", "celular", "correo", "zona",
  "fechaNacimiento", "bautizado", "estadoCivil", "profesion", "discipulado", "genograma",
];

export const membersLite = onCall({ memory: "512MiB" }, async (request) => {
  requireAuth(request);
  const photos = request.data?.photos !== false;
  const snap = await membersBaseQuery().select(...LITE_FIELDS, ...(photos ? ["photoUrl"] : [])).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

/* ───────────── deleteMemberCascade ───────────── */
export const deleteMemberCascade = onCall(async (request) => {
  requireAuth(request);
  const id = String(request.data?.id || "");
  const keepRelations = !!request.data?.keepRelations;
  if (!id) throw new HttpsError("invalid-argument", "Falta el id");

  const ref = membersBaseQuery().doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new HttpsError("not-found", "El miembro no existe");
  const key = norm(fullNameOf(doc.data()));

  const changed: { id: string; genograma: any[] }[] = [];
  if (!keepRelations) {
    const all = await membersBaseQuery().select("genograma").get();
    all.forEach((d) => {
      const g = d.data().genograma;
      if (d.id === id || !Array.isArray(g)) return;
      const next = g.filter((p: any) => norm(p?.nombre) !== key);
      if (next.length !== g.length) changed.push({ id: d.id, genograma: next });
    });
  }

  const ops: Op[] = [(b) => b.delete(ref)];
  changed.forEach((c) => ops.push((b) =>
    b.update(membersBaseQuery().doc(c.id), { genograma: c.genograma, updatedAt: admin.firestore.Timestamp.now() })));
  const { arrayRemove } = admin.firestore.FieldValue;
  ops.push((b) => b.set(settingsRef(), {
    hidden: arrayRemove(key), deceased: arrayRemove(key), inactive: arrayRemove(key),
  }, { merge: true }));

  await commit(ops);
  return { changed };
});

/* ───────────── renameMemberCascade ───────────── */
export const renameMemberCascade = onCall(async (request) => {
  requireAuth(request);
  const id = String(request.data?.id || "");
  const nombre = String(request.data?.nombre || "").replace(/\s+/g, " ").trim();
  const apellido = String(request.data?.apellido || "").replace(/\s+/g, " ").trim();
  if (!id || !nombre) throw new HttpsError("invalid-argument", "Faltan datos");

  const all = await membersBaseQuery().select("nombre", "apellido", "nombreCompleto", "genograma").get();
  const me = all.docs.find((d) => d.id === id);
  if (!me) throw new HttpsError("not-found", "El miembro no existe");

  const oldName = fullNameOf(me.data());
  const newName = `${nombre} ${apellido}`.trim();
  const oldKey = norm(oldName);
  const newKey = norm(newName);

  if (oldKey !== newKey && all.docs.some((d) => d.id !== id && norm(fullNameOf(d.data())) === newKey)) {
    throw new HttpsError("already-exists", "Ya existe otro miembro con ese nombre");
  }

  const now = admin.firestore.Timestamp.now();
  const ops: Op[] = [(b) => b.update(me.ref, {
    nombre, apellido, updatedAt: now,
    ...(me.data().nombreCompleto ? { nombreCompleto: newName } : {}),
  })];

  const changed: { id: string; genograma: any[] }[] = [];
  if (oldKey !== newKey) {
    all.forEach((d) => {
      const g = d.data().genograma;
      if (!Array.isArray(g) || !g.some((p: any) => norm(p?.nombre) === oldKey)) return;
      const renamed = g.map((p: any) => (norm(p?.nombre) === oldKey ? { ...p, nombre: newName } : p));
      const next = dedupeGenograma(renamed, norm(fullNameOf(d.data())));
      changed.push({ id: d.id, genograma: next });
      ops.push((b) => b.update(d.ref, { genograma: next, updatedAt: now }));
    });

    // Estado y "ocultos" se guardan por nombre: se trasladan a la clave nueva
    const s = (await settingsRef().get()).data() || {};
    const move = (arr: string[] = []) => (arr.includes(oldKey) ? [...new Set(arr.map((k) => (k === oldKey ? newKey : k)))] : null);
    const patch: Record<string, string[]> = {};
    (["hidden", "deceased", "inactive"] as const).forEach((f) => { const v = move(s[f]); if (v) patch[f] = v; });
    if (Object.keys(patch).length) ops.push((b) => b.set(settingsRef(), patch, { merge: true }));
  }

  await commit(ops);
  return { changed };
});

/* ───────────── respaldo diario ───────────── */
export const nightlyBackup = onSchedule(
  { schedule: "every day 03:00", timeZone: "America/La_Paz", memory: "512MiB" },
  async () => {
    const bucket = admin.storage().bucket();
    const members = (await membersBaseQuery().get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    const settings = (await settingsRef().get()).data() || {};
    const day = new Date().toISOString().slice(0, 10);

    await bucket.file(`backups/${day}.json`).save(
      JSON.stringify({ createdAt: new Date().toISOString(), count: members.length, members, settings }),
      { contentType: "application/json" }
    );

    // Retención: últimos 14
    const [files] = await bucket.getFiles({ prefix: "backups/" });
    const old = files.sort((a, b) => b.name.localeCompare(a.name)).slice(14);
    await Promise.all(old.map((f) => f.delete()));
  }
);

/* ───────────── vigilante de duplicados ───────────── */
export const dupeWatch = onSchedule(
  { schedule: "every monday 04:00", timeZone: "America/La_Paz" },
  async () => {
    const snap = await membersBaseQuery().select("nombre", "apellido", "nombreCompleto", "ci", "celular").get();
    const groups: Record<string, Map<string, { id: string; name: string }[]>> = {
      nombre: new Map(), ci: new Map(), celular: new Map(),
    };
    const add = (kind: string, key: string, item: { id: string; name: string }) => {
      if (!key) return;
      const m = groups[kind];
      m.set(key, [...(m.get(key) || []), item]);
    };

    snap.forEach((d) => {
      const m = d.data();
      const item = { id: d.id, name: fullNameOf(m) };
      add("nombre", norm(item.name), item);
      const ci = String(m.ci || "").replace(/\D/g, "");
      if (ci.length >= 5) add("ci", ci, item);
      const tel = String(m.celular || "").replace(/\D/g, "");
      if (tel.length >= 7) add("celular", tel, item);
    });

    const found = Object.entries(groups).flatMap(([reason, map]) =>
      [...map.values()].filter((v) => v.length > 1).map((items) => ({ reason, items })));

    await db.doc("settings/dupes").set({
      at: admin.firestore.Timestamp.now(), count: found.length, groups: found.slice(0, 50),
    });
  }
);

/* ───────────── normalización al guardar ───────────── */
export const onMemberWrite = onDocumentWritten({ document: "members/{id}", region: "us-central1" }, async (event) => {
  const after = event.data?.after;
  if (!after?.exists) return;
  const d = after.data() as any;
  const patch: Record<string, any> = {};

  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  ["nombre", "apellido", "nombreCompleto"].forEach((f) => {
    if (typeof d[f] === "string" && clean(d[f]) !== d[f]) patch[f] = clean(d[f]);
  });

  if (d.celular != null && d.celular !== "") {
    const raw = String(d.celular).trim();
    const tidy = (raw.startsWith("+") ? "+" : "") + raw.replace(/\D/g, "");
    if (tidy !== d.celular) patch.celular = tidy;
  }

  if (Array.isArray(d.genograma)) {
    let dirty = false;
    const g = d.genograma.map((p: any) => {
      if (typeof p?.nombre === "string" && clean(p.nombre) !== p.nombre) { dirty = true; return { ...p, nombre: clean(p.nombre) }; }
      return p;
    });
    if (dirty) patch.genograma = g;
  }

  if (Object.keys(patch).length) await after.ref.update(patch);   // la segunda ejecución ya no encuentra cambios
});

/* ───────────── cumpleaños públicos ───────────── */
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const INCLUDE_PHOTOS = false;
let bdayCache: { at: number; data: unknown } | null = null;

export const publicBirthdays = onCall(async (request) => {
  const required = process.env.BDAY_KEY;
  if (required && request.data?.k !== required) throw new HttpsError("permission-denied", "Enlace no válido");
  if (bdayCache && Date.now() - bdayCache.at < 10 * 60 * 1000) return bdayCache.data;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const month = get("month");
  const today = get("day");
  const next = month === 12 ? 1 : month + 1;

  const settings = (await settingsRef().get()).data() || {};
  const blocked = new Set<string>([...(settings.deceased || []), ...(settings.inactive || [])]);

  const snap = await membersBaseQuery()
    .select("nombre", "apellido", "nombreCompleto", "fechaNacimiento", "clase", "photoUrl").get();

  const buckets: Record<number, { nombre: string; dia: number; foto?: string }[]> = { [month]: [], [next]: [] };

  snap.forEach((doc) => {
    const m = doc.data();
    const clase = norm(m.clase);
    if (/^av(\s|$)/.test(clase) || clase === "inactive") return;
    if (blocked.has(norm(fullNameOf(m)))) return;

    const [, mm, dd] = String(m.fechaNacimiento || "").slice(0, 10).split("-");
    const mo = Number(mm), day = Number(dd);
    if (!buckets[mo] || !day) return;

    const first = String(m.nombre || fullNameOf(m)).trim().split(/\s+/)[0];
    const last = String(m.apellido || "").trim().split(/\s+/)[0];
    buckets[mo].push({
      nombre: `${first} ${last}`.trim(), dia: day,
      ...(INCLUDE_PHOTOS && m.photoUrl ? { foto: m.photoUrl } : {}),
    });
  });

  const data = {
    today, currentMonth: month,
    months: [month, next].map((n) => ({
      month: n, name: MONTHS[n - 1],
      items: buckets[n].sort((a, b) => a.dia - b.dia || a.nombre.localeCompare(b.nombre, "es")),
    })),
  };
  bdayCache = { at: Date.now(), data };
  return data;
});