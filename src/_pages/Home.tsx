import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MatchCard from '../components/MatchCard';
import FilterBar from '../components/FilterBar';
import AddMatchButton from '../components/AddMatchButton';
import type { Match, FilterOptions } from '../types';

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);

        // Check if Supabase is properly configured
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          throw new Error('Supabase environment variables are missing');
        }

        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('match_time', { ascending: true });

        if (error) throw error;

        if (data) {
          setMatches(data as Match[]);
          setFilteredMatches(data as Match[]);

          // Extract unique locations
          const uniqueLocations = [
            ...new Set(data.map((match) => match.location)),
          ];
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError(
          'Greška pri učitavanju utakmica. Molimo pokušajte ponovno kasnije.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...matches];

    if (filters.sport !== 'all') {
      filtered = filtered.filter((match) => match.sport === filters.sport);
    }

    if (filters.location) {
      filtered = filtered.filter(
        (match) => match.location === filters.location
      );
    }

    setFilteredMatches(filtered);
  };

  return (
    <div className="mx-auto px-10 py-6 ">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Nadolazeće utakmice
      </h1>

      <FilterBar onFilterChange={handleFilterChange} locations={locations} />

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>
            Nema pronađenih utakmica. Pokušajte prilagoditi filtere ili dodajte
            novu utakmicu.
          </p>
        </div>
      ) : (
        <div>
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      <AddMatchButton />
    </div>
  );
};

export default Home;
