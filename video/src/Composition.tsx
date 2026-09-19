import {
  AbsoluteFill,
  Composition,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;

type Beat = {
  file: string;
  /** Frame (at FPS) in the source video where this beat starts reading from. */
  trimBefore: number;
  /** Frames of source footage consumed by this beat (before playbackRate). */
  sourceDurationInFrames: number;
  playbackRate: number;
  zoomFrom: number;
  zoomTo: number;
};

// A fast-cut highlight reel instead of playing each clip start-to-finish:
// short punchy beats (sped up slightly for energy) intercut with slow-motion
// hero beats on the peak of a rep. Cuts alternate between the 3 source clips
// for visual variety even though it's the same exercise/background.
const beats: Beat[] = [
  { file: "clip1.mov", trimBefore: 6, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  { file: "clip1.mov", trimBefore: 90, sourceDurationInFrames: 33, playbackRate: 0.45, zoomFrom: 1.05, zoomTo: 1.2 },
  { file: "clip2.mov", trimBefore: 9, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  { file: "clip3.mov", trimBefore: 15, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  { file: "clip2.mov", trimBefore: 285, sourceDurationInFrames: 33, playbackRate: 0.45, zoomFrom: 1.05, zoomTo: 1.2 },
  { file: "clip1.mov", trimBefore: 210, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  { file: "clip3.mov", trimBefore: 105, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  { file: "clip1.mov", trimBefore: 315, sourceDurationInFrames: 30, playbackRate: 1.15, zoomFrom: 1.0, zoomTo: 1.05 },
  // Finale: longest, deepest slow-motion punch-in to close on a high note.
  { file: "clip3.mov", trimBefore: 234, sourceDurationInFrames: 39, playbackRate: 0.4, zoomFrom: 1.05, zoomTo: 1.25 },
];

type FlatBeat = Beat & { from: number; durationInFrames: number };

const flattenTimeline = (defs: Beat[]): FlatBeat[] => {
  const flat: FlatBeat[] = [];
  let cursor = 0;
  for (const beat of defs) {
    const durationInFrames = Math.round(beat.sourceDurationInFrames / beat.playbackRate);
    flat.push({ ...beat, from: cursor, durationInFrames });
    cursor += durationInFrames;
  }
  return flat;
};

const timeline = flattenTimeline(beats);
const totalDurationInFrames = timeline.reduce((sum, b) => sum + b.durationInFrames, 0);

const ZoomedVideo: React.FC<{ beat: FlatBeat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, beat.durationInFrames], [beat.zoomFrom, beat.zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`source-clips/${beat.file}`)}
        trimBefore={beat.trimBefore}
        playbackRate={beat.playbackRate}
        style={{
          // Source clips are already 1280x720, matching the composition
          // exactly, so no width/height/objectFit is needed here. Adding
          // objectFit: "cover" here triggers a Remotion compositor bug
          // that serves the wrong video frame entirely (verified via
          // isolated repro) -- keep this style to just the zoom transform.
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const PullUpsReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {timeline.map((beat, i) => (
        <Sequence key={i} from={beat.from} durationInFrames={beat.durationInFrames}>
          <ZoomedVideo beat={beat} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const PullUpsReelComposition = () => {
  return (
    <Composition
      id="PullUpsReel"
      component={PullUpsReel}
      durationInFrames={totalDurationInFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
