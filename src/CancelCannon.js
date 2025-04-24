import Phaser from 'phaser';

export class CancelCannon extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, target) {
        super(scene.matter.world, x, y, 'cancelCannon'); // Assuming 'cancelCannon' is the sprite key
        this.scene = scene;
        this.target = target;

        // Add the projectile to the scene
        this.scene.add.existing(this);

        // Configure physics
        this.setCircle(8); // Assuming a circular shape for the projectile
        this.setMass(10);
        this.setFrictionAir(0); // No air friction
        this.setBounce(0); // No bounce
        this.setIgnoreGravity(false); // Projectile IS affected by gravity for artillery
        this.setDepth(50); // Adjust depth as needed

        const distance = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.target.x,
            this.target.y
        );

        // Calculate initial force for an arc
        // This is a simplified calculation and might need tuning based on desired arc height and distance
        const initialVelocityX = (this.target.x - this.x) * 0.01; // Adjust multiplier for horizontal force
        const initialVelocityY = -distance * 0.05; // Adjust multiplier for arc height (negative for upwards)

        // can we apply force from the back-corner position? ai!
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
