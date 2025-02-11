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
} from 'sequelize-typescript';
import { literal } from 'sequelize';

@Table({
  tableName: 'astrologers',
  timestamps: true, // manages createdAt & updatedAt
})
export default class Astrologer extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  astro_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  display_name!: string;

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
  phone2!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  status!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  password!: string;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  experience!: number; // or string if you need exact decimal

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_expert!: boolean;

  @Column({
    type: DataType.CHAR(1200),
    defaultValue: null,
    allowNull: true,
  })
  bio!: string | null;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  profile_image!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  dob!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  gender!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  aadhar_no!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  aadhar_image!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  pan_no!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  pan_image!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_delete!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_busy!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  languages!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  categories!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  skills!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  bank_name!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  bank_account_type!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  bank_account_holder_name!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  bank_account_no!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  bank_ifsc!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  devicetoken!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  deviceid!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  devicetype!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  address!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  pincode!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quota_limit!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quota_used!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  wallet!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  commision!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_commission!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_voice_call_commission!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_chat!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  per_min_chat_mrp!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_chat!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_chat_online!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  gst!: string;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  rating!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  order_count!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  consultationTime!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  otp!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  otp_expiry!: string;

  @CreatedAt
  @Default(literal('CURRENT_TIMESTAMP'))
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  updatedAt!: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  country_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  state_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  city_id!: string;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_voice_call!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_voice_call_mrp!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_video_call!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_question_price!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_chat_usd!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_voice_call_usd!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_min_video_call_usd!: number;

  @Column({
    type: DataType.DECIMAL,
    defaultValue: 0,
  })
  per_question_price_usd!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_question!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_voice_call!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_video_call!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_voice_online!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_video_online!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  qualification!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_verified!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  tokenVersion!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  audio_languages!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  next_online_time!: Date | null;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  tds_rate!: number;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  state!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  app_version!: string;
}
