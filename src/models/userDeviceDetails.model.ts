import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Default,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  import User from './user.model'; // Adjust import path to match your project structure
  
  @Table({
    tableName: 'user_device_details',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class UserDeviceDetails extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users', // The actual DB table for users
        key: 'id',
      },
    })
    user_id!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    otp!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    otp_expiry!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    device_type!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    token_version!: string;
  
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
  
    // Timestamps: by default, with timestamps=true,
    // you could use @CreatedAt / @UpdatedAt, but let's
    // replicate your snippet's usage with defaultValue
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  