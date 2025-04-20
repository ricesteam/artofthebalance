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
        this.juggleText = this.scene.add.text(this.barX, this.barY + this.barHeight + 10, `Juggling: ${this.scene.juggledObjects.length}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'retro'
        });
        this.juggleText.setScrollFactor(0);
        this.add(this.juggleText);

        // Supreme Juice Bar
        this.SupremeJuiceBarWidth = 20;
        this.SupremeJuiceBarHeight = 200;
        this.SupremeJuiceBarX = 10;
        this.SupremeJuiceBarY = this.scene.scale.height - this.SupremeJuiceBarHeight - 10; // Position at bottom left

        // Create the background of the Supreme Juice bar
        this.SupremeJuiceBackground = this.scene.add.graphics();
        this.SupremeJuiceBackground.fillStyle(0x808080); // Grey background
        this.SupremeJuiceBackground.fillRect(this.SupremeJuiceBarX, this.SupremeJuiceBarY, this.SupremeJuiceBarWidth, this.SupremeJuiceBarHeight);
        this.SupremeJuiceBackground.setScrollFactor(0);
        this.add(this.SupremeJuiceBackground);

        // Create the Supreme Juice bar itself
        this.SupremeJuiceBar = this.scene.add.graphics();
        // Initial draw will be handled by updateSupremeJuice
        this.SupremeJuiceBar.setScrollFactor(0);
        this.add(this.SupremeJuiceBar);


        this.updateHealthBar();
        this.updateJuggleCount();
        this.updateSupremeJuice();
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

    updateSupremeJuice() {
        // Calculate the height of the Supreme Juice bar based on current Supreme Juice value
        const meterPercentage = this.player.SupremeJuice / 100; // Assuming max meter is 100
        const currentBarHeight = this.SupremeJuiceBarHeight * meterPercentage;

        // Determine the color based on the Supreme Juice percentage
        const barColor = this.player.SupremeJuice < 25 ? 0xa9a9a9 : 0x00ff00; // Slightly lighter gray or green

        // Clear the current Supreme Juice bar graphic and redraw it
        this.SupremeJuiceBar.clear();
        this.SupremeJuiceBar.fillStyle(barColor);
        // Draw from the bottom up
        this.SupremeJuiceBar.fillRect(this.SupremeJuiceBarX, this.SupremeJuiceBarY + this.SupremeJuiceBarHeight - currentBarHeight, this.SupremeJuiceBarWidth, currentBarHeight);
    }

    update() {
        // Update the health bar display
        this.updateHealthBar();
        // Update the juggling count display
        this.updateJuggleCount();
        // Update the Supreme Juice display
        this.updateSupremeJuice();
    }
}
