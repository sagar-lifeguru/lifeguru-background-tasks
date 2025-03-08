import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  CreatedAt,
  AllowNull,
} from 'sequelize-typescript';
import { literal } from 'sequelize';

/**
 * EXACT MATCH TO:
 *   module.exports = User; // user.js
 *   tableName: "users", timestamps: true, updatedAt: false
 */
@Table({
  tableName: 'users',
  timestamps: true, // enables 'createdAt'
  updatedAt: false, // do NOT maintain 'updatedAt'
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  user_name!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  email!: string;

  @Unique
  @Column({
    type: DataType.STRING,
    // The original JS model does not specify a default for phone
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  dob!: string;

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

  @Column({
    type: DataType.STRING,
    defaultValue: '', // male, female, other
  })
  gender!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  referral_code!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '0',
  })
  wallet!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  status!: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  profile_image!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  time_of_birth!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  place_of_birth!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  social_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  social_type!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'INR',
  })
  currency!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '91',
  })
  country_code!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  device_id!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  device_type!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  device_token!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_delete!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_guest!: boolean;

  // Per the snippet: createdAt is a DATE, defaultValue: CURRENT_TIMESTAMP
  @CreatedAt
  @Default(literal('CURRENT_TIMESTAMP'))
  @Column(DataType.DATE)
  createdAt!: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  tokenVersion!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  activity_status!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  imei_no!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  app_version!: string;
}
