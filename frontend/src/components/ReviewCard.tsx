import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-solid fa-star ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <i className="fa-solid fa-user text-blue-600 dark:text-blue-400"></i>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {review.isAnonymous ? '匿名用户' : review.reviewerName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        {renderStars(review.rating)}
      </div>

      {review.content && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {review.content}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className={`px-2 py-1 rounded-full ${
          review.reviewType === 'buyer_to_seller'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
        }`}>
          {review.reviewType === 'buyer_to_seller' ? '来自买家评价' : '来自卖家评价'}
        </span>
      </div>
    </div>
  );
}
