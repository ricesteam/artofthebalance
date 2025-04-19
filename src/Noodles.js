import Phaser from 'phaser';

export class Noodles extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'noodles', 0, {
            label: 'noodles',
            shape: {
                type: 'rectangle',
                width: 32,
                height: 32,
            },
        });
        scene.add.existing(this);

        this.setBounce(0.5);
        this.setFriction(0.01);
        this.initialMass = 2;
        this.setMass(this.initialMass);
        this.setCollisionGroup(-1);
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
        ]);
        this.setCollisionCategory(scene.CATEGORY_BLOCK);

        this.setFrame(Phaser.Math.Between(0, 4));

        var outlineconfig = {
            thickness: 2,
            outlineColor: 0xf9c22b,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };
        this.outlinePipeline = scene.plugins
            .get('rexOutlinePipeline')
            .add(this.body.gameObject, outlineconfig);

        this.bounceCount = 0; // Track how many times it has been bounced

        this.glowPipeline = scene.plugins
            .get('rexGlowFilterPipeline')
            .add(this.body.gameObject, {
                inintensity: 0,
            });

        this.glowTween = this.scene.tweens.add({
            targets: this.glowPipeline,
            intensity: {
                getStart: () => this.glowPipeline.intensity,
                getEnd: () => 0.02 + this.bounceCount * 0.01, // Increase intensity with bounce count
            },
            ease: 'Linear',
            duration: 1000, // Initial duration
            repeat: -1,
            yoyo: true,
        });
    }

    takeDamage(damage) {}

    bounce() {
        this.bounceCount++;
        // Update the tween's end intensity
        this.glowTween.updateTo('intensity', 0.02 + this.bounceCount * 0.01, true);
        // Make the tween faster as bounce increases
        const newDuration = Math.max(100, 1000 - this.bounceCount * 100); // Decrease duration, minimum 100ms
        this.glowTween.updateTo('duration', newDuration, true);
    }
}
