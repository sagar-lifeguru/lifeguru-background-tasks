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
  import { literal } from 'sequelize';
  import UserCall from './userCall.model'; // Adjust path as needed
  
  @Table({
    tableName: 'user_call_events',
    timestamps: true, // manages createdAt & updatedAt automatically
  })
  export default class UserCallEvent extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => UserCall)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_call_id!: number;
  
    @BelongsTo(() => UserCall)
    userCall?: UserCall;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    user_call_event!: string;
  
    // With timestamps: true, typically you'd rely on @CreatedAt/@UpdatedAt,
    // but your snippet sets defaultValue to CURRENT_TIMESTAMP, so let's replicate that:
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  