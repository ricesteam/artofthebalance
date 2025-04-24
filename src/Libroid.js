import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { BaseEnemy } from './BaseEnemy'; // Import the BaseEnemy class

export class Libroid extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'libroid', 0, {
            label: 'enemy',
            shape: {
                type: 'rectangle',
                width: 16,
                height: 32,
            },
        });

        this.name = 'libroid';
        this.enemyMass = 1.5;
        this.acceleration = 0.08;
        this.maxSpeed = 1.5;
        this.enemyDirection = 1; // Start moving right
        this.startPosition = x; // Initial x position
        this.hp = 2; // Initial health points
        this.attackRange = 400; // Distance to start attacking
        this.canBeJuggled = true; // Libroids can be juggled

        this.setMass(this.enemyMass);
        this.setFriction(0.8);
        this.setFrictionStatic(0.8);
        this.setBounce(0.3);
        this.setScale(2);
        this.setRotation(0);

        this.flipX = false;

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0xafbb9e,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline.add(this.body.gameObject, outlineconfig);

        this.postFxPlugin = scene.plugins.get('rexGlowFilterPipeline');
        const glowFx = this.postFxPlugin.add(this.body.gameObject, {
            inintensity: 0,
        });

        this.postFX.addShine(2, 0.2, 5);

        this.glowTween = this.scene.tweens.add({
            targets: glowFx,
            intensity: {
                getEnd: function (target, key, value) {
                    const maxIntensity = 0.07;
                    const intensityPerBounce = 0.01; // Adjust this value
                    const targetIntensity = Math.min(
                        maxIntensity,
                        this.bounceCount * intensityPerBounce
                    );
                    return targetIntensity;
                }.bind(this),
                getStart: function (target, key, value) {
                    return 0;
                },
            },
            duration: 800, // Shorter duration for faster pulsing
            repeat: -1,
            yoyo: true,
        });

        // I need a new state for when the Libroid just spawned, like init state, where he doesn't do anything until he lands on the platform, which he then goes into Idle state ai!
        // State Machine
        this.stateMachine = new StateMachine(
            'seek',
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
        );
    }

    // State Methods
    enterIdle() {
        if (!this.active || this.isMarkedForDeath) return;
        this.setVelocityX(0);
        this.anims.play('libroidIdle');
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(500, 1500), // Shorter idle time
            callback: () => this.stateMachine.transition('seek'),
            callbackScope: this,
            loop: false,
        });
    }

    idleState() {
        // Stay idle until the timer transitions to seek
    }

    enterSeek() {
        if (!this.active || this.isMarkedForDeath) return;
        this.anims.play('libroidWalk');
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

        // Simple seeking behavior towards the player
        if (this.player.x < this.x) {
            this.enemyDirection = -1;
            this.flipX = true;
        } else {
            this.enemyDirection = 1;
            this.flipX = false;
        }

        this.setVelocityX(this.enemyDirection * this.maxSpeed);

        // Randomly transition to idle
        if (Phaser.Math.Between(0, 300) === 0) {
            this.stateMachine.transition('idle');
        }
    }

    enterAttack() {
        if (!this.active || this.isMarkedForDeath) return;
        this.setVelocityX(0);
        this.anims.play('libroidAttack'); // Assuming an attack animation exists

        // Implement Libroid's attack logic here
        // For example, a short-range melee attack or a different projectile

        this.scene.time.addEvent({
            delay: 700, // Attack duration
            callback: () => this.stateMachine.transition('seek'),
            callbackScope: this,
            loop: false,
        });
    }

    attackState() {
        // Stay in attack state until the timer transitions back to seek
    }
}
