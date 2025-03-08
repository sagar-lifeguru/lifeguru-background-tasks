import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    Default,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
  } from 'sequelize-typescript';
  import Astrologer from './astrologer.model'; // or wherever your Astrologer model is located
  
  @Table({
    tableName: 'astrologer_pricing',
    timestamps: true,  // automatically manages created_at & updated_at
    underscored: true, // uses snake_case in DB columns
  })
  export default class AstrologerPricing extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    // If you have an Astrologer model, you can define a foreign key relationship
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers', // table name
        key: 'id',
      },
    })
    astro_id!: number;
  
    // If you'd like to access the related Astrologer instance:
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_video_mrp!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_video_price!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    astro_video_commission!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_audio_mrp!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_audio_price!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    astro_audio_commission!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_anonymous_mrp!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    livestream_anonymous_price!: number | null;
  
    @AllowNull(true)
    @Column(DataType.INTEGER)
    astro_anonymous_commission!: number | null;
  
    // With timestamps:true & underscored:true, 
    // Sequelize will map createdAt -> created_at
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    created_at!: Date;
  
    // Same for updatedAt -> updated_at
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updated_at!: Date;
  }
  