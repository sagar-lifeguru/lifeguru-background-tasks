export interface EmailMessage {
  type: 'child-astrology-success' | 'pooja-success' | 'pooja-failed';
  userName: string;
  userPhone: string;
  paymentStatus: string;
  productName: string;
  amount: number;
  requestId: string;
}
