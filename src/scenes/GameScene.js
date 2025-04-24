import { Scene } from 'phaser';
import { Player } from '../Player';
import { Spawner } from '../Spawner';
import { Head } from '../Head';
import { Hud } from '../Hud'; // Import the Hud class

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.anchor = null;
        this.blocks = []; // Keep track of the blocks
        this.constraint = null;
        this.cursors = null; // Keyboard input
        this.desiredAngle = 0;
        this.leftWeight = 0;
        this.platform = null;
        this.platformFriction = 0.01; // Friction when on the platform
        this.platformFrictionStatic = 0.1; // Friction when on the platform
        this.player = null; // Player game object
        this.rightWeight = 0;
        this.spawner = null; // Spawner instance

        this.scrollSpeedX = 0.5; // Background horizontal scroll speed
        this.scrollSpeedY = 0.2; // Background vertical scroll speed
        this.baldScale = 0.5; // Scale of the bald image
        this.hud = null; // Hud game object

        this.enemies = []; // Array to hold enemies
        this.blackholes = [];
        this.juggleThreshold = 5;
        this.juggledObjects = []; // Array to keep track of currently juggled objects
        this.winCondition = 20;

        // Collision categories
        this.CATEGORY_PLAYER = 0x0001;
        this.CATEGORY_BLOCK = 0x0002;
        this.CATEGORY_ATTACK = 0x0004;
        this.CATEGORY_ENEMY = 0x0008; // New category for enemies
        this.CATEGORY_PLATFORM = 0x0016;
        this.CATEGORY_ENEMY_PROJECTILE = 0x0032; // New category for enemy projectiles

        this.balanceMeter = 0; // Balance meter stat

        this.timerText = null;

        this.musicTracks = [];
        this.currentMusic = null;
    }

    init() {
        this.cameras.main.fadeIn(100);
        const fxCamera = this.cameras.main.postFX.addPixelate(40);
        this.add.tween({
            targets: fxCamera,
            duration: 700,
            amount: -1,
            onComplete: () => {
                this.cameras.main.postFX.remove(fxCamera);
            },
        });

        this.plugins.get('rexCrtPipeline').add(this.cameras.main, {
            warpX: 0.05,
            warpY: 0.05,
            scanLineStrength: 0.05,
            scanLineWidth: 1024,
        });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Clear existing blocks and enemies
        this.clearScene();

        this.createBackground();

        // Create the Head instance
        this.head = new Head(this, width / 2, height);
        this.head.startBlinking();

        const levelOffset = 100;

        // Create the see-saw platform
        this.platform = this.matter.add.image(
            width / 2,
            height / 2 + levelOffset,
            'plank',
            null,
            {
                inertia: 10000,
                shape: { type: 'rectangle', width: 700, height: 15 },
                friction: this.platformFriction,
                frictionStatic: this.platformFrictionStatic,
                //restitution: 0.8,
                collisionFilter: {
                    category: this.CATEGORY_PLATFORM,
                },
                //isStatic: true,
            }
        );
        this.platform.setOrigin(0.5, 0.5);
        this.platform.setCollisionCategory(this.CATEGORY_PLATFORM);
        this.platform.setDepth(10);

        // Create an anchor point
        this.anchor = this.matter.add.circle(
            width / 2,
            height / 2 + levelOffset,
            50,
            {
                ignoreGravity: false,
                isStatic: true,
                isSensor: true,
            }
        );

        this.platformLocation = 0;
        this.platformStiffness = 0.2;

        // Create a constraint to connect the platform to the anchor
        this.constraint = this.matter.add.constraint(
            this.platform,
            this.anchor,
            this.platformLocation,
            this.platformStiffness,
            {
                damping: 0.1,
                angularStiffness: 0.1,
            }
        );

        this.createStopBlocks(levelOffset);
        this.createAnimations();
        this.createSounds();

        // Create the player
        this.player = new Player(this, width / 2, 100);

        this.spawnPlayer(); // Initial player spawn

        // Create the Hud
        this.hud = new Hud(this, this.player);

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Initialize the spawner
        this.spawner = new Spawner(this);

        this.handleCollisions();

        // Restart the game on 'R' key press
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart();
        });

        // slow down time but only for matter objects
        //this.matter.world.engine.timing.timeScale = 0.1;

        // Game timer using Phaser.Time.Clock
        this.gameDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.clock = this.time.addEvent({
            delay: this.gameDuration,
            callback: this.gameOver,
            callbackScope: this,
            loop: false,
        });
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.image(0, 0, 'background2').setOrigin(0, 0);

        // Add the background image
        this.bg = this.add.tileSprite(0, 0, width, height, 'background2');
        this.bg.setOrigin(0, 0);
        this.bg.setScrollFactor(0);
        this.bg.setTint(0xdddddd); // Tint the background to make it darker

        this.bg.postFX.addDisplacement('distort', -0.5, -0.5);
        const fx = this.bg.postFX.addPixelate(2);
    }

    createStopBlocks(levelOffset) {
        const width = this.scale.width;
        const height = this.scale.height;
        const offsety = 190;
        const offsetx = 125;

        this.matter.add.rectangle(
            width / 2 - offsetx,
            height / 2 + offsety,
            10,
            50,
            {
                isStatic: true,
                ignoreGravity: true,
            }
        );

        this.matter.add.rectangle(
            width / 2 + offsetx,
            height / 2 + offsety,
            10,
            50,
            {
                isStatic: true,
                ignoreGravity: true,
            }
        );
    }

    createAnimations() {
        // Create animations
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'stand',
            frames: this.anims.generateFrameNumbers('player', {
                start: 17,
                end: 22,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'enemyWalk',
            frames: this.anims.generateFrameNumbers('maga', {
                start: 1,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'enemyIdle',
            frames: [{ key: 'maga', frame: 0 }],
            frameRate: 20,
        });

        this.anims.create({
            key: 'enemyAttack',
            frames: this.anims.generateFrameNumbers('maga', {
                start: 9,
                end: 15,
            }),
            frameRate: 20,
        });

        this.anims.create({
            key: 'lawyerWalk',
            frames: this.anims.generateFrameNumbers('lawyer', {
                start: 1,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'lawyerIdle',
            frames: [{ key: 'lawyer', frame: 0 }],
            frameRate: 20,
        });

        this.anims.create({
            key: 'lawyerJump',
            frames: this.anims.generateFrameNumbers('lawyer', {
                start: 8,
                end: 11,
            }),
            frameRate: 5,
        });

        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 6,
            }),
            frameRate: 20,
        });
    }

    createSounds() {
        this.boomSound = this.sound.add('boom', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.boomSound2 = this.sound.add('boom2', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.jumpSound = this.sound.add('jump', {
            maxInstances: 3,
            volume: 0.2,
        });
        this.kissingSound = this.sound.add('kissing', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.boingSound = this.sound.add('boing', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.punchSound2 = this.sound.add('punch2', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.shockSound = this.sound.add('shock', {
            maxInstances: 1,
            volume: 0.5,
        });
        this.shockSound2 = this.sound.add('shock2', {
            maxInstances: 1,
            volume: 0.5,
        });
        this.squishSound = this.sound.add('squish', {
            maxInstances: 1,
            volume: 0.5,
        });
        this.paperSound = this.sound.add('paper', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.throwSound = this.sound.add('throw', {
            maxInstances: 3,
            volume: 0.3,
        });
        this.squishSound2 = this.sound.add('squish2', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.explosionSound = this.sound.add('explosion', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.coinSound = this.sound.add('coin', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.dropSound = this.sound.add('drop', {
            maxInstances: 3,
            volume: 0.5,
        });
        this.thankyouSound = this.sound.add('thankyou', {
            maxInstances: 1,
            volume: 3,
        });

        this.music = this.sound.add('bgmusic', {
            maxInstances: 1,
            volume: 1.1,
            loop: true,
        });
        this.music.play();
    }

    handleCollisions() {
        // Add a callback for when the attack area overlaps with another body
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {});
        });
    }

    clearScene() {
        this.sound.stopAll();

        // Clear existing blocks
        this.blocks.forEach((block) => {
            this.matter.world.remove(block);
            block.destroy(); // Also destroy the block
        });
        this.blocks = [];

        // Clear existing enemies
        this.enemies.forEach((enemy) => {
            enemy.destroy();
        });
        this.enemies = [];

        // Destroy existing player
        if (this.player && this.player.player) {
            this.player.player.destroy();
            this.player = null;
        }

        this.balanceMeter = 0;
    }

    spawnPlayer(init = true) {
        const width = this.scale.width;
        // Position the player at the center top of the platform
        this.player.setPosition(width / 2, 100);
        this.player.setVelocity(0, 0); // Stop any existing velocity
        if (init) this.player.hp = 100; // Reset player HP
        this.juggledObjects.splice(0, this.juggledObjects.length);

        // Add a simple tween for a fade-in effect on spawn
        this.tweens.add({
            targets: this.player,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Linear',
        });

        // add rotation to the particles
        const emitter = this.add.particles(
            this.player.x,
            this.player.y,
            'toupee',
            {
                speed: { min: -200, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 1.4, end: 0 }, // Increase starting scale
                lifespan: 500, // Increase lifespan slightly
                gravityY: 300, // Increase gravity
                quantity: 50, // Number of particles
                //blendMode: 'ADD',
                emitZone: {
                    type: 'random',
                    source: new Phaser.Geom.Circle(0, 0, 15), // Increase emit zone radius
                },
                duration: 150, // Emit for a slightly longer duration
                stopAfter: 50, // Stop after emitting 50 particles
                tint: [0xf9c22b, 0xd5e04b, 0xf79617, 0xfbff86], // Add multiple tints (yellow, orange, red)
                rotate: { min: 0, max: 360 }, // Add random initial rotation
                angularSpeed: { min: -180, max: 180 }, // Add random angular speed
            }
        );

        const soundKey = ['fired', 'bye', 'fakenews', 'rich', 'stupid'];
        const randomSound = Phaser.Utils.Array.GetRandom(soundKey);
        this.sound.play(randomSound, { maxInstances: 1, volume: 1.5 });
    }

    gameOver() {
        this.sound.stopAll();
        const pixelated = this.cameras.main.postFX.addPixelate(-1);
        const isEnding = this.player.hp > 0;
        let endingId = null;

        if (Math.abs(this.balanceMeter) <= this.winCondition) endingId = 3;
        else if (this.balanceMeter > this.winCondition) endingId = 2;
        else if (this.balanceMeter < -this.winCondition) endingId = 1;

        this.add.tween({
            targets: pixelated,
            duration: 700,
            amount: 40,
            onComplete: () => {
                this.cameras.main.fadeOut(100);
                this.scene.start('GameOver', {
                    balanceMeter: this.balanceMeter,
                    isEnding: isEnding,
                    endingId: isEnding ? endingId : 0,
                });
            },
        });
    }

    update(time, delta) {
        this.spawner.updateSpawnRate();

        // if the platform passes rotation -47,47, reset it to 0
        const maxRotation = Phaser.Math.DegToRad(47); // Convert degrees to radians
        if (
            this.platform.rotation > maxRotation ||
            this.platform.rotation < -maxRotation
        ) {
            this.platform.setRotation(0);
            this.platform.setVelocity(0, 0);
            this.platform.setAngularVelocity(0);
        }

        this.player.update(this.cursors);
        this.head.update(); // Update the head
        this.hud.update(); // Update the hud

        // Update enemies
        this.enemies.forEach((enemy) => {
            enemy.update();
        });

        this.blackholes.forEach((blackhole) => {
            blackhole.update();
        });

        // if the player is offscreen anywhere, respawn the player
        if (
            this.player.y > this.scale.height + 50 ||
            this.player.y < -50 ||
            this.player.x < -50 ||
            this.player.x > this.scale.width + 50
        ) {
            // only take damage if player falls down
            if (this.player.y > this.scale.height + 50) {
                this.player.takeDamage(10); // Player takes 10 damage
            }
            this.spawnPlayer(false);
        }

        // Scroll the background
        this.bg.tilePositionX += this.scrollSpeedX;
        this.bg.tilePositionY += this.scrollSpeedY;

        const decisionFactor = 5;

        // Remove blocks that have fallen off-screen
        this.blocks.forEach((block, index) => {
            if (
                block.y > this.scale.height + 20 ||
                block.x < -50 ||
                block.x > this.scale.width + 50
            ) {
                const screenCenterX = this.scale.width / 2;
                if (block.x < screenCenterX) {
                    this.balanceMeter = Math.max(
                        -100,
                        this.balanceMeter - decisionFactor
                    );
                } else {
                    this.balanceMeter = Math.min(
                        100,
                        this.balanceMeter + decisionFactor
                    );
                }

                this.matter.world.remove(block); // Remove from Matter world
                this.blocks.splice(index, 1); // Remove from the blocks array
                block.destroy(); // Destroy the block

                this.dropSound.play();
            }
        });

        // remove enemies that have fallen off-screen
        this.enemies.forEach((enemy, index) => {
            if (
                enemy.y > this.scale.height + 20 ||
                enemy.x < -50 ||
                enemy.x > this.scale.width + 50
            ) {
                const screenCenterX = this.scale.width / 2;
                if (enemy.x < screenCenterX) {
                    this.balanceMeter = Math.max(
                        -100,
                        this.balanceMeter - decisionFactor
                    );
                } else {
                    this.balanceMeter = Math.min(
                        100,
                        this.balanceMeter + decisionFactor
                    );
                }

                enemy.destroy(); // Destroy the enemy

                // Give player Supreme Juice for enemies falling off
                this.player.SupremeJuice = Math.min(
                    100,
                    this.player.SupremeJuice + 0.2
                );
            }
        });

        // Increase Supreme Juice over time
        this.player.SupremeJuice = Math.min(
            100,
            this.player.SupremeJuice + (0.1 * delta) / 1000
        ); // 0.1% per second

        // check this.tweens count, if it's greater than 120 splice the end off
        if (this.tweens.tweens.length > 100) {
            // Get all active tweens
            const allTweens = this.tweens.tweens;
            // Sort tweens by their progress (tweens that are closer to completion first)
            allTweens.sort((a, b) => a.progress - b.progress);
            // Determine how many tweens to remove
            const tweensToRemoveCount = allTweens.length - 20;
            // Remove the tweens that are closest to completion
            for (let i = 0; i < tweensToRemoveCount; i++) {
                allTweens[i].stop();
                allTweens[i].destroy();
            }
        }
    }
}
