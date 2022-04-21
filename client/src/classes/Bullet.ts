import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Image {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        key: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
    ) {
        super(scene, x, y, key, frame);

        // enable physics
        this.scene.physics.world.enable(this);
        // add the player container to our existing scene
        this.scene.add.existing(this);

        this.body.setSize(10, 10, true);
    }

    init(rotation: number) {
        this.setAngle(rotation);
        this.scene.physics.velocityFromRotation(rotation, 200, this.body.velocity)
        this.body.velocity.x *= 2;
        this.body.velocity.y *= 2;
    }
}