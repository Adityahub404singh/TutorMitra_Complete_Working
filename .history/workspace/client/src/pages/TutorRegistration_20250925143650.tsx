import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const TutorRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    qualification: '',
    experience: '',
    subjects: '',
    bio: '',
    kycDocument: null as File | null,
  });

  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, kycDocument: e.target.files![0] }));
    }
  };

  const validateForm = () => {
    if (!form.qualification.trim()) {
      setError('Qualification is required.');
      return false;
    }
    if (!form.experience.trim()) {
      setError('Experience is required.');
      return false;
    }
    if (!form.subjects.trim()) {
      setError('Subjects taught is required.');
      return false;
    }
    if (!form.kycDocument) {
      setError('Please upload your KYC document.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);
    setError('');

    try {
      // Create FormData to send file and other data
      const formData = new FormData();
      formData.append('qualification', form.qualification);
      formData.append('experience', form.experience);
      formData.append('subjects', form.subjects);
      formData.append('bio', form.bio);
      formData.append('kycDocument', form.kycDocument!);

      // Replace the following URL with your real API endpoint
      const response = await fetch('/api/tutor/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // On success, navigate to tutor dashboard or next page
      navigate('/tutor-dashboard');
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tutor-registration-form">
      <h2>Tutor Registration</h2>
      {error && <p className="error-text">{error}</p>}

      <label>
        Qualification *
        <input
          type="text"
          name="qualification"
          value={form.qualification}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Experience (Years) *
        <input
          type="text"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Subjects Taught *
        <input
          type="text"
          name="subjects"
          value={form.subjects}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Brief Bio
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
        />
      </label>

      <label>
        Upload KYC Document (ID proof) *
        <input
          type="file"
          name="kycDocument"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          required
        />
      </label>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default TutorRegistration;
