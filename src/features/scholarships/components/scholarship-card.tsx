import { useState } from 'react';
import { Calendar, DollarSign, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface ScholarshipCardProps {
  id: string;
  title: string;
  location?: string;
  type?: string;
  tags?: string[];
  description: string;
  amount?: string;
  deadline?: string;
  requirements?: string[];
  isUrgent?: boolean;
  isSaved?: boolean;
  officialUrl?: string;
  onSave?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const ScholarshipCard = ({
  id,
  title,
  location,
  type,
  tags = [],
  description,
  amount,
  deadline,
  requirements = [],
  isUrgent = false,
  isSaved = false,
  officialUrl,
  onSave,
  onViewDetails,
}: ScholarshipCardProps) => {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  const handleOfficialSite = () => {
    if (officialUrl) {
      window.open(officialUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
            {isUrgent && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                Urgent
              </span>
            )}
          </div>
          
          {/* Location and Type */}
          {(location || type) && (
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
              {location && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{location}</span>
                </span>
              )}
              {type && (
                <span className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{type}</span>
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
        {description}
      </p>

      {/* Amount and Deadline */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {amount && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Amount</p>
              <p className="text-sm font-medium text-gray-900">{amount}</p>
            </div>
          </div>
        )}
        
        {deadline && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Deadline</p>
              <p className="text-sm font-medium text-gray-900">{deadline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      {requirements.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {requirements.map((req, index) => (
              <span
                key={index}
                className="bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-md border border-purple-200"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <Button
          variant="default"
          className="flex-1 bg-gray-900 hover:bg-gray-800 h-10"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'border-gray-300 h-10 w-10',
            saved && 'bg-purple-50 border-purple-300'
          )}
          onClick={handleSave}
        >
          <Bookmark
            className={cn(
              'w-4 h-4',
              saved ? 'fill-purple-600 text-purple-600' : 'text-gray-600'
            )}
          />
        </Button>
        
        {officialUrl && (
          <Button
            variant="outline"
            size="icon"
            className="border-gray-300 h-10 w-10"
            onClick={handleOfficialSite}
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};
