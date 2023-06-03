import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Spinner } from "react-bootstrap";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";
import { useParams } from "react-router";

export const Resume = () => {
  const { id } = useParams<{
    id: string;
  }>();
  const [resume, setResume] = useState<IResume | undefined>();
  const [isFetching, setIsFetching] = useState(false);
  const { error, readResume } = useResumeStore((state) => ({
    error: state.error,
    readResume: state.readResume,
  }));

  const getResume = useCallback(async () => {
    if (!isFetching) {
      setIsFetching(true);
      // should be fail safe, as API error is cathed already, if it fails it should kill the app
      const data = await readResume(id as string);
      setResume(data);
      setIsFetching(false);
    }
  }, [isFetching, id, setResume, setIsFetching]);

  useEffect(() => {
    getResume();
  }, []); // load initial view, thus empty deps list

  return (
    <div className="d-flex flex-column p-4">
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : isFetching ? (
        <Spinner animation="border" variant="primary" />
      ) : !resume?.resume_id ? (
        <p>No resumes found</p>
      ) : (
        <>
          <h3>
            Candidate <b>{resume.name}</b>
          </h3>
          <Card>
            <Card.Title>Summary</Card.Title>
            <Card.Body>{resume?.summary}</Card.Body>
          </Card>
          <Card>
            <Card.Title>Experience</Card.Title>
            <Card.Body>
              {resume.experience.map((experience, index) => (
                <div key={index}>
                  {`${experience.position} @ ${experience.company} for ${experience.duration}`}
                </div>
              ))}
            </Card.Body>
          </Card>
          <Card>
            <Card.Title>Technologies</Card.Title>
            <Card.Body>
              {resume.technologies.map((tech, index) => (
                <Badge pill bg="secondary" key={index}>
                  {tech}
                </Badge>
              ))}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};
