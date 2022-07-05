import mongoose from "mongoose";
const Schema = mongoose.Schema;

const roomSchema = new mongoose.Schema({
    name: String,
    createdOn: Date,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    privateRoom: Boolean,
    password: String,
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
