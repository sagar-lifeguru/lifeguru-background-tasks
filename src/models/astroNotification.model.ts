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
  
  @Table({
    tableName: 'astro_notification',
    timestamps: false, // We'll define created_at & updated_at manually
  })
  export default class AstroNotifications extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    })
    user_id!: number;
  
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
    astro_id!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    // user_call_id has belongsTo(UserCall), but no explicit "references" in your snippet
    @ForeignKey(() => UserCall)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    user_call_id!: number | null;
  
    @BelongsTo(() => UserCall)
    userCall?: UserCall;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    is_read!: boolean;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    is_vip_user!: boolean;
  
    @AllowNull(false)
    @Column({
      type: DataType.ENUM('astro_missed', 'notify'),
    })
    status!: 'astro_missed' | 'notify';
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'chat',
    })
    call_type!: string;
  
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  