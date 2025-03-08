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
    tableName: 'quick_chat_stmts',
    timestamps: true,
  })
  export default class QuickChatStmt extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    text!: string;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    status!: boolean;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_delete!: boolean;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  