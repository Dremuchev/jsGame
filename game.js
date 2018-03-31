'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x,
        this.y = y;
    }

    plus(vector) {
        if (vector instanceof Vector) {
            return new Vector(this.x + vector.x, this.y + vector.y);
        } else {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector!');
        }
    }

    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

}

class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
        if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
            this.pos = pos,
            this.size = size,
            this.speed = speed,
            this.act = function () {},
            this.typeName = 'actor';
        } else {
            throw new Error('Неверные аргументы!');
        }
    }

    get left() {
        return this.pos.x;
    }

    get top() {
        return this.pos.y;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get bottom() {
        return this.pos.y + this.size.y;
    }

    get type() {
        return this.typeName;
    }

    isIntersect(movingObject) {
        if (!(movingObject instanceof Actor) || movingObject === null) {
            throw new Error('Неверный аргумент!');
        }
        if (Object.is(this, movingObject)) {
            return false;
        }
        if (this.left === movingObject.left
            && this.top === movingObject.top
            && (movingObject.right < 0 || movingObject.bottom < 0)) {
            return false;
        }
        if (this.top === movingObject.bottom
            || this.right === movingObject.left
            || this.bottom === movingObject.top
            || this.left === movingObject.right) {
            return false;
        }
        if (((
        ( this.top >= movingObject.top && this.top <= movingObject.bottom )
        || ( this.bottom > movingObject.top && this.bottom <= movingObject.bottom  )
        ) && (
        ( this.left >= movingObject.left && this.left <= movingObject.right )
        || ( this.right >= movingObject.left && this.right <= movingObject.right )
        )
        ) || ((
        ( movingObject.top >= this.top && movingObject.top <= this.bottom )
        || ( movingObject.bottom >= this.top && movingObject.bottom <= this.bottom )
        ) && (
        ( movingObject.left >= this.left && movingObject.left <= this.right)
        || ( movingObject.right >= this.left && movingObject.right <= this.right )
        ))) {
            return true;
        } else {
            return false;
        }
    }
}

class Player extends Actor {
    constructor(pos = new Vector()) {
        super(pos);
        this.pos.y = pos.y - 0.5;
        this.size = new Vector(0.8, 1.5);
        this.typeName = 'player';
    }
}

class Gift extends Actor {
    constructor(pos = new Vector()) {
        super(pos);
        this.typeName = 'gift';
    }
}

class Coin extends Actor {
    constructor(pos = new Vector()) {
        super(pos);
        this.typeName = 'coin';
    }
}

class Mushroom extends Actor {
    constructor(pos = new Vector()) {
        super(pos);
        this.typeName = 'mushroom';
    }
}

class Level {
    constructor(grid = [], actors = []) {
        if(arguments.length > 0) {
            this.grid = grid;
            this.actors = actors;
            this.player = actors.find( (el, index) => {
                if( el.type === 'player' ) {
                    return el;
                }
            });
            if(grid.length > 0 && Array.isArray(grid[0])) {
                const nextArray = [];
                grid.forEach((el) => nextArray.push(el.length));
                this.width =  Math.max.apply(null, nextArray);
                this.height = grid.length;
            } else if(grid[0] === undefined) {
                this.width = 0
                this.height = grid.length;
            } else {
                this.height = grid.length;
                this.width = 1;
            }
            this.status = null;
            this.finishDelay = 1;
        } else {
            this.height = 0;
            this.width = 0;
            this.status = null;
            this.finishDelay = 1;
        }

    }

    isFinished() {
        if (status !== null && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(actor) {
        if ( !(actor instanceof Actor) || actor === null ) {
            throw new Error('Неверный аргумент!');
        }
        if( this.actors === undefined || this.actors.length === 1 ) {
            return undefined;
        } else if( this.actors.find( (el) => el.isIntersect(actor) ) ) {
            return this.actors.find( (el) => el.isIntersect(actor));
        } else {
            return undefined;
        }
    }

    obstacleAt(pos, size) {
        if ( !(pos instanceof Vector && size instanceof Vector) ) {
            throw new Error('Невреные аргументы!');
        }
        if( pos.x < 0  || pos.x >= this.width || pos.y < 0 ) {
            return 'wall';
        } else if( pos.y >= this.height ) {
            return 'lava';
        } else if( !Number.isInteger(pos.x) || !Number.isInteger(pos.y) ) {
            if( this.grid[Math.floor(pos.y + size.y)][Math.floor(pos.x + size.x)] !== 'wall'
            || this.grid[Math.floor(pos.y)][Math.floor(pos.x + size.x)] !== 'wall'
            || this.grid[Math.floor(pos.y)][Math.floor(pos.x)] !== 'wall'
            || this.grid[Math.floor(pos.y)][Math.floor(pos.x + size.x)] !== 'wall' ) {
                return undefined;
            } else {
                return 'wall';
            }
        } else if( this.grid[pos.y][pos.x] === 'wall' ) {
            return 'wall';
        } else if( this.grid[pos.y][pos.x] === 'lava' ) {
            return 'lava';
        } else {
            return undefined;
        }
    }

    removeActor(actor) {
        this.actors.splice( this.actors.indexOf(actor), 1 );
    }

    noMoreActors(actorType) {
        if(this.actors === undefined) {
            return true;
        } else if(this.actors.filter( (el) => el.type === actorType ).length === 0) {
            return true;
        } else return false;
    }

    playerTouched(object, actor) {
        if(this.status === null) {
            if(object === 'lava' || object === 'fireball') {
                this.status = 'lost';
            }
            if(object === 'coin' && actor !== undefined) {
                this.actors.splice( this.actors.indexOf(actor), 1);
                if(!( this.actors.find( (el) => el.type === 'coin' ) ) ) {
                    this.status = 'won';
                }
            }
        }
    }

}

class LevelParser {
    constructor(actorDict) {
        this.actorDict = actorDict;
    }
}

class Fireball extends Actor {
    constructor(pos = new Vector(), speed = new Vector()) {
        super();
        this.pos = pos;
        this.speed = speed;
        this.typeName = 'fireball';
        this.act = function(time, level) {
            const nextPos = this.getNextPosition(time);
            if(level.obstacleAt(nextPos, this.size) === undefined) {
                this.pos.x = nextPos.x;
                this.pos.y = nextPos.y;
            } else {
                this.handleObstacle();
            }
        }
    }

    getNextPosition(time) {
        if(this.speed.x === 0 && this.speed.y === 0) {
            return this.pos;
        } else if(time === undefined) {
            return new Vector().plus(this.pos).plus(this.speed);
        } else {
            return new Vector().plus(this.pos).plus(this.speed.times(time));
        }
    }

    handleObstacle() {
        this.speed.x *= -1;
        this.speed.y *= -1;
    }

}










