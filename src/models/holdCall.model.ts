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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'hold_calls',
    timestamps: true,
  })
  export default class HoldCall extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    channelId!: string;
  
    @Default('')
    @Column(DataType.STRING)
    startTime!: string;
  
    @Default('')
    @Column(DataType.STRING)
    endTime!: string;
  
    @Default(0)
    @Column(DataType.INTEGER)
    holdDuration!: number;
  
    @Default('pending')
    @Column(DataType.STRING)
    status!: string;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  