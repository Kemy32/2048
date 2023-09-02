class Playground extends Component {

    gameSize = 4;
    takenTiles = {};
    highScore = 0;
    score = 0;

    constructor(parent) {
        super(parent, 'components/playground/style.css')
    }

    getHTML() {
        const numberOfStartTiles = 2;

        document.documentElement.style.setProperty('--game-size', this.gameSize);

        const parentDiv = document.createElement("div");
        parentDiv.style.position = "relative";
        parentDiv.style.margin = "auto";
        const div = document.createElement("div");
        div.classList.add("playground");

        for (let x = 0; x < this.gameSize; x++) {
            for (let y = 0; y < this.gameSize; y++) {
                const tile = new Tile(div, true);
                tile.render();
            }
        }

        const avaliablePositions = this.getGetAvaliablePosition();

        for (let i = 0; i < numberOfStartTiles; i++) {
            this.createTile(avaliablePositions, div, false);
        }

        this.updateScore();

        window.onkeyup = (e) => {
            const points = this.getDirectionPoints(null, e.key);

            if (!points) {
                return;
            }

            if (points.isUp || points.isDown) {
                for (let x = 0; x < this.gameSize; x++) {
                    for (let y = points.rangeStart;; y = y + points.step) {
                        const directionEnd = y > points.endValue || y < points.startValue;
                        if (directionEnd) {
                            break
                        }
                        this.gamePlay(x, y, e);
                    }
                }
            } else if (points.isRight || points.isLeft) {
                for (let y = 0; y < this.gameSize; y++) {
                    for (let x = points.rangeStart;; x = x + points.step) {
                        const directionEnd = x > points.endValue || x < points.startValue;
                        if (directionEnd) {
                            break
                        }
                        this.gamePlay(x, y, e);
                    }
                }
            }
            if (points.isUp || points.isDown || points.isRight || points.isLeft) {
                const currentAvaliablePos = this.getGetAvaliablePosition();
                if (currentAvaliablePos.length != 0) {
                    this.createTile(currentAvaliablePos, div, false);
                    this.updateScore();

                } else if (this.isGameOver()) {
                    div.classList.add("game-over");
                    const gameOverText = document.createElement("p");
                    gameOverText.innerHTML = "Game Over";
                    gameOverText.classList.add("game-over-text");

                    parentDiv.appendChild(gameOverText);

                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                    }
                    const highScore = document.querySelector(".high-score");
                    highScore.innerHTML = this.highScore;


                }

            }
        }

        parentDiv.appendChild(div);
        return parentDiv;
    }

    createTile(avaliablePositions, element, animation) {
        const tile = new Tile(element);
        const index = Math.floor(Math.random() * avaliablePositions.length);
        const positionRandom = avaliablePositions[index];


        avaliablePositions.splice(index, 1);

        if (animation) {
            tile.render().then(() => {
                tile.move(positionRandom.x, positionRandom.y);
            })
        } else {
            tile.render();
            tile.move(positionRandom.x, positionRandom.y);
        }

        tile.x = positionRandom.x;
        tile.y = positionRandom.y;

        this.takenTiles[tile.x + '-' + tile.y] = tile;
    }

    gamePlay(x, y, e) {
        const tile = this.takenTiles[x + "-" + y];
        if (tile) {
            const neighbour = this.getNeighbourTile(tile, e.key);
            const neartestTile = neighbour.nearestTile;
            const axis = neighbour.farestEmpty;
            if (axis) {
                this.emptyTile(tile);
                tile.move(axis.x, axis.y);
                this.takenTiles[axis.x + "-" + axis.y] = tile;
            }
            if (neartestTile && tile.value == neartestTile.value) {
                this.mergeTiles(neartestTile, tile);
            }
        }
    }

    getGetAvaliablePosition() {
        const avaliable = [];
        for (let x = 0; x < this.gameSize; x++) {
            for (let y = 0; y < this.gameSize; y++) {
                if (!this.takenTiles[x + '-' + y]) {
                    avaliable.push({
                        x,
                        y
                    });
                }
            }
        }
        return avaliable;
    }

    getDirectionPoints(tile, direction) {
        const isUp = direction === "ArrowUp";
        const isDown = direction === "ArrowDown";
        const isRight = direction === "ArrowRight";
        const isLeft = direction === "ArrowLeft";

        const isPositiveDirection = isUp || isLeft;

        if (isUp || isDown || isLeft || isRight) {
            const rangeStart = isPositiveDirection ? 0 : this.gameSize - 1;
            const rangeEnd = isPositiveDirection ? this.gameSize : -1;

            const step = (isPositiveDirection ? 1 : -1);
            const point = tile ? (isLeft || isRight ? tile.x : tile.y) + step : null;

            const startValue = Math.min(rangeStart, rangeEnd);
            const endValue = Math.max(rangeStart, rangeEnd);

            return {
                isUp,
                isDown,
                isRight,
                isLeft,
                rangeStart,
                rangeEnd,
                startValue,
                endValue,
                step,
                point
            }
        }
    }

    getNeighbourTile(tile, direction) {
        let farestEmpty = null;
        let nearestTile = null;
        let findEmpty = true;

        const opposite = {
            ArrowUp: "ArrowDown",
            ArrowDown: "ArrowUp",
            ArrowRight: "ArrowLeft",
            ArrowLeft: "ArrowRight"
        }

        const points = this.getDirectionPoints(tile, direction);
        const oppositePoints = this.getDirectionPoints(tile, opposite[direction]);

        if (points.isUp || points.isDown) {
            for (let y = points.point;; y = y + points.step) {

                const directionEnd = y >= points.endValue || y <= points.startValue;
                const oppositeDirectionEnd = oppositePoints.point >= oppositePoints.endValue || oppositePoints.point <= oppositePoints.startValue;

                const endByFound = !findEmpty && nearestTile;

                if ((directionEnd && oppositeDirectionEnd) || endByFound) {
                    break
                }

                const currentTile = this.takenTiles[tile.x + "-" + y];
                const oppositeTile = this.takenTiles[tile.x + "-" + oppositePoints.point];

                if (!directionEnd) {
                    if (currentTile && !nearestTile) {
                        nearestTile = currentTile;
                    }
                }

                if (!oppositeDirectionEnd) {
                    if (!oppositeTile) {
                        if (findEmpty) {
                            farestEmpty = {
                                x: tile.x,
                                y: oppositePoints.point
                            };
                        }
                    } else {
                        findEmpty = false;
                    }
                }

                oppositePoints.point += oppositePoints.step;
            }
        }

        if (points.isRight || points.isLeft) {
            for (let x = points.point;; x = x + points.step) {
                const directionEnd = x >= points.endValue || x <= points.startValue;
                const oppositeDirectionEnd = oppositePoints.point >= oppositePoints.endValue || oppositePoints.point <= oppositePoints.startValue;

                const endByFound = !findEmpty && nearestTile;

                if ((directionEnd && oppositeDirectionEnd) || endByFound) {
                    break
                }

                const currentTile = this.takenTiles[x + "-" + tile.y];
                const oppositeTile = this.takenTiles[oppositePoints.point + "-" + tile.y];

                if (!directionEnd) {
                    if (currentTile && !nearestTile) {
                        nearestTile = currentTile;
                    }
                }

                if (!oppositeDirectionEnd) {
                    if (!oppositeTile) {
                        if (findEmpty) {
                            farestEmpty = {
                                x: oppositePoints.point,
                                y: tile.y
                            };
                        }
                    } else {
                        findEmpty = false;
                    }
                }

                oppositePoints.point += oppositePoints.step;
            }
        }

        return {
            nearestTile,
            farestEmpty
        };
    }

    emptyTile(tile) {
        const empty = new Tile(this.element, true);
        empty.x = tile.x;
        empty.y = tile.y;

        delete this.takenTiles[tile.x + '-' + tile.y];
    }

    mergeTiles(tile, mergedTile) {
        mergedTile.value = mergedTile.value * 2;
        this.emptyTile(tile);

        let task = new Promise((done) => {
            tile.move(mergedTile.x, mergedTile.y);
            setTimeout(() => {
                mergedTile.updateValue(mergedTile.value);
                tile.element.remove();
                done();
            }, 50);
        })

        return task;
    }

    isGameOver() {
        for (let x = 0; x < this.gameSize; x++) {
            for (let y = 0; y < this.gameSize; y++) {
                let tile = this.takenTiles[x + "-" + y];
                let nearestRight = this.getNeighbourTile(tile, "ArrowRight").nearestTile;
                let nearestDown = this.getNeighbourTile(tile, "ArrowDown").nearestTile;
                let isEqualToRightTile = nearestRight != undefined && tile.value == nearestRight.value;
                let isEqualToDownTile = nearestDown != undefined && tile.value == nearestDown.value;
                if (isEqualToRightTile || isEqualToDownTile) {
                    return false;
                }
            }
        }
        return true;
    }

    updateScore() {
        this.score = 0;
        let takenTilesValues = Object.values(this.takenTiles);
        for (let i = 0; i < takenTilesValues.length; i++) {
            this.score += takenTilesValues[i].value;
        }

        const scoreLabel = document.querySelector(".current-score");
        scoreLabel.innerHTML = this.score;
    }

}