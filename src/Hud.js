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

        this.createSpectrumMeter();

        // Timer Text
        this.timerText = this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.spectrumHeight + 10,
                '5:00',
                {
                    fontSize: 24,
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 6,
                }
            )
            .setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);
        this.add(this.timerText);

        this.juggleText = this.scene.add.text(
            this.barX,
            this.spectrumY + this.spectrumHeight + 10,
            '',
            {
                fontSize: 16,
                fill: '#ffffff',
                fontFamily: 'notjam',
                stroke: '#000000',
                strokeThickness: 2,
            }
        );
        this.juggleText.setScrollFactor(0);
        this.add(this.juggleText);

        this.createSupremeJuiceBar();

        // State to track if thresholds have been hit for tweening
        this.supremeJuiceThresholdsHit = {
            25: false,
            50: false,
            75: false,
        };

        // Store the previous total bounces to detect changes
        this.previousTotalBounces = 0;

        this.updateHealthBar();
        this.updateJuggleCount();
        this.updateSupremeJuice();
        this.updateBalanceMeter();
    }

    createSpectrumMeter() {
        this.spectrumWidth = this.scene.scale.width - this.barX * 2; // Make the spectrum stretch across the screen with margins
        this.spectrumHeight = this.barHeight;
        // Position the spectrum meter where the timer was
        this.spectrumX = this.scene.scale.width / 2 - this.spectrumWidth / 2;
        this.spectrumY = this.barY - 5;

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
        // this.tariffSliderText = this.scene.add
        //     .text(
        //         this.spectrumX + this.spectrumWidth / 2, // Center horizontally with the spectrum
        //         this.spectrumY + this.spectrumHeight / 2, // Position below the spectrum
        //         'TARIFF SLIDER',
        //         {
        //             fontSize: 12,
        //             fill: '#ffffff',
        //             fontFamily: 'notjam',
        //             align: 'center',
        //             stroke: '#000000',
        //             strokeThickness: 2,
        //         }
        //     )
        //     .setOrigin(0.5, 0);
        // this.tariffSliderText.setScrollFactor(0);
        // this.add(this.tariffSliderText);

        this.addPercentText();
    }

    addPercentText() {
        // Add the text '0%' on the spectrum bar itself
        this.zeroPercentText = this.scene.add
            .text(
                this.spectrumX + 2, // Position at the start of the spectrum
                this.spectrumY + this.spectrumHeight / 2, // Center vertically on the spectrum
                '0%',
                {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'left',
                }
            )
            .setOrigin(0, 0.5); // Align to the left and center vertically
        this.zeroPercentText.setScrollFactor(0);
        this.add(this.zeroPercentText);

        // // add the text 100% at the center of the bar
        this.hundredPercentText = this.scene.add
            .text(
                this.spectrumX + this.spectrumWidth / 2 + 20, // Position at the end of the spectrum
                this.spectrumY + this.spectrumHeight / 2, // Center vertically on the spectrum
                '100%',
                {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'center',
                }
            )
            .setOrigin(1, 0.5); // Align to the right and center vertically
        this.hundredPercentText.setScrollFactor(0);
        this.add(this.hundredPercentText);

        this.thousand = this.scene.add
            .text(
                this.spectrumX + this.spectrumWidth - 2, // Position at the end of the spectrum
                this.spectrumY + this.spectrumHeight / 2, // Center vertically on the spectrum
                '1000%',
                {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'right',
                }
            )
            .setOrigin(1, 0.5); // Align to the right and center vertically
        this.thousand.setScrollFactor(0);
        this.add(this.thousand);
    }

    createSupremeJuiceBar() {
        // Supreme Juice Bar
        this.SupremeJuiceBarWidth = this.barWidth; // Make it horizontal and same width as health bar
        this.SupremeJuiceBarHeight = this.barHeight; // Make it horizontal and same height as health bar
        this.SupremeJuiceBarX =
            this.scene.scale.width - this.SupremeJuiceBarWidth - 10; // Position at bottom right
        this.SupremeJuiceBarY = this.scene.scale.height - this.barHeight - 10; // Position at bottom right

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

        // Add the "SUPREME JUICE" text above the bar
        this.supremeJuiceText = this.scene.add
            .text(
                this.SupremeJuiceBarX + this.SupremeJuiceBarWidth / 2, // Center horizontally with the bar
                this.SupremeJuiceBarY + 18, // Position above the bar
                'SUPREME JUICE',
                {
                    fontSize: 12,
                    fill: '#ffffff',
                    fontFamily: 'notjam',
                    align: 'center',
                }
            )
            .setOrigin(0.5, 1); // Align to the center and bottom
        this.supremeJuiceText.setScrollFactor(0);
        this.add(this.supremeJuiceText);

        // this.scene.tweens.add({
        //     targets: [this.SupremeJuiceBar, this.SupremeJuiceBackground],
        //     scale: 1.1,
        //     duration: 200,
        //     yoyo: true,

        //     repeat: -1,
        // });
    }

    updateHealthBar() {
        // Relocate health bar to bottom left
        const healthBarX = 10;
        const healthBarY = this.scene.scale.height - this.barHeight - 10;

        const healthPercentage = this.player.hp / 100; // Assuming max HP is 100
        const currentBarWidth = this.barWidth * healthPercentage;

        // Update background position
        this.healthBarBackground.x = healthBarX - this.barX; // Adjust for container's origin
        this.healthBarBackground.y = healthBarY - this.barY; // Adjust for container's origin

        // Clear the current health bar graphic and redraw it
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);

        this.healthBar.fillRect(
            healthBarX,
            healthBarY,
            currentBarWidth,
            this.barHeight
        );

        // Update the HP text position
        this.hpText.x = healthBarX + this.barWidth / 2;
        this.hpText.y = healthBarY + this.barHeight / 2;
        this.hpText.setText(`${Math.round(this.player.hp)}`);
    }

    updateJuggleCount() {
        const totalBounces = this.scene.juggledObjects.reduce(
            (sum, obj) => sum + obj.bounceCount,
            0
        );

        // Check if the total bounces have increased
        if (totalBounces > this.previousTotalBounces) {
            // Tween the scale of the juggleText
            this.scene.tweens.add({
                targets: this.juggleText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.juggleText.setScale(1); // Reset scale after tween
                },
            });
        }

        this.juggleText.setText(`JugCombo ${totalBounces}`);
        this.previousTotalBounces = totalBounces; // Update the previous count
    }

    updateSupremeJuice() {
        const meterPercentage = this.player.SupremeJuice / 100; // Assuming max meter is 100
        const targetBarWidth = this.SupremeJuiceBarWidth * meterPercentage; // Use width for horizontal bar

        let barColor;

        if (this.player.SupremeJuice >= 100) {
            barColor = 0x800080; // Purple
        } else if (this.player.SupremeJuice >= 75) {
            barColor = 0x0000ff; // Blue
        } else if (this.player.SupremeJuice >= 50) {
            barColor = 0xffff00; // Yellow
        } else if (this.player.SupremeJuice >= 25) {
            barColor = 0x00ff00; // Green
        } else {
            barColor = 0xa9a9a9; // Slightly lighter gray
        }

        // Clear the current Supreme Juice bar graphic
        this.SupremeJuiceBar.clear();
        this.SupremeJuiceBar.fillStyle(barColor);

        this.SupremeJuiceBar.fillRect(
            this.SupremeJuiceBarX,
            this.SupremeJuiceBarY,
            targetBarWidth,
            this.SupremeJuiceBarHeight
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
