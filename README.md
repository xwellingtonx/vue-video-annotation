# Vue Video Annotation
![Size](https://img.shields.io/bundlephobia/minzip/vue-video-annotation)
![Downloads](https://img.shields.io/npm/dw/vue-video-annotation)
![Version](https://img.shields.io/npm/v/vue-video-annotation)

Vue3 component that allows adding annotations to videos by free drawing or adding shapes like circles, squares, and arrows.

- 💻 [Demo](https://xwellingtonx.github.io/vue-video-annotation/)

## 📦 Installation

### NPM

`npm install --save vue-video-annotation`

# 🚀 Usage in Vue3 Components

```vue
<template>
  <VideoAnnotationPlayer :annotations="annotations"
    @annotation-add="onAnnotationAdd">
    <template v-slot:videoContent>
      <source type="video/mp4" src="https://www.dropbox.com/s/xvjem6er1pp1usy/MicrosoftInclusiveHiring.mp4?raw=1">

      <source type="video/webm" src="https://www.dropbox.com/s/bmki1sn54o4m3xt/MicrosoftInclusiveHiring.webm?raw=1">

      <track kind="subtitles" label="中文字幕" srclang="zh" src="https://www.dropbox.com/s/ipnbojfe0jtz5n7/MicrosoftInclusiveHiringCHT.vtt?raw=1" default>
    </template>
  </VideoAnnotationPlayer>
</template>
<script>
  import { VideoAnnotationPlayer, Annotation } from 'vue-video-annotation'

  export default defineComponent({
    components: {
        VideoAnnotationPlayer
    },
    setup() {
        let annotations = ref<Annotation[]>([]);

        const onAnnotationAdd = (annotation: Annotation) => {
            annotations.value.push(annotation);
        }

        return {
            annotations
        }
    }
  })
</script>
```

```ts
import { createApp } from 'vue'
import App from './App.vue'

//Import the style
import 'vue-video-annotation/dist/style.css'

const app = createApp(App);
app.mount('#app');

```


## 🔧 Properties

| Property              | Type    | Description                                                 | Default                             |
|-----------------------|---------|-------------------------------------------------------------|-------------------------------------|
| src                   | String  | Video url to be used                                        |                                     |
| poster                | String  | Image url to be used before video start                     |                                     |
| autoPlay              | Boolean | Boolean to enable autoplay                                  | `false`                             |
| showFullscreenButton  | Boolean | Show/Hide fullscreen button                                 | `true`                              |
| showLoopButton        | Boolean | Show/Hide loop button                                       | `true`                              |
| constrolsTimeout      | Number  | Value to control the timout of the controls                 | `3000` seconds                      |
| strokeWidth           | Number  | Stroke width for annotations                                | `5`                                 |
| showAnnotationControls| Boolean | Show/Hide annotation controls                               | `true`                              |
| annotations           | Annotation[]  | Array of annoataions to be used to add/import         | `[]` required                       |
| colors                | String[]| Array of colors to be used by the player                    | `['#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B']`                    |

## 🔧 Events

| Event         | Description                                    | Example                       |
|---------------|------------------------------------------------|-------------------------------|
| annotationAdd | Fired after an annotation be drawn             | `@annotation-add="doSomething"`|
| annotationSelected | Fired after an annotation be selected     | `@annotation-selected="doSomething"` |

