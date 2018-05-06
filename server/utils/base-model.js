class BaseModel {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 0;
    }

    update() {
        this.updatePosition();
    }

    updatePosition() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

module.exports = BaseModel;