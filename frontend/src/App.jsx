import React, { useState } from 'react';
import GuavaMascot from './components/GuavaMascot';
import GuavaGrowthModal from './components/GuavaGrowthModal';
import {
  Layers,
  Split,
  RotateCw,
  Trash2,
  Image as ImageIcon,
  Lock,
  Unlock,
  Download,
  UploadCloud,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';

// Hardcoded directly to your live Render backend
const API_BASE = 'https://monex-guava-pdf-editor.onrender.com';

const TOOLS = [
  { id: 'merge', label: 'Merge PDF', icon: Layers, color: 'text-green-800', endpoint: `${API_BASE}/api/pdf/merge`, multiple: true, accept: '.pdf' },
  { id: 'split', label: 'Split PDF', icon: Split, color: 'text-rose-600', endpoint: `${API_BASE}/api/pdf/split`, multiple: false, accept: '.pdf', extraField: 'page_range', extraLabel: 'Page Range (e.g. 1-2 or 1,3)', defaultExtra: '1-2' },
  { id: 'rotate', label: 'Rotate PDF', icon: RotateCw, color: 'text-green-600', endpoint: `${API_BASE}/api/pdf/rotate`, multiple: false, accept: '.pdf', extraField: 'angle', extraLabel: 'Rotation Angle', defaultExtra: '90' },
  { id: 'delete', label: 'Delete Pages', icon: Trash2, color: 'text-rose-600', endpoint: `${API_BASE}/api/pdf/delete-pages`, multiple: false, accept: '.pdf', extraField: 'pages_to_delete', extraLabel: 'Pages to Delete (e.g. 1, 3)', defaultExtra: '1' },
  { id: 'img2pdf', label: 'Photos to PDF', icon: ImageIcon, color: 'text-green-800', endpoint: `${API_BASE}/api/images/to-pdf`, multiple: true, accept: 'image/jpeg,image/png' },
  { id: 'protect', label: 'Protect PDF', icon: Lock, color: 'text-rose-600', endpoint: `${API_BASE}/api/pdf/protect`, multiple: false, accept: '.pdf', extraField: 'password', extraLabel: 'Encryption Password', defaultExtra: 'GuavaPass123' },
  { id: 'unlock', label: 'Unlock PDF', icon: Unlock, color: 'text-green-600', endpoint: `${API_BASE}/api/pdf/unlock`, multiple: false, accept: '.pdf', extraField: 'password', extraLabel: 'PDF Password', defaultExtra: '' },
  { id: 'extract', label: 'Extract Text', icon: Eye, color: 'text-green-800', endpoint: `${API_BASE}/api/pdf/extract-text`, multiple: false, accept: '.pdf', isJson: true },
];

export default function App() {
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [files, setFiles] = useState([]);
  const [extraValue, setExtraValue] = useState(TOOLS[0].defaultExtra || '');

  // Modal & Processing Synchronization
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServerDone, setIsServerDone] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState('');
  const [jsonResult, setJsonResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    setFiles([]);
    setDownloadUrl(null);
    setJsonResult(null);
    setErrorMsg('');
    setExtraValue(tool.defaultExtra || '');
  };

  const clearSession = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDownloadUrl(null);
    setJsonResult(null);
    setErrorMsg('');
    setPendingResult(null);
  };

  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (!selectedTool.multiple && selected.length > 1) {
      setFiles([selected[0]]);
    } else {
      setFiles((prev) => (selectedTool.multiple ? [...prev, ...selected] : selected));
    }
    setDownloadUrl(null);
    setJsonResult(null);
    setErrorMsg('');
  };

  const handleRunTask = async () => {
    if (files.length === 0) {
      setErrorMsg('Please select a file first.');
      return;
    }
    if (selectedTool.id === 'merge' && files.length < 2) {
      setErrorMsg('Merging requires at least 2 PDF files.');
      return;
    }

    setIsModalOpen(true);
    setIsServerDone(false);
    setPendingResult(null);
    setErrorMsg('');
    setDownloadUrl(null);
    setJsonResult(null);

    try {
      const formData = new FormData();
      if (selectedTool.multiple) {
        files.forEach((f) => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }

      if (selectedTool.extraField) {
        formData.append(selectedTool.extraField, extraValue);
      }

      const res = await fetch(selectedTool.endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}: ${res.statusText}` }));
        throw new Error(errorData.detail || 'Task processing failed');
      }

      if (selectedTool.isJson) {
        const data = await res.json();
        setPendingResult({ type: 'json', data });
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const disposition = res.headers.get('Content-Disposition');
        let fname = 'monex_guava_output.pdf';
        if (disposition && disposition.includes('filename=')) {
          fname = disposition.split('filename=')[1].replace(/"/g, '');
        } else {
          fname = `${selectedTool.id}_${files[0].name}`;
        }
        setPendingResult({ type: 'blob', url, fname });
      }

      // Signal modal that the server completed
      setIsServerDone(true);
    } catch (err) {
      setIsModalOpen(false);
      setIsServerDone(false);
      setErrorMsg(err.message);
    }
  };

  const handleModalFinished = () => {
    setIsModalOpen(false);
    setIsServerDone(false);

    if (pendingResult) {
      if (pendingResult.type === 'json') {
        setJsonResult(pendingResult.data);
      } else if (pendingResult.type === 'blob') {
        setDownloadUrl(pendingResult.url);
        setDownloadFilename(pendingResult.fname);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#eef8ed] text-neutral-900 flex flex-col font-sans">
      {/* 120 FPS Spinning Guava Wheel Modal Popup */}
      <GuavaGrowthModal 
        isOpen={isModalOpen} 
        totalBytes={totalBytes}
        isServerDone={isServerDone}
        onMovieFinished={handleModalFinished}
      />

      {/* Header */}
      <header className="border-b border-green-200 bg-white/95 sticky top-0 z-40 px-5 md:px-10 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍈</span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-green-950 leading-none">
              Monex <span className="text-[#f46a78]">Guava Editor</span>
            </h1>
            <span className="text-[11px] font-bold tracking-wide uppercase text-green-700">
              Green Rind &bull; Pink Flesh &bull; Zero DB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-green-950 bg-green-50 px-3.5 py-1.5 rounded-full border border-green-300 text-xs font-bold">
            <ShieldCheck size={16} className="text-green-600" />
            <span>RAM-Only Privacy</span>
          </div>
          <button
            onClick={clearSession}
            title="Wipe Session Memory"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-rose-600 bg-neutral-100 hover:bg-rose-50 border border-neutral-200 px-3.5 py-1.5 rounded-xl transition shadow-sm active:scale-95"
          >
            <RefreshCw size={14} /> Wipe Session
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col items-center">
        <GuavaMascot status={isModalOpen ? "processing" : "idle"} />

        {/* Tool Selector Grid */}
        <div className="w-full mt-4 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-green-950 mb-3 text-center sm:text-left flex items-center gap-1.5">
            <Sparkles size={15} className="text-[#f46a78]" /> Select Guava Tool
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTool.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleToolChange(t)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                    isActive
                      ? 'bg-white border-[#f46a78] ring-2 ring-[#f46a78] shadow-md scale-105'
                      : 'bg-white/85 hover:bg-white border-green-200 hover:border-green-400 shadow-sm'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1.5 ${t.color}`} />
                  <span className="text-xs font-bold text-neutral-800 leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Tool Workspace */}
        <div className="w-full max-w-2xl bg-white border-2 border-green-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <selectedTool.icon className={`w-6 h-6 ${selectedTool.color}`} />
              <h3 className="text-lg font-black text-neutral-900">{selectedTool.label}</h3>
            </div>
            <span className="text-xs font-semibold text-green-950 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              {selectedTool.multiple ? 'Multiple Files' : 'Single File'}
            </span>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-green-300 hover:border-[#f46a78] rounded-2xl p-6 sm:p-8 text-center transition-colors bg-rose-50/20 group">
            <input
              type="file"
              id="fileUploader"
              multiple={selectedTool.multiple}
              accept={selectedTool.accept}
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="fileUploader"
              className="cursor-pointer inline-flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-white rounded-2xl border border-green-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud className="w-6 h-6 text-[#f46a78]" />
              </div>
              <span className="inline-block bg-[#58a757] hover:bg-[#2d6a33] text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow transition active:scale-95">
                Choose {selectedTool.multiple ? 'Files' : 'File'}
              </span>
              <p className="text-xs text-neutral-500 mt-2">
                Supported: {selectedTool.accept} &bull; Processed strictly in RAM
              </p>
            </label>
          </div>

          {selectedTool.extraField && (
            <div className="mt-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                {selectedTool.extraLabel}
              </label>
              <input
                type="text"
                value={extraValue}
                onChange={(e) => setExtraValue(e.target.value)}
                placeholder={selectedTool.defaultExtra}
                className="w-full px-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#f46a78] outline-none"
              />
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-600 mb-2">
                <span>Queued Files ({files.length} &bull; {(totalBytes / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-rose-600 hover:underline"
                >
                  Clear Selection
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-green-50/50 border border-green-200 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2 truncate max-w-sm">
                      <span className="font-bold text-[#f46a78]">#{i + 1}</span>
                      <span className="truncate text-neutral-800">{f.name}</span>
                    </div>
                    <span className="text-neutral-400">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleRunTask}
            disabled={isModalOpen || files.length === 0}
            className={`w-full mt-6 font-extrabold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 text-sm select-none active:scale-[0.99] ${
              isModalOpen
                ? 'bg-gradient-to-r from-[#58a757] via-[#f46a78] to-[#2d6a33] text-white animate-pulse shadow-lg cursor-wait'
                : files.length === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300'
                : 'bg-[#58a757] hover:bg-[#2d6a33] text-white shadow-green-600/30 hover:shadow-lg'
            }`}
          >
            <span className="tracking-wide">
              {isModalOpen ? 'Processing in Memory...' : `Execute ${selectedTool.label}`}
            </span>
          </button>
        </div>

        {/* Download Output */}
        {downloadUrl && (
          <div className="w-full max-w-2xl mt-6 p-5 bg-white border-2 border-[#f46a78] rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <ShieldCheck size={20} className="text-green-600" />
                <span>Task Successfully Completed!</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Output ready: <strong className="text-neutral-800">{downloadFilename}</strong>
              </p>
            </div>
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="inline-flex items-center justify-center gap-2 bg-[#f46a78] hover:bg-[#dc3545] text-white text-sm font-extrabold px-6 py-3 rounded-xl shadow transition active:scale-95"
            >
              <Download size={16} /> Download File
            </a>
          </div>
        )}

        {/* Text Extractor Output */}
        {jsonResult && (
          <div className="w-full max-w-2xl mt-6 p-5 bg-white border border-green-200 rounded-2xl shadow-sm animate-fadeIn">
            <h4 className="font-bold text-sm text-green-950 mb-2">Extracted Document Text:</h4>
            <div className="max-h-60 overflow-y-auto bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-mono space-y-3">
              {jsonResult.pages.map((p) => (
                <div key={p.page}>
                  <div className="font-bold text-[#f46a78] mb-1">--- Page {p.page} ---</div>
                  <pre className="whitespace-pre-wrap text-neutral-700">{p.text || '[No text found on this page]'}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-green-200 bg-white/70 py-4 px-6 text-center text-xs text-neutral-500">
        Monex Guava PDF Editor &bull; Greenish-Pink Natural Theme &bull; 100% In-Memory Execution
      </footer>
    </div>
  );
}