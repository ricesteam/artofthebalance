import Phaser from 'phaser';
import { Explosion } from './Explosion'; // Import the new Explosion class

export class Bomb extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, delay = 250, explosionRadius = 64) {
        super(scene.matter.world, x, y, 'explosion', 0, {
            //isSensor: true,
            //isStatic: true,
            collisionFilter: {
                mask: scene.CATEGORY_PLATFORM,
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        scene.add.existing(this);

        this.explosionRadius = explosionRadius ?? 64; // Radius of the explosion
        this.delay = delay ?? 250;
        this.constraints = [];
        this.victims = [];

        // Call explode after the delay
        scene.time.delayedCall(this.delay, this.explode, [], this);
    }

    explode() {
        if (!this.scene) return;

        // Create a new Explosion instance
        const explosion = new Explosion(
            this.scene,
            this.x,
            this.y,
            this.explosionRadius
        );

        // Create a graphic for the explosion (e.g., a circle)
        this.explosionGraphic = this.scene.add.graphics();
        this.explosionGraphic.fillStyle(0xff6600, 0.8); // Orange color
        this.explosionGraphic.fillCircle(0, 0, this.explosionRadius); // Circle at the center of the sprite
        this.explosionGraphic.x = this.x;
        this.explosionGraphic.y = this.y;
        this.explosionGraphic.alpha = 0;

        // do not use scale, target the radius instead ai!
        this.scene.tweens.add({
            targets: this.explosionGraphic,
            scaleX: 2,
            scaleY: 2,
            alpha: 0.8,
            duration: 400,
            ease: 'Linear',
            onComplete: () => {
                this.explosionGraphic.destroy();
                this.destroy();
            },
        });
    }

    update() {
        // No longer needed
    }

    destroy() {
        if (!this.scene) return;

        this.victims.forEach((body) => {
            if (
                body.collisionFilter.category === this.scene.CATEGORY_ENEMY &&
                body.gameObject.ignorePlatformRotation !== undefined
            ) {
                body.gameObject.ignorePlatformRotation = false;
            }
        });

        this.constraints.forEach((constraint) => {
            this.matter.world.removeConstraint(constraint);
        });

        super.destroy();
    }
}
