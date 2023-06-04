import React, { useMemo } from "react";
import { ProgressBar, Table } from "react-bootstrap";
import { useNavigate } from "react-router";

import { IResume } from "../../interfaces/Resume";
import { getTotalExperience } from "../../utils/getTotalExperience";
import "./ResumeListTable.css";

const ResumeListTable: React.FC<{
  resumes: IResume[];
}> = ({ resumes }) => {
  const maxScore = useMemo(
    () => Math.max(...resumes.map(({ score }) => score)),
    [resumes]
  );

  const navigate = useNavigate();

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th className="nowrap">HARI Score</th>
          <th>Experience</th>
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
  );
};

export default ResumeListTable;
