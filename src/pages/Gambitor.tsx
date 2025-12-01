import { useEffect } from 'react';

const Gambitor = () => {
  useEffect(() => {
    // Redirect to the PDF file
    window.location.href = '/Gambitor.pdf';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading PDF...</p>
    </div>
  );
};

export default Gambitor;
