"use strict"
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1400,
    height: 700,
    scene: [Load, Platformer]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);