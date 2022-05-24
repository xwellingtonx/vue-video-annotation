<template>
  <div class="container">
     <h1>Vue Video Annotation</h1>
    <p>
      🔥 Vue3 component that allows adding annotations to videos by free drawing or adding shapes like circles, squares, and arrows.
    </p>

    <div class="row align-items-center">
      <div class="col-md-10">
        <h4 class="mb-0">Settings</h4>
      </div>
    </div>
    <hr style="opacity: 0.1" />
    <div class="row">
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Video src</label>
          <input
            type="text"
            class="form-control" disabled
            :value="videoSrc"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Stroke width while annotating</label>
          <input
            type="number"
            class="form-control"
            v-model="strokeWidth"
          />
        </div>

        <div class="mb-3">
          <div class="mb-3">
            <label for="textTitle" class="form-label">Defaul Colors</label>
            <ColorPicker :colors="defaultColors" />
          </div>
          <div >
            <label for="textTitle" class="form-label">Custom Colors</label>
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                name="colors"
                @change="onCustomColorChange"
              />
              <ColorPicker :colors="customColors" />
            </div>            
          </div>          
        </div>
      </div>
      <div class="col-md-4">
        <div class="mb-3">
          <label class="form-label">Video poster</label>
          <input
            type="text"
            class="form-control" disabled
            :value="videoPoster"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Timeout to hide controls</label>
          <input
            type="number"
            class="form-control"
            v-model="constrolsTimeout"/>
        </div>

        <div class="settings__item mt-4">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="showFullscreenButton"
            />
            <label class="form-check-label" for="hasShadow">Show fullscreen button</label>
          </div>
        </div>        
      </div>
      <div class="col-md-4">
        <div class="settings__item mt-4">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="canAutoPlay"
            />
            <label class="form-check-label" for="hasShadow">Autoplay</label>
          </div>
        </div>
        <div class="settings__item mt-5">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="showAnnotationControls"
            />
            <label class="form-check-label" for="hasShadow">Show Annotation Controls</label>
          </div>
        </div>

        <div class="settings__item mt-5 mb-3">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="showLoopButton"
            />
            <label class="form-check-label" for="hasShadow">Show loop button</label>
          </div>
        </div>
      </div>
    </div>

    <div class="examples">
      <div class="examples__video mb-3">
        <h3>Video Player</h3>
        <Player :poster="videoPoster"
          :src="videoSrc"
          :annotations="annotations" 
          :autoplay="canAutoPlay"
          :show-annotation-controls="showAnnotationControls"
          :show-loop-button="showLoopButton"
          :show-fullscreen-button="showFullscreenButton"
          :stroke-width="strokeWidth"
          :constrols-timeout="constrolsTimeout"
          :colors="colors"
          @annotation-add="onAnnotationAdd">
          <template v-slot:videoContent>
            <track kind="subtitles" label="中文字幕" srclang="zh" src="https://www.dropbox.com/s/ipnbojfe0jtz5n7/MicrosoftInclusiveHiringCHT.vtt?raw=1" default>
          </template>
        </Player>
      </div>
      <div class="examples__annotations">
        <h3>Imported Annotations</h3>
        <textarea class="form-control">{{JSON.stringify(annotations)}}</textarea>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Player from "./components/Player.vue";
import { defineComponent, ref } from "vue";
import { Annotation } from "./interfaces/Annotation";
import annotationsJson from "./assets/annotations.json"
import ColorPicker from "./components/ColorPicker.vue";

export default defineComponent({
  components: {
    Player,
    ColorPicker,
  },
  setup() {

    let annotations = ref<Annotation[]>(annotationsJson.Example1 as Annotation[]);
    let videoSrc = ref<string>('https://www.dropbox.com/s/xvjem6er1pp1usy/MicrosoftInclusiveHiring.mp4?raw=1');
    let videoPoster = ref<string>('https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg');
    let canAutoPlay = ref<boolean>(false);
    let showAnnotationControls = ref<boolean>(true);
    let showLoopButton = ref<boolean>(true);
    let showFullscreenButton = ref<boolean>(true);
    let constrolsTimeout = ref<number>(3000);
    let strokeWidth = ref<number>(5);
    let isDefaultColors = ref<boolean>(true);


    let defaultColors = ref<string[]>([
      '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688',
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ]);
    
    let customColors = ref<string[]>([
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ]);

    let colors = ref<string[]>(defaultColors.value);

    const onAnnotationAdd = (annotation: Annotation) => {
      annotations.value.push(annotation);
    }

    const onDefaultColorChange = (event: Event) => {
      const checkBox = event.target as HTMLInputElement;
      if(checkBox.checked) {
        colors.value = defaultColors.value;
      } else {
        colors.value = defaultColors.value;
      }
    }

    const onCustomColorChange = (event: Event) => {
      const checkBox = event.target as HTMLInputElement;
      if(checkBox.checked) {
        colors.value = customColors.value;
      } else {
        colors.value = defaultColors.value;
      }
    }


    return {
      customColors,
      defaultColors,
      annotations,
      colors,
      videoSrc,
      videoPoster,
      canAutoPlay,
      showLoopButton,
      showFullscreenButton,
      showAnnotationControls,
      constrolsTimeout,
      isDefaultColors,
      strokeWidth,
      onAnnotationAdd,
      onDefaultColorChange,
      onCustomColorChange
    }
  }
});

</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

  .settings {
    &__item {
      display: flex;
      align-items: center;
    }
  } 

.container {

  .examples {
    display: flex;
    flex-direction: row;

    &__video {
      max-width: 600px;
    }

    &__annotations {
      margin-left: 20px;
      flex: 1;

      textarea {
        width: 100%;
        resize: none;
        height: 300px;
        overflow: overlay;
        background-color: transparent;
        padding: 0px;
      }
    }
  }

  @media (max-width: 767px) {
    
   .examples {
     display: block;
     
     &__annotations {
       margin-left: 0px;
     }
   }
  }
}
</style>
