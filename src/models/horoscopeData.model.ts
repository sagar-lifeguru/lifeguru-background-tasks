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
    tableName: 'horoscope_data',
    timestamps: false,
    underscored: true,
  })
  export default class HoroscopeData extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING(50))
    sign!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING(50))
    period!: string;
  
    @AllowNull(true)
    @Column(DataType.STRING(50))
    horoscope_time!: string | null;
  
    @AllowNull(true)
    @Column(DataType.TEXT)
    horoscope_response!: string | null;
  
    @AllowNull(true)
    @Column(DataType.STRING(50))
    lang!: string | null;
  
    @AllowNull(true)
    @Column(DataType.DATE)
    horoscope_date!: Date | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    horoscope_week!: number | null;
  
    @AllowNull(true)
    @Column(DataType.STRING(50))
    horoscope_month!: string | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    horoscope_year!: number | null;
  
    @AllowNull(false)
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  