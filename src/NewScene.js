import Phaser from 'phaser';

export default class NewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NewScene' });
  }

  preload() {
    // Load assets here
  }

  create() {
    this.add.text(100, 100, 'Welcome to the New Scene!', { font: '24px Arial', fill: '#ffffff' });
  }

  update() {
    // Game loop logic here
  }
}
