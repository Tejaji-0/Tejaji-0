import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CampfireBng = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageWidth(Math.min(window.innerWidth * 0.7, 1200));
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 overflow-auto flex justify-center py-8">
      <Document
        file="/campfire-bng.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center gap-4"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
};

export default CampfireBng;
