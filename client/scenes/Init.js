import { Scene } from 'phaser';
import { UP, LEFT, DOWN, RIGHT } from '../../shared/constants/directions';
import { TOWN } from '../../shared/constants/scenes';
import { INIT } from '../constants/scenes';
import { MAP_TOWN, MAP_HOUSE_1, MAP_HOUSE_2, IMAGE_HOUSE, IMAGE_TOWN, IMAGE_PLAYER } from '../constants/assets';

class Init extends Scene {
    constructor() {
        super({ key: INIT });
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    preload() {
        this.load.tilemapTiledJSON(MAP_TOWN, 'assets/maps/town.json');
        this.load.tilemapTiledJSON(MAP_HOUSE_1, 'assets/maps/house-1.json');
        this.load.tilemapTiledJSON(MAP_HOUSE_2, 'assets/maps/house-2.json');
        
        this.load.spritesheet(IMAGE_HOUSE, 'assets/maps/house.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet(IMAGE_TOWN, 'assets/maps/town.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet(IMAGE_PLAYER, 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });

        /* this.load.audio('music-town', ['assets/music/town.mp3']); */

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    create() {
        /*
            this.music = this.sound.add('music-town', { loop: true });
            this.music.play();
        */

        this.anims.create({
            key: LEFT,
            frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 3, end: 5 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: RIGHT,
            frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 6, end: 8 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: UP,
            frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 9, end: 11 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: DOWN,
            frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 0, end: 2 }),
            frameRate: 13,
            repeat: -1
        });
        
        document.querySelector('canvas').addEventListener('pointerdown', function () {
            const activeElement = document.activeElement;

            if (document.activeElement !== document.body) {
                activeElement.setAttribute('readonly', 'readonly');
                activeElement.setAttribute('disabled', 'true');

                setTimeout(function() {
                    activeElement.blur();
                    activeElement.removeAttribute('readonly');
                    activeElement.removeAttribute('disabled');
                }, 100);
            }
        });
    }

    createProgressBar() {
        let Rectangle = Phaser.Geom.Rectangle;
        let main = Rectangle.Clone(this.cameras.main);

        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

        this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

        this.progressBar = this.add.graphics();
    }

    onLoadComplete(loader) {
        this.scene.start(TOWN);
        this.scene.shutdown();
    }

    onLoadProgress(progress) {
        let color = (0xffffff);

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
