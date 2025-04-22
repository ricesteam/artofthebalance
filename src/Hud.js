import Phaser from 'phaser';

export class Hud extends Phaser.GameObjects.Container {
    constructor(scene, player) {
        super(scene, 0, 0);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);

        this.setDepth(999);

        this.barWidth = 200;
        this.barHeight = 20;
        this.barX = 10;
        this.barY = 10;

        // Timer Text
        this.timerText = this.scene.add
            .text(this.scene.scale.width / 2, this.barY - 5, '5:00', {
                fontSize: 24,
                fill: '#ffffff',
                fontFamily: 'notjam',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6,
            })
            .setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);
        this.add(this.timerText);

        // Create the background of the health bar
        this.healthBarBackground = this.scene.add.graphics();
        this.healthBarBackground.fillStyle(0x808080); // Grey background
        this.healthBarBackground.fillRect(
            this.barX,
            this.barY,
            this.barWidth,
            this.barHeight
        );
        this.healthBarBackground.setScrollFactor(0);
        this.add(this.healthBarBackground);

        // Create the health bar itself
        this.healthBar = this.scene.add.graphics();
        this.healthBar.fillStyle(0xff0000); // Red health bar
        this.healthBar.fillRect(
            this.barX,
            this.barY,
            this.barWidth,
            this.barHeight
        );
        this.healthBar.setScrollFactor(0);
        this.add(this.healthBar);

        // Optional: Add text for HP value on top of the bar
        this.hpText = this.scene.add
            .text(
                this.barX + this.barWidth / 2,
                this.barY + this.barHeight / 2,
                `${this.player.hp}`,
                {
                    fontSize: '18px',
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'center',
                }
            )
            .setOrigin(0.5);
        this.hpText.setScrollFactor(0);
        this.add(this.hpText);

        this.spectrumWidth = this.scene.scale.width - this.barX * 2; // Make the spectrum stretch across the screen with margins
        this.spectrumHeight = this.barHeight;
        this.spectrumX = this.barX; // Start from the left margin
        this.spectrumY = this.barY + this.barHeight + 10; // Position below the health bar

        // Create the spectrum background using multiple colored rectangles
        this.spectrumBackground = this.scene.add.graphics();
        const numberOfSegments = 100; // Number of colored segments
        const segmentWidth = this.spectrumWidth / numberOfSegments;

        for (let i = 0; i < numberOfSegments; i++) {
            let color;
            const progress = i / (numberOfSegments - 1); // Normalized progress from 0 to 1

            if (progress < 0.5) {
                // Transition from blue (at 0) to green (at 0.5)
                const transitionProgress = progress / 0.5; // Normalize to 0-1 for this segment
                const r = Phaser.Math.Linear(0x00, 0x00, transitionProgress);
                const g = Phaser.Math.Linear(0x00, 0xff, transitionProgress);
                const b = Phaser.Math.Linear(0xff, 0x00, transitionProgress);
                color = Phaser.Display.Color.GetColor(r, g, b);
            } else {
                // Transition from green (at 0.5) to red (at 1)
                const transitionProgress = (progress - 0.5) / 0.5; // Normalize to 0-1 for this segment
                const r = Phaser.Math.Linear(0x00, 0xff, transitionProgress);
                const g = Phaser.Math.Linear(0xff, 0x00, transitionProgress);
                const b = Phaser.Math.Linear(0x00, 0x00, transitionProgress);
                color = Phaser.Display.Color.GetColor(r, g, b);
            }

            this.spectrumBackground.fillStyle(color);
            this.spectrumBackground.fillRect(
                this.spectrumX + i * segmentWidth,
                this.spectrumY,
                segmentWidth,
                this.spectrumHeight
            );
        }
        this.spectrumBackground.setScrollFactor(0);
        this.add(this.spectrumBackground);

        // Create the indicator for the balance meter
        this.balanceIndicator = this.scene.add.graphics();
        this.balanceIndicator.fillStyle(0xffffff); // White indicator
        this.indicatorWidth = 5;
        this.indicatorHeight = this.spectrumHeight + 5; // Slightly taller than the spectrum
        this.balanceIndicator.fillRect(
            -this.indicatorWidth / 2, // Draw relative to the indicator's origin (which will be centered)
            -(this.indicatorHeight - this.spectrumHeight) / 2, // Center vertically relative to the spectrum
            this.indicatorWidth,
            this.indicatorHeight
        );
        this.balanceIndicator.setScrollFactor(0);
        this.add(this.balanceIndicator);

        // Position the 'Tariff Slider' text below the spectrum bar
        this.tariffSliderText = this.scene.add
            .text(
                this.spectrumX + this.spectrumWidth / 2, // Center horizontally with the spectrum
                this.spectrumY + this.spectrumHeight + 5, // Position below the spectrum
                'Tariff Slider',
                {
                    fontSize: '14px',
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'center',
                }
            )
            .setOrigin(0.5, 0);
        this.tariffSliderText.setScrollFactor(0);
        this.add(this.tariffSliderText);

        // Add text for juggling count
        this.juggleText = this.scene.add.text(
            this.barX,
            this.spectrumY + this.spectrumHeight + 10 + this.tariffSliderText.height + 5, // Position below the spectrum and tariff text
            `Juggling: ${this.scene.juggledObjects.length}`,
            {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'notjam',
            }
        );
        this.juggleText.setScrollFactor(0);
        this.add(this.juggleText);

        // Supreme Juice Bar
        this.SupremeJuiceBarWidth = 20;
        this.SupremeJuiceBarHeight = 200;
        this.SupremeJuiceBarX = 10;
        this.SupremeJuiceBarY =
            this.scene.scale.height - this.SupremeJuiceBarHeight - 10; // Position at bottom left

        // Create the background of the Supreme Juice bar
        this.SupremeJuiceBackground = this.scene.add.graphics();
        this.SupremeJuiceBackground.fillStyle(0x808080); // Grey background
        this.SupremeJuiceBackground.fillRect(
            this.SupremeJuiceBarX,
            this.SupremeJuiceBarY,
            this.SupremeJuiceBarWidth,
            this.SupremeJuiceBarHeight
        );
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
        this.updateBalanceMeter(); // Initial update for the balance meter
    }

    updateHealthBar() {
        // Calculate the width of the health bar based on current HP
        const healthPercentage = this.player.hp / 100; // Assuming max HP is 100
        const currentBarWidth = this.barWidth * healthPercentage;

        // Clear the current health bar graphic and redraw it
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(
            this.barX,
            this.barY,
            currentBarWidth,
            this.barHeight
        );

        // Update the HP text
        this.hpText.setText(`${Math.round(this.player.hp)}`);
    }

    updateJuggleCount() {
        // Update the juggling count text
        this.juggleText.setText(
            `Juggling: ${this.scene.juggledObjects.length}`
        );
    }

    updateSupremeJuice() {
        // Calculate the height of the Supreme Juice bar based on current Supreme Juice value
        const meterPercentage = this.player.SupremeJuice / 100; // Assuming max meter is 100
        const currentBarHeight = this.SupremeJuiceBarHeight * meterPercentage;

        // when it's above 75%, barcolor should be blue
        let barColor;
        if (this.player.SupremeJuice >= 75) {
            barColor = 0x0000ff; // Blue
        } else if (this.player.SupremeJuice >= 50) {
            barColor = 0xffff00; // Yellow
        } else if (this.player.SupremeJuice >= 25) {
            barColor = 0x00ff00; // Green
        } else {
            barColor = 0xa9a9a9; // Slightly lighter gray
        }

        // Clear the current Supreme Juice bar graphic and redraw it
        this.SupremeJuiceBar.clear();
        this.SupremeJuiceBar.fillStyle(barColor);
        // Draw from the bottom up
        this.SupremeJuiceBar.fillRect(
            this.SupremeJuiceBarX,
            this.SupremeJuiceBarY +
                this.SupremeJuiceBarHeight -
                currentBarHeight,
            this.SupremeJuiceBarWidth,
            currentBarHeight
        );
    }

    updateBalanceMeter() {
        // Map the balance meter value (-100 to 100) to the spectrum width (0 to spectrumWidth)
        const balanceRange = 200; // -100 to 100
        const normalizedBalance =
            (this.scene.balanceMeter + 100) / balanceRange; // 0 to 1
        const indicatorPositionX =
            this.spectrumX + normalizedBalance * this.spectrumWidth;

        this.balanceIndicator.x = indicatorPositionX;
        this.balanceIndicator.y = this.spectrumY + this.spectrumHeight / 2 - 5; // Position vertically in the middle of the spectrum
    }

    updateTimer() {
        // Get the remaining time from the scene's clock
        const timeRemaining = this.scene.clock.getRemaining();
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        this.timerText.setText(formattedTime);
    }

    update() {
        // Update the health bar display
        this.updateHealthBar();
        // Update the juggling count display
        this.updateJuggleCount();
        // Update the Supreme Juice display
        this.updateSupremeJuice();
        // Update the balance meter display
        this.updateBalanceMeter();
        // Update the timer display
        this.updateTimer();
    }
}
