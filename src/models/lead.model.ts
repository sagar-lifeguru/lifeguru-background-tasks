import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'leads',
    timestamps: false,
  })
  export default class Lead extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING(15))
    phone!: string;
  
    @Column(DataType.STRING(15))
    otp!: string | null;
  
    @Column(DataType.STRING(50))
    otp_expiry!: string | null;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    verified!: boolean;
  
    @Column(DataType.STRING(255))
    entry_point!: string | null;
  
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  