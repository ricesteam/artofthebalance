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
