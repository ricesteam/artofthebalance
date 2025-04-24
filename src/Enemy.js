import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { BaseEnemy } from './BaseEnemy'; // Import the BaseEnemy class

export class Enemy extends BaseEnemy {
    // Extend BaseEnemy
    constructor(scene, x, y) {
        super(scene, x, y, 'maga', 0, {
            // Pass parameters to BaseEnemy constructor
            label: 'enemy',
            shape: {
                type: 'rectangle',
                width: 16,
                height: 32,
            },
        });

        this.name = 'maga';
        this.enemyMass = 2;
        this.acceleration = 0.05;
        this.maxSpeed = 1;
        this.enemyDirection = -1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points
        this.isIdle = false; // New state: is the enemy idling?
        this.idleTimer = null; // Timer for idling
        this.attackRange = 60; // Distance to start attacking
        this.canBeJuggled = true;

        this.setMass(this.enemyMass);
        this.setFriction(0.5);
        this.setFrictionStatic(0.5);
        this.setBounce(0.5);
        this.setScale(2);
        this.setRotation(0);

        this.flipX = true;

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0xae2334,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline.add(this.body.gameObject, outlineconfig);

        this.postFxPlugin = scene.plugins.get('rexGlowFilterPipeline');
        const glowFx = this.postFxPlugin.add(this.body.gameObject, {
            inintensity: 0,
        });

        this.glowTween = this.scene.tweens.add({
            targets: glowFx,
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
            duration: 1000, // Initial duration
            repeat: -1,
            yoyo: true,
        });

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
    }

    // State Methods (kept as they are specific to Enemy)
    enterIdle() {
        if (!this.active || this.isMarkedForDeath) return;
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
        if (!this.active || this.isMarkedForDeath) return;
        this.anims.play('enemyWalk');
    }

    seekState() {
        if (!this.player || this.isMarkedForDeath) return;

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
        if (!this.active || this.isMarkedForDeath) return;
        this.setVelocityX(0);
        // Play attack animation if available, or just stop movement
        this.anims.play('enemyAttack');

        this.scene.kissingSound.play();
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
}
