import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  VideoAnalysisResponse,
  QuestionAnswerResponse,
  VideoIndexResponse,
  SearchQuestionAnswerResponse,
} from './video-response';
import { Observable } from 'rxjs';

/**
 * `VideoService` class
 *
 * This service class provides methods to interact with the video analysis API.
 *
 * @class
 * @exports
 */
@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = 'http://localhost:7071/api';

  constructor(private http: HttpClient) {}

  /**
   * `analyzeVideo` method
   *
   * This method sends a video file to the API for analysis.
   *
   * @param {File} videoFile - The video file to be analyzed.
   * @returns {Observable<VideoAnalysisResponse>} - An Observable that will emit the analysis response from the API.
   */
  analyzeVideo(videoFile: File): Observable<VideoAnalysisResponse> {
    const formData: FormData = new FormData();
    formData.append('video', videoFile, videoFile.name);

    return this.http.post<VideoAnalysisResponse>(
      `${this.apiUrl}/analyze-video`,
      formData
    );
  }

  /**
   * `askQuestion` method
   *
   * This method sends a video file and a question to the API, and receives an answer related to the video content.
   *
   * @param {File} file - The video file related to the question.
   * @param {string} question - The question to be answered.
   * @returns {Observable<QuestionAnswerResponse>} - An Observable that will emit the answer response from the API.
   */
  askQuestion(
    file: string,
    question: string
  ): Observable<QuestionAnswerResponse> {
    const formData: FormData = new FormData();
    formData.append('video', file);
    formData.append('question', question);

    return this.http.post<QuestionAnswerResponse>(
      `${this.apiUrl}/ask-question`,
      formData
    );
  }

  /**
   * `indexVideo` method
   *
   * This method sends a video file to the server for indexing.
   * It posts the video file to the '/index-video' endpoint where it is processed.
   * The method uses FormData to handle the file upload.
   *
   * @param {File} videoFile - The video file to be indexed.
   * @returns {Observable<VideoIndexResponse>} An Observable that will emit the response from the server.
   * The response typically contains information about the indexing process, such as a status message or an identifier for the indexed video.
   */
  indexVideo(videoFile: File): Observable<VideoIndexResponse> {
    const formData: FormData = new FormData();
    formData.append('video', videoFile, videoFile.name);

    return this.http.post<VideoIndexResponse>(
      `${this.apiUrl}/index-video`,
      formData
    );
  }

  /**
   * `listProcessedVideos` method
   *
   * This method fetches the list of processed videos from the API.
   * It makes a GET request to the '/list-processed-videos' endpoint.
   *
   * @returns {Observable<VideoAnalysisResponse>} An Observable that will emit the list of processed videos.
   */
  listProcessedVideos(): Observable<VideoAnalysisResponse[]> {
    return this.http.get<VideoAnalysisResponse[]>(
      `${this.apiUrl}/list-processed-videos`
    );
  }

  /**
   * Sends a search query to the server and retrieves the search results.
   *
   * This method sends a GET request to the '/search' endpoint of the server, passing the user's query
   * as a keyword parameter. It returns an Observable of an array of `SearchQuestionAnswerResponse`.
   * Each item in this array represents a response related to the search query, containing information
   * such as the matching frames in a video and the video's description.
   *
   * @param question The user's search query.
   * @returns An Observable that emits an array of `SearchQuestionAnswerResponse` objects.
   */
  search(question: string): Observable<SearchQuestionAnswerResponse[]> {
    return this.http.get<SearchQuestionAnswerResponse[]>(
      `${this.apiUrl}/search?keyword=${question}`
    );
  }
}
