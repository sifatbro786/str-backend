import fs from "node:fs/promises";
import path from "node:path";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { UPLOAD_FOLDERS } from "../middleware/upload.js";

/**
 * POST /api/v1/uploads/:folder
 *
 * Returns the stored path, not an absolute URL. The API host is not the only
 * origin that serves this project (Next runs on its own domain, and the same
 * database is read by a local dev server), so an absolute URL baked into a
 * record goes stale the moment the API moves. The frontend joins the path
 * against its own API origin at render time.
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file received. Send one image under the field name "file".');
  }

  const url = `${env.upload.publicPath}/${req.params.folder}/${req.file.filename}`;

  res.status(201).json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      folder: req.params.folder,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

/**
 * DELETE /api/v1/uploads/:folder/:filename
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────
 * Replacing a service image writes a new file and rewrites the record. Without
 * this route the old file stays on disk forever, and after a year of edits the
 * upload folder is mostly orphans that nobody can tell apart from live ones.
 *
 * ── WHY THE FILENAME IS PATTERN-MATCHED AND NOT JUST JOINED ──────────────
 * This is the one route that deletes from the filesystem based on a request
 * parameter. path.join(dir, "../../.env") resolves cleanly and happily. The
 * regex below admits only the shape this API itself writes (slug, dash, hex,
 * known extension), so a traversal segment, a dotfile and an absolute path are
 * all rejected before any filesystem call. The resolved-prefix check after it
 * is belt and braces: if the pattern is ever loosened, the guard still holds.
 *
 * A missing file answers 200, not 404. The caller's intent is "this file
 * should not exist", and a record pointing at an already-deleted file is the
 * exact case where the admin panel needs the delete to succeed so it can clear
 * the field.
 */
const SAFE_FILENAME = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{16}\.(?:jpg|png|webp|avif)$/;

export const deleteUpload = asyncHandler(async (req, res) => {
  const { folder, filename } = req.params;

  if (!UPLOAD_FOLDERS.has(folder)) throw ApiError.badRequest("Unknown upload folder");
  if (!SAFE_FILENAME.test(filename)) throw ApiError.badRequest("Not an uploaded filename");

  const target = path.resolve(env.upload.dir, folder, filename);
  const root = path.resolve(env.upload.dir);
  if (!target.startsWith(root + path.sep)) throw ApiError.badRequest("Path outside upload root");

  await fs.unlink(target).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });

  res.json({ success: true, message: "Upload deleted" });
});
