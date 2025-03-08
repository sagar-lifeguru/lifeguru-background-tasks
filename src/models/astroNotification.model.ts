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
  
  // Import your referenced models (adjust paths accordingly)
  import User from './user.model';
  import Astrologer from './astrologer.model';
  import UserCall from './userCall.model';
  
  export type NotificationStatus = 'astro_missed' | 'notify' | 'user_left_waitlist';
  
  @Table({
    tableName: 'astro_notification',
    timestamps: false, // We'll define created_at & updated_at manually
  })
  export default class AstroNotification extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @AllowNull(false)
    @ForeignKey(() => Astrologer)
    @Column(DataType.INTEGER)
    astro_id!: number;
  
    @AllowNull(true)
    @ForeignKey(() => UserCall)
    @Column(DataType.INTEGER)
    user_call_id!: number;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_read!: boolean;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_vip_user!: boolean;
  
    @AllowNull(false)
    @Column(DataType.ENUM('astro_missed', 'notify', 'user_left_waitlist'))
    status!: NotificationStatus;
  
    @Default('chat')
    @Column(DataType.STRING)
    call_type!: string;
  
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  
    @BelongsTo(() => UserCall)
    userCall!: UserCall;
  
    @BelongsTo(() => User)
    user!: User;
  
    @BelongsTo(() => Astrologer)
    astrologer!: Astrologer;
  }
  