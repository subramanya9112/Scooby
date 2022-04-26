import Phaser from 'phaser';
import Player from '../classes/Player';
import Bullet from '../classes/Bullet';
import Listeners from '../listners/listener';
import Enemy from '../classes/Enemy';
import Collider from '../classes/Colliders';
import * as Defaults from './../../../shared/SOCKET_GAME_CONSTANT';

export default class GameScene extends Phaser.Scene {
    public static sceneName = 'GameScene';
    player: Player | undefined;
    walls: Phaser.Physics.Arcade.StaticGroup | undefined;
    otherPlayers: Phaser.Physics.Arcade.Group | undefined;
    roomCollider: Phaser.Physics.Arcade.StaticGroup | undefined;
    enemies: Phaser.Physics.Arcade.Group | undefined;
    playerBullets: Phaser.Physics.Arcade.Group | undefined;
    otherPlayerBullets: Phaser.Physics.Arcade.Group | undefined;
    doors: Phaser.Physics.Arcade.Group | undefined;
    doorCollider: Phaser.Physics.Arcade.Collider | undefined;
    doorBulletCollider: Phaser.Physics.Arcade.Collider | undefined;

    constructor() {
        super(GameScene.sceneName);
    }

    init() {
        this.listenEvents();
    }

    createMapData(data: any) {
        for (let i = 0; i < data.length; i++) {
            let room = data[i];

            room['tiles'].forEach((val: { x: number; y: number; height: number, width: number }) => {
                this.add.sprite(val.x, val.y, 'tile')
                    .setInteractive()
                    .setOrigin(0, 0)
                    .setScale(val.height, val.width)
                    .setDepth(-1);
            });

            room['doors'].forEach((val: { x: number; y: number; }) => {
                this.add.sprite(val.x, val.y, 'door').setInteractive().setOrigin(0, 0).setDepth(-1);
            });

            room['doors'].forEach((val: { x: number; y: number; }) => {
                this.doors?.create(val.x, val.y - 32, 'wall', 0)
                    .setOrigin(0, 0)
                    .setScale(2)
                    .setSize(32, 32)
                    .setOffset(0, 16)
                    .setDepth(val.y - 32)
                    .setPushable(false)
                    .setVisible(false);
            });

            // room['walls'].forEach((val: { x: number | undefined; y: number; }) => {
            //     this.walls?.create(val.x, val.y - 32, 'wall', 0)
            //         .setScale(2)
            //         .setOrigin(0, 0)
            //         .setSize(64, 64)
            //         .setOffset(16, 56)
            //         .setDepth(val.y - 32);
            // });

            room['roomCollider'].forEach((val: { startX: number; width: number; startY: number; height: number; }) => {
                let collider = new Collider(
                    this,
                    val.startX + val.width / 2,
                    val.startY + val.height / 2,
                    val.width,
                    val.height,
                    room.id
                );
                this.roomCollider?.add(collider);
            });

            room['enemies'].forEach((val: { id: string, x: number; y: number; }) => {
                let enemy = new Enemy(
                    val.id,
                    this,
                    val.x,
                    val.y,
                    'player',
                    undefined,
                );
                this.enemies?.add(enemy);
            });
        }
    }

    listenEvents() {
        // create a new player
        this.game.events?.on(Defaults.SOCKET_GAME_CREATE_EXISTING_PLAYERS, (data: { [id: string]: any; }) => {
            var players: { [id: string]: any; } = data['players'];
            var currentId: string = data['currentId'];
            Object.keys(players).forEach((key) => {
                if (key != currentId) {
                    let newPlayer = new Player(this,
                        players[key].x,
                        players[key].y,
                        'player',
                        undefined,
                        players[key].id,
                        false
                    );
                    this.otherPlayers?.add(newPlayer);
                }
            });
        });

        // spawn a new player
        this.game.events?.on(Defaults.SOCKET_GAME_SPAWN_NEW_PLAYER, (player: { [id: string]: any; }) => {
            let newPlayer = new Player(this,
                player.x,
                player.y,
                'player',
                undefined,
                player.id,
                false
            );
            this.otherPlayers?.add(newPlayer);
        });

        // a player has moved
        this.game.events?.on(Defaults.SOCKET_GAME_PLAYER_MOVED, (player: { [id: string]: any; }) => {
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === player.id) {
                    otherPlayer.setPosition(player.x, player.y);
                }
            });
        });

        // a player has left the game
        this.game.events?.on(Defaults.SOCKET_GAME_REMOVE_PLAYER, (id: string) => {
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === id) {
                    otherPlayer.cleanUp();
                }
            });
        });

        this.game.events?.on(Defaults.SOCKET_GAME_PLAYER_BULLET_SHOOT, (data: any) => {
            if (this.otherPlayerBullets) {
                let bullet = this.otherPlayerBullets.getFirstDead();
                if (bullet) {
                    bullet.activate(
                        data.x,
                        data.y,
                    );
                    bullet.id = data.id;
                } else {
                    bullet = new Bullet(
                        data.id,
                        this,
                        data.x,
                        data.y,
                        'shot',
                        undefined,
                    );
                }
                this.otherPlayerBullets.add(bullet);
                bullet.init(data.rotation);
            }
        });

        this.game.events?.on(Defaults.SOCKET_GAME_PLAYER_BULLET_REMOVE, (data: any) => {
            let id = data.id;
            this.otherPlayerBullets?.getChildren().forEach((val) => {
                let otherPlayer = val as Bullet;
                if (otherPlayer.id === id) {
                    otherPlayer.deactivate();
                }
            });
        });

        this.game.events?.on(Defaults.SOCKET_GAME_ROOM_ENTERRED, (roomId: string) => {
            this.roomCollider?.getChildren().forEach((val) => {
                let collider = val as Collider;
                if (collider.roomId === roomId) {
                    collider.destroy();
                }
            });
        });

        this.game.events?.on(Defaults.SOCKET_GAME_CLOSE_DOOR, () => {
            this.doorUpdate(true);
        });

        this.game.events?.on(Defaults.SOCKET_GAME_CHANGE_PLAYER_POSITION, (val: { x: number, y: number }) => {
            if (this.player) {
                const { x, y } = this.player;
                this.player?.setPosition(val.x, val.y);
                this.player.oldPosition = { x, y };
            }
        });

        this.game.events?.on(Defaults.SOCKET_GAME_ENEMY_MOVE, (data: any) => {
            this.enemies?.getChildren().forEach((obj) => {
                let enemy = obj as Enemy;
                if (enemy.id === data.id) {
                    enemy.moveTo(data.x, data.y);
                }
            });
        });

        this.game.events?.on(Defaults.SOCKET_GAME_ENEMY_SHOOT, (data: any) => {
            // this.createMapData(data);
        });

        this.game.events?.on(Defaults.SOCKET_GAME_TAKE_MAP, (data: any) => {
            this.createMapData(data);
        });
    }

    create() {
        this.player = new Player(this, (4 * 40 + 20) * 64, (4 * 40 + 20) * 64, 'player', undefined, "", true);
        // emit event to server that a new player has joined
        this.game.events.emit(Defaults.GAME_SOCKET_NEW_PLAYER, { x: this.player.x, y: this.player.y });

        // create walls group
        this.walls = this.physics.add.staticGroup();

        // create room collider group
        this.roomCollider = this.physics.add.staticGroup();

        // create doors group
        this.doors = this.physics.add.group();

        // create an other players group
        this.otherPlayers = this.physics.add.group();
        this.otherPlayers.runChildUpdate = true;

        // create enemies group
        this.enemies = this.physics.add.group({
            frameQuantity: 50,
        });
        this.enemies.runChildUpdate = true;
        this.physics.add.collider(this.enemies, this.enemies);

        // create other player bullets group
        this.otherPlayerBullets = this.physics.add.group();

        // create player bullets group
        this.playerBullets = this.physics.add.group();
        this.input.on('pointerdown', (pointer: PointerEvent) => {
            if (pointer.button == 0)
                this.shoot(pointer.x, pointer.y);
        });

        this.physics.add.overlap(this.player, this.roomCollider, this.roomCollision.bind(this));
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.otherPlayers);
        this.physics.add.collider(this.player, this.enemies);
        this.doorCollider = this.physics.add.collider(this.player, this.doors);

        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.otherPlayers);
        this.physics.add.collider(this.enemies, this.player);

        this.doorCollider.active = false;
        this.physics.add.collider(this.walls, this.playerBullets, this.wallBulletCollision.bind(this));
        this.doorBulletCollider = this.physics.add.collider(this.doors, this.playerBullets, this.wallBulletCollision.bind(this));
        this.doorBulletCollider.active = false;

        this.game.events.emit(Defaults.GAME_SOCKET_GIVE_MAP);
    }

    wallBulletCollision(wall: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
        this.game.events.emit(Defaults.GAME_SOCKET_PLAYER_BULLET_REMOVE, {
            id: (bullet as Bullet).id
        });
        (bullet as Bullet).deactivate();
    }

    shoot(x: number, y: number) {
        if (this.player && this.playerBullets) {
            let rotation = Phaser.Math.Angle.BetweenPoints({
                x: this.player.x,
                y: this.player.y,
            }, {
                x: this.cameras.main.scrollX + x,
                y: this.cameras.main.scrollY + y,
            });

            let bullet = this.playerBullets.getFirstDead();
            if (bullet) {
                bullet.activate(
                    this.player.x,
                    this.player.y,
                );
            } else {
                bullet = new Bullet(
                    Listeners.getInstance().getBulletUniqueID(),
                    this,
                    this.player.x,
                    this.player.y,
                    'shot',
                    undefined,
                );
            }
            this.playerBullets.add(bullet);
            bullet.init(rotation);
            this.game.events.emit(Defaults.GAME_SOCKET_PLAYER_BULLET_SHOOT, {
                id: bullet.id,
                x: bullet.x,
                y: bullet.y,
                rotation,
            });
        }
    }

    roomCollision(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        let player = object1 as Player;
        let collider = object2 as Collider;

        this.game.events.emit(Defaults.GAME_SOCKET_ROOM_ENTERRED, {
            roomId: collider.roomId,
            playerPosition: {
                x: this.player?.x,
                y: this.player?.y
            },
        });
        collider.destroy();
    }

    doorUpdate(doorOpen: boolean) {
        if (doorOpen) {
            if (this.doorBulletCollider)
                this.doorBulletCollider.active = true;
            if (this.doorCollider)
                this.doorCollider.active = true;
            this.doors?.getChildren().forEach((val) => {
                // @ts-ignore
                val.setVisible(true);
            });
        }
    }

    update(time: number, delta: number): void {
        if (this.player) {
            this.player.update();

            const { x, y } = this.player;
            const old = this.player.oldPosition;
            if (old && (old.x !== x || old.y !== y)) {
                this.game.events.emit(Defaults.GAME_SOCKET_PLAYER_MOVED, { x, y });
            }
            // save old position data
            this.player.oldPosition = { x, y };
        }
    }
}
