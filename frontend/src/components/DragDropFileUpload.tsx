import React, { useCallback, useRef, useState } from "react";
import "./DragDropFileUpload.css";

const DragDropFileUpload: React.FC<{
  handleFilesUpload(files: File[]): void;
}> = ({ handleFilesUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      switch (e.type) {
        case "dragenter":
        case "dragover": {
          setDragActive(true);
          break;
        }
        case "dragleave": {
          setDragActive(false);
          break;
        }
      }
    },
    [setDragActive]
  );

  const handleDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFilesUpload(e.dataTransfer.files);
      }
    },
    [setDragActive, handleFilesUpload]
  );

  const handleChange = useCallback(
    (e: any) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFilesUpload(e.target.files);
      }
    },
    [handleFilesUpload]
  );

  return (
    <form
      id="form-file-upload"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        id="input-file-upload"
        multiple={true}
        onChange={handleChange}
      />
      <label
        id="label-file-upload"
        htmlFor="input-file-upload"
        className={dragActive ? "drag-active" : ""}
      >
        <div>
          <p>Drag and drop Resumes here or</p>
          <button className="upload-button" onClick={inputRef.current?.click}>
            Upload a file
          </button>
        </div>
      </label>
      {dragActive && (
        <div
          id="drag-file-element"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        ></div>
      )}
    </form>
  );
};

export default DragDropFileUpload;
