import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { Document } from './Document'; // Import the Document class
import { BaseEnemy } from './BaseEnemy'; // Import the BaseEnemy class

export class Lawyer extends BaseEnemy {
    // Extend BaseEnemy
    constructor(scene, x, y) {
        super(scene, x, y, 'lawyer', 0, {
            // Pass parameters to BaseEnemy constructor
            label: 'enemy',
            shape: {
                type: 'rectangle',
                width: 16,
                height: 32,
            },
        });

        this.name = 'lawyer';
        this.enemyMass = 1;
        this.acceleration = 0.05;
        this.maxSpeed = 2;
        this.enemyDirection = 1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points
        this.attackRange = 150; // Distance to start attacking
        this.backingOff = false; // Flag to indicate if the enemy is backing off
        this.backingOffDistance = 75; // Distance to back off to
        this.isAttacking = false;
        this.projectileSpeed = 5; // Speed of the projectile
        this.projectileOffset = { x: 0, y: -10 }; // Offset for projectile spawn
        this.canBeJuggled = false; // Lawyers cannot be juggled

        this.setMass(this.enemyMass);
        this.setFriction(1);
        this.setFrictionStatic(1);
        this.setBounce(0.5);
        this.setScale(2);
        this.setRotation(0);

        this.flipX = false;

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0x2e222f,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline.add(this.body.gameObject, outlineconfig);

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
                jump: {
                    enter: this.enterJump.bind(this),
                    execute: this.jumpState.bind(this),
                },
            },
            [this]
        ); // Pass the lawyer instance as a state argument
    }

    // State Methods (kept as they are specific to Lawyer)
    enterIdle() {
        if (!this.active || this.isMarkedForDeath) return;
        this.setVelocityX(0);
        this.anims.play('lawyerIdle');
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
        this.anims.play('lawyerWalk');
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
        this.isAttacking = true;
        this.setVelocityX(0);
        this.anims.play('lawyerJump');

        // Apply force from the bottom of the sprite
        const gameObject = this.body.gameObject;
        const position = this.body.position;
        this.applyForceFrom(
            {
                x: (position.x - (gameObject.width + 10)) * this.enemyDirection,
                y: position.y + gameObject.height,
            },
            { x: this.enemyDirection * 0.06, y: -0.1 }
        );
        this.scene.jumpSound.play();

        if (Math.random() < 0.6) {
            this.throwProjectile();
        }

        // Transition back to seek after a short delay (adjust as needed)
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(500, 2000), // Attack duration
            callback: () => {
                this.isAttacking = false;
                this.stateMachine.transition('seek');
            },
            callbackScope: this,
            loop: false,
        });
    }

    attackState() {
        // Stay in attack state until the timer transitions back to seek
    }

    enterJump() {
        if (!this.active || this.isMarkedForDeath) return;
        // This state might be used for a different type of jump if needed
    }

    jumpState() {
        // Logic for a different jump state
    }

    playSounds() {}

    throwProjectile() {
        if (!this.player || this.isMarkedForDeath) return;

        this.scene.throwSound.play();
        this.scene.servedSound.play();

        const projectileX = this.x + this.projectileOffset.x;
        const projectileY = this.y + this.projectileOffset.y;

        // Add some randomness to the target position to allow for misses
        const missFactor = Phaser.Math.Between(-50, 50); // Adjust the range for more or less accuracy
        const targetX = this.player.x + missFactor;
        const targetY = this.player.y + missFactor;

        const adjustedDirectionX = targetX - projectileX;
        const adjustedDirectionY = targetY - projectileY;
        const adjustedMagnitude = Math.sqrt(
            adjustedDirectionX * adjustedDirectionX +
                adjustedDirectionY * adjustedDirectionY
        );

        const velocityX =
            (adjustedDirectionX / adjustedMagnitude) * this.projectileSpeed;
        const velocityY =
            (adjustedDirectionY / adjustedMagnitude) * this.projectileSpeed;

        // Create and launch the projectile
        const projectile = new Document(this.scene, projectileX, projectileY);
        projectile.setVelocity(velocityX, velocityY);

        // Calculate the angle based on the direction towards the target and convert to radians
        const angle = Math.atan2(adjustedDirectionY, adjustedDirectionX);
        projectile.setRotation(angle);
    }
}
