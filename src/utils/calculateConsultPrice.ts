import PriceSlab from "../models/priceSlab.model";
import Slab from "../models/slab.model";
import UserCall from "../models/userCall.model";

import { Op } from "sequelize";

interface Astro {
    id: number;
    quota_limit: number;
    quota_used: number;
}

interface User {
    id: number;
}

interface ConsultPrices {
  price_per_consult: number;
  price_per_consult_mrp: number;
  astro_commission: number;
  slab_id: number;
}

const calculateConsultPrice = async (
  consultType: string,
  astro: Astro,
  user: User
): Promise<ConsultPrices | null> => {
  try {
    const consultCount = await UserCall.count({
      where: {
        userId: user.id,
        call_status: "ended",
        callDuration: { [Op.gt]: 0 },
      },
    });

    if (consultCount === 0 && astro.quota_limit !== 0 && astro.quota_limit <= astro.quota_used) {
      return null;
    }

    const slabResult = await Slab.findOne({
      where: {
        consult_type: consultType,
        is_delete: false,
        status: true,
        slab_limit: { [Op.gt]: consultCount },
        slab_type: "consult",
      },
      attributes: ["id"],
      order: [["slab_limit", "ASC"]],
    });

    if (!slabResult) return null;

    return await PriceSlab.findOne({
      where: {
        astro_id: astro.id,
        consult_type: consultType,
        slab_id: slabResult.id,
        is_delete: false,
        status: true,
      },
      attributes: [
        "price_per_consult",
        "price_per_consult_mrp",
        "astro_commission",
        "slab_id",
      ],
    })?.then((result) => result?.toJSON() as ConsultPrices) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default calculateConsultPrice;
