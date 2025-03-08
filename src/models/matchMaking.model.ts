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
  import { literal } from 'sequelize';
  import KundliProfile from './kundliProfile.model';
  
  @Table({
    tableName: 'match_makings',
    timestamps: true,
  })
  export default class MatchMaking extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.INTEGER)
    user_id!: number;
  
    @ForeignKey(() => KundliProfile)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    profile1!: number;
  
    @ForeignKey(() => KundliProfile)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    profile2!: number;
  
    @Default('')
    @Column(DataType.STRING)
    data!: string;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_delete!: boolean;
  
    @CreatedAt
    @Default(literal('CURRENT_TIMESTAMP'))
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    @BelongsTo(() => KundliProfile, { foreignKey: 'profile1' })
    kundliProfile1?: KundliProfile;
  
    @BelongsTo(() => KundliProfile, { foreignKey: 'profile2' })
    kundliProfile2?: KundliProfile;
  }
  