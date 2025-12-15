import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User }; // we don't use default when we have to export many things from on js file but in case of default it allows only one export
