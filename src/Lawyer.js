import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Lawyer extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'lawyer', 0, {
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
        this.speed = 5;
        this.maxSpeed = 5;
        this.hp = 2;
    }

    update() {
        super.update();
    }
}
