import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TestCalendar: React.FC = () => {
  const [range, setRange] = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });

  return (
    <div style={{ padding: 24, background: '#fff', zIndex: 9999 }}>
      <h2>Minimal Calendar Debug</h2>
      <DateRange
        ranges={[range]}
        onChange={item => {
          const sel = item.selection;
          setRange({
            startDate: sel.startDate || new Date(),
            endDate: sel.endDate || new Date(),
            key: 'selection',
          });
      
        }}
        rangeColors={["#7c3aed"]}
      />
      <div>
        <strong>Selected:</strong> {range.startDate.toDateString()} - {range.endDate.toDateString()}
      </div>
    </div>
  );
};

export default TestCalendar; 