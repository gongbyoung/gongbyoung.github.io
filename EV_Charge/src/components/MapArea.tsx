/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Compass, Navigation } from 'lucide-react';
import { ChargingStation } from '../types';

interface MapAreaProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  setSelectedStation: (station: ChargingStation | null) => void;
  lang: 'ko' | 'en';
  onStartCharging: (station: ChargingStation) => void;
  favorites: string[];
}

export default function MapArea({
  stations,
  selectedStation,
  setSelectedStation,
  lang,
  onStartCharging,
  favorites
}: MapAreaProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Center map on selected station when it changes
  useEffect(() => {
    if (selectedStation) {
      // Map standard coordinates around Seoul (approx 37.4, 127.0) to SVG viewbox coords
      const mapCoords = getSVGCoords(selectedStation.lat, selectedStation.lng);
      // Center SVG coords in standard 800x600 viewbox
      const targetPanX = 400 - mapCoords.x * zoom;
      const targetPanY = 300 - mapCoords.y * zoom;
      setPan({ x: targetPanX, y: targetPanY });
    }
  }, [selectedStation, zoom]);

  // Convert GPS coordinates of Korea (lat/lng) to SVG 1000x800 coordinate system
  function getSVGCoords(lat: number, lng: number) {
    // Standard scale for Seoul Seocho/Gangnam (centered around lat 37.52, lng 126.98)
    // Map bounds:
    // Min Lat: 37.44, Max Lat: 37.60
    // Min Lng: 126.85, Max Lng: 127.12
    const minLat = 37.44;
    const maxLat = 37.60;
    const minLng = 126.85;
    const maxLng = 127.12;

    // Scale linearly to width 1000, height 800
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    // Note: Lat goes up, SVG Y goes down, so invert
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 800;

    // Guard bounds just in case there are cities outside of Seoul (like Busan, Daegu)
    // For stations far away, let's scatter them nicely inside the map area
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      // Hash-based pseudorandom coordinate within safe boundaries for out-of-Seoul stations
      const pseudoX = (Math.abs(Math.sin(lat) * 100000) % 700) + 150;
      const pseudoY = (Math.abs(Math.cos(lng) * 100000) % 500) + 150;
      return { x: pseudoX, y: pseudoY };
    }

    return { x, y };
  }

  // Mouse drag panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetLocation = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedStation(null);
  };

  return (
    <section className="flex-1 relative bg-[#c0dfee] overflow-hidden select-none border-b border-[#c3c6d2] md:border-b-0">
      {/* Zoom and Navigation controls on upper right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white border border-[#c3c6d2] rounded-lg shadow-md flex items-center justify-center text-[#002e60] hover:bg-[#d9f2ff] active:scale-95 transition-all cursor-pointer"
          title={lang === 'ko' ? '확대' : 'Zoom In'}
        >
          <Plus size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white border border-[#c3c6d2] rounded-lg shadow-md flex items-center justify-center text-[#002e60] hover:bg-[#d9f2ff] active:scale-95 transition-all cursor-pointer"
          title={lang === 'ko' ? '축소' : 'Zoom Out'}
        >
          <Minus size={18} />
        </button>
        <button
          onClick={handleResetLocation}
          className="w-10 h-10 mt-2 bg-white border border-[#c3c6d2] rounded-lg shadow-md flex items-center justify-center text-[#002e60] hover:bg-[#d9f2ff] active:scale-95 transition-all cursor-pointer"
          title={lang === 'ko' ? '기본 위치' : 'Reset Map'}
        >
          <Compass size={18} />
        </button>
      </div>

      {/* Legend overlay in lower left */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
        <div className="bg-white/95 backdrop-blur-sm border border-[#c3c6d2] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#006e1c]"></span>
            <span className="font-bold text-[#001f2a]">{lang === 'ko' ? '충전 가능' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
            <span className="font-bold text-[#001f2a]">{lang === 'ko' ? '충전 중' : 'In Use'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#737782]"></span>
            <span className="font-bold text-[#001f2a]">{lang === 'ko' ? '점검 중' : 'Maintenance/Offline'}</span>
          </div>
        </div>
      </div>

      {/* Start charging FAB in lower right */}
      {selectedStation && (
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => onStartCharging(selectedStation)}
            className="bg-[#006e1c] hover:bg-[#005313] text-white py-3.5 px-6 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
          >
            <Navigation size={18} className="fill-current" />
            <span>
              {lang === 'ko'
                ? `${selectedStation.nameKo.split(' ')[0]}에서 즉시 충전`
                : `Start Charging at ${selectedStation.name.split(' ')[0]}`}
            </span>
          </button>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ touchAction: 'none' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
          className="transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* DEFINITIONS for gradients, filters and glow effects */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b0d9f0" strokeWidth="1" />
            </pattern>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#004488" floodOpacity="0.15" />
            </filter>
            <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND AND GRID LAYER */}
          <rect width="1000" height="800" fill="#f4faff" />
          <rect width="1000" height="800" fill="url(#grid)" />

          {/* MOUNTAINS / PARKS / GREENERY */}
          {/* Namsan Park */}
          <ellipse cx="500" cy="280" rx="140" ry="80" fill="#c9e7f7" opacity="0.6" />
          <ellipse cx="500" cy="280" rx="90" ry="50" fill="#CEEDFD" opacity="0.8" />
          <text x="500" y="285" fill="#002e60" fontSize="12" fontWeight="700" textAnchor="middle" opacity="0.6">
            {lang === 'ko' ? '남산 공원' : 'Namsan Mountain Park'}
          </text>

          {/* Dream Forest Park (Buk서울) */}
          <circle cx="750" cy="120" r="70" fill="#c9e7f7" opacity="0.5" />
          <text x="750" y="125" fill="#002e60" fontSize="11" fontWeight="600" textAnchor="middle" opacity="0.5">
            {lang === 'ko' ? '북서울 꿈의숲' : 'Dream Forest'}
          </text>

          {/* Banpo Hangang Park */}
          <ellipse cx="480" cy="480" rx="110" ry="40" fill="#c9e7f7" opacity="0.7" />
          <text x="480" y="485" fill="#002e60" fontSize="10" fontWeight="600" textAnchor="middle" opacity="0.6">
            {lang === 'ko' ? '반포 한강공원' : 'Banpo Hangang Park'}
          </text>

          {/* Gwanaksan Mountain (South) */}
          <path d="M 200 780 Q 350 720 500 780" fill="none" stroke="#CEEDFD" strokeWidth="60" strokeLinecap="round" opacity="0.4" />
          <text x="350" y="760" fill="#002e60" fontSize="12" fontWeight="700" textAnchor="middle" opacity="0.5">
            {lang === 'ko' ? '관악산 도시자연공원' : 'Gwanaksan Mountain Park'}
          </text>


          {/* HAN RIVER LAYER */}
          <path
            d="M -50,420 C 200,410 350,460 500,450 C 650,440 750,380 1050,400"
            fill="none"
            stroke="#c0dfee"
            strokeWidth="54"
            strokeLinecap="round"
          />
          <path
            d="M -50,420 C 200,410 350,460 500,450 C 650,440 750,380 1050,400"
            fill="none"
            stroke="#a9c7ff"
            strokeWidth="38"
            strokeLinecap="round"
            opacity="0.7"
          />
          <text x="250" y="435" fill="#002e60" fontSize="13" fontWeight="bold" letterSpacing="0.1em" opacity="0.4">
            {lang === 'ko' ? '한강 (Han River)' : 'HAN RIVER'}
          </text>


          {/* ROADS / HIGHWAYS GRID */}
          {/* Olympic Highway */}
          <path
            d="M -50,445 C 200,435 350,485 500,475 C 650,465 750,405 1050,425"
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
            opacity="0.9"
          />
          <path
            d="M -50,445 C 200,435 350,485 500,475 C 650,465 750,405 1050,425"
            fill="none"
            stroke="#004488"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Gangnam-daero (North-South) */}
          <path d="M 520,380 L 520,850" fill="none" stroke="#ffffff" strokeWidth="12" opacity="0.9" />
          <path d="M 520,380 L 520,850" fill="none" stroke="#c3c6d2" strokeWidth="1" />

          {/* Teheranno (West-East) */}
          <path d="M 200,580 L 800,580" fill="none" stroke="#ffffff" strokeWidth="10" opacity="0.9" />
          <path d="M 200,580 L 800,580" fill="none" stroke="#c3c6d2" strokeWidth="1" />

          {/* Sejong-daero & Jongno */}
          <path d="M 380,50 L 380,300 L 950,300" fill="none" stroke="#ffffff" strokeWidth="10" opacity="0.9" />
          <path d="M 380,50 L 380,300 L 950,300" fill="none" stroke="#c3c6d2" strokeWidth="1" />

          {/* Mapo-daero */}
          <path d="M 120,440 L 320,300" fill="none" stroke="#ffffff" strokeWidth="8" opacity="0.9" />


          {/* BRIDGES */}
          {/* Mapo Bridge */}
          <rect x="180" y="415" width="20" height="40" transform="rotate(20, 190, 435)" fill="#737782" rx="2" />
          {/* Banpo Bridge */}
          <rect x="505" y="430" width="16" height="45" fill="#737782" rx="2" />


          {/* MAJOR LANDMARKS / LABELS */}
          <g opacity="0.6">
            <rect x="340" y="100" width="80" height="24" rx="4" fill="#ffffff" stroke="#c3c6d2" />
            <text x="380" y="116" fill="#001f2a" fontSize="10" fontWeight="bold" textAnchor="middle">
              {lang === 'ko' ? '종로/경복궁' : 'Jongno / Palace'}
            </text>

            <rect x="520" y="520" width="60" height="20" rx="4" fill="#ffffff" stroke="#c3c6d2" />
            <text x="550" y="534" fill="#001f2a" fontSize="9" fontWeight="bold" textAnchor="middle">
              {lang === 'ko' ? '강남역' : 'Gangnam'}
            </text>

            <rect x="140" y="510" width="60" height="20" rx="4" fill="#ffffff" stroke="#c3c6d2" />
            <text x="170" y="524" fill="#001f2a" fontSize="9" fontWeight="bold" textAnchor="middle">
              {lang === 'ko' ? '여의도' : 'Yeouido'}
            </text>
          </g>


          {/* DISTRICT BOUNDARY LINES (Decorative) */}
          <path
            d="M 450,50 L 450,230 C 450,300 350,350 350,420 L 350,800"
            fill="none"
            stroke="#002e60"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.1"
          />


          {/* CHARGING STATION PINS */}
          {stations.map((station) => {
            const coords = getSVGCoords(station.lat, station.lng);
            const isSelected = selectedStation?.id === station.id;
            const isFav = favorites.includes(station.id);

            // Determine status color
            let pinColor = '#006e1c'; // Available
            if (station.status === 'in_use') pinColor = '#ba1a1a';
            if (station.status === 'offline' || station.status === 'maintenance') pinColor = '#737782';

            return (
              <g
                key={station.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStation(station);
                }}
                className="cursor-pointer group"
                filter="url(#shadow)"
              >
                {/* Glow ring around selected marker */}
                {isSelected && (
                  <circle
                    cx={coords.x}
                    cy={coords.y - 15}
                    r={24}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="3.5"
                    className="animate-pulse"
                    opacity="0.6"
                  />
                )}

                {/* Pin base hover ring */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={12}
                  fill={pinColor}
                  opacity="0"
                  className="group-hover:opacity-20 transition-all duration-300"
                />

                {/* SVG Pin geometry */}
                <path
                  d={`M ${coords.x} ${coords.y} 
                     C ${coords.x - 14} ${coords.y - 14} ${coords.x - 14} ${coords.y - 32} ${coords.x} ${coords.y - 34} 
                     C ${coords.x + 14} ${coords.y - 32} ${coords.x + 14} ${coords.y - 14} ${coords.x} ${coords.y}`}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-transform duration-300 group-hover:translate-y-[-3px]"
                />

                {/* Inner white circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y - 20}
                  r={8}
                  fill="#ffffff"
                  className="transition-transform duration-300 group-hover:translate-y-[-3px]"
                />

                {/* Center plug lightning symbol */}
                <path
                  d={`M ${coords.x - 2} ${coords.y - 24} L ${coords.x + 2} ${coords.y - 21} L ${coords.x - 3} ${coords.y - 18} L ${coords.x + 3} ${coords.y - 15}`}
                  fill="none"
                  stroke={pinColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-y-[-3px]"
                />

                {/* Floating mini heart icon for favorites */}
                {isFav && (
                  <path
                    d={`M ${coords.x + 10} ${coords.y - 38} 
                        c -1.5,-1.5 -3.5,0 -3.5,0 
                        c 0,0 -2,-1.5 -3.5,0 
                        c -1.5,1.5 0,3.5 0,3.5 
                        l 3.5,3.5 
                        l 3.5,-3.5 
                        c 0,0 1.5,-2 0,-3.5 z`}
                    fill="#ba1a1a"
                    stroke="#ffffff"
                    strokeWidth="1"
                    transform={`scale(0.8) translate(${(coords.x + 8) * 0.25}, ${(coords.y - 38) * 0.25})`}
                  />
                )}

                {/* Popover Station Name Tooltip on hover */}
                <g
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  transform={`translate(${coords.x}, ${coords.y - 45})`}
                >
                  <rect
                    x="-65"
                    y="-28"
                    width="130"
                    height="26"
                    rx="6"
                    fill="#001f2a"
                    opacity="0.9"
                  />
                  <polygon points="0,0 -6,-6 6,-6" fill="#001f2a" opacity="0.9" />
                  <text
                    x="0"
                    y="-11"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {lang === 'ko' ? station.nameKo.split(' ')[0] : station.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* SIMULATED USER'S GEOLOCATION PIN */}
          <g filter="url(#shadow)">
            {/* Pulsing radar waves */}
            <circle cx="510" cy="530" r="16" fill="none" stroke="#004488" strokeWidth="2" opacity="0.4" className="animate-ping" />
            <circle cx="510" cy="530" r="10" fill="#002e60" opacity="0.2" />
            {/* White boundary ring */}
            <circle cx="510" cy="530" r="7" fill="#ffffff" />
            {/* Core blue dot */}
            <circle cx="510" cy="530" r="4" fill="#002e60" />
          </g>
        </svg>
      </div>
    </section>
  );
}
