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
  
  @Table({
    tableName: 'livestream_events',
    timestamps: false,
  })
  export default class LivestreamEvent extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => Livestream)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    livestream_id!: number;
  
    @BelongsTo(() => Livestream)
    livestream?: Livestream;
  
    @Column({ type: DataType.STRING(255), allowNull: true })
    event_status!: string | null;
  
    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    user_id!: number | null;
  
    @BelongsTo(() => User)
    user?: User;
  
    @Column({ type: DataType.JSON, allowNull: true })
    webhook_response!: any;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    created_at!: Date;
  }
  