import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, AlertCircle, Loader2, CheckCircle2, Upload } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';

interface FaceScannerProps {
  onScanComplete: (success: boolean, descriptorData?: number[], imageUrl?: string) => void;
  isScanning: boolean;
  mode: 'register' | 'verify';
  targetDescriptor?: number[]; // Used for verify mode
}

export default function FaceScanner({ onScanComplete, isScanning, mode, targetDescriptor }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const detectIntervalRef = useRef<number | null>(null);
  const [status, setStatus] = useState<string>('Đang khởi tạo Camera...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successStatus, setSuccessStatus] = useState(false);
  const [useUpload, setUseUpload] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const loadModels = async () => {
      try {
        setStatus('Đang tải dữ liệu AI (Một lần duy nhất)...');
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        if (isMounted) setModelsLoaded(true);
      } catch (err) {
        console.error("Lỗi tải model:", err);
        if (isMounted) setErrorMsg('Không thể tải mô hình AI. Vui lòng kiểm tra mạng.');
      }
    };

    const startCamera = async () => {
      if (useUpload) return;
      try {
        setStatus('Đang bật camera...');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (isMounted) {
          setErrorMsg('Không thể truy cập camera. Vui lòng thử tải ảnh lên.');
        }
      }
    };

    if (isScanning && !useUpload) {
      setErrorMsg('');
      setSuccessStatus(false);
      setUploadedImageUrl(null);
      if (!modelsLoaded) {
        loadModels().then(() => startCamera());
      } else {
        startCamera();
      }
    }

    return () => {
      isMounted = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  }, [isScanning, modelsLoaded, useUpload]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!modelsLoaded) {
      alert("Mô hình AI chưa được tải xong, vui lòng đợi...");
      return;
    }

    const imgUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imgUrl);
    
    setUseUpload(true);
    setStatus('Đang phân tích khuôn mặt từ ảnh...');
    setErrorMsg('');
    setSuccessStatus(false);
  };

  const processUploadedImage = async () => {
    if (!imageRef.current) return;
    
    try {
      const detection = await faceapi.detectSingleFace(
        imageRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
      ).withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        const currentDescriptor = Array.from(detection.descriptor);

        if (mode === 'register') {
           setStatus('Đã ghi nhận dữ liệu sinh trắc học từ ảnh!');
           setSuccessStatus(true);
           setTimeout(() => onScanComplete(true, currentDescriptor, uploadedImageUrl!), 1000);
        } else if (mode === 'verify') {
           if (!targetDescriptor || targetDescriptor.length === 0) {
             setErrorMsg('Lỗi: Dữ liệu gốc không hợp lệ.');
             setTimeout(() => onScanComplete(false), 2000);
             return;
           }

           const targetFloat32 = new Float32Array(targetDescriptor);
           const distance = faceapi.euclideanDistance(detection.descriptor, targetFloat32);

           if (distance <= 0.45) { // Slightly more forgiving for static photos
             setStatus('Xác thực thành công!');
             setSuccessStatus(true);
             setTimeout(() => onScanComplete(true), 1000);
           } else {
             setErrorMsg('Khuôn mặt không khớp. Từ chối quyền truy cập.');
             setTimeout(() => onScanComplete(false), 2000);
           }
        }
      } else {
        setErrorMsg('Không tìm thấy khuôn mặt rõ ràng trong ảnh.');
        setUploadedImageUrl(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Đã xảy ra lỗi khi phân tích ảnh.');
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || useUpload) return;
    setStatus('Đang phân tích khuôn mặt... Vui lòng nhìn thẳng.');

    let failCount = 0;
    let matchCount = 0;

    detectIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.6 })
      ).withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        // Ensure refs are still valid after the async call
        if (!videoRef.current || !canvasRef.current) return;

        // Draw detection box
        const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        const canvasCtx = canvasRef.current!.getContext('2d');
        if (canvasCtx) canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        
        faceapi.draw.drawDetections(canvasRef.current!, resizedDetection);

        const currentDescriptor = Array.from(detection.descriptor);

        if (mode === 'register') {
          // Require a high confidence detection for registration to ensure a good quality baseline
          if (detection.detection.score < 0.85) {
            setStatus('Vui lòng đưa mặt vào giữa khung hình và giữ nguyên...');
            return;
          }
          
          matchCount++;
          if (matchCount >= 3) {
            if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
            setStatus('Đã ghi nhận dữ liệu sinh trắc học!');
            setSuccessStatus(true);
            
            let imageUrl: string | undefined;
            if (videoRef.current) {
               const captureCanvas = document.createElement('canvas');
               captureCanvas.width = videoRef.current.videoWidth;
               captureCanvas.height = videoRef.current.videoHeight;
               const ctx = captureCanvas.getContext('2d');
               if (ctx) {
                  // Mirror image because video is mirrored
                  ctx.translate(captureCanvas.width, 0); 
                  ctx.scale(-1, 1);
                  ctx.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
                  imageUrl = captureCanvas.toDataURL('image/jpeg', 0.8);
               }
            }

            setTimeout(() => onScanComplete(true, currentDescriptor, imageUrl), 1000);
          } else {
            setStatus(`Đang quét... (${matchCount}/3)`);
          }
        } else if (mode === 'verify') {
          if (!targetDescriptor || !Array.isArray(targetDescriptor) || targetDescriptor.length === 0) {
            if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
            setErrorMsg('Lỗi: Dữ liệu gốc không hợp lệ (Liên hệ admin).');
            setTimeout(() => onScanComplete(false), 2000);
            return;
          }

          if (detection.descriptor.length !== targetDescriptor.length) {
            if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
            setErrorMsg('Lỗi: Định dạng sinh trắc học không khớp.');
            setTimeout(() => onScanComplete(false), 2000);
            return;
          }

          const targetFloat32 = new Float32Array(targetDescriptor);
          const distance = faceapi.euclideanDistance(detection.descriptor, targetFloat32);

          // Stricter Threshold for face match: 0.40
          if (distance <= 0.40) {
            matchCount++;
            if (matchCount >= 3) {
              if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
              setStatus('Xác thực thành công!');
              setSuccessStatus(true);
              setTimeout(() => onScanComplete(true), 1000);
            } else {
              setStatus(`Giữ nguyên khuôn mặt... (${matchCount}/3)`);
            }
          } else {
            matchCount = 0;
            failCount++;
            if (failCount > 20) { // 20 attempts = approx 10 seconds
              if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
              setErrorMsg('Khuôn mặt không khớp. Từ chối quyền truy cập.');
              setTimeout(() => onScanComplete(false), 2000);
            } else {
              setStatus(`Đang xác thực... (Độ chênh lệch: ${distance.toFixed(2)})`);
            }
          }
        }
      } else {
        setStatus('Không tìm thấy khuôn mặt...');
        matchCount = 0;
        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && canvasRef.current) canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 500);

    // Clean up on component unmount is handled generally in useEffect, but we can also return a cleanup here 
    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    };
  };

  if (!isScanning) return null;

  return (
    <div className="w-full flex justify-center flex-col items-center">
      <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-2xl">
        {!uploadedImageUrl ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              onPlay={handleVideoPlay}
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
            />
          </>
        ) : (
          <img 
            ref={imageRef}
            src={uploadedImageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Uploaded face"
            onLoad={processUploadedImage}
          />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
          {errorMsg ? (
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
          ) : successStatus ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm font-bold text-center">{status}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium text-center">{status}</span>
            </div>
          )}
        </div>

        {!errorMsg && !successStatus && !uploadedImageUrl && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_3px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
        )}
      </div>

      <div className="mt-4 flex flex-col text-center">
        <label className="text-xs text-indigo-400 font-bold cursor-pointer hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 bg-white/5 py-2 px-4 rounded-xl border border-white/10 hover:bg-white/10">
          <Upload className="w-4 h-4" />
          Máy không có Camera? Tải ảnh lên
          <input 
             type="file" 
             accept="image/*" 
             className="hidden" 
             onChange={handleFileUpload} 
          />
        </label>
      </div>
    </div>
  );
}
