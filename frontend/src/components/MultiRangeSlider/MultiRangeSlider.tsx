import React, { useCallback, useEffect, useState, useRef } from "react";
import "./MultiRangeSlider.css";

const MultiRangeSlider: React.FC<{
  min: number;
  max: number;
  thresholds: [number, number]; // TODO update types to match min/max margins
  onChange(thresholds: [number, number]): void;
}> = ({ min, max, onChange, thresholds }) => {
  const [minVal, setMinVal] = useState(Math.max(min, thresholds[0]));
  const [maxVal, setMaxVal] = useState(Math.min(max, thresholds[1]));
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: any) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    onChange([minVal, maxVal]);
  }, [minVal, maxVal, onChange]);

  return (
    <div className="slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          minValRef.current = value;
        }}
        className="thumb thumb--left"
        style={{ zIndex: minVal > max - 100 ? 5 : 1 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          maxValRef.current = value;
        }}
        className="thumb thumb--right"
      />

      <div className="slider">
        <div className="slider-track" />
        <div
          className="slider-track-right"
          style={{
            left: `calc(${getPercent(maxVal)}% - 3px)`,
          }}
        />
        <div ref={range} className="slider-range" />
      </div>
    </div>
  );
};

export default MultiRangeSlider;
