class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("assets/");

        // Characters and particles
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Spritesheets and images
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", { frameWidth: 18, frameHeight: 18 });
        this.load.image("tilemap_packed", "tilemap_packed.png");
        this.load.image("tilemap_packed_02", "tilemap_packed_02.png");
        this.load.image("tilemap_packed_03", "tilemap_packed_03.png");
        this.load.image("tilemap_background", "tilemap-backgrounds_packed.png");

        // Tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj");

        // Audio
        this.load.audio("jumpSound", "laserSmall_003.ogg");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0000.png" }],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [{ frame: "tile_0001.png" }]
        });

        this.scene.start("platformerScene");
    }
}