import Phaser, { Scene } from 'phaser';
import Player from '../sprites/player';

class House extends Scene {
    constructor() {
        super({ key: 'House' });
    }

    init() {
        this.layers = {};
        this.player = new Player(this, 'House');
    }

    create() {
        this.map = this.add.tilemap('map-house');
        this.tileset = this.map.addTilesetImage('house');

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.layers[0].setCollisionBetween(0, 153);
        this.layers[1].setCollisionBetween(0, 100);
        this.layers[2].setCollisionByExclusion([-1, 67, 68, 69]);   

        this.player.create();
    }

    update() {
        this.player.update();
    }

    fadeOut() {
        this.player.socket.disconnect();
        this.scene.start('Town');
    }

    registerCollision(id) {
        let p = this.player;

        this.physics.add.collider(p.players[id], this.layers[0]);
        this.physics.add.collider(p.players[id], this.layers[2]);
        this.physics.add.collider(p.players[id], this.layers[1], (sprite, tile) => {
            if (tile.index === 20 && p.socket.id === id) {
                p.transition = true;
                p.socket.emit('stop', { x: p.players[p.socket.id].x, y: p.players[p.socket.id].y });
                p.players[p.socket.id].anims.stop();
                this.cameras.main.fade(1000);
            }
        });
    }
}

export default House;