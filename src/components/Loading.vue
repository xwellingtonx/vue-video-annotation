<template>
    <div class="va-player__loading"><div></div><div></div><div></div><div></div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: 'Loading'
})
</script>

<style scoped lang="scss">
.va-player {
    &__loading {
      display: inline-block;
      position: relative;
      width: $va-loading-width;
      height: $va-loading-height;

        div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: $va-loading-width;
          height: $va-loading-height;
          border: $va-loading-border-size solid $va-loading-border-color;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: $va-loading-border-color transparent transparent transparent;

            &:nth-child(1) {
              animation-delay: -0.45s;
            }

            &:nth-child(2) {
              animation-delay: -0.3s;
            }

            &:nth-child(3) {
              animation-delay: -0.15s;
            }
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }      
    }    
}
</style>