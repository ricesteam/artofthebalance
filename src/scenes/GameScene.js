import { Scene } from 'phaser';
import { Player } from '../Player';
import { Spawner } from '../Spawner';
import { Blackhole } from '../Blackhole';
import { Explosion } from '../Explosion';

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.anchor = null;
        this.attackKey = null; // Attack input key
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
        this.enemies = []; // Array to hold enemies
        this.blackholes = [];
        this.explosions = [];
        this.scrollSpeedX = 0.5; // Background horizontal scroll speed
        this.scrollSpeedY = 0.2; // Background vertical scroll speed
        this.baldScale = 0.5; // Scale of the bald image

        // Collision categories
        this.CATEGORY_PLAYER = 0x0001;
        this.CATEGORY_BLOCK = 0x0002;
        this.CATEGORY_ATTACK = 0x0004;
        this.CATEGORY_ENEMY = 0x0008; // New category for enemies
        this.CATEGORY_PLATFORM = 0x0016;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Clear existing blocks and enemies
        this.clearScene();

        this.add.image(0, 0, 'background2').setOrigin(0, 0);

        // Add the background image
        this.bg = this.add.tileSprite(0, 0, width, height, 'background2');
        this.bg.setOrigin(0, 0);
        this.bg.setScrollFactor(0);
        this.bg.setTint(0xdddddd); // Tint the background to make it darker

        // move this stuff and anything related to to bald to the Head class ai!
        // Add the 'bald' image at the bottom center of the screen
        this.baldImage = this.add
            .image(width / 2, height + 40, 'bald')
            .setOrigin(0.5, 1) // Center the image horizontally, bottom vertically
            .setScale(this.baldScale); // Scale the image

        // Add a wobbly tween effect to the bald image
        this.tweens.add({
            targets: this.baldImage,
            //x: () => Phaser.Math.FloatBetween(width / 2 - 10, width / 2 + 10), // Move slightly up and down
            y: () => Phaser.Math.FloatBetween(height + 80, height + 30), // Move slightly up and down
            rotation: () => Phaser.Math.FloatBetween(-0.06, 0.06), // Rotate slightly
            duration: 1500, // Duration of the tween
            yoyo: true, // Make it go back and forth
            repeat: -1, // Repeat infinitely
            ease: 'quart.inout',
        });

        const fx = this.bg.preFX.addPixelate(2);
        this.bg.preFX.addDisplacement('distort', -0.5, -0.5);

        this.tweens.add({
            targets: fx,
            amount: -1,
            yoyo: true,
            loop: -1,
            duration: 2000,
            ease: 'sine.inout',
        });

        // Create the see-saw platform
        this.platform = this.matter.add.image(
            width / 2,
            height / 2 + 50,
            'plank',
            null,
            {
                inertia: 10000,
                shape: { type: 'rectangle', width: 700, height: 15 },
                friction: this.platformFriction,
                frictionStatic: this.platformFrictionStatic,
                restitution: 0.8,
                collisionFilter: {
                    category: this.CATEGORY_PLATFORM,
                },
                //isStatic: true,
            }
        );
        this.platform.setOrigin(0.5, 0.5);
        this.platform.setCollisionCategory(this.CATEGORY_PLATFORM);

        // Create an anchor point
        this.anchor = this.matter.add.circle(width / 2, height / 2 + 50, 0, {
            ignoreGravity: false,
            isStatic: true,
        });

        this.platformLocation = 0;
        this.platformStiffness = 0.2;

        // Create a constraint to connect the platform to the anchor
        this.constraint = this.matter.add.constraint(
            this.platform,
            this.anchor,
            this.platformLocation,
            this.platformStiffness,
            {
                damping: 0.8,
                angularStiffness: 1,
            }
        );

        // Create the static blocks to limit rotation
        this.stopblock = this.matter.add.rectangle(
            width / 2,
            height / 2 + 150,
            250,
            50,
            {
                isStatic: true,
                ignoreGravity: true,
            }
        );

        this.createAnimations();

        // Create the player
        this.player = new Player(this, width / 2, 100);

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.attackKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.Z
        );

        // Initialize the spawner
        this.spawner = new Spawner(this);

        this.handleCollisions();

        // Create blackhole where I click
        this.input.on('pointerdown', (pointer) => {
            //const blackhole = new Blackhole(this, pointer.x, pointer.y);
            //this.blackholes.push(blackhole);
            const explosion = new Explosion(this, pointer.x, pointer.y);
            this.explosions.push(explosion);
        });

        // Restart the game on 'R' key press
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart();
        });

        // slow down time but only for matter objects
        //this.matter.world.engine.timing.timeScale = 0.1;
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
            frames: [{ key: 'player', frame: 8 }],
            frameRate: 20,
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
    }

    handleCollisions() {
        // Add a callback for when the attack area overlaps with another body
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                if (bodyA.label === 'attack1' || bodyB.label === 'attack1') {
                    // Determine which body is the other object
                    let otherBody =
                        (bodyA === bodyA.label) === 'attack1' ? bodyB : bodyA;
                    let otherGameObject = otherBody.gameObject;
                    if (otherGameObject) {
                        // Check if player and its body are valid before applying force
                        if (this.player) {
                            const pushbackDirection = new Phaser.Math.Vector2(
                                this.player.playerDirection,
                                0
                            );
                            pushbackDirection.rotate(this.platform.rotation);
                            pushbackDirection.scale(this.player.attackPushback);
                            otherGameObject.applyForce(
                                this.player.body.position,
                                pushbackDirection
                            );
                        }

                        // Check if the other object is an enemy
                        if (otherGameObject.name === 'maga') {
                            otherGameObject.takeDamage(1);
                        }

                        // Check if the other object is a block
                        if (otherBody.label === 'junk') {
                            otherGameObject.takeDamage(0.2); // Reduce block mass
                        }
                    }
                }

                // Bounce objects off the player if they land on top
                if (
                    (bodyA === this.player.body ||
                        bodyB === this.player.body) &&
                    (bodyA.label === 'junk' ||
                        bodyB.label === 'junk' ||
                        bodyA.label === 'maga' ||
                        bodyB.label === 'maga')
                ) {
                    let otherBody = bodyA === this.player.body ? bodyB : bodyA;
                    let otherGameObject = otherBody.gameObject;

                    if (otherGameObject) {
                        // Check if the object is above the player
                        if (otherGameObject.y < this.player.y) {
                            // Apply an upward force to the other object
                            otherGameObject.applyForce({ x: 0, y: -0.05 }); // Adjust force as needed
                        }
                    }
                }
            });
        });
    }

    clearScene() {
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
    }

    update() {
        this.player.update(this.cursors);

        // Update enemies
        this.enemies.forEach((enemy) => {
            enemy.update();
        });

        this.blackholes.forEach((blackhole) => {
            blackhole.update();
        });

        this.explosions.forEach((explosion) => {
            explosion.update();
        });

        // Attack input
        if (this.attackKey.isDown) {
            this.player.attack();
        }

        // Scroll the background
        this.bg.tilePositionX += this.scrollSpeedX;
        this.bg.tilePositionY += this.scrollSpeedY;

        // Remove blocks that have fallen off-screen
        this.blocks.forEach((block, index) => {
            if (block.y > this.scale.height + 200) {
                this.matter.world.remove(block); // Remove from Matter world
                this.blocks.splice(index, 1); // Remove from the blocks array
                block.destroy(); // Destroy the block
            }
        });

        // remove enemies that have fallen off-screen
        this.enemies.forEach((enemy, index) => {
            if (enemy.y > this.scale.height + 200) {
                this.enemies.splice(index, 1); // Remove from the enemies array
                enemy.die(); // Destroy the enemy
            }
        });
    }
}
