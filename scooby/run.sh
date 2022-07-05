docker network create frontend
docker run -d --network=frontend --name=client client
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
        server
docker run -d --network=frontend -p 80:80 -v /${PWD}/nginx/nginx.conf:/etc/nginx/nginx.conf nginx