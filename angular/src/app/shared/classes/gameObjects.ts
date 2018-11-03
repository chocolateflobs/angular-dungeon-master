import { IImpactConfig } from '../interfaces/projectiles';
import { IHasHealth, IHealConfig, IHasWeapons, IWeaponState, IMovementState, IHasMovement } from "../interfaces/generic";
import { MeleeWeapons } from './meleeWeapons';
import { Projectiles } from './projectiles';

export interface IGameObject
{
    create();
}
export class ngGameObject implements IGameObject
{
    protected _scene:Phaser.Scene;

    public get scene():Phaser.Scene {
        return this._scene;
    }

    constructor(scene:Phaser.Scene)
    {
        this._scene = scene;
    }

    public create() {

    }
}
export class ngArcadeSprite extends ngGameObject
{
    public spriteConfig = {
        x: 0,
        y: 0,
        texture: "",
        frame: 0
    };

    protected _sprite:Phaser.Physics.Arcade.Sprite;

    public get sprite():Phaser.Physics.Arcade.Sprite {
        return this._sprite;
    }

    protected _isAlive:boolean = true;

    public get isAlive():boolean {
        return this._isAlive;
    }

    protected _isStaggered:boolean = true;

    public get isStaggered():boolean {
        return this._isStaggered;
    }

    public get visible():boolean {
        return this._sprite ? this._sprite.visible : false;
    }

    constructor(scene:Phaser.Scene, x:number, y:number, texture?:string, frame?:number, maxHealth?:number)
    {
        super(scene);
        this.spriteConfig = {x, y, texture, frame};
    }

    public create(x?:number, y?:number)
    {
        this._sprite = this.scene.physics.add.sprite(x || this.spriteConfig.x, y || this.spriteConfig.y, this.spriteConfig.texture, this.spriteConfig.frame);
    }

    public kill() {
        this._isAlive = false;
    }

    public collideWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.collider(this._sprite, object, callback);
    }

    public overlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.overlap(this._sprite, object, callback);
    }
}
export class ngLivingSprite extends ngArcadeSprite implements IHasHealth, IHasWeapons, IHasMovement
{
    private _currentHealth?:number;
    private _maxHealth?:number;

    private _weaponState:IWeaponState;
    private _movementState:IMovementState;

    protected _healthBar:Phaser.GameObjects.Container;

    public get health():number {
        return this._currentHealth;
    }

    public get maxHealth():number {
        return this._maxHealth;
    }

    public get healthBar():Phaser.GameObjects.Container {
        return this._healthBar;
    }

    public get movementState():IMovementState {
        return this._movementState;
    }

    public get weaponState():IWeaponState {
        return this._weaponState;
    }

    public get meleeWeapon():MeleeWeapons.ngMeleeWeapon {
        return this._weaponState.activeMelee;
    }

    public get rangedWeapon():Projectiles.ngProjectileGroup {
        return this._weaponState.activeRanged;
    }

    // public set rangedWeapon(val:Projectiles.ngProjectileGroup) {
    //     this._weaponState.
    // }

    constructor(scene:Phaser.Scene, x:number, y:number, texture?:string, frame?:number, maxHealth?:number)
    {
        super(scene, x, y, texture, frame);
        
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
    }

    public create(x?:number, y?:number)
    {
        if (this.maxHealth !== null)
        {
            this.redrawHealthbar();
        }
    }

    public hit(impactConfig:IImpactConfig) {
        this._currentHealth -= impactConfig.hitPoints;
        this.redrawHealthbar();
    }

    public heal(healConfig:IHealConfig) {
        // TODO: Support repeating for duration/timeout configured in IHealConfig
        this._currentHealth += healConfig.hitPoints;
    }

    protected redrawHealthbar()
    {
        let container:Phaser.GameObjects.Graphics;

        const barHeight = 7;
        const barWidth = 50;
        const healthPercent = (this._currentHealth / this._maxHealth);

        if (!this._healthBar)
        {
            this._healthBar = this.scene.add.container(this._sprite.x, this._sprite.y);
            container = this.scene.add.graphics();

            this._healthBar.add(container);
        }
        else
        {
            container = <Phaser.GameObjects.Graphics>this._healthBar.first;
            
            // redraw the black bar
            container.fillStyle(0x000000, 1);
            container.fillRect(0, 0, barWidth, barHeight);
        }

        if (this._currentHealth <= 0) return;

        container.lineStyle(1, 0xFFFFFF, 1.0);
        container.fillStyle(0xFF0000, .8);
        container.fillRect(0, 0, barWidth * healthPercent, barHeight);
        container.strokeRect(0, 0, barWidth, barHeight);
        container.setDepth(5);
    }

    public addWeapons()
    {   
        // needed for interface
        return;
    }

    public addAnimations()
    {   
        // needed for interface
        return;
    }

}

export class ngGroup extends ngGameObject
{
    protected _group:Phaser.Physics.Arcade.Group;
    protected _groupConfig:GroupCreateConfig;

    public get group():Phaser.Physics.Arcade.Group {
        return this._group;
    }

    public create(config?:GroupConfig) {
        this._group = this._scene.physics.add.group(config);
    }

    public collideWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.collider(this._group, object, callback);
    }

    public overlapWith(object:Phaser.GameObjects.GameObject|Phaser.Physics.Arcade.Group|any[], callback:(player:Phaser.Physics.Arcade.Sprite, object:Phaser.Physics.Arcade.Sprite) => void = () => {})
    {
        this.scene.physics.add.overlap(this._group, object, callback);
    }
}