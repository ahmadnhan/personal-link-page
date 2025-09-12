import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadCloudIcon, FileIcon, DownloadIcon, TrashIcon, XIcon, ErrorIcon } from './icons';

// Define a type for the file with its preview URL
interface UploadedFile {
  file: File;
  previewUrl: string;
}

// Local storage key
const LOCAL_STORAGE_KEY = 'uploadedFiles';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFile | null;
  onSave: (file: UploadedFile) => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, file, onSave }) => {
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Reset error state when a new file is opened
      setLoadingError(false);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !file) {
    return null;
  }

  const renderContent = () => {
    if (loadingError) {
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ErrorIcon />
            <h3 className="text-xl font-bold text-red-500 dark:text-red-400">فشل تحميل الملف</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm">
              حدث خطأ أثناء محاولة عرض هذا الملف. قد يكون الملف تالفًا أو أن الرابط لم يعد صالحًا.
            </p>
            <button onClick={onClose} className="mt-4 flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors">
              <span>الرجوع</span>
            </button>
          </div>
        );
    }

    const { type } = file.file;

    if (type.startsWith('image/')) {
      return <img src={file.previewUrl} alt={file.file.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" onError={() => setLoadingError(true)} />;
    }
    if (type.startsWith('video/')) {
      return <video src={file.previewUrl} controls className="max-w-full max-h-[80vh] rounded-lg" onError={() => setLoadingError(true)} />;
    }
    if (type.startsWith('audio/')) {
        return <audio src={file.previewUrl} controls className="w-full" onError={() => setLoadingError(true)} />;
    }
    if (type === 'application/pdf') {
      return <iframe src={file.previewUrl} title={file.file.name} className="w-[80vw] h-[80vh] border-0 rounded-lg" />;
    }
    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="w-24 h-24">
            <FileIcon />
        </div>
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300 text-center break-all" title={file.file.name}>
          {file.file.name}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
            لا تتوفر معاينة لنوع هذا الملف.
        </p>
        <button onClick={() => onSave(file)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors">
            <DownloadIcon />
            <span>تحميل</span>
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-viewer-title"
    >
      <div
        className="relative w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl m-4 animate-modal-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 id="file-viewer-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate pr-4" title={file.file.name}>
                {file.file.name}
            </h2>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Close viewer"
            >
                <XIcon />
            </button>
        </div>
        <div className="p-4 flex items-center justify-center">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};


const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to convert data URL to File object
const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};


const FileDropzone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // Load files from localStorage on initial render
  useEffect(() => {
    try {
      const storedFilesJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFilesJSON) {
        const storedFiles: { name: string; dataUrl: string }[] = JSON.parse(storedFilesJSON);
        if (Array.isArray(storedFiles)) {
          const loadedFiles: UploadedFile[] = storedFiles.map(storedFile => {
            const file = dataURLtoFile(storedFile.dataUrl, storedFile.name);
            return {
              file: file,
              previewUrl: storedFile.dataUrl,
            };
          });
          setFiles(loadedFiles);
        }
      }
    } catch (error) {
      console.error("Failed to load files from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Save files to localStorage whenever the files state changes
  useEffect(() => {
    try {
      if (files.length > 0) {
        const filesToStore = files.map(f => ({
          name: f.file.name,
          dataUrl: f.previewUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filesToStore));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save files to localStorage. Files might be too large.", error);
    }
  }, [files]);
  
  // Function to process and set files
  const processFiles = useCallback((fileList: FileList) => {
    const filesToProcess = Array.from(fileList);

    const filePromises = filesToProcess.map(file => {
      return new Promise<UploadedFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              resolve({
                  file,
                  previewUrl: e.target?.result as string,
              });
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newFiles => {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }).catch(error => {
        console.error("Error processing files:", error);
    });
  }, []);
  
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleDelete = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
  };
  
  const handleSave = async (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.previewUrl;
    link.setAttribute('download', file.file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpen = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  const renderFilePreview = (file: UploadedFile) => {
    const { type } = file.file;
    if (type.startsWith('image/')) {
      return <img src={file.previewUrl} alt={file.file.name} className="w-full h-full object-cover" />;
    }
    if (type.startsWith('video/')) {
      return <video src={file.previewUrl} className="w-full h-full object-cover bg-black" />;
    }
    return <FileIcon />;
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full p-6 border-2 border-dashed rounded-2xl transition-all duration-300
          bg-black/5 dark:bg-white/10 backdrop-blur-sm
          ${isDragging ? 'border-fuchsia-500 scale-105 shadow-2xl' : 'border-slate-400/50 dark:border-slate-600/50'}`}
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
          <div className="flex flex-col items-center justify-center text-center gap-4 text-slate-500 dark:text-slate-400">
            <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <UploadCloudIcon />
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              اسحب وأفلت ملفاتك هنا
            </p>
            <p className="text-sm">أو <span className="font-semibold text-violet-500 dark:text-violet-400">تصفح ملفاتك</span></p>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-8 animate-fade-in-up">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">الملفات المرفوعة</h3>
          <div className="flex flex-col gap-4">
            {files.map((uploadedFile, index) => (
              <div key={`${uploadedFile.file.name}-${index}`} className="flex items-center justify-between gap-4 p-3 bg-white/10 dark:bg-black/20 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div 
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleOpen(uploadedFile)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(uploadedFile); }}
                  aria-label={`Open file ${uploadedFile.file.name}`}
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {renderFilePreview(uploadedFile)}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={uploadedFile.file.name}>
                          {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(uploadedFile.file.size)}
                      </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleSave(uploadedFile); }} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-green-500/20 hover:text-green-500 transition-colors" aria-label="Save file">
                        <DownloadIcon />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(uploadedFile.file.name); }} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition-colors" aria-label="Delete file">
                        <TrashIcon />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedFile && (
        <FileViewerModal 
            isOpen={!!selectedFile}
            onClose={handleCloseModal}
            file={selectedFile}
            onSave={handleSave}
        />
      )}
    </div>
  );
};

export default FileDropzone;