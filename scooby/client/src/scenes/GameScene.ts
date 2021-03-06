import Phaser from 'phaser';
import Player from '../classes/Player';
import Bullet from '../classes/Bullet';
import Listeners from '../listners/listener';
import Enemy from '../classes/Enemy';
import Collider from '../classes/Colliders';
import * as Defaults from './../shared/SOCKET_GAME_CONSTANT';
import UIScene from './UIScene';

export default class GameScene extends Phaser.Scene {
    public static sceneName = 'GameScene';
    playerHealth: number;
    playerXP: number;
    player: Player | undefined;
    walls: Phaser.Physics.Arcade.StaticGroup | undefined;
    otherPlayers: Phaser.Physics.Arcade.Group | undefined;
    roomCollider: Phaser.Physics.Arcade.StaticGroup | undefined;
    enemies: Phaser.Physics.Arcade.Group | undefined;
    playerBullets: Phaser.Physics.Arcade.Group | undefined;
    otherPlayerBullets: Phaser.Physics.Arcade.Group | undefined;
    enemyBullets: Phaser.Physics.Arcade.Group | undefined;
    doors: Phaser.Physics.Arcade.Group | undefined;
    doorCollider: Phaser.Physics.Arcade.Collider | undefined;
    doorPlayerBulletCollider: Phaser.Physics.Arcade.Collider | undefined;
    doorEnemyBulletCollider: Phaser.Physics.Arcade.Collider | undefined;

    constructor() {
        super(GameScene.sceneName);
        this.playerHealth = 0;
        this.playerXP = 0;
    }

    init() {
        this.scene.launch(UIScene.sceneName);

        this.listenEvents();

        this.sound.pauseOnBlur = false;
        let backgroundMusic = this.game.sound.add(Math.random() < 0.5 ? 'audio1' : 'audio2');
        // @ts-ignore
        backgroundMusic.setLoop(true);
        backgroundMusic.play();
    }

    createMapData(data: any) {
        for (let i = 0; i < data.length; i++) {
            let room = data[i];

            let type = room['roomType'];
            room['tiles'].forEach((val: { x: number; y: number; height: number, width: number }) => {
                this.add.sprite(val.x, val.y, `${type}-tile`)
                    .setInteractive()
                    .setOrigin(0, 0)
                    .setScale(val.height, val.width)
                    .setDepth(-1);
            });

            room['doors'].forEach((val: { x: number; y: number; }) => {
                this.add.sprite(val.x, val.y, `${type}-tile`).setInteractive().setOrigin(0, 0).setDepth(-1);
            });

            room['doors'].forEach((val: { x: number; y: number; }) => {
                this.doors?.create(val.x, val.y - 32, `${type}-wall`, 0)
                    .setOrigin(0, 0)
                    .setScale(2)
                    .setSize(32, 32)
                    .setOffset(0, 16)
                    .setDepth(val.y - 32)
                    .setPushable(false)
                    .setVisible(false);
            });

            room['walls'].forEach((val: { x: number | undefined; y: number; }) => {
                this.walls?.create(val.x, val.y - 32, `${type}-wall`, 0)
                    .setScale(2)
                    .setOrigin(0, 0)
                    .setSize(64, 64)
                    .setOffset(16, 56)
                    .setDepth(val.y - 32);
            });

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

            room['enemies'].forEach((val: { id: string, x: number; y: number; name: string; }) => {
                let enemy = new Enemy(
                    val.id,
                    this,
                    val.x,
                    val.y,
                    val.name,
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
                        players[key].character,
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
                player.character,
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
                        1,
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
                        1,
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

        this.game.events?.on(Defaults.SOCKET_GAME_OPEN_DOOR, () => {
            this.doorUpdate(false);
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
            if (this.enemyBullets) {
                let bullet = this.enemyBullets.getFirstDead();
                if (bullet) {
                    bullet.activate(
                        data.x,
                        data.y,
                        data.damage,
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
                        data.damage,
                    );
                }
                this.enemyBullets.add(bullet);
                bullet.init(data.angle);
            }
        });

        this.game.events?.on(Defaults.SOCKET_GAME_TAKE_MAP, (data: any) => {
            this.createMapData(data);
        });

        this.game.events?.on(Defaults.SOCKET_GAME_PLAYER_HEALTH, (data: any) => {
            this.playerHealth = data.health;
            this.events.emit("onHealthChange", this.playerHealth);
        });

        this.game.events?.on(Defaults.SOCKET_GAME_PLAYER_XP, (data: any) => {
            this.playerXP = data.xp;
            console.log(this.playerXP)
            this.events.emit("onXPChange", this.playerXP);
        });

        this.game.events?.on(Defaults.SOCKET_GAME_ENEMY_REMOVE, (data: any) => {
            this.enemies?.getChildren().forEach((val) => {
                let bullet = val as Enemy;
                if (bullet.id === data.enemyId) {
                    bullet.cleanUp();
                }
            });
        });
    }

    create() {
        let cred = window.localStorage.getItem('credential');
        if (!cred) {
            window.location.href = './index.html';
        }
        let character = window.localStorage.getItem('selectedCharacter');
        if (!character) {
            character = "Knight";
            window.localStorage.setItem('selectedCharacter', character);
        }
        let randomX = Math.floor(Math.random() * 10) - 5;
        let randomY = Math.floor(Math.random() * 10) - 5;
        this.player = new Player(this, (4 * 40 + 20 + randomX) * 64, (4 * 40 + 20 + randomY) * 64, character, undefined, "", true);
        // @ts-ignore
        let params = (new URL(document.location)).searchParams;
        let password = params.get("password");
        // emit event to server that a new player has joined
        this.game.events.emit(Defaults.GAME_SOCKET_NEW_PLAYER, {
            x: this.player.x,
            y: this.player.y,
            character,
            cred,
            password,
        });

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
        this.enemyBullets = this.physics.add.group();

        this.physics.add.overlap(this.player, this.roomCollider, this.roomCollision.bind(this));
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.otherPlayers);
        this.physics.add.collider(this.player, this.enemies);
        this.physics.add.collider(this.player, this.enemyBullets, this.playerEnemyBulletCollision.bind(this));
        this.doorCollider = this.physics.add.collider(this.player, this.doors);

        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.otherPlayers);
        this.physics.add.collider(this.enemies, this.player);
        this.physics.add.collider(this.enemies, this.playerBullets, this.enemyPlayerBulletCollision.bind(this));
        this.physics.add.collider(this.enemies, this.otherPlayerBullets, (object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) => {
            (object2 as Bullet).deactivate();
        });
        this.physics.add.collider(this.otherPlayers, this.enemyBullets, (object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) => {
            (object2 as Bullet).deactivate();
        });

        this.doorCollider.active = false;
        this.physics.add.collider(this.walls, this.playerBullets, this.wallPlayerBulletCollision.bind(this));
        this.physics.add.collider(this.walls, this.enemyBullets, this.wallEnemyBulletCollision.bind(this));
        this.doorPlayerBulletCollider = this.physics.add.collider(this.doors, this.playerBullets, this.wallPlayerBulletCollision.bind(this));
        this.doorPlayerBulletCollider.active = false;
        this.doorEnemyBulletCollider = this.physics.add.collider(this.doors, this.playerBullets, this.wallEnemyBulletCollision.bind(this));
        this.doorEnemyBulletCollider.active = false;

        this.game.events.emit(Defaults.GAME_SOCKET_GIVE_MAP);
    }

    wallPlayerBulletCollision(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        let bullet = object2 as Bullet;
        if (bullet.active) {
            this.game.events.emit(Defaults.GAME_SOCKET_PLAYER_BULLET_REMOVE, {
                id: bullet.id
            });
            bullet.deactivate();
        }
    }

    wallEnemyBulletCollision(wall: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
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
                    1,
                );
            } else {
                bullet = new Bullet(
                    Listeners.getInstance().getBulletUniqueID(),
                    this,
                    this.player.x,
                    this.player.y,
                    'shot',
                    undefined,
                    1,
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
        if (this.doorPlayerBulletCollider)
            this.doorPlayerBulletCollider.active = doorOpen;
        if (this.doorEnemyBulletCollider)
            this.doorEnemyBulletCollider.active = doorOpen;
        if (this.doorCollider)
            this.doorCollider.active = doorOpen;
        this.doors?.getChildren().forEach((val) => {
            // @ts-ignore
            val.setVisible(doorOpen);
        });
    }

    playerEnemyBulletCollision(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        let player = object1 as Player;
        let bullet = object2 as Bullet;

        if (bullet.active) {
            this.game.events.emit(Defaults.GAME_SOCKET_PLAYER_TAKE_DAMAGE, { damage: bullet.damage });
            bullet.deactivate();
        }
    }

    enemyPlayerBulletCollision(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
        let enemy = object1 as Enemy;
        let bullet = object2 as Bullet;

        if (bullet.active) {
            this.game.events.emit(Defaults.GAME_SOCKET_ENEMY_TAKE_DAMAGE, { enemyId: enemy.id, damage: bullet.damage });
            bullet.deactivate();
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
