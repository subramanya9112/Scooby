import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    email: String,
    gid: String,
    name: String,
    platform: String,
    picture: String,
    xp: Number,
    charactersUnlocked: [{
        type: Schema.Types.ObjectId,
        ref: 'Character',
    }],
    weaponsLocked: [{
        type: Schema.Types.ObjectId,
        ref: 'Weapon',
    }],
});

const User = mongoose.model("User", userSchema);
export default User;
