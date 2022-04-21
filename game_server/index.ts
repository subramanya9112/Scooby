import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 80;
import { createServer } from 'http';
import { Server } from 'socket.io';
import PlayerModel from './models/PlayerModel';
import Level from './room_generator/class/Level';
import Tiles from './room_generator/class/Tiles';

const server = createServer(app);
const io = new Server(server);

app.use(express.json());

let players: { [id: string]: PlayerModel; } = {};

let levelData = Level.GetLevel(1);
let level = Tiles.GetLevel(levelData);

io.on('connection', (socket) => {
    console.log('a user connected');

    // player disconnected
    socket.on('disconnect', () => {
        console.log('a user disconnected');

        // delete user data from the server
        delete players[socket.id];

        // emit a message to all players to remove this player
        io.emit('removePlayer', socket.id);
    });

    socket.on('newPlayer', ({ x, y }) => {
        players[socket.id] = new PlayerModel(socket.id, x, y);

        // inform the other players of the new player that joined
        socket.broadcast.emit('spawnPlayer', players[socket.id]);

        // inform the new player of the other players
        socket.emit('createPlayers', players);
    });

    socket.on('playerMovement', (playerData) => {
        if (players[socket.id]) {
            players[socket.id].x = playerData.x;
            players[socket.id].y = playerData.y;

            socket.broadcast.emit('playerMovement', players[socket.id]);
        }
    });

    socket.on('bulletShot', (data) => {
        socket.broadcast.emit('otherPlayerBulletShot', data);
    });

    socket.on('bulletRemove', (data) => {
        socket.broadcast.emit('otherPlayerBulletRemove', data);
    });

    socket.on('getMap', () => {
        socket.emit('gotMap', level);
    });

    socket.on('levelComplete', () => {
        levelData = Level.GetLevel(1);
        level = Tiles.GetLevel(levelData);
        socket.emit("levelCompleted");
        socket.broadcast.emit("levelCompleted");
    });
});

app.get('/status', async (req: Request, res: Response) => {
    res.send("Server is running");
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

