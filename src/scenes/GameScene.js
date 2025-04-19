import { Scene } from 'phaser';
import { Player } from '../Player';
import { Spawner } from '../Spawner';
import { Blackhole } from '../Blackhole';
import { Bomb } from '../Bomb';
import { Head } from '../Head';
import { BasicAttack } from '../attacks/BasicAttack'; // Import the BasicAttack class
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
        this.enemies = []; // Array to hold enemies
        this.blackholes = [];
        this.explosions = [];
        this.scrollSpeedX = 0.5; // Background horizontal scroll speed
        this.scrollSpeedY = 0.2; // Background vertical scroll speed
        this.baldScale = 0.5; // Scale of the bald image
        this.hud = null; // Hud game object

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

        // Create the Head instance
        this.head = new Head(this, width / 2, height);

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
                //restitution: 0.8,
                collisionFilter: {
                    category: this.CATEGORY_PLATFORM,
                },
                //isStatic: true,
            }
        );
        this.platform.setOrigin(0.5, 0.5);
        this.platform.setCollisionCategory(this.CATEGORY_PLATFORM);

        // Create an anchor point
        this.anchor = this.matter.add.circle(width / 2, height / 2 + 50, 50, {
            ignoreGravity: false,
            isStatic: true,
            isSensor: true,
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
                damping: 0.1,
                angularStiffness: 0.1,
            }
        );

        this.createStopBlocks();
        this.createAnimations();

        // Create the player
        this.player = new Player(this, width / 2, 100);

        // Create the Hud
        this.hud = new Hud(this, this.player);

        // Add the basic attack to the player's inventory
        const basicAttack = new BasicAttack(this);
        this.player.addAttack(basicAttack);

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Initialize the spawner
        this.spawner = new Spawner(this);

        this.handleCollisions();

        // Create blackhole where I click
        this.input.on('pointerdown', (pointer) => {
            const blackhole = new Blackhole(this, pointer.x, pointer.y);
            this.blackholes.push(blackhole);
            //const bomb = new Bomb(this, pointer.x, pointer.y);
            //this.explosions.push(bomb);
        });

        // Restart the game on 'R' key press
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart();
        });

        // slow down time but only for matter objects
        //this.matter.world.engine.timing.timeScale = 0.1;
    }

    createStopBlocks() {
        const width = this.scale.width;
        const height = this.scale.height;
        const offsety = 150;
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
                            // use setvelocity instead
                            otherGameObject.setVelocity(0, -5); // Adjust velocity as needed
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
        this.head.update(); // Update the head
        this.hud.update(); // Update the hud

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

        // if the player falls off screen, respawn him
        if (this.player.y > this.scale.height + 50) {
            this.player.setPosition(this.scale.width / 2, 100);
            this.player.setVelocity(0, 0);
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
            // Remove enemies that have been destroyed (health <= 0)
            else if (enemy.health <= 0) {
                this.enemies.splice(index, 1);
            }
        });
    }
}
