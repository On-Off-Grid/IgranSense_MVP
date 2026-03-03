import { useState } from 'react';
import { useFarm } from '../context/FarmContext';

/**
 * Slim top header bar — fixed at top of viewport.
 * Shows logo + "IgranSense" on the left, farm selector on the right,
 * and a hamburger button for mobile sidebar toggle.
 *
 * Props:
 *  - onHamburgerClick — callback to toggle the mobile sidebar drawer
 */
export default function Header({ onHamburgerClick }) {
  const { selectedFarm, farms, selectFarm, hasMultipleFarms } = useFarm();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const handleFarmSelect = (farm) => {
    selectFarm(farm);
    setFarmDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-slate-800 border-b border-slate-700 px-4 flex items-center justify-between">
      {/* Left: logo + title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5 -ml-1 text-slate-300 hover:text-white transition-colors"
          onClick={onHamburgerClick}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <span className="text-2xl">🌱</span>
        <h1 className="text-xl font-bold text-white tracking-tight">IgranSense</h1>
      </div>

      {/* Right: farm selector */}
      <div className="flex items-center gap-4">
        {hasMultipleFarms && selectedFarm && (
          <div className="relative">
            <button
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600
                         rounded-lg text-white text-sm transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                selectedFarm.status === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="max-w-[150px] truncate">{selectedFarm.name}</span>
              <svg className={`w-4 h-4 transition-transform ${farmDropdownOpen ? 'rotate-180' : ''}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Farm Dropdown */}
            {farmDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700
                             rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Select Farm</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {farms.map(farm => (
                    <button
                      key={farm.id}
                      onClick={() => handleFarmSelect(farm)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors
                                 flex items-center gap-3 ${
                                   selectedFarm?.id === farm.id ? 'bg-slate-700/50' : ''
                                 }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        farm.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{farm.name}</p>
                        <p className="text-slate-400 text-xs truncate">{farm.location}</p>
                      </div>
                      <span className="text-slate-500 text-xs">{farm.fieldCount} fields</span>
                      {selectedFarm?.id === farm.id && (
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
