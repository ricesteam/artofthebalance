import Phaser from 'phaser';
import { Explosion } from './Explosion';

export class Blackhole extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, radius, maxCapacity) {
        super(scene.matter.world, x, y, 'head', 0, {
            label: 'blackhole',
            isStatic: true,
            ignoreGravity: true,
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        scene.add.existing(this);

        this.blackholeRadius = radius ?? 50; // Adjust the radius of the blackhole's pull
        this.timeAlive = 2000; // Time in milliseconds before the blackhole is destroyed
        this.maxCapacity = maxCapacity ?? 3;
        this.victims = [];
        this.constraints = [];

        this.setCircle(this.blackholeRadius); // Set the collision shape to a circle
        this.setSensor(true); // Make it a sensor so it doesn't collide physically
        this.setIgnoreGravity(true);
        this.setStatic(true);
        // how do I scale down the sprite's texture to match the blackholeRadius?
        // The 'head' sprite is 1024x1024. The radius of the circle shape is this.blackholeRadius.
        // The visual radius of the sprite is half its width/height.
        // So, we want the visual radius (1024 / 2 = 512) scaled down to this.blackholeRadius.
        // Scale factor = desired_radius / original_visual_radius = this.blackholeRadius / 512
        this.setScale(this.blackholeRadius / 512);
        this.setDepth(1);

        // Set a timer to destroy the blackhole after timeAlive
        this.scene.time.delayedCall(
            this.timeAlive,
            this.destroyBlackhole,
            [],
            this
        );
        this.postFxPlugin = this.scene.plugins.get('rexSwirlPipeline');
        const cameraFilter = this.postFxPlugin.add(this.body.gameObject);

        // make this continuous
        cameraFilter.angle = 0;
        cameraFilter.radius = 0;
        cameraFilter.setCenter(x, y);

        this.swirlTween = this.scene.tweens.add({
            targets: cameraFilter,
            angle: 360, // Rotate 360 degrees
            radius: this.blackholeRadius * 2,
            duration: this.timeAlive, // Duration of the swirl effect
            repeat: 999, // Repeat infinitely
            ease: 'Linear', // Linear easing for constant rotation
        });
    }

    destroyBlackhole() {
        if (!this.scene) return;

        this.victims.forEach((body) => {
            if (body === null || body.gameObject === null) return;

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

        new Explosion(this.scene, this.x, this.y, this.blackholeRadius);

        const id = this.scene.blackholes.indexOf(this);
        this.scene.blackholes.splice(id, 1);

        this.swirlTween.stop();
        this.swirlTween.destroy();
        this.scene.tweens.killTweensOf(this.swirlTween);
        this.swirlTween = null;

        this.postFxPlugin.remove(this.body.gameObject);
        this.postFxPlugin.stop();
        this.postFxPlugin.destroy();

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
