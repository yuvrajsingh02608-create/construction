import { useState, useRef } from 'react';
import { 
  FileText, Upload, Download, Search, Filter, 
  Trash2, File, Image, Film, MoreVertical, 
  Calendar, User, Plus, X, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// Categories are still local as they are UI constants
const CATEGORIES = ['All', 'Blueprint', 'Photos', 'Invoice', 'Compliance', 'Planning', 'Other'];

export default function Files() {
  const { currentUser } = useAuth();
  const { files, uploadFile, deleteFile, showToast, projects, globalProject, setGlobalProject } = useApp();
  const [selectedProject, setSelectedProject] = useState(globalProject || projects[0]?.id || '');
  
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setGlobalProject(e.target.value);
  };

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', category: 'Blueprint', file: null });
  const [viewFile, setViewFile] = useState(null);
  const fileInputRef = useRef(null);

  const canManage = currentUser?.role === 'owner' || currentUser?.role === 'manager';
  const canUpload = canManage;

  const filteredFiles = files.filter(f => {
    const matchesProject = !f.projectId || String(f.projectId) === String(selectedProject);
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || f.category === category;
    return matchesProject && matchesSearch && matchesCategory;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const type = file.name.split('.').pop().toLowerCase();
      
      setUploadData(prev => ({
        ...prev,
        name: file.name,
        file: file,
        size: sizeStr,
        type: type
      }));
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.name) return;

    let previewUrl = null;
    if (uploadData.file) {
      previewUrl = URL.createObjectURL(uploadData.file);
    }

    const payload = {
      name: uploadData.name,
      type: uploadData.type || 'file',
      size: uploadData.size || '0 KB',
      category: uploadData.category,
      projectId: selectedProject,
      uploadedBy: currentUser.name || 'User',
      date: new Date().toISOString().split('T')[0],
      previewUrl
    };
    
    uploadFile(payload);
    setShowUpload(false);
    setUploadData({ name: '', category: 'Blueprint', file: null });
  };

  const handleDelete = (id) => {
    deleteFile(id);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'zip': case 'rar': case '7z': return <File className="text-orange-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'webp': return <Image className="text-blue-500" />;
      case 'xls': case 'xlsx': case 'csv': return <File className="text-green-500" />;
      case 'mp4': case 'mov': return <Film className="text-purple-500" />;
      default: return <File className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-header dark:text-white">Project Files & Documents</h2>
          <p className="text-sm text-gray-500">Shared repository for blueprints and reports</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload size={18} /> Upload Document
          </button>
        )}
      </div>

      <div className="card dark:bg-gray-800 flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Project</label>
          <select value={selectedProject} onChange={handleProjectChange} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1 relative mt-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1 invisible">Search</label>
          <Search size={18} className="absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search filenames..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card dark:bg-gray-800 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${category === cat 
                  ? 'bg-[#CC0000] text-white shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map(file => (
          <div key={file.id} className="card dark:bg-gray-800 hover:shadow-xl transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-2 group-hover:bg-[#CC0000]/5 transition-colors">
                {getFileIcon(file.type)}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setViewFile(file)}
                  className="p-2 text-gray-400 hover:text-[#CC0000] transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Preview File"
                >
                  <Eye size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#CC0000] transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Download size={18} />
                </button>
                {canUpload && (
                  <button onClick={() => handleDelete(file.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="font-bold text-gray-800 dark:text-white truncate mb-1" title={file.name}>
              {file.name}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold uppercase tracking-wider">
                {file.category}
              </span>
              <span className="text-xs text-gray-400">{file.size}</span>
            </div>

            <div className="pt-4 border-t dark:border-gray-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User size={12} />
                <span>Uploaded by <span className="font-medium text-gray-700 dark:text-gray-300">{file.uploadedBy}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={12} />
                <span>{file.date}</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredFiles.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <File size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No files found matching your criteria</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-[#CC0000] hover:underline mt-2">Clear all filters</button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">Upload New Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">File Display Name</label>
                <input 
                  type="text" 
                  value={uploadData.name}
                  onChange={e => setUploadData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Tower A Foundations.pdf"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Category</label>
                <select 
                  value={uploadData.category}
                  onChange={e => setUploadData(f => ({ ...f, category: e.target.value }))}
                  className="input-field"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${uploadData.file 
                    ? 'border-[#CC0000] bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className={uploadData.file ? 'text-[#CC0000]' : 'text-gray-400'} />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadData.file ? uploadData.file.name : 'Choose a file or drag & drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadData.file ? `${uploadData.size} · Click to change` : 'PDF, Excel, JPG, ZIP up to 50MB'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {viewFile && (
        <div className="modal-overlay z-50 p-4" onClick={() => setViewFile(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  {getFileIcon(viewFile.type)}
                  {viewFile.name}
                </h3>
              </div>
              <button onClick={() => setViewFile(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-950">
              {viewFile.previewUrl ? (
                ['jpg', 'jpeg', 'png', 'webp', 'image'].includes(viewFile.type?.toLowerCase()) ? (
                  <img 
                    src={viewFile.previewUrl} 
                    alt={viewFile.name} 
                    className="max-w-full h-auto rounded shadow-lg object-contain"
                  />
                ) : (
                  <iframe 
                    src={viewFile.previewUrl} 
                    title={viewFile.name} 
                    className="w-full h-[65vh] bg-white rounded shadow-sm border border-gray-200 dark:border-gray-700" 
                  />
                )
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(viewFile.type)}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Please download the file to view its contents.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-500">
                <p>Category: <span className="font-medium">{viewFile.category}</span> · Size: {viewFile.size}</p>
                <p>Uploaded by {viewFile.uploadedBy} on {viewFile.date}</p>
              </div>
              <button className="btn-primary flex items-center gap-2 py-2">
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
