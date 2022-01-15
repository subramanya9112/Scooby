import RoomType from "../enums/RoomType";
import Room from "./Room";
import LevelInterface from '../interfaces/LevelInterface';

class Tiles {
    private readonly tileSize: number = 64;
    private roomSize: number = 40;

    private getTiles(levelDesign: Room[][]) {
        let level: LevelInterface = {
            levelDesign: levelDesign,
            tiles: [],
            walls: [],
            doors: [],
            roomCollider: [],
        };

        levelDesign.forEach((rowRoom, row) => {
            rowRoom.forEach((room, col) => {
                if (room.getRoomType() === RoomType.END) {
                    level = {
                        levelDesign: level.levelDesign,
                        tiles: level.tiles.concat(room.getTiles(this.tileSize, this.roomSize, row, col)),
                        walls: level.walls.concat(room.getWalls(this.tileSize, this.roomSize, row, col)),
                        doors: level.doors.concat(room.getDoors(this.tileSize, this.roomSize, row, col)),
                        roomCollider: level.roomCollider.concat(room.getRoomCollider(this.tileSize, this.roomSize, row, col)),
                    };
                } else if (room.getRoomType() !== RoomType.EMPTY) {
                    level = {
                        levelDesign: level.levelDesign,
                        tiles: level.tiles.concat(room.getTiles(this.tileSize, this.roomSize, row, col)),
                        walls: level.walls.concat(room.getWalls(this.tileSize, this.roomSize, row, col)),
                        doors: level.doors.concat(room.getDoors(this.tileSize, this.roomSize, row, col)),
                        roomCollider: level.roomCollider,
                    };
                }
            })
        });

        return level;
    }

    public static GetLevel(levelDesign: Room[][]) {
        return (new Tiles()).getTiles(levelDesign);
    }
};

export default Tiles;