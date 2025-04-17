import Phaser from 'phaser';

export class Blackhole extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'blackhole', 0, {
            label: 'blackhole',
            isStatic: true, // Blackholes don't move
        });
        scene.add.existing(this);

        this.scene = scene;
        this.blackholeRadius = 100; // Adjust the radius of the blackhole's pull
        this.gravitationalConstant = 0.0005; // Adjust the strength of gravity

        this.setCircle(this.blackholeRadius); // Set the collision shape to a circle
        this.setSensor(true); // Make it a sensor so it doesn't collide physically
    }

    update() {
        // Apply gravitational force to all bodies within the blackhole's radius
        this.scene.matter.world.forEach((body) => {
            if (body === this.body) return; // Skip the blackhole itself

            const distance = Phaser.Math.Distance(
                this.x,
                this.y,
                body.position.x,
                body.position.y
            );

            if (distance < this.blackholeRadius) {
                // Calculate the gravitational force
                const force =
                    this.gravitationalConstant *
                    this.body.mass *
                    body.mass /
                    (distance * distance);

                // Calculate the angle towards the blackhole
                const angle = Phaser.Math.Angle.Between(
                    body.position.x,
                    body.position.y,
                    this.x,
                    this.y
                );

                // Apply the force towards the blackhole
                body.force.x += Math.cos(angle) * force;
                body.force.y += Math.sin(angle) * force;
            }
        });
    }
}
