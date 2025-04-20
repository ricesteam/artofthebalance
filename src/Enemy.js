import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { Explosion } from './Explosion'; // Import the Explosion class

export class Enemy extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'maga', 0, {
            label: 'maga',
            shape: {
                type: 'rectangle',
                width: 16,
                height: 32,
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        this.active = true;

        scene.add.existing(this);
        this.scene = scene;
        this.enemyMass = 1;
        this.acceleration = 0.05;
        this.maxSpeed = 1;
        this.enemyDirection = -1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points
        this.isIdle = false; // New state: is the enemy idling?
        this.idleTimer = null; // Timer for idling
        this.ignorePlatformRotation = false;
        this.player = null; // Reference to the player
        this.attackRange = 50; // Distance to start attacking
        this.canBeJuggled = true;

        this.setMass(this.enemyMass);
        this.setFriction(0.5);
        this.setFrictionStatic(0.5);
        this.setFixedRotation();
        this.setBounce(0.5);
        this.setCollisionCategory(this.scene.CATEGORY_ENEMY); // Set enemy collision category
        this.setCollisionGroup(-1); // Ensure enemies don't collide with each other
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
            this.scene.CATEGORY_PLATFORM,
        ]); // Collide with blocks, player, and attack
        this.setScale(2);
        this.setRotation(0);
        this.name = 'maga';

        this.flipX = true;

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0xae2334,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline = scene.plugins
            .get('rexOutlinePipeline')
            .add(this.body.gameObject, outlineconfig);

        this.bounceCount = 0; // Track how many times it has been bounced

        this.glowPipeline = scene.plugins
            .get('rexGlowFilterPipeline')
            .add(this.body.gameObject, {
                inintensity: 0,
            });

        this.glowTween = this.scene.tweens.add({
            targets: this.glowPipeline,
            intensity: {
                getEnd: function (target, key, value) {
                    const maxIntensity = 0.05;
                    const intensityPerBounce = 0.005; // Adjust this value to control how much intensity increases per bounce
                    const targetIntensity = Math.min(
                        maxIntensity,
                        this.bounceCount * intensityPerBounce
                    );
                    return targetIntensity;
                }.bind(this), // Bind 'this' to the getEnd function to access bounceCount

                getStart: function (target, key, value) {
                    return 0;
                },
            },
            duration: 400, // Initial duration
            repeat: -1,
            yoyo: true,
        });

        // Find the player
        this.findPlayer();

        // State Machine
        this.stateMachine = new StateMachine(
            'idle',
            {
                idle: {
                    enter: this.enterIdle.bind(this),
                    execute: this.idleState.bind(this),
                },
                seek: {
                    enter: this.enterSeek.bind(this),
                    execute: this.seekState.bind(this),
                },
                attack: {
                    enter: this.enterAttack.bind(this),
                    execute: this.attackState.bind(this),
                },
            },
            [this]
        ); // Pass the enemy instance as a state argument

        this.scene.matter.world.on(
            'collisionstart',
            this.handleCollision,
            this
        );
    }

    findPlayer() {
        this.player = this.scene.player;
    }

    update() {
        if (!this.active) return;

        if (!this.ignorePlatformRotation)
            this.rotation = this.scene.platform.rotation;

        if (!this.player) {
            this.findPlayer();
            return;
        }

        this.stateMachine.step();
    }

    // State Methods
    enterIdle() {
        if (!this.active) return;
        this.setVelocityX(0);
        this.anims.play('enemyIdle');
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000),
            callback: () => this.stateMachine.transition('seek'),
            callbackScope: this,
            loop: false,
        });
    }

    idleState() {
        // Stay idle until the timer transitions to seek
        if (Phaser.Math.Between(0, 200) === 0) {
            this.stateMachine.transition('seek');
        }
    }

    enterSeek() {
        if (!this.active) return;
        this.anims.play('enemyWalk');
    }

    seekState() {
        if (!this.player) return;

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.player.x,
            this.player.y
        );

        if (distanceToPlayer <= this.attackRange) {
            this.stateMachine.transition('attack');
            return;
        }

        if (this.player.x < this.x) {
            this.enemyDirection = -1;
            this.flipX = true;
        } else {
            this.enemyDirection = 1;
            this.flipX = false;
        }

        this.setVelocityX(this.enemyDirection * this.maxSpeed);

        if (Phaser.Math.Between(0, 200) === 0) {
            this.stateMachine.transition('idle');
        }
    }

    enterAttack() {
        if (!this.active) return;
        this.setVelocityX(0);
        // Play attack animation if available, or just stop movement
        // this.anims.play('enemyAttack');

        this.scene.player.takeDamage(1);

        // Transition back to seek after a short delay (adjust as needed)
        this.scene.time.addEvent({
            delay: 500, // Attack duration
            callback: () => this.stateMachine.transition('seek'),
            callbackScope: this,
            loop: false,
        });
    }

    attackState() {
        // Stay in attack state until the timer transitions back to seek
    }

    backOff() {
        this.backingOff = true;
        if (this.player.x < this.x) {
            this.enemyDirection = 1; // Move right to back off
            this.flipX = false;
        } else {
            this.enemyDirection = -1; // Move left to back off
            this.flipX = true;
        }
        this.setVelocityX(this.enemyDirection * this.maxSpeed);
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.active) return;

        // I don't have the
        this.scene.add.particles(this.x, this.y, 'blood', {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            gravityY: 300,
            quantity: 20,
            tint: [0xff0000, 0x8b0000], // Red and dark red tints
            stopAfter: 100, // Stop emitting after 20 particles
        });

        const id = this.scene.enemies.indexOf(this);
        this.scene.enemies.splice(id, 1);
        this.scene.juggledObjects.splice(id, 1);
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
        if (!this.active || !this.canBeJuggled) return;
        this.bounceCount++;
        if (this.bounceCount >= this.scene.juggleThreshold) {
            this.canBeJuggled = false;
            this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                if (!this.active) return;
                const explosion = new Explosion(
                    this.scene,
                    this.x,
                    this.y,
                    100 // Explosion radius
                );

                this.die(); // Destroy the enemy after the explosion
            });
        }
    }
}
