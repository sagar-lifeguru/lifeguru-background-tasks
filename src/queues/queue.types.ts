import { UUID } from "crypto";
import Astrologer from "../models/astrologer.model";
import User from "../models/user.model";
import UserCall from "../models/userCall.model";

export interface EmailMessage {
  type: 'child-astrology-success' | 'pooja-success' | 'pooja-failed';
  userName: string;
  userPhone: string;
  paymentStatus: string;
  productName: string;
  amount: number;
  requestId: string;
}

export interface WaitlistMessage {
  callType: string;
  channelId: string;
  userId: number;
  astroId: UUID;
}
