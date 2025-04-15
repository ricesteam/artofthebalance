export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.enemyMass = 0.5;
        this.acceleration = 0.05;
        this.maxSpeed = 2;
        this.enemyDirection = -1; // Start moving left
        this.range = 150; // Distance the enemy will walk in each direction
        this.startPosition = x; // Initial x position
        this.hp = 3; // Initial health points

        this.enemy = this.scene.matter.add.sprite(x, y, 'player', 0); // Reusing player sprite for now
        this.enemy.setRectangle(16, 32);
        this.enemy.setMass(this.enemyMass);
        this.enemy.setFriction(0.1);
        this.enemy.setFrictionStatic(0.1);
        this.enemy.setBounce(0.5);
        this.enemy.setFixedRotation();
        this.enemy.setCollisionCategory(this.scene.CATEGORY_ENEMY); // Set enemy collision category
        this.enemy.setCollisionGroup(-1); // Ensure enemies don't collide with each other
        this.enemy.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
        ]); // Collide with blocks, player, and attack
        this.enemy.setScale(2);

        // Create animations (reusing player animations for now)
        this.scene.anims.create({
            key: 'enemyWalk',
            frames: this.scene.anims.generateFrameNumbers('maga', {
                start: 1,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'enemyStand',
            frames: [{ key: 'maga', frame: 8 }],
            frameRate: 20,
        });

        this.enemy.anims.play('enemyWalk');
        this.enemy.flipX = true;
    }

    update() {
        // Basic back and forth movement
        if (this.enemy.x < this.startPosition - this.range) {
            this.enemyDirection = 1;
            this.enemy.flipX = false;
        } else if (this.enemy.x > this.startPosition + this.range) {
            this.enemyDirection = -1;
            this.enemy.flipX = true;
        }

        this.enemy.setVelocityX(this.enemyDirection * this.maxSpeed);

        // Rotate the enemy to be perpendicular to the platform
        this.enemy.rotation = this.scene.platform.rotation;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        // Handle enemy death (e.g., remove from scene, play death animation)
        this.enemy.destroy();
    }
}
