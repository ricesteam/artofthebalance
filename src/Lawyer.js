import Phaser from 'phaser';

export class Lawyer extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'lawyer', 0, {
            label: 'lawyer',
            shape: {
                type: 'rectangle',
                width: 16,
                height: 32,
            },
            collisionFilter: {
                category: scene.CATEGORY_ENEMY,
            },
            density: 0.001,
            friction: 0.01,
            restitution: 0.8,
            frictionAir: 0.005,
            frictionStatic: 0.0,
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;

        scene.add.existing(this);
        this.setCollisionGroup(-1);
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
        ]); // Collide with blocks, player, and attack
        this.setScale(2);
        this.setRotation(0);
        this.speed = 5;
        this.isIdle = false; // New state: is the enemy idling?
        this.idleTimer = null; // Timer for idling
        this.ignorePlatformRotation = false;
    }

    update() {
        if (!this.active) return;

        if (!this.ignorePlatformRotation)
            this.rotation = this.scene.platform.rotation;

        if (this.isIdle) {
            return; // Do nothing if idling
        }

        // Basic back and forth movement
        if (this.x < this.startPosition - this.range) {
            this.enemyDirection = 1;
            this.flipX = false;
        } else if (this.x > this.startPosition + this.range) {
            this.enemyDirection = -1;
            this.flipX = true;
        }

        this.setVelocityX(this.enemyDirection * this.maxSpeed);

        // Randomly start idling
        if (Phaser.Math.Between(0, 200) === 0) {
            this.startIdling();
        }
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

    startIdling() {
        this.isIdle = true;
        this.setVelocityX(0);
        this.anims.play('enemyIdle');

        // Set a timer for how long to idle
        this.idleTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000), // Idle for 1-3 seconds
            callback: this.stopIdling,
            callbackScope: this,
            loop: false,
        });
    }

    stopIdling() {
        if (!this.active) return;
        this.isIdle = false;
        this.anims.play('enemyWalk');
    }
}
