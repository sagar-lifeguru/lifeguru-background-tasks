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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'commisions',
    timestamps: true,
  })
  export default class Commision extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    ammount!: number;
  
    @Column({ type: DataType.DECIMAL, defaultValue: 0 })
    astro_amount!: number;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    astro_id!: number | null;
  
    @Column({ type: DataType.DECIMAL, defaultValue: 0 })
    commission_amount!: number;
  
    @Column({ type: DataType.DECIMAL, defaultValue: 0 })
    commission!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    channel_id!: string;
  
    @Column({ type: DataType.STRING, defaultValue: 'INR' })
    currency!: string;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  }
  