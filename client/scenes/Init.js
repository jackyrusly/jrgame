import Phaser, { Scene } from 'phaser';

class Init extends Scene {
    constructor() {
        super({ key: 'Init' });
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    preload() {
        this.load.tilemapTiledJSON('map-town', 'assets/maps/town.json');        
        this.load.tilemapTiledJSON('map-house', 'assets/maps/house.json');

        this.load.spritesheet('house', 'assets/maps/house.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('town', 'assets/maps/town.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    create() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 13,
            repeat: -1
        });
    }

    createProgressBar() {
        var Rectangle = Phaser.Geom.Rectangle;
        var main = Rectangle.Clone(this.cameras.main);

        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

        this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

        this.progressBar = this.add.graphics();
    }

    onLoadComplete(loader) {
        this.scene.start('Town');
        this.scene.shutdown();
    }

    onLoadProgress(progress) {
        var color = (this.load.failed.size > 0) ? (0xff2200) : (0xffffff);

        this.progressRect.width = progress * this.progressCompleteRect.width;
        this.progressBar
            .clear()
            .fillStyle(0x222222)
            .fillRectShape(this.progressCompleteRect)
            .fillStyle(color)
            .fillRectShape(this.progressRect);
    }
}

export default Init;
