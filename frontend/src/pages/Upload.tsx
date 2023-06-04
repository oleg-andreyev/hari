import React, { useCallback, useState } from "react";
import { Button, Form, Spinner, Tab, Tabs } from "react-bootstrap";
import { useResumeStore } from "../store/useResumeStore";
import DragDropFileUpload from "../components/DragDropFileUpload/DragDropFileUpload";

enum UploadSource {
  file = "file",
  text = "text",
  linkedin = "linkedin",
  cvlv = "cvlv",
  glassdoor = "glassdoor",
}

export const Upload = () => {
  const [text, setText] = useState("");
  const [isUploading, setIsUplaoding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadSource, setUploadSource] = useState(UploadSource.file);
  const { createResume, createResumeFiles } = useResumeStore((state) => ({
    createResume: state.createResume,
    createResumeFiles: state.createResumeFiles,
  }));

  const handleInput = useCallback(
    (evt: any) => {
      setText(evt.target?.value ?? "");
    },
    [setText]
  );

  const handleSend = useCallback(async () => {
    setIsUplaoding(true);
    switch (uploadSource) {
      case UploadSource.file: {
        // if file uploaded then do FormData request
        let data = new FormData();
        files.forEach((file, i) => {
          data.append(`data`, file, file.name);
        });
        await createResumeFiles(data);
        break;
      }
      case UploadSource.text: {
        await createResume({ data: text });
        break;
      }
    }
    setIsUplaoding(false);
    setIsProcessing(true);
  }, [uploadSource, text, files, createResume, setIsUplaoding]);

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
            <Tabs
              activeKey={uploadSource}
              onSelect={setUploadSource as any}
              className="mb-3"
            >
              <Tab eventKey={UploadSource.file} title="PDF File">
                <DragDropFileUpload handleFilesUpload={setFiles} />
              </Tab>
              <Tab eventKey={UploadSource.text} title="Text">
                <Form>
                  <Form.Control
                    as="textarea"
                    value={text}
                    placeholder="Input CV text here"
                    style={{ height: "40vh" }}
                    onChange={handleInput}
                  />
                </Form>
              </Tab>
              <Tab eventKey={UploadSource.linkedin} title="LinkedIn" disabled />
              <Tab eventKey={UploadSource.cvlv} title="CV.lv" disabled />
              <Tab
                eventKey={UploadSource.glassdoor}
                title="Glassdoor"
                disabled
              />
            </Tabs>
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
