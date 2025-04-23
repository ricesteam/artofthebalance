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

        this.setBounce(1);
        this.setFriction(0.01);
        this.setMass(0.5);
        //this.setCollisionGroup(-1);
        this.setCollidesWith([
            // this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
            this.scene.CATEGORY_PLATFORM,
        ]);
        this.setCollisionCategory(scene.CATEGORY_BLOCK);
        this.setDepth(2);

        this.setFrame(Phaser.Math.Between(0, 4));

        var outlineconfig = {
            thickness: 3,
            outlineColor: 0xf9c22b,
            quality: 0.1,
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
            intensity: {
                getEnd: function (target, key, value) {
                    const maxIntensity = 0.05;
                    const intensityPerBounce = 0.005; // Adjust this value to control how much intensity increases per bounce
                    const targetIntensity = Math.min(
                        maxIntensity,
                        this.bounceCount * intensityPerBounce
                    );
                    return targetIntensity;
                }.bind(this), // Bind 'this' to the getEnd function to access bounceCount

                getStart: function (target, key, value) {
                    return 0;
                },
            },
            duration: 1000, // Initial duration
            repeat: -1,
            yoyo: true,
        });

        this.bounceCount = 0; // Track how many times it has been bounced

        this.scene.matter.world.on(
            'collisionstart',
            this.handleCollision,
            this
        );
    }

    handleCollision(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;

            // Check if it is itself and the other is the platform. If so and bounceCount > 0, then remove it from juggledObjects list
            if (
                (bodyA === this.body &&
                    bodyB.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM) ||
                (bodyB === this.body &&
                    bodyA.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM)
            ) {
                if (this.bounceCount > 0) {
                    const index = this.scene.juggledObjects.indexOf(this);
                    if (index > -1) {
                        this.scene.juggledObjects.splice(index, 1);
                    }
                }
            }
        });
    }

    takeDamage(damage) {}

    bounce() {
        this.bounceCount++;
        this.glowTween.play();
        // this.scene.tweens.add({
        //     targets: this,
        //     scaleX: '*=1.2', // Scale up by 10%
        //     scaleY: '*=1.2', // Scale up by 10%
        //     duration: 200, // Duration of the scale effect
        //     yoyo: true, // Scale back down
        //     ease: 'Bounce.easeOut', // Use bounce easing
        // });
    }

    destroy() {
        if (!this.scene) return;

        const id = this.scene.juggledObjects.indexOf(this);
        if (id > -1) {
            this.scene.juggledObjects.splice(id, 1);
        }
       
        let juiceGain = 0.5;
        if (this.bounceCount > 0) {
            juiceGain = Math.pow(this.bounceCount, 1.5) * 0.1;
        }
        this.scene.player.SupremeJuice = Math.min(
            100,
            this.scene.player.SupremeJuice + juiceGain
        );
        
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
