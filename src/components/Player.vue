<template>
  <div class="va-player" @mousemove="onMouseMove" @touchmove="onMouseMove">
      <div class="va-player__content">
        <div class="va-player__content__loading" v-show="isLoading" >
          <Loading />
        </div>

        <CanvasControls class="va-player__content__canvas-controls" v-if="showControlsOnFullscreen && !isDrawing && showAnnotationControls" 
          v-model:selectedColor="canvasSelectedColor"
          v-model:selectedAction="canvasSelectedAction"
          :colors="colors"/>

        <video class="va-player__content__video" disablePictureInPicture="true"
            ref="videoElement"
            :src="src"
            :poster="poster"
            :autoplay="autoplay"
            :loop="isLooping.valueOf()"
            :muted="isMuted.valueOf()"
            @timeupdate="onVideoTimeUpdate"
            @progress="onMetadataLoaded"
            @loadedmetadata="onMetadataLoaded"
            @waiting="isLoading = true"
            @canplay="isLoading = false">
          <slot name="videoContent"></slot>
        </video>

        <Canvas
          :stroke-width="strokeWidth"
          :stroke-color="canvasSelectedColor"
          :action-type="canvasSelectedAction"
          :width="playerWidth.valueOf()" 
          :height="playerHeight.valueOf()"
          :annotations="internalAnnotations"
          :video-current-time="videoCurrentTime.valueOf()"
          @drawing-start="onCanvasDrawingStart"
          @drawing-end="onCanvasDrawingEnd" />
      </div>

      <div class="va-player__footer" v-if="!isFullScreen ? true : (showControlsOnFullscreen && !isDrawing)">
          <ProgressBar :progress-percentage="progressPercentage"
            :buffer-percentage="bufferPercentage"
            @skip-to="onProgressBarSkipTo" />

          <Annotations 
            :annotations="internalAnnotations" 
            :video-duration="videoDuration"
            :player-width="playerWidth.valueOf()"
            @annotation-click="onAnnotationClick"/>

          <PlayerControls 
            :current-video-time="videoCurrentTime.valueOf()"
            :is-looping="isLooping.valueOf()" 
            :is-paused="isPaused.valueOf()"
            :is-muted="isMuted.valueOf()"
            :show-fullscreen-button="showFullscreenButton"
            :show-loop-button="showLoopButton"
            @loop-click="onLoop"
            @play-pause-click="onPlayPause"
            @full-screen-click="onFullScreen"
            @volume-change="onVolumeChange" />
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import { api as fullscreen } from 'vue-fullscreen'
import { Annotation } from '../interfaces/Annotation'
import PlayerControls from './PlayerControls.vue'
import ProgressBar from './ProgressBar.vue'
import Canvas from './Canvas.vue'
import CanvasControls from './CanvasControls.vue'
import { CanvasActions } from '../utils/Constants'
import Annotations from './Annotations.vue'
import Loading from './Loading.vue'
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'Player',
  emits: ['annotationAdd', 'annotationSelected'],
  props: {
    /**
    * set the URL of the video element to embed.
    */       
    src: {
      type: String
    },
    /**
    * set the URL of an image to be shown while the video is downloading.
    */ 
    poster: {
      type: String
    },
    /**
    * set if the video will automatically start playing.
    */    
    autoplay: {
      type: Boolean,
      default: false
	  },
    /**
    * show/hide the fullscreen button (default: true)
    */      
    showFullscreenButton: {
      type: Boolean,
      default: true
    },
    /**
    * show/hide the loop button (default: true)
    */  
    showLoopButton: {
      type: Boolean,
      default: true
    },
    /**
    * set value for the constrol timeout when not drawing/fullscreen
    */  
    constrolsTimeout: {
      type: Number,
      default: 3000
    },

    /**
    * stroke width for the drawings (default 5)
    */
    strokeWidth: {
      type: Number,
      default: 5
    },
    /**
    * show annotation constrols (default true)
    */  
    showAnnotationControls: {
      type: Boolean,
      default: true
    },    
    /**
    * An array annotations to be rendered (required any empty array if none)
    */  
    annotations: {
      type: Array as PropType<Annotation[]>,
      default: [],
      required: true
    }, 
    /**
    * An array of strings containing the Hexcode of colors to be used
    */  
    colors: {
      type: Array as PropType<Array<string>>,
      default: [
        '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688',
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
      ]
    },
  },
  components: {
    PlayerControls,
    ProgressBar,
    Canvas,
    CanvasControls,
    Annotations,
    Loading
  },
  setup(props, {emit}) {
    const videoElement = ref<HTMLVideoElement | null>(null);

    let isLooping = ref<boolean>(false);
    let isPaused = ref<boolean>(props.autoplay ? false : true);
    let isMuted = ref<boolean>(false);
    let isFullScreen = ref<boolean>(false);
    let showControlsOnFullscreen = ref<boolean>(false);
    let progressPercentage = ref<number>(0);
    let bufferPercentage = ref<number>(0);
    let playerHeight = ref<number>(0);
    let playerWidth = ref<number>(0);
    let isDrawing = ref<boolean>(false);
    let videoCurrentTime = ref<number>(0);
    let canvasSelectedColor = ref<string>('');
    let canvasSelectedAction = ref<CanvasActions>();
    let isFullscreenRequested = ref<boolean>(false);
    let videoDuration = ref<number>(0);
    let internalAnnotations = ref<Annotation[]>(props.annotations);
    let isLoading = ref<boolean>(true);
    
    let minimizedPlayerWidth: number = 0;
    let minimizedPlayerHeight: number = 0;
    let controlsTimeoutInstance: any = null;
    
    let currentAnnotationStartTime = 0;

    onMounted(() => {
      window.addEventListener('resize',  onResize);
      window.addEventListener("orientationchange", onOrientationChange);
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
    })

    const onOrientationChange = () => {
      //Avoid the wrong size of canvas
      setTimeout(() => {
        onResize();
      }, 50);
    }
    const onResize = () => {
      //It's necessary to 
        if(!isFullscreenRequested.value) {
          updatePlayerSizeWithMinimizedSize();

          //This is necessary to handle responsiveness
          if(!isFullScreen.value)
            setMinimizeVideoSize();
        } else {
          updatePlayerSizeWithVideoSize();
        }
    }

    //Methods
    const onPlayPause = () => {
      if(videoElement.value) {
        if(videoElement.value.paused || videoElement.value.ended)
          videoElement.value.play();
        else {
          videoElement.value.pause();
        }

        isPaused.value = videoElement.value.paused;
      }
    }

    const onLoop = (value: boolean) => {
      isLooping.value = value;
    }

    const onVolumeChange = (value: number) => {
      if(videoElement.value) {

        if(videoElement.value.muted)
          isMuted.value = false;

        videoElement.value.volume = value;
      }
    }

    const onFullScreen = () => {
      isFullscreenRequested.value = !isFullscreenRequested.value;

      //Toggle the fullscren for the video element
      fullscreen.toggle(document.querySelector('.va-player'), {
        teleport: false,
        callback: (isFullscreen) => {
          isFullScreen.value = isFullscreen;
          let myScreenOrientation = window.screen.orientation;
          let lockOrientation: OrientationLockType;

          if(isFullScreen.value) {
            lockOrientation = "landscape";
          } else {
            setMinimizeVideoSize();
            lockOrientation = "portrait";
          }

          myScreenOrientation.lock(lockOrientation)
            .then(() => console.log(`${lockOrientation} locked`));
        },
      });
    }

    const onVideoTimeUpdate = () => {
      if(videoElement.value) {
        videoCurrentTime.value = videoElement.value.currentTime;
        progressPercentage.value = (videoElement.value.currentTime / videoElement.value.duration) * 100;

        calculateBufferProgress();

        if(progressPercentage.value == 100) {
          isPaused.value = true;
          progressPercentage.value = 0;
          bufferPercentage.value = 0;
          videoCurrentTime.value = 0;
        }
      }
    }

    const calculateBufferProgress = () => {
      //Calculate buffer progress 
      //https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/buffering_seeking_time_ranges
      for (var i = 0; i < videoElement.value?.buffered.length; i++) {
        if (videoElement.value.buffered.start(videoElement.value.buffered.length - 1 - i) < videoElement.value.currentTime) {
          bufferPercentage.value = (videoElement.value.buffered.end(videoElement.value.buffered.length - 1 - i) / videoElement.value.duration) * 100;
          break;
        }
      }
    }

    const setMinimizeVideoSize = () => {
      minimizedPlayerWidth = videoElement.value?.offsetWidth;
      minimizedPlayerHeight = videoElement.value?.offsetHeight;
    }

    const onMetadataLoaded = () => {
      videoDuration.value = videoElement.value.duration;
      internalAnnotations.value = props.annotations;

      setMinimizeVideoSize();
      updatePlayerSizeWithVideoSize();
      calculateBufferProgress();
    }

    const onProgressBarSkipTo = (event: MouseEvent) => {
      if(videoElement.value) {
        var target = event.target as HTMLElement;
        const percentageClicked = Math.round((event.offsetX / target.clientWidth) * 100);
        progressPercentage.value = percentageClicked;
        videoElement.value.currentTime = ((percentageClicked / 100) * videoElement.value.duration);
      }
    }

    const onMouseMove = () => {
      if(!showControlsOnFullscreen.value) {
        showControlsOnFullscreen.value = true;
      }

      if(controlsTimeoutInstance)
        clearTimeout(controlsTimeoutInstance);

      controlsTimeoutInstance = setTimeout(() => {
          showControlsOnFullscreen.value = false;
        }, props.constrolsTimeout);
    }

    const updatePlayerSizeWithVideoSize = () => {
      playerWidth.value = videoElement.value.offsetWidth;
      playerHeight.value = videoElement.value.offsetHeight;
    }

    const updatePlayerSizeWithMinimizedSize = () => {
      playerWidth.value = minimizedPlayerWidth;
      playerHeight.value = minimizedPlayerHeight;
    }

    const onCanvasDrawingStart = () => {
      isDrawing.value = true;
      currentAnnotationStartTime = videoElement.value.currentTime;
    }

    const onCanvasDrawingEnd = (json: string) => {
      isDrawing.value = false;

      let endTime = 0;

      if(isLooping.value) {
        if(endTime < currentAnnotationStartTime) 
          endTime = videoDuration.value;
        else 
          endTime = videoElement.value.currentTime;
      } else {
        endTime = videoElement.value.currentTime;
      }

      const annotation: Annotation = { 
        id: uuidv4(),
        color: canvasSelectedColor.value,
        startTime: currentAnnotationStartTime,
        endTime: endTime,
        fabricJson: json,
        playerWidth: playerWidth.value,
        playerHeight: playerHeight.value
      }

      currentAnnotationStartTime = 0;

      emit('annotationAdd', annotation);
    }    

    const onAnnotationClick = (annotation: Annotation) => {
      videoElement.value.currentTime = annotation.startTime;

      emit('annotationSelected', annotation);
    }

    return {
      videoElement,
      isLooping,
      isPaused,
      isMuted,
      isFullScreen,
      showControlsOnFullscreen,
      progressPercentage,
      bufferPercentage,
      playerHeight,
      playerWidth,
      isDrawing,
      videoCurrentTime,
      canvasSelectedColor,
      canvasSelectedAction,
      isFullscreenRequested,
      internalAnnotations,
      videoDuration,
      isLoading,
      onPlayPause,
      onLoop,
      onVolumeChange,
      onFullScreen,
      onVideoTimeUpdate,
      onMetadataLoaded,
      onMouseMove,
      onProgressBarSkipTo,
      onCanvasDrawingStart,
      onCanvasDrawingEnd,
      onAnnotationClick
    }
  }
})
</script>

<style scoped lang="scss">
.va-player {
  &__content {
    display: grid;

    &__video {
      height: 100%;
      width: 100%;
      grid-area: 1 / 1;
      background-color: $va-player-color;
    }

    &__canvas-controls {
      grid-area: 1 / 1;
      z-index: 2;
    }

    &__loading {
      grid-area: 1 / 1;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    //Fabric canvas container
    &:deep(.canvas-container) {
      height: 100% !important;
      width: 100%  !important;
      grid-area: 1 / 1;
      z-index: 1;
    }
  }

  &.fullscreen {
    .va-player__footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      opacity: 0.85;
      z-index: 99;
    }

    .va-player__content__video {
      max-height: 100vh;
    }
  }

  .pip-expanded, .pip-small, .pip-icon, .pip-explainer {
    display: none;
  }
}

*, ::after, ::before {
  box-sizing: content-box;
}
</style>