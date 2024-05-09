/**
 * Interface representing the response from a video analysis operation.
 *
 * @property {string} description - Textual description of the video analysis results.
 * @property {number} total_frames - Total number of frames in the analyzed video.
 * @property {string} video_name - Name of the analyzed video.
 * @property {string} video_hash - Unique hash identifier for the video.
 * @property {string} videoUrl - URL of the analyzed video.
 * @property {string} thumbnail - URL of the video's thumbnail image.
 * @property {number} video_duration - Duration of the analyzed video in seconds.
 */
export interface VideoAnalysisResponse {
  description: string;
  total_frames: number;
  video_name: string;
  video_hash: string;
  videoUrl: string;
  thumbnail: string;
  video_duration: number;
}

/**
 * Interface representing the response from a question answering operation regarding a video.
 *
 * @property {string} question - The question asked about the video.
 * @property {number[]} answer - Array of frame indices as answers to the question.
 */
export interface AnswerResponse {
  question: string;
  answer: number[];
}

/**
 * Interface representing the response from a question answering operation regarding a video.
 *
 * @property {AnswerResponse} result - The answer response from the API.
 * @property {VideoAnalysisResponse} video_description - The video analysis response from the API.
 */
export interface QuestionAnswerResponse {
  result: AnswerResponse;
  video_description: VideoAnalysisResponse;
}

/**
 * Interface representing the response from the video indexing operation.
 *
 * @property {string} video_name - Name of the indexed video.
 * @property {string} video_id - Unique identifier for the indexed video.
 * @property {Array} response - Array of objects containing frame details and their corresponding descriptions.
 */
export interface VideoIndexResponse {
  video_name: string;
  video_id: string;
  response: Array<{
    frame: number;
    details: string[];
  }>;
}

/**
 * Interface representing a video object.
 *
 * @property {string} video_hash - Unique hash identifier for the video.
 * @property {string} thumbnail - URL of the video's thumbnail image.
 * @property {string} videoUrl - URL of the video.
 * @property {string} title - Title of the video.
 * @property {string} description - Description of the video.
 */
export interface Video {
  video_hash: string;
  thumbnail: string;
  videoUrl: string;
  title: string;
  description: string;
}

/**
 * Interface representing the response from a search operation.
 * 
 * @property {number[]} matching_frames - Array of frame indices that match the search query.
 * @property {VideoAnalysisResponse} video_description - The video analysis response from the API.
 */
export interface SearchQuestionAnswerResponse {
  matching_frames: number[];
  video_description: VideoAnalysisResponse;
}