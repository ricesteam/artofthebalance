import Phaser from 'phaser';
import { Explosion } from './Explosion'; // Import the new Explosion class

export class Bomb extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, delay = 250, explosionRadius = 64) {
        super(scene.matter.world, x, y, 'meatbomb', 0, {
            //isSensor: true,
            //isStatic: true,
            shape: {
                type: 'circle',
                radius: 16,
                // maxSides: 25
            },
            friction: 0.5,
            frictionStatic: 0.5,
            frictionAir: 0.01,
            collisionFilter: {
                mask: scene.CATEGORY_PLATFORM,
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;
        scene.add.existing(this);

        this.setMass(4);
        this.setBounce(2);
        this.setDepth(5);

        this.explosionRadius = explosionRadius ?? 64; // Radius of the explosion
        this.delay = delay ?? 250;
        this.constraints = [];
        this.victims = [];

        // Call explode after the delay
        scene.time.delayedCall(this.delay, this.explode, [], this);

        var outlineconfig = {
            thickness: 3,
            outlineColor: 0xa24b6f,
            quality: 0.2,
            name: 'rexOutlinePostFx',
        };
        this.outlinePipeline = scene.plugins
            .get('rexOutlinePipeline')
            .add(this.body.gameObject, outlineconfig);

        this.postFxPlugin = scene.plugins.get('rexGlowFilterPipeline');
        const glowFx = this.postFxPlugin.add(this.body.gameObject, {
            inintensity: 0,
        });

        this.glowTween = this.scene.tweens.add({
            targets: glowFx,
            intensity: 0.02,
            duration: this.delay / 5,
            repeat: -1,
            yoyo: true,
        });
    }

    explode() {
        if (!this.scene) return;

        this.visible = false;

        // Create a new Explosion instance
        const explosion = new Explosion(
            this.scene,
            this.x,
            this.y,
            this.explosionRadius
        );

        this.scene.add
            .particles(this.x, this.y, 'meatbomb', {
                speed: { min: -200, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                alpha: { start: 1, end: 0 }, // add some alpha
                lifespan: 500,
                gravityY: 0,
                quantity: 20,
                tint: [0x6e2727, 0xfb6b1d, 0xfbff86], // use brown, yellow, and orange tints instead
                stopAfter: 100, // Stop emitting after 20 particles
            })
            .setDepth(6);

        this.scene.explosionSound.play();
        this.scene.squishSound2.play();

        // Use the explosion sprite animation
        const explosionSprite = this.scene.add.sprite(
            this.x,
            this.y,
            'explosion'
        );
        explosionSprite.setDepth(6);
        explosionSprite.setScale(this.explosionRadius / 32); // Scale based on desired radius (explosion sprite is 48x48, radius 24)
        explosionSprite.play('explosion');

        explosionSprite.on('animationcomplete', () => {
            explosionSprite.destroy();
            this.destroy();
        });
    }

    update() {
        // No longer needed
    }

    destroy() {
        if (!this.scene || !this.active) return;

        if (this.scene.cameras.main)
            this.scene.plugins
                .get('rexShockwavePipeline')
                .remove(this.scene.cameras.main);

        this.victims.forEach((body) => {
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

        this.glowTween.stop();
        this.glowTween.destroy();
        this.scene.tweens.killTweensOf(this.glowTween);
        this.glowTween = null;

        this.postFxPlugin.remove(this.body.gameObject);
        this.postFxPlugin.stop();
        this.postFxPlugin.destroy();

        super.destroy();
    }
}
