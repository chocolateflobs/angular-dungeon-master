import { ngLivingSprite } from './gameObjects';
import { ngMap } from './map';
import { Projectiles } from './projectiles';

export namespace Npcs {
    export interface INpc {
        tilemapProperties?:any
        addAnimations()
        addWeapons()
        update()
        hit(IImpactConfig)
        kill()
        respawn(map:ngMap)
    }   

    export class ngNpc extends ngLivingSprite implements INpc
    {
        public tilemapProperties?:any;

        constructor(scene:Phaser.Scene, x:number = 100, y:number = 350, texture?:string, frame?:number, maxHealth?:number, tilemapProperties?:any)
        {
            super(scene, x, y, texture, frame, maxHealth);
            this.tilemapProperties = tilemapProperties;
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);

            this.sprite.setBounce(this._movementSettings.bounce);
            this.sprite.setCollideWorldBounds(true);
            this.sprite.body.allowGravity = false;
            this.sprite.setDrag(this._movementSettings.drag, this._movementSettings.drag);
            this.sprite.setAcceleration(0, 0);
            this.sprite.setVelocity(0, 0);
            this.sprite.setMaxVelocity(this._movementSettings.maxVelocityX, this._movementSettings.maxVelocityY);
            this.sprite.depth = 1;
        }

        public update()
        {
            if (!this.isAlive || !this.sprite.body) return;

            // move the health bar with the npc
            if (this.maxHealth)
            {
                this.healthBar.setX(this.sprite.getCenter().x - 30);
                this.healthBar.setY(this.sprite.y - 40);
            }

            if (this.weaponState.activeMelee) this.weaponState.activeMelee.update();
        }
        public kill()
        {
            if (!this.isAlive) this.kill();

            this.sprite.setTint(0xff0000);
            this.sprite.setAcceleration(0,0).setVelocity(0,0);
            this.sprite.visible = false;
        }
        public respawn(map:ngMap) {
            this.sprite.clearTint();
            this.sprite.visible = true;
            this.sprite.setX(this.spriteConfig.x);
            this.sprite.setY(this.spriteConfig.y);
        }

        // load ALL NPC spritesheets here ahead of time (if any)
        public static loadAssets(scene:Phaser.Scene)
        {
            return;
        }
    }
    export class eyeballSentinel extends ngNpc {

        private _direction: number = 1;
        private _intervalAngleOffset: number = 45;
        private _firingAngle: number;
        private _maxFiringAngle: number;
        private _minFiringAngle: number;

        public firingIntervalMs: number = 800;

        constructor(scene:Phaser.Scene, x?:number, y?:number, properties?:any)
        {
            super(scene, x, y, 'tiles', 4564, 100, properties);

            this._movementSettings = {
                drag: 900,
                bounce: 0.3,
                turboCoefficient: 1.5,
                maxVelocityX: 250,
                maxVelocityY: 250,
                accelerationX: 2000,
                accelerationY: 2000,
                idleTimeoutMs: 325
            };

            this._maxFiringAngle = this.tilemapProperties && this.tilemapProperties.maxAngle ? this.tilemapProperties.maxAngle : 90;
            this._minFiringAngle = this.tilemapProperties && this.tilemapProperties.minAngle ? this.tilemapProperties.minAngle : -90;

            this._firingAngle = this._minFiringAngle;
        }

        public create(x?:number, y?:number)
        {
            super.create(x, y);
            
            this.addWeapons();
            this.movementState.vector = 0;

            setInterval(() => {
                this.rangedWeapon.fire(this._firingAngle);
                this.update();
                
                if (this._maxFiringAngle == this._minFiringAngle) return;

                // increment/decrement
                this._firingAngle += this._intervalAngleOffset * this._direction;

                if (this._firingAngle >= this._maxFiringAngle) this._direction = -1;
                else if (this._firingAngle <= this._minFiringAngle) this._direction = 1;

            }, this.firingIntervalMs);
        }
        public addWeapons() {
            this.weaponState.rangedWeapons.push(new Projectiles.FireBall(this.scene, this, { key: 'tiles' }).create());
            this.weaponState.activeRanged = this.weaponState.rangedWeapons[0];
        }
    }
}