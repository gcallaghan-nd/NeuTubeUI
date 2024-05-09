import { Component, OnInit } from '@angular/core';
import { VideoService } from './video.service';
import {
  QuestionAnswerResponse,
  SearchQuestionAnswerResponse,
  Video,
  VideoAnalysisResponse,
} from './video-response';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

/**
 * AppComponent is the main component of the application.
 * It handles video file upload, video processing, and user interactions related to video analysis.
 *
 * @property {number} totalFrames - Total number of frames in the current video.
 * @property {number|null} selectedIndex - Index of the selected time or frame in the timesList.
 * @property {string|null} selectedVideoHash - Hash of the currently selected video.
 * @property {number} target_interval - Interval used for converting frame indexes to time format.
 * @property {string} searchQuery - Query string used for searching videos.
 * @property {SearchQuestionAnswerResponse[]} searchResults - Array of search results containing matching frames and video descriptions.
 * @property {{ [key: string]: boolean }} expandedState - Object tracking the expanded state of each video's frame list.
 * @property {File|null} videoFile - The video file selected for processing.
 * @property {boolean} loading - Indicates if a video is currently loading.
 * @property {string|ArrayBuffer|null} videoUrl - URL of the video to display.
 * @property {boolean} isProcessingVideo - True if the video is being processed.
 * @property {string} description - Description of the video analysis results.
 * @property {string[]} answer - Array containing answers to user's questions about the video.
 * @property {string[]} timesList - Array of times corresponding to frames identified in the video.
 * @property {string} question - User's question about the video.
 * @property {boolean} isProcessingQuestion - True if a question is being processed.
 * @property {boolean} isProcessingData - True if any data related to the video is being processed.
 * @property {boolean} isIndexingVideo - True if the video is currently being indexed.
 * @property {number} videoDuration - Duration of the video in seconds.
 * @property {boolean} showError - True if an error message should be displayed.
 * @property {boolean} sendBtnClicked - True if the send button has been clicked.
 * @property {string} errorMessage - Error message to display when showError is true.
 * @property {Video[]} uploadedVideos - Array of videos that have been processed.
 *
 * @constructor
 * @param {VideoService} videoService - Service for handling video-related operations.
 */
export class AppComponent implements OnInit {
  title = 'gpt-vision';
  videoUrl: string | ArrayBuffer | null = null;
  loading: boolean = false;
  description: string = '';
  answer: string[] = [];
  timesList: string[] = [];
  question: string = '';
  isProcessingVideo: boolean = false;
  isProcessingQuestion: boolean = false;
  isProcessingData: boolean = false;
  isIndexingVideo: boolean = false;
  videoFile: File | null = null;
  videoDuration: number = 0;

  showError: boolean = false;
  sendBtnClicked: boolean = false;
  errorMessage: string = '';
  uploadedVideos: Video[] = [];

  totalFrames: number = 0;
  selectedIndex: number | null = null;
  selectedVideoHash: string | null = null;
  target_interval: number = 60;

  searchQuery: string = '';
  searchResults: SearchQuestionAnswerResponse[] = [];
  expandedState: { [key: string]: boolean } = {};
  hasTotalFrames: boolean = false;

  constructor(private videoService: VideoService) {
    console.log('AppComponent constructor');
  }

  ngOnInit() {
    this.fetchProcessedVideos();
  }

  /**
   * Fetches the list of processed videos from the server.
   *
   * This method calls the `listProcessedVideos` method of the `VideoService`
   * to retrieve the list of processed videos. It subscribes to the Observable
   * returned by the service, and on successful response, it maps the received
   * data into the structure expected by the `uploadedVideos` array.
   *
   * Each video's data is transformed to include a thumbnail URL, a video URL,
   * a title, and a description. These fields are populated based on the response
   * from the server. The thumbnail and video URLs are placeholders in this example
   * and should be replaced with actual URLs from the server response.
   *
   * In case of an error during the fetch, it logs the error to the console
   * and sets `uploadedVideos` to an empty array.
   */
  fetchProcessedVideos() {
    this.videoService.listProcessedVideos().subscribe(
      (response: VideoAnalysisResponse[]) => {
        this.uploadedVideos = response.map((video) => {
          return {
            thumbnail: video.thumbnail,
            videoUrl: video.videoUrl,
            title: video.video_name,
            description: video.description,
            video_hash: video.video_hash,
          };
        });
      },
      (error) => {
        console.error('Error fetching processed videos:', error);
        this.uploadedVideos = [];
      }
    );
  }

  /**
   * This method is triggered when a video file is selected.
   * It reads the file, sets it as the current video file, and sends it to the `VideoService` for analysis.
   * @param {File} event - The selected video file.
   */
  onVideoUpload(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.videoFile = file;
      this.videoUrl = null;

      this.loading = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (typeof e.target?.result === 'string') {
          this.videoUrl = e.target.result as string;
          this.loading = false;

          const videoElement = document.createElement('video');
          videoElement.src = this.videoUrl;

          videoElement.addEventListener('loadedmetadata', () => {
            this.videoDuration = videoElement.duration;
            console.log(`Video duration: ${this.videoDuration} seconds`);
          });

          videoElement.load();
        }
      };

      reader.readAsDataURL(file);
    }

    this.isProcessingVideo = true;
    this.isProcessingData = true;

    this.videoService
      .analyzeVideo(file)
      .subscribe((response: VideoAnalysisResponse) => {
        this.description = response.description;
        this.isProcessingVideo = false;
        this.isProcessingData = false;
        this.totalFrames = response.total_frames;
        this.fetchProcessedVideos();
      });

    this.indexVideo(file);
  }

  /**
   * Loads the video based on the provided hash, URL, and description.
   * It sets the selected video hash and updates the video URL and description.
   * This method also handles the video playback and ensures that the "Summary" tab is active.
   *
   * @param {string} selectedHash - The unique hash of the selected video. Used for identifying which video is currently active.
   * @param {string} videoUrl - The URL of the video to be loaded. This URL is used as the source for the video element.
   * @param {string} description - A brief description of the video content. This description is displayed in the UI.
   */
  loadVideo(
    selectedHash: string,
    videoUrl: string,
    description: string,
    totalFrames: number = 0,
    time: string = "0"
  ) {
    // Setting the current video's hash, URL, and description
    this.selectedVideoHash = selectedHash;
    this.videoUrl = videoUrl;
    this.description = description;

    // Selecting the video element and setting its source
    const videoElement: HTMLVideoElement = document.querySelector(
      'video'
    ) as HTMLVideoElement;
    if (videoElement) {
      videoElement.src = videoUrl;

      // Once the video data is loaded, play the video
      videoElement.onloadeddata = () => {
        const [minutes, seconds] = time.split(':').map(Number);
        videoElement.currentTime = minutes * this.target_interval + seconds;
        videoElement.play();
      };

      // Loading the video source
      videoElement.load();
    }

    // Ensuring the Summary tab is active when a new video is loaded
    const summaryTab = document.getElementById('summary-tab');
    if (summaryTab) {
      summaryTab.click();
    }

    if (totalFrames > 0) {
      this.totalFrames = totalFrames;
      this.hasTotalFrames = true;
    } else {
      this.hasTotalFrames = false;
    }

    // Resetting various states and selections
    this.isProcessingVideo = false;
    this.isProcessingQuestion = false;
    this.isIndexingVideo = false;
    this.timesList = [];
    this.question = '';
    this.selectedIndex = null;
    this.sendBtnClicked = false;
  }

  /**
   * Prevents the default behavior when a draggable element is dragged over a drop zone.
   *
   * @param {Event} event - The dragover event.
   */
  onDragOver(event: Event) {
    event.preventDefault();
  }

  /**
   * Handles the drop event when a file is dropped into the drop zone.
   *
   * It prevents the default behavior and checks if the dropped item is a file.
   * If it's a file and of type 'video', it calls `uploadVideo` to handle the file upload.
   * Otherwise, it displays an error message indicating the file is not a valid video.
   *
   * @param {any} event - The drop event containing the file data.
   */
  onDrop(event: any) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files) {
      const file = event.dataTransfer.files[0];
      if (file.type.match('video.*')) {
        this.uploadVideo(file);
      } else {
        this.showError = true;
        this.errorMessage = 'The file is not a valid video.';
        setTimeout(() => (this.showError = false), 5000);
      }
    }
  }

  /**
   * Initiates the video upload process.
   *
   * This method is called when a video file is selected or dropped into the upload area.
   * It triggers the `onVideoUpload` method with the selected file, effectively starting
   * the process of video upload and analysis.
   *
   * @param {File} file - The video file to be uploaded.
   */
  uploadVideo(file: File) {
    this.onVideoUpload({ target: { files: [file] } });
  }

  /**
   * This method is triggered when a question is asked about the video.
   * It sends the current video file and the question to the `VideoService` and sets the answer.
   */
  onAskQuestion() {
    if (
      this.selectedVideoHash === null ||
      this.selectedVideoHash === '' ||
      !this.selectedVideoHash
    ) {
      console.error('No video file available');
      return;
    }

    this.isProcessingQuestion = true;
    this.isProcessingData = true;

    let videoSelection = this.selectedVideoHash;

    if (this.hasTotalFrames) {
      const totalFramesString = this.totalFrames.toString();
      const lengthToRemove = totalFramesString.length;
      videoSelection = this.selectedVideoHash.slice(0, -lengthToRemove);
    }

    this.videoService.askQuestion(videoSelection, this.question).subscribe(
      (response: QuestionAnswerResponse) => {
        this.timesList = Array.from(
          new Set(
            response.result.answer.map((frameIndex) =>
              this.convertFrameToTime(
                frameIndex,
                response.video_description.total_frames,
                response.video_description.video_duration
              )
            )
          )
        );
        this.isProcessingQuestion = false;
        this.isProcessingData = false;
        this.sendBtnClicked = true;
      },
      (error) => {
        console.error('Error:', error);
        this.isProcessingQuestion = false;
        this.isProcessingData = false;
      }
    );

    console.log('Result:' + this.timesList);
  }

  /**
   * Converts a frame index to a time format (minutes:seconds).
   *
   * This method calculates the time at which a particular frame appears in the video
   * based on the total number of frames and the total duration of the video.
   *
   * @param {number} frameIndex - The index of the frame in the video.
   * @param {number} totalFrames - The total number of frames in the video.
   * @param {number} totalDuration - The total duration of the video in seconds.
   * @returns {string} The calculated time in 'minutes:seconds' format.
   */
  convertFrameToTime(
    frameIndex: number,
    totalFrames: number,
    totalDuration: number
  ): string {
    const fps = totalFrames / totalDuration;

    const timeInSeconds = frameIndex / fps;

    const minutes = Math.floor(timeInSeconds / this.target_interval);
    const seconds = Math.floor(timeInSeconds % this.target_interval);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Seeks the video to a specific time.
   *
   * This method is used to jump the video to a particular time point. It splits the
   * provided time string into minutes and seconds, calculates the total time in seconds,
   * and sets the `currentTime` property of the video element to this value.
   *
   * @param {string} time - The time to which the video should jump, in 'minutes:seconds' format.
   * @param {number} index - The index of the time in the `timesList` array.
   */
  seekToTime(time: string, index: number) {
    this.selectedIndex = index;

    const [minutes, seconds] = time.split(':').map(Number);
    const videoElement = document.querySelector('video');

    if (videoElement) {
      videoElement.currentTime = minutes * this.target_interval + seconds;
    }
  }

  /**
   * Seeks the video to a specific time, considering the hash of the video.
   * If the video related to the provided hash is different from the currently selected video,
   * it loads the new video and then seeks to the specified time.
   * If the same video is already selected, it just seeks to the specified time.
   *
   * @param time The time in 'minutes:seconds' format to which the video should jump.
   * @param index The index of the frame in the list.
   * @param videoHash The hash of the video including the total frames. Used to identify the video.
   * @param {number} totalFrame - The total number of frames in the video.
   */
  seekToTimeForSearch(
    time: string,
    index: number,
    videoHash: string,
    totalFrame: number
  ) {
    // Find the video corresponding to the provided hash from the search results.
    const selectedVideo = this.searchResults.find(
      (video) =>
        video.video_description &&
        video.video_description.video_hash +
          video.video_description.total_frames ===
          videoHash
    );

    // If the video is found
    if (selectedVideo) {
      // Check if the currently selected video is different from the found video
      if (videoHash !== this.selectedVideoHash) {
        // Load and play the new video
        this.loadVideo(
          videoHash,
          selectedVideo.video_description.videoUrl,
          selectedVideo.video_description.description,
          totalFrame,
          time
        );
      } else {
        // If the same video is already selected, just seek to the specific time
        this.selectedIndex = index;
        const [minutes, seconds] = time.split(':').map(Number);
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.currentTime = minutes * this.target_interval + seconds;
        }
      }
    } else {
      console.error('Video not found for hash: ' + videoHash);
    }
  }

  /**
   * Initiates indexing of the uploaded video.
   *
   * This method calls the `indexVideo` method of the `VideoService` with the provided video file.
   * On successful response, it sets `isIndexingVideo` to false. In case of an error,
   * it logs the error and also sets `isIndexingVideo` to false.
   *
   * @param {File} file - The video file to be indexed.
   */
  indexVideo(file: File) {
    this.isIndexingVideo = true;
    this.videoService.indexVideo(file).subscribe(
      (response) => {
        console.log(response);
        this.isIndexingVideo = false;
      },
      (error) => {
        console.error('Error:', error);
        this.isIndexingVideo = false;
      }
    );
  }

  /**
   * Executes a search query and updates search results.
   * Only performs a search if the query string is not empty.
   */
  onSearch() {
    if (this.searchQuery) {
      this.videoService.search(this.searchQuery).subscribe((response) => {
        this.searchResults = response.map((video) => {
          video.matching_frames = [...new Set(video.matching_frames)];
          return video;
        }).map((video) => {
          video.matching_frames.sort((a, b) => a - b);
          return video;
        });
      });
    }
  }
}
