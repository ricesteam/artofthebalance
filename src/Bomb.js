import Phaser from 'phaser';
import { Explosion } from './Explosion'; // Import the new Explosion class

export class Bomb extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, delay = 250, explosionRadius = 64) {
        super(scene.matter.world, x, y, 'meatbomb', 0, {
            //isSensor: true,
            //isStatic: true,
            shape: {
                type: 'circle',
                radius: 16,
                // maxSides: 25
            },
            friction: 0.1,
            frictionStatic: 0.5,
            frictionAir: 0.01,
            collisionFilter: {
                mask: scene.CATEGORY_PLATFORM,
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        scene.add.existing(this);

        this.setMass(2);
        this.setBounce(1);

        this.explosionRadius = explosionRadius ?? 64; // Radius of the explosion
        this.delay = delay ?? 250;
        this.constraints = [];
        this.victims = [];

        // Call explode after the delay
        scene.time.delayedCall(this.delay, this.explode, [], this);
    }

    explode() {
        if (!this.scene) return;

        this.visible = false;

        // Create a new Explosion instance
        const explosion = new Explosion(
            this.scene,
            this.x,
            this.y,
            this.explosionRadius
        );

        // Use the explosion sprite animation
        const explosionSprite = this.scene.add.sprite(
            this.x,
            this.y,
            'explosion'
        );
        explosionSprite.setScale(this.explosionRadius / 32); // Scale based on desired radius (explosion sprite is 48x48, radius 24)
        explosionSprite.play('explosion');

        explosionSprite.on('animationcomplete', () => {
            explosionSprite.destroy();
            this.destroy();
        });

        // Add particle effects
        this.scene.add.particles(this.x, this.y, 'meatbomb', {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            // add some alpha ai!
            lifespan: 500,
            gravityY: 0,
            quantity: 20,
            tint: [0xa0522d, 0xffa500, 0xffff00], // use brown, yellow, and orange tints instead
            stopAfter: 100, // Stop emitting after 20 particles
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
