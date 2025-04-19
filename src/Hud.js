import Phaser from 'phaser';

export class Hud extends Phaser.GameObjects.Container {
    constructor(scene, player) {
        super(scene, 0, 0);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);

        // Create the HP text
        this.hpText = this.scene.add.text(10, 10, `HP: ${this.player.hp}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'retro',
        });
        this.hpText.setScrollFactor(0); // Keep the text fixed on the screen
        this.add(this.hpText);
    }

    update() {
        // Update the HP text
        this.hpText.setText(`HP: ${this.player.hp}`);
    }
}
