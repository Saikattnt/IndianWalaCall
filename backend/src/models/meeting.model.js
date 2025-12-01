import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  user_id: { type: String },
  meetingCode: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
});

export const Meeting = mongoose.model("Meeting", meetingSchema); // we don't use default when we have to export many things from on js file but in case of default it allows only one export
