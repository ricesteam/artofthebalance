import Phaser from 'phaser';

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

        // Create a graphic for the explosion (e.g., a circle)
        this.explosionGraphic = scene.add.graphics();
        this.explosionGraphic.fillStyle(0xff6600, 0.8); // Orange color
        this.explosionGraphic.fillCircle(0, 0, this.explosionRadius); // Circle at the center of the sprite
        this.explosionGraphic.x = x;
        this.explosionGraphic.y = y;
        this.explosionGraphic.alpha = 0;

        // Add a tween to scale the graphic
        scene.tweens.add({
            targets: this.explosionGraphic,
            scaleX: 2,
            scaleY: 2,
            alpha: 0.8,
            duration: this.lifespan,
            ease: 'Linear',
            delay: this.delay,
            onComplete: () => {
                this.explosionGraphic.destroy();
            },
        });

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
        const categoriesToCheck = [
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_ENEMY,
        ];
        const filteredBodies = this.world.getAllBodies().filter((body) => {
            return (
                categoriesToCheck.includes(body.collisionFilter.category) &&
                !body.isSensor &&
                this.victims.indexOf(body) === -1
            );
        });

        // Apply gravitational force to all bodies within the blackhole's radius
        filteredBodies.forEach((body) => {
            if (body === this.body || body.label === 'player') return; // Skip the blackhole itself

            const distance = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                body.position.x,
                body.position.y
            );

            if (distance < this.explosionRadius) {
                this.victims.push(body);

                // Calculate the angle from the explosion to the body
                const angle = Phaser.Math.Angle.Between(
                    this.x,
                    this.y,
                    body.position.x,
                    body.position.y
                );

                // Calculate the force based on a proportion of the body's mass
                const forceMagnitude = body.mass * 0.05;
                const forceX = Math.cos(angle) * forceMagnitude;
                const forceY = Math.sin(angle) * forceMagnitude;

                // Apply the force to the body
                body.gameObject.applyForce({ x: forceX, y: forceY });

                if (
                    body.collisionFilter.category ===
                        this.scene.CATEGORY_ENEMY &&
                    body.gameObject.ignorePlatformRotation !== undefined
                ) {
                    body.gameObject.ignorePlatformRotation = true;
                }
            }
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

        const id = this.scene.explosions.indexOf(this);
        this.scene.explosions.splice(id, 1);
        super.destroy();
    }
}
