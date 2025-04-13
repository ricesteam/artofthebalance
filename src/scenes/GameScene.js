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
        this.platform = this.matter.add.image(width / 2, height / 2 - 50, 'platform', null, {
            inertia: 10000,
            shape: { type: 'rectangle', width: 400, height: 20 },
        });
        this.platform.setOrigin(0.5, 0.5);

        // Create an anchor point
        this.anchor = this.matter.add.circle(width / 2, height / 2 - 50, 5, { isStatic: true });

        // Create a constraint to connect the platform to the anchor
        this.constraint = this.matter.add.joint(
            this.platform,
            this.anchor,
            100,
            1,
            {
                pointA: { x: 0, y: 0 },
                pointB: { x: 0, y: 0 },
                damping: 0.5,
                angularStiffness: 1,
            }
        );

        // Create the static blocks to limit rotation
        this.stopblock = this.matter.add.rectangle(width / 2, height / 2 + 100, 300, 50, {
            isStatic: true,
        });

        // Create the player
        this.player = this.matter.add.image(200, 100, 'player');
        this.player.setCircle(16);
        this.player.setMass(1); // Reduced mass
        this.player.setFriction(0.001); // Reduced friction
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

    update() {
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-1);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(1);
        } else {
            //this.player.setVelocityX(0);
        }
    }
}
