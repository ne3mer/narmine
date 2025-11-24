import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface RatingStats {
  productId: string;
  rating: number;
  reviewCount: number;
  timestamp: number;
}

// Cache to store ratings and avoid redundant fetches
// Key: productId, Value: RatingStats
const ratingCache = new Map<string, RatingStats>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProductRating(productId: string | undefined) {
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = ratingCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRating(cached.rating);
      setReviewCount(cached.reviewCount);
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/stats?gameId=${productId}`); // Keeping query param as gameId for backend compatibility if needed, or change to productId if backend updated
        if (response.ok) {
          const data = await response.json();
          setRating(data.averageRating || 0);
          setReviewCount(data.totalReviews || 0);
          
          // Update cache
          ratingCache.set(productId, {
            productId,
            rating: data.averageRating || 0,
            reviewCount: data.totalReviews || 0,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Failed to fetch rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [productId]);

  const refetch = async () => {
    if (!productId) return;
    invalidateRatingCache(productId);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/stats?gameId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setRating(data.averageRating || 0);
        setReviewCount(data.totalReviews || 0);
        
        ratingCache.set(productId, {
          productId,
          rating: data.averageRating || 0,
          reviewCount: data.totalReviews || 0,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to refetch rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return { rating, reviewCount, loading, refetch };
}

// Hook for multiple products
export function useProductRatings(productIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, { rating: number; reviewCount: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (productIds.length === 0) return;

    const fetchRatings = async () => {
      setLoading(true); // Set loading to true when starting fetch
      try {
        // Fetch ratings for all products
        const promises = productIds.map(async (productId) => {
          // Check cache first
          const cached = ratingCache.get(productId);
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached;
          }

          try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/stats?gameId=${productId}`);
            if (response.ok) {
              const data = await response.json();
              const result = {
                productId,
                rating: data.averageRating || 0,
                reviewCount: data.totalReviews || 0,
                timestamp: Date.now()
              };
              // Update cache
              ratingCache.set(productId, result);
              return result;
            }
          } catch (error) {
            console.error(`Failed to fetch rating for ${productId}:`, error);
          }
          
          return { productId, rating: 0, reviewCount: 0, timestamp: Date.now() };
        });

        const results = await Promise.all(promises);
        
        const ratingsMap: Record<string, { rating: number; reviewCount: number }> = {};
        results.forEach(result => {
          ratingsMap[result.productId] = {
            rating: result.rating,
            reviewCount: result.reviewCount
          };
        });

        setRatings(ratingsMap);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productIds.join(',')]); // Re-fetch when productIds change

  return { ratings, loading };
}

// Function to invalidate cache for a specific product
export function invalidateRatingCache(productId: string) {
  ratingCache.delete(productId);
}
