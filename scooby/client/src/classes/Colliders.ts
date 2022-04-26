import Phaser from 'phaser';

export default class Collider extends Phaser.GameObjects.Container {
    roomId: string;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        roomId: string,
    ) {
        super(scene, x, y);
        this.setSize(width, height)
        this.roomId = roomId;
    }
}