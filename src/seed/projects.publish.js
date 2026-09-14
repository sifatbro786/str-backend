import fs from "node:fs/promises";
import path from "node:path";

import env from "../config/env.js";
import MEDIA, { MEDIA_FOLDER } from "./projects.media.js";

/**
 * Pushes the locally captured project images to a REMOTE API and repoints the
 * project records at them.
 *
 *   npm run seed:projects:publish -- --api=https://global.strsltd.com/api/v1 \
 *       --email=admin@example.com --password='…'
 *
 *   # credentials can come from the environment instead
 *   PUBLISH_EMAIL=… PUBLISH_PASSWORD=… npm run seed:projects:publish -- --api=…
 *
 *   --dry-run   list what would be uploaded and patched, change nothing
 *
 * ── WHY THIS IS NEEDED AT ALL ────────────────────────────────────────────
 * The database is shared and the filesystem is not. `npm run seed:projects`
 * writes records into Atlas, which the deployed API reads immediately — so
 * the case studies go live the moment they are seeded. The 70 image files it
 * points at were written to THIS machine's uploads/projects, and the deployed
 * API has its own disk. The result is a live catalogue whose every image 404s
 * and falls back to the STR logo, with nothing broken from the database's
 * point of view.
 *
 * So the files have to travel, and this is the supported way for them to do
 * it: the same POST /uploads/:folder route the admin form uses, with the same
 * validation, the same folder whitelist and the same ownership. Copying the
 * directory onto the host by hand works too and is faster if you have shell
 * access — but that is not always true of a container platform, and it
 * silently does nothing at all on a host with an ephemeral filesystem.
 *
 * ── WHY IT REWRITES THE RECORDS AFTERWARDS ───────────────────────────────
 * The upload route appends fresh random bytes to every stored filename so two
 * uploads of the same name cannot collide. That is correct for the route and
 * inconvenient here: the remote path will not equal the local one, so the
 * records have to be patched to the URLs the server actually returned.
 *
 * ⚑ Which means a later `npm run seed:projects -- --force` REVERTS the image
 * paths to this machine's local ones, and the live images go back to falling
 * back. If you force-reseed, re-run this afterwards.
 *
 * ── RATE LIMIT ───────────────────────────────────────────────────────────
 * uploadLimiter allows 60 uploads per window and there are 70 files, so a
 * clean run WILL hit 429 near the end. That is expected rather than a bug:
 * the script waits out the window and continues instead of failing the run.
 */

const args = process.argv.slice(2);
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const API = (flag("api") ?? process.env.PUBLISH_API ?? "").replace(/\/+$/, "");
const EMAIL = flag("email") ?? process.env.PUBLISH_EMAIL;
const PASSWORD = flag("password") ?? process.env.PUBLISH_PASSWORD;
const DRY = args.includes("--dry-run");

const log = (...a) => console.log("[seed:projects:publish]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LOCAL_DIR = path.join(env.upload.dir, MEDIA_FOLDER);

/** The static mount sits outside /api, so strip the version segment off. */
const staticOrigin = () => new URL(API).origin;

function usage(message) {
  console.error(`[seed:projects:publish] ${message}

  npm run seed:projects:publish -- --api=<base>/api/v1 --email=<admin> --password=<pw>
  npm run seed:projects:publish -- --api=… --dry-run

  Credentials may also come from PUBLISH_API / PUBLISH_EMAIL / PUBLISH_PASSWORD.`);
  process.exitCode = 1;
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login failed (HTTP ${res.status}): ${body.message ?? "no message"}`);

  /* The API sets an httpOnly cookie AND returns the token in the body. A
     cookie jar is the browser's job; here the bearer header is simpler and is
     what auth.middleware.js checks first. */
  const token = body.token ?? body.data?.token;
  if (!token) throw new Error("login succeeded but no token came back in the response body");

  log(`authenticated as ${body.data?.user?.email ?? EMAIL}`);
  return token;
}

/**
 * Already on the remote disk under this exact path? Nothing to upload, then.
 *
 * ── WHY A RETRY ON A HEAD REQUEST ────────────────────────────────────────
 * A failed request and a missing file are not the same thing, but this
 * function collapses them into one boolean — and the caller reads `false` as
 * "upload it". So a single dropped connection during a 70-image sweep costs a
 * duplicate file on the host, and a slow host costs seventy. One retry turns
 * the common transient case back into the right answer, which is worth more
 * than the second or two it adds.
 */
async function servedAt(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(`${staticOrigin()}${url}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(20_000),
    }).catch(() => null);

    if (res) return res.ok; // a real 404 is an answer; stop asking
    if (attempt === 1) await sleep(1500);
  }
  return false;
}

/**
 * Record of what this machine has already pushed where.
 *
 * ── WHY A MANIFEST AND NOT JUST A HEAD REQUEST ───────────────────────────
 * The obvious resume check — "does the remote serve this path?" — is wrong on
 * its own, and wrong in the expensive direction. The upload route appends its
 * own random bytes, so a file pushed as `teads-cover-0dc4….png` is STORED as
 * `teads-cover-0dc4…-9f1b….png`. The original path stays a 404 forever, so
 * every re-run reads as "nothing uploaded yet" and pushes all seventy again,
 * leaving seventy more orphans on the host each time. A run interrupted by the
 * rate limit is the most likely run to be repeated, which is exactly when that
 * bites.
 *
 * So the remote name is remembered here, keyed by API origin (staging and
 * production hold different files under different names), and confirmed with a
 * HEAD before it is trusted — a manifest pointing at a file somebody deleted
 * is worse than no manifest.
 */
const MANIFEST = path.join(env.upload.dir, ".publish-manifest.json");

async function loadManifest() {
  const raw = await fs.readFile(MANIFEST, "utf8").catch(() => null);
  if (!raw) return {};
  try {
    return JSON.parse(raw)[staticOrigin()] ?? {};
  } catch {
    log("⚠ manifest unreadable, treating every image as unpublished");
    return {};
  }
}

/**
 * What the live records already point at, keyed by local filename stem.
 *
 * The backstop for a manifest that does not exist — a run from another
 * machine, a manifest deleted with the uploads folder, or a run made before
 * the manifest existed at all. The upload route stores a file as
 * `<local stem>-<fresh hex>.<ext>`, so a record holding a path that begins
 * with the local stem is that image, already published under the server's own
 * name. Matching on the stem is safe because the stem already ends in sixteen
 * hex characters derived from the key: a collision would need two different
 * keys to hash the same.
 */
async function publishedInRecords() {
  const res = await fetch(`${API}/projects?limit=200`).catch(() => null);

  /* Loud, because the quiet version is expensive. An empty map here does not
     mean "nothing is published" — it means "could not tell", and the caller
     treats the two identically: every image goes back on the upload queue and
     the host collects a second copy of all seventy. A warning is the
     difference between noticing that and paying for it. */
  if (!res?.ok) {
    log(`⚠ could not read published records (${res ? `HTTP ${res.status}` : "request failed"}).`);
    log("  Falling back to the manifest alone — anything it does not know will be re-uploaded.");
    return new Map();
  }

  const body = await res.json().catch(() => ({}));
  const urls = (body.data ?? []).flatMap((p) => [
    p.coverImage,
    p.thumbnailImage,
    p.ogImage,
    ...(p.galleryImages ?? []).map((g) => g.url),
  ]);

  const byStem = new Map();
  for (const url of urls.filter(Boolean)) {
    const base = url.split("/").pop();
    const stem = base.replace(/\.[a-z]+$/i, "");
    byStem.set(stem, url);
  }
  return byStem;
}

async function saveManifest(known) {
  const raw = await fs.readFile(MANIFEST, "utf8").catch(() => "{}");
  let all = {};
  try {
    all = JSON.parse(raw);
  } catch {
    /* Corrupt file is replaced rather than appended to. */
  }
  all[staticOrigin()] = known;
  await fs.writeFile(MANIFEST, JSON.stringify(all, null, 2));
}

async function uploadOne(token, entry) {
  const bytes = await fs.readFile(path.join(LOCAL_DIR, entry.filename));
  const type = entry.ext === "png" ? "image/png" : "image/jpeg";

  for (let attempt = 1; attempt <= 5; attempt++) {
    const form = new FormData();
    form.append("file", new Blob([bytes], { type }), entry.filename);

    const res = await fetch(`${API}/uploads/${MEDIA_FOLDER}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (res.status === 429) {
      /* Wait out the limiter rather than dying 60 files in. Honour
         Retry-After when the server sends one; otherwise back off. */
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 60_000 * attempt;
      log(`  rate limited — waiting ${Math.round(wait / 1000)}s (attempt ${attempt}/5)`);
      await sleep(wait);
      continue;
    }

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.message ?? "upload rejected"}`);
    return body.data.url;
  }

  throw new Error("still rate limited after 5 attempts");
}

/** Applies key→newUrl to one record's image fields. Returns null if unchanged. */
function rewrite(project, map) {
  const swap = (url) => (url && map.has(url) ? map.get(url) : url);

  const patch = {};
  for (const field of ["coverImage", "thumbnailImage", "ogImage"]) {
    const next = swap(project[field]);
    if (next !== project[field]) patch[field] = next;
  }

  if (project.galleryImages?.some((g) => map.has(g.url))) {
    patch.galleryImages = project.galleryImages.map((g) => ({
      url: swap(g.url),
      caption: g.caption ?? "",
      layoutType: g.layoutType ?? "half",
    }));
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

async function run() {
  if (!API) return usage("--api is required, e.g. --api=https://global.strsltd.com/api/v1");
  if (!DRY && (!EMAIL || !PASSWORD)) return usage("--email and --password are required");

  /* A re-run costs one HEAD per image and uploads only the genuine gap. Two
     ways an image can already be published, and both have to be honoured or
     the rate-limited run gets duplicated:

       · the manifest knows where this machine put it, and it is still there
       · the remote serves it under its own name, which is what a plain
         `scp -r uploads/projects` onto the host produces — and that route
         needs no patching at all, since the path already matches the record

     Checked before login, so --dry-run needs no credentials. */
  log(`checking ${MEDIA.size} images against ${staticOrigin()} …`);
  const known = await loadManifest();
  const inRecords = await publishedInRecords();

  /* localUrl → remoteUrl for everything already published, so records are
     repointed even when this run uploads nothing new. */
  const map = new Map();
  const inPlace = [];
  const todo = [];

  for (const entry of [...MEDIA.values()]) {
    const remembered = known[entry.key];
    if (remembered && (await servedAt(remembered))) {
      map.set(entry.url, remembered);
      inPlace.push(entry);
      continue;
    }
    if (await servedAt(entry.url)) {
      inPlace.push(entry); // already at the path the record holds; no patch
      continue;
    }

    /* No manifest, but a record already points at this image under the
       server's own name — a previous run from another machine, or one made
       before the manifest existed. Adopt it rather than uploading a second
       copy, and write it to the manifest so the next run is cheap. */
    const stem = entry.filename.replace(/\.[a-z]+$/i, "");
    const adopted = [...inRecords].find(([s]) => s.startsWith(`${stem}-`))?.[1];
    if (adopted && (await servedAt(adopted))) {
      known[entry.key] = adopted;
      inPlace.push(entry);
      continue;
    }

    todo.push(entry);
  }

  log(`${inPlace.length} already published · ${todo.length} to upload`);
  if (DRY) {
    for (const e of todo) log(`  would upload ${e.filename}`);
    log("dry run — nothing changed.");
    return;
  }
  if (todo.length === 0 && map.size === 0) {
    log("remote already serves every image under the path the records hold.");
    return;
  }

  /* Needed for the uploads AND for the PATCH pass, and a resumed run may have
     nothing left to upload while still having records to repoint. */
  const token = await login();

  const failures = [];
  for (const entry of todo) {
    try {
      const url = await uploadOne(token, entry);
      map.set(entry.url, url);
      /* Written after EVERY upload, not at the end. The run this protects is
         the one that dies half way — recording only on success would lose
         the whole batch that prompted the manifest in the first place. */
      known[entry.key] = url;
      await saveManifest(known);
      log(`  uploaded ${entry.key} → ${url}`);
    } catch (err) {
      failures.push([entry.key, err.message]);
      log(`  ✗ ${entry.key}: ${err.message}`);
    }
  }

  if (map.size === 0) {
    log("nothing published under a new name; records left alone.");
    if (failures.length > 0) process.exitCode = 1;
    return;
  }

  const listRes = await fetch(`${API}/projects/admin/all?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = await listRes.json();
  if (!listRes.ok) throw new Error(`could not list projects (HTTP ${listRes.status})`);

  let patched = 0;
  for (const project of list.data ?? []) {
    const patch = rewrite(project, map);
    if (!patch) continue;

    const res = await fetch(`${API}/projects/${project._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      log(`  ✗ patch ${project.slug}: HTTP ${res.status} ${body.message ?? ""}`);
      failures.push([project.slug, `patch HTTP ${res.status}`]);
      continue;
    }
    patched += 1;
    log(`  repointed ${project.slug}`);
  }

  log(`done — ${map.size} uploaded, ${patched} record(s) repointed.`);
  if (failures.length > 0) {
    log(`⚠ ${failures.length} failed; re-run to retry just those:`);
    for (const [k, m] of failures) log(`   · ${k}: ${m}`);
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error("[seed:projects:publish] failed:", err.message);
  process.exitCode = 1;
});
