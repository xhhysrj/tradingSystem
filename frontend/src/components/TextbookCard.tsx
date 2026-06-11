import { Link } from 'react-router-dom';
import { Textbook } from '../types';
import { getTextbookImage } from '../lib/defaultImages';

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  const condition = textbook.bookCondition || textbook.condition || '';
  const imageUrl = getTextbookImage(textbook.images, textbook.id);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/3">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={textbook.title} 
              className="w-full h-full object-contain bg-white dark:bg-gray-600"
            />
          </div>
        </div>
        <div className="w-full md:w-2/3 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {textbook.title}
            </h3>
            <span className={`text-xl font-bold ${textbook.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {textbook.price === 0 ? '免费' : `¥${textbook.price}`}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            作者：{textbook.author}
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            适用课程：{textbook.courseName} ({textbook.courseCode})
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            适用专业：{textbook.applicableMajor}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs ${
              condition === '95新' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              condition === '9新' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
              condition === '8新' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              condition === '7新' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {condition}
            </span>
            <span className="ml-auto">
              发布者：{textbook.sellerName} ({textbook.sellerGrade}级 {textbook.sellerMajor})
            </span>
          </div>
          <div className="mt-auto">
            <Link
              to={`/textbook/${textbook.id}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              查看详情
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}