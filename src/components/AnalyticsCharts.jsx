import React, { useState } from 'react';

// Status color palette
const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#0284c7',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444'
};

export const StatusDonutChart = ({ statusBreakdown = {} }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const statuses = [
    { key: 'PENDING', label: 'Pending', count: statusBreakdown.PENDING || 0, color: STATUS_COLORS.PENDING },
    { key: 'CONFIRMED', label: 'Confirmed', count: statusBreakdown.CONFIRMED || 0, color: STATUS_COLORS.CONFIRMED },
    { key: 'COMPLETED', label: 'Completed', count: statusBreakdown.COMPLETED || 0, color: STATUS_COLORS.COMPLETED },
    { key: 'CANCELLED', label: 'Cancelled', count: statusBreakdown.CANCELLED || 0, color: STATUS_COLORS.CANCELLED }
  ];

  const total = statuses.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No appointments recorded yet.
      </div>
    );
  }

  // Calculate SVG arc segments
  let cumulativeAngle = 0;
  const radius = 68;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  const segments = statuses.map(s => {
    const fraction = s.count / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;
    const percentage = Math.round(fraction * 100);

    return {
      ...s,
      strokeDasharray,
      strokeDashoffset,
      percentage
    };
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1rem 0' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <svg viewBox="0 0 180 180" width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          {segments.map(seg => (
            <circle
              key={seg.key}
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredSegment === seg.key ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredSegment(seg.key)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1 }}>
            {hoveredSegment
              ? statuses.find(s => s.key === hoveredSegment)?.count
              : total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
            {hoveredSegment
              ? statuses.find(s => s.key === hoveredSegment)?.label
              : 'Total Visits'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '160px' }}>
        {segments.map(s => (
          <div
            key={s.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              padding: '4px 8px',
              borderRadius: '8px',
              background: hoveredSegment === s.key ? '#f1f5f9' : 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredSegment(s.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: s.color }} />
              <span style={{ fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontWeight: 700 }}>{s.count}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({s.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendBarChart = ({ trends = [] }) => {
  const [activeBar, setActiveBar] = useState(null);

  if (!trends || trends.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No trend data available</div>;
  }

  const maxTotal = Math.max(...trends.map(t => t.total), 5);
  const chartHeight = 160;

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', minWidth: `${trends.length * 36}px`, height: `${chartHeight + 40}px` }}>
        {trends.map(t => {
          const heightPx = Math.max(8, (t.total / maxTotal) * chartHeight);
          const isHovered = activeBar === t.date;

          return (
            <div
              key={t.date}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setActiveBar(t.date)}
              onMouseLeave={() => setActiveBar(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: `${heightPx + 36}px`,
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>{t.label} ({t.date})</div>
                  <div>Total: <strong>{t.total}</strong></div>
                  <div>Done: <strong style={{ color: '#34d399' }}>{t.completed}</strong> | Cancel: <strong style={{ color: '#f87171' }}>{t.cancelled}</strong></div>
                </div>
              )}

              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '24px',
                  height: `${heightPx}px`,
                  background: isHovered
                    ? 'linear-gradient(180deg, #0284c7, #0d9488)'
                    : 'linear-gradient(180deg, #38bdf8, #0284c7)',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'scaleY(1.05)' : 'none',
                  transformOrigin: 'bottom'
                }}
              />

              {/* Label */}
              <div style={{ fontSize: '0.7rem', color: isHovered ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isHovered ? 700 : 500, marginTop: '8px', textAlign: 'center' }}>
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DepartmentDistributionChart = ({ departments = [] }) => {
  if (!departments || departments.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No department data</div>;
  }

  const maxCount = Math.max(...departments.map(d => d.appointmentCount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.5rem 0' }}>
      {departments.map(d => {
        const pct = Math.round((d.appointmentCount / maxCount) * 100);

        return (
          <div key={d.departmentId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{d.departmentName}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <strong>{d.appointmentCount}</strong> appts • {d.doctorCount} doctors
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(4, pct)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #0d9488)',
                  borderRadius: '5px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
