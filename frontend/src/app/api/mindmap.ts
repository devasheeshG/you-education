// Define types for the mindmap API
export interface MindmapResource {
  type: string;
  data: {
    url?: string;
    title: string;
    description?: string;
  };
}

export interface MindmapNode {
  title: string;
  is_last_subtopic: boolean;
  subtopics?: MindmapNode[];
  resources?: MindmapResource[];
}

export interface MindmapResponse {
  mindmap: MindmapNode;
}

/**
 * Get mindmap for an exam
 * @param examId The ID of the exam
 * @param refresh Whether to force regeneration of the mindmap (default: false)
 */
export const getMindmap = async (
  examId: string,
  refresh: boolean = false
): Promise<MindmapResponse> => {
  try {
    const url = new URL(`/api/proxy/exams/${examId}/mindmap`, window.location.origin);
    
    // Add refresh parameter if true
    if (refresh) {
      url.searchParams.append('refresh', 'true');
    }
    console.log('Fetching mindmap for examId:', examId);
    console.log('Fetching mindmap from:', url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Mindmap data:', data);
    
    // Ensure the response always has a top-level mindmap field
    if (!('mindmap' in data)) {
      return { mindmap: data } as MindmapResponse;
    }
    return data as MindmapResponse;
  } catch (error) {
    console.error('Failed to fetch mindmap:', error);
    throw error;
  }
};