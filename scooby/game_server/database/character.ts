import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    path: String,
    xp: Number,
});

const Character = mongoose.model("Character", characterSchema);
export default Character;
