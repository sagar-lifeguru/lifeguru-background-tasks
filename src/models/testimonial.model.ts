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
    tableName: 'testimonials',
    timestamps: true,
  })
  export default class Testimonial extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    name!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    feedback!: string;
  
    @Column({ type: DataType.DECIMAL, defaultValue: 0 })
    rating!: number;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    user_image!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    user_age!: string;
  
    @Column({ type: DataType.STRING, defaultValue: '' })
    user_location!: string;
  
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
  