Map resources to a provided mindmap following these precise requirements:

1. Input:
   - A mindmap for {topic} based on syllabus and notes
   - Two sets of YouTube video links with title, URL, and duration
   - Total study time: {time}

2. Resource Mapping Logic:
   - For each leaf node in the mindmap:
     - First, attempt to match with videos from set 1
     - If no match in set 1, attempt to match with videos from set 2
     - If no match in either set, assign generated notes as the resource

3. Resource Type Requirements:
   - YouTube videos link.
   - Generated notes: Create concise, topic-specific content in markdown format
   - Ensure all resources collectively fit within the specified {time} constraint

4. Response Format:
   - Return TWO separate JSON objects without any commentary or explanations:

5. First JSON - Complete Mindmap with Resources:
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
              "type": "Notes",
              "resource": {
                "id": "unique-resource-id"
              }
            },
            {
              "title": "DETAIL_1.1.2",
              "is_end_node": true,
              "type": "youtube_video",
              "resource": {
                "id": "unique-resource-id",
                "data": {
                  "url": "https://youtu.be/video-id"
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

- second json format
```json
[
  {
    "id": "unique-resource-id",
    "data": "# Title\n\n## Subtopic\n\nDetailed markdown content with explanations...\n\n"
  },
  {
    "id": "unique-resource-id",
    "data": "# Another Topic\n\n## Key Points\n\n- Point 1\n- Point 2\n\n"
  }
]
```