import { HOUSE_2, TOWN, UP } from '@jrgame/shared';
import { IMAGE_HOUSE, MAP_HOUSE_2 } from '@constants/assets';
import BaseScene from '@utilities/base-scene';

class House_2 extends BaseScene {
  constructor() {
    super(HOUSE_2);
  }

  init() {
    super.init({ x: 240, y: 397, direction: UP });
  }

  create() {
    super.create(MAP_HOUSE_2, IMAGE_HOUSE, true);
    this.registerTilesetAnimation(this.layers[2]);
  }

  registerCollision() {
    this.layers[1].setCollisionByExclusion([-1]);
    this.layers[2].setCollisionByExclusion([-1, 117, 118, 146, 147]);

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

export default House_2;
