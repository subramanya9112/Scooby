import Phaser from 'phaser';
import scenes from './scenes';
import io from 'socket.io-client';
import BootScene from './scenes/BootScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scene: scenes,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0,
            },
        },
    },
    backgroundColor: '000000',
    scale: {
        width: '100%',
        height: '100%',
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-game',
    },
    pixelArt: true,
    roundPixels: true,
};

class Game extends Phaser.Game {
    public static CHANGE_SCENE = 'changeScene';


    globals: any;
    constructor() {
        super(config);
        const socket = io("http://localhost", { transports: ['websocket', 'polling', 'flashsocket'] });
        this.globals = { socket }
        this.scene.start(BootScene.sceneName);

        this.events.on(Game.CHANGE_SCENE, (sceneName: string) => {
            this.scene.start(sceneName);
        });
    }
}

export default new Game();
