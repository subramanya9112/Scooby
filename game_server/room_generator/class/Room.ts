import RoomType from '../enums/RoomType';
import Direction from '../enums/Direction';
import WallInterface from '../interfaces/WallInterface';
import TileInterface from '../interfaces/TileInterface';
import RoomColliderInterface from '../interfaces/RoomColliderInterface';
import DoorInterface from '../interfaces/DoorInterface';

class Room {
    private roomType: RoomType;
    private direction: number;
    private roomWidth: number;
    private roomHeight: number;
    constructor(roomType: RoomType, direction: number, roomWidth: number, roomHeight: number) {
        this.roomType = roomType;
        this.direction = direction;
        this.roomWidth = roomWidth;
        this.roomHeight = roomHeight;
    }

    getRoomType() {
        return this.roomType;
    }

    setRoomType(roomType: RoomType) {
        this.roomType = roomType;
    }

    getRoomDimension() {
        return {
            width: this.roomWidth,
            height: this.roomHeight
        };
    }

    setRoomDimension(dimension: { width: number, height: number }) {
        this.roomWidth = dimension.width;
        this.roomHeight = dimension.height;
    }

    getTiles(tileSize: number, roomSize: number, row: number, col: number): TileInterface[] {
        let dimension = this.getRoomDimension();
        let tiles: TileInterface[] = [];

        // add room tiles
        for (let y = 0; y < dimension.width; y++) {
            for (let x = 0; x < dimension.height; x++) {
                tiles.push({
                    x: (roomSize * col + x + (roomSize - dimension.height) / 2) * tileSize,
                    y: (roomSize * row + y + (roomSize - dimension.width) / 2) * tileSize,
                });
            }
        }

        // add pathway tiles
        Room.getDirections(this).forEach(direction => {
            let yStart, yEnd, xStart, xEnd;
            switch (direction) {
                case Direction.UP:
                    yStart = 0;
                    yEnd = (roomSize - dimension.width) / 2 - 1;
                    xStart = roomSize / 2 - 2;
                    xEnd = roomSize / 2 + 2;
                    break;
                case Direction.RIGHT:
                    yStart = roomSize / 2 - 2;
                    yEnd = roomSize / 2 + 2;
                    xStart = (roomSize + dimension.height) / 2 + 1;
                    xEnd = roomSize;
                    break;
                case Direction.DOWN:
                    yStart = (roomSize + dimension.width) / 2 + 1;
                    yEnd = roomSize;
                    xStart = roomSize / 2 - 2;
                    xEnd = roomSize / 2 + 2;
                    break;
                case Direction.LEFT:
                    yStart = roomSize / 2 - 2;
                    yEnd = roomSize / 2 + 2;
                    xStart = 0;
                    xEnd = (roomSize - dimension.height) / 2 - 1;
                    break;
            }

            for (let x = xStart; x < xEnd; x++) {
                for (let y = yStart; y < yEnd; y++) {
                    tiles.push({
                        x: (roomSize * col + x) * tileSize,
                        y: (roomSize * row + y) * tileSize,
                    });
                }
            }
        });

        return tiles;
    }

    getWalls(tileSize: number, roomSize: number, row: number, col: number): WallInterface[] {
        let dimension = this.getRoomDimension();
        let directions = Room.getDirections(this);
        let walls: WallInterface[] = [];

        // add room wall

        // up
        let hasDirectionUp = directions.includes(Direction.UP);
        for (let x = 0; x < dimension.height; x++) {
            if (hasDirectionUp && dimension.height / 2 - 2 <= x && x < dimension.height / 2 + 2) {
                continue;
            }
            walls.push({
                x: (roomSize * col + x + (roomSize - dimension.height) / 2) * tileSize,
                y: (roomSize * row - 1 + (roomSize - dimension.width) / 2) * tileSize,
            });
        }

        // right
        let hasDirectionRight = directions.includes(Direction.RIGHT);
        for (let y = 0; y < dimension.width; y++) {
            if (hasDirectionRight && dimension.width / 2 - 2 <= y && y < dimension.width / 2 + 2) {
                continue;
            }
            walls.push({
                x: (roomSize * col + dimension.height + (roomSize - dimension.height) / 2) * tileSize,
                y: (roomSize * row + y + (roomSize - dimension.width) / 2) * tileSize,
            });
        }

        // down
        let hasDirectionDown = directions.includes(Direction.DOWN);
        for (let x = 0; x < dimension.height; x++) {
            if (hasDirectionDown && dimension.height / 2 - 2 <= x && x < dimension.height / 2 + 2) {
                continue;
            }
            walls.push({
                x: (roomSize * col + x + (roomSize - dimension.height) / 2) * tileSize,
                y: (roomSize * row + dimension.width + (roomSize - dimension.width) / 2) * tileSize,
            });
        }

        // left
        let hasDirectionLeft = directions.includes(Direction.LEFT);
        for (let y = 0; y < dimension.width; y++) {
            if (hasDirectionLeft && dimension.width / 2 - 2 <= y && y < dimension.width / 2 + 2) {
                continue;
            }
            walls.push({
                x: (roomSize * col - 1 + (roomSize - dimension.height) / 2) * tileSize,
                y: (roomSize * row + y + (roomSize - dimension.width) / 2) * tileSize,
            });
        }

        // all corner box
        // top right
        walls.push({
            x: (roomSize * col + dimension.height + (roomSize - dimension.height) / 2) * tileSize,
            y: (roomSize * row - 1 + (roomSize - dimension.width) / 2) * tileSize,
        });
        // bottom right
        walls.push({
            x: (roomSize * col + dimension.height + (roomSize - dimension.height) / 2) * tileSize,
            y: (roomSize * row + dimension.width + (roomSize - dimension.width) / 2) * tileSize,
        });
        // bottom left
        walls.push({
            x: (roomSize * col - 1 + (roomSize - dimension.height) / 2) * tileSize,
            y: (roomSize * row + dimension.width + (roomSize - dimension.width) / 2) * tileSize,
        });
        // top left
        walls.push({
            x: (roomSize * col - 1 + (roomSize - dimension.height) / 2) * tileSize,
            y: (roomSize * row - 1 + (roomSize - dimension.width) / 2) * tileSize,
        });

        // add pathway wall
        directions.forEach(direction => {
            switch (direction) {
                case Direction.UP:
                    for (let i = 0; i < (roomSize - dimension.width) / 2 - 1; i++) {
                        walls.push({
                            x: (roomSize * col + roomSize / 2 - 3) * tileSize,
                            y: (roomSize * row + i) * tileSize,
                        });
                        walls.push({
                            x: (roomSize * col + roomSize / 2 + 2) * tileSize,
                            y: (roomSize * row + i) * tileSize,
                        });
                    }
                    break;
                case Direction.RIGHT:
                    for (let i = (roomSize + dimension.height) / 2 + 1; i < roomSize; i++) {
                        walls.push({
                            x: (roomSize * col + i) * tileSize,
                            y: (roomSize * row + roomSize / 2 - 3) * tileSize,
                        });
                        walls.push({
                            x: (roomSize * col + i) * tileSize,
                            y: (roomSize * row + roomSize / 2 + 2) * tileSize,
                        });
                    }
                    break;
                case Direction.DOWN:
                    for (let i = (roomSize + dimension.width) / 2 + 1; i < roomSize; i++) {
                        walls.push({
                            x: (roomSize * col + roomSize / 2 - 3) * tileSize,
                            y: (roomSize * row + i) * tileSize,
                        });
                        walls.push({
                            x: (roomSize * col + roomSize / 2 + 2) * tileSize,
                            y: (roomSize * row + i) * tileSize,
                        });
                    }
                    break;
                case Direction.LEFT:
                    for (let i = 0; i < (roomSize - dimension.height) / 2 - 1; i++) {
                        walls.push({
                            x: (roomSize * col + i) * tileSize,
                            y: (roomSize * row + roomSize / 2 - 3) * tileSize,
                        });
                        walls.push({
                            x: (roomSize * col + i) * tileSize,
                            y: (roomSize * row + roomSize / 2 + 2) * tileSize,
                        });
                    }
                    break;
            }
        });

        return walls;
    }

    getDoors(tileSize: number, roomSize: number, row: number, col: number): DoorInterface[] {
        let dimension = this.getRoomDimension();
        let directions = Room.getDirections(this);
        let doors: DoorInterface[] = [];

        directions.forEach(direction => {
            let yStart, yEnd, xStart, xEnd;
            switch (direction) {
                case Direction.UP:
                    yStart = (roomSize - dimension.width) / 2 - 1;
                    yEnd = (roomSize - dimension.width) / 2;
                    xStart = roomSize / 2 - 2;
                    xEnd = roomSize / 2 + 2;
                    break;
                case Direction.RIGHT:
                    yStart = roomSize / 2 - 2;
                    yEnd = roomSize / 2 + 2;
                    xStart = (roomSize + dimension.height) / 2;
                    xEnd = (roomSize + dimension.height) / 2 + 1;
                    break;
                case Direction.DOWN:
                    yStart = (roomSize + dimension.width) / 2;
                    yEnd = (roomSize + dimension.width) / 2+1;
                    xStart = roomSize / 2 - 2;
                    xEnd = roomSize / 2 + 2;
                    break;
                case Direction.LEFT:
                    yStart = roomSize / 2 - 2;
                    yEnd = roomSize / 2 + 2;
                    xStart = (roomSize - dimension.height) / 2 - 1;
                    xEnd = (roomSize - dimension.height) / 2;
                    break;
            }

            for (let x = xStart; x < xEnd; x++) {
                for (let y = yStart; y < yEnd; y++) {
                    doors.push({
                        x: (roomSize * col + x) * tileSize,
                        y: (roomSize * row + y) * tileSize,
                    });
                }
            }
        });

        return doors;
    }

    getRoomCollider(tileSize: number, roomSize: number, row: number, col: number): RoomColliderInterface {
        let dimension = this.getRoomDimension();
        let roomCollider = 0.5;

        return {
            startX: (roomSize * col + (roomSize - dimension.height) / 2 + roomCollider) * tileSize,
            startY: (roomSize * row + (roomSize - dimension.width) / 2 + roomCollider) * tileSize,
            width: (dimension.height - roomCollider * 2) * tileSize,
            height: (dimension.width - roomCollider * 2) * tileSize,
        };
    }

    addDirection(direction: Direction) {
        this.direction |= 1 << direction;
    }

    static getDirections(room: Room): Direction[] {
        let returnVal: Direction[] = [];
        let val = room.direction;
        for (let i = 0; i < 4; i++) {
            if (val & (1 << i)) {
                returnVal.push(i);
            }
        }
        return returnVal;
    }

    static getDirectionVal(direction: Direction[]): number {
        let returnVal = 0;
        for (let i = 0; i < direction.length; i++) {
            returnVal |= 1 << direction[i];
        }
        return returnVal;
    }

    // TODO: Remove this
    print() {
        // @ts-ignore
        process.stdout.write(this.roomType + ":" + this.direction + ":" + this.roomWidth + "-" + this.roomHeight);
    }
}

export default Room;