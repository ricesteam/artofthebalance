import Phaser from 'phaser';

export class Explosion extends Phaser.GameObjects.GameObject {
    constructor(scene, x, y, radius) {
        super(scene, 'Explosion');
        this.scene = scene;
        this.world = scene.matter.world;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.victims = [];

        this.applyForceToBodies();
        this.scene.cameras.main.shake(150, 0.01);

        this.postFxPlugin = scene.plugins.get('rexShockwavePipeline');
        const glowFx = this.postFxPlugin.add(this.scene.cameras.main, {
            center: {
                x: this.x,
                y: this.y,
            },
            waveRadius: 32,
            waveWidth: 0,
            powBaseScale: 0.8,
            // powExponent: 0.1,
        });

        // add a tween for the shockwaveplugin
        this.explodeTween = this.scene.tweens.add({
            targets: glowFx,
            waveRadius: this.radius, // Make the wave radius larger than the explosion
            waveWidth: 100, // Adjust wave width as needed
            duration: 200, // Duration of the shockwave effect
            //ease: 'Quart.easeOut',
            onComplete: () => {
                glowFx.waveRadius = 0;
                glowFx.waveWidth = 0;
                this.destroy();
            },
        });
    }

    destroy() {
        this.explodeTween.stop();
        this.explodeTween.destroy();
        this.scene.tweens.killTweensOf(this.explodeTween);
        this.explodeTween = null;

        this.postFxPlugin.remove(this.scene.cameras.main);
        this.postFxPlugin.stop();
        this.postFxPlugin.destroy();

        super.destroy();
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
                const forceMagnitude = body.mass * 0.06;
                const forceX = Math.cos(angle) * forceMagnitude;
                const forceY = Math.sin(angle) * forceMagnitude;

                // Apply the force to the body
                body.gameObject.setVelocityX(0);
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
