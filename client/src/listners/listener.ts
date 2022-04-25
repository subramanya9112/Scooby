import io, { Socket } from 'socket.io-client';
import GameConst from '../constants/game';
import GameScene from '../scenes/GameScene';
import * as Defaults1 from '../../../shared/SERVER_GAME_CONSTANT';
import * as Defaults2 from '../../../shared/SOCKET_GAME_CONSTANT';

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
        this.socket?.on(Defaults1.SERVER_GAME_CREATE_EXISTING_PLAYERS, (players) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_CREATE_EXISTING_PLAYERS, { players, currentId: this.socket?.id });
        });

        // spawn a new player
        this.socket?.on(Defaults1.SERVER_GAME_SPAWN_NEW_PLAYER, (player) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_SPAWN_NEW_PLAYER, player);
        });

        // a player has moved
        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_MOVED, (player) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_PLAYER_MOVED, player);
        });

        this.socket?.on(Defaults1.SERVER_GAME_TAKE_MAP, (player) => {
            console.log(player)
            this.game?.events.emit(Defaults2.SOCKET_GAME_TAKE_MAP, player);
        });

        // a player has left the game
        this.socket?.on(Defaults1.SERVER_GAME_REMOVE_PLAYER, (id) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_REMOVE_PLAYER, id);
        });

        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_BULLET_SHOOT, (data) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_PLAYER_BULLET_SHOOT, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_BULLET_REMOVE, (data) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_PLAYER_BULLET_REMOVE, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_ROOM_ENTERRED, () => {
            Defaults2.SOCKET_GAME_ROOM_ENTERRED;
            // TODO: here
            // this.game?.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
        });

        this.socket?.on(Defaults1.SERVER_GAME_END_LEVEL, () => {
            console.log("Level completed");
            this.game?.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_NEW_PLAYER, (player: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_NEW_PLAYER, player);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_PLAYER_MOVED, (player: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_PLAYER_MOVED, player);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_GIVE_MAP, (player: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_GIVE_MAP, player);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_PLAYER_BULLET_SHOOT, (data: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_PLAYER_BULLET_SHOOT, data);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_PLAYER_BULLET_REMOVE, (data: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_PLAYER_BULLET_REMOVE, data);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_ROOM_ENTERRED, () => {
            // TODO: here
            // this.socket?.emit(Defaults1.GAME_SERVER_END_LEVEL);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_END_LEVEL, () => {
            this.socket?.emit(Defaults1.GAME_SERVER_END_LEVEL);
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