import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Unique,
    Default,
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'init_users',
    timestamps: true,
  })
  export default class InitUser extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    phone!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    otp!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    otp_expiry!: string;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    verified!: boolean;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  