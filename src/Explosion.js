import Phaser from 'phaser';

export class Explosion extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'explosion', 0, {
            isSensor: true,
            isStatic: true,
        });

        scene.add.existing(this);

        this.scene = scene;
        this.lifespan = 500; // Lifespan of the explosion in milliseconds

        // Create a graphic for the explosion (e.g., a circle)
        this.explosionGraphic = scene.add.graphics();
        this.explosionGraphic.fillStyle(0xff6600, 0.8); // Orange color
        this.explosionGraphic.fillCircle(0, 0, 32); // Circle at the center of the sprite
        this.explosionGraphic.x = x;
        this.explosionGraphic.y = y;

        // Add a tween to scale the graphic
        scene.tweens.add({
            targets: this.explosionGraphic,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: this.lifespan,
            ease: 'Linear',
            onComplete: () => {
                this.explosionGraphic.destroy();
                this.destroy();
            }
        });

        // Destroy the explosion after its lifespan
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        }, [], this);
    }

    destroy() {
        super.destroy();
    }
}
