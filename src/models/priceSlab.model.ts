import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import Astrologer from './astrologer.model';
  import Slab from './slab.model';
  
  @Table({
    tableName: 'price_slabs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  })
  export default class PriceSlab extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    })
    astro_id!: number;
  
    @AllowNull(false)
    @Column(
      DataType.ENUM('chat', 'call', 'video')
    )
    consult_type!: 'chat' | 'call' | 'video';
  
    @ForeignKey(() => Slab)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'slabs',
        key: 'id',
      },
    })
    slab_id!: number;
  
    @Column(DataType.INTEGER)
    price_per_consult!: number | null;
  
    @Column(DataType.INTEGER)
    price_per_consult_mrp!: number | null;
  
    @Column(DataType.DECIMAL)
    astro_commission!: number | null;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    status!: boolean;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_delete!: boolean;
  
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @BelongsTo(() => Slab)
    slab?: Slab;
  }
  