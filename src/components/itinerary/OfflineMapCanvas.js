import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { AppText, Pill } from '../common';
import { MAP_SIZE } from '../../maps/offlineMaps';

const clamp = (value, max) => Math.max(0, Math.min(max, value));

export default function OfflineMapCanvas({ map }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(320);
  const size = MAP_SIZE / zoom;
  const viewport = useRef({ offset, size, width, zoom });
  const dragStart = useRef({ offset, size, width, zoom });
  useEffect(() => {
    viewport.current = { offset, size, width, zoom };
  }, [offset, size, width, zoom]);
  const responder = useMemo(
    () =>
      // PanResponder stores these event handlers; it does not call them during render.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => viewport.current.zoom > 1,
        onMoveShouldSetPanResponder: (_, gesture) =>
          viewport.current.zoom > 1 && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onPanResponderGrant: () => {
          dragStart.current = viewport.current;
        },
        onPanResponderMove: (_, gesture) =>
          setOffset({
            x: clamp(
              dragStart.current.offset.x -
                (gesture.dx / dragStart.current.width) * dragStart.current.size,
              MAP_SIZE - dragStart.current.size
            ),
            y: clamp(
              dragStart.current.offset.y -
                (gesture.dy / dragStart.current.width) * dragStart.current.size,
              MAP_SIZE - dragStart.current.size
            ),
          }),
      }),
    []
  );

  const changeZoom = (next) => {
    const nextSize = MAP_SIZE / next;
    setOffset({
      x: clamp(offset.x + (size - nextSize) / 2, MAP_SIZE - nextSize),
      y: clamp(offset.y + (size - nextSize) / 2, MAP_SIZE - nextSize),
    });
    setZoom(next);
  };

  const labels = [];
  const cells = new Set();
  const names = new Set();
  for (const feature of map.features) {
    const [x, y] = feature.label;
    if (
      !feature.name ||
      x < offset.x + size * 0.08 ||
      x > offset.x + size * 0.92 ||
      y < offset.y + size * 0.05 ||
      y > offset.y + size * 0.95
    )
      continue;
    const cell = `${Math.floor((x - offset.x) / (size / 3))},${Math.floor((y - offset.y) / (size / 7))}`;
    if (cells.has(cell) || names.has(feature.name)) continue;
    cells.add(cell);
    names.add(feature.name);
    labels.push(feature);
  }

  return (
    <View>
      <View
        className="overflow-hidden rounded-2xl border border-gray-200"
        style={{
          aspectRatio: 1,
          width: '100%',
          backgroundColor: '#F1F0E8',
          ...(Platform.OS === 'web'
            ? { userSelect: 'none', touchAction: zoom > 1 ? 'none' : 'pan-y' }
            : {}),
        }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width || 320)}
        {...responder.panHandlers}
      >
        <Svg
          pointerEvents="none"
          width="100%"
          height="100%"
          viewBox={`${offset.x} ${offset.y} ${size} ${size}`}
          accessibilityLabel={`Offline street map of ${map.place.label}`}
          accessibilityRole="image"
        >
          <Rect width={MAP_SIZE} height={MAP_SIZE} fill="#F1F0E8" />
          {map.features
            .filter((f) => f.kind !== 'road')
            .map((f) => (
              <Path
                key={f.id}
                d={f.path}
                fill={f.kind === 'park' ? '#CDE4BD' : f.kind === 'water' ? '#ACD7E8' : 'none'}
                stroke={f.kind === 'river' ? '#8EC5DD' : 'none'}
                strokeWidth={5 / zoom}
              />
            ))}
          {map.features
            .filter((f) => f.kind === 'road')
            .map((f) => (
              <Path
                key={`edge-${f.id}`}
                d={f.path}
                fill="none"
                stroke="#CCCABE"
                strokeWidth={(f.major ? 9 : 5) / zoom}
              />
            ))}
          {map.features
            .filter((f) => f.kind === 'road')
            .map((f) => (
              <Path
                key={f.id}
                d={f.path}
                fill="none"
                stroke={f.major ? '#F4D084' : '#FFFFFF'}
                strokeWidth={(f.major ? 6 : 3) / zoom}
              />
            ))}
          {labels.map((f) => (
            <SvgText
              key={`label-${f.id}`}
              x={f.label[0]}
              y={f.label[1]}
              fontSize={27 / zoom}
              fill="#495345"
              stroke="#F1F0E8"
              strokeWidth={0.5 / zoom}
              textAnchor="middle"
            >
              {f.name.length > 20 ? `${f.name.slice(0, 19)}…` : f.name}
            </SvgText>
          ))}
          <Circle
            cx={500}
            cy={500}
            r={17 / zoom}
            fill="#368B55"
            stroke="white"
            strokeWidth={6 / zoom}
          />
        </Svg>
      </View>
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <Pill label="− Zoom out" onPress={zoom > 1 ? () => changeZoom(zoom / 2) : undefined} />
        <Pill
          label="Reset"
          onPress={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        />
        <Pill label="+ Zoom in" onPress={zoom < 8 ? () => changeZoom(zoom * 2) : undefined} />
      </View>
      <AppText variant="caption" className="mt-2">
        {zoom === 1 ? 'Zoom in, then drag to explore.' : 'Drag to explore the saved area.'} North is
        up.
      </AppText>
    </View>
  );
}
