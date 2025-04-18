import Phaser from 'phaser';

export class Lawyer extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'lawyer', 0, {
            label: 'lawyer',
            density: 0.001,
            friction: 0.01,
            restitution: 0.8,
            frictionAir: 0.005,
            frictionStatic: 0.0
        });

        scene.add.existing(this);

        this.scene = scene;
        this.speed = 5;
    }

    update() {
        // Basic movement example
        const cursors = this.scene.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            this.setVelocityX(-this.speed);
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.speed);
        } else {
            this.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.setVelocityY(-this.speed);
        } else if (cursors.down.isDown) {
            this.setVelocityY(this.speed);
        } else {
            this.setVelocityY(0);
        }
    }
}
