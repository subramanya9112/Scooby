docker image tag server subramanyag/server:latest
docker image tag client subramanyag/client:latest
docker image tag game_server subramanyag/game_server:latest
docker image push subramanyag/server:latest
docker image push subramanyag/client:latest
docker image push subramanyag/game_server:latest
