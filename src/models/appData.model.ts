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
    tableName: 'app_data',
    timestamps: true, // Enables createdAt and updatedAt
  })
  export default class AppData extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: 'Life Guru',
    })
    app_name!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    app_slogan!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '0',
    })
    signup_bonus_amt!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    t_and_c!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    p_and_p!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    faq!: string;
  
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
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    cgst!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    sgst!: number;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    igst!: number;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: true,
    })
    sms_sender!: boolean;
  
    @Column({
      type: DataType.DECIMAL(10, 2),
      defaultValue: 0.0,
    })
    pg_charges!: number;
  }
  