import { Scene } from 'phaser';
import Player from '../objects/player';
import { UP } from '../../shared/constants/directions';
import { HOUSE_2, TOWN } from '../../shared/constants/scenes';
import { MAP_HOUSE_2, IMAGE_HOUSE } from '../constants/assets';
import TilesetAnimation from '../utilities/tileset-animation';
import { onChangeScene } from '../utilities/scene-helper';

class House_2 extends Scene {
    constructor() {
        super({ key: HOUSE_2 });
    }

    init() {
        this.layers = {};
        this.player = new Player(this, HOUSE_2, { x: 240, y: 397, direction: UP });
        this.tilesetAnimation = new TilesetAnimation();
    }

    create() {
        this.map = this.add.tilemap(MAP_HOUSE_2);
        this.tileset = this.map.addTilesetImage(IMAGE_HOUSE);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createDynamicLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.layers[1].setCollisionByExclusion([-1]);
        this.layers[2].setCollisionByExclusion([-1, 117, 118, 146, 147]);

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
        this.scene.start(TOWN, HOUSE_2);
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

export default House_2;
