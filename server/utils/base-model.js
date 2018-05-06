class BaseModel {
    constructor() {
        this.id = '';
        this.x = 250;
        this.y = 250;
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