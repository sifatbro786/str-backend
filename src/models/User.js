import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    // select:false keeps the hash out of every ordinary query.
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: { type: String, enum: ["super_admin", "admin"], default: "admin", index: true },
    permissions: { type: [String], default: [] },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    // Any token issued before this instant is rejected by `protect`. Set on
    // every password change; select:false so it never rides along in payloads.
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash on create and on any password change (including .save() updates).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // 1s back-date: the JWT `iat` is second-resolution and can otherwise land in
  // the same second as the write, invalidating the token we are about to issue.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
