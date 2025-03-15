import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { FilterOptions, Sport } from '../types';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, locations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sport: 'all',
    location: '',
  });

  const sports: { value: Sport | 'all'; label: string }[] = [
    { value: 'all', label: 'Svi sportovi' },
    { value: 'football', label: 'Nogomet' },
    { value: 'basketball', label: 'Košarka' },
    { value: 'handball', label: 'Rukomet' },
    { value: 'tennis', label: 'Tenis' },
    { value: 'volleyball', label: 'Odbojka' },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = { sport: 'all', location: '' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-blue-500 font-medium"
        >
          <Filter size={18} className="mr-1" />
          Filtriraj utakmice
        </button>
        {(filters.sport !== 'all' || filters.location !== '') && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 flex items-center"
          >
            <X size={16} className="mr-1" />
            Očisti filtere
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport
              </label>
              <select
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {sports.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokacija
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sve lokacije</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
