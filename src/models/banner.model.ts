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
  
  // If you have a Slab model, you can import it and annotate the slab_id foreign key
  // import Slab from './slab.model'; // Adjust the path to your Slab model if it exists
  
  @Table({
    tableName: 'banners',
    timestamps: true, // manages createdAt & updatedAt
  })
  export default class Banner extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    banner_image!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    category_type!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    title!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    redirect_url!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    start_date!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    end_date!: string;
  
    @Column({
      type: DataType.INTEGER,
      defaultValue: 0,
    })
    priority!: number;
  
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
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;
  
    @UpdatedAt
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    updatedAt!: Date;
  
    // Deprecated fields
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    type!: string;
  
    @Column({
      type: DataType.STRING,
      defaultValue: '',
    })
    banner_link!: string;
  
    // If you have a Slab model, you can set up a FK relationship here
    // @ForeignKey(() => Slab)
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
      // If you want to strictly reference the "slabs" table:
      // references: {
      //   model: 'slabs', // DB table name
      //   key: 'id',
      // },
    })
    slab_id!: number | null;
  
    // @BelongsTo(() => Slab)
    // slab?: Slab;
  }
  