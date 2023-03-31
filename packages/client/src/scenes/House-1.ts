import { HOUSE_1, TOWN, UP } from '@jrgame/shared';
import { IMAGE_HOUSE, MAP_HOUSE_1 } from '@constants/assets';
import BaseScene from '@utilities/base-scene';

class House_1 extends BaseScene {
  constructor() {
    super(HOUSE_1);
  }

  init() {
    super.init({ x: 240, y: 365, direction: UP });
  }

  create() {
    super.create(MAP_HOUSE_1, IMAGE_HOUSE, true);
    this.registerTilesetAnimation(this.layers[2]);
  }

  registerCollision() {
    this.layers[1].setCollisionBetween(0, 100);
    this.layers[2].setCollisionByExclusion([-1, 67, 68, 69]);

    let player = this.player.players[this.player.socket.id];

    this.physics.add.collider(player, this.layers[2]);
    this.physics.add.collider(player, this.layers[1], (sprite, tile: any) => {
      if (tile.index === 20) {
        this.nextSceneKey = TOWN;
        this.onChangeScene();
      }
    });
  }
}

export default House_1;
