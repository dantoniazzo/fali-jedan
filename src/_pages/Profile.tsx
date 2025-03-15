import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, Calendar, Edit } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import type { Match } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createdMatches, setCreatedMatches] = useState<Match[]>([]);
  const [joinedMatches, setJoinedMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        
        try {
          setLoading(true);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (!profileError && profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
          }
          
          // Fetch matches created by the user
          const { data: createdData, error: createdError } = await supabase
            .from('matches')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('match_time', { ascending: true });
            
          if (createdError) throw createdError;
          setCreatedMatches(createdData as Match[]);
          
          // Fetch matches joined by the user
          const { data: joinedData, error: joinedError } = await supabase
            .from('match_participants')
            .select('match_id')
            .eq('user_id', currentUser.id);
            
          if (joinedError) throw joinedError;
          
          if (joinedData && joinedData.length > 0) {
            const matchIds = joinedData.map(item => item.match_id);
            
            const { data: matchesData, error: matchesError } = await supabase
              .from('matches')
              .select('*')
              .in('id', matchIds)
              .order('match_time', { ascending: true });
              
            if (matchesError) throw matchesError;
            setJoinedMatches(matchesData as Match[]);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth:', error);
        setLoading(false);
        navigate('/login');
      }
    };
    
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSavingProfile(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      setProfile({
        ...profile,
        full_name: fullName
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <User size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unesite svoje ime"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                  >
                    {savingProfile ? 'Spremanje...' : 'Spremi'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h1 className="text-xl font-bold">
                    {profile?.full_name || user?.email}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <LogOut size={18} className="mr-1" />
            Odjava
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('created')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar size={18} className="inline-block mr-1" />
              Kreirane utakmice
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'joined'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User size={18} className="inline-block mr-1" />
              Pridružene utakmice
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {activeTab === 'created' ? (
            createdMatches.length > 0 ? (
              <div>
                {createdMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Još niste kreirali nijednu utakmicu.</p>
                <button
                  onClick={() => navigate('/add-match')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Kreirajte svoju prvu utakmicu
                </button>
              </div>
            )
          ) : (
            joinedMatches.length > 0 ? (
              <div>
                {joinedMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Još se niste pridružili nijednoj utakmici.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Pregledajte utakmice
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;