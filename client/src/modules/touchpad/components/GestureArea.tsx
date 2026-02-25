import React, { useRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PanGestureChangeEventPayload,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { createThrottle } from '../utils/throttle';
import { applyAcceleration } from '../utils/acceleration';

const THROTTLE_MS = 16;

interface GestureAreaProps {
  readonly sensitivity: number;
  readonly onMove: (dx: number, dy: number) => void;
  readonly onTap: () => void;
  readonly onDoubleTap: () => void;
  readonly onTwoFingerTap: () => void;
  readonly onScroll: (dy: number) => void;
}

export function GestureArea({
  sensitivity, onMove, onTap, onDoubleTap, onTwoFingerTap, onScroll,
}: GestureAreaProps): React.JSX.Element {
  // Use refs for values that change frequently to avoid recreating throttle instances
  const sensitivityRef = useRef(sensitivity);
  sensitivityRef.current = sensitivity;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  const throttledMove = useMemo(
    () => createThrottle((dx: number, dy: number) => {
      const s = sensitivityRef.current;
      onMoveRef.current(Math.round(applyAcceleration(dx, s)), Math.round(applyAcceleration(dy, s)));
    }, THROTTLE_MS),
    [], // stable — reads sensitivity via ref
  );

  const throttledScroll = useMemo(
    () => createThrottle((dy: number) => { onScrollRef.current(Math.round(dy)); }, THROTTLE_MS),
    [], // stable — reads onScroll via ref
  );

  const panGesture = useMemo(() =>
    Gesture.Pan().minPointers(1).maxPointers(1)
      .runOnJS(true)
      .onChange((e: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
        throttledMove(e.changeX, e.changeY);
      }),
    [throttledMove],
  );

  const scrollGesture = useMemo(() =>
    Gesture.Pan().minPointers(2).maxPointers(2)
      .runOnJS(true)
      .onChange((e: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
        throttledScroll(e.changeY);
      }),
    [throttledScroll],
  );

  const doubleTapGesture = useMemo(() =>
    Gesture.Tap().numberOfTaps(2).maxDuration(250)
      .runOnJS(true)
      .onEnd((_e: GestureStateChangeEvent<TapGestureHandlerEventPayload>, success: boolean) => {
        if (success) onDoubleTap();
      }),
    [onDoubleTap],
  );

  const singleTapGesture = useMemo(() =>
    Gesture.Tap().numberOfTaps(1).maxDuration(250)
      .runOnJS(true)
      .requireExternalGestureToFail(doubleTapGesture)
      .onEnd((_e: GestureStateChangeEvent<TapGestureHandlerEventPayload>, success: boolean) => {
        if (success) onTap();
      }),
    [onTap, doubleTapGesture],
  );

  const twoFingerTapGesture = useMemo(() =>
    Gesture.Tap().minPointers(2)
      .runOnJS(true)
      .onEnd((_e: GestureStateChangeEvent<TapGestureHandlerEventPayload>, success: boolean) => {
        if (success) onTwoFingerTap();
      }),
    [onTwoFingerTap],
  );

  const composed = useMemo(() =>
    Gesture.Race(
      twoFingerTapGesture,
      scrollGesture,
      Gesture.Exclusive(doubleTapGesture, singleTapGesture),
      panGesture,
    ),
    [twoFingerTapGesture, scrollGesture, doubleTapGesture, singleTapGesture, panGesture],
  );

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.area} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, width: '100%', backgroundColor: '#e8e8ed', borderRadius: 16 },
});
