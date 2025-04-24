import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { Explosion } from './Explosion';

export class BaseEnemy extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, texture, frame, options) {
        super(scene.matter.world, x, y, texture, frame, options);

        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        this.active = true;
        this.isMarkedForDeath = false;
        this.bounceCount = 0;
        this.ignorePlatformRotation = false;
        this.player = null; // Reference to the player
        this.isInAir = true;

        scene.add.existing(this);

        this.setFixedRotation();
        this.setCollisionCategory(this.scene.CATEGORY_ENEMY); // Set enemy collision category
        this.setCollisionGroup(-1); // Ensure enemies don't collide with each other
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
            this.scene.CATEGORY_PLATFORM,
        ]); // Collide with blocks, player, and attack
        this.setDepth(6);

        // Find the player
        this.findPlayer();

        // State Machine (will be initialized in derived classes)
        this.stateMachine = null;

        this.scene.matter.world.on(
            'collisionstart',
            this.handleCollision,
            this
        );

        this.setOnCollideWith(this.scene.platform, () => {
            this.isInAir = false;
        });

        this.outlinePipeline = scene.plugins.get('rexOutlinePipeline');
    }

    findPlayer() {
        this.player = this.scene.player;
    }

    update() {
        if (!this.active) {
            return;
        }

        if (!this.ignorePlatformRotation) {
            this.rotation = this.scene.platform.rotation;
        }

        if (!this.isMarkedForDeath && this.stateMachine) {
            this.stateMachine.step();
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.active) return;
        this.isMarkedForDeath = true;
        if (this.stateMachine) {
            this.stateMachine.transition('idle'); // Transition to idle or a dying state
        }

        this.scene.add
            .particles(this.x, this.y, 'blood', {
                speed: { min: -200, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                gravityY: 300,
                quantity: 20,
                tint: [0xff0000, 0x8b0000],
                stopAfter: 100,
            })
            .setDepth(10);

        this.setSensor(true); // Turn into a sensor

        this.scene.squishSound.play();
        this.scene.boomSound.play();

        this.scene.time.delayedCall(500, () => {
            if (!this.active || !this.body) return;

            this.flipY = true; // Flip vertically to appear as if falling
            this.setVelocityY(Phaser.Math.Between(2, 5)); // Give it a slight downward velocity
            this.setAngularVelocity(Phaser.Math.FloatBetween(-0.1, 0.1)); // Add some rotation
        });
    }

    destroy() {
        if (!this.active) return;

        // Remove from scene's enemy list
        const id = this.scene.enemies.indexOf(this);
        if (id > -1) {
            this.scene.enemies.splice(id, 1);
        }

        // Remove from juggled objects list
        const juggledIndex = this.scene.juggledObjects.indexOf(this);
        if (juggledIndex > -1) {
            this.scene.juggledObjects.splice(juggledIndex, 1);
        }

        // Clean up tweens and post FX (if they exist)
        if (this.glowTween) {
            this.glowTween.stop();
            this.glowTween.destroy();
            this.scene.tweens.killTweensOf(this.glowTween);
            this.glowTween = null;
        }

        if (this.outlinePipeline) {
            this.outlinePipeline.remove(this.body.gameObject);
            // The pipeline itself might be shared, don't destroy it here
        }

        if (this.postFxPlugin && this.body && this.body.gameObject) {
            const glowFx = this.postFxPlugin.get(this.body.gameObject);
            if (glowFx) {
                this.postFxPlugin.remove(this.body.gameObject);
            }
            // The plugin itself is shared, don't stop or destroy it here
        }

        // Remove collision listener
        this.scene.matter.world.off(
            'collisionstart',
            this.handleCollision,
            this
        );

        super.destroy();
    }

    handleCollision(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            // Check if it is itself and the other is the platform. If so and bounceCount > 0, then remove it from juggledObjects list
            if (
                (bodyA === this.body &&
                    bodyB.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM) ||
                (bodyB === this.body &&
                    bodyA.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM)
            ) {
                if (this.bounceCount > 0) {
                    const index = this.scene.juggledObjects.indexOf(this);
                    if (index > -1) {
                        this.scene.juggledObjects.splice(index, 1);
                    }
                }
            }
        });
    }

    bounce() {
        if (!this.active) return;
        this.bounceCount++;

        if (this.bounceCount >= this.scene.juggleThreshold) {
            if (this.glowTween) {
                this.glowTween.play();
            }

            if (this.canBeJuggled) {
                this.triggerJuggledExplosion();
                this.canBeJuggled = false;
            }
        }
    }

    triggerJuggledExplosion() {
        if (!this.active) return;
        this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            if (!this.active) return;
            // Specific explosion sound can be added in derived classes
            new Explosion(
                this.scene,
                this.x,
                this.y,
                100 // Explosion radius
            );
            this.scene.boomSound2.play(); // Play enemy-specific sound
            this.die(); // Destroy the enemy after the explosion
        });
    }
}
