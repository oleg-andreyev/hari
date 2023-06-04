import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, ListGroup, Spinner } from "react-bootstrap";
import { useParams } from "react-router";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";
import "./Resume.css";
import useLocalStorage from "../hooks/useLocalStorage";
import { SHOW_JOB_HOPPER_DEFAULT, SHOW_JOB_HOPPER_KEY } from "./Settings";
import FileItem from "../components/DragDropFileUpload/FileItem";

let ExperienceDurationBadge: React.FC<{
  duration: number;
}> = ({ duration }) => {
  let variant = "warning";
  if (duration < 4) {
    variant = "danger";
  } else if (duration > 29) {
    variant = "success";
  } else if (duration > 11) {
    variant = "secondary";
  }
  let durationText = `${duration} months`;
  if (duration > 11) {
    const halfYears = (duration / 6) | 0;
    durationText = `${(halfYears / 2) | 0}${halfYears % 2 ? ".5" : ""} year${
      duration > 23 ? "s" : ""
    }`;
  }
  return (
    <Badge bg={variant} pill>
      {durationText}
    </Badge>
  );
};

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
  const { getItem } = useLocalStorage(true);
  const showJobHopper = getItem(SHOW_JOB_HOPPER_KEY) ?? SHOW_JOB_HOPPER_DEFAULT;

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

  const blobUrl = useMemo(() => {
    if (!resume?.file) return;
    const { data } = resume.file;
    const blob = new Blob([
      new Uint8Array(data, 0, (data as unknown as any[]).length),
    ]);
    return window.URL.createObjectURL(blob);
  }, [resume?.file]);

  const acronym =
    resume?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("") ?? "";

  // could move to useMemo, but it's not heavy, thus has no actual use to do that
  let experience = resume?.total_experience;
  let totalExperience = [];
  if (experience) {
    const years = (experience / 12) | 0;
    const months = experience % 12;
    if (years) {
      totalExperience.push(years, years > 1 ? "years" : "year");
    }
    if (months) {
      if (totalExperience.length > 0) {
        totalExperience.push("and");
      }
      totalExperience.push(months, years > 1 ? "months" : "month");
    }
  }

  let lastJobs = resume?.experience.slice(0, 3) ?? [];
  let isJobHopper =
    showJobHopper &&
    lastJobs.length === 3 &&
    lastJobs.reduce(
      (acc, { duration_in_months }) => (acc += duration_in_months),
      0
    ) /
      lastJobs.length <=
      4;

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
          <div className="d-flex align-items-center mb-4">
            <div className="candidate-image">{acronym}</div>
            <div>
              <h3 className="mb-0">
                <b>{resume.name}</b>
              </h3>
              {!!resume.email && (
                <span className="text-primary">{resume.email}</span>
              )}
              <div className="mt-2">
                {totalExperience.join(" ")} of experience
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap mb-4">
            {isJobHopper && (
              <Badge pill bg="danger">
                Job hopper
              </Badge>
            )}
            {resume.technologies.map((tech, index) => (
              <Badge pill bg="primary" key={index}>
                {tech}
              </Badge>
            ))}
          </div>

          <h3>Summary</h3>
          <Card className="mb-4">
            <Card.Body>{resume?.summary}</Card.Body>
          </Card>

          <h3>Experience</h3>
          <ListGroup className="mb-4">
            {resume.experience.map((experience, index) => (
              <ListGroup.Item
                className="d-flex justify-content-between align-items-start"
                key={index}
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{experience.position}</div>
                  <span className="text-secondary">at </span>
                  {experience.company}
                  {experience.location &&
                  experience.location.toLowerCase() !== "unknown"
                    ? `, ${experience.location}`
                    : ""}
                </div>
                {!!experience.duration_in_months && (
                  <ExperienceDurationBadge
                    duration={experience.duration_in_months}
                  />
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {blobUrl ? (
            <>
              <h3>Resume file</h3>
              <div>
                <a
                  href={blobUrl}
                  target="_blank"
                  download={`CV_${resume.name.replace(/\s/g, "_")}.pdf`}
                >
                  <FileItem name={`Resume.pdf`} />
                </a>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
};
