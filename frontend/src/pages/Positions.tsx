import React from "react";
import { Badge, Card } from "react-bootstrap";

import "./Positions.css";
import { useNavigate } from "react-router";
import { createSearchParams } from "react-router-dom";

const positions = [
  {
    title: "Senior React Developer",
    subtitle: "Remote, EMEA",
    tags: ["senior", "react", "redux", "agile"],
    exp: "senior",
  },
  {
    title: "QA Engineer",
    subtitle: "Riga, Latvia",
    tags: ["Cypress", "Automated tests", "Jenkins"],
    exp: "",
  },
  {
    title: "Junior Web Developer",
    subtitle: "Riga, Latvia",
    tags: ["javascript", "html", "css"],
    exp: "junior",
  },
];

export const Positions = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h3>Positions</h3>
      <div>
        {positions.map((position, index) => (
          <Card
            key={`psoition-${index}`}
            className="mb-2 pointer"
            onClick={() =>
              navigate({
                pathname: "resumes",
                search: `?${createSearchParams({
                  title: position.title,
                  tags: JSON.stringify(position.tags),
                  exp: position.exp,
                })}`,
              })
            }
          >
            <Card.Body>
              <Card.Title>{position.title}</Card.Title>
              <Card.Subtitle>{position.subtitle}</Card.Subtitle>
              <Card.Text className="d-flex gap-2 mt-2 flex-wrap">
                {position.exp ? (
                  <Badge pill bg="success" key={`tag-${index}`}>
                    {position.exp}
                  </Badge>
                ) : null}
                {position.tags.map((tag, index) => (
                  <Badge pill bg="primary" key={`tag-${index}`}>
                    {tag}
                  </Badge>
                ))}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
        <Card
          className="mb-2 pointer"
          onClick={() =>
            navigate({
              pathname: "resumes",
            })
          }
        >
          <Card.Body>
            <Card.Title>Try Custom Tags</Card.Title>
            <Card.Subtitle></Card.Subtitle>
            <Card.Text className="d-flex gap-2 mt-2"></Card.Text>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
