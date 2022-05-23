<template>
    <div class="va-player__annotations">
        <div class="va-player__annotations__content" ref="contentElement">
            <div class="va-player__annotations__content__item" 
                v-for="item in internalAnnotations" v-bind:key="item.id"
                :id="item.id"
                :style="getStyle(item)"
                @click="onClick(item)">
            </div>
        </div>
        <hr class="va-player__annotations__splitter">
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import Annotation from '../interfaces/Annotation'

export default defineComponent({
    name: 'Annotations',
    emits: ['annotationClick'],
    props: {
        videoDuration: {
            type: Number
        },
        playerWidth: {
            type: Number
        },
        annotations: {
            type: Array as PropType<Annotation[]>,
        }     
    },
    setup(props, {emit}) {
        let contentElement = ref<HTMLDivElement>(null);
        let internalAnnotations = ref<Annotation[]>(props.annotations);

        watch(() => props.playerWidth, () => {
            refreshannotations(props.annotations);
        });

        const refreshannotations = (annotations: Annotation[]) => {
            internalAnnotations.value = [];
            //delay update
            setTimeout(() => {
                internalAnnotations.value = annotations;
            }, 100);
        }

        const getStyle = (item: Annotation) => {
            if(!contentElement.value)
                return;
            
            let startPercentage = item.startTime / props.videoDuration;
            let endPercentage = item.endTime / props.videoDuration;

            //Should be add to avoid the annotation be over each other when having same start time??
            //Check if the current item has other the same startTime than others 
            // let currentIndex = props.annotations.indexOf(item);
            // let sameStartTimeCount = 0;

            // //Count back how many annotations with same startTime is in the list
            // for (let i = currentIndex - 1; i >= 0; i--) {
            //     const annotationItem = props.annotations[i];
            //     if(annotationItem.startTime == props.annotations[currentIndex].startTime)
            //         sameStartTimeCount++;
            // }

            // if(sameStartTimeCount > 0) {
            //     //Add 6pixels of spacing base on the amount of annotations already added for the same start time
            //     var startWidth = (startPercentage * contentElement.value.clientWidth) + 6 * sameStartTimeCount;
            //     startPercentage = (startWidth / contentElement.value.clientWidth);
            // }

            let width = (endPercentage - startPercentage) * contentElement.value.clientWidth;

            width = width >= contentElement.value.clientWidth ? contentElement.value.clientWidth : width;

            return {
                'background-color': item.color,
                'left': (startPercentage * 100) + '%',
                'width': width + 'px'
            };
        }
        
        const onClick = (item: Annotation) => {
            emit('annotationClick', item);
        }

        return {
            contentElement,
            internalAnnotations,
            getStyle,
            onClick
        }
    }
})
</script>

<style scoped lang="scss">
.va-player {
    &__annotations {
        &__content {
            background-color: $va-annotations-bg;
            height: $va-annotations-height;
            display: flex;
            align-items: center;
            position: relative;

            &__item {
                height: $va-annotations-item-height;
                border-radius: $va-annotations-item-border-radius;
                min-width: $va-annotations-item-min-width;
                position: absolute;
                cursor: pointer;
            }
        }

        &__splitter {
            height: $va-annotations-splitter-height;
            background-color: $va-annotations-splitter-bg;
            margin: 0px;
            border: 0px;
        }
    }
}
</style>