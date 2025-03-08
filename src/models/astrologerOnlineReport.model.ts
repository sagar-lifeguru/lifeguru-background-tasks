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
  import Astrologer from './astrologer.model'; // or wherever your Astrologer model is located
  
  @Table({
    tableName: 'astrologer_online_report',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class AstrologerOnlineReport extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    // If you have an Astrologer TS model, you can set up a foreign key
    @ForeignKey(() => Astrologer)
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER,
      references: {
        model: 'astrologers', // the actual table name
        key: 'id',
      },
    })
    astro_id!: number;
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer; // Optional property for TypeScript associations
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: false,
    })
    notified!: boolean;
  
    @AllowNull(true)
    @Column(DataType.DATE)
    scheduled_online_time!: Date | null;
  
    @AllowNull(true)
    @Column(DataType.DATE)
    actual_online_time!: Date | null;
  
    // Because timestamps=true, typically you'd use @CreatedAt/@UpdatedAt decorators.
    // But your snippet uses defaultValue: DataTypes.NOW, so we'll replicate that here:
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  