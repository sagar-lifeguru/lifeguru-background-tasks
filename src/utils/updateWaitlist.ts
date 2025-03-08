import WaitingUser from '../models/waitingUser.model';
import UserCall from '../models/userCall.model';
import User from '../models/user.model';
import Astrologer from '../models/astrologer.model';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';
import { removeWaitlistQueue } from '../queues/producer/waitlistQueue';

interface NotificationPayload {
  notification_type: string;
  firebaseChId: string;
  channelId: string;
  title: string;
  body: string;
}

const updateWaitlist = async (
  call: UserCall,
  astrologer: Astrologer,
  status: string
): Promise<void> => {
  try {
    let waitlistCall: WaitingUser | null = null;
    
    if (call.callType === 'chat') {
      waitlistCall = await WaitingUser.findOne({ 
        where: { channelId: call.channelId, status: true } 
      });
    } else if (call.callType === 'call') {
      waitlistCall = await WaitingUser.findOne({ 
        where: { user_calls_id: call.id, status: true } 
      });
    }
    
    console.log("inside update waitlist fun: ", waitlistCall, call.id, call.channelId);    
    if (waitlistCall) {
      waitlistCall.status = false;
      await waitlistCall.save();
    }
    
    let waitingList: WaitingUser[] = await WaitingUser.findAll({ 
      where: { astro_id: astrologer.id, status: true } 
    });
    
    let ongoingCallAstro = await UserCall.findOne({
      where: {
        astroId: astrologer.id,
        call_status: { [Op.in]: ['initiated', 'in_progress', 'hold'] }
      }
    });
    
    if (waitingList.length <= 0 && !ongoingCallAstro) {
      astrologer.is_busy = false;
      await astrologer.save();
    }
    
    if (waitingList && waitingList.length) {
      if(waitingList[0].call_type === 'chat'){ 
        await removeWaitlistQueue({astroId: astrologer.astro_id, userId: waitingList[0].user_id, channelId: waitingList[0].channelId, callType:waitingList[0].call_type}, 180000);
      } else if(waitingList[0].call_type === 'call'){
          await removeWaitlistQueue({astroId: astrologer.astro_id, userId: waitingList[0].user_id, channelId: waitingList[0].channelId, callType:waitingList[0].user_calls_id}, 180000);
      }
      // waitingList.forEach(async (wl: WaitingUser) => {
      //   let wl_user: User | null = await User.findByPk(wl.user_id);
      //   if (wl_user) {
      //     const waitListNotice: NotificationPayload = {
      //       notification_type: 'waitlist_updated',
      //       firebaseChId: wl.fb_channelId,
      //       channelId: wl.channelId!,
      //       title: "LifeGuru",
      //       body: 'Your waitlist position is updated',
      //     };
      //     // await sendNotification(wl_user.device_token, waitListNotice);
      //   }
      // });
    }
  } catch (error) {
    console.log("end chat error log: ", error);
    logger.error('Error in endChat:', error);
    throw error;
  }
};

export default updateWaitlist;
