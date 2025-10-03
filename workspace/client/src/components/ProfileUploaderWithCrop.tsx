import React, { useState, useCallback } from "react";
import ImageCropper from "./ImageCropper";
import { getCroppedImg } from "../utils/cropImage";

type Props = {
  currentImageUrl?: string;
  name: string;
  onCropped: (file: File | null) => void;
};

export default function ProfileUploaderWithCrop({ currentImageUrl, name, onCropped }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropSave = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedImageFile = new File([croppedImageBlob], 'cropped.jpg', {
        type: 'image/jpeg',
      });
      
      onCropped(croppedImageFile);
      setImageSrc(null);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [imageSrc, croppedAreaPixels, onCropped]);

  return (
    <div>
      {!imageSrc && (
        <input type="file" accept="image/*" onChange={onFileChange} />
      )}
      {imageSrc && (
        <div style={{ position: "relative", width: 310, height: 310, margin: "10px auto" }}>
          <ImageCropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: 10 }}>
            <button
              type="button"
              onClick={onCropSave}
              style={{ padding: "8px 16px", fontWeight: 600 }}
            >
              Crop & Save
            </button>
            <button
              type="button"
              onClick={() => setImageSrc(null)}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
