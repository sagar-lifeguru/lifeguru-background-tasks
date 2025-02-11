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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  import Astrologer from './astrologer.model';
  
  @Table({
    tableName: 'astro_fcm_token',
    timestamps: true,
  })
  export default class AstroFcmToken extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    user_id!: number | null;
  
    // If you want a proper FK to Astrologer:
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers', // table name
        key: 'id',
      },
    })
    astro_id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    firebaseChannelId!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    channelId!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    status!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    notification!: string;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  