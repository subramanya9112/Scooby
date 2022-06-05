import express, { Request, Response } from 'express';
import Docker from 'dockerode';

const app = express();
const docker = new Docker();
const port = process.env.PORT || 80;

app.use(express.json());

app.post('/create-docker', async (req: Request, res: Response) => {
    const name = req.body.name;

    if (!name) {
        res.status(400).send({
            message: 'Name is required',
            status: 400
        });
    } else {
        docker.listContainers(async (err, containers: Docker.ContainerInfo[]) => {
            var flag = true;
            const nameAdded = `/${name}`;

            for (var i = 0; i < containers.length; i++) {
                if (containers[i].Names.includes(nameAdded)) {
                    flag = false;
                    break;
                }
            }

            if (flag) {
                const container = await docker.createContainer({
                    Image: 'httpd',
                    name,
                });

                container.start({
                    "HostConfig": {
                        "NetworkMode": "frontend"
                    }
                }, () => {
                    console.log(`${name} docker started`)

                    res.send({
                        message: "Success",
                        name: name,
                        status: 200,
                    });
                });
            } else {
                res.send({
                    message: "Failure",
                    name: name,
                    status: 200,
                });
            }
        });
    }
});

app.post('/remove-docker', async (req: Request, res: Response) => {
    const name = req.body.name;

    if (!name) {
        res.status(400).send({
            message: 'Name is required',
            status: 400
        });
    } else {
        docker.listContainers(async (err, containers: Docker.ContainerInfo[]) => {
            const nameAdded = `/${name}`;
            var i = 0;

            for (; i < containers.length; i++) {
                if (containers[i].Names.includes(nameAdded)) {
                    break;
                }
            }

            if (i < containers.length) {
                docker.getContainer(containers[i].Id).stop(() => {
                    console.log(`${name} docker stopped`)
                    docker.getContainer(containers[i].Id).remove(() => {
                        console.log(`${name} docker removed`)
                        res.send({
                            message: "Success",
                            name: name,
                            status: 200,
                        });
                    });
                });
            } else {
                res.send({
                    message: "Failure",
                    name: name,
                    status: 200,
                });
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

