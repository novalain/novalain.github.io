/* ----------------------------
/*  Name: port
    Author: Michael Novén
    Version: 1.0.0
/* -------------------------- */



// TODO:
// - Invisible sprite behind particles to detect touches etc.
// - Font Rendering
// - Projects

const app = new PIXI.Application({ transparent: false, backgroundColor: '0xEEEEEEE' });
PIXI.utils.skipHello(); // remove pixi message in console log

function setupTextParticles() {

    let textParticles = [],
    graphicsCords = [],
    texture,
    isReady = false,
    settings = {
      text: 'Welcome',
      textSize: 250,
      spaceBetween: 4,
      sizeMax: 4,
      speedMin: 0.01,
      speedMax: 0.075,
      opacityMin: 1,
      particleType: 'circle',
      color1: '#50514F',
      color2: '#F25F5C',
      color3: '#FFE066',
      color4: '#247BA0',
      color5: '#70C1B3',
    };

    var sprites = new PIXI.ParticleContainer(30000, {
        scale: true,
        position: false,
        rotation: false,
        uvs: false,
        alpha: false
    });
    app.stage.addChild(sprites);

    app.ticker.add(function () {
        if (!isReady) {
            setup();
        }

        for (var i = 0, len = textParticles.length; i < len; i++) {
            textParticles[i].update();
        }
    });

    function setup() {
        colors = [settings.color1, settings.color2, settings.color3, settings.color4, settings.color5];

        textParticles = [];
        graphicsCords = [];

        texture = createTexture();

        var text = new PIXI.Text(settings.text, {
            fontWeight: 'bold',
            fontSize: settings.textSize,
            fontFamily: 'Arial',
            fill: '#000000',
            align: 'center'
        });

        text.anchor.set(0.5);
        text.x = app.renderer.width / 2;
        text.y = app.renderer.height / 2;

        app.stage.addChild(text);

        var tmpCanvas = app.renderer.plugins.extract.canvas(app.stage);
        var imageData = tmpCanvas.getContext('2d').getImageData(0, 0, app.renderer.width, app.renderer.height);

        var widthDiff = (app.renderer.width - tmpCanvas.width) / 2;
        var heightDiff = (app.renderer.height - tmpCanvas.height) / 2;

        if (widthDiff < 0) {
            widthDiff = 0;
        }

        if (heightDiff < 0) {
            heightDiff = 0;
        }

        app.stage.removeChild(text);

        //var tmpX = tmpY = colorIndex = tmpScale = tmpScaleMin = tmpScaleMax = tmpSpeed = 0, cords, t;
        for (var y = 0; y < tmpCanvas.height; y += settings.spaceBetween) {
            for (var x = 0; x < tmpCanvas.width; x += settings.spaceBetween) {
                if (imageData.data[((y * imageData.width + x) * 4) + 3] > 128) {
                    textParticles.push(new TextParticle(x + widthDiff, y + heightDiff));
                }
            }
        }

        shuffle(textParticles);

        for (var i = 0, len = textParticles.length; i < len; i++) {
            sprites.addChild(textParticles[i]);
        }

        isReady = true;
    }

    function createTexture() {
        var graphics = new PIXI.Graphics(),
            xCounter = 0,
            yCounter = 0,
            size = settings.sizeMax,
            colorTmp,
            spacer = 2;

        for (var i = 0, len = colors.length; i < len; i++) {
            xOffset = xCounter * (size * 2) + size + (xCounter * spacer);
            yOffset = yCounter * (size * 2) + size + (yCounter * spacer);

            colorTmp = colors[i].replace('#', '0x');

            graphics.beginFill(colorTmp);
            graphics.drawCircle(xOffset, yOffset, size, size);
            graphics.endFill();

            graphicsCords.push({ x: xOffset - size, y: yOffset - size });

            if (xOffset >= app.renderer.width - (size * 2) - size) {
                xCounter = 0;
                yCounter++;
            } else {
                xCounter++;
            }
        }

        return graphics.generateTexture();
    }

    function TextParticle(x, y) {
        this.scaleMin = getRandom(0.1, 0.25);
        this.scaleMax = getRandom(0.75, 1);
        this.baseScale = getRandom(this.scaleMin, this.scaleMax);
        this.velocity = getRandom(settings.speedMin, settings.speedMax);
        this.speed = 0;

        var cords = graphicsCords[getRandomInt(0, colors.length - 1)];
        var t = new PIXI.Texture(texture.baseTexture, new PIXI.math.Rectangle(cords.x, cords.y, settings.sizeMax * 2, settings.sizeMax * 2));

        PIXI.Sprite.call(this, t);

        this.position.x = x;
        this.position.y = y;
        this.anchor.x = this.anchor.y = 0.5;
        this.scale.x = this.scale.y = this.baseScale;
        this.alpha = getRandom(settings.opacityMin, 1);
    }

    TextParticle.prototype = Object.create(PIXI.Sprite.prototype);

    TextParticle.prototype.update = function () {
        this.baseScale = Math.abs(Math.sin(this.speed)) + this.scaleMin;
        this.scale.x = this.scale.y = this.baseScale;
        this.speed += this.velocity;
    }

    /**********************************************************************/

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }
}

/*******************************************************/

var popCounter = 0;

let particles = [];
let loadedResources;
let mainText, projectText;

let particleSize;
let particleOffset = 1; // Must be 0?

console.log(window.devicePixelRatio);
const TOP_OFFSET = 720 / window.devicePixelRatio;

let stopModalFromClosingFirstTime = false;

class Particle {
    constructor(container, baseTexture, posX, posY, posOffsetX, posOffsetY, rendererWidth, rendererHeight) {
        this.sprite = new PIXI.Sprite(new PIXI.Texture(baseTexture));

        this.sprite.interactive = true;
        this.sprite.buttonMode = true;

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

        this.sprite.on('pointerdown', (e) => {
            // TODO: get this to work and get rid of state
            // e.data.originalEvent.preventDefault();
            // e.data.originalEvent.stopImmediatePropagation();
            // e.data.originalEvent.stopPropagation();
            stopModalFromClosingFirstTime = true;
            document.getElementById("modal-container").removeAttribute("class");
            document.getElementById("modal-container").classList.add("six");
        });

        this.sprite.zOrder = 10;

        this.MAX_SPEED = 70;
        this.rendererWidth = rendererWidth;
        this.rendererHeight = rendererHeight;

        // Give sprite an initial random position, that's how the animation in the first stage comes from
        this.sprite.x = Math.random() * rendererWidth;
        this.sprite.y = Math.random() * rendererHeight;
        this.posX = posOffsetX + posX;
        this.posY = posOffsetY + posY;

        container.addChild(this.sprite);
        this.container = container;

        this.time = 0.0;
    }

    update(mouseX = 0, mouseY = 0, dt) {
        this.speedX = (this.posX - this.sprite.x) / this.rendererWidth * this.MAX_SPEED;
        this.speedY = (this.posY - this.sprite.y) / this.rendererHeight * this.MAX_SPEED;

        const distance = Math.sqrt(Math.pow(mouseX - this.sprite.x, 2) + Math.pow(mouseY - this.sprite.y, 2));

        if (distance < 15) {
            const accX = (mouseX - this.sprite.x);
            this.speedX -= accX;

            const accY = (mouseY - this.sprite.y);
            this.speedY -= accY;
        }

        // if (this.speedX <= 0.0) {
        //     this.speedX = Math.random() * 2.0;
        // }

        // TODO Some cool effect
        // this.time += dt;
        // if (this.time > 300) {
        //     this.posX -= 20;
        //     this.time = 0.0;
        // }

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
console.log(app.view);

document.body.appendChild(app.view);

window.onresize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    for (let i = 0; i < particles.length; ++i) {
        particles[i].destroy();
    }
    particles = [];
    createFonts();
    createImages(loadedResources, false);
    // Recreate all particles
}

window.onclick = () => {
    // If sprite is showing modal, don't do anything
    if (stopModalFromClosingFirstTime) {
        stopModalFromClosingFirstTime = false;
        return;
    }
    document.getElementById("modal-container").classList.add("out");
    document.body.classList.remove("modal-active");
}

// window.onclick = () => {
//     for (let i = 0; i < particles.length; ++i) {
//         if (particles[i].distance <= 30) {
//             document.getElementById("modal-container").removeAttribute("class");
//             document.getElementById("modal-container").classList.add("six");
//             document.body.classList.add("modal-active");
//             return;
//         }

//     }

//     document.getElementById("modal-container").classList.add("out");
//     document.body.classList.remove("modal-active");

function loadParticleImage(texture, scale, posX, posY, shouldScale) {
    if (shouldScale) {
        texture.baseTexture.width = texture.baseTexture.width / scale;
        texture.baseTexture.height = texture.baseTexture.height / scale;
    }

    const sprite = new PIXI.Sprite(new PIXI.Texture(texture.baseTexture));
    sprite.alpha = 0.0;

    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointerdown', (e) => {
        // TODO: get this to work and get rid of state
        // e.data.originalEvent.preventDefault();
        // e.data.originalEvent.stopImmediatePropagation();
        // e.data.originalEvent.stopPropagation();
        stopModalFromClosingFirstTime = true;
        document.getElementById("modal-container").removeAttribute("class");
        document.getElementById("modal-container").classList.add("six");
    });

    sprite.x = posX;
    sprite.y = posY;
    sprite.zOrder = 99;

    app.stage.addChild(sprite);

    const xOffset = particleSize + particleOffset;
    const yOffset = particleSize + particleOffset;

    const xLoopCount = Math.floor(texture.baseTexture.width / xOffset);
    const yLoopCount = Math.floor(texture.baseTexture.height / yOffset);

    for (let i = 0; i <= xLoopCount; i++) {
        for (let j = 0; j <= yLoopCount; j++) {
            particles.push(new Particle(app.stage, texture, i * xOffset, j * yOffset, posX, posY, app.renderer.width, app.renderer.height));
        }
    }
}

function createImages(resources, shouldScale) {
    const baseScale = 1.0 * Math.pow(window.devicePixelRatio, 0.9);
    console.log("baseScale", baseScale);
    const IMAGE_PADDING = 15 * Math.pow(window.devicePixelRatio, 0.7);
    particleSize = 10;

    const appWidth = document.documentElement.clientWidth;
    const appHeight = document.documentElement.clientHeight;

    console.log("dv", window.devicePixelRatio);
    loadParticleImage(resources.nasa.texture, baseScale * 3.1, appWidth / 2 - resources.mojang.texture.width / (baseScale * 4.5) / 2 - resources.nasa.texture.width / (baseScale * 3.2) - IMAGE_PADDING, TOP_OFFSET, shouldScale);
    loadParticleImage(resources.mojang.texture, baseScale * 4.5, appWidth / 2 - resources.mojang.texture.width / (baseScale * 4.5) / 2, TOP_OFFSET, shouldScale);
    loadParticleImage(resources.opera.texture, baseScale * 4.5, appWidth / 2 + resources.mojang.texture.width / (baseScale * 4.5) / 2 + IMAGE_PADDING, TOP_OFFSET, shouldScale);

    loadParticleImage(resources.nl.texture, baseScale * 1.3, appWidth / 2 - resources.nl.texture.width / (baseScale * 1.3) / 1.3, resources.mojang.texture.height / (baseScale * 4.5) + TOP_OFFSET + IMAGE_PADDING, shouldScale);
    loadParticleImage(resources.ic.texture, baseScale * 1, appWidth / 2 - resources.nl.texture.width / (baseScale * 1.3) / 1.3 + resources.nl.texture.width / (baseScale * 1.3) + IMAGE_PADDING, resources.mojang.texture.height / (baseScale * 4.5) + TOP_OFFSET + IMAGE_PADDING + 3, shouldScale);
    particleSize = 30;
    particleOffset = 1;
    loadParticleImage(resources.project_voxel.texture, baseScale * 2, appWidth / 2 - resources.project_voxel.texture.width / (baseScale * 2) / 2, TOP_OFFSET - resources.project_voxel.texture.height / (baseScale * 2) - 100, shouldScale);
}

function createFonts() {
    if (mainText) {
        mainText.destroy();
        app.stage.removeChild(mainText);
    }

    if (projectText) {
        projectText.destroy();
        app.stage.removeChild(projectText);
    }

    // projectText = new PIXI.Text('Projects', { fontFamily: 'Verdana', fontSize: 50, fontVariant: "small-caps", fill: 0xb5b5b5, align: 'center' });
    // projectText.y = 500;
    // projectText.x = window.innerWidth / 2 - projectText.width / 2;

    const appWidth = document.documentElement.clientWidth;
    const appHeight = document.documentElement.clientHeight;

    mainText = new PIXI.Text('Welcome', { fontFamily: 'Verdana', fontSize: 50, fontVariant: "small-caps", fill: 0xb5b5b5, align: 'center' });
    mainText.y = TOP_OFFSET - 90;
    mainText.x = appWidth / 2 - mainText.width / 2;
    mainText.alpha = 0.0;
    app.stage.addChild(mainText);

    projectText = new PIXI.Text('Projects', { fontFamily: 'Verdana', fontSize: 50, fontVariant: "small-caps", fill: 0xb5b5b5, align: 'center' });
    projectText.y = TOP_OFFSET + 320;
    projectText.x = appWidth / 2 - projectText.width / 2;
    projectText.alpha = 0.0;

    //app.stage.addChild(projectText);
}

// load the texture we need
PIXI.loader
    .add('nasa', 'assets/images/nasa.png')
    .add('mojang', 'assets/images/mojang.png')
    .add('opera', 'assets/images/operacropped.png')
    .add('nl', 'assets/images/nl2.png')
    .add('ic', 'assets/images/ic2.png')
    .add('project_voxel', 'assets/images/me.gif')
    .load((loader, resources) => {

        loadedResources = resources;
        // debugger;
        // resources.nasa.baseTexture.width = 20;
        app.renderer.resize(window.innerWidth, 2000);
        createImages(resources, true);
        createFonts();
        //setupTextParticles();


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


        var particleCount = 100;
        var particleColors = ['26a3ff', '13ce66', 'ff49db', 'af8dd1', '9162bf', 'ff7849', 'ffc82c']
        var particleSettings;

        for (var i = 0; i < particleCount; i++) {
            particleSettings = {
                particleSize: 8,
                x: Math.floor(Math.random() * app.renderer.width),
                y: Math.floor(Math.random() * app.renderer.height),
                scale: Math.floor(Math.random() * 3) / 3,
                alpha: 0.6 * Math.random(),
                particleSpeed: Math.floor(Math.min(200, Math.random() * 1000)),
                color: particleColors[Math.floor(Math.random() * 1.0 * particleColors.length)]
            }
            createParticle(particleSettings);
        }

        function createParticle() {

            // GRAPHIC
            var graphic = new PIXI.Graphics(); // create graphic
            graphic.beginFill('0x' + particleSettings.color);
            graphic.drawCircle(0, 0, particleSettings.particleSize); // (x, y, radius) // gets scaled as a sprite later
            graphic.endFill();

            // TEXTURE
            var texture = graphic.generateCanvasTexture(); // create texture using graphic (scaleMode, resolution)
            texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // scale mode for pixelation

            // SPRITE
            var particleSprite = new PIXI.Sprite(texture);  // create particle using texture
            particleSprite.interactive = true; 						  // enable mouse and touch events
            particleSprite.buttonMode = true; 						  // show hand cursor on mouseover
            particleSprite.anchor.set(0.5); 							  // center anchor point
            //particleSprite.blendMode = PIXI.BLEND_MODES.SCREEN;

            // console.log('createParticle')
            // console.log('_particleSpeed', _particleSpeed);

            // SET POSITIONING
            TweenMax.set(particleSprite, { pixi: { x: particleSettings.x, y: particleSettings.y, scale: particleSettings.scale, alpha: particleSettings.alpha } }, 0);
            TweenMax.to(particleSprite, particleSettings.particleSpeed, {
                pixi: { x: Math.floor(Math.random() * app.renderer.width), y: Math.floor(Math.random() * app.renderer.height) }, ease: Power4.easeOut,
                onComplete: function () {
                    popParticle();
                }
            }, 1);

            //
            function popParticle() {
                TweenMax.to(particleSprite, 0.3, { pixi: { scale: 3, alpha: 0 } }, 0);
            }

            particleSprite.zOrder = 0;
            // MOUSE EVENTS
            particleSprite.mouseover = function () {
                // TweenMax.to(particleSprite, 0.3, {pixi:{x:0, y:0}}, 0);
                popParticle();
                popCounter++
                // GAMIFY - keep score of popped particles
                // if (popCounter >= 5) {
                //   alert('Targets popped!')
                //   popCounter = 0;
                // }
            }

            // ADD SPRITE TO STAGE
            app.stage.addChild(particleSprite);

        }

        // // Listen for frame updates
        app.ticker.add(() => {
            // each frame we spin the nasa around a bit
            //nasa.rotation += 0.01;
            const mouseX = app.renderer.plugins.interaction.mouse.global.x;
            const mouseY = app.renderer.plugins.interaction.mouse.global.y;
            //const mouseX = this.mouseX - app.renderer.view.offsetLeft;
            //onst mouseY = this.mouseY - app.renderer.view.offsetTop;

            document.body.style.cursor = "default";
            particles.forEach(element => {
                element.update(mouseX, mouseY, app.ticker.deltaTime);
                if (mainText.alpha < 1.0) {
                    mainText.alpha += 0.00001 * app.ticker.deltaTime;
                }
                if (projectText.alpha < 1.0) {
                    projectText.alpha += 0.00001 * app.ticker.deltaTime;
                }
                // if (element.distance < 30) {
                //     document.body.style.cursor = "pointer";
                // }
            });
        });
    });
