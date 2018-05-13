import { Scene } from 'phaser';
import Player from '../objects/player';
import { STOP } from '../../shared/constants/actions/player';
import { UP } from '../../shared/constants/directions';
import { HOUSE_1, TOWN } from '../../shared/constants/scenes';
import { MAP_HOUSE_1, IMAGE_HOUSE } from '../constants/assets';
import { FADE_DURATION } from '../constants/config';

class House_1 extends Scene {
    constructor() {
        super({ key: HOUSE_1 });
    }

    init() {
        this.layers = {};
        this.player = new Player(this, HOUSE_1, { x: 240, y: 365, direction: UP });
    }

    create() {
        this.map = this.add.tilemap(MAP_HOUSE_1);
        this.tileset = this.map.addTilesetImage(IMAGE_HOUSE);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.layers[1].setCollisionBetween(0, 100);
        this.layers[2].setCollisionByExclusion([-1, 67, 68, 69]);

        this.player.create();
    }

    update() {
        this.player.update();
    }

    changeScene() {
        this.player.socket.disconnect();
        this.scene.start(TOWN, HOUSE_1);
    }

    registerCollision(id) {
        let p = this.player;

        this.physics.add.collider(p.players[id], this.layers[2]);
        this.physics.add.collider(p.players[id], this.layers[1], (sprite, tile) => {
            if (tile.index === 20 && p.socket.id === id) {
                p.transition = true;
                p.socket.emit(STOP, { x: p.players[p.socket.id].x, y: p.players[p.socket.id].y });
                p.players[p.socket.id].anims.stop();
                this.cameras.main.fade(FADE_DURATION);
            }
        });
    }
}

export default House_1;