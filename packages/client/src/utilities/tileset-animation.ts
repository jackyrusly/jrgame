class TilesetAnimation {
  animations: any[];
  registered: any;
  layer: Phaser.Tilemaps.TilemapLayer | null;

  constructor() {
    this.animations = [];
    this.registered = {};
    this.layer = null;
  }

  register(layer: Phaser.Tilemaps.TilemapLayer, tileData: any) {
    this.layer = layer;

    let index = 0;
    for (let i in tileData) {
      let tile = tileData[i];
      tile.id = index++;
      tile.init = i;

      this.animations.push(tile);
    }
  }

  start() {
    for (let anm of this.animations) {
      this.repeat(anm.id, anm.animation, anm.init, 0);
    }
  }

  repeat(id: string, animation: any, prev: number, index: number) {
    if (this.registered[id]) this.registered[id] = null;

    this.layer!.replaceByIndex(prev, animation[index].tileid + 1);

    let total = animation.length;
    this.registered[id] = setTimeout(
      this.repeat.bind(
        this,
        id,
        animation,
        animation[index % total].tileid + 1,
        (index + 1) % total,
      ),
      animation[index].duration,
    );
  }

  destroy() {
    for (let i in this.registered) {
      if (this.registered[i]) {
        clearTimeout(this.registered[i]);
      }
    }
  }
}

export default TilesetAnimation;
