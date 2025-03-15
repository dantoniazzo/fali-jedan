import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import type { Match } from '../types';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'football':
        return <div className="text-green-600">⚽</div>;
      case 'basketball':
        return <div className="text-orange-600">🏀</div>;
      case 'handball':
        return <Users className="text-blue-600" />;
      case 'tennis':
        return <div className="text-yellow-600">🎾</div>;
      case 'volleyball':
        return <div className="text-purple-600">🏐</div>;
      default:
        return <div className="text-gray-600">⚽</div>;
    }
  };

  const formattedDate = format(new Date(match.match_time), 'MMM d, yyyy');
  const formattedTime = format(new Date(match.match_time), 'HH:mm');

  return (
    <Link to={`/match/${match.id}`}>
      <div className="bg-gray-900 rounded-lg p-4 mb-3 hover:shadow-md hover:shadow-slate-800 hover:-translate-x-1 transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 text-2xl">{getSportIcon(match.sport)}</div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {match.team_a} vs {match.team_b}
              </h3>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <MapPin size={16} className="mr-1" />
                <span>
                  {match.venue}, {match.location}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">{formattedDate}</div>
            <div className="flex items-center justify-end text-sm text-white font-medium mt-1">
              <Clock size={16} className="mr-1 text-blue-600" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MatchCard;
