import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddMatchButton: React.FC = () => {
  return (
    <Link
      to="/add-match"
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-200"
      aria-label="Dodaj novu utakmicu"
    >
      <Plus size={24} />
    </Link>
  );
};

export default AddMatchButton;