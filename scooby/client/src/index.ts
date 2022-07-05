import Phaser from 'phaser';
import GameConst from './constants/game';
import Listeners from './listners/listener';
import scenes from './scenes';
import BootScene from './scenes/BootScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scene: scenes,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            fps: 300,
            timeScale: 1,
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
    globals: any;
    constructor() {
        super(config);
        // @ts-ignore
        let params = (new URL(document.location)).searchParams;
        let id = params.get("id");
        if (id == null) {
            window.location.href = "./index.html";
            return;
        }
        Listeners.setInstance(this, id);
        this.scene.start(BootScene.sceneName);
        this.events.on(GameConst.CHANGE_SCENE, (sceneName: string) => {
            this.scene.start(sceneName);
        });
    }
}

export default new Game();
