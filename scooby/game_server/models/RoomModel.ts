import EnemyModel from "./EnemyModel";

class RoomModel {
    id: string;
    x: number;
    y: number;
    height: number;
    width: number;
    active: boolean;
    enemies: EnemyModel[];
    type: string;

    constructor(id: string, x: number, y: number, height: number, width: number, type: string) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.active = false;
        this.type = type;
        this.enemies = [];
    }

    addEnemies(enemy: EnemyModel) {
        this.enemies.push(enemy);
    }

    remove(enemId: string) {
        this.enemies = this.enemies.filter(enemy => enemy.id !== enemId);
    }
}

export default RoomModel;
