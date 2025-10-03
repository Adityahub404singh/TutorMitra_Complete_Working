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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setError('Qualification is required');
      return false;
    }
    if (!form.experience.trim()) {
      setError('Experience is required');
      return false;
    }
    if (!form.subjects.trim()) {
      setError('Subjects taught is required');
      return false;
    }
    if (!form.kycDocument) {
      setError('Please upload your KYC document');
      return false;
    }
    setError('');
    return true;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('qualification', form.qualification);
      formData.append('experience', form.experience);
      formData.append('subjects', form.subjects);
      formData.append('bio', form.bio);
      formData.append('kycDocument', form.kycDocument!);

      const res = await fetch('/api/tutor/register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }

      navigate('/tutor-dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Tutor Registration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>
        Qualification *
        <input
          name="qualification"
          value={form.qualification}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Experience (years) *
        <input
          name="experience"
          value={form.experience}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Subjects taught *
        <input
          name="subjects"
          value={form.subjects}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Bio
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
        />
      </label>

      <label>
        Upload KYC Document *
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default TutorRegistration;
