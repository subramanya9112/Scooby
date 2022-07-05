import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    xp: Number,
    charactersUnlocked: [{
        type: Schema.Types.ObjectId,
        ref: 'Character',
    }],
});

const User = mongoose.model("User", userSchema);
export default User;
