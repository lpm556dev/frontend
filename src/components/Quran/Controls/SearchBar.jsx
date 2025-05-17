import React from 'react';

const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="flex">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Cari di Al-Qur'an"
        className="flex-1 appearance-none border border-gray-300 rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
        aria-label="Search Quran"
      />
      <button
        type="submit"
        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
        aria-label="Search"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;