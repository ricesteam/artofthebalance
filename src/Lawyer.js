import Phaser from 'phaser';
import { StateMachine } from './StateMachine';
import { Explosion } from './Explosion';
import { Document } from './Document'; // Import the Document class

export class Lawyer extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'lawyer', 0, {
            label: 'enemy',
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
        this.bounceCount = 0;

        scene.add.existing(this);
        this.scene = scene;
        this.enemyMass = 1;
        this.acceleration = 0.05;
        this.maxSpeed = 2;
        this.enemyDirection = 1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points
        this.ignorePlatformRotation = false;
        this.player = null; // Reference to the player
        this.attackRange = 150; // Distance to start attacking
        this.backingOff = false; // Flag to indicate if the enemy is backing off
        this.backingOffDistance = 75; // Distance to back off to
        this.isInAir = true;
        this.groundThreshold = 0.01; // Threshold for considering the enemy on the ground
        this.isAttacking = false;
        this.projectileSpeed = 5; // Speed of the projectile
        this.projectileOffset = { x: 0, y: -10 }; // Offset for projectile spawn

        this.setMass(this.enemyMass);
        this.setFriction(1);
        this.setFrictionStatic(1);
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
        this.setDepth(6);
        this.name = 'lawyer';

        this.flipX = false;

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0x2e222f,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline = scene.plugins
            .get('rexOutlinePipeline')
            .add(this.body.gameObject, outlineconfig);

        // Find the player
        this.findPlayer();

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

    findPlayer() {
        this.player = this.scene.player;
    }

    update() {
        if (!this.active) {
            console.log('active is false');
            return;
        }

        //if (!this.ignorePlatformRotation)
        this.rotation = this.scene.platform.rotation;

        if (Math.abs(this.body.velocity.y) < this.groundThreshold) {
            this.isInAir = false;
            this.setVelocityY(0);
        } else {
            this.isInAir = true;
        }

        if (!this.isMarkedForDeath) this.stateMachine.step();
    }

    // State Methods
    enterIdle() {
        if (!this.active) return;
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
        if (!this.active) return;
        this.anims.play('lawyerWalk');
    }

    seekState() {
        if (!this.player) this.findPlayer();

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

        if (Math.random() < 0.4) {
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
        if (!this.active) return;
        // This state might be used for a different type of jump if needed
    }

    jumpState() {
        // Logic for a different jump state
    }

    playSounds() {}

    throwProjectile() {
        if (!this.player) return;

        this.scene.throwSound.play();

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
        this.stateMachine.transition('idle');
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
        this.scene.boomSound2.play();

        this.scene.time.delayedCall(500, () => {
            if (!this.active || !this.body) return;

            this.flipY = true; // Flip vertically to appear as if falling
            this.setVelocityY(Phaser.Math.Between(2, 5)); // Give it a slight downward velocity
            this.setAngularVelocity(Phaser.Math.FloatBetween(-0.1, 0.1)); // Add some rotation
        });
    }

    destroy() {
        if (!this.active) return;
        const id = this.scene.enemies.indexOf(this);
        this.scene.enemies.splice(id, 1);
        const juggledIndex = this.scene.juggledObjects.indexOf(this);
        if (juggledIndex > -1) {
            this.scene.juggledObjects.splice(juggledIndex, 1);
        }

        // this.glowTween.stop();
        // this.glowTween.destroy();
        // this.scene.tweens.killTweensOf(this.glowTween);
        // this.glowTween = null;

        // this.postFxPlugin.remove(this.body.gameObject);
        // this.postFxPlugin.stop();
        // this.postFxPlugin.destroy();

        super.destroy();
    }

    triggerJuggledExplosion() {
        this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            if (!this.active) return;
            new Explosion(
                this.scene,
                this.x,
                this.y,
                100 // Explosion radius
            );

            this.die(); // Destroy the enemy after the explosion
        });
    }
}
