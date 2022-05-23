<template>
    <input ref="rangeInput" type="range" 
        :value="value"
        :min="min" 
        :step="step" 
        :max="max" 
        :class="'va-player__range-input fill-js ' + cssClass"
        @input="onRangeInput">
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
    name: 'RangeInput',
    emits: ['valueChange'],
    props: {
        /**
        * set the min value (default 100)
        */
        value: {
            type: Number,
            default: 100
        },
        /**
        * set the min value (default 0)
        */
        min: {
            type: Number,
            default: 0
        },
        /**
        * set the max value (default 100)
        */
        max: {
            type: Number,
            default: 100
        },
        /**
        * set the interval between legal numbers (default 25% of max value)
        */
        step: {
            type: Number,
            default: 25
        },
        /**
        * set css class
        */
        cssClass: {
            type: String,
            default: ''
        }
    },
    setup(props, { emit }) { 
        const rangeInput = ref<HTMLInputElement | null>(null);

        const  updateStyle = ()  => {
            if(rangeInput.value) {
                rangeInput.value.style.setProperty('--min', props.min.toString());
                rangeInput.value.style.setProperty('--max', props.max.toString());
                rangeInput.value.style.setProperty('--val', props.value.toString());
            }
        }   
            
        watch(() => props.value, () => { 
            updateStyle();
        });

        const onRangeInput = (event: Event) => {
            const el = event.target as HTMLInputElement;
            emit('valueChange', parseFloat(el.value));
        } 

        onMounted(() => {
            updateStyle();
        });
        
        return {
            rangeInput,
            onRangeInput
        }
    }
});

</script>

<style scoped lang="scss">
    @mixin track() {
        box-sizing: border-box;
        border: none;
        width: $va-range-input-track-width; 
        height: $va-range-input-track-height;
        background: $va-range-input-track-bg;
        border-radius: $va-range-input-track-border-radius;
    }   

    @mixin fill() {
        height: $va-range-input-track-height;
        background: $va-range-input-fill-bg;
        border-radius: $va-range-input-track-border-radius;
    } 

    @mixin thumb() {
        box-sizing: border-box;
        border: none;
        width: $va-range-input-thumb-size; 
        height: $va-range-input-thumb-size;
        border-radius: 50%;
        background: $va-range-input-thumb-bg;
    }  
     
    .va-player {
        &__range-input {        
            --range: calc(var(--max) - var(--min));
            --ratio: calc((var(--val) - var(--min))/var(--range));
            --sx: calc(.5*#{$va-range-input-thumb-size} + var(--ratio)*(100% - #{$va-range-input-thumb-size}));
            margin: 0;
            padding: 0;
            width: $va-range-input-track-width; 
            height: $va-range-input-thumb-size;
            background: transparent;    

            &, &::-webkit-slider-thumb {
                -webkit-appearance: none;
            }

            &::-webkit-slider-runnable-track {
                @include track();
            }   

            &.fill-js {
                &::-webkit-slider-runnable-track {
                    background: linear-gradient($va-range-input-fill-bg, $va-range-input-fill-bg)
                        0/ var(--sx) 100% no-repeat $va-range-input-track-bg
                }
            }   

            &::-moz-range-track { 
                @include track;
            }  

            &::-ms-track { 
                @include track; 
            }

            &::-moz-range-progress { 
                @include fill; 
            }   

            &::-ms-fill-lower { 
                @include fill; 
            }

            &::-webkit-slider-thumb {
                margin-top: .5*($va-range-input-track-height - $va-range-input-thumb-size);
                @include thumb;
            }   

            &::-moz-range-thumb { 
                @include thumb; 
            }

            &::-ms-thumb {
                margin-top: 0;
                @include thumb;
            }

            &::-ms-tooltip { 
                display: none; 
            }
        }
    }
</style>