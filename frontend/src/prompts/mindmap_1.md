Given a subject, syllabus, and potentially additional notes and resource URLs, generate a comprehensive mindmap following these precise requirements:

1. Core Structure:
   - Create the primary node using the main subject title
   - First-level branches must directly correspond to the main topics from the syllabus
   - Second-level branches must map to subtopics from the syllabus
   - Deeper levels should incorporate detailed content from both syllabus and provided notes

2. Content Integration:
   - When notes contain topics not explicitly in the syllabus, logically categorize them under the most relevant syllabus section
   - Maintain hierarchical relationships between topics based on their logical connection

3. Response Format:
   - Return ONLY valid JSON without any commentary, explanations or markdown formatting
   - Follow exactly this nested structure pattern:

```json
{
  "title": "MAIN_SUBJECT",
  "is_end_node": false,
  "subtopics": [
    {
      "title": "TOPIC_1",
      "is_end_node": false,
      "subtopics": [
        {
          "title": "SUBTOPIC_1.1",
          "is_end_node": false,
          "subtopics": [
            {
              "title": "DETAIL_1.1.1",
              "is_end_node": true,
            },
            {
              "title": "DETAIL_1.1.2",
              "is_end_node": true,
            }
          ]
        }
      ]
    }
  ]
}
```