import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Image {
    id: string;
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

        this.body.setSize(20, 20, true);
    }

    init(rotation: number) {
        this.setAngle(Phaser.Math.RadToDeg(rotation));
        this.scene.physics.velocityFromRotation(rotation, 500, this.body.velocity)
    }

    activate(
        x: number,
        y: number,
    ) {
        this.setAlpha(1);
        this.active = true;

        this.x = x;
        this.y = y;
    }

    deactivate() {
        this.setAlpha(0);
        this.active = false;

        // @ts-ignore
        this.body.velocity.setTo(0, 0);
    }
}