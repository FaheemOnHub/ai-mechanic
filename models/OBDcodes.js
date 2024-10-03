import mongoose from "mongoose";

const obdCodeSchema = new mongoose.Schema({
  OBD_CODE: String,
  Meaning: String,
  Cause: [String],
  Symptoms: [String],
  embedding: [Number], // For storing embeddings
});

const OBDCode = mongoose.model("OBDCode", obdCodeSchema);
export default OBDCode;
