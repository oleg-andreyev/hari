import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  ProgressBar,
  Spinner,
  Table,
} from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";
import { useLocation, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

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
              Showing results with tags:{" "}
              {currentResultTags.map((tag, index) => (
                <Badge pill bg="secondary" key={`tag-${index}`}>
                  {tag}
                </Badge>
              ))}
            </Alert>
          ) : (
            <Alert variant="light">No tags set.</Alert>
          )}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Rating</th>
                <th>Technologies</th>
              </tr>
            </thead>
            <tbody>
              {[...resumes.values()].map((resume, index) => (
                <React.Fragment key={index}>
                  <tr
                    key={resume.resume_id}
                    onClick={() => navigate(`/resumes/${resume.resume_id}`)}
                  >
                    <td>{index + 1}</td>
                    <td>{resume.name}</td>
                    <td>
                      <ProgressBar
                        now={(resume.score / maxScore) * 100}
                        label={resume.score}
                      />
                    </td>
                    <td>{resume.technologies.join(", ")}</td>
                  </tr>
                  <tr key={`summary-${resume.resume_id}`}>
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
