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
    tableName: 'wallet_offers',
    timestamps: true, // Manages createdAt & updatedAt
  })
  export default class WalletOffer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    amount!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    offer_amount!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    type!: string; // percent / fixed
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    min_amount_for_offer!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    title!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    start_date!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    end_date!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    coupon_code!: string;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    promo_validity!: number;
  
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
  
    // Timestamps: We replicate your snippet's default values for createdAt and updatedAt
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  