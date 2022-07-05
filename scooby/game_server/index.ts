import express, { Request, Response } from 'express';
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import mongoose from 'mongoose';
const app = express();
const port = process.env.PORT || 80;
import { createServer } from 'http';
import { Server } from 'socket.io';
import PlayerModel from './models/PlayerModel';
import Level from './room_generator/class/Level';
import Tiles from './room_generator/class/Tiles';
import * as Defaults from './shared/SERVER_GAME_CONSTANT';
import Room from './database/room';
require("dotenv").config();

const server = createServer(app);
const io = new Server(server, {
    transports: ['polling'],
});
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

app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
    if (req.body.cred) {
        try {
            const ticket = await oAuth2Client.verifyIdToken({
                idToken: req.body.cred,
                audience: process.env.CLIENT_ID,
            });
        } catch (e) {
            console.log(e);
        }
        // console.log(ticket.getPayload());
    }
    next();
});

let players: { [id: string]: PlayerModel; } = {};
let { levels, rooms, enemies } = Tiles.GetLevel(Level.GetLevel(1));

io.on(Defaults.GAME_SERVER_CONNECTION, (socket) => {
    console.log('a user connected');

    // player disconnected
    socket.on(Defaults.GAME_SERVER_DISCONNECT, () => {
        console.log('a user disconnected');

        if (players[socket.id]) {
            players[socket.id].saveToDatabase();
            delete players[socket.id];
        }

        // if no user is present, stop the machine
        if (Object.keys(players).length === 0) {
            setTimeout(async () => {
                await Room.remove({ name: process.env.name });
                console.log('No user is present');
                process.exit(0);
            }, 120000)
        }

        // emit a message to all players to remove this player
        io.emit(Defaults.SERVER_GAME_REMOVE_PLAYER, socket.id);
    });

    socket.on(Defaults.GAME_SERVER_NEW_PLAYER, async ({ x, y, cred, character, password }) => {
        if (process.env.password) {
            if (process.env.password !== password) {
                socket.emit(Defaults.SERVER_GAME_END_LEVEL);
                socket.disconnect();
                return;
            }
        }
        let ticket;
        try {
            ticket = await oAuth2Client.verifyIdToken({
                idToken: cred,
                audience: process.env.CLIENT_ID,
            });
        } catch (e) {
            socket.emit(Defaults.SERVER_GAME_END_LEVEL);
            socket.disconnect();
            return;
        }
        let email = ticket.getPayload()?.email;
        if (!email) {
            socket.disconnect()
            return;
        }
        players[socket.id] = new PlayerModel(email, 100, socket.id, x, y, character);

        // inform the other players of the new player that joined
        socket.broadcast.emit(Defaults.SERVER_GAME_SPAWN_NEW_PLAYER, players[socket.id]);

        // inform the new player of the other players
        socket.emit(Defaults.SERVER_GAME_CREATE_EXISTING_PLAYERS, players);

        // inform of health
        socket.emit(Defaults.SERVER_GAME_PLAYER_HEALTH, { health: players[socket.id].health });

        // inform of xp
        socket.emit(Defaults.SERVER_GAME_PLAYER_XP, { xp: players[socket.id].xp });
    });

    socket.on(Defaults.GAME_SERVER_PLAYER_MOVED, (playerData) => {
        if (players[socket.id]) {
            players[socket.id].x = playerData.x;
            players[socket.id].y = playerData.y;

            socket.broadcast.emit(Defaults.SERVER_GAME_PLAYER_MOVED, players[socket.id]);
        }
    });

    socket.on(Defaults.GAME_SERVER_PLAYER_BULLET_SHOOT, (data) => {
        socket.broadcast.emit(Defaults.SERVER_GAME_PLAYER_BULLET_SHOOT, data);
    });

    socket.on(Defaults.GAME_SERVER_PLAYER_BULLET_REMOVE, (data) => {
        socket.broadcast.emit(Defaults.SERVER_GAME_PLAYER_BULLET_REMOVE, data);
    });

    socket.on(Defaults.GAME_SERVER_ENEMY_TAKE_DAMAGE, ({ enemyId, damage }) => {
        if (enemies[enemyId]) {
            if (enemies[enemyId].takeDamage(damage)) {
                players[socket.id].increaseXP(enemies[enemyId].xp);
                socket.emit(Defaults.SERVER_GAME_PLAYER_XP, { xp: players[socket.id].xp });
                io.emit(Defaults.SERVER_GAME_ENEMY_REMOVE, { enemyId });
                enemies[enemyId].room.remove(enemyId);
                delete enemies[enemyId];
            }
        }
    });

    socket.on(Defaults.GAME_SERVER_PLAYER_TAKE_DAMAGE, ({ damage }) => {
        if (players[socket.id]) {
            if (players[socket.id].decreaseHealth(damage)) {
                socket.emit(Defaults.SERVER_GAME_PLAYER_HEALTH, { health: players[socket.id].health });
                players[socket.id].saveToDatabase();
                socket.emit(Defaults.SERVER_GAME_PLAYER_DIED, {});
                delete players[socket.id];
                socket.disconnect();
            } else {
                socket.emit(Defaults.SERVER_GAME_PLAYER_HEALTH, { health: players[socket.id].health });
            }
        }
    });

    socket.on(Defaults.GAME_SERVER_GIVE_MAP, () => {
        socket.emit(Defaults.SERVER_GAME_TAKE_MAP, levels);
    });

    socket.on(Defaults.GAME_SERVER_ROOM_ENTERRED, async (data) => {
        let roomId = data.roomId, playerPosition = data.playerPosition;
        if (rooms[roomId]) {
            if (rooms[roomId].active === false) {
                rooms[roomId].active = true;
                socket.broadcast.emit(Defaults.SERVER_GAME_ROOM_ENTERRED, roomId);
                io.emit(Defaults.SERVER_GAME_CLOSE_DOOR);
                io.emit(Defaults.SERVER_GAME_CHANGE_PLAYER_POSITION, playerPosition);

                if (process.env.name)
                    await Room.remove({ name: process.env.name });
            } else {
                socket.send(Defaults.SERVER_GAME_ROOM_ENTERRED, roomId);
                socket.send(Defaults.SERVER_GAME_CLOSE_DOOR);
                console.log("send")
            }
        }
    });

    socket.on(Defaults.GAME_SERVER_END_LEVEL, () => {
        io.emit(Defaults.SERVER_GAME_END_LEVEL);

        for (let playerId in players) {
            players[playerId].saveToDatabase();
        }
        process.exit(0);
    });
});

setInterval(function () {
    Object.keys(rooms).forEach(roomId => {
        if (rooms[roomId].enemies.length == 0 && rooms[roomId].active == true) {
            rooms[roomId].active = false;
            io.emit(Defaults.SERVER_GAME_OPEN_DOOR);
        }
    });

    for (let enemyId in enemies) {
        enemies[enemyId].move(players, (id: string, x: number, y: number) => {
            io.emit(Defaults.SERVER_GAME_ENEMY_MOVE, {
                id, x, y
            });
        });
        enemies[enemyId].shoot(players, (id: string, x: number, y: number, angle: number, damage: number) => {
            io.emit(Defaults.SERVER_GAME_ENEMY_SHOOT, {
                id, x, y, angle, damage
            });
        });
    }
}, 1000 / 10);

app.get('/status', async (req: Request, res: Response) => {
    res.send("Server is running");
});

app.get('/refresh', (req: Request, res: Response) => {
    let data = Tiles.GetLevel(Level.GetLevel(1));
    levels = data.levels, enemies = data.enemies, rooms = data.rooms;
    res.send("Changed the data")
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

