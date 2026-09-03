import { Request } from 'express';

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Standardized pagination parameters extraction from request
 */
export const getPaginationParams = (req: Request) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  
  // Cap the limit to prevent huge queries
  const cappedLimit = Math.min(limit, 100);
  
  const offset = (page - 1) * cappedLimit;
  
  return { page, limit: cappedLimit, offset };
};

/**
 * Helper to build standard pagination response
 */
export const buildPaginatedResponse = <T>(
  data: T[], 
  total: number, 
  page: number, 
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  };
};
