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
    tableName: 'transactions',
    timestamps: true,
  })
  export default class Transaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    txnid!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    requestId!: string;
  
    @Column({ type: DataType.STRING, defaultValue: 'initiated' })
    status!: string;
  
    @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
    state!: string;
  
    @Column(DataType.STRING)
    code!: string | null;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    user_phone!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    user_type!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    calltype!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    channelId!: string;
  
    @AllowNull(false)
    @Column(DataType.DECIMAL)
    ammount!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    txn_type!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    txn_by!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    title!: string;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_settled!: boolean;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    invoice_id!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recharge_type!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    paymentmode!: string;
  
    @Column(DataType.DATE)
    expiry_date!: Date | null;
  
    @Column({ type: DataType.DECIMAL, defaultValue: '0' })
    available_balance!: number;
  
    @Column(DataType.JSON)
    response_data!: any;
  
    @Column(DataType.JSONB)
    price_breakup!: any;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  