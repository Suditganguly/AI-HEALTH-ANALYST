import React, { useEffect, useState } from 'react';
import { FaFilePdf, FaDownload, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/medical-history';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    role="alert">
    {message}
    <button className="ml-4 text-white font-bold" onClick={onClose}>&times;</button>
  </div>
);

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState({});
  const [showDelete, setShowDelete] = useState(null); // filename to delete
  const [toast, setToast] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      } else {
        setError('Failed to fetch records');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (filename) => {
    setShowDelete(null);
    try {
      const res = await fetch(`${API_URL}/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecords(records.filter(r => r.filename !== filename));
        setToast({ message: 'Record deleted.', type: 'success' });
      } else {
        setToast({ message: data.message || 'Delete failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
  };

  const handleDownload = (filename) => {
    window.open(`${API_URL}/download/${filename}`, '_blank');
    setToast({ message: 'Download started.', type: 'success' });
  };

  // Filter and sort
  const filtered = records.filter(r =>
    r.originalName.toLowerCase().includes(search.toLowerCase()) ||
    (r.text && r.text.toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'uploadDate') {
      return sortDir === 'desc'
        ? new Date(b.uploadDate) - new Date(a.uploadDate)
        : new Date(a.uploadDate) - new Date(b.uploadDate);
    } else if (sortBy === 'originalName') {
      return sortDir === 'desc'
        ? b.originalName.localeCompare(a.originalName)
        : a.originalName.localeCompare(b.originalName);
    }
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <FaFilePdf className="text-red-500" /> Medical History (Uploaded PDFs)
      </h2>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by filename or text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-dark flex-1 pl-10"
            style={{ minWidth: 220 }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm">Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input input-dark">
            <option value="uploadDate">Date</option>
            <option value="originalName">Filename</option>
          </select>
          <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')} className="btn btn-sm" title="Toggle sort direction">
            {sortDir === 'desc' ? <FaSortDown /> : <FaSortUp />}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-10">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="text-neutral-500 text-center py-10">No records found.</div>
      ) : (
        <div className="space-y-6">
          {sorted.map(record => (
            <div key={record.filename} className="card card-alt p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-lg hover:shadow-2xl transition border border-neutral-200 hover:border-primary/40 bg-white/90">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <span className="font-semibold text-primary flex items-center">
                    <FaFilePdf className="mr-1 text-red-500" /> {record.originalName}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">{(record.size/1024/1024).toFixed(2)} MB</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <FaSort className="inline text-gray-400" /> {formatDate(record.uploadDate)}
                  </span>
                  {record.usedOcr && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-semibold">OCR</span>}
                </div>
                <div className="mb-2">
                  <button
                    className="text-blue-600 text-xs underline mr-2"
                    onClick={() => setExpanded(e => ({...e, [record.filename]: !e[record.filename]}))}
                  >
                    {expanded[record.filename] ? 'Hide Text' : 'Show Extracted Text'}
                  </button>
                  {expanded[record.filename] && (
                    <div className="bg-neutral-50 border rounded p-2 mt-2 max-h-48 overflow-auto text-sm whitespace-pre-wrap">
                      {record.text || <span className="text-neutral-400">No text extracted.</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                <button className="btn btn-primary btn-sm flex items-center justify-center gap-1" onClick={() => handleDownload(record.filename)}>
                  <FaDownload /> Download
                </button>
                <button className="btn btn-danger btn-sm flex items-center justify-center gap-1" onClick={() => setShowDelete(record.filename)}>
                  <FaTrash /> Delete
                </button>
              </div>
              {/* Delete Modal */}
              {showDelete === record.filename && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-2 text-red-600 flex items-center gap-2"><FaTrash /> Delete Record?</h3>
                    <p className="mb-4 text-neutral-700">Are you sure you want to delete <span className="font-semibold">{record.originalName}</span> and its extracted text? This cannot be undone.</p>
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-light" onClick={() => setShowDelete(null)}>Cancel</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(record.filename)}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default MedicalHistory; 