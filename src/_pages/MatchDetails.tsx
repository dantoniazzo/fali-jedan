import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MapView from '../components/Map';
import type { Match } from '../types';
import { User } from '@supabase/supabase-js';

interface Participant {
  id: string;
  user_id: string;
  match_id: string;
  created_at: string;
  full_name?: string;
  email?: string;
}

const MatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (!id) return;

        // Fetch match details
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setMatch(data as Match);

        // Check if user is already a participant
        if (currentUser) {
          const { data: participantData, error: participantError } =
            await supabase
              .from('match_participants')
              .select('*')
              .eq('match_id', id)
              .eq('user_id', currentUser.id);

          if (
            !participantError &&
            participantData &&
            participantData.length > 0
          ) {
            setIsParticipant(true);
          }
        }

        // Fetch participants
        await fetchParticipants(id);
      } catch (error) {
        console.error('Error fetching match:', error);
        setError(
          'Greška pri učitavanju detalja utakmice. Molimo pokušajte ponovno kasnije.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  const fetchParticipants = async (matchId: string) => {
    try {
      setLoadingParticipants(true);

      // Get all participants for this match
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('match_participants')
          .select('*')
          .eq('match_id', matchId);

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setParticipants([]);
        return;
      }

      // Get profiles for all participants
      const userIds = participantsData.map((p) => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine participant data with profile data
      const enrichedParticipants = participantsData.map((participant) => {
        const profile = profilesData?.find((p) => p.id === participant.user_id);
        return {
          ...participant,
          full_name: profile?.full_name || '',
          // We'll use the user's email from the current user if it matches
          email: user && user.id === participant.user_id ? user.email : '',
        };
      });

      setParticipants(enrichedParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'football':
        return <span className="text-green-600 text-3xl">⚽</span>;
      case 'basketball':
        return <span className="text-orange-600 text-3xl">🏀</span>;
      case 'handball':
        return <Users size={24} className="text-blue-600" />;
      case 'tennis':
        return <span className="text-yellow-600 text-3xl">🎾</span>;
      case 'volleyball':
        return <span className="text-purple-600 text-3xl">🏐</span>;
      default:
        return <span className="text-gray-600 text-3xl">⚽</span>;
    }
  };

  const handleJoinMatch = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/match/${id}` } });
      return;
    }

    try {
      setJoining(true);

      const { error } = await supabase.from('match_participants').insert({
        match_id: id!,
        user_id: user.id,
      });

      if (error) throw error;

      setIsParticipant(true);

      // Refresh participants list
      await fetchParticipants(id!);
    } catch (error) {
      console.error('Error joining match:', error);
      setError(
        'Greška pri pridruživanju utakmici. Molimo pokušajte ponovno kasnije.'
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Utakmica nije pronađena'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600"
        >
          <ArrowLeft size={18} className="mr-1" />
          Natrag na utakmice
        </button>
      </div>
    );
  }

  const formattedDate = format(
    new Date(match.match_time),
    'EEEE, d. MMMM yyyy.'
  );
  const formattedTime = format(new Date(match.match_time), 'HH:mm');

  return (
    <div className="mx-auto px-10 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600"
      >
        <ArrowLeft size={18} className="mr-1" />
        Natrag na utakmice
      </button>

      <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden text-white">
        <div className="p-6">
          <div className="flex items-center mb-4">
            {getSportIcon(match.sport)}
            <h1 className="text-2xl font-bold ml-2">
              {match.team_a} vs {match.team_b}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <Calendar size={20} className="text-gray-600 mr-2" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center mb-3">
                <Clock size={20} className="text-gray-600 mr-2" />
                <span>{formattedTime}</span>
              </div>

              <div className="flex items-center mb-3">
                <MapPin size={20} className="text-gray-600 mr-2" />
                <span>
                  {match.venue}, {match.location}
                </span>
              </div>

              {match.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-1">Opis</h3>
                  <p className="text-gray-400">{match.description}</p>
                </div>
              )}
            </div>

            <div>
              <MapView latitude={match.latitude} longitude={match.longitude} />
            </div>
          </div>

          {/* Participants Section */}
          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Users size={20} className="mr-2 text-blue-600" />
              Prijavljeni igrači ({participants.length})
            </h2>

            {loadingParticipants ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : participants.length === 0 ? (
              <p className="text-gray-400 italic">
                Još nema prijavljenih igrača. Budite prvi!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center p-3 bg-gray-800 rounded-md"
                  >
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Users size={18} className="text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">
                        {user?.id === participant.user_id
                          ? 'Vi'
                          : participant.full_name
                          ? participant.full_name
                          : participant.email || 'Igrač'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pridružio se{' '}
                        {format(new Date(participant.created_at), 'd.MM.yyyy.')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            {isParticipant ? (
              <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md flex items-center">
                <Users size={20} className="mr-2" />
                Pridružili ste se ovoj utakmici!
              </div>
            ) : (
              <button
                onClick={handleJoinMatch}
                disabled={joining}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                {joining ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Pridruživanje...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Users size={20} className="mr-2" />
                    Pridruži se utakmici
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
