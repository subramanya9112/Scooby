import Phaser from 'phaser';
import GameData from '../classes/GameData';
import GameConst from '../constants/game';
import GameScene from './GameScene';

export default class BootScene extends Phaser.Scene {
    public static sceneName = 'BootScene';

    constructor() {
        super(BootScene.sceneName);
    }

    preload() {
        GameData.gameData.characters.forEach(character => {
            this.load.image(character.name, character.url);
        });
        for (const [key, value] of (<any>Object).entries(GameData.gameData.enemies)) {
            value.forEach((enemy: { [id: string]: string }) => {
                this.load.image(enemy.name, `assets/levels/${key}/enemies/${enemy.path}`);
            });
            this.load.image(`${key}-tile`, `assets/levels/${key}/tiles.png`);
            this.load.image(`${key}-wall`, `assets/levels/${key}/wall.png`);
        }
        this.load.image('shot', 'assets/shot.png');
        this.load.audio('audio1', 'audio/audio1.mp3');
        this.load.audio('audio2', 'audio/audio2.mp3');
    }

    create() {
        this.game.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
    }
}
