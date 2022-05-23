<template>
    <div class="va-player__color-picker">
        <ul class="va-player__color-picker__inner" ref="colorPickerInner"
            @mousedown="onMouseDown"
            @touchstart="onTouchStart"
            @mousemove="onMouseMove"
            @touchmove="onTouchMove"
            @mouseleave="onMouseLeave"
            @mouseup="onMouseUp"
            @touchend="onTouchEnd">
            <li class="va-player__color-picker__inner__item" v-for="item in colors"
            :style="{'background-color': item}" v-bind:key="item" :id="item"
            @click="onColorClick(item)">
                <div class="va-player__color-picker__inner__item__marker" v-if="item == selectedColor">
                    <div class="va-player__color-picker__inner__item__marker__outer" />
                    <div class="va-player__color-picker__inner__item__marker__inner" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, PropType, ref } from 'vue'

export default defineComponent({
    name: 'ColorPicker',
    props: {
        colors: {
            type: Array as PropType<Array<string>>
        },
        selectedColor: {
            type: String
        }
    },
    emits: ['colorChange'],
    setup(props, {emit}) {
        const colorPickerInner = ref<HTMLElement | null>(null);

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        onMounted(() => {
            moveScrollToColor(props.selectedColor);
        })

        onUpdated(() => {
            moveScrollToColor(props.selectedColor);
        })

        const start = (pageX: number) => {
            isDown = true;

            startX = pageX - colorPickerInner.value.offsetLeft;
            scrollLeft = colorPickerInner.value.scrollLeft;	
        }

        const end = () => {
            isDown = false;
            colorPickerInner.value.classList.remove('dragging');
        }

        const move = (pageX: number) => {
            if(!isDown) 
                return;

            const x = pageX - colorPickerInner.value.offsetLeft;

            const dist = (x - startX);

            if(colorPickerInner.value.scrollLeft !== scrollLeft - dist){
                colorPickerInner.value.classList.add('dragging');
            } else{
                colorPickerInner.value.classList.remove('dragging');
            }

            colorPickerInner.value.scrollLeft = scrollLeft - dist;
        }

        const onMouseDown = (event: MouseEvent) => {
            start(event.pageX)
        }

        const onTouchStart = (event: TouchEvent) => {
            start(event.touches[0].pageX)
        }

        const onMouseMove = (event: MouseEvent) => {
            event.preventDefault();
            move(event.pageX);
        }

        const onTouchMove = (event: TouchEvent) => {
            event.preventDefault();
            move(event.touches[0].pageX);
        }

        const onMouseLeave = () => {
            end();
        }

        const onMouseUp = () => {
            end();
        }

        const onTouchEnd = () => {
            end();
        }

        const moveScrollToColor = (color) => {
            let element = document.getElementById(color);
            if(element)
                element.scrollIntoView();
        }

        const onColorClick = (color: string) => {
            if(isDown)
                return;
                
            moveScrollToColor(color);

            emit('colorChange', color);
        }

        return {
            colorPickerInner,
            onMouseDown,
            onTouchStart,
            onMouseMove,
            onTouchMove,
            onMouseLeave,
            onMouseUp,
            onTouchEnd,
            onColorClick
        }
    }    
})

</script>

<style scoped lang="scss">
.va-player {
    &__color-picker {
        &__inner {
            padding-right: $va-color-picker-padding-right;
            padding-left: $va-color-picker-padding-left;
            margin-left: $va-button-margin-left;
            height: $va-color-picker-height;
            border-radius: $va-color-picker-border-radius;
            white-space: nowrap;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            list-style-type: none;
            display: flex;
            flex-flow: column wrap;

            &__item {
                height: $va-color-picker-item-height;
                width: $va-color-picker-item-width;
                border-radius: $va-color-picker-item-border-radius;
                margin-top: $va-color-picker-item-margin-top;
                display: flex;
                justify-content: center;
                cursor: pointer;

                &:not(:first-child) {
                    margin-left: $va-color-picker-item-margin-left
                }

                &__marker {
                    margin-top: -$va-color-picker-item-margin-top;
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    &__outer {
                        width: 0;
                        height: 0;
                        border: 0 solid transparent;
                        border-left-width: 12px;
                        border-right-width: 12px;
                        border-top: 16px solid transparent;
                    }

                    &__inner {
                        width: 0;
                        height: 0;
                        border: 0 solid transparent;
                        border-left-width: 9px;
                        border-right-width: 9px;
                        border-top: 12px solid #FF9900;
                        margin-top: -15px;
                    }
                }
            }

            &.dragging {
                .va-player__color-picker__inner__item {
                    cursor:default;
                }
            }
        }
    }
}
</style>