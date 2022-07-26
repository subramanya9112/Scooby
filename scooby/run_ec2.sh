docker network create frontend
docker run -d --network=frontend --name=visualizer subramanyag/visualizer
docker run -d --network=frontend --name=client subramanyag/client
docker run -d --network=frontend \
        --name=mongodb \
        -p 27016:27017 \
        -v mongodb:/data/db \
        -e MONGO_INITDB_ROOT_USERNAME=root \
        -e MONGO_INITDB_ROOT_PASSWORD=password \
        -e MONGO_INITDB_DATABASE=scooby \
        mongo
docker run -d --network=frontend \
        --name=server \
        -v //var/run/docker.sock:/var/run/docker.sock \
        --env-file ./server/.env \
        subramanyag/server
docker run -d --network=frontend -p 443:443 \
        -v /${PWD}/nginx/nginx.conf:/etc/nginx/nginx.conf \
        -v /${PWD}/nginx/cert.key:/etc/nginx/cert.key \
        -v /${PWD}/nginx/cert.crt:/etc/nginx/cert.crt \
        nginx