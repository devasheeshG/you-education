'use client';
import YouTubePlayer from "@/components/youtube_player/youtube_player";
export default function TestPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Test Page</h1>
            <p className="text-lg">This is a test page.</p>
            <h1 className="text-xl font-semibold mb-4">Watch this video</h1>
      <YouTubePlayer url="https://www.youtube.com/watch?v=ETV17M4SauU" />
        </div>
    );
}