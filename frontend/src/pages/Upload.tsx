import React, { useCallback, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useResumeStore } from "../store/useResumeStore";
import DragDropFileUpload from "../components/DragDropFileUpload/DragDropFileUpload";

// change to "true" to use old text input;
const useLegacyTextInput = false;

export const Upload = () => {
  const [text, setText] = useState("");
  const [isUploading, setIsUplaoding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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
    if (files.length) {
      // if file uploaded then do FormData request
      let form = new FormData();
      files.forEach((file, i) => {
        form.append(`resume-${i}`, file, file.name);
      });
      await createResume(form);
    } else {
      await createResume({ data: text });
    }
    setIsUplaoding(false);
    setIsProcessing(true);
  }, [text, files, createResume, setIsUplaoding]);

  const handleReset = useCallback(() => {
    setText("");
    setIsProcessing(false);
    setIsUplaoding(false);
  }, [setText, setIsProcessing, setIsUplaoding]);

  return (
    <div className="d-flex flex-column p-4">
      {!isProcessing ? (
        <div>
          <h3>Upload CVs</h3>
          <div className="mt-2 mb-2">
            {useLegacyTextInput ? (
              <Form>
                <Form.Control
                  as="textarea"
                  value={text}
                  placeholder="Input CV text here"
                  style={{ height: "600px" }}
                  onChange={handleInput}
                />
              </Form>
            ) : (
              <DragDropFileUpload handleFilesUpload={setFiles} />
            )}
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
