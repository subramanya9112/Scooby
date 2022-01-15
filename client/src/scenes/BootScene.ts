import Phaser from 'phaser';
import GameConst from '../constants/game';
import GameScene from './GameScene';

export default class BootScene extends Phaser.Scene {
    public static sceneName = 'BootScene';
    constructor() {
        super(BootScene.sceneName);
    }

    preload() {
        this.load.image('tile', 'assets/tile.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('door', 'assets/door.png');
        this.load.image('player', 'assets/player.png');

        this.load.json('data', 'assets/data.json');
    }

    create() {
        this.game.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
    }
}
