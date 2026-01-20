import { prisma } from '../db';
import { Banner } from '@prisma/client';

/**
 * Banner Service
 * 
 * IMPORTANT: Banners are GLOBAL (not branch-specific)
 * - When admin uploads/updates a banner image, it affects ALL customers across ALL branches
 * - Banners are shared system-wide
 * - No branch filtering needed for banners
 */

interface BannerFilters {
  isActive?: boolean;
}

interface CreateBannerData {
  imageUrl: string;
  title?: string;
  description?: string;
  badge?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateBannerData {
  imageUrl?: string;
  title?: string;
  description?: string;
  badge?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class BannerService {
  /**
   * Get all banners with filters
   */
  static async getAllBanners(filters: BannerFilters = {}): Promise<Banner[]> {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });

    return banners;
  }

  /**
   * Get active banners for public display
   */
  static async getActiveBanners(): Promise<Banner[]> {
    return this.getAllBanners({ isActive: true });
  }

  /**
   * Get banner by ID
   */
  static async getBannerById(id: string): Promise<Banner | null> {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    return banner;
  }

  /**
   * Create new banner
   */
  static async createBanner(data: CreateBannerData): Promise<Banner> {
    // If displayOrder not provided, set it to max + 1
    if (data.displayOrder === undefined) {
      const maxOrder = await prisma.banner.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      data.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl: data.imageUrl,
        title: data.title,
        description: data.description,
        badge: data.badge,
        displayOrder: data.displayOrder,
        isActive: data.isActive ?? true,
      },
    });

    return banner;
  }

  /**
   * Update banner
   */
  static async updateBanner(id: string, data: UpdateBannerData): Promise<Banner> {
    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    return banner;
  }

  /**
   * Delete banner
   */
  static async deleteBanner(id: string): Promise<void> {
    await prisma.banner.delete({
      where: { id },
    });
  }

  /**
   * Reorder banners
   */
  static async reorderBanners(bannerIds: string[]): Promise<void> {
    // Update display order for each banner
    const updatePromises = bannerIds.map((id, index) =>
      prisma.banner.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle banner active status
   */
  static async toggleBannerStatus(id: string): Promise<Banner> {
    const banner = await this.getBannerById(id);
    if (!banner) {
      throw new Error('Banner not found');
    }

    return this.updateBanner(id, { isActive: !banner.isActive });
  }
}
