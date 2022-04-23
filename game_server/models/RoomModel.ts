import EnemyModel from "./EnemyModel";

class RoomModel {
    id: string;
    x: number;
    y: number;
    height: number;
    width: number;
    active: boolean;
    enemies: EnemyModel[];

    constructor(id: string, x: number, y: number, height: number, width: number, enemies: EnemyModel[]) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.active = false;
        this.enemies = enemies;
    }
}

export default RoomModel;
