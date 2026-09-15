import multer from "multer";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

/**
 * Source-file intake for the public graphics order form.
 *
 * ── WHY memoryStorage AND NOT middleware/upload.js ───────────────────────
 * That middleware writes to env.upload.dir, which env.js documents as being
 * wiped on every deploy and every cold start of the current host. A stored
 * path is fine for a hero image an admin can re-upload; it is not fine for a
 * client's only copy of the files they are paying to have edited. The bytes
 * here live for the length of one request, ride out as attachments on the
 * studio's notification, and are dropped. Nothing to lose on deploy, nothing
 * to back up, no orphan sweeper, and no public URL to guess.
 *
 * ── WHY THE CEILINGS ARE WHAT THEY ARE ───────────────────────────────────
 * Gmail rejects a message over 25MB outright, and base64 inflates the payload
 * by roughly a third. TOTAL_BYTES is therefore set so a full batch encodes to
 * well under that: 15MB raw ≈ 20.5MB on the wire. The per-file cap is the
 * second line — five 5MB files is the worst case and it is inside the total.
 * Past this the form asks for a WeTransfer link instead, which is what a
 * four-thousand-image catalogue was always going to need.
 *
 * ⚑ The three numbers live in env.quote, not here, so the ceiling moves with
 * the transport rather than with a deploy of this file. Anything above ~18MB
 * raw needs a real transactional provider first, or every large order bounces
 * silently.
 *
 * ── WHY THE TYPE LIST IS EXPLICIT ────────────────────────────────────────
 * The files are not stored and not served, so stored XSS is not the risk here;
 * deliverability is. Gmail refuses a message carrying an executable attachment
 * with a 552 and the whole order is lost, not just the file. The list below is
 * what a photo studio actually receives, and nothing else gets near the
 * transport.
 *
 * Browsers send application/octet-stream for PSD, RAW and occasionally RAR
 * because the OS has no registered type, so the extension is the fallback
 * check. It is only ever consulted for that one generic mime — an .exe
 * declared as image/jpeg still fails, because the declared type is what the
 * receiving mail server scans on.
 */

const { maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: TOTAL_BYTES } =
  env.quote;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
  "image/vnd.adobe.photoshop",
  "application/x-photoshop",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
]);

const ALLOWED_EXT =
  /\.(jpe?g|png|webp|avif|gif|tiff?|psd|psb|ai|eps|pdf|zip|rar|7z|cr2|nef|arw|dng|raf|heic)$/i;

const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: MAX_FILES,
    // Nine text fields on the form plus the honeypot. An unbounded field count
    // is a cheap way to make busboy allocate on an unauthenticated route.
    fields: 20,
    // 32KB, not 8KB: `instructions` is capped at 4,000 CHARACTERS by the
    // validator and a Bengali or CJK brief is up to four bytes per character.
    // A byte cap tuned to ASCII rejects a perfectly legal brief as
    // LIMIT_FIELD_VALUE, and the visitor has no way to tell why.
    fieldSize: 32 * 1024,
  },
  fileFilter(req, file, cb) {
    const generic =
      file.mimetype === "application/octet-stream" || file.mimetype === "binary/octet-stream";

    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    if (generic && ALLOWED_EXT.test(file.originalname || "")) return cb(null, true);

    cb(
      ApiError.badRequest(
        `"${String(file.originalname || "file").slice(0, 60)}" is not a file type we can take by email. ` +
          `Send images, PSD, TIFF, PDF or a zip — or paste a WeTransfer link instead.`
      )
    );
  },
});

/**
 * multer's own errors are machine codes with terse English messages that the
 * form would render verbatim ("Too many files"). Translated here so the
 * visitor is told what to do next, and so errorHandler keeps knowing nothing
 * about multer.
 *
 * The total-size check has to run AFTER parsing: multer enforces per-file and
 * per-count limits as it streams, but has no notion of a combined budget.
 * Every file is already in memory by this point, which is exactly why the
 * per-file and count caps above are the real protection and this is only the
 * deliverability guard.
 */
export const quoteFiles =
  (field = "files") =>
  (req, res, next) =>
    uploader.array(field, MAX_FILES)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          const messages = {
            LIMIT_FILE_SIZE: `One of those files is over ${mb(MAX_FILE_BYTES)}MB. Send a WeTransfer link for the full batch instead.`,
            LIMIT_FILE_COUNT: `Up to ${MAX_FILES} files per order. For a bigger batch, paste a WeTransfer or Drive link.`,
            LIMIT_UNEXPECTED_FILE: `Unexpected form field. Send files under "${field}".`,
            LIMIT_FIELD_VALUE: "One of those fields is too long. Trim it and try again.",
          };
          return next(ApiError.badRequest(messages[err.code] ?? err.message));
        }
        return next(err);
      }

      const total = (req.files ?? []).reduce((sum, f) => sum + f.size, 0);
      if (total > TOTAL_BYTES) {
        return next(
          ApiError.badRequest(
            `That batch is ${mb(total)}MB and email tops out around ${mb(TOTAL_BYTES)}MB. ` +
              `Paste a WeTransfer or Drive link in the link field and send the order without the files.`
          )
        );
      }

      next();
    });

export default quoteFiles;
