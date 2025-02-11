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
  import Astrologer from './astrologer.model'; // Adjust import path as needed
  
  @Table({
    tableName: 'user_fcm_token',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class UserFcmToken extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    // user_id is allowNull: true, no explicit references are given in the snippet
    @AllowNull(true)
    @Column(DataType.INTEGER)
    user_id!: number | null;
  
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
  
    // Because timestamps=true, typically you'd do @CreatedAt / @UpdatedAt,
    // but your snippet uses specific default values:
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  