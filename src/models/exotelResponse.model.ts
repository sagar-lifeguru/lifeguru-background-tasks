import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import UserCall from './userCall.model';
  
  @Table({
    tableName: 'exotel_response',
    timestamps: false,
  })
  export default class ExotelResponse extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING(70))
    CallSid!: string;
  
    @Column(DataType.STRING(70))
    Status!: string | null;
  
    @Column(DataType.STRING(15))
    To!: string | null;
  
    @Column(DataType.STRING(15))
    From!: string | null;
  
    @Column(DataType.DATE)
    StartTime!: Date | null;
  
    @Column(DataType.DATE)
    EndTime!: Date | null;
  
    @Column(DataType.STRING(255))
    RecordingUrl!: string | null;
  
    @Column(DataType.INTEGER)
    ConversationDuration!: number | null;
  
    @Column(DataType.TEXT)
    data!: string | null;
  
    @ForeignKey(() => UserCall)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_call_id!: number;
  
    @BelongsTo(() => UserCall)
    userCall?: UserCall;
  }
  