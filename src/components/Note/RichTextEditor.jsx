import React, { useRef, useEffect } from 'react';

const RichTextEditor = ({ content, onChange, placeholder, onSelectionChange, isEditable = true }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Focus and position cursor when becoming editable
  useEffect(() => {
    if (isEditable && editorRef.current) {
      editorRef.current.focus();
      // Move cursor to beginning
      const range = document.createRange();
      const sel = window.getSelection();
      if (editorRef.current.firstChild) {
        range.setStart(editorRef.current.firstChild, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditable]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelectionChange = () => {
      onSelectionChange && onSelectionChange();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div
      ref={editorRef}
      className={`rich-text-editor ${!isEditable ? 'read-only' : ''}`}
      contentEditable={isEditable}
      onInput={handleInput}
      onPaste={handlePaste}
      onMouseDown={(e) => e.stopPropagation()} // Allow text selection
      onMouseUp={handleSelectionChange}
      onKeyUp={handleSelectionChange}
      data-placeholder={placeholder}
    />
  );
};

export default RichTextEditor;
