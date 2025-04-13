export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.platform = null;
        this.leftWeight = 0;
        this.rightWeight = 0;
        this.blocks = []; // Keep track of the blocks
        this.anchor = null;
        this.constraint = null;
        this.desiredAngle = 0;
        this.player = null; // Player game object
        this.cursors = null; // Keyboard input
        this.acceleration = 0.1; // Acceleration value
        this.maxSpeed = 5; // Maximum speed
        this.platformFriction = 0.001; // Friction when on the platform
        this.airFriction = 0.0001; // Friction when in the air
        this.isOnPlatform = false; // Flag to track if the player is on the platform
        this.minSlideSpeed = 1; // Minimum speed for sliding
    }

    preload() {
        // Load game assets here
        this.load.image('platform', 'assets/platform.png'); // Replace with your asset
        this.load.image('block', 'assets/block.png'); // Replace with your asset
        this.load.image('player', 'assets/player.png'); // Replace with your asset
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.text(100, 50, 'See-Saw Game', {
            font: '32px Arial',
            fill: '#fff',
        });

        // Create the see-saw platform
        this.platform = this.matter.add.image(
            width / 2,
            height / 2 - 50,
            'platform',
            null,
            {
                inertia: 10000,
                shape: { type: 'rectangle', width: 500, height: 20 },
                friction: 0,
            }
        );
        this.platform.setOrigin(0.5, 0.5);

        // Create an anchor point
        this.anchor = this.matter.add.circle(width / 2, height / 2 - 50, 5, {
            isStatic: true,
        });

        // Create a constraint to connect the platform to the anchor
        this.constraint = this.matter.add.constraint(
            this.platform,
            this.anchor,
            100,
            1,
            {
                pointA: { x: 0, y: 0 },
                pointB: { x: 0, y: 0 },
                damping: 1,
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
            }
        );

        // Create the player
        this.player = this.matter.add.image(200, 100, 'player');
        this.player.setCircle(16);
        this.player.setMass(1); // Reduced mass
        this.player.setFriction(this.airFriction); // Start with air friction
        this.player.setBounce(0.5);

        // Input keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Example: Add some blocks on either side (for testing)
        this.addBlock(250, 0, 'left');
        this.addBlock(500, 0, 'right');
    }

    addBlock(x, y, side) {
        let block = this.matter.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setFriction(0);
        block.setMass(1);
        this.blocks.push(block); // Add the block to the array
    }

    setOnPlatform() {
        if (!this.isOnPlatform) {
            this.player.setFriction(this.platformFriction);
            this.isOnPlatform = true;
        }
    }

    setOffPlatform() {
        if (this.isOnPlatform) {
            this.player.setFriction(this.airFriction);
            this.isOnPlatform = false;
        }
    }

    update() {
        // Check if the player is on the platform (basic check, improve as needed)
        if (this.player.y > 200) {
            this.setOnPlatform();
        } else {
            this.setOffPlatform();
        }

        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(
                Math.max(
                    this.player.body.velocity.x - this.acceleration,
                    -this.maxSpeed
                )
            );
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(
                Math.min(
                    this.player.body.velocity.x + this.acceleration,
                    this.maxSpeed
                )
            );
        } else {
            // Decelerate when no key is pressed
            if (Math.abs(this.player.body.velocity.x) > this.minSlideSpeed) {
                if (this.player.body.velocity.x > 0) {
                    this.player.setVelocityX(
                        Math.max(
                            this.player.body.velocity.x - this.acceleration,
                            0
                        )
                    );
                } else if (this.player.body.velocity.x < 0) {
                    this.player.setVelocityX(
                        Math.min(
                            this.player.body.velocity.x + this.acceleration,
                            0
                        )
                    );
                }
            }
        }
    }
}
