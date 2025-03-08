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
    AllowNull,
    ForeignKey,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  // If you have a Role model, import it here. Example:
  // import Role from './role.model';
  
  @Table({
    tableName: 'admins',
    timestamps: true, // Enable createdAt & updatedAt
  })
  export default class Admin extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    admin_name!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    email!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    phone!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    password!: string;
  
    // If you have a Role model, you can annotate this:
    // @ForeignKey(() => Role)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'roles', // table name
        key: 'id',
      },
    })
    role_id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    profile_image!: string;
  
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
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  