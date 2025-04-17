import Phaser from 'phaser';

export class Explosion extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'explosion', 0, {
            isSensor: true,
            isStatic: true,
        });

        scene.add.existing(this);

        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        this.lifespan = 500; // Lifespan of the explosion in milliseconds
        this.explosionRadius = 64; // Radius of the explosion

        // Create a graphic for the explosion (e.g., a circle)
        this.explosionGraphic = scene.add.graphics();
        this.explosionGraphic.fillStyle(0xff6600, 0.8); // Orange color
        this.explosionGraphic.fillCircle(0, 0, this.explosionRadius); // Circle at the center of the sprite
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
            },
        });

        // Destroy the explosion after its lifespan
        scene.time.delayedCall(
            this.lifespan,
            () => {
                this.destroy();
            },
            [],
            this
        );
    }

    update() {
        const categoriesToCheck = [
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_ENEMY,
        ];
        const filteredBodies = this.world.getAllBodies().filter((body) => {
            return (
                categoriesToCheck.includes(body.collisionFilter.category) &&
                !body.isSensor
            );
        });

        // Apply gravitational force to all bodies within the blackhole's radius
        filteredBodies.forEach((body) => {
            if (body === this.body || body.label === 'player') return; // Skip the blackhole itself

            const distance = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                body.position.x,
                body.position.y
            );

            // if (distance < this.blackholeRadius) {
            //     if (
            //         this.victims.length < this.maxCapacity &&
            //         !this.victims.includes(body)
            //     ) {
            //         this.victims.push(body);
            //         body.gameObject.setSensor(true);
            //         body.gameObject.setIgnoreGravity(true);
            //         this.constraints.push(
            //             this.matter.add.constraint(
            //                 this,
            //                 body,
            //                 Phaser.Math.FloatBetween(1, 50),
            //                 0.01
            //             )
            //         );

            //         if (
            //             body.collisionFilter.category ===
            //                 this.scene.CATEGORY_ENEMY &&
            //             body.gameObject.ignorePlatformRotation !== undefined
            //         ) {
            //             body.gameObject.ignorePlatformRotation = true;
            //         }
            //     }
            // }
        });
    }

    destroy() {
        super.destroy();
    }
}
