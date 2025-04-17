// Define types for the subject
export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface SubjectsResponse {
  subjects: Subject[];
}

export interface CreateSubjectRequest {
  name: string;
  color: string;
}

export interface UpdateSubjectRequest {
  name?: string;
  color?: string;
}

/**
 * Fetch all available subjects
 */
export const getAllSubjects = async (): Promise<SubjectsResponse> => {
  try {
    const response = await fetch('/api/proxy/subjects');
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    throw error;
  }
};

/**
 * Create a new subject
 */
export const createSubject = async (data: CreateSubjectRequest): Promise<Subject> => {
  const response = await fetch('/api/proxy/subjects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Update an existing subject
 */
export const updateSubject = async (subjectId: string, data: UpdateSubjectRequest): Promise<Subject> => {
  const response = await fetch(`/api/proxy/subjects/${subjectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete a subject
 */
export const deleteSubject = async (subjectId: string): Promise<void> => {
  const response = await fetch(`/api/proxy/subjects/${subjectId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
};