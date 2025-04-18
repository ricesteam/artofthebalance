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
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;

        scene.add.existing(this);
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
        this.player = null; // Reference to the player
        this.attackRange = 50; // Distance to start attacking
        this.backingOff = false; // Flag to indicate if the enemy is backing off
        this.backingOffDistance = 75; // Distance to back off to
        this.jumpForce = -0.02; // The force of the jump
        this.isOnPlatform = false;

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

        // Find the player
        this.findPlayer();

        this.setOnCollideWith(
            this.scene.platform,
            this.handlePlatformCollision
        );
    }

    handlePlatformCollision(data) {
        if (data.bodyB === this.body) {
            this.isOnPlatform = true;
        }
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

        if (this.isIdle) {
            return; // Do nothing if idling
        }

        // Check distance to player
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.player.x,
            this.player.y
        );

        if (distanceToPlayer <= this.attackRange) {
            // Attack the player
            this.attack();
        } else {
            // Seek the player
            this.seek();
        }

        // Randomly start idling
        if (Phaser.Math.Between(0, 200) === 0) {
            this.startIdling();
        }

        this.isOnPlatform = false; // Reset the flag every frame, collision will set it to true
    }

    seek() {
        if (!this.player) return;

        if (this.player.x < this.x) {
            this.enemyDirection = -1;
            this.flipX = true;
        } else {
            this.enemyDirection = 1;
            this.flipX = false;
        }

        this.setVelocityX(this.enemyDirection * this.maxSpeed);
    }

    attack() {
        // Stop moving horizontally
        this.setVelocityX(0);

        // Make the enemy jump over the player
        if (this.isOnPlatform) {
            this.applyForce({ x: 0, y: this.jumpForce });
        }

        console.log('Attacking player!');
        // You might want to add a timer to control the attack rate
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
        const id = this.scene.enemies.indexOf(this);
        this.scene.enemies.splice(id, 1);
        super.destroy();
    }

    startIdling() {
        this.isIdle = true;
        this.setVelocityX(0);
        this.anims.play('lawyerIdle');

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
        this.anims.play('lawyerWalk');
    }
}
