//Connect 4: script.js

"use strict";
// REFERENCE: http://stackoverflow.com/questions/13756482/create-copy-of-multi-dimensional-array-not-reference-javascript
Array.prototype.clone = function () {
    var arr = [], i;
    for (i = 0; i < this.length; i++) {
        arr[i] = this[i].slice();
    }
    return arr;
};
function Run() {
    var thing = this;
    this.map = [];
    this.paused = false;
    this.won = false;
    this.rejectClick = false;
    this.move = 0;
    this.aiHistory = [];
    this.initiateWhenDone = false;
    /**
     * Only initalize once for these functions, can prevent race condition
     */
    this.initiateOnce = function () {
        if (this.initiateWhenDone) {
            return false;
        }
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.addEventListener('click', function (e) {
            thing.onClick(thing.canvas, e);
        });
        this.context = this.canvas.getContext('2d');
        this.initiateWhenDone = true;
    };
    this.initiate = function () {
        this.map = [];
        this.paused = false;
        this.won = false;
        this.rejectClick = false;
        this.move = 0;
        this.aiHistory = [];
        this.initiateOnce();
        var i;
        var j;
        for (i = 0; i <= 6; i++) {
            this.map[i] = [];
            for (j = 0; j <= 7; j++) {
                this.map[i][j] = 0;
            }
        }
        this.erase();
        this.drMask();
        this.write();
    };
    this.yourTurn = function () {
        if (this.move % 2 === 0) {
            return 1;
        }
        return -1;
    };
    this.write = function () {
        var i;
        var j;
        var message;
        message = "\n";
        message += "Move: " + this.move;
        message += "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                message += " " + this.map[i][j];
            }
            message += "\n";
        }
        console.log(message);
    };
    this.printState = function (status) {
        var i;
        var j;
        var message = "\n";
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                message += " " + status[i][j];
            }
            message += "\n";
        }
        console.log(message);
    };
    this.bigWinner = function (user) {
        this.paused = true;
        this.won = true;
        this.rejectClick = false;
        var message = null;
        if (user > 0) {
            message = "You win!";
        } else if (user < 0) {
            message = "EVIL ROBOT WINS";
        } else {
            message = "It's a tie";
        }
        message += " - Click to reset";
        this.context.save();
        this.context.font = '14pt sans-serif';
        this.context.fillStyle = "#111";
        this.context.fillText(message, 210, 20);
        this.context.restore();
        console.info(message);
    };
    this.startMap = function (status, column, val) {
        var mapTemp = status.clone();
        if (mapTemp[0][column] !== 0 || column < 0 || column > 6) {
            return -1;
        }
        var finished = false;
        var row = 0;
        var i;
        for (i = 0; i < 5; i++) {
            if (mapTemp[i + 1][column] !== 0) {
                finished = true;
                row = i;
                break;
            }
        }
        if (!finished) {
            row = 5;
        }
        mapTemp[row][column] = val;
        return mapTemp;
    };
    this.happening = function (column, returnedCall) {
        if (this.paused || this.won) {
            return 0;
        }
        if (this.map[0][column] !== 0 || column < 0 || column > 6) {
            return -1;
        }
        var finished = false;
        var row = 0, i;
        for (i = 0; i < 5; i++) {
            if (this.map[i + 1][column] !== 0) {
                finished = true;
                row = i;
                break;
            }
        }
        if (!finished) {
            row = 5;
        }
        this.animate(column, this.yourTurn(this.move), row, 0, function () {
            thing.map[row][column] = thing.yourTurn(thing.move);
            thing.move++;
            thing.drawing();
            thing.checkIt();
            thing.write();
            returnedCall();
        });
        this.paused = true;
        return 1;
    };
    this.checkIt = function () {
        var i;
        var j;
        var k;
        var rTemp = 0;
        var bTemp = 0;
        var brTemp = 0;
        var trTemp = 0;
        for (i = 0; i < 6; i++) {
            for (j = 0; j < 7; j++) {
                rTemp = 0;
                bTemp = 0;
                brTemp = 0;
                trTemp = 0;
                for (k = 0; k <= 3; k++) {
                    //from (i,j) to right
                    if (j + k < 7) {
                        rTemp += this.map[i][j + k];
                    }
                    //from (i,j) to bottom
                    if (i + k < 6) {
                        bTemp += this.map[i + k][j];
                    }

                    //from (i,j) to bottom-right
                    if (i + k < 6 && j + k < 7) {
                        brTemp += this.map[i + k][j + k];
                    }

                    //from (i,j) to top-right
                    if (i - k >= 0 && j + k < 7) {
                        trTemp += this.map[i - k][j + k];
                    }
                }
                if (Math.abs(rTemp) === 4) {
                    this.bigWinner(rTemp);
                } else if (Math.abs(bTemp) === 4) {
                    this.bigWinner(bTemp);
                } else if (Math.abs(brTemp) === 4) {
                    this.bigWinner(brTemp);
                } else if (Math.abs(trTemp) === 4) {
                    this.bigWinner(trTemp);
                }
            }
        }
        // checkIt if drawing
        if ((this.move === 42) && (!this.won)) {
            this.bigWinner(0);
        }
    };
    this.drCircle = function (x, y, r, fill, stroke) {
        this.context.save();
        this.context.fillStyle = fill;
        this.context.strokeStyle = stroke;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        //this.context.stroke();
        this.context.fill();
        this.context.restore();
    };
    this.drMask = function () {
        // drawing the mask
        // http://stackoverflow.com/questions/6271419/how-to-fill-the-opposite-shape-on-canvas
        // -->  http://stackoverflow.com/a/11770000/917957
        this.context.save();
        this.context.fillStyle = "#ddd";
        this.context.beginPath();
        var x, y;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 7; x++) {
                this.context.arc(75 * x + 100, 75 * y + 50, 25, 0, 2 * Math.PI);
                this.context.rect(75 * x + 150, 75 * y, -100, 100);
            }
        }
        this.context.fill();
        this.context.restore();
    };

    this.drawing = function () {
        var x, y;
        var fg_color;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 7; x++) {
                fg_color = "transparent";
                if (this.map[y][x] >= 1) {
                    fg_color = "#ff4136";
                } else if (this.map[y][x] <= -1) {
                    fg_color = "#000000";
                }
                this.drCircle(75 * x + 100, 75 * y + 50, 25, fg_color, "black");
            }
        }
    };
    this.erase = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    this.animate = function (column, move, to_row, cur_pos, callback) {
        var fg_color = "transparent";
        if (move >= 1) {
            fg_color = "#ff4136";
        } else if (move <= -1) {
            fg_color = "#000000";
        }
        if (to_row * 75 >= cur_pos) {
            this.erase();
            this.drawing();
            this.drCircle(75 * column + 100, cur_pos + 50, 25, fg_color, "black");
            this.drMask();
            window.requestAnimationFrame(function () {
                thing.animate(column, move, to_row, cur_pos + 5, callback);
            });
        } else {
            callback();
        }
    };

    this.onTheRegion = function (coord, x, radius) {
        if ((coord[0] - x)*(coord[0] - x) <=  radius * radius) {
            return true;
        }
        return false;
    };
    this.oncircle = function (coord, centerCoord, radius) {
        if ((coord[0] - centerCoord[0]) * (coord[0] - centerCoord[0]) <=  radius * radius
                && (coord[1] - centerCoord[1]) * (coord[1] - centerCoord[1]) <=  radius * radius) {
            return true;
        }
        return false;
    };

    this.onClick = function (canvas, e) {
        if (this.rejectClick) {
            return false;
        }
        if (this.won) {
            this.initiate();
            return false;
        }
        var rectangle = canvas.getBoundingClientRect(),
            x = e.clientX - rectangle.left,// - e.target.scrollTop,
            y = e.clientY - rectangle.top;// - e.target.scrollLeft;

        //console.log("(" + x + ", " + y + ")");
        var j, isValid;
        for (j = 0; j < 7; j++) {
            if (this.onTheRegion([x, y], 75 * j + 100, 25)) {
                // console.log("clicked region " + j);
                this.paused = false;
                isValid = this.happening(j, function () {
                    thing.robot(-1);
                });
                if (isValid === 1) { // give user retry if happening is invalid
                    this.rejectClick = true;
                }
                break; //there will be no 2 points that are clicked at a time
            }
        }
    };

    this.robot = function (aiMoveValue) {
        //console.log(this.aiHistory);
        var choice = null;

        var state = this.map.clone();
        //that.printState(state);
        function checkState(state) {
            /*if (typeof that.aiHistory[state] !== 'undefined') {
                return that.aiHistory[state];
            }*/

            var winValue = 0;
            var chainValue = 0;
            var i, j, k;
            var rTemp = 0, bTemp = 0, brTemp = 0, trTemp = 0;
            for (i = 0; i < 6; i++) {
                for (j = 0; j < 7; j++) {
                    rTemp = 0;
                    bTemp = 0;
                    brTemp = 0;
                    trTemp = 0;
                    for (k = 0; k <= 3; k++) {
                        //from (i,j) to right
                        if (j + k < 7) {
                            rTemp += state[i][j + k];
                        }

                        //from (i,j) to bottom
                        if (i + k < 6) {
                            bTemp += state[i + k][j];
                        }

                        //from (i,j) to bottom-right
                        if (i + k < 6 && j + k < 7) {
                            brTemp += state[i + k][j + k];
                        }

                        //from (i,j) to top-right
                        if (i - k >= 0 && j + k < 7) {
                            trTemp += state[i - k][j + k];
                        }
                    }
                    chainValue += rTemp * rTemp * rTemp;
                    chainValue += bTemp * bTemp * bTemp;
                    chainValue += brTemp * brTemp * brTemp;
                    chainValue += trTemp * trTemp * trTemp;

                    if (Math.abs(rTemp) === 4) {
                        winValue = rTemp;
                    } else if (Math.abs(bTemp) === 4) {
                        winValue = bTemp;
                    } else if (Math.abs(brTemp) === 4) {
                        winValue = brTemp;
                    } else if (Math.abs(trTemp) === 4) {
                        winValue = trTemp;
                    }

                }
            }
            //that.aiHistory[state] = [winVal, chainVal];
            return [winValue, chainValue];
        }
        function returnValue(status, depth, a, b) {
            var val = checkState(status);
            if (depth >= 4) { // if slow (or memory consumption is high), lower the value
                //that.printState(state);

                // calculate value
                var retValue = 0;

                // if bigWinner, value = +inf
                var winVal = val[0];
                var chainVal = val[1] * aiMoveValue;
                retValue = chainVal;

                // If it lead to winning, then do it
                if (winVal === 4 * aiMoveValue) { // AI bigWinner, AI wants to bigWinner of course
                    retValue = 999999;
                } else if (winVal === 4 * aiMoveValue * -1) { // AI lose, AI hates losing
                    retValue = 999999 * -1;
                }
                retValue -= depth * depth;

                return [retValue, -1];
            }

            var win = val[0];
            // if already won, then return the value right away
            if (win === 4 * aiMoveValue) { // AI bigWinner, AI wants to bigWinner of course
                return [999999 - depth * depth, -1];
            }
            if (win === 4 * aiMoveValue * -1) { // AI lose, AI hates losing
                return [999999 * -1 - depth * depth, -1];
            }

            if (depth % 2 === 0) {
                return minimumState(status, depth + 1, a, b);
            }
            return maximumState(status, depth + 1, a, b);

        }
        function choose(choice) {
            return choice[Math.floor(Math.random() * choice.length)];
        }
        function maximumState(status, depth, a, b) {
            var v = -100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;
            for (j = 0; j < 7; j++) {
                tempState = thing.startMap(status, j, aiMoveValue);
                if (tempState !== -1) {

                    tempVal = returnValue(tempState, depth, a, b);
                    if (tempVal[0] > v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }

                    // alpha-beta pruning
                    if (v > b) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    a = Math.max(a, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }
        function minimumState(status, depth, a, b) {
            var v = 100000000007;
            var move = -1;
            var tempVal = null;
            var tempState = null;
            var moveQueue = [];
            var j;

            for (j = 0; j < 7; j++) {
                tempState = thing.startMap(status, j, aiMoveValue * -1);
                if (tempState !== -1) {

                    tempVal = returnValue(tempState, depth, a, b);
                    if (tempVal[0] < v) {
                        v = tempVal[0];
                        move = j;
                        moveQueue = [];
                        moveQueue.push(j);
                    } else if (tempVal[0] === v) {
                        moveQueue.push(j);
                    }

                    // alpha-beta pruning
                    if (v < a) {
                        move = choose(moveQueue);
                        return [v, move];
                    }
                    b = Math.min(b, v);
                }
            }
            move = choose(moveQueue);

            return [v, move];
        }
        var choice_val = maximumState(state, 0, -100000000007, 100000000007);
        choice = choice_val[1];
        var val = choice_val[0];
        console.info("AI " + aiMoveValue + " choose column: " + choice + " (value: " + val + ")");

        this.paused = false;
        var done = this.happening(choice, function () {
            thing.rejectClick = false;
            //that.robot(-aiMoveValue);
        });

        // if fail, then random
        while (done < 0) {
            console.error("Falling back to random agent");
            choice = Math.floor(Math.random() * 7);
            done = this.happening(choice, function () {
                thing.rejectClick = false;
            });
        }

    };
    this.initiate();
}
document.addEventListener('DOMContentLoaded', function () {
    this.game = new Run();
    //this.game.robot(1);
});