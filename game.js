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
                this.act = function () {
                },
                Object.defineProperty(this, 'left', {
                    get: function () {
                        return this.pos.x;
                    }, set: function (newValue) {
                        this.pos.x += pos.x;
                    }
                }),
                Object.defineProperty(this, 'top', {
                    get: function () {
                        return this.pos.y;
                    }, set: function (newValue) {
                        this.pos.y += pos.y;
                    }
                }),
                Object.defineProperty(this, 'right', {
                    get: function () {
                        return this.pos.x + this.size.x;
                    }, set: function (newValue) {
                        this.pos.x += this.pos.x;
                    }
                }),
                Object.defineProperty(this, 'bottom', {
                    get: function () {
                        return this.pos.y + this.size.y;
                    }, set: function (newValue) {
                        this.pos.y += this.pos.y;
                    }
                }),
                Object.defineProperty(this, 'type', {value: 'actor', writable: true});
        } else {
            throw new Error('Неверные аргументы!');
        }
    }

    isIntersect(movingObject) {
        if (!(movingObject instanceof Actor) || movingObject === null) {
            throw new Error('Неверный аргумент!');
        }
        if (Object.is(this, movingObject)) {
            return false;
        }
        if (this.left === movingObject.left && this.top === movingObject.top && (movingObject.right < 0 || movingObject.bottom < 0)) {
            return false;
        }
        if (this.top === movingObject.bottom || this.right === movingObject.left || this.bottom === movingObject.top || this.left === movingObject.right) {
            return false;
        }
        if (
            (
                (
                    ( this.top >= movingObject.top && this.top <= movingObject.bottom ) || ( this.bottom > movingObject.top && this.bottom <= movingObject.bottom  )
                ) && (
                    ( this.left >= movingObject.left && this.left <= movingObject.right ) || ( this.right >= movingObject.left && this.right <= movingObject.right )
                )
            ) || (
                (
                    ( movingObject.top >= this.top && movingObject.top <= this.bottom ) || ( movingObject.bottom >= this.top && movingObject.bottom <= this.bottom )
                ) && (
                    ( movingObject.left >= this.left && movingObject.left <= this.right) || ( movingObject.right >= this.left && movingObject.right <= this.right )
                )
            )
        ) {
            return true;
        } else {
            return false;
        }
    }
}

class Pleer extends Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
        super(pos, size, speed);
        this.type = 'pleer';
    }

}

const pleer1 = new Pleer();
console.log(pleer1.type)

class Level {
    constructor(grid = [], actors = []) {
        if(arguments.length > 0) {
            this.grid = grid;
            this.actors = actors;
            this.player = actors.find( (el) => el === player );
            if(this.grid === 0) {
                this.height = 0;
            } else {
                if (grid.length > 1) {
                    const nextArray = [];
                    grid.forEach((el) => nextArray.push(el.length));
                    this.height = grid.length;
                    this.width =  Math.max.apply(null, nextArray);
                } else {
                    this.width = grid.length;
                }
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
        if (!(actor instanceof Actor) || actor === null) {
            throw new Error('Неверный аргумент!');
        }
    }

    obstacleAt(pos, size) {
        if (pos instanceof Vector && size instanceof Vector) {

        } else {
            throw new Error('Невреные аргументы!');
        }
    }

    removeActor(actor) {

    }

    noMoreActors(type) {

    }

    playerTouched(breakpoint, str, actor) {

    }
}

const grid = [
    [undefined, undefined],
    ['wall', 'wall']
];

function MyCoin(title) {
    this.type = 'coin';
    this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
    console.log('Все монеты собраны');
    console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
}
