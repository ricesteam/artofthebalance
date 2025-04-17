import { Scene } from 'phaser';
import { Player } from '../Player';
import { Spawner } from '../Spawner';

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
        this.platformFrictionStatic = 0; // Friction when on the platform
        this.player = null; // Player game object
        this.rightWeight = 0;
        this.spawner = null; // Spawner instance
        this.enemies = []; // Array to hold enemies

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

        // Add the background image
        const bg = this.add.image(0, 0, 'background2').setOrigin(0, 0);
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        const fx = bg.preFX.addDisplacement('distort', -0.3, -0.3);
        this.tweens.add({
            targets: fx,
            x: 0.03,
            y: 0.03,
            yoyo: true,
            loop: -1,
            duration: 2000,
            ease: 'sine.inout',
        });

        // Create the see-saw platform
        this.platform = this.matter.add.image(
            width / 2,
            height / 2,
            'platform',
            null,
            {
                inertia: 10000,
                shape: { type: 'rectangle', width: 700, height: 20 },
                friction: this.platformFriction,
                frictionStatic: this.platformFrictionStatic,
                restitution: 0.8,
                collisionFilter: {
                    category: this.CATEGORY_PLATFORM,
                },
            }
        );
        this.platform.setOrigin(0.5, 0.5);

        // Create an anchor point
        this.anchor = this.matter.add.circle(width / 2, height / 2, 0, {
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
            300,
            50,
            {
                isStatic: true,
                ignoreGravity: true,
            }
        );

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
            frames: [{ key: 'maga', frame: 8 }],
            frameRate: 20,
        });

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

        // Example: Add some blocks on either side (for testing)
        //this.spawner.addBlock(250, 0, 'left');
        //this.spawner.addBlock(500, 0, 'right');

        // Create some enemies - REMOVED
        //this.enemies.push(new Enemy(this, 400, 100));
        //this.enemies.push(new Enemy(this, 600, 100));

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
            });
        });

        // Restart the game on 'R' key press
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart();
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

        // Attack input
        if (this.attackKey.isDown) {
            this.player.attack();
        }

        // Remove blocks that have fallen off-screen
        this.blocks.forEach((block, index) => {
            if (block.y > this.scale.height + 200) {
                this.matter.world.remove(block); // Remove from Matter world
                this.blocks.splice(index, 1); // Remove from the blocks array
                block.destroy(); // Destroy the block
            }
        });
    }
}
