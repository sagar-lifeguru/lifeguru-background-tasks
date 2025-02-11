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
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  import Astrologer from './astrologer.model';
  import User from './user.model';
  
  @Table({
    tableName: 'notify_users',
    timestamps: true,
    updatedAt: false,
  })
  export default class NotifyUser extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => Astrologer)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers',
        key: 'id',
      },
    })
    astro_id!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    })
    user_id!: number;
  
    @BelongsTo(() => User)
    user?: User;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    notified!: boolean;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    call_notified!: boolean;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    livestream_notified!: boolean;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_delete!: boolean;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  }
  