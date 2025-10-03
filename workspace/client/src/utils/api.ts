export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

// TypeScript global for debugAPI
declare global {
  interface Window {
    debugAPI: () => Promise<any>;
  }
}

export const debugAPI = async (): Promise<any> => {
  try {
    console.log('🔍 Testing TutorMitra backend connection...');
    
    // Test main API
    const testResponse = await fetch(`${API_BASE_URL}/test`);
    if (!testResponse.ok) {
      throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
    }
    const testData = await testResponse.json();
    console.log('✅ Backend Test:', testData);
    
    // Test courses API
    const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
    if (!coursesResponse.ok) {
      throw new Error(`HTTP ${coursesResponse.status}: ${coursesResponse.statusText}`);
    }
    const coursesData = await coursesResponse.json();
    console.log('✅ Courses API:', coursesData);
    
    // FIXED: Test tutors API (correct plural route)
    const tutorsResponse = await fetch(`${API_BASE_URL}/tutors`);
    if (!tutorsResponse.ok) {
      throw new Error(`HTTP ${tutorsResponse.status}: ${tutorsResponse.statusText}`);
    }
    const tutorsData = await tutorsResponse.json();
    console.log('📝 Tutors API:', tutorsData);
    
    return { 
      success: true,
      test: testData, 
      courses: coursesData,
      tutors: tutorsData,
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('❌ API Connection Failed:', errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};

// Attach to window for debugging
if (typeof window !== 'undefined') {
  window.debugAPI = debugAPI;
}

// API utility functions (rest same)
export const apiUtils = {
  test: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      return await response.json();
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
  getCourses: async (filters?: Record<string, string>) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/courses?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
  uploadImage: async (file: File, token?: string) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/tutors/upload-image`, { // FIXED (plural)
        method: 'POST',
        body: formData,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
};
