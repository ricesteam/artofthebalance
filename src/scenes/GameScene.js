export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.platform = null;
        this.leftWeight = 0;
        this.rightWeight = 0;
        this.blocks = []; // Keep track of the blocks
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
        this.platform = this.physics.add.image(400, 400, 'platform');
        this.platform.setOrigin(0.5, 0.5);
        this.platform.body.setSize(400, 20); // Increased size to match scale
        this.platform.setImmovable(false); // Make it dynamic
        this.platform.setGravityY(0); // Disable gravity
        this.platform.setAngularDamping(0.5); // Add some angular damping

        // Example: Add some blocks on either side (for testing)
        this.addBlock(250, 250, 'left');
        this.addBlock(550, 250, 'right');
    }

    addBlock(x, y, side) {
        let block = this.physics.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setCollideWorldBounds(true);
        this.physics.add.collider(block, this.platform);

        block.weight = 1; // Assign a weight to the block

        this.blocks.push(block); // Add the block to the array
    }

    updatePlatformRotation() {
        this.leftWeight = 0;
        this.rightWeight = 0;

        this.blocks.forEach(block => {
            if (block.x < this.platform.x) {
                this.leftWeight += block.weight;
            } else {
                this.rightWeight += block.weight;
            }
        });

        let weightDifference = this.leftWeight - this.rightWeight;
        let angle = Phaser.Math.Clamp(weightDifference * 0.005, -0.1, 0.1); // Adjust the multiplier to control sensitivity

        this.platform.body.angularVelocity = angle;
    }

    update() {
        this.updatePlatformRotation();
    }
}
