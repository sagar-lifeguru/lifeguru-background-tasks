import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  @Table({
    tableName: 'invoices',
    timestamps: true,
  })
  export default class Invoice extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    invoice_no!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    txnid!: string;
  
    @AllowNull(false)
    @Column(DataType.DATE)
    start_date!: Date;
  
    @AllowNull(false)
    @Column(DataType.DATE)
    end_date!: Date;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_name!: string;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    recipient_id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_type!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_gstin!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_address!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_state!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_tds_rate!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    recipient_pan!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    supplier_gstin!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    supplier_address!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    total_amount!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    txns_count!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    taxable_amount!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    sgst!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    cgst!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    igst!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    total_tax!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    invoice_amount!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    tds_amount!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    settlement_amount!: string;
  
    @Column(DataType.STRING)
    pg_charges_amount!: string | null;
  
    @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0.0 })
    pg_charges!: number;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  