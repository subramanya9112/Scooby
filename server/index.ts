import express, { Request, Response } from 'express';
import Docker from 'dockerode';

const app = express();
const port = process.env.PORT || 80;
var docker = new Docker();

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
