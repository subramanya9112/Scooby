import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    id: string;
    target: Phaser.Math.Vector2;
    constructor(
        id: string,
        scene: Phaser.Scene,
        x: number,
        y: number,
        key: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
    ) {
        super(scene, x, y, key, frame);
        this.id = id;

        // enable physics
        this.scene.physics.world.enable(this);
        // add the player container to our existing scene
        this.scene.add.existing(this);

        this.setOrigin(0, 0);
        this.setSize(0, 33);
        this.setOffset(0, 31);
        // this.setPushable(false);
        this.target = new Phaser.Math.Vector2(x, y);
        this.body.pushable = false;
    }

    init() {
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(delta, time);
    }

    moveTo(x: any, y: any) {
        this.target = new Phaser.Math.Vector2(x, y);
        let distance = this.target.distance(new Phaser.Math.Vector2(this.x, this.y));
        if (distance <= 64) {
            this.setVelocity(0, 0);
            this.target = new Phaser.Math.Vector2(this.x, this.y);
            // this.scene.physics.moveToObject(this, this.target, 500);
        } else {
            this.scene.physics.moveToObject(this, this.target, 500);
        }
    }

    update(delta: number, time: number) {
        let distance = this.target.distance(new Phaser.Math.Vector2(this.x, this.y));
        if (distance <= 64) {
            this.setVelocity(0, 0);
            this.target = new Phaser.Math.Vector2(this.x, this.y);
            // this.scene.physics.moveToObject(this, this.target, 500);
        }
        this.setDepth(this.y);
    }

    cleanUp() {
        this.destroy();
    }
}