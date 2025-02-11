import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    Unique,
  } from 'sequelize-typescript';
  
  @Table({
    tableName: 'temples',
    timestamps: false,
    underscored: true,
  })
  export default class Temple extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING(255))
    name!: string;
  
    @Column(DataType.TEXT)
    description!: string | null;
  
    @Column(DataType.TEXT)
    temple_img!: string | null;
  
    @AllowNull(false)
    @Column({
      type: DataType.STRING(15),
      validate: {
        isIn: [['draft', 'published', 'deleted']],
      },
    })
    status!: string;
  
    @Unique
    @Column(DataType.TEXT)
    slug!: string | null;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_delete!: boolean;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  