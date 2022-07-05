import User from '../database/user';

class PlayerModel {
    email: string;
    health: number;
    xp: number;
    id: string;
    x: number;
    y: number;
    character: string;

    constructor(email: string, health: number, id: string, x: number, y: number, character: string) {
        this.email = email;
        this.health = health;
        this.xp = 0;
        this.id = id;
        this.x = x;
        this.y = y;
        this.character = character;
    }

    increaseXP(xp: number) {
        this.xp = this.xp + xp;
    }

    decreaseHealth(health: number) {
        this.health = this.health - health;
        if (this.health <= 0) {
            this.health = 0;
            return true;
        }
        return false;
    }

    async saveToDatabase() {
        let user = await User.findOne({ email: this.email });
        if (user) {
            user.xp += this.xp;
            user.save();
        }
    }
}
export default PlayerModel;
