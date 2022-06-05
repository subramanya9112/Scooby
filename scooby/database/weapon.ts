import mongoose from "mongoose";

const weaponSchema = new mongoose.Schema({
    path: String,
    xp: Number,
});

const Weapon = mongoose.model("Weapon", weaponSchema);
export default Weapon;
