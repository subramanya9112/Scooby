import io, { Socket } from 'socket.io-client';
import GameConst from '../constants/game';
import GameScene from '../scenes/GameScene';

class Listeners {
    private static instance: Listeners = new Listeners();
    private socket: Socket | undefined;
    private game: Phaser.Game | undefined;
    private bulletNumber: number;

    private constructor() {
        this.bulletNumber = 0;
    }

    public setUpListeners() {
        // create a new player
        this.socket?.on('createPlayers', (players) => {
            this.game?.events.emit('createPlayers', { players, currentId: this.socket?.id });
        });

        // spawn a new player
        this.socket?.on('spawnPlayer', (player) => {
            this.game?.events.emit('spawnPlayer', player);
        });

        // a player has moved
        this.socket?.on('playerMovement', (player) => {
            this.game?.events.emit('otherPlayerMovement', player);
        });

        this.socket?.on('gotMap', (player) => {
            this.game?.events.emit('gotMap', player);
        });

        // a player has left the game
        this.socket?.on('removePlayer', (id) => {
            this.game?.events.emit('removePlayer', id);
        });

        this.socket?.on('otherPlayerBulletShot', (data) => {
            this.game?.events.emit('otherPlayerBulletShot', data);
        });

        this.socket?.on('otherPlayerBulletRemove', (data) => {
            this.game?.events.emit('otherPlayerBulletRemove', data);
        });

        this.socket?.on('levelCompleted', () => {
            console.log("Level completed");
            this.game?.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
        });

        this.game?.events.on('newPlayer', (player: any) => {
            this.socket?.emit('newPlayer', player);
        });

        this.game?.events.on('playerMovement', (player: any) => {
            this.socket?.emit('playerMovement', player);
        });

        this.game?.events.on('getMap', (player: any) => {
            this.socket?.emit('getMap', player);
        });

        this.game?.events.on('bulletShot', (data: any) => {
            this.socket?.emit('bulletShot', data);
        });

        this.game?.events.on('bulletRemove', (data: any) => {
            this.socket?.emit('bulletRemove', data);
        });

        this.game?.events.on('levelComplete', () => {
            this.socket?.emit('levelComplete');
        });
    }

    public removeListeners() {
        this.socket?.close();
    }

    public static getInstance(): Listeners {
        return this.instance;
    }

    public static setInstance(url: string, game: Phaser.Game) {
        this.instance.removeListeners();
        this.instance.socket = io(url, { transports: ['websocket', 'polling', 'flashsocket'] });
        this.instance.game = game;
        this.instance.setUpListeners();
    }

    public getBulletUniqueID(): string {
        if (this.socket) {
            return this.socket.id + "_BULLET_" + this.bulletNumber++;
        }
        return "";
    }
}

export default Listeners;