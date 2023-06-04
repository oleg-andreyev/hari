import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, ListGroup, Spinner } from "react-bootstrap";

import "./Resume.css";

export const Settings = () => {
  return (
    <div className="d-flex flex-column p-4">
      <h3 className="mb-4">Settings</h3>

      <h4>Expertise levels</h4>
      <Card className="mb-4">
        <Card.Body>
          Junior | Mid | Senior
        </Card.Body>
      </Card>
    </div>
  );
};
