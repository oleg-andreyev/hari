import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Spinner } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component";
import { useNavigate } from "react-router";
import { createSearchParams, useSearchParams } from "react-router-dom";

import { useResumeStore } from "../store/useResumeStore";
import { IResume } from "../interfaces/Resume";
import "./ResumeList.css";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  EXPERTISE_THRESHOLD_DEFAULT,
  EXPERTISE_THRESHOLD_KEY,
} from "./Settings";
import ResumeListTable from "../components/ResumeListTable/ResumeListTable";

export const ResumeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumes, setResumes] = useState<IResume[]>([]);
  let initialTags = [];
  let initialCompanies = [];
  let initialExpertiseLevel = "";
  if (searchParams.get("tags")) {
    try {
      initialTags = JSON.parse(searchParams.get("tags") ?? "[]");
      initialCompanies = JSON.parse(searchParams.get("companies") ?? "[]");
      initialExpertiseLevel = searchParams.get("exp") ?? "";
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
  const [currentExp, setCurrentExp] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState(
    initialExpertiseLevel ?? ""
  );
  const {
    companyOptions = [],
    error,
    readResumes,
  } = useResumeStore((state) => ({
    companyOptions: state.companies,
    error: state.error,
    readResumes: state.readResumes,
  }));
  const navigate = useNavigate();
  const { getItem } = useLocalStorage(true);

  const getResumes = useCallback(
    async (tags: any, companies: any, expertiseLevel: any) => {
      if (!isFetching) {
        setIsFetching(true);
        setSearchParams(
          createSearchParams({
            title: searchParams.get("title") ?? "",
            tags: JSON.stringify(tags),
            companies: JSON.stringify(companies),
            exp: expertiseLevel,
          })
        );
        const expertiseThreshold =
          getItem(EXPERTISE_THRESHOLD_KEY) ?? EXPERTISE_THRESHOLD_DEFAULT;
        let exp = "";
        switch (expertiseLevel) {
          case "junior": {
            exp = `0-${expertiseThreshold[0]}`;
            break;
          }
          case "mid": {
            exp = `${expertiseThreshold[0]}-${expertiseThreshold[1]}`;
            break;
          }
          case "senior": {
            exp = `${expertiseThreshold[1]}`;
            break;
          }
        }
        // should be fail safe, as API error is cathed already, if it fails it should kill the app
        const data = await readResumes({ tags, companies, exp });
        setResumes(data);
        setCurrentResultTags(tags);
        setCurrentResultCompanies(companies);
        setCurrentExp(expertiseLevel);
        setIsFetching(false);
      }
    },
    [
      isFetching,
      setResumes,
      setIsFetching,
      setCurrentResultTags,
      setCurrentResultCompanies,
      setCurrentExp,
    ]
  );

  const handleSetTags = useCallback(
    (tags: string[]) => setTags([...tags].map((tag) => tag.trim())),
    [setTags]
  );
  const handleSetCompanies = useCallback(
    (evt: any) => {
      setCompanies([evt.target.value?.trim()]);
    },
    [setCompanies]
  );
  const handleExpertiseLevelChange = useCallback(
    (evt: any) => {
      setExpertiseLevel(evt.target.value);
    },
    [setExpertiseLevel]
  );
  const clearFilters = useCallback(() => {
    setTags([]);
    setCompanies([]);
    setExpertiseLevel("");
    getResumes([], [], "");
  }, [setTags, setCompanies, setExpertiseLevel, getResumes]);

  useEffect(() => {
    getResumes(tags, companies, expertiseLevel);
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
      <div className="mb-2">
        <div className="d-flex mb-2 gap-2 resume-list-inputs">
          <div className="flex-grow-1 resume-list-input-container expertise">
            <div className="resume-list-input-label">Expertise level</div>
            <Form.Select
              value={expertiseLevel}
              onChange={handleExpertiseLevelChange}
            >
              <option value="">Any</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </Form.Select>
          </div>
          <div className="flex-grow-1 resume-list-input-container tags">
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
          <div className="flex-grow-1 resume-list-input-container companies">
            <div className="resume-list-input-label">Company</div>
            <Form.Select
              value={companies[0] ?? ""}
              onChange={handleSetCompanies}
            >
              <option value="">Any</option>
              {companyOptions.map((company, index) => (
                <option value={company.key} key={index}>
                  {company.key}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={() => getResumes(tags, companies, expertiseLevel)}
            disabled={isFetching}
          >
            Apply filters
          </Button>
          <Button
            variant="outline-danger"
            onClick={clearFilters}
            disabled={isFetching}
          >
            Clear
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
          {currentResultTags.length ||
          currentResultCompanies.length ||
          !!currentExp ? (
            <Alert variant="light">
              <div>Results below are filtered with:</div>
              <div className="d-flex gap-2 flex-wrap">
                {currentExp ? (
                  <Badge bg="success" className="active-badge">
                    {currentExp}
                  </Badge>
                ) : null}
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
                    bg="dark"
                    key={`company-${index}`}
                    className="active-badge"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Alert>
          ) : (
            <Alert variant="light">No filters set.</Alert>
          )}
          <ResumeListTable resumes={resumes} />
        </>
      )}
    </div>
  );
};
