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
    }

    preload() {
        // Load game assets here
        this.load.image('platform', 'assets/platform.png'); // Replace with your asset
        this.load.image('block', 'assets/block.png'); // Replace with your asset
    }

    create() {
        this.add.text(100, 50, 'See-Saw Game', {
            font: '32px Arial',
            fill: '#fff',
        });

        // Create the see-saw platform
        this.platform = this.matter.add.image(400, 200, 'platform', null, {
            inertia: 10000,
            shape: { type: 'rectangle', width: 400, height: 20 },
        });
        this.platform.setOrigin(0.5, 0.5);

        // Create an anchor point
        this.anchor = this.matter.add.circle(400, 200, 5, { isStatic: true });

        // Create a constraint to connect the platform to the anchor
        this.constraint = this.matter.add.joint(
            this.platform,
            this.anchor,
            100,
            0.9,
            {
                pointA: { x: 0, y: 0 },
                pointB: { x: 0, y: 0 },
                damping: 0.5,
                angularStiffness: 0.1,
            }
        );

        // Example: Add some blocks on either side (for testing)
        this.addBlock(250, 0, 'left');
        this.addBlock(500, 0, 'right');
    }

    addBlock(x, y, side) {
        let block = this.matter.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setFriction(0);

        block.weight = 200; // Assign a weight to the block

        this.blocks.push(block); // Add the block to the array
    }

    updatePlatformRotation() {
        this.leftWeight = 0;
        this.rightWeight = 0;

        this.blocks.forEach((block) => {
            if (block.x < this.platform.x) {
                this.leftWeight += block.weight;
            } else {
                this.rightWeight += block.weight;
            }
        });

        let weightDifference = this.leftWeight - this.rightWeight;
        this.desiredAngle = weightDifference * 0.001; // Adjust the multiplier to control sensitivity
    }

    update() {
        this.updatePlatformRotation();

        // Calculate the angle difference
        let angleDifference = this.desiredAngle - this.platform.rotation;

        // Apply a spring-like force to adjust the angular velocity
        this.platform.body.angularVelocity = angleDifference * 0.1;

        // Damping to slow down the rotation
        this.platform.body.angularVelocity *= 0.95;
    }
}
