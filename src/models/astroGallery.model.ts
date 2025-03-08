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
    tableName: 'astro_gallaries',
    timestamps: true, // Manages createdAt & updatedAt
  })
  export default class AstroGallary extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    astro_id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    type!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    src!: string;
  
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
}

// If needed in the future, you could define a "media" field as an ARRAY of JSONB:
// @Column({
//   type: DataType.ARRAY(DataType.JSONB),
//   allowNull: false,
// })
// media!: any[];
  