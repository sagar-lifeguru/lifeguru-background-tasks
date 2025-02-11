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
  import Livestream from './livestream.model';
  import User from './user.model';
  import Astrologer from './astrologer.model';
  
  @Table({
    tableName: 'livestream_calls',
    timestamps: false,
  })
  export default class LivestreamCall extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => Livestream)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: { model: 'livestreams', key: 'id' },
    })
    livestream_id!: number;
  
    @BelongsTo(() => Livestream)
    livestream?: Livestream;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: { model: 'users', key: 'id' },
    })
    user_id!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: { model: 'astrologers', key: 'id' },
    })
    astro_id!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @AllowNull(false)
    @Column(DataType.DATE)
    start_time!: Date;
  
    @AllowNull(true)
    @Column(DataType.DATE)
    end_time!: Date | null;
  
    @AllowNull(true)
    @Column(DataType.TEXT)
    reason!: string | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    call_duration!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    max_minute!: number | null;
  
    @AllowNull(true)
    @Column(DataType.STRING)
    call_type!: string | null;
  
    @AllowNull(true)
    @Column(DataType.JSON)
    kundali_ids!: any;
  
    @AllowNull(true)
    @Column(DataType.STRING)
    call_status!: string | null;
  
    @AllowNull(true)
    @Column(DataType.STRING)
    astro_status!: string | null;
  
    @AllowNull(true)
    @Column(DataType.STRING)
    user_status!: string | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    per_min_price!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    astro_commission_per_min!: number | null;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    created_at!: Date;
  }
  