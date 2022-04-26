import EnemyModel from '../../models/EnemyModel';
import RoomModel from '../../models/RoomModel';
import RoomType from "../enums/RoomType";
import RoomInterface from "../interfaces/RoomInterface";
import Room from "./Room";

class Tiles {
    private static readonly tileSize: number = 64;
    private static roomSize: number = 40;

    static GetLevel(levelDesign: Room[][]) {
        let levels: RoomInterface[] = [];
        let enemies: { [id: string]: EnemyModel; } = {};
        let rooms: { [id: string]: RoomModel; } = {};

        levelDesign.forEach((rowRoom, row) => {
            rowRoom.forEach((roomClass, col) => {
                if (roomClass.getRoomType() !== RoomType.EMPTY) {
                    let { level, enemy, room } = roomClass.getData(this.tileSize, this.roomSize, row, col);
                    levels.push(level);
                    enemies = Object.assign({}, enemies, enemy);
                    rooms[room.id] = room;
                }
            })
        });

        return { levels, rooms, enemies };
    }
};

export default Tiles;