import React from 'react';
import MedicalHistory from '../components/MedicalHistory';

const MedicalHistoryPage = () => {
  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="card card-gradient w-full max-w-6xl mt-8 p-4 md:p-8">
        <h2 className="mb-6 text-primary text-2xl md:text-3xl font-bold">Medical History</h2>
        <p className="text-neutral-600 mb-6">
          Here is a list of all your processed medical documents. Click on any document to view the structured details.
        </p>
        <MedicalHistory />
      </div>
    </div>
  );
};

export default MedicalHistoryPage;