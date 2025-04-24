import Phaser from 'phaser';

export class CancelCannon extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, target) {
        super(scene.matter.world, x, y, 'cancel'); // Assuming 'cancelCannon' is the sprite key
        this.scene = scene;
        this.target = target;

        // Add the projectile to the scene
        this.scene.add.existing(this);

        // Configure physics
        this.setRectangle(55, 12); // Assuming a circular shape for the projectile
        this.setMass(1);
        this.setFrictionAir(0); // No air friction
        this.setBounce(0); // No bounce
        this.setIgnoreGravity(false); // Projectile IS affected by gravity for artillery
        this.setDepth(50); // Adjust depth as needed
        this.setSensor(true);

        this.setCollidesWith([
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_PLATFORM,
        ]); // Collide with player, blocks, and platforms

        // how do I calculate the angle so it looks like the projectile is arcing? ai!
        // Calculate initial force for an arc
        // This is a simplified calculation and might need tuning based on desired arc height and distance
        const initialVelocityX = (this.target.x - this.x) * 0.01; // Adjust multiplier for horizontal force
        const initialVelocityY = -6; // Adjust multiplier for arc height (negative for upwards)

        this.setVelocity(initialVelocityX, initialVelocityY);

        // Add collision handling (example: destroy on collision with player)
        this.setOnCollideWith([this.target.body, scene.platform], () => {
            this.destroy();
        });

        // Destroy the projectile after a certain time
        this.scene.time.addEvent({
            delay: 3000, // Destroy after 3 seconds
            callback: () => this.destroy(),
            callbackScope: this,
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // No homing needed for artillery trajectory, gravity handles the fall
    }
}
