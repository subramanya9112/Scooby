import PlayerModel from "./PlayerModel";
import RoomModel from "./RoomModel";

class EnemyModel {
    id: string;
    x: number;
    y: number;
    health: number;
    xp: number;
    character: string;
    room: RoomModel;
    shootTime: number;
    shootInterval: number;
    damage: number;

    constructor(
        id: string,
        x: number,
        y: number,
        health: number,
        xp: number,
        character: string,
        room: RoomModel,
        shootInterval: number,
        damage: number,
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.health = health;
        this.room = room;
        this.xp = xp;
        this.character = character;
        this.shootTime = 0;
        this.shootInterval = shootInterval;
        this.damage = damage;
    }

    move(players: { [id: string]: PlayerModel; }, onMove: (id: string, x: number, y: number) => void) {
        if (this.room.active) {
            let playerIdToMove = null;
            let minimumDistance = Infinity;
            for (let playerId in players) {
                let player = players[playerId];
                let distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));

                if (distance < 3 * 64) {
                    return;
                }

                if (distance < minimumDistance && distance < 5 * 64) {
                    playerIdToMove = playerId;
                    minimumDistance = distance;
                }
            }

            if (playerIdToMove) {
                let angle = Math.atan2(players[playerIdToMove].y - this.y, players[playerIdToMove].x - this.x);
                this.x = Math.ceil(this.x + Math.cos(angle) * 64);
                this.y = Math.ceil(this.y + Math.sin(angle) * 64);
                onMove(this.id, this.x, this.y);
            }
        }
    }

    shoot(players: { [id: string]: PlayerModel; }, onShoot: (id: string, x: number, y: number, angle: number, damage: number) => void) {
        if (this.room.active) {
            if (this.shootTime != 0) {
                this.shootTime = Math.max(this.shootTime - 1, 0);
                return;
            }
            this.shootTime = this.shootInterval * (1 + (Math.random() - 1) / 10);
            let playerIdToMove = null;
            let minimumDistance = 5 * 64;

            for (let playerId in players) {
                let player = players[playerId];
                let distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));

                if (distance < minimumDistance) {
                    playerIdToMove = playerId;
                    minimumDistance = distance;
                }
            }
            if (playerIdToMove) {
                let angle = Math.atan2(players[playerIdToMove].y - this.y, players[playerIdToMove].x - this.x);
                onShoot(this.id, this.x, this.y, angle, this.damage);
            }
        }
    }

    takeDamage(damageAmount: number): boolean {
        if (this.room.active) {
            this.health -= damageAmount;

            if (this.health <= 0) {
                return true;
            }
            return false;
        }
        return false;
    }
}

export default EnemyModel;
