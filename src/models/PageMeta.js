import mongoose from "mongoose";

const pageMetaSchema = new mongoose.Schema(
  {
    pageIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // ⚑ Mirrored in validators/pageMeta.validator.js (IDENTIFIERS) and in
      // str-frontend/app/(admin)/admin/page-meta/page.js. All three move
      // together: this one alone rejects the write at the schema, the
      // validator alone rejects it with a 400, and the admin list alone means
      // nobody can reach the editor for it.
      // ⚑ "overview" was removed from this enum. The /overview ROUTE still
      // exists — it is kept alive for links already sent to clients — but it
      // renders the same
      // page as /packages and asks buildMetadata for identifier "packages", so
      // it has no <head> of its own and no row to edit.
      //
      // Dropping a value does NOT rewrite the stored document. The existing
      // row keeps pageIdentifier: "overview", stops matching this enum, and
      // becomes unreachable from the dashboard while still sitting in the
      // collection. Pick one, once:
      //
      //   // (a) the overview copy is the copy you want on /packages —
      //   //     replaces whatever the old BDT-catalogue row said
      //   db.pagemetas.deleteOne({ pageIdentifier: "packages" });
      //   db.pagemetas.updateOne(
      //     { pageIdentifier: "overview" },
      //     { $set: { pageIdentifier: "packages" } }
      //   );
      //
      //   // (b) you will rewrite the Packages row by hand in the dashboard
      //   db.pagemetas.deleteOne({ pageIdentifier: "overview" });
      //
      // Doing neither is not fatal — /packages falls back to the code defaults
      // in its generateMetadata — but it leaves a dead row behind, and
      // getPageMeta swallows its own failures, so nothing will tell you.
      enum: [
        "home",
        "about",
        "services",
        "projects",
        // The image production line. Not in the navbar.
        "graphics",
        "packages",
        "blogs",
        "contact",
      ],
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
    dynamicHeroHeadline: { type: String, default: "" },
    dynamicHeroSubtitle: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("PageMeta", pageMetaSchema);
