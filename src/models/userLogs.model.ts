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
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import User from './user.model'; // Adjust the path to match your project
  
  @Table({
    tableName: 'users_logs',
    timestamps: true,       // Enables automatic createdAt & updatedAt
    createdAt: 'createdAt', // Maps to the createdAt column
    updatedAt: 'updatedAt', // Maps to the updatedAt column
  })
  export default class UsersLogs extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users', // the actual DB table
        key: 'id',
      },
    })
    user_id!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @AllowNull(false)
    @Column({
      type: DataType.ENUM('Android', 'IOS', 'Web', 'Mweb'),
    })
    device_type!: 'Android' | 'IOS' | 'Web' | 'Mweb';
  
    @AllowNull(false)
    @Column({
      type: DataType.ENUM('Login', 'Logout'),
    })
    event_type!: 'Login' | 'Logout';
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    app_version!: string;
  
    // Because timestamps: true and we mapped createdAt: 'createdAt', updatedAt: 'updatedAt',
    // we can decorate them as @CreatedAt / @UpdatedAt.
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  