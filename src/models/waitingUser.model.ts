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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'waiting_users',
    timestamps: true, // Manages createdAt & updatedAt
  })
  export default class WaitingUser extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @Column(DataType.INTEGER)
    astro_id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    channelId!: string;
  
    @Column(DataType.INTEGER)
    user_calls_id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    call_type!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    fb_channelId!: string;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: true,
    })
    status!: boolean;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    is_delete!: boolean;
  
    // Timestamps: with timestamps: true,
    // we typically use @CreatedAt / @UpdatedAt decorators, but
    // your snippet sets explicit defaults for createdAt & updatedAt
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  