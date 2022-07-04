import express, { Request, Response } from 'express';
import { OAuth2Client } from "google-auth-library";
import Docker from 'dockerode';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 80;
require("dotenv").config();
var docker = new Docker();

// Connect to DB
const oAuth2Client = new OAuth2Client({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});
//@ts-ignore
mongoose.connect(process.env.MONGO_URL, {
    //@ts-ignore
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then((conn) => {
    console.log('Connected to MongoDB');
    console.log(`MongoDB connected: ${conn.connection.host}`)
});

// middleware
app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
    if (req.body.cred) {
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: req.body.cred,
            audience: process.env.CLIENT_ID,
        });
        console.log(ticket.getPayload());
    }
    next();
});

function createRoom(roomID) {
    docker.createContainer({
        Image: 'game_server',
        name: roomID,
        HostConfig: {
            NetworkMode: "scooby_frontend",
            AutoRemove: true,
        }
    }).then(container => {
        container.start(async (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            // update database
        });
    });
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
