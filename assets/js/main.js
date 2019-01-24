/* ----------------------------
/*  Name: port
    Author: Michael Novén
    Version: 1.0.0
/* -------------------------- */

// $(document).ready(function () {
//     //your code here

//     $('.button').click(function(){

//         var buttonId = $(this).attr('id');

//         debugger;
//         $('#modal-container').removeAttr('class').addClass(buttonId);
//         $('body').addClass('modal-active');
//     })
//     $('#modal-container').click(function(){
//         $(this).addClass('out');
//         $('body').removeClass('modal-active');
//     });
// });

// window.onload = () => {
//     setTimeout(() => {
//         document.getElementById("modal-container").removeAttribute("class");
//         document.getElementById("modal-container").classList.add("two");
//         document.body.classList.add("modal-active");
//     }, 500);


//     setTimeout(() => {
//         document.getElementById("modal-container").classList.add("out");
//         document.body.classList.remove("modal-active");
//     }, 2000)

// }

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application();
let particles = [];

const particleSize = 12;
const particleOffset = 2; // Must be 0?

class Particle {
    constructor(container, baseTexture, posX, posY, rendererWidth, rendererHeight) {
        this.sprite = new PIXI.Sprite(new PIXI.Texture(baseTexture));

        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        //this.sprite.on('pointerdown', test);

        // Fix last weird boundaries
        let xBoundary = particleSize;
        let yBoundary = particleSize;

        if (posX + particleSize > this.sprite.width) {
            xBoundary = this.sprite.width - posX;
        }

        if (posY + particleSize > this.sprite.height) {
            yBoundary = this.sprite.height - posY;
        }

        this.sprite.texture.frame = new PIXI.Rectangle(
            posX, posY, xBoundary, yBoundary,
        );

        this.MAX_SPEED = 60;
        this.rendererWidth = rendererWidth;
        this.rendererHeight = rendererHeight;

        // Give sprite an initial random position, that's how the animation in the first stage comes from
        this.sprite.x = Math.random() * rendererWidth;
        this.sprite.y = Math.random() * rendererHeight;
        this.posX = posX;
        this.posY = posY;

        container.addChild(this.sprite);
        this.container = container;
    }

    update(mouseX = 0, mouseY = 0) {
        this.speedX = (this.posX - this.sprite.x) / this.rendererWidth * this.MAX_SPEED;
        this.speedY = (this.posY - this.sprite.y) / this.rendererHeight * this.MAX_SPEED;

        this.distance = Math.sqrt(Math.pow(mouseX - this.sprite.x, 2) + Math.pow(mouseY - this.sprite.y, 2));

        if (this.distance < 25) {
            const accX = (mouseX - this.sprite.x);
            this.speedX -= accX;

            const accY = (mouseY - this.sprite.y);
            this.speedY -= accY;
        }

        this.sprite.x += this.speedX;
        this.sprite.y += this.speedY;
    }

    destroy() {
        this.container.removeChild(this.sprite);
        this.sprite.destroy();
    }
}

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    // Recreate all particles
}

window.onclick = () => {
    for (let i = 0; i < particles.length; ++i) {
        if (particles[i].distance <= 30) {

            console.log("POEN MODAL");
            document.getElementById("modal-container").removeAttribute("class");
            document.getElementById("modal-container").classList.add("two");
            document.body.classList.add("modal-active");
            return;

        }

    }

    document.getElementById("modal-container").classList.add("out");
    document.body.classList.remove("modal-active");
}

// const images = {
//     'nasa'

// }
// load the texture we need
PIXI.loader.add('nasa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png')
    .add('mojang', 'assets/images/mojang.png')
    .load((loader, resources) => {

        // debugger;
        // resources.nasa.baseTexture.width = 20;

        const texWidth = resources.mojang.texture.baseTexture.width / 3;
        const texHeight = resources.mojang.texture.baseTexture.height / 3;

        resources.mojang.texture.baseTexture.width = texWidth;
        resources.mojang.texture.baseTexture.height = texHeight;
        //resources.nasa.texture.width = texHeight;
        //resources.nasa.texture.width = texHeight;

        const texture = resources.mojang.texture;

        console.log("tex width", resources.mojang.texture.width)

        //texture.width = 20;

        console.log("default w", app.renderer.width)
        console.log("default h", app.renderer.height)

        //console.log("tex w" , texture.width);

        //const width = window.innerWidth;
        //const height = window.innerHeight;

        //let rendererWidth = 800;
        //let rendererHeight = 600;

        //rendererHeight = rendererWidth / (texture.width / texture.height);

        //app.renderer.resize(rendererWidth, rendererHeight);
        //app.renderer.resize(rendererWidth, rendererHeight);
        //const scale = rendererWidth / texture.width;

        //const scale = 1.0; // Do not change

        app.renderer.resize(window.innerWidth, window.innerHeight);

        const xOffset = particleSize + particleOffset;
        const yOffset = particleSize + particleOffset;

        console.log("texheight", texHeight);

        const xLoopCount = Math.floor(texWidth / xOffset);
        const yLoopCount = Math.floor(texHeight / yOffset);

        console.log("x;loop", xLoopCount);
        console.log("y;loop", yLoopCount);

        for (let i = 0; i <= xLoopCount; i++) {
            for (let j = 0; j <= yLoopCount; j++) {
                particles.push(new Particle(app.stage, texture, i * xOffset, j * yOffset, app.renderer.width, app.renderer.height));
            }
        }

        // // This creates a texture from a 'nasa.png' image
        //     const nasa = new PIXI.Sprite(resources.nasa.texture);

        //     // Setup the position of the nasa
        //     nasa.x = app.renderer.width / 2;
        //     nasa.y = app.renderer.height / 2;

        //     // Rotate around the center
        //     nasa.anchor.x = 0.5;
        //     nasa.anchor.y = 0.5;
        //     // Add the nasa to the scene we are building
        //     app.stage.addChild(nasa);

        // Listen for frame updates
        app.ticker.add(() => {
            // each frame we spin the nasa around a bit
            //nasa.rotation += 0.01;
            const mouseX = app.renderer.plugins.interaction.mouse.global.x;
            const mouseY = app.renderer.plugins.interaction.mouse.global.y;
            //const mouseX = this.mouseX - app.renderer.view.offsetLeft;
            //onst mouseY = this.mouseY - app.renderer.view.offsetTop;
            particles.forEach(element => element.update(mouseX, mouseY));
        });
    });
