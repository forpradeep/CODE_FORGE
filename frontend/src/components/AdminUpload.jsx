import { useParams, NavLink } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { ChevronLeft, Upload, FileVideo, CheckCircle2, AlertCircle } from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please check network/Cloudinary keys.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-base-content/10">
          <NavLink to="/admin/video" className="btn btn-sm btn-ghost btn-square rounded-lg">
            <ChevronLeft className="w-5 h-5 text-base-content/70" />
          </NavLink>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-base-content">
              Upload Video Solution
            </h1>
            <p className="text-xs text-base-content/60">
              Attach an editorial walkthrough video for candidates.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">Select Video File (.mp4, .webm)</span>
              </label>
              <input
                type="file"
                accept="video/*"
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) => {
                      if (!files || !files[0]) return 'Please select a video file';
                      const file = files[0];
                      return file.type.startsWith('video/') || 'Please select a valid video file';
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true;
                      const file = files[0];
                      const maxSize = 100 * 1024 * 1024; // 100MB
                      return file.size <= maxSize || 'File size must be less than 100MB';
                    }
                  }
                })}
                className={`file-input file-input-bordered file-input-sm w-full rounded-xl ${errors.videoFile ? 'file-input-error' : ''}`}
                disabled={uploading}
              />
              {errors.videoFile && (
                <span className="text-error text-xs mt-1">{errors.videoFile.message}</span>
              )}
            </div>

            {selectedFile && (
              <div className="p-3.5 rounded-xl bg-base-200/60 border border-base-content/10 flex items-center gap-3 text-xs">
                <FileVideo className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-bold truncate">{selectedFile.name}</p>
                  <p className="text-base-content/50">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Uploading to Cloudinary...</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full h-2 rounded-full" 
                  value={uploadProgress} 
                  max="100"
                />
              </div>
            )}

            {errors.root && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {uploadedVideo && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 space-y-1 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload Successful!</span>
                </div>
                <p className="text-base-content/70">Duration: {formatDuration(uploadedVideo.duration)}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-sm btn-primary rounded-xl font-bold gap-2"
              >
                {uploading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Video</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AdminUpload;