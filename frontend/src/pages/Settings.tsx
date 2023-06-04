import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, ListGroup, Spinner } from "react-bootstrap";

import "./Resume.css";
import MultiRangeSlider from "../components/MultiRangeSlider/MultieRangeSlider";
import useLocalStorage from "../hooks/useLocalStorage";

const EXPERTISE_THRESHOLD_DEFAULT = [3, 6];
const EXPERTISE_THRESHOLD_KEY = "expertiseThreshold";

export const Settings = () => {
  const { getItem, setItem } = useLocalStorage(true);
  const [expertiseThreshold, setExpertiseThreshold] = useState(
    getItem(EXPERTISE_THRESHOLD_KEY) ?? EXPERTISE_THRESHOLD_DEFAULT
  );
  const handleChange = useCallback((splits: [number, number]) => {
    setExpertiseThreshold(splits);
    setItem(EXPERTISE_THRESHOLD_KEY, splits);
  }, []);
  return (
    <div className="d-flex flex-column p-4">
      <h3 className="mb-4">Settings</h3>

      <h4>Expertise levels</h4>
      <Card className="mb-4">
        <Card.Body>
          Junior | Mid | Senior
          <div>
            {/* <MultiRangeSlider
              min={0}
              max={20}
              thresholds={expertiseThreshold}
              onChange={handleChange}
            /> */}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
