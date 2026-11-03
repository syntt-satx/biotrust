import React from 'react';

interface ThreatVectorData {
  axis: string;
  value: number; // 0 - 100
}

interface ThreatRadarChartProps {
  data?: ThreatVectorData[];
  title?: string;
}

export const ThreatRadarChart: React.FC<ThreatRadarChartProps> = ({
  data = [
    { axis: 'Poaching Pressure', value: 85 },
    { axis: 'Habitat Loss', value: 92 },
    { axis: 'Genetic Inbreeding', value: 78 },
    { axis: 'Pathogen / Disease', value: 45 },
    { axis: 'Climate Extremes', value: 68 }
  ],
  title = 'Species Threat Vector Radar'
}) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const count = data.length;

  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const r = (d.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, ...d };
  });

  const polygonPointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="cmd-card p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 mb-2 font-mono">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">{title}</h4>
        <span className="text-[10px] px-2 py-0.5 bg-[#E65F2B] text-white border border-[#1C1B18] font-bold">
          Vulnerability Matrix
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible">
        {/* Kraft Canvas Background */}
        <rect width={size} height={size} fill="#F9F6F0" />

        {/* Concentric grid rings */}
        {rings.map((factor, idx) => (
          <circle
            key={`ring_${idx}`}
            cx={center}
            cy={center}
            r={radius * factor}
            fill="none"
            stroke="#1C1B18"
            strokeWidth="1.2"
            strokeDasharray={factor < 1 ? "3 3" : undefined}
            opacity="0.35"
          />
        ))}

        {/* Spoke lines */}
        {points.map((p, idx) => {
          const spokeX = center + radius * Math.cos(p.angle);
          const spokeY = center + radius * Math.sin(p.angle);
          return (
            <line
              key={`spoke_${idx}`}
              x1={center}
              y1={center}
              x2={spokeX}
              y2={spokeY}
              stroke="#1C1B18"
              strokeWidth="1.2"
              opacity="0.4"
            />
          );
        })}

        {/* Forest Moss Polygon Fill */}
        <polygon
          points={polygonPointsStr}
          fill="#2C5E3B"
          fillOpacity="0.35"
          stroke="#1C1B18"
          strokeWidth="2"
        />

        {/* Data points & Alert Peaks */}
        {points.map((p, idx) => {
          const isHighAlert = p.value >= 80;
          return (
            <g key={`pt_${idx}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHighAlert ? 5.5 : 4}
                fill={isHighAlert ? '#E65F2B' : '#2C5E3B'}
                stroke="#1C1B18"
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={isHighAlert ? '#E65F2B' : '#1C1B18'}
                className="font-mono select-none"
              >
                {p.value}%
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        {points.map((p, idx) => {
          const labelDist = radius + 22;
          const labelX = center + labelDist * Math.cos(p.angle);
          const labelY = center + labelDist * Math.sin(p.angle);
          return (
            <text
              key={`lbl_${idx}`}
              x={labelX}
              y={labelY + 3}
              textAnchor={Math.abs(p.angle) < 0.2 ? 'start' : Math.abs(p.angle - Math.PI) < 0.2 ? 'end' : 'middle'}
              fontSize="10"
              fontWeight="bold"
              fill="#1C1B18"
              className="select-none tracking-tight font-mono"
            >
              {p.axis}
            </text>
          );
        })}
      </svg>

      <div className="w-full mt-3 flex items-center justify-center gap-5 text-[11px] font-mono text-[#1C1B18]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-[#2C5E3B] border border-[#1C1B18]"></span>
          <span>Susceptibility Envelope</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-[#E65F2B] border border-[#1C1B18]"></span>
          <span>Alert Peak (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};
