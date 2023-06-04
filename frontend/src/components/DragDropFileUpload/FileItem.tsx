import React from "react";

import "./DragDropFileUpload.css";

const FileItem: React.FC<{
  name: string;
  removeFile?(): void;
}> = ({ name, removeFile }) => {
  return (
    <div className="file-preview border">
      {!!removeFile ? (
        <div className="file-remove" onClick={removeFile}>
          &#10005;
        </div>
      ) : null}
      <div className="file-name">{name}</div>
    </div>
  );
};

export default FileItem;
