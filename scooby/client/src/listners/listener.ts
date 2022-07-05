import io, { Socket } from 'socket.io-client';
import GameConst from '../constants/game';
import GameScene from '../scenes/GameScene';
import * as Defaults1 from '../shared/SERVER_GAME_CONSTANT';
import * as Defaults2 from '../shared/SOCKET_GAME_CONSTANT';

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

        this.socket?.on(Defaults1.SERVER_GAME_CLOSE_DOOR, () => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_CLOSE_DOOR);
        });

        this.socket?.on(Defaults1.SERVER_GAME_CHANGE_PLAYER_POSITION, (position) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_CHANGE_PLAYER_POSITION, position);
        });

        this.socket?.on(Defaults1.SERVER_GAME_ROOM_ENTERRED, (roomId: string) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_ROOM_ENTERRED, roomId);
        });

        this.socket?.on(Defaults1.SERVER_GAME_ENEMY_MOVE, (data: any) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_ENEMY_MOVE, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_ENEMY_SHOOT, (data: any) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_ENEMY_SHOOT, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_OPEN_DOOR, () => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_OPEN_DOOR);
        });

        this.socket?.on(Defaults1.SERVER_GAME_ENEMY_REMOVE, (data: any) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_ENEMY_REMOVE, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_DIED, () => {
            console.log("Level completed");
            window.location.href = "./index.html";
        });

        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_HEALTH, (data: any) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_PLAYER_HEALTH, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_PLAYER_XP, (data: any) => {
            this.game?.events.emit(Defaults2.SOCKET_GAME_PLAYER_XP, data);
        });

        this.socket?.on(Defaults1.SERVER_GAME_END_LEVEL, () => {
            console.log("Level completed");
            window.location.href = "./index.html";
            // this.game?.events.emit(GameConst.CHANGE_SCENE, GameScene.sceneName);
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

        this.game?.events.on(Defaults2.GAME_SOCKET_ENEMY_TAKE_DAMAGE, (data: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_ENEMY_TAKE_DAMAGE, data);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_PLAYER_TAKE_DAMAGE, (data: any) => {
            this.socket?.emit(Defaults1.GAME_SERVER_PLAYER_TAKE_DAMAGE, data);
        });

        this.game?.events.on(Defaults2.GAME_SOCKET_ROOM_ENTERRED, (roomId: string) => {
            this.socket?.emit(Defaults1.GAME_SERVER_ROOM_ENTERRED, roomId);
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

    public static setInstance(url: string, game: Phaser.Game, path: string) {
        this.instance.removeListeners();
        this.instance.socket = io(url, {
            transports: ['polling'],
            upgrade: false,
            path: `/${path}/socket.io`,
        });
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