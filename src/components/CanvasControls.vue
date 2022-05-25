<template>
    <div class="va-player__canvas-controls">
        <!-- <button class="va-player__button">
            <Icon icon="mdi-delete" 
            @click="onClick(CanvasActions.Clear)" />
        </button> -->
        <ColorPicker :colors="colors" :selectedColor="selectedColor" 
            @color-change="onColorChage" />
        <button class="va-player__button" 
            :class="{'selected': selectedAction.valueOf() == CanvasActions.Brush}"
            @click="onClick($event, CanvasActions.Brush)">
            <Icon icon="mdi-brush"  />
        </button>               
        <button class="va-player__button"
            :class="{'selected': selectedAction.valueOf() == CanvasActions.Arrow}"
            @click="onClick($event, CanvasActions.Arrow)">
            <Icon icon="mdi-arrow-top-right"  />
        </button>            
        <button class="va-player__button"
            :class="{'selected': selectedAction.valueOf() == CanvasActions.Circle}"
            @click="onClick($event, CanvasActions.Circle)">
            <Icon icon="mdi-circle-outline"  />
        </button>
        <button class="va-player__button"            
            :class="{'selected': selectedAction.valueOf() == CanvasActions.Square}"
            @click="onClick($event, CanvasActions.Square)">
            <Icon icon="mdi-square-outline"  />
        </button>
    </div>
</template>

<script lang="ts">
import { Icon } from '@iconify/vue';
import { defineComponent, onMounted, PropType } from 'vue'
import ColorPicker from './ColorPicker.vue';
import {CanvasActions} from '../utils/Constants'

export default defineComponent({
    name: 'CanvasControls',
    emits: ['update:selectedColor', 'update:selectedAction'],
    props: {
        colors: {
            type: Array as PropType<Array<string>>
        },
        selectedColor: {
            type: String,
            default: ''
        },
        selectedAction: {
            type: String as PropType<CanvasActions>,
            default: ''
        }
    },
    components: {
        Icon,
        ColorPicker
    },  
    setup(props, {emit}) {
        onMounted(() => {
            if(!props.selectedColor)
                onColorChage(props.colors[0]);
        })

        const onClick = (event: MouseEvent, action: string) => {
            if(action == props.selectedAction) {
                action = '';
            }

            emit('update:selectedAction', action);

            event.preventDefault();
        }

        const onColorChage = (color: string) => {
            emit('update:selectedColor', color);
        }
        
        return {
            CanvasActions,
            onClick,
            onColorChage
        }
    }
})
</script>

<style scoped lang="scss">
.va-player {
    &__canvas-controls {
        height: $va-button-height;
        padding: $va-button-padding;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    &__color-picker {
        width: 200px;
    }    
}
</style>