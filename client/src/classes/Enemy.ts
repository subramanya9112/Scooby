import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Image {
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

        this.setOrigin(0, 0);
        this.setSize(0, 33);
        this.setOffset(0, 31);
        this.setPushable(false);
    }

    init() {
    }
}