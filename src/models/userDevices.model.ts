import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Default,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  import User from './user.model'; // Adjust import path to your actual User model file
  
  @Table({
    tableName: 'user_devices',
    timestamps: true, // Will automatically track createdAt and updatedAt
  })
  export default class UserDevices extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users', // actual table name
        key: 'id',
      },
    })
    user_id!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    deviceSerial!: string;
  
    // Because timestamps=true, we could rely on @CreatedAt and @UpdatedAt, 
    // but let's mirror your snippet with explicit default values:
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  