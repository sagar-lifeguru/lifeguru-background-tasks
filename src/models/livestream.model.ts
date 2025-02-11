import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Default,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import Astrologer from './astrologer.model';
  
  @Table({
    tableName: 'livestreams',
    timestamps: false,
  })
  export default class Livestream extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.STRING(255), allowNull: true })
    title!: string;
  
    @Column({ type: DataType.TEXT, allowNull: true })
    description!: string;
  
    @ForeignKey(() => Astrologer)
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
      references: { model: 'astrologers', key: 'id' },
    })
    astro_id!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @Column({ type: DataType.STRING, allowNull: true })
    channel_id!: string;
  
    @Column({ type: DataType.TEXT, allowNull: true })
    paused_time!: string;
  
    @Column({ type: DataType.TEXT, allowNull: true })
    live_token!: string;
  
    @Column({ type: DataType.STRING, allowNull: true })
    chat_id!: string;
  
    @Column({ type: DataType.STRING(50), allowNull: true })
    status!: string;
  
    @Column({ type: DataType.DATE, allowNull: true })
    start_date!: Date;
  
    @Column({ type: DataType.DATE, allowNull: true })
    end_date!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  