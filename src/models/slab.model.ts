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
  } from 'sequelize-typescript';
  
  @Table({
    tableName: 'slabs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  })
  export default class Slab extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.INTEGER)
    slab_limit!: number;
  
    @Column(
      DataType.ENUM('chat', 'call', 'video')
    )
    consult_type!: 'chat' | 'call' | 'video' | null;
  
    @Default(true)
    @Column(DataType.BOOLEAN)
    status!: boolean;
  
    @Default(false)
    @Column(DataType.BOOLEAN)
    is_delete!: boolean;
  
    /**
     * Note: There's a mismatch here. The snippet shows:
     *   slab_type: { type: DataTypes.ENUM("consult", "recharge"), defaultValue: false }
     * This is contradictory because 'false' is not in the ENUM set.
     * Possibly they intended defaultValue: 'consult'.
     * We'll replicate the snippet literally, but be aware this might cause runtime errors.
     */
    // @Default(false as any) // Casting to any, because 'false' is not in the ENUM
    @Column(
      DataType.ENUM('consult', 'recharge')
    )
    slab_type!: 'consult' | 'recharge';
  
    @CreatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  }
  