import Place from './../enums/RoomType';
import Direction from './../enums/Direction';
import Room from './../class/Room'
import { GetRandomNumber } from './../utils/utils'

class Level {
    private readonly arrLength: number = 9;
    private level: number;
    private levelDesign: Room[][];
    private rooms: number = 1;
    private workRoom: number = 0;
    private chestRoom: number = 0;
    private endRoom: number = 0;
    private curX: number;
    private curY: number;

    private constructor(level: number) {
        this.level = level;
        this.levelDesign = new Array<Array<Room>>();
        this.createLevelDataArray();

        this.curX = Math.floor(this.arrLength / 2);
        this.curY = Math.floor(this.arrLength / 2);
    }

    private createLevelDataArray() {
        for (let y = 0; y < this.arrLength; y++) {
            let row: Room[] = new Array<Room>();
            for (let x = 0; x < this.arrLength; x++) {
                row.push(new Room(Place.EMPTY, 0, 12, 12, 0));
            }
            this.levelDesign.push(row);
        }
    }

    private getMaxRoomNumber(): number {
        if (this.level === 5)
            return GetRandomNumber(15, 10);
        else
            return GetRandomNumber(10, 5);
    }

    private getRoomDimension() {
        return {
            width: GetRandomNumber(8, 12) * 2,
            height: GetRandomNumber(8, 12) * 2,
        }
    }

    private getRandomRoomType() {
        this.rooms++;
        let rand = GetRandomNumber(5, 1);
        if (rand < 3 && this.curX != Math.floor(this.arrLength / 2) && this.curY != Math.floor(this.arrLength / 2)) {
            if (this.workRoom < 1) {
                this.workRoom += 1;
                return Place.WORK;
            } else if (this.chestRoom < 1) {
                this.chestRoom += 1;
                return Place.CHEST;
            } else if (this.endRoom < 1) {
                this.endRoom += 1;
                return Place.END;
            }
        }
        return Place.ENEMY;
    }

    private getRandomEnemyNumber() {
        return GetRandomNumber(20, 10);
    }

    private workOnMap(newX: number, newY: number, direction: Direction, oppDirection: Direction) {
        let notAllowed = [Place.WORK, Place.CHEST, Place.START, Place.END];
        let notMovePlace = [Place.CHEST, Place.WORK, Place.END];

        if (newX >= 0 && newY >= 0 && newX < this.arrLength && newY < this.arrLength) {
            if (this.levelDesign[newX][newY].getRoomType() == Place.EMPTY) {
                let roomType = this.getRandomRoomType();
                this.levelDesign[this.curX][this.curY].addDirection(direction);
                this.levelDesign[newX][newY].setRoomType(roomType);
                this.levelDesign[newX][newY].addDirection(oppDirection);
                if (roomType === Place.CHEST || roomType === Place.WORK) {
                    this.levelDesign[newX][newY].setRoomDimension({
                        width: 12,
                        height: 12,
                    });
                } else {
                    if (roomType === Place.ENEMY) {
                        this.levelDesign[newX][newY].setEnemyNumber(this.getRandomEnemyNumber());
                    }
                    this.levelDesign[newX][newY].setRoomDimension(this.getRoomDimension());
                }

                if (notMovePlace.indexOf(roomType) == -1) {
                    this.curX = newX;
                    this.curY = newY;
                }
            } else if (notAllowed.indexOf(this.levelDesign[newX][newY].getRoomType()) === -1) {
                if (GetRandomNumber(4, 0) == 0) {
                    this.levelDesign[this.curX][this.curY].addDirection(direction);
                    this.levelDesign[newX][newY].addDirection(oppDirection);
                    this.curX = newX;
                    this.curY = newY;
                }
            }
        }
    }

    private getLevelDesign() {
        let maxRoomNumber = this.getMaxRoomNumber();
        this.levelDesign[this.curX][this.curY].setRoomType(Place.START);

        while (this.rooms < maxRoomNumber || this.workRoom < 1 || this.chestRoom < 1 || this.endRoom < 1) {
            switch (GetRandomNumber(4, 0)) {
                case 0:
                    // UP
                    this.workOnMap(this.curX - 1, this.curY, Direction.UP, Direction.DOWN);
                    break;
                case 1:
                    // RIGHT
                    this.workOnMap(this.curX, this.curY + 1, Direction.RIGHT, Direction.LEFT);
                    break;
                case 2:
                    // DOWN
                    this.workOnMap(this.curX + 1, this.curY, Direction.DOWN, Direction.UP);
                    break;
                case 3:
                    // LEFT
                    this.workOnMap(this.curX, this.curY - 1, Direction.LEFT, Direction.RIGHT);
                    break;
            }
        }

        // this.levelDesign.forEach((row, r) => {
        //     row.forEach((place, c) => {
        //         if (this.curX == r && this.curY == c) {
        //             // @ts-ignore
        //             process.stdout.write("[");
        //             place.print();
        //             // @ts-ignore
        //             process.stdout.write("]");
        //         } else {
        //             place.print();
        //         }
        //         // @ts-ignore
        //         process.stdout.write(" ");
        //     });
        //     // @ts-ignore
        //     process.stdout.write("\n");
        // });
        // // @ts-ignore
        // process.stdout.write("\n");

        return this.levelDesign;
    }

    public static GetLevel(levelNumber: number) {
        return (new Level(levelNumber)).getLevelDesign();
    }
};

export default Level;