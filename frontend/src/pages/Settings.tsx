import React, { useCallback, useState } from "react";
import { Card, Form } from "react-bootstrap";

import MultiRangeSlider from "../components/MultiRangeSlider/MultiRangeSlider";
import useLocalStorage from "../hooks/useLocalStorage";
import "./Settings.css";
import { getTotalExperience } from "../utils/getTotalExperience";

export const EXPERTISE_THRESHOLD_DEFAULT = [36, 72];
export const EXPERTISE_THRESHOLD_KEY = "expertiseThreshold";

export const SHOW_JOB_HOPPER_DEFAULT = true;
export const SHOW_JOB_HOPPER_KEY = "showJobHopper";

export const Settings = () => {
  const { getItem, setItem } = useLocalStorage(true);
  const [expertiseThreshold, setExpertiseThreshold] = useState(
    getItem(EXPERTISE_THRESHOLD_KEY) ?? EXPERTISE_THRESHOLD_DEFAULT
  );
  const [showJobHopper, setShowJobHopper] = useState(
    getItem(SHOW_JOB_HOPPER_KEY) ?? SHOW_JOB_HOPPER_DEFAULT
  );
  const handleChange = useCallback((splits: [number, number]) => {
    setExpertiseThreshold(splits);
    setItem(EXPERTISE_THRESHOLD_KEY, splits);
  }, []);

  const handleJobHopperSwitch = useCallback(
    (evt: any) => {
      setShowJobHopper(evt.target.checked);
      setItem(SHOW_JOB_HOPPER_KEY, evt.target.checked);
    },
    [setShowJobHopper]
  );

  return (
    <div className="d-flex flex-column p-4">
      <h3 className="mb-4">Settings</h3>

      <h4>Expertise levels</h4>
      <Card className="mb-4">
        <Card.Body>
          <div className="mb-2">
            Set your expertise levels in yers for each position degree
          </div>
          <div className="expertise-labels">
            <span>0</span>
            <span className="text-danger">Junior</span>
            <span className="ym">
              {getTotalExperience(expertiseThreshold[0], true)}
            </span>
            <span className="text-warning">Mid</span>
            <span className="ym">
              {getTotalExperience(expertiseThreshold[1], true)}
            </span>
            <span className="text-success">Senior</span>
            <span>+</span>
          </div>
          <div>
            <MultiRangeSlider
              min={0}
              max={100}
              thresholds={expertiseThreshold}
              onChange={handleChange}
            />
          </div>
        </Card.Body>
      </Card>

      <h4>Special tags</h4>
      <Card className="mb-4">
        <Card.Body>
          <div className="mb-2">
            Gives the options to create specifically crafted tags that do more
            things underneath.{" "}
            <span className="text-muted">
              (currently selectable predefined)
            </span>
          </div>
          <div className="d-flex gap-2">
            <Form.Check
              checked={showJobHopper}
              onChange={handleJobHopperSwitch}
              type="switch"
              label="Show Job Hopper tag"
            /> <span className="text-muted"> - Someone who has changed jobs recently</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
