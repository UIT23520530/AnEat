import { prisma } from '../db';
import { BannerStatus } from '@prisma/client';

export interface Banner {
  id: string;
  title: string | null;
  description: string | null;
  image: string;
  link: string | null;
  order: number;
  status: BannerStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service layer for Banner operations
 */
export class BannerService {
  /**
   * Get all active banners ordered by display order
   */
  static async getActiveBanners(): Promise<Banner[]> {
    const banners = await prisma.banner.findMany({
      where: {
        status: BannerStatus.ACTIVE,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return banners;
  }

  /**
   * Get all banners (for admin)
   */
  static async getAllBanners(): Promise<Banner[]> {
    const banners = await prisma.banner.findMany({
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
      ],
    });

    return banners;
  }
}
