// Instantiate canvas and get context
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

document.body.appendChild(canvas);

// Make sure the canvas takes the whole screen

// NOTE: making the canvas height and width 100% does not scale the canvas correctly.
// It is simply meant to make sure the canvas takes up the entire screen if it takes
// some time to rescale the canvas, so that if it does it is less noticable.
canvas.style = `
position: absolute;
top: 0px;
left: 0px;
width: 100%;
height: 100%;`

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Vector2 {
    constructor(x=0, y=x) {
        this.x = x;
        this.y = y; 
    }

    toDimensions() {
        return new Dimensions(
            this.x, 0, this.y, 0
        );
    }
}

class Dimensions {
    constructor(offsetX, scaleX, offsetY, scaleY) {
        this.offset    = new Vector2(offsetX, offsetY);
        this.scale     = new Vector2(scaleX, scaleY);
    }

    shiftByDimensions(dimensions) {
        return new Dimensions(
            dimensions.offset.x + this.offset.x,
            dimensions.scale.x + this.scale.x,
            dimensions.offset.y + this.offset.y,
            dimensions.scale.y + this.scale.y
        );
    }

    toVector2() {
        return new Vector2(
            this.offset.x + (this.scale.x * canvas.width),
            this.offset.y + (this.scale.x * canvas.height)
        );
    }
}

function drawWithRotation(degrees, at, callback) {
    ctx.save();

    ctx.translate(at.x, at.y);
    ctx.rotate(degrees * Math.PI / 180);

    callback();
    
    ctx.restore();
}

class UIElement {
    constructor(size, position) {
        size = size == undefined ? (new Dimensions(100, 0)) : size;
        position = position == undefined ? (new Dimensions(0, 0)) : position;
        
        this.size = size;
        this.position = position;
        this.fill = "";
        this.children = [];
        this.parent = null;
        this.anchor = new Vector2(0, 0);
        this.beforeRender = null;
        this.transparency = 0;
        this.rotation = 0;
    }

    render() {
        if(this.beforeRender != null && this.beforeRender != undefined) {
            this.beforeRender();
        }

        let positionVector2 = this.position.toVector2();
        let sizeVector2 = this.size.toVector2();

        this.rotation %= 360;

        
        drawWithRotation(
            this.rotation,
            positionVector2,
            (function() {
                ctx.globalAlpha = 1 - this.transparency;
                ctx.fillStyle = this.fill;
                ctx.fillRect(
                    this.anchor.x * -sizeVector2.x, 
                    this.anchor.y * -sizeVector2.y,
                    sizeVector2.x,
                    sizeVector2.y
                );

            }).bind(this)
        );

        this.children.forEach(child => {
            child.render();
        });
    }
    
    appendChild(child) {
        child.parent = this;
        this.children.push(child);
    }
}

var coreUI = new UIElement(new Dimensions(0, 1), new Dimensions());
coreUI.fill = "black";

var deltatime = 0;
let lastTimestamp = 0;
function tick(timestamp) {
    deltatime = (timestamp - lastTimestamp);
    let fps = Math.floor(1000 / deltatime); // Be conservative with estimates

    coreUI.render();

    lastTimestamp = timestamp;

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

var lastMouseEvent = {};
var mousePosition = (new Dimensions(0, 0.5)).toVector2();

window.addEventListener("mousemove", function(e) {
    mousePosition = new Vector2(e.pageX, e.pageY);
    lastMouseEvent = e;
});