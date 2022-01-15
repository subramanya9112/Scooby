import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Player from '../classes/Player';

export default class GameScene extends Phaser.Scene {
    public static sceneName = 'GameScene';
    player: Phaser.Physics.Arcade.Image | undefined;
    walls: Phaser.Physics.Arcade.StaticGroup | undefined;
    otherPlayers: Phaser.Physics.Arcade.Group | undefined;
    socket: Socket | undefined;
    roomCollider: Phaser.Physics.Arcade.StaticGroup | undefined;

    constructor() {
        super(GameScene.sceneName);
    }

    init() {
        // get a reference to our socket
        // @ts-ignore
        this.socket = this.sys.game.globals.socket;

        // listen for events
        this.listenForSocketEvents();
    }

    listenForSocketEvents() {
        // create a new player
        this.socket?.on('createPlayers', (players: { [id: string]: any; }) => {
            console.log(players)
            Object.keys(players).forEach((key) => {
                if (key != this.socket?.id) {
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
        this.socket?.on('spawnPlayer', ({ id, x, y }) => {
            let newPlayer = new Player(this,
                x,
                y,
                'player',
                undefined,
                id,
                false
            );
            this.otherPlayers?.add(newPlayer);
        });

        // a player has moved
        this.socket?.on('playerMovement', ({ id, x, y }) => {
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === id) {
                    otherPlayer.setPosition(x, y);
                }
            });
        });

        // a player has left the game
        this.socket?.on('removePlayer', (id) => {
            console.log(id)
            this.otherPlayers?.getChildren().forEach((val) => {
                let otherPlayer = val as Player;
                if (otherPlayer.id === id) {
                    otherPlayer.cleanUp();
                }
            });
        });
    }

    create() {
        this.player = new Player(this, (4 * 40 + 20) * 64, (4 * 40 + 20) * 64, 'player', undefined, "", true);
        this.cameras.main.startFollow(this.player);
        // emit event to server that a new player has joined
        this.socket?.emit('newPlayer', { x: this.player.x, y: this.player.y });

        var dataJSON = this.cache.json.get('data');
        console.log(dataJSON);

        dataJSON['tiles'].forEach((val: { x: number; y: number; }) => {
            this.add.sprite(val.x, val.y, 'tile').setInteractive().setOrigin(0, 0).setDepth(-1);
        })
        dataJSON['doors'].forEach((val: { x: number; y: number; }) => {
            this.add.sprite(val.x, val.y, 'door').setInteractive().setOrigin(0, 0).setDepth(-1);
        })

        this.walls = this.physics.add.staticGroup();
        dataJSON['walls'].forEach((val: { x: number | undefined; y: number; }) => {
            this.walls?.create(val.x, val.y - 32, 'wall', 0)
                .setScale(2)
                .setOrigin(0, 0)
                .setSize(64, 64)
                .setOffset(16, 56)
                .setDepth(val.y - 32);
        });
        this.physics.add.collider(this.player, this.walls);

        this.roomCollider = this.physics.add.staticGroup();
        dataJSON['roomCollider'].forEach((val: { startX: number; width: number; startY: number; height: number; }) => {
            let collider = new Phaser.GameObjects.Container(this, val.startX + val.width / 2, val.startY + val.height / 2)
                .setSize(val.width, val.height)
            this.roomCollider?.add(collider);
        });
        this.physics.add.overlap(this.player, this.roomCollider, this.roomCollision);

        // create an other players group
        this.otherPlayers = this.physics.add.group();
        this.otherPlayers.runChildUpdate = true;

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.otherPlayers);
    }

    roomCollision() {
        console.log('room collision');
    };

    update(time: number, delta: number): void {
        if (this.player) {
            this.player.update();

            const { x, y } = this.player;
            this.socket?.emit('playerMovement', { x, y });
        }
    }
}
