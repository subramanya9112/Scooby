import Phaser from 'phaser';
import Player from '../classes/Player';
import Bullet from '../classes/Bullet';
import Listeners from '../listners/listener';

export default class GameScene extends Phaser.Scene {
    public static sceneName = 'GameScene';
    player: Player | undefined;
    walls: Phaser.Physics.Arcade.StaticGroup | undefined;
    otherPlayers: Phaser.Physics.Arcade.Group | undefined;
    roomCollider: Phaser.Physics.Arcade.StaticGroup | undefined;
    playerBullets: Phaser.Physics.Arcade.Group | undefined;
    otherPlayerBullets: Phaser.Physics.Arcade.Group | undefined;

    constructor() {
        super(GameScene.sceneName);
    }

    init() {
        this.listenEvents();
    }

    createMapData(data: any) {
        console.log(data);
        data['tiles'].forEach((val: { x: number; y: number; }) => {
            this.add.sprite(val.x, val.y, 'tile').setInteractive().setOrigin(0, 0).setDepth(-1);
        })
        data['doors'].forEach((val: { x: number; y: number; }) => {
            this.add.sprite(val.x, val.y, 'door').setInteractive().setOrigin(0, 0).setDepth(-1);
        })

        data['walls'].forEach((val: { x: number | undefined; y: number; }) => {
            this.walls?.create(val.x, val.y - 32, 'wall', 0)
                .setScale(2)
                .setOrigin(0, 0)
                .setSize(64, 64)
                .setOffset(16, 56)
                .setDepth(val.y - 32);
        });

        data['roomCollider'].forEach((val: { startX: number; width: number; startY: number; height: number; }) => {
            let collider = new Phaser.GameObjects.Container(this, val.startX + val.width / 2, val.startY + val.height / 2)
                .setSize(val.width, val.height)
            this.roomCollider?.add(collider);
        });
    }

    listenEvents() {
        // create a new player
        this.game.events?.on('createPlayers', (data: { [id: string]: any; }) => {
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
        this.game.events?.on('spawnPlayer', (player: { [id: string]: any; }) => {
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
        this.game.events?.on('otherPlayerMovement', (player: { [id: string]: any; }) => {
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === player.id) {
                    otherPlayer.setPosition(player.x, player.y);
                }
            });
        });

        // a player has left the game
        this.game.events?.on('removePlayer', (id: string) => {
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === id) {
                    otherPlayer.cleanUp();
                }
            });
        });

        this.game.events?.on('otherPlayerBulletShot', (data: any) => {
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

        this.game.events?.on('otherPlayerBulletRemove', (data: any) => {
            let id = data.id;
            this.otherPlayerBullets?.getChildren().forEach((val) => {
                let otherPlayer = val as Bullet;
                if (otherPlayer.id === id) {
                    otherPlayer.deactivate();
                }
            });
        });

        this.game.events?.on('gotMap', (data: any) => {
            this.createMapData(data);
        });
    }

    create() {
        this.player = new Player(this, (4 * 40 + 20) * 64, (4 * 40 + 20) * 64, 'player', undefined, "", true);
        // emit event to server that a new player has joined
        this.game.events.emit('newPlayer', { x: this.player.x, y: this.player.y });

        this.roomCollider = this.physics.add.staticGroup();
        this.physics.add.overlap(this.player, this.roomCollider, this.roomCollision.bind(this));

        // create an other players group
        this.otherPlayers = this.physics.add.group();
        this.otherPlayers.runChildUpdate = true;

        this.walls = this.physics.add.staticGroup();
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.otherPlayers);
        this.game.events.emit('getMap');

        this.otherPlayerBullets = this.physics.add.group();

        this.playerBullets = this.physics.add.group();
        this.input.on('pointerdown', (pointer: PointerEvent) => {
            if (pointer.button == 0)
                this.shoot(pointer.x, pointer.y);
        });
        this.physics.add.collider(this.walls, this.playerBullets, (wall, bullet) => {
            this.game.events.emit('bulletRemove', {
                id: (bullet as Bullet).id
            });
            (bullet as Bullet).deactivate();
        });
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
            this.game.events.emit('bulletShot', {
                id: bullet.id,
                x: bullet.x,
                y: bullet.y,
                rotation,
            });
        }
    }

    sent: boolean = false;
    roomCollision() {
        console.log('room collision');
        if (this.sent === false) {
            this.sent = true;
            this.game.events.emit("levelComplete");
        }
    }

    update(time: number, delta: number): void {
        if (this.player) {
            this.player.update();

            const { x, y } = this.player;
            const old = this.player.oldPosition;
            if (old && (old.x !== x || old.y !== y)) {
                this.game.events.emit('playerMovement', { x, y });
            }
            // save old position data
            this.player.oldPosition = { x, y };
        }
    }
}
