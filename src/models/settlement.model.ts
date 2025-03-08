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
  
  @Table({
    tableName: 'settlements',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class Settlement extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    invoice_id!: number;
  
    @Default(null)
    @Column(DataType.DATE)
    settlement_date!: Date | null;
  
    @AllowNull(false)
    @Column(DataType.DECIMAL(10, 2))
    settlement_amount!: number;
  
    @Default('Not Settled')
    @Column(
      DataType.ENUM('Not Settled', 'Settled')
    )
    settlement_status!: 'Not Settled' | 'Settled';
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: true,
    })
    status!: boolean;
  
    @Default(null)
    @Column(DataType.STRING)
    utr_number!: string | null;
  
    // Because timestamps: true, @CreatedAt & @UpdatedAt will map to createdAt & updatedAt.
    @CreatedAt
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  