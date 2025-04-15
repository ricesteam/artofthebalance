export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.enemyMass = 0.1;
        this.acceleration = 0.05;
        this.maxSpeed = 2;
        this.enemyDirection = -1; // Start moving left

        this.enemy = this.scene.matter.add.sprite(x, y, 'player', 0); // Reusing player sprite for now
        this.enemy.setRectangle(16, 32);
        this.enemy.setMass(this.enemyMass);
        this.enemy.setFriction(0);
        this.enemy.setFrictionStatic(0);
        this.enemy.setBounce(0.5);
        this.enemy.setFixedRotation();
        this.enemy.setCollisionCategory(this.scene.CATEGORY_BLOCK); // Enemies are blocks for now
        this.enemy.setScale(2);

        // Create animations (reusing player animations for now)
        this.scene.anims.create({
            key: 'enemyWalk',
            frames: this.scene.anims.generateFrameNumbers('player', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'enemyStand',
            frames: [{ key: 'player', frame: 8 }],
            frameRate: 20,
        });

        this.enemy.anims.play('enemyWalk');
    }

    update() {
        // Basic back and forth movement
        if (this.enemy.x < 100) {
            this.enemyDirection = 1;
            this.enemy.flipX = true; //Corrected flip
        } else if (this.enemy.x > this.scene.scale.width - 100) {
            this.enemyDirection = -1;
            this.enemy.flipX = false; //Corrected flip
        }

        this.enemy.setVelocityX(this.enemyDirection * this.maxSpeed);
    }
}
