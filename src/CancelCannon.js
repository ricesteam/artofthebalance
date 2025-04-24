import Phaser from 'phaser';

export class CancelCannon extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, target) {
        super(scene.matter.world, x, y, 'cancelCannon'); // Assuming 'cancelCannon' is the sprite key
        this.scene = scene;
        this.target = target;

        // Add the projectile to the scene
        this.scene.add.existing(this);
        this.scene.matter.add.existing(this);

        // Configure physics
        this.setCircle(8); // Assuming a circular shape for the projectile
        this.setMass(0.1);
        this.setFrictionAir(0); // No air friction
        this.setBounce(0); // No bounce
        this.setIgnoreGravity(true); // Projectile is not affected by gravity

        // Set initial velocity towards the target
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const speed = 5; // Adjust speed as needed
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        // Add collision handling (example: destroy on collision with player)
        this.setOnCollideWith(this.target.body, () => {
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

        // Optional: Make the projectile home in on the target
        if (this.target && this.target.active) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
            const currentVelocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
            const targetVelocity = new Phaser.Math.Vector2(Math.cos(angle) * 5, Math.sin(angle) * 5); // Maintain speed
            const newVelocity = currentVelocity.lerp(targetVelocity, 0.05); // Adjust homing strength (0.05)
            this.setVelocity(newVelocity.x, newVelocity.y);
        }
    }
}
