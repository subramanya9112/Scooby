import { GameObjects, Scene } from "phaser";
import GameScene from "./GameScene";

export default class UIScene extends Scene {
    public static sceneName = 'UIScene';
    private healthText: GameObjects.Text | undefined;
    private xpText: GameObjects.Text | undefined;

    constructor(scene: Scene) {
        super(UIScene.sceneName);
    }

    create() {
        this.healthText = this.add.text(10, 10, `Health: 0`, {
            fontSize: '18px',
            color: "#fff",
        });

        this.xpText = this.add.text(10, 34, `XP: 0`, {
            fontSize: '18px',
            color: "#fff",
        });

        var gameScene = this.scene.get(GameScene.sceneName);
        gameScene.events.on("onHealthChange", (health: number) => {
            if (this.healthText) this.healthText.setText(`Health: ${health}`);
        });
        gameScene.events.on("onXPChange", (xp: number) => {
            if (this.xpText) this.xpText.setText(`XP: ${xp}`);
        });
    }
}