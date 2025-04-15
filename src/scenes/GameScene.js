import Spawner from '../Spawner.js';
import Player from '../Player.js';

export default class GameScene extends Phaser.Scene {
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

        // Collision categories
        this.CATEGORY_PLAYER = 0x0001;
        this.CATEGORY_BLOCK = 0x0002;
        this.CATEGORY_ATTACK = 0x0004;
    }

    preload() {
        // Load game assets here
        this.load.image('platform', 'assets/platform.png'); // Replace with your asset
        this.load.image('block', 'assets/block.png'); // Replace with your asset
        this.load.image('player', 'assets/player.png'); // Replace with your asset
        this.load.image('background', 'assets/background.png'); // Replace with your asset
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Add the background image
        this.add.image(0, 0, 'background').setOrigin(0, 0);

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
                ignoreGravity: true,
            }
        );
        this.platform.setOrigin(0.5, 0.5);

        // Create an anchor point
        this.anchorIgnoreGravity = true;
        this.anchor = this.matter.add.circle(width / 2, height / 2, 0, {
            ignoreGravity: this.anchorIgnoreGravity,
            isStatic: true,
        });
        this.anchor.ignoreGravity = this.anchorIgnoreGravity;

        this.platformLocation = 0;
        this.platformStiffness = 1;

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

        // Create the player
        this.player = new Player(this, 200, 100);

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.Z
        );

        // Initialize the spawner
        this.spawner = new Spawner(this);

        // Example: Add some blocks on either side (for testing)
        this.spawner.addBlock(250, 0, 'left');
        this.spawner.addBlock(500, 0, 'right');

        // Add a callback for when the attack area overlaps with another body
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                if (
                    this.player.attackArea &&
                    (pair.bodyA === this.player.attackArea.body ||
                        pair.bodyB === this.player.attackArea.body) &&
                    pair.bodyA !== this.player.player.body &&
                    pair.bodyB !== this.player.player.body
                ) {
                    // Check if the other body is an enemy or damageable object
                    const otherBody =
                        pair.bodyA === this.player.attackArea.body
                            ? pair.bodyB
                            : pair.bodyA;
                    const otherGameObject = otherBody.gameObject;

                    if (otherGameObject) {
                        // Apply damage to the collided object
                        console.log('Hit:', otherGameObject);

                        // Check if the other object is a block
                        if (this.blocks.includes(otherGameObject)) {
                            // Apply pushback to the block
                            const pushbackDirection = new Phaser.Math.Vector2(
                                this.player.playerDirection,
                                0
                            );
                            pushbackDirection.rotate(this.platform.rotation); // Rotate the pushback direction with the platform
                            pushbackDirection.scale(this.player.attackPushback);
                            otherBody.applyForce(pushbackDirection);
                        }
                        // You can implement a health system and apply damage here
                    }
                }
            });
        });
    }

    setOffPlatform() {
        if (this.isOnPlatform) {
            this.player.setFriction(this.airFriction);
            this.isOnPlatform = false;
        }
    }

    update() {
        this.player.update(this.cursors);

        // Attack input
        if (this.attackKey.isDown) {
            this.player.attack();
        }

        // Remove blocks that have fallen off-screen
        this.blocks.forEach((block, index) => {
            if (block.y > this.scale.height + 200) {
                this.matter.world.remove(block); // Remove from Matter world
                this.blocks.splice(index, 1); // Remove from the blocks array
            }
        });
    }
}
