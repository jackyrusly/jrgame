import Phaser, { Scene } from 'phaser';

class House extends Scene {
    constructor() {
        super({ key: 'House' });
    }

    init() {
        this.layers = {};
        this.transition = true;
        this.input.keyboard.removeAllListeners();
    }

    create() {
        this.map = this.add.tilemap('map-house');
        this.tileset = this.map.addTilesetImage('house');

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.layers[0].setCollisionBetween(0, 153);
        this.layers[2].setCollisionBetween(0, 470);

        this.player = this.physics.add.sprite(240, 430, 'player', 10);

        this.cameras.main.fadeFrom(1000);

        this.cameras.main.on('camerafadeincomplete', () => {
            this.transition = false;
        });

        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.start('Town', { x: 250, y: 280 });
        });

        this.physics.add.collider(this.player, this.layers[0], (sprite, tile) => {
            if (tile.index === 4) {
                this.transition = true;
                this.player.anims.stop();
                this.cameras.main.fade(1000);
            }
        });

        this.physics.add.collider(this.player, this.layers[2]);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
    }

    update() {
        if (this.transition === false) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);

            if (this.keyA.isDown) {
                this.player.setVelocityX(-200);
                this.player.anims.play('left', true);
            } else if (this.keyD.isDown) {
                this.player.setVelocityX(200);
                this.player.anims.play('right', true);
            } else if (this.keyW.isDown) {
                this.player.setVelocityY(-200);
                this.player.anims.play('up', true);
            } else if (this.keyS.isDown) {
                this.player.setVelocityY(200);
                this.player.anims.play('down', true);
            } else {
                this.player.anims.stop();
            }
        }
    }
}

export default House;