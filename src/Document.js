import Phaser from 'phaser';

export class Document extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'document', 0, {
            // Assuming you have a 'document' sprite key
            label: 'document',
            shape: {
                type: 'circle', // Or 'rectangle' depending on your sprite
                radius: 5, // Adjust size as needed
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        this.active = true;

        scene.add.existing(this);

        this.setMass(0.1); // Make it light
        this.setFrictionAir(0); // No air resistance
        this.setBounce(0); // No bounce
        this.setCollisionCategory(this.scene.CATEGORY_ENEMY_PROJECTILE); // Define a new collision category for enemy documents
        this.setCollidesWith([
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLATFORM,
        ]); // Collide with player, blocks, and platforms
        this.setScale(1); // Adjust scale as needed
        this.setDepth(5); // Adjust depth as needed
        this.name = 'document';

        // Add a timer to destroy the document after a certain time to prevent memory leaks
        this.scene.time.addEvent({
            delay: 3000, // Destroy after 3 seconds
            callback: this.destroy,
            callbackScope: this,
        });
    }

    // You can add an update method if needed for specific document behavior
    // update() {
    //     // For example, check if it's off-screen
    //     if (this.y > this.scene.scale.height + 50) {
    //         this.destroy();
    //     }
    // }

    destroy() {
        if (!this.active) return;
        super.destroy();
    }
}
