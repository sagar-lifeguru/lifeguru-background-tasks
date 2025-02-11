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
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  // Import related models (adjust the paths to your project structure)
  import User from './user.model';
  import Astrologer from './astrologer.model';
  
  @Table({
    tableName: 'user_calls',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class UserCall extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    channelId!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    firebaseChId!: string;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    })
    userId!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers',
        key: 'id',
      },
    })
    astroId!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @Column(DataType.STRING)
    startTime!: string | null;
  
    @Column(DataType.STRING)
    endTime!: string | null;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    reason!: string;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    callDuration!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    holdDuration!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    callType!: string; // e.g. 'chat', 'audio', 'video'
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    is_free_consultation!: boolean;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    perMinCharge!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    maxMinute!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    prevMaxMinute!: number;
  
    @Column({
      type: DataType.TEXT,
      defaultValue: '',
    })
    kundli_male!: string;
  
    @Column({
      type: DataType.TEXT,
      defaultValue: '',
    })
    kundli_female!: string;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    unread_async_message_count!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'initiated',
    })
    status!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'initiated',
    })
    call_status!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'waiting',
    })
    user_status!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'waiting',
    })
    astro_status!: string;
  
    @Column(DataType.STRING)
    device_type!: string | null;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'INR',
    })
    currency!: string;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    lowBalanceNotified!: boolean;
  
    @Column(DataType.DECIMAL)
    astro_commission!: string | number | null;
  
    @Column(DataType.STRING)
    recording_url!: string | null;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    is_delete!: boolean;
  
    // Timestamps enabled => use @CreatedAt and @UpdatedAt
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    astrologer_app_version!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    user_app_version!: string;
  }
  