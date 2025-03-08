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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'kundli_profiles',
    timestamps: true,
  })
  export default class KundliProfile extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    name!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    gender!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    latitude!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    longitude!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    dateOfBirth!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    timeOfBirth!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    placeOfBirth!: string;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    isApprox!: boolean;
  }
  