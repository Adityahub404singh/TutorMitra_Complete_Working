import React, { useState, ChangeEvent } from "react";

type Props = {
  currentImageUrl?: string; // Existing profile image URL
  name: string;             // User's name (for initials avatar)
  onCropped: (file: File | null) => void; // Callback when user selects/updates image
};

export default function ProfileUploader({ currentImageUrl, name, onCropped }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("File is too large. Max 20MB allowed.");
        e.target.value = "";
        setPreview(null);
        onCropped(null);
        return;
      }
      setPreview(URL.createObjectURL(file));
      onCropped(file);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=0D8ABC&color=fff`;

  return (
    <div className="flex flex-col items-center mb-6">
      <img
        src={preview || currentImageUrl || defaultAvatar}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="mt-3"
      />
    </div>
  );
}
