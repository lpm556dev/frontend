import React from 'react';

const TajwidGuide = () => {
  // Tajwid rules organized by categories exactly as in the screenshot
  const tajwidCategories = [
    {
      name: "Nun Sukun & Tanwin Rules:",
      rules: [
        { name: "Izhar", color: "#673AB7" },
        { name: "Idgham", color: "#3F51B5" },
        { name: "Iqlab", color: "#8BC34A" },
        { name: "Ikhfa", color: "#FF5722" }
      ]
    },
    {
      name: "Mim Sukun Rules:",
      rules: [
        { name: "Idgham Syafawi", color: "#00BCD4" },
        { name: "Ikhfa Syafawi", color: "#9E9E9E" },
        { name: "Izhar Syafawi", color: "#607D8B" }
      ]
    },
    {
      name: "Mad Rules:",
      rules: [
        { name: "Mad Thabii", color: "#4CAF50" },
        { name: "Mad Lazim", color: "#009688" },
        { name: "Mad Arid", color: "#CDDC39" },
        { name: "Mad Lin", color: "#03A9F4" }
      ]
    },
    {
      name: "Other Rules:",
      rules: [
        { name: "Qalqalah", color: "#FFC107" },
        { name: "Lafadz Allah", color: "#E91E63" },
        { name: "Tashdid", color: "#FF9800" },
        { name: "Ghunnah", color: "#F44336" },
        { name: "Sukun", color: "#9C27B0" },
        { name: "Tanwin", color: "#2196F3" },
        { name: "Tanda Waqaf", color: "#795548" }
      ]
    }
  ];

  return (
    <div className="tajwid-guide mb-6 p-4 bg-blue-50 rounded-md">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Panduan Tajwid:</h3>
      
      <div className="space-y-4">
        {tajwidCategories.map((category) => (
          <div key={category.name} className="tajwid-category">
            <h4 className="text-base font-medium text-gray-700 mb-2">{category.name}</h4>
            <div className="flex flex-wrap gap-6">
              {category.rules.map(rule => (
                <div key={rule.name} className="flex items-center">
                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: rule.color }}></span>
                  <span className="text-sm">{rule.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>Arahkan kursor pada teks untuk melihat aturan tajwid yang berlaku.</p>
      </div>
    </div>
  );
};

export default TajwidGuide;