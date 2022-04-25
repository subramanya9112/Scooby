import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 80;
import { createServer } from 'http';
import { Server } from 'socket.io';
import PlayerModel from './models/PlayerModel';
import Level from './room_generator/class/Level';
import Tiles from './room_generator/class/Tiles';
import * as Defaults from '../shared/SERVER_GAME_CONSTANT';

const server = createServer(app);
const io = new Server(server);

app.use(express.json());

let players: { [id: string]: PlayerModel; } = {};
let { levels, rooms, enemies } = Tiles.GetLevel(Level.GetLevel(1));

io.on(Defaults.GAME_SERVER_CONNECTION, (socket) => {
    console.log('a user connected');

    // player disconnected
    socket.on(Defaults.GAME_SERVER_DISCONNECT, () => {
        console.log('a user disconnected');

        // delete user data from the server
        delete players[socket.id];

        // emit a message to all players to remove this player
        io.emit(Defaults.SERVER_GAME_REMOVE_PLAYER, socket.id);
    });

    socket.on(Defaults.GAME_SERVER_NEW_PLAYER, ({ x, y }) => {
        players[socket.id] = new PlayerModel(socket.id, x, y);

        // inform the other players of the new player that joined
        socket.broadcast.emit(Defaults.SERVER_GAME_SPAWN_NEW_PLAYER, players[socket.id]);

        // inform the new player of the other players
        socket.emit(Defaults.SERVER_GAME_CREATE_EXISTING_PLAYERS, players);
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

    socket.on(Defaults.GAME_SERVER_GIVE_MAP, () => {
        socket.emit(Defaults.SERVER_GAME_TAKE_MAP, levels);
    });

    socket.on(Defaults.GAME_SERVER_ROOM_ENTERRED, (data) => {
        let roomId = data.roomId, playerPosition = data.playerPosition;
        if (rooms[roomId] && rooms[roomId].active === false) {
            rooms[roomId].active = true;
            socket.broadcast.emit(Defaults.SERVER_GAME_ROOM_ENTERRED, roomId);
            io.emit(Defaults.SERVER_GAME_CLOSE_DOOR);
            io.emit(Defaults.SERVER_GAME_CHANGE_PLAYER_POSITION, playerPosition);
        }
    });

    socket.on(Defaults.GAME_SERVER_END_LEVEL, () => {
        let data = Tiles.GetLevel(Level.GetLevel(1));
        levels = data.levels, enemies = data.enemies, rooms = data.rooms;
        io.emit(Defaults.SERVER_GAME_END_LEVEL);
    });
});

setInterval(function () {
    Object.keys(rooms).forEach(roomId => {
        if (rooms[roomId].enemies.length == 0 && rooms[roomId].active == true) {
            rooms[roomId].active = false;
            io.emit("openDoor");
        }
    });

    for (let enemyId in enemies) {
        enemies[enemyId].move(players, (id: string, x: number, y: number) => {
            io.emit(Defaults.SERVER_GAME_ENEMY_MOVE, {
                id, x, y
            });
        });
        enemies[enemyId].shoot(players, (id: string, x: number, y: number, angle: number) => {
            io.emit(Defaults.SERVER_GAME_ENEMY_SHOOT, {
                id, x, y, angle
            });
        });
    }
}, 1000 / 10);

app.get('/status', async (req: Request, res: Response) => {
    res.send("Server is running");
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

