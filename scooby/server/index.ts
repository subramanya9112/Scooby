import express, { Request, Response } from 'express';
import { OAuth2Client } from "google-auth-library";
import Docker from 'dockerode';
import cors from 'cors';
import Room from './database/room';
import User from './database/user';
import mongoose from 'mongoose';
import Character from './database/character';
import GameData from './GameData';

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
}).then(async (conn) => {
    console.log('Connected to MongoDB');
    console.log(`MongoDB connected: ${conn.connection.host}`);

    let character = await Character.find();
    if (character.length == 0) {
        GameData.gameData.characters.forEach(async character => {
            await Character.create({
                name: character.name,
                path: character.url,
                xp: character.xp,
                health: character.health,
            });
        });
    }
});

// middleware
app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
    if (req.body.cred) {
        try {
            const ticket = await oAuth2Client.verifyIdToken({
                idToken: req.body.cred,
                audience: process.env.CLIENT_ID,
            });
            let email = ticket.getPayload()?.email;
            let name = ticket.getPayload()?.name;
            let user = await User.findOne({ email: email });
            if (!user) {
                let character = await Character.find({ name: "Knight" });
                user = await User.create({
                    email,
                    name,
                    xp: 0,
                    charactersUnlocked: [character[0]._id],
                });
            }
            req.user = user;
        } catch (err) {
            console.log(err);
        }
    }
    next();
});

function createRoom(roomID: string, user: any, privateRoom: boolean, password: string) {
    let env = [`name=${roomID}`]
    if (password)
        env = [`name=${roomID}`, `password=${password}`]
    docker.createContainer({
        Image: 'ubuntu',
        name: roomID,
        HostConfig: {
            // AutoRemove: true,
        },
        Env: [`name=${roomID}`]
    }).then(container => {
        container.start(async (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            // update database
            await Room.create({
                name: roomID,
                createdOn: Date.now(),
                createdBy: user,
                privateRoom,
                password,
            });
        });
    });
}

app.post('/character', async (req: Request, res: Response) => {
    if (req.user) {
        let characters = await Character.find();
        let charactersArr = characters.map(character => {
            return {
                health: character.health,
                name: character.name,
                path: character.path,
                xp: character.xp,
                id: character._id,
                // @ts-ignore
                buyed: req.user.charactersUnlocked.find(characterUnlocked => {
                    return character._id == characterUnlocked._id.toString()
                }),
            }
        });
        res.json({ character: charactersArr });
    } else { res.json({ success: false }); }
});

app.post('/characterBuy', async (req: Request, res: Response) => {
    const { id } = req.body;
    if (id && req.user) {
        let user = req.user;
        // @ts-ignore
        let check = user.charactersUnlocked.find(characterUnlocked => {
            return id == characterUnlocked._id.toString()
        });
        if (check) {
            res.json({ success: true });
            return;
        }
        let character = await Character.findById(id);
        if (character) {
            // @ts-ignore
            if (user.xp >= character.xp) {
                // @ts-ignore
                user.xp -= character.xp;
                // @ts-ignore
                user.charactersUnlocked.push(id);
                // @ts-ignore
                await user.save();
                res.json({ success: true, user: req.user });
            } else {
                res.json({ success: false });
            }
        } else {
            res.json({ success: false });
        }
    } else { res.json({ success: false }); }
});

app.post('/userData', async (req: Request, res: Response) => {
    if (req.user) {
        res.json({ success: true, user: req.user });
    } else { res.json({ success: false }); }
});

app.post('/getRooms', async (req: Request, res: Response) => {
    let rooms = await Room.find({ privateRoom: false });
    if (rooms) {
        res.json({
            success: true,
            rooms: rooms.map(room => {
                return {
                    id: room.name,
                    date: room.createdOn,
                };
            }),
        });
    } else { res.json({ success: false }); }
});

app.post('/createRoom', async (req: Request, res: Response) => {
    const { name, password } = req.body;
    if (name) {
        let room = await Room.find({ name: name })
        if (room.length != 0) {
            res.json({ success: false });
            return;
        }
        if (password)
            createRoom(name, req.user, true, password);
        else
            createRoom(name, req.user, false, password);
        res.json({ success: true });
    } else { res.json({ success: false }); }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
