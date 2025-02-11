import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  import Slab from './slab.model';
  
  @Table({
    tableName: 'offers',
    timestamps: false,
  })
  export default class Offer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    recharge_amount!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    priority!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    cashback_amount!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING(255))
    title!: string;
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    description!: string;
  
    @Column(DataType.STRING(255))
    tag!: string | null;
  
    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    has_promo_cashback!: boolean;
  
    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_default!: boolean;
  
    @AllowNull(false)
    @Column(DataType.DATE)
    offer_enddate!: Date;
  
    @AllowNull(false)
    @Column(DataType.DATE)
    offer_startdate!: Date;
  
    @AllowNull(false)
    @Column(DataType.STRING(255))
    offer_title!: string;
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    offer_description!: string;
  
    @AllowNull(false)
    @Default(true)
    @Column(DataType.BOOLEAN)
    status!: boolean;
  
    @ForeignKey(() => Slab)
    @Column({
      type: DataType.INTEGER,
      references: { model: 'slabs', key: 'id' },
    })
    slab_id!: number | null;
  
    @BelongsTo(() => Slab)
    slab?: Slab;
  
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Column({
      type: DataType.INTEGER,
      unique: true,
      references: {
        model: 'admins',
        key: 'id',
      },
    })
    created_by!: number | null;
  
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    updated_at!: Date;
  
    @Column({
      type: DataType.INTEGER,
      unique: true,
      references: {
        model: 'admins',
        key: 'id',
      },
    })
    updated_by!: number | null;
  }
  