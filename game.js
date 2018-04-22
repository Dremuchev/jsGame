'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x,
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector!');
        } else {
            return new Vector(this.x + vector.x, this.y + vector.y);

        }
    }

    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

}

class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
        if (!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
            throw new Error('Неверные аргументы!');
        } else {
            this.pos = pos,
            this.size = size,
            this.speed = speed
        }
    }

    act() {}

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
        return 'actor';
    }

    isIntersect(movingObject) {
        if (!(movingObject instanceof Actor) || movingObject === null) {
            throw new Error('Неверный аргумент!');
        }
        if (this === movingObject) {
            return false;
        }
        return (!(movingObject.bottom <= this.top || movingObject.top >= this.bottom || movingObject.right <= this.left || movingObject.left >= this.right));
    }
}


class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.player = actors.find((el) => el.type === 'player');
        this.status = null;
        this.finishDelay = 1;
        if (arguments.length !== 0) {
            const nextArray = grid.map((el) => el.length);
            this.width =  Math.max(...nextArray);
            this.height = grid.length;
        } else {
            this.width = 0;
            this.height = 0;
        }

    }

    isFinished() {
        return (status !== null && this.finishDelay < 0);
    }

    actorAt(actor) {
        if (!(actor instanceof Actor) || actor === null) {
            throw new Error('Неверный аргумент!');
        } else {
            return (this.actors.find((el) => el.isIntersect(actor)));
        }
    }

    obstacleAt(pos, size) {
        if (!(pos instanceof Vector && size instanceof Vector)) {
            throw new Error('Невреные аргументы!');
        }
        if(pos.x < 0  || pos.x > this.width - size.x || pos.y < 0) {
            return 'wall';
        } else if(pos.y > this.height - size.y) {
            return 'lava';
        }
        for(let i = Math.floor(pos.y); i < Math.ceil(pos.y + size.y); i++) {
            for(let j = Math.floor(pos.x); j < Math.ceil(pos.x + size.x); j++) {
                if(this.grid[i][j]) {
                    return this.grid[i][j];
                }
            }
        }
    }

    removeActor(actor) {
        const finded = this.actors.indexOf(actor);
        if (finded >= 0) {
            this.actors.splice(finded, 1);
        }
    }

    noMoreActors(actorType) {
        return (!this.actors.some((el) => el.type === actorType));

    }

    playerTouched(object, actor) {
        if(object === 'lava' || object === 'fireball') {
            this.status = 'lost';
        } else if (object === 'coin' && actor !== undefined) {
            this.removeActor(actor);
            if(this.noMoreActors(object)) {
                this.status = 'won';
            }
        }
    }
}

class LevelParser {
    constructor(actorDict = {}) {
        this.actorDict = Object.assign({}, actorDict);
    }

    actorFromSymbol(sym) {
        return this.actorDict[sym];
    }

    obstacleFromSymbol(sym) {
        if(sym === 'x') {
            return 'wall';
        }
        if(sym === '!') {
            return 'lava';
        }
    }

    createGrid(array) {
        const mapLevel = array.map((el) => el.split(''));
        mapLevel.forEach((row) => {
            row.map((cell, numIndex) => {
            row[numIndex] = this.obstacleFromSymbol(cell);
            })
        })
        return mapLevel;
    }

    createActors(array) {
        const actorMap =[];
        const tempArray = array.map((el) => el.split(''));
        tempArray.forEach((row, rowIndex) => {
            row.forEach((cell, numIndex ) => {
                let isConstructor = this.actorDict[cell];
                if(typeof(isConstructor) === 'function' && Object.create(isConstructor.prototype) instanceof Actor) {
                    actorMap.push(new isConstructor(new Vector(numIndex, rowIndex)) );
                }
            })
        })
        return actorMap;
    }

    parse(array) {
        return new Level(this.createGrid(array), this.createActors(array));
    }

}

class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, new Vector(1,1), speed);
    }

    act(time, level) {
        const nextPos = this.getNextPosition(time);
        if(level.obstacleAt(nextPos, this.size) === undefined) {
            this.pos = nextPos;
        } else {
            this.handleObstacle();
        }
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

}

class HorizontalFireball extends Fireball {
    constructor(pos, speed) {
        super(pos, new Vector(2, 0));
    }

}

class VerticalFireball extends Fireball {
    constructor(pos, speed) {
        super(pos, new Vector(0, 2));
    }

}

class FireRain extends Fireball {
    constructor(pos = new Vector()) {
        super(pos, new Vector(0, 3));
        this.basePos = pos;

    }

    handleObstacle() {
        this.pos = this.basePos;
    }
}

class Coin extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6));
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.spring = Math.random(0, 2 * Math.PI);
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.basePos = this.pos;
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.spring += this.springSpeed * time;
        return this.basePos.plus(this.getSpringVector());

    }

}

class Player extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.8, 1.5));
        this.pos = new Vector(this.pos.x, this.pos.y - 0.5);
    }

    get type() {
        return 'player';
    }
}

const schemas = [
    [
        '         ',
        '         ',
        '    =    ',
        '       o ',
        '     !xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ],
    [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
    ],
    [
    '      v                ',
    '    v      =          x',
    '  v         x          ',
    '        o              ',
    '        x   x        o ',
    '@   x       x   =      ',
    'x           xxxxxxxxxxx',
    '                       '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
}

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
.then(() => alert('Вы выиграли приз!'));