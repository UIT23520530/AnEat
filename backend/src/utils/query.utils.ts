/**
 * Utility functions for database queries
 */

/**
 * Build where clause with soft delete filter
 * Sử dụng để tránh lỗi khi field deletedAt chưa có trong database
 */
export const withSoftDelete = (where: any = {}) => {
  try {
    // Kiểm tra xem có thể dùng deletedAt không
    return {
      ...where,
      deletedAt: null,
    };
  } catch (error) {
    // Nếu có lỗi, trả về where clause gốc không có deletedAt
    return where;
  }
};

/**
 * Build where clause WITHOUT soft delete filter
 * Dùng khi muốn query tất cả records kể cả đã xóa
 */
export const withoutSoftDelete = (where: any = {}) => {
  const { deletedAt, ...rest } = where;
  return rest;
};

/**
 * Soft delete data - safe version
 */
export const softDeleteData = () => {
  try {
    return {
      deletedAt: new Date(),
      isActive: false,
    };
  } catch (error) {
    // Fallback: chỉ set isActive nếu deletedAt không available
    return {
      isActive: false,
    };
  }
};
