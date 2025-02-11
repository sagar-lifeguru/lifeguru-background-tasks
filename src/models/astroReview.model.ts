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
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  
  // Adjust import paths for your User and Astrologer models
  import User from './user.model';
  import Astrologer from './astrologer.model';
  
  @Table({
    tableName: 'astro_reviews',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class AstroReview extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    channelId!: string;
  
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers', // DB table name
        key: 'id',
      },
    })
    astro_id!: number;
  
    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'users', // DB table name
        key: 'id',
      },
    })
    user_id!: number;
  
    // BelongsTo associations if you want to access the related models
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @BelongsTo(() => User)
    user?: User;
  
    @AllowNull(false)
    @Default(0)
    @Column(DataType.FLOAT)
    rating!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    rating_text!: string;
  
    @Column({
      type: DataType.TEXT,
      defaultValue: '',
      allowNull: true,
    })
    review_text!: string | null;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    options!: string;
  
    // Timestamps: By default, with timestamps:true, you'd use @CreatedAt/@UpdatedAt,
    // but your snippet sets explicit default values:
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  