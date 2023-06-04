import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ProgressBar,
  Spinner,
  Table,
} from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";

import "./ResumeList.css";

export const ResumeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumes, setResumes] = useState<IResume[]>([]);
  let initialTags = [];
  if (searchParams.get("tags")) {
    try {
      initialTags = JSON.parse(searchParams.get("tags") as string);
    } catch (err) {
      // ignore
    }
  }
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [currentResultTags, setCurrentResultTags] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [maxScore, setMaxScore] = useState(100);
  const { error, readResumes } = useResumeStore((state) => ({
    error: state.error,
    readResumes: state.readResumes,
  }));
  const navigate = useNavigate();

  const getResumes = useCallback(async () => {
    if (!isFetching) {
      setIsFetching(true);
      // should be fail safe, as API error is cathed already, if it fails it should kill the app
      const data = await readResumes(tags);
      setResumes(data);
      setMaxScore(Math.max(...data.map(({ score }) => score)));
      setCurrentResultTags(tags);
      setIsFetching(false);
    }
  }, [isFetching, tags, setResumes, setIsFetching, setCurrentResultTags]);

  useEffect(() => {
    getResumes();
  }, []); // load initial view, thus empty deps list

  return (
    <div className="d-flex flex-column p-4">
      <h3>
        Candidates{" "}
        {searchParams.get("title") ? (
          <>
            {`for `}
            <b>{searchParams.get("title")}</b>
          </>
        ) : (
          ""
        )}
      </h3>
      <div>
        {/* <Alert variant="light">Might add extra info for specific tag usage, i.e., "experience:8 years"</Alert> */}
        <div className="d-flex mb-2 mt-4">
          <div className="flex-grow-1">
            <TagsInput
              value={tags}
              onChange={setTags}
              placeHolder="Enter tags to search on Resume"
              // onExisting={} // TODO add notice that it's a duplicate
            />
          </div>
          <Button
            variant="outline-success"
            className="ml-2"
            onClick={getResumes}
            disabled={isFetching}
          >
            Apply tags
          </Button>
        </div>
      </div>
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : isFetching ? (
        <Spinner animation="border" variant="primary" />
      ) : resumes.length === 0 ? (
        <p>No resumes found</p>
      ) : (
        <>
          {currentResultTags.length ? (
            <Alert variant="light">
              <div>Showing results with tags:</div>
              <div className="d-flex gap-2 flex-wrap">
                {currentResultTags.map((tag, index) => (
                  <Badge
                    bg="primary"
                    key={`tag-${index}`}
                    className="active-badge"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Alert>
          ) : (
            <Alert variant="light">No tags set.</Alert>
          )}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>HARI Score</th>
                <th>Technologies</th>
              </tr>
            </thead>
            <tbody>
              {[...resumes.values()].map((resume, index) => (
                <React.Fragment key={index}>
                  <tr
                    key={resume.resume_id}
                    onClick={() => navigate(`/resumes/${resume.resume_id}`)}
                    className="pointer"
                  >
                    <td>{index + 1}</td>
                    <td>{resume.name}</td>
                    <td>
                      <ProgressBar
                        now={Math.max(10, (resume.score / maxScore) * 100)}
                        label={resume.score}
                        variant={((score) => {
                          if (score / maxScore > 0.85) return "success";
                          if (score / maxScore < 0.35) return "danger";
                          if (score / maxScore < 0.6) return "warning";
                          return "info";
                        })(resume.score)}
                        className="border"
                      />
                    </td>
                    <td>{resume.technologies.join(", ")}</td>
                  </tr>
                  <tr key={`summary-${resume.resume_id}`} className="pointer">
                    <td></td>
                    <td colSpan={3}>{resume.summary}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};
