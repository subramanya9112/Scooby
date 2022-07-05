import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    name: String,
    path: String,
    xp: Number,
    health: Number,
});

const Character = mongoose.model("Character", characterSchema);
export default Character;
