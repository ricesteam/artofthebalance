import Phaser from 'phaser';

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
        scene.add.existing(this);
        this.active = true;

        this.scene = scene;
        this.enemyMass = 1;
        this.acceleration = 0.05;
        this.maxSpeed = 1.5;
        this.enemyDirection = -1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points
        this.isIdle = false; // New state: is the enemy idling?
        this.idleTimer = null; // Timer for idling
        this.ignorePlatformRotation = false;

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

    update() {
        if (!this.active) return;

        //if (!this.ignorePlatformRotation)
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
}
