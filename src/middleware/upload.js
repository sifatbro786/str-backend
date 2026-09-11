import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import toSlug from "../utils/slug.js";

/**
 * Image upload middleware.
 *
 * ── WHY A FOLDER WHITELIST AND NOT A FREE PATH ───────────────────────────
 * The destination comes from the URL (`POST /uploads/services`). Anything
 * taken from a request and appended to a filesystem path is a traversal bug
 * waiting to happen, and "../../src/routes" is a perfectly valid-looking
 * segment. A fixed Set removes the class of bug entirely rather than trying to
 * sanitise it: a value that is not in the list never reaches path.join.
 *
 * ── WHY SVG IS NOT ALLOWED ───────────────────────────────────────────────
 * An SVG is a document, not a bitmap: it can carry <script> and an onload
 * handler, and opening the stored file directly executes it on this API's
 * origin. That is stored XSS against whatever session lives on this host. If
 * SVG logos are ever needed, they get their own route that strips scripting
 * before writing, not an entry in this map.
 *
 * ── WHY THE FILENAME IS REWRITTEN ────────────────────────────────────────
 * `file.originalname` is attacker-controlled and arrives with whatever the OS
 * allowed: "../", NUL bytes, 300 characters of Unicode, or "index.html". The
 * stored name is derived instead — a slug of the original stem for human
 * recognisability, plus random bytes so two uploads of "hero.png" never
 * collide and nobody can guess or overwrite an existing path.
 *
 * ── WHY THE EXTENSION COMES FROM THE MIME TYPE ───────────────────────────
 * Trusting the uploaded extension lets "payload.html" be stored as .html and
 * served as HTML from this origin. The extension is looked up from the
 * declared mime type instead, so the file is only ever written with one of the
 * four extensions in ALLOWED. The mime type is still client-supplied, which is
 * why express.static below serves with `nosniff` and why the type is not
 * trusted for anything except picking a suffix.
 */

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

export const UPLOAD_FOLDERS = new Set(["services", "projects", "team", "blogs", "partners", "misc"]);

/** Rejects an unknown folder before multer opens a write stream. */
export function validateFolder(req, res, next) {
  if (!UPLOAD_FOLDERS.has(req.params.folder)) {
    return next(
      ApiError.badRequest(
        `Unknown upload folder. Use one of: ${[...UPLOAD_FOLDERS].join(", ")}`
      )
    );
  }
  next();
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Folder is already whitelisted by validateFolder, which runs first on the
    // route. Creating it lazily rather than at boot keeps a fresh clone and a
    // fresh persistent disk both working with no setup step.
    const dir = path.join(env.upload.dir, req.params.folder);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },

  filename(req, file, cb) {
    const ext = ALLOWED.get(file.mimetype) ?? ".bin";
    const stem = toSlug(path.parse(file.originalname || "image").name).slice(0, 48) || "image";
    cb(null, `${stem}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const uploader = multer({
  storage,
  limits: {
    fileSize: env.upload.maxBytes,
    files: 1,
    // Nothing on this route reads a text field, and an unbounded field count
    // is a cheap way to make the parser allocate.
    fields: 4,
  },
  fileFilter(req, file, cb) {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(
      ApiError.badRequest(
        `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, AVIF.`
      )
    );
  },
});

/**
 * multer surfaces its limits as MulterError with a machine code and a terse
 * English message ("File too large"), which the admin form would render
 * verbatim. Translating here keeps errorHandler free of any knowledge of
 * multer, and gives the author a message that says what to do next.
 */
export const singleImage =
  (field = "file") =>
  (req, res, next) =>
    uploader.single(field)(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        const mb = (env.upload.maxBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
        const messages = {
          LIMIT_FILE_SIZE: `Image is larger than ${mb}MB. Export it smaller or use WebP.`,
          LIMIT_FILE_COUNT: "One image per request.",
          LIMIT_UNEXPECTED_FILE: `Unexpected form field. Send the file under "${field}".`,
        };
        return next(ApiError.badRequest(messages[err.code] ?? err.message));
      }

      return next(err);
    });

export default uploader;
