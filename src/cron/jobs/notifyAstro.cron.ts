import { logger } from '../../utils/logger';
import Astrologer from '../../models/astrologer.model';
import AstrologerOnlineReport from '../../models/astrologerOnlineReport.model';
import { Op } from 'sequelize';
import moment from 'moment';
import sendNotification from '../../utils/sendNotification';

export const NotifyAstro = {
  schedule: '*/5 * * * *',
  name: 'notifyAstro',

  async execute(): Promise<void> {
    logger.info('Running notifyAstro cron job');
    
    try {
      const notificationTimeDurations: number[] = process.env.NOTIFY_ASTRO_TIME_DIFF?.split(",").map(item => +item) || [];
      console.log(notificationTimeDurations, "notificationTimeDurations----->");
  
      const astrologers = await Astrologer.findAll({
        where: {
          is_delete: false,
          status: true,
          is_verified: true,
          next_online_time: { [Op.ne]: null },
        },
      });
      console.log("NOTIFY ASTROs>>>>", astrologers.length);
  
      if (!astrologers.length) return;
  
      for (const astro of astrologers) {
        const astroOnlineRec = await AstrologerOnlineReport.findOne({
          where: {
            astro_id: astro.id,
            actual_online_time: null,
          },
          order: [["createdAt", "DESC"]],
        });
  
        const currentTime = moment().add(5, 'hours').add(30, 'minutes');
        const onlineTime = moment(astro.next_online_time);
        const timeDiff = moment.duration(onlineTime.diff(currentTime));
  
        console.log(
          "onlineTime ",
          onlineTime.format(),
          "currentTime ",
          currentTime.format(),
          "time diff: ",
          timeDiff.asMinutes(),
          " env value: ",
          process.env.NOTIFY_ASTRO_TIME_DIFF
        );
  
        if (astro.is_chat_online || astro.is_voice_online) {
          console.log("delete next online time");
          astro.next_online_time = null;
          await astro.save();
        } else {
          const timeDiffMinutes = timeDiff.asMinutes();
          if (timeDiffMinutes > 0 && notificationTimeDurations.includes(Math.round(timeDiffMinutes))) {
            const NotifyAstro = {
              notification_type: "Online",
              title: "LifeGuru",
              body: "Your online scheduled time is approaching.",
            };
            await sendNotification(astro.devicetoken, NotifyAstro);
            if (astroOnlineRec) {
              astroOnlineRec.notified = true;
              await astroOnlineRec.save();
            }
            console.log(`${astro.display_name} is notified`);
          } else if (timeDiffMinutes <= 0) {
            astro.next_online_time = null;
            await astro.save();
          }
        }
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }
}
