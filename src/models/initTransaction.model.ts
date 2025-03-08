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
    tableName: 'init_transactions',
    timestamps: true,
    updatedAt: false,
  })
  export default class InitTransaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    order_id!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    txnid!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    requestId!: string;
  
    @Column({ type: DataType.STRING, defaultValue: 'initiated' })
    status!: string;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    channelId!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    amount!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    gst!: string;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  }
  