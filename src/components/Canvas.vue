<template>
    <canvas id="htmlCanvas" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { Annotation } from '../interfaces/Annotation';
import { CanvasActions } from '../utils/Constants';
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
    name: 'Canvas',
    emits: ['drawingStart', 'drawingEnd'],
    props: {
        width: {
            type: Number
        },
        height: {
            type: Number
        },
        videoCurrentTime: {
            type: Number
        },
        annotations: {
            type: Object as PropType<Annotation[]>,
            default: []
        },
        strokeColor: {
            type: String
        },
        strokeWidth: {
            type: Number
        },
        isShapesSelectable: {
            type: Boolean,
            default: false
        },
        actionType: {
            type: String as PropType<CanvasActions>
        }
    },
    setup(props, {emit}) {
        let fabricCanvas: fabric.Canvas = null;
        let isDown = false;
        let origX = undefined;
        let origY = undefined;
        let deltaX = undefined;
        let deltaY = undefined;

        let currentScaleX = 0;
        let currentScaleY = 0;

        let rect: fabric.Rect;
        let ellipse: fabric.Ellipse;
        let line: fabric.Line; 
        let triangle: fabric.Triangle;
        let currentUUID = undefined;

        let canDrawOnCanvas = ref<boolean>();
        
        onMounted(() => {
            fabricCanvas = new fabric.Canvas('htmlCanvas');
            fabricCanvas.selection = false;

            fabricCanvas.on('mouse:down', (o) => {
                o.e.preventDefault();
                startDraw(o.e);
            });

            fabricCanvas.on('mouse:move', (o) => {
                move(o.e);
            });

            fabricCanvas.on('mouse:up', (o) => {
                o.e.preventDefault();
                endDraw()
            })

            showObjects(props.videoCurrentTime);
        })

        watch(() => props.videoCurrentTime, (newvideoCurrentTime) => {
            showObjects(newvideoCurrentTime);
        });

        watch(() => props.annotations, () => {
            showObjects(props.videoCurrentTime);
        }, { deep: true})

        watch(() => [props.width, props.height], ([newWidth, newHeight]) => {      
            resizeAllRenderedObjects(newWidth, newHeight);
            
            if(newWidth != fabricCanvas.width) {
                fabricCanvas.setWidth(newWidth);
                fabricCanvas.setHeight(newHeight);
            }
        });

        //Watch stroke properties to update when freDrawing
        watch(() => props.strokeWidth, (newStrokeWidth) => {
            if(fabricCanvas?.isDrawingMode) {
                fabricCanvas.freeDrawingBrush.width = getScaledValue(newStrokeWidth);
            }
        });

        watch(() => props.strokeColor, (newStrokeColor) => {
            if(fabricCanvas?.isDrawingMode) {
                fabricCanvas.freeDrawingBrush.color = newStrokeColor;
            }
        });

        watch(() => props.actionType, (newActionType) => {
            removeObjectSelections();

            if(newActionType == CanvasActions.Brush) {
                canDrawOnCanvas.value = true;
                fabricCanvas.isDrawingMode = true;
                updateFreeDrawingBrush();
            } else if(newActionType == CanvasActions.Arrow) {
                canDrawOnCanvas.value = true;
                fabricCanvas.isDrawingMode = false;
            } else if(newActionType == CanvasActions.Circle) {
                canDrawOnCanvas.value = true;
                fabricCanvas.isDrawingMode = false;
            } else if(newActionType == CanvasActions.Square) {
                canDrawOnCanvas.value = true;
                fabricCanvas.isDrawingMode = false;
            } else if(newActionType == CanvasActions.Clear) {
                canDrawOnCanvas.value = false;
                fabricCanvas.isDrawingMode = false;
                clearCanvas();
            } else {
                canDrawOnCanvas.value = false;
                fabricCanvas.isDrawingMode = false;
            }
        });

        const resizeAllRenderedObjects = (newWidth, newHeight) => {
            //Get canvas and objects at the new resolution
            if(fabricCanvas.width > 0) {
                currentScaleX = newWidth / fabricCanvas.width;
                currentScaleY = newHeight / fabricCanvas.height;
            } 

            var objects = fabricCanvas.getObjects();
            
            for (var i in objects) {
                resizeObject(objects[i], currentScaleX, currentScaleY);
            }

            updateFreeDrawingBrush();
        }

        const resizeObject = (object: any, scaleX: number, scaleY: number) => {
            object.scaleX = object.scaleX * scaleX;
            object.scaleY = object.scaleY * scaleY;
            object.left = object.left * scaleX;
            object.top = object.top * scaleY;
            object.selectable = false;
            object.evented = false;
            object.setCoords();
        }

        const removeObjectSelections = () => {
            let objects = fabricCanvas.getObjects();
            for (let i = 0; i < objects.length; i++) {
                objects[i].selectable = false;
                objects[i].evented = false;
            }
        }

        const updateFreeDrawingBrush = () => {
            fabricCanvas.freeDrawingBrush.width = getScaledValue(props.strokeWidth);
            fabricCanvas.freeDrawingBrush.color = props.strokeColor;
        }

        const loadCanvasFromJson = (json: string, playerWidth: number, playerHeight: number) => {
            var fabricObjects = JSON.parse(json).objects;

            fabric.util.enlivenObjects(fabricObjects, (objects) => {
                objects.forEach(obj => {

                    let objScaleX =  props.width / playerWidth;
                    let objScaleY =  props.height / playerHeight;
                    
                    //Resize obj been imported to the correct scale 
                    resizeObject(obj, objScaleX, objScaleY);
                    fabricCanvas.add(obj);
                });
            }, "");

            fabricCanvas.renderAll();       
        }

        const clearCanvas = () => {
            fabricCanvas.clear();
        }

        const startDraw = (event: Event) => {
            if (canDrawOnCanvas.value) {
                isDown = true;
                emit('drawingStart');
                
                let pointer = fabricCanvas.getPointer(event);
                origX = pointer.x;
                origY = pointer.y;
                currentUUID = uuidv4();

                if(props.actionType == CanvasActions.Square) {
                    rect = new fabric.Rect({
                        left: origX,
                        top: origY,
                        width: pointer.x - origX,
                        height: pointer.y - origY,
                        fill: '',
                        stroke: props.strokeColor,
                        data: { uuid: currentUUID },
                        strokeWidth: getScaledValue(props.strokeWidth),
                        selectable: props.isShapesSelectable,
                        evented: props.isShapesSelectable
                    });

                    fabricCanvas?.add(rect);
                } else if(props.actionType == CanvasActions.Circle) {
                    ellipse = new fabric.Ellipse({
                        left: origX,
                        top: origY,
                        originX: 'left',
                        originY: 'top',
                        rx: pointer.x - origX,
                        ry: pointer.y - origY,
                        angle: 0,
                        fill: '',
                        stroke: props.strokeColor,
                        strokeWidth: getScaledValue(props.strokeWidth),
                        data: { uuid: currentUUID },
                        selectable: props.isShapesSelectable,
                        evented: props.isShapesSelectable
                    });

                    fabricCanvas?.add(ellipse);
                } else if(props.actionType == CanvasActions.Arrow) {
                    let points = [pointer.x, pointer.y, pointer.x, pointer.y];
                    line = new fabric.Line(points, {
                        strokeWidth: getScaledValue(props.strokeWidth),
                        fill: props.strokeColor,
                        stroke: props.strokeColor,
                        originX: 'center',
                        originY: 'center',
                        data: { uuid: currentUUID },
                        selectable: props.isShapesSelectable,
                        evented: props.isShapesSelectable
                    });

                    var centerX = (line.x1 + line.x2) / 2;
                    var centerY = (line.y1 + line.y2) / 2;
                    deltaX = line.left - centerX;
                    deltaY = line.top - centerY;

                    triangle = new fabric.Triangle({
                        left: line.get('x1') + deltaX,
                        top: line.get('y1') + deltaY,
                        originX: 'center',
                        originY: 'center',
                        selectable: props.isShapesSelectable,
                        evented: props.isShapesSelectable,
                        angle: -45,
                        width: getScaledValue(20 * (props.strokeWidth / 5)), //5 is the default value for stroke
                        height: getScaledValue(20 * (props.strokeWidth / 5)),
                        fill: props.strokeColor,
                        data: {uuid: line.data?.uuid}
                    });

	                fabricCanvas.add(line, triangle);
                }
            }
        }

        const calcArrowAngle = (x1, y1, x2, y2) => {
            var angle = 0, x, y;
            x = (x2 - x1);
            y = (y2 - y1);
            if (x === 0) {
                angle = (y === 0) ? 0 : (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
            } else if (y === 0) {
                angle = (x > 0) ? 0 : Math.PI;
            } else {
                angle = (x < 0) ? Math.atan(y / x) + Math.PI :
                    (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
            }
            return (angle * 180 / Math.PI + 90);
        };

        const move = (event) => {
            if (isDown) {
                var pointer = fabricCanvas.getPointer(event);

                if(props.actionType == CanvasActions.Square) {
                    if(origX > pointer.x){
                        rect.set({ left: Math.abs(pointer.x) });
                    }

                    if(origY > pointer.y){
                        rect.set({ top: Math.abs(pointer.y) });
                    }
                    
                    rect.set({ width: Math.abs(origX - pointer.x) });
                    rect.set({ height: Math.abs(origY - pointer.y) });
                } else if(props.actionType == CanvasActions.Circle) {
                    if(ellipse === null) {
                        return;
                    }
                    var rx = Math.abs(origX - pointer.x)/2;
                    var ry = Math.abs(origY - pointer.y)/2;
                    if (rx > ellipse.strokeWidth) {
                        rx -= ellipse.strokeWidth/2;
                    }
                    if (ry > ellipse.strokeWidth) {
                        ry -= ellipse.strokeWidth/2;
                    }
                    ellipse.set({ rx: rx, ry: ry});

                    if(origX > pointer.x){
                        ellipse.set({originX: 'right' });
                    } else {
                        ellipse.set({originX: 'left' });
                    }

                    if(origY > pointer.y){
                        ellipse.set({originY: 'bottom'  });
                    } else {
                        ellipse.set({originY: 'top'  });
                    }
                } else if(props.actionType == CanvasActions.Arrow) {
                    line.set({
                        x2: pointer.x,
                        y2: pointer.y
                    });
                    triangle.set({
                        'left': pointer.x + deltaX,
                        'top': pointer.y + deltaY,
                        'angle': calcArrowAngle(line.x1,
                                                        line.y1,
                                                        line.x2,
                                                        line.y2)
                    });
                }

                fabricCanvas.renderAll();
            }
        }

        const endDraw = () => {
            if(canDrawOnCanvas.value && isDown) {
                isDown = false;
                
                //Remove objects from canvas that were imported
                let objects = fabricCanvas.getObjects();
                for (let i = 0; i < objects.length; i++) {
                    //Unfourtunately there's no way to identify a object created by the brush so remove all objects tha'ts not the last
                    if(props.actionType == CanvasActions.Brush) {
                        if(i != objects.length - 1) 
                            fabricCanvas.remove(objects[i]);
                    } else {
                        if(objects[i].data?.uuid != currentUUID) 
                            fabricCanvas.remove(objects[i]);
                    }
                }

                fabricCanvas.renderAll();

                let jsonString = JSON.stringify(fabricCanvas.toJSON(['selectable', 'evented']));
                //Send json of new objects added
                emit('drawingEnd', jsonString);
            }                     
        }

        const getScaledValue = (value: number) => {
            return Math.abs(value + value * currentScaleX);
        }

        const showObjects = (videoCurrentTime: number) => {
            if(isDown)
                return;

            clearCanvas();

            //Find objects that need to show at the video current time
            var objects = props.annotations
                .filter(x => Math.round(videoCurrentTime) == Math.round(x.startTime) || 
                (Math.round(videoCurrentTime) > Math.round(x.startTime) && Math.round(videoCurrentTime) <= Math.round(x.endTime)));

            if(objects.length > 0)
                objects.forEach(obj => {
                    loadCanvasFromJson(obj.fabricJson, obj.playerWidth, obj.playerHeight);
                });
        }

        return {
            canDrawOnCanvas,
            loadCanvasFromJson
        }
    }
});
</script>
