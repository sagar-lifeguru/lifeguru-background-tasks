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
  status: string;
  call: {
    call_status: string;
    user_status: string;
    startTime: string;
  };
  user: any;
  astrologer: any;
}
