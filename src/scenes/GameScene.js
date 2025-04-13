export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.platform = null;
        this.leftWeight = 0;
        this.rightWeight = 0;
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
        this.platform = this.physics.add.staticImage(400, 400, 'platform');
        //this.platform.setScale(2, 1); // Increased scale
        this.platform.setOrigin(0.5, 0.5);
        this.platform.body.setSize(400, 20); // Increased size to match scale

        // Example: Add some blocks on either side (for testing)
        this.addBlock(250, 250, 'left');
        this.addBlock(550, 250, 'right');

        // Enable collision between blocks and platform
        //this.physics.add.collider(this.blocks, this.platform);
    }

    addBlock(x, y, side) {
        let block = this.physics.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setCollideWorldBounds(true);
        this.physics.add.collider(block, this.platform);

        if (side === 'left') {
            this.leftWeight++;
        } else if (side === 'right') {
            this.rightWeight++;
        }

        this.updatePlatformRotation();
    }

    updatePlatformRotation() {
        let weightDifference = this.leftWeight - this.rightWeight;
        let angle = Phaser.Math.Clamp(weightDifference * 2, -30, 30); // Adjust the multiplier to control sensitivity

        this.platform.rotation = Phaser.Math.DegToRad(angle);
    }

    update() {
        // Main game loop logic here
    }
}
