class BaseModel {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 0;
    }
}

module.exports = BaseModel;