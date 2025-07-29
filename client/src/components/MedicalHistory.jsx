import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { FaFilePdf } from 'react-icons/fa';

const MedicalHistory = () => {
  // NOTE: This assumes a `loadMedicalHistory` function exists in your UserContext
  // to fetch the documents from your backend.
  const { userData, loadMedicalHistory } = useUser(); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Use optional chaining to safely access nested properties
      const userEmail = userData.profile?.email;

      // This check prevents re-fetching if data is already present
      if (userEmail && !userData.medicalHistory) {
        try {
          await loadMedicalHistory(userEmail);
        } catch (err) {
          console.error("Failed to load medical history:", err);
          setError('Could not load your medical history. Please try again later.');
        }
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [userData.profile, userData.medicalHistory, loadMedicalHistory]);

  // When data is loaded, select the first document by default
  useEffect(() => {
    if (userData.medicalHistory && userData.medicalHistory.length > 0) {
      setSelectedDoc(userData.medicalHistory[0]);
    }
  }, [userData.medicalHistory]);

  // Fallback for medical history to prevent errors if it's undefined
  const medicalHistory = userData.medicalHistory || [];

  if (isLoading) {
    return <div className="w-full flex justify-center items-center p-8 text-lg">Loading medical history...</div>;
  }

  if (error) {
    return <div className="w-full flex justify-center items-center p-8 text-lg text-red-500">{error}</div>;
  }

  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="card card-gradient w-full max-w-7xl mt-8 p-4 md:p-8">
        <h2 className="mb-6 text-primary text-2xl md:text-3xl font-bold">Medical Document History</h2>
        
        {medicalHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg">You haven't uploaded any medical documents yet.</p>
            <p className="text-neutral-500 mt-2">Go to your Profile Settings to upload your first document.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Document List */}
            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-semibold mb-4 text-primary">Uploaded Documents</h3>
              <div className="space-y-3">
                {medicalHistory.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedDoc?.id === doc.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white hover:bg-blue-50'
                    }`}
                  >
                    <FaFilePdf className="text-2xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{doc.fileName}</p>
                      <p className={`text-xs ${selectedDoc?.id === doc.id ? 'text-blue-200' : 'text-neutral-500'}`}>
                        Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="w-full md:w-2/3">
              {selectedDoc ? (
                <div className="card card-alt p-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">{selectedDoc.fileName}</h3>
                  <h4 className="font-semibold text-lg mb-2">Medical History Details</h4>
                  {(() => {
                    const structuredData = Object.fromEntries(
                      Object.entries(selectedDoc).filter(
                        ([key]) => !['id', 'userEmail', 'originalFilename', 'createdAt', 'fileName', 'uploadDate'].includes(key)
                      )
                    );

                    const patient = structuredData.patient || {};
                    const diagnosis = structuredData.diagnosis || [];
                    const prescribedMedicines = structuredData.prescribed_medicines || [];
                    const followUpInstructions = structuredData.follow_up_instructions || [];

                    return (
                      <div className="text-neutral-800 text-base space-y-4">
                        <div>
                          <h5 className="font-semibold text-lg mb-1">Patient Information</h5>
                          <p><strong>Name:</strong> {patient.name || 'N/A'}</p>
                          <p><strong>Age:</strong> {patient.age || 'N/A'}</p>
                          <p><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
                          <p><strong>Date:</strong> {patient.date || 'N/A'}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-lg mb-1">Diagnosis</h5>
                          {diagnosis.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {diagnosis.map((item, index) => (
                                <li key={index}>
                                  {typeof item === 'object' && item !== null
                                    ? (item.condition || '') + (item.description ? ': ' + item.description : '')
                                    : item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>N/A</p>
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-lg mb-1">Prescribed Medicines</h5>
                          {prescribedMedicines.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {prescribedMedicines.map((item, index) => (
                                <li key={index}>
                                  {typeof item === 'object' && item !== null
                                    ? (item.condition || '') + (item.description ? ': ' + item.description : '')
                                    : item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>N/A</p>
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-lg mb-1">Follow-up Instructions</h5>
                          {followUpInstructions.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {followUpInstructions.map((item, index) => (
                                <li key={index}>
                                  {typeof item === 'object' && item !== null
                                    ? (item.condition || '') + (item.description ? ': ' + item.description : '')
                                    : item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>N/A</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 p-6 card card-alt">
                  {selectedDoc ? "This document is still being processed or no structured data could be extracted." : "Select a document to view its details."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
