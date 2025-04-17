// Define types for references
export interface Reference {
  id: string;
  type: string;
  name: string;
  url?: string; 
}

export interface ReferencesResponse {
  references: Reference[];
}

export interface ReferenceCreateRequest {
  type: string;
  url: string;
}

/**
 * Upload a file as a reference for an exam
 */
export const uploadReferenceFile = async (examId: string, file: File): Promise<Reference> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/proxy/exams/${examId}/references/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Create a reference from a URL for an exam
 */
export const createReferenceFromUrl = async (
  examId: string, 
  data: ReferenceCreateRequest
): Promise<Reference> => {
  const response = await fetch(`/api/proxy/exams/${examId}/references/create`, {
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
 * Get all references for an exam
 */
export const getExamReferences = async (examId: string): Promise<ReferencesResponse> => {
  try {
    const response = await fetch(`/api/proxy/exams/${examId}/references`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch references:', error);
    throw error;
  }
};

/**
 * Get download URL for a reference
 */
export const getReferenceDownloadUrl = async (
  examId: string, 
  referenceId: string
): Promise<{ url: string }> => {
  const response = await fetch(
    `/api/proxy/exams/${examId}/references/${referenceId}/download`
  );
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete a reference
 */
export const deleteReference = async (
  examId: string, 
  referenceId: string
): Promise<void> => {
  const response = await fetch(
    `/api/proxy/exams/${examId}/references/${referenceId}`,
    {
      method: 'DELETE',
    }
  );
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
};