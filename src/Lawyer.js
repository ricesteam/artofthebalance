import Phaser from 'phaser';
import { StateMachine } from './StateMachine';

export class Lawyer extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'lawyer', 0, {
            label: 'lawyer',
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

        this.stateMachine.step();
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

        // Transition back to seek after a short delay (adjust as needed)
        this.scene.time.addEvent({
            delay: 1000, // Attack duration
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

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        const id = this.scene.enemies.indexOf(this);
        this.scene.enemies.splice(id, 1);
        super.destroy();
    }
}
