import Phaser from 'phaser';

export class Blackhole extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'blackhole', 0, {
            label: 'blackhole',
            isStatic: true,
            ignoreGravity: true,
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        scene.add.existing(this);

        this.blackholeRadius = 100; // Adjust the radius of the blackhole's pull
        this.gravitationalConstant = 0.0005; // Adjust the strength of gravity
        this.timeAlive = 2000; // Time in milliseconds before the blackhole is destroyed
        this.maxCapacity = 3;
        this.victims = [];
        this.constraints = [];

        this.setCircle(this.blackholeRadius); // Set the collision shape to a circle
        this.setSensor(true); // Make it a sensor so it doesn't collide physically
        this.setIgnoreGravity(true);
        this.setStatic(true);

        // Set a timer to destroy the blackhole after timeAlive
        this.scene.time.delayedCall(
            this.timeAlive,
            this.destroyBlackhole,
            [],
            this
        );
    }

    destroyBlackhole() {
        if (!this.scene) return;

        this.victims.forEach((body) => {
            if (!body && !body.gameObject) return;

            body.gameObject.setSensor(false);
            body.gameObject.setIgnoreGravity(false);
            if (
                body.collisionFilter.category === this.scene.CATEGORY_ENEMY &&
                body.gameObject.ignorePlatformRotation !== undefined
            ) {
                body.gameObject.ignorePlatformRotation = false;
            }
        });

        this.constraints.forEach((constraint) => {
            this.matter.world.removeConstraint(constraint);
        });

        const id = this.scene.blackholes.indexOf(this);
        this.scene.blackholes.splice(id, 1);
        super.destroy();
    }

    update() {
        if (!this.scene) return;

        this.victims.forEach((body) => {
            if (body && body.gameObject) {
                body.gameObject.applyForce({
                    x: Phaser.Math.FloatBetween(-0.01, 0.01),
                    y: Phaser.Math.FloatBetween(-0.01, 0.01),
                });
                body.gameObject.setAngularVelocity(
                    Phaser.Math.FloatBetween(0.1, 0.2)
                );
            }
        });

        if (this.victims.length >= this.maxCapacity) return;

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

            if (distance < this.blackholeRadius) {
                if (
                    this.victims.length < this.maxCapacity &&
                    !this.victims.includes(body)
                ) {
                    this.victims.push(body);
                    body.gameObject.setSensor(true);
                    body.gameObject.setIgnoreGravity(true);
                    this.constraints.push(
                        this.matter.add.constraint(
                            this,
                            body,
                            Phaser.Math.FloatBetween(1, 50),
                            0.01
                        )
                    );

                    if (
                        body.collisionFilter.category ===
                            this.scene.CATEGORY_ENEMY &&
                        body.gameObject.ignorePlatformRotation !== undefined
                    ) {
                        body.gameObject.ignorePlatformRotation = true;
                    }
                }
            }
        });
    }
}
