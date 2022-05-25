<template>
    <div class="va-player__controls">
        <button class="va-player__controls__item va-player__button"
            @click="onPlayPause">
            <Icon :icon="isPaused ? 'mdi:play' : 'mdi-pause'" />
        </button>
        <button class="va-player__controls__item va-player__button" v-if="showLoopButton"
            :class="{'selected': isLooping}"
            @click="onLoop">
            <Icon icon="mdi-repeat" />
        </button>
        <span class="va-player__controls__item va-player__time">{{formatTime(currentVideoTime)}}</span>
        <div class="va-player__controls__item flex-right">
            <div class="va-player__controls__item">
                <button class="va-player__button" @click="onVolumeClick">
                    <Icon :icon="volumeIcon"  />
                </button>
                <RangeInput :value="volumeInputValue" :max="volumeInputMax" :step="0.025" @value-change="onVolumeChange"  />
            </div>

            <button class="va-player__controls__item va-player__button" v-if="showFullscreenButton"
                @click="onFullScreen">
                <Icon icon="mdi-arrow-expand-all"  />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue';
import RangeInput from './RangeInput.vue';
import { defineComponent, ref } from 'vue'
import { convertToTimeString } from '../utils/Common';

export default defineComponent({
    name: 'PlayerControls',
    emits: ['playPauseClick', 'loopClick', 'volumeChange', 'fullScreenClick'],
    props: {
        isLooping: {
            type: Boolean,
        },
        isPaused: {
            type: Boolean,
        },
        isMuted: {
            type: Boolean,
        },
        currentVideoTime: {
            type: Number,
            default: 0
        },
        showFullscreenButton: {
            type: Boolean,
        },
        showLoopButton: {
            type: Boolean,
        } 
    },
    components: {
        Icon,
        RangeInput 
    },
    setup(props, { emit }) {
        const volumeHighIcon = 'mdi-volume-high';
        const volumeMediumIconn = 'mdi-volume-medium';
        const volumeOffIcon = 'mdi-volume-off';
        let volumeIcon = ref<string>(props.isMuted ? volumeOffIcon : volumeHighIcon);
        let volumeInputValue = ref<number>(1);
        let volumeInputMax = ref<number>(1);
        
        const onPlayPause = (event: MouseEvent) => {
            emit('playPauseClick');
            event.preventDefault();
        }
        const onLoop = (event: MouseEvent) => {
            emit('loopClick', !props.isLooping);

            event.preventDefault();
        }
        const onVolumeClick = (event: MouseEvent) => {
            //Check which icon to change
            if(volumeInputValue.value > 0) {
                volumeIcon.value = volumeOffIcon;
                volumeInputValue.value = 0;
            } else {
                volumeIcon.value = volumeHighIcon;
                volumeInputValue.value = volumeInputMax.value;
            }
            emit('volumeChange', volumeInputValue.value);

            event.preventDefault();
        }
        const onVolumeChange = (value: number) => {
            if(value <= 0) {
                volumeIcon.value = volumeOffIcon;
            } else if(value > 0 && value <= 0.5) {
                volumeIcon.value = volumeMediumIconn;
            } else {
                volumeIcon.value = volumeHighIcon;
            }
            volumeInputValue.value = value;
            emit('volumeChange', value);
        }

        const onFullScreen = (event: MouseEvent) => {
            emit('fullScreenClick');
            event.preventDefault();
        }

        const formatTime = (timeInSeconds: number) => {
            return convertToTimeString(timeInSeconds)
        }

        return {
            volumeIcon,
            volumeInputValue,
            volumeInputMax,
            onPlayPause,
            onLoop,
            onVolumeClick,
            onVolumeChange,
            onFullScreen,
            formatTime
        }            
    }
});
</script>

<style scoped lang="scss">
.va-player {
    &__controls {
        background: $va-controls-bg;
        height: $va-controls-height;
        display: flex;
        align-items: center;
        padding-left: $va-controls-padding-left;
        padding-right: $va-controls-padding-right;

        &__item {
            display: flex;
            align-items: center;
            
            &.flex-right {
                justify-content: flex-end;
                width: 100%;
            }
        }
    }
    
    &__time {
        color: $va-controls-time-color;
        font-family: $va-controls-time-font-family;
        cursor: default;
        margin-left: $va-button-margin-left;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently */
    }

    &__range-input {
        margin-left: $va-button-margin-left;
    }
}
</style>