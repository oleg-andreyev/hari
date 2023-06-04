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
import { createSearchParams, useSearchParams } from "react-router-dom";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";

import "./ResumeList.css";
import { getTotalExperience } from "../utils/getTotalExperience";

export const ResumeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumes, setResumes] = useState<IResume[]>([]);
  let initialTags = [];
  let initialCompanies = [];
  if (searchParams.get("tags")) {
    try {
      initialTags = JSON.parse(searchParams.get("tags") ?? "[]");
      initialCompanies = JSON.parse(searchParams.get("companies") ?? "[]");
    } catch (err) {
      // ignore
    }
  }
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [companies, setCompanies] = useState<string[]>(initialCompanies ?? []);
  const [currentResultTags, setCurrentResultTags] = useState<string[]>([]);
  const [currentResultCompanies, setCurrentResultCompanies] = useState<
    string[]
  >([]);
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
      setSearchParams(
        createSearchParams({
          title: searchParams.get("title") ?? "",
          tags: JSON.stringify(tags),
          companies: JSON.stringify(companies),
        })
      );
      // should be fail safe, as API error is cathed already, if it fails it should kill the app
      const data = await readResumes({ tags, companies });
      setResumes(data);
      setMaxScore(Math.max(...data.map(({ score }) => score)));
      setCurrentResultTags(tags);
      setCurrentResultCompanies(companies);
      setIsFetching(false);
    }
  }, [
    isFetching,
    tags,
    setResumes,
    setIsFetching,
    setCurrentResultTags,
    setCurrentResultCompanies,
  ]);

  const handleSetTags = useCallback(
    (tags: string[]) => setTags([...tags].map((tag) => tag.trim())),
    [setTags]
  );
  const handleSetCompanies = useCallback(
    (companies: string[]) =>
      setCompanies([...companies].map((company) => company.trim())),
    [setCompanies]
  );

  useEffect(() => {
    getResumes();
  }, []); // load initial view, thus empty deps list

  return (
    <div className="d-flex flex-column p-4">
      <h3 className="mb-4">
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
        <div className="d-flex mb-2 mt-4 gap-2">
          <div className="flex-grow-1 resume-list-input-container">
            <div className="resume-list-input-label">
              Tags{" "}
              <span className="text-muted">(technologies, languages, etc)</span>
            </div>
            <TagsInput
              value={tags}
              onChange={handleSetTags}
              placeHolder="Enter tags"
            />
          </div>
          <div className="flex-grow-1 resume-list-input-container">
            <div className="resume-list-input-label">Companies</div>
            <TagsInput
              value={companies}
              onChange={handleSetCompanies}
              placeHolder="Filter by past companies"
            />
          </div>
          <Button variant="success" onClick={getResumes} disabled={isFetching}>
            Apply filters
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
          {currentResultTags.length + currentResultCompanies.length ? (
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
                {currentResultCompanies.map((tag, index) => (
                  <Badge
                    bg="primary"
                    key={`company-${index}`}
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
                <th>Total Exp.</th>
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
                          return "warning";
                        })(resume.score)}
                        className="border mt-1"
                      />
                    </td>
                    <td>{getTotalExperience(resume.total_experience, true)}</td>
                    <td>{resume.technologies.join(", ")}</td>
                  </tr>
                  <tr key={`summary-${resume.resume_id}`} className="pointer">
                    <td></td>
                    <td colSpan={4}>{resume.summary}</td>
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
