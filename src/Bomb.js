import Phaser from 'phaser';
import { Explosion } from './Explosion'; // Import the new Explosion class

export class Bomb extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
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

        this.lifespan = 500; // Lifespan of the explosion in milliseconds
        this.explosionRadius = 64; // Radius of the explosion
        this.delay = 250;
        this.constraints = [];
        this.victims = [];

        // Destroy the explosion after its lifespan
        scene.time.delayedCall(
            this.lifespan + this.delay,
            () => {
                this.destroy();
            },
            [],
            this
        );

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
            this.explosionRadius,
            this.lifespan // Pass lifespan to Explosion
        );
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
