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
  import UserCall from './userCall.model';
  
  @Table({
    tableName: 'chat_summaries',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  })
  export default class ChatSummary extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    channel_id!: string;
  
    @ForeignKey(() => UserCall)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'userCall',
        key: 'id',
      },
    })
    user_call_id!: number;
  
    @BelongsTo(() => UserCall)
    userCall?: UserCall;
  
    @AllowNull(false)
    @Column(DataType.STRING(20))
    summary_lang!: string;
  
    @Column(DataType.TEXT)
    summary!: string | null;
  
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  