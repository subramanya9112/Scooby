import { v4 as uuid } from 'uuid';
import EnemyModel from '../../models/EnemyModel';
import RoomType from "../enums/RoomType";
import RoomInterface from "../interfaces/RoomInterface";
import Room from "./Room";

class Tiles {
    private static readonly tileSize: number = 64;
    private static roomSize: number = 40;

    static GetLevel(levelDesign: Room[][]) {
        let level: RoomInterface[] = [];
        let enemies: { [id: string]: EnemyModel; } = {};

        levelDesign.forEach((rowRoom, row) => {
            rowRoom.forEach((room, col) => {
                if (room.getRoomType() !== RoomType.EMPTY) {
                    enemies = Object.assign({}, enemies, {});
                    let id = uuid();
                    if (room.getRoomType() !== RoomType.START) {
                        let roomInt: RoomInterface = {
                            id,
                            tiles: room.getTiles(this.tileSize, this.roomSize, row, col),
                            walls: room.getWalls(this.tileSize, this.roomSize, row, col),
                            doors: room.getDoors(this.tileSize, this.roomSize, row, col),
                            roomCollider: [room.getRoomCollider(this.tileSize, this.roomSize, row, col)],
                            enemies: room.getEnemies(this.tileSize, this.roomSize, row, col),
                        };
                        level.push(roomInt);
                    } else {
                        let roomInt: RoomInterface = {
                            id,
                            tiles: room.getTiles(this.tileSize, this.roomSize, row, col),
                            walls: room.getWalls(this.tileSize, this.roomSize, row, col),
                            doors: room.getDoors(this.tileSize, this.roomSize, row, col),
                            roomCollider: [],
                            enemies: room.getEnemies(this.tileSize, this.roomSize, row, col),
                        };
                        level.push(roomInt);
                    }
                }
            })
        });

        return { level, enemies };
    }
};

export default Tiles;