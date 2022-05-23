<template>
  <div class="container">
     <h1>c</h1>
    <p>
      🔥 Vue3 component that allows adding annotations to your videos by free drawing or adding shapes like circles, squares, and arrows.
    </p>

      <div class="examples">
        <div class="examples__video">
          <h3>Video with poster and subtitles</h3>
          <Player :poster="'https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg'"
            :annotations="annotations"
            @annotation-add="onAnnotationAdd">
            <template v-slot:videoContent>
              <source type="video/mp4" src="https://www.dropbox.com/s/xvjem6er1pp1usy/MicrosoftInclusiveHiring.mp4?raw=1">
              <source type="video/webm" src="https://www.dropbox.com/s/bmki1sn54o4m3xt/MicrosoftInclusiveHiring.webm?raw=1">
              <track kind="subtitles" label="中文字幕" srclang="zh" src="https://www.dropbox.com/s/ipnbojfe0jtz5n7/MicrosoftInclusiveHiringCHT.vtt?raw=1" default>
            </template>
          </Player>
        </div>
        <div class="examples__annotations">
          <h3>Annotations JSON</h3>
          <textarea>{{JSON.stringify(annotations)}}</textarea>
        </div>
        
    </div>
  </div>


</template>

<script lang="ts">
import Player from "./components/Player.vue";
import { defineComponent, ref } from "vue";
import Annotation from "./interfaces/Annotation";
import annotationsJson from "./assets/annotations.json"

export default defineComponent({
  components: {
    Player 
  },
  setup() {

    let annotations = ref<Annotation[]>(annotationsJson.Example1 as Annotation[]);
    let colors = ref<String[]>([]);

    const onAnnotationAdd = (annotation: Annotation) => {
      annotations.value.push(annotation);
      console.log(JSON.stringify(annotations.value));
    }

    return {
      annotations,
      colors,
      onAnnotationAdd
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
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
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

        background-color: transparent;
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
