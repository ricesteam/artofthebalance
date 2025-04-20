import Phaser from 'phaser';

export class Hud extends Phaser.GameObjects.Container {
    constructor(scene, player) {
        super(scene, 0, 0);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);

        this.barWidth = 200;
        this.barHeight = 20;
        this.barX = 10;
        this.barY = 10;

        // Create the background of the health bar
        this.healthBarBackground = this.scene.add.graphics();
        this.healthBarBackground.fillStyle(0x808080); // Grey background
        this.healthBarBackground.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);
        this.healthBarBackground.setScrollFactor(0);
        this.add(this.healthBarBackground);

        // Create the health bar itself
        this.healthBar = this.scene.add.graphics();
        this.healthBar.fillStyle(0xff0000); // Red health bar
        this.healthBar.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);
        this.healthBar.setScrollFactor(0);
        this.add(this.healthBar);

        // Optional: Add text for HP value on top of the bar
        this.hpText = this.scene.add.text(this.barX + this.barWidth / 2, this.barY + this.barHeight / 2, `${this.player.hp}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'retro',
            align: 'center'
        }).setOrigin(0.5);
        this.hpText.setScrollFactor(0);
        this.add(this.hpText);

        // Add text for juggling count
        this.juggleText = this.scene.add.text(this.barX, this.barY + this.barHeight + 10, `Juggling: 0`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'retro'
        });
        this.juggleText.setScrollFactor(0);
        this.add(this.juggleText);

        // Juggle Meter Bar
        this.juggleMeterBarWidth = 20;
        this.juggleMeterBarHeight = 200;
        this.juggleMeterBarX = 10;
        this.juggleMeterBarY = this.scene.scale.height - this.juggleMeterBarHeight - 10; // Position at bottom left

        // Create the background of the juggle meter bar
        this.juggleMeterBackground = this.scene.add.graphics();
        this.juggleMeterBackground.fillStyle(0x808080); // Grey background
        this.juggleMeterBackground.fillRect(this.juggleMeterBarX, this.juggleMeterBarY, this.juggleMeterBarWidth, this.juggleMeterBarHeight);
        this.juggleMeterBackground.setScrollFactor(0);
        this.add(this.juggleMeterBackground);

        // Create the juggle meter bar itself
        this.juggleMeterBar = this.scene.add.graphics();
        this.juggleMeterBar.fillStyle(0x00ff00); // Green color
        // Initial draw will be handled by updateJuggleMeter
        this.juggleMeterBar.setScrollFactor(0);
        this.add(this.juggleMeterBar);


        this.updateHealthBar();
        this.updateJuggleCount();
        this.updateJuggleMeter();
    }

    updateHealthBar() {
        // Calculate the width of the health bar based on current HP
        const healthPercentage = this.player.hp / 100; // Assuming max HP is 100
        const currentBarWidth = this.barWidth * healthPercentage;

        // Clear the current health bar graphic and redraw it
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(this.barX, this.barY, currentBarWidth, this.barHeight);

        // Update the HP text
        this.hpText.setText(`${this.player.hp}`);
    }

    updateJuggleCount() {
        // Update the juggling count text
        this.juggleText.setText(`Juggling: ${this.scene.juggledObjects.length}`);
    }

    updateJuggleMeter() {
        // Calculate the height of the juggle meter bar based on current juggle meter value
        const meterPercentage = this.player.juggleMeter / 100; // Assuming max meter is 100
        const currentBarHeight = this.juggleMeterBarHeight * meterPercentage;

        // Clear the current juggle meter bar graphic and redraw it
        this.juggleMeterBar.clear();
        this.juggleMeterBar.fillStyle(0x00ff00);
        // Draw from the bottom up
        this.juggleMeterBar.fillRect(this.juggleMeterBarX, this.juggleMeterBarY + this.juggleMeterBarHeight - currentBarHeight, this.juggleMeterBarWidth, currentBarHeight);
    }

    update() {
        // Update the health bar display
        this.updateHealthBar();
        // Update the juggling count display
        this.updateJuggleCount();
        // Update the juggle meter display
        this.updateJuggleMeter();
    }
}
