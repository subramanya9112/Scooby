import express, { Request, Response } from 'express';
const app = express();
const port = process.env.PORT || 8000;
import { createServer } from 'http';
import { Server } from 'socket.io';
import Docker from 'dockerode';

var docker = new Docker();
const server = createServer(app);
const io = new Server(server, {
    transports: ['polling'],
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('a user connected');

    // player disconnected
    socket.on('ping', (data) => {
        socket.send('ping', data);
    });
});

setInterval(function () {
    // io.emit(Defaults.SERVER_GAME_ENEMY_SHOOT, {
    //     id, x, y, angle, damage
    // });
    docker.listContainers({
        all: true,
        // @ts-ignore
    }, (err: string, containers: Docker.ContainerInfo[]) => {
        if (err) {
            console.log(err)
            return
        };
        let data: { id: any; names: any; image: any; imageID: any; command: any; created: any; ports: any; state: any; status: any; mounts: any; }[] = [];
        containers.forEach((containerInfo) => {
            data.push({
                id: containerInfo.Id,
                names: containerInfo.Names,
                image: containerInfo.Image,
                imageID: containerInfo.ImageID,
                command: containerInfo.Command,
                created: containerInfo.Created,
                ports: containerInfo.Ports,
                state: containerInfo.State,
                status: containerInfo.Status,
                mounts: containerInfo.Mounts,
            });
        });
        io.emit('containerList', data);
    });
}, 100);

app.get('/', async (req: Request, res: Response) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

