import Phaser from 'phaser';

export class Explosion extends Phaser.GameObjects.GameObject {
    constructor(scene, x, y, radius, lifespan = 500) {
        super(scene, 'Explosion');
        this.scene = scene;
        this.world = scene.matter.world;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.lifespan = lifespan;
        this.victims = [];

        // Create a graphic for the explosion (e.g., a circle)
        this.explosionGraphic = scene.add.graphics();
        this.explosionGraphic.fillStyle(0xff6600, 0.8); // Orange color
        this.explosionGraphic.fillCircle(0, 0, this.radius); // Circle at the center of the sprite
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
            onComplete: () => {
                this.explosionGraphic.destroy();
            },
        });

        this.applyForceToBodies();
    }

    applyForceToBodies() {
        const categoriesToCheck = [
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_ENEMY,
        ];
        const filteredBodies = this.world.getAllBodies().filter((body) => {
            return (
                categoriesToCheck.includes(body.collisionFilter.category) &&
                !body.isSensor
            );
        });

        filteredBodies.forEach((body) => {
            if (body.label === 'player') return; // Skip the player

            const distance = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                body.position.x,
                body.position.y
            );

            if (distance < this.radius) {
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

                // Apply damage to enemies
                if (
                    body.collisionFilter.category === this.scene.CATEGORY_ENEMY
                ) {
                    if (typeof body.gameObject.takeDamage === 'function') {
                        body.gameObject.takeDamage(1); // Adjust damage as needed
                    }
                }
            }
        });
    }
}
