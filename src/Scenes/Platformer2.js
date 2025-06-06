class Platformer2 extends Phaser.Scene {
    constructor() {
        super("platformerScene2");
    }

    init(data) {
        this.SCALE = 2.0;
        this.spawnX = 50;
        this.spawnY = 50;
        this.physics.world.gravity.y = 1500;
        this.jumpCount = 0;
        this.hasKey = false;
        this.gameEnded = false;
        this._winState = false; 
        this.score = data && data.score ? data.score : 0;
    }

    create() {
        this.jumpSound = this.sound.add("jumpSound");
        this.footstepSound = this.sound.add("footstep", { loop: true, volume: 0.5 });

        this.map = this.make.tilemap({ key: "platformer-level-2" });
        const tileset1 = this.map.addTilesetImage("tilemap_packed", "tilemap_packed");
        const tileset2 = this.map.addTilesetImage("tilemap_packed_02", "tilemap_packed_02");
        const tileset3 = this.map.addTilesetImage("tilemap_packed_03", "tilemap_packed_03");
        const backgroundTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap_background");

        this.backgroundLayer = this.map.createLayer("Background2", backgroundTileset, 0, 0);
        this.platformLayer = this.map.createLayer("Platformer2", [tileset1, tileset2, tileset3], 0, 0);
        this.platformLayer.setCollisionByProperty({ collides: true });
        this.waterLayer = this.map.createLayer("Water2", [tileset1, tileset2, tileset3], 0, 0);

        const spawnObjLayer = this.map.getObjectLayer("PlayerSpawn2");
        if (spawnObjLayer && spawnObjLayer.objects.length > 0) {
            this.spawnX = spawnObjLayer.objects[0].x;
            this.spawnY = spawnObjLayer.objects[0].y;
        }

        my.sprite.player = this.physics.add.sprite(this.spawnX, this.spawnY, "platformer_characters", "tile_0002.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.platformLayer);

        this.vfx = {};
        this.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ["smoke_08.png", "smoke_09.png"],
            scale: { start: 0.08, end: 0.03 },
            lifespan: 200,
            quantity: 2,
            gravityY: -300,
            alpha: { start: 0.7, end: 0.1 }
        });
        this.vfx.walking.stop();

        this.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ["spark_05.png", "spark_07.png"],
            scale: { start: 0.1, end: 0.01 },
            lifespan: 200,
            quantity: 10,
            alpha: { start: 0.8, end: 0 },
            on: false
        });

        this.vfx.coin = this.add.particles(0, 0, "kenny-particles", {
            frame: ["sparkle_05.png"],
            scale: { start: 0.12, end: 0.01 },
            lifespan: 350,
            quantity: 10,
            alpha: { start: 0.9, end: 0 },
            on: false
        });

        const getObjs = (layer, props) =>
            this.map.getObjectLayer(layer) ? this.map.createFromObjects(layer, props) : [];

        this.coinObjects = getObjs("CoinObject2", { name: "coin2", key: "tilemap_sheet", frame: 151 });
        this.keyObjects = getObjs("KeyObject2", { name: "key2", key: "tilemap_sheet", frame: 27 });
        this.doorObjects = getObjs("DooObject2", { name: "door2", key: "tilemap_sheet", frame: 130 });
        this.spikeObjects = getObjs("SpikesObject2", { name: "spikes2", key: "tilemap_sheet", frame: 68 });

        this.physics.world.enable([
            ...this.coinObjects, ...this.keyObjects,
            ...this.doorObjects, ...this.spikeObjects
        ], Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coinObjects);
        this.keyGroup = this.add.group(this.keyObjects);
        this.doorGroup = this.add.group(this.doorObjects);
        this.spikeGroup = this.add.group(this.spikeObjects);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            this.vfx.coin.emitParticleAt(coin.x, coin.y, 16);
            coin.destroy();
            this.updateScore(10);
        });
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (player, key) => { key.destroy(); this.hasKey = true; });
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, () => { this.gameOver(); });

        this.physics.add.overlap(my.sprite.player, this.doorGroup, () => {
            if (this.hasKey && Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.gameWin();
            }
        });

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player);
        this.cameras.main.setZoom(1.8);

        // --- UI Camera for HUD only ---
        this.UICam = this.cameras.add(0, 0, this.sys.game.config.width, this.sys.game.config.height, false, 'UICam');
        this.UICam.setScroll(0, 0);

        // --- HUD (UI elements only) ---
        this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, { fontSize: '20px', fill: '#fff', stroke: '#222', strokeThickness: 3 }).setScrollFactor(0).setDepth(1000);

        this.endText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 50, "", {
            fontSize: '32px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(2000);
        this.replayButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 20, 'REPLAY', {
            fontSize: '32px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setScrollFactor(0).setInteractive().setVisible(false).setDepth(2000);

        // --- Main camera: ignore only HUD UI ---
        this.cameras.main.ignore([this.scoreText, this.endText, this.replayButton]);

        // --- UI camera: ignore EVERYTHING except HUD UI ---
        this.UICam.ignore([
            my.sprite.player,
            this.backgroundLayer,
            this.platformLayer,
            this.waterLayer,
            ...this.coinObjects,
            ...this.keyObjects,
            ...this.doorObjects,
            ...this.spikeObjects,
            this.vfx.walking,
            this.vfx.jump,
            this.vfx.coin
        ]);

        this.replayButton.on('pointerdown', () => {
            this.scene.start("platformerScene"); // replay brings you back to level 1
        });

        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyE = this.input.keyboard.addKey('E');
    }

    updateScore(value) {
        this.score += value;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    gameWin() {
        this.endGame("You Win!\nClick REPLAY to restart.", true);
    }

    gameOver() {
        this.endGame("Game Over\nClick REPLAY to restart.", false);
        this.footstepSound.stop();
    }

    endGame(message, win = false) {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this._winState = !!win;
        my.sprite.player.setActive(false).setVisible(false);
        this.physics.pause();
        this.endText.setText(message).setVisible(true);
        this.replayButton.setVisible(true);
        this.footstepSound.stop();
    }

    update() {
        if (this.gameEnded) return;

        const player = my.sprite.player;
        if (!player.active) return;

        // Water death (tile layer)
        let playerFeetY = player.y + player.displayHeight / 2 - 2;
        let tile = this.waterLayer.getTileAtWorldXY(player.x, playerFeetY, true);

        if (tile && tile.index !== -1) {
            this.gameOver();
            return;
        }

        let isWalking = false;

        if (this.keyA.isDown) {
            player.setVelocityX(-200);
            player.setFlipX(false);
            this.vfx.walking.startFollow(player, player.displayWidth / 2 - 10, player.displayHeight / 2, false);
            this.vfx.walking.setParticleSpeed(80, 0);
            if (player.body.blocked.down) {
                this.vfx.walking.start();
                isWalking = true;
            }
        } else if (this.keyD.isDown) {
            player.setVelocityX(200);
            player.setFlipX(true);
            this.vfx.walking.startFollow(player, player.displayWidth / 2 - 10, player.displayHeight / 2, false);
            this.vfx.walking.setParticleSpeed(80, 0);
            if (player.body.blocked.down) {
                this.vfx.walking.start();
                isWalking = true;
            }
        } else {
            player.setVelocityX(0);
            this.vfx.walking.stop();
        }

        if (isWalking && player.body.blocked.down) {
            if (!this.footstepSound.isPlaying) this.footstepSound.play();
        } else {
            if (this.footstepSound.isPlaying) this.footstepSound.stop();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (player.body.blocked.down || this.jumpCount < 1) {
                player.setVelocityY(-450);
                this.jumpSound.play();
                this.jumpCount++;
                this.vfx.jump.emitParticleAt(player.x, player.y + player.displayHeight / 2, 20);
            }
        }

        if (player.body.blocked.down) {
            this.jumpCount = 0;
        }

        if (player.y > this.map.heightInPixels) {
            this.gameOver();
        }
    }
}
