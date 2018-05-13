import { Scene } from 'phaser';
import Player from '../objects/player';
import { UP } from '../../shared/constants/directions';
import { HOUSE_1, TOWN } from '../../shared/constants/scenes';
import { MAP_HOUSE_1, IMAGE_HOUSE } from '../constants/assets';
import TilesetAnimation from '../utilities/tileset-animation';
import { onChangeScene } from '../utilities/scene-helper';

class House_1 extends Scene {
    constructor() {
        super({ key: HOUSE_1 });
    }

    init() {
        this.layers = {};
        this.player = new Player(this, HOUSE_1, { x: 240, y: 365, direction: UP });
        this.tilesetAnimation = new TilesetAnimation();
    }

    create() {
        this.map = this.add.tilemap(MAP_HOUSE_1);
        this.tileset = this.map.addTilesetImage(IMAGE_HOUSE);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createDynamicLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.layers[1].setCollisionBetween(0, 100);
        this.layers[2].setCollisionByExclusion([-1, 67, 68, 69]);

        this.tilesetAnimation.register(this.layers[2], this.tileset.tileData);
        this.tilesetAnimation.start();

        this.player.create();
    }

    update() {
        this.player.update();
    }

    changeScene() {
        this.player.socket.disconnect();
        this.tilesetAnimation.destroy();
        this.scene.start(TOWN, HOUSE_1);
    }

    registerCollision(id) {
        let p = this.player;

        this.physics.add.collider(p.players[id], this.layers[2]);
        this.physics.add.collider(p.players[id], this.layers[1], (sprite, tile) => {
            if (tile.index === 20 && p.socket.id === id) {
                onChangeScene(p, this.cameras);
            }
        });
    }
}

export default House_1;
