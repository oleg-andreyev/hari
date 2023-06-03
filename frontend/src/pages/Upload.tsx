import React, { useCallback, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useResumeStore } from "../store/useResumeStore";
import DragDropFileUpload from "../components/DragDropFileUpload";

export const Upload = () => {
  const [text, setText] = useState("");
  const [isUploading, setIsUplaoding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    setIsUplaoding(true);
    let resume = await createResume(text);
    setIsUplaoding(false);
    setIsProcessing(true);
  }, [text, createResume, setIsUplaoding]);

  // const handleFilesUpload = useCallback((files: File[]) => {
  //   console.log(files);
  // }, []);

  const handleReset = useCallback(() => {
    setText("");
    setIsProcessing(false);
    setIsUplaoding(false);
  }, [setText, setIsProcessing, setIsUplaoding]);

  return (
    <div className="d-flex flex-column p-4">
      {!isProcessing ? (
        <div>
          <h3>Upload CV Text</h3>
          <Form>
            <div className="mt-2 mb-2">
              <Form.Control
                as="textarea"
                value={text}
                placeholder="Input CV text here"
                style={{ height: "600px" }}
                onChange={handleInput}
              />
              {/* // If we decide to do file upload as well */}
              {/* <DragDropFileUpload handleFilesUpload={handleFilesUpload} /> */}
            </div>
            <Button size="sm" onClick={handleSend} disabled={isUploading}>
              {isUploading ? (
                <Spinner as="span" animation="border" size="sm" role="status">
                  <span className="visually-hidden">Processing...</span>
                </Spinner>
              ) : (
                <>Upload</>
              )}
            </Button>
          </Form>
        </div>
      ) : (
        <div>
          <h3>Processing</h3>
          <p>
            CV currently is being processed. In a brief moment it should be
            available at Resumes list.
          </p>
          <Button onClick={handleReset}>Upload another CV</Button>
        </div>
      )}
    </div>
  );
};
