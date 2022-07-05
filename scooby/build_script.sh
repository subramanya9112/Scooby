cd client
npm run build
cd ../game_server
npm run build
cd ../server
npm run build
cd ..
docker-compose build --no-cache
