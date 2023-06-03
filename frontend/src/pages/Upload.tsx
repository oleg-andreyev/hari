import React, { useCallback, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useResumeStore } from "../store/useResumeStore";

export const Upload = () => {
  let [text, setText] = useState("");
  let [summary, setSummary] = useState("");
  const { createResume } = useResumeStore((state) => ({
    createResume: state.createResume,
  }));

  const handleInput = useCallback(
    (evt: any) => {
      setText(evt.target?.value ?? "");
    },
    [setText]
  );

  const handleSend = useCallback(async () => {
    let resume = await createResume(text);
    setSummary(resume?.summary ?? "");
  }, [text, createResume]);

  return (
    <div className="d-flex flex-column p-4">
      {!summary ? (
        <div>
          <h3>Upload CV</h3>
          <Form>
            <div className="mt-2">
              <Form.Control
                as="textarea"
                value={text}
                placeholder="Input CV text here"
                style={{ height: "100px" }}
                onChange={handleInput}
              />
            </div>
            <Button size="sm" onClick={handleSend}>
              Upload
            </Button>
          </Form>
        </div>
      ) : (
        <div>
          <h3>CV Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};
