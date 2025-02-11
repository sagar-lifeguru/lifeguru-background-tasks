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
  } from 'sequelize-typescript';
  import { literal } from 'sequelize';
  import Astrologer from './astrologer.model'; // Adjust the import to match your project
  
  @Table({
    tableName: 'astrologer_status_logs',
    timestamps: false, // No automatic createdAt/updatedAt
  })
  export default class AstrologerStatusLogs extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
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
  
    @BelongsTo(() => Astrologer)
    astrologer?: Astrologer;
  
    @AllowNull(false)
    @Column({
      type: DataType.ENUM(
        'logged in',
        'logged out',
        'chat online',
        'chat offline',
        'audio call online',
        'audio call offline',
        'forced audio call offline',
        'forced chat offline'
      ),
    })
    status!: string;
  
    // No timestamps => define a manual "created_at" with default CURRENT_TIMESTAMP
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    created_at!: Date;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    app_version!: string;
  }
  