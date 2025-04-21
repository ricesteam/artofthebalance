import Phaser from 'phaser';

export class BasicAttack {
    constructor(scene) {
        this.scene = scene;
        this.name = 'BasicAttack';
        this.attackSpeed = 15;
        this.attackRadius = 20;
        this.attackPushback = 5;
        this.attackMass = 0.8;
        this.maxCapacity = 5;
        this.cooldown = 300; // Cooldown in milliseconds
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
    }

    use(player) {
        const trumpWords = [
            'Huge',
            'Yuge',
            'Fake',
            'Sad!',
            'Tremendous',
            'Wrong',
            'Disaster',
            'Loser',
            'Winning',
            'China',
            'Believe',
            'Beautiful',
            'Bigly',
            'Terrific',
            'Nasty',
            'Covfefe',
            'Corrupt',
            'Rigged',
            'Witchhunt',
            'Radical',
            'Classy',
        ];

        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // Get the platform's angle in radians
        const platformAngle = this.scene.platform.rotation;

        // Initial position: player's center
        const attackX = player.body.position.x;
        const attackY = player.body.position.y;

        const randomWord = Phaser.Utils.Array.GetRandom(trumpWords);

        const attackText = this.scene.add
            .text(attackX, attackY, randomWord, {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'retro',
                align: 'center',
            })
            .setDepth(20);

        // Calculate the initial position of the text slightly in front of the player
        const offsetX = player.playerDirection * 20; // Adjust the offset as needed
        const offsetY = 0; // Adjust the offset as needed

        // Rotate the offset vector by the platform angle
        const rotatedOffset = Phaser.Math.RotateAround(
            { x: offsetX, y: offsetY },
            0,
            0,
            platformAngle
        );

        attackText.setPosition(
            player.x + rotatedOffset.x,
            player.y + rotatedOffset.y
        );

        // Set the rotation of the text to match the platform angle
        attackText.setRotation(platformAngle);

        // Create the attack area as a circle
        const attackArea = this.scene.matter.add.circle(
            attackText.x, // Start the attack area at the text's initial position
            attackText.y, // Start the attack area at the text's initial position
            this.attackRadius,
            {
                label: 'attack1',
                collisionFilter: {
                    category: this.scene.CATEGORY_ATTACK,
                    mask: this.scene.CATEGORY_BLOCK | this.scene.CATEGORY_ENEMY,
                },
                isSensor: true,
                mass: this.attackMass,
            }
        );

        // Create a victims array specifically for this attackArea
        attackArea.victims = [];
        attackArea.maxCapacity = this.maxCapacity; // Also attach maxCapacity

        // Add collision handling specifically for this attack area
        attackArea.onCollideCallback = (pair) => {
            const { bodyA, bodyB } = pair;

            // Determine which body is the other object
            let otherBody = bodyA === attackArea ? bodyB : bodyA;
            let otherGameObject = otherBody.gameObject;

            // Check if the other object is already a victim or if we've reached max capacity
            if (
                otherGameObject &&
                attackArea.victims.length < attackArea.maxCapacity && // Use attackArea's victims and maxCapacity
                !attackArea.victims.includes(otherBody)
            ) {
                attackArea.victims.push(otherBody); // Add to attackArea's victims

                // pushback the otherBody in the direction the player is facing
                const direction = this.scene.player.playerDirection;
                const pushbackDirection = new Phaser.Math.Vector2(direction, 0);
                pushbackDirection.rotate(this.scene.platform.rotation);
                pushbackDirection.scale(this.attackPushback);

                // use setVelocity as you previously mentioned
                otherGameObject.setVelocity(
                    pushbackDirection.x,
                    pushbackDirection.y
                );

                // Check if the other object is an enemy
                if (typeof otherGameObject.takeDamage === 'function') {
                    otherGameObject.takeDamage(1);
                }
            }
        };

        // Calculate velocity based on player direction and attack speed
        let velocityX = this.attackSpeed * player.playerDirection;
        let velocityY = 0;

        // Rotate the velocity vector by the platform angle
        const rotatedVelocity = Phaser.Math.RotateAround(
            { x: velocityX, y: velocityY },
            0,
            0,
            platformAngle
        );

        velocityX = rotatedVelocity.x;
        velocityY = rotatedVelocity.y;

        // Apply the velocity to the attack area
        this.scene.matter.setVelocity(attackArea, velocityX, velocityY);

        // Destroy the attack area and text after a short delay
        this.scene.time.delayedCall(50, () => {
            this.scene.matter.world.remove(attackArea);
            attackText.destroy();
            // The victims array attached to attackArea will be garbage collected with attackArea
        });
    }
}
