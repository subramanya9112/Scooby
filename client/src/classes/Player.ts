import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';

export default class Player extends Phaser.Physics.Arcade.Image {
    mainPlayer: boolean = false;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    id: string;
    keyA: Phaser.Input.Keyboard.Key | undefined;
    keyS: Phaser.Input.Keyboard.Key | undefined;
    keyD: Phaser.Input.Keyboard.Key | undefined;
    keyW: Phaser.Input.Keyboard.Key | undefined;
    public oldPosition: { x: number; y: number; } = { x: 0, y: 0 };

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        key: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        id: string,
        mainPlayer: boolean,
    ) {
        super(scene, x, y, key, frame);
        this.scene = scene;
        this.mainPlayer = mainPlayer;
        this.id = id;
        if (this.mainPlayer) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.scene.cameras.main.startFollow(this, true, 0.03, 0.03, 0, 0);
        }

        // enable physics
        this.scene.physics.world.enable(this);
        // add the player container to our existing scene
        this.scene.add.existing(this);

        this.setSize(0, 33);
        this.setOffset(0, 31);
        this.setPushable(false);
    }

    update() {
        if (this.mainPlayer && this.cursors) {
            let speed = 500;

            if (this.cursors.left.isDown || this.keyA?.isDown) {
                this.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.keyD?.isDown) {
                this.setVelocityX(speed);
            } else {
                this.setVelocityX(0);
            }

            if (this.cursors.up.isDown || this.keyW?.isDown) {
                this.setVelocityY(-speed);
            } else if (this.cursors.down.isDown || this.keyS?.isDown) {
                this.setVelocityY(speed);
            } else {
                this.setVelocityY(0);
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
                (this.scene as GameScene).shoot(
                    this.scene.input.mousePointer.x,
                    this.scene.input.mousePointer.y,
                );
            }
        }
        this.setDepth(this.y);
    }

    cleanUp() {
        this.destroy();
    }
}