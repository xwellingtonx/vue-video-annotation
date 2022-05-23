<template>
    <div class="va-player__progress-bar" 
        @click="onSkipTo">
        <div class="va-player__progress-bar__progress" :style="{width: progressPercentage + '%'}">
        </div>
        <div class="va-player__progress-bar__buffer" :style="{width: bufferPercentage + '%'}">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
    export default defineComponent({
        name: 'ProgressBar',
        emits: ['skipTo'],
        props: {
            progressPercentage: {
                type: Number,
                default: 0
            },
            bufferPercentage: {
                type: Number,
                default: 0
            }
        },
        setup(props, {emit}) {
            const onSkipTo = (event: MouseEvent) => {
                emit('skipTo', event);
            }

            return {
                onSkipTo
            }
        }
    });
</script>

<style scoped lang="scss">
.va-player {
    &__progress-bar {
      cursor: pointer;
      background-color: $va-progress-bar-bg;
      display: grid;

      &__progress {
        height: $var-progress-bar-height;
        width: 0;
        background-color: $va-progress-bar-progress-bg;  
        pointer-events: none;     
        grid-area: 1 / 1;     
      }

      &__buffer {
        height: $var-progress-bar-height;
        width: 0;
        background-color: $va-progress-bar-buffer-bg;  
        pointer-events: none;     
        opacity: $va-progress-bar-buffer-opacity; 
        grid-area: 1 / 1;    
      }
    }
}
</style>