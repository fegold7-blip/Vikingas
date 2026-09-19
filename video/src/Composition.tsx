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

type Segment = {
  /** Frame (at FPS) in the source video where this segment starts reading from. */
  trimBefore: number;
  /** How many frames this segment occupies in the final timeline. */
  durationInFrames: number;
  playbackRate: number;
  zoomFrom: number;
  zoomTo: number;
};

type ClipDef = {
  file: string;
  segments: Segment[];
};

// Each clip is split into: normal speed -> slow-motion punch-in on the peak
// of the pull-up rep -> normal speed. The zoom drifts continuously across
// all three segments of a clip and resets on the hard cut to the next clip.
const clips: ClipDef[] = [
  {
    file: "clip1.mov",
    segments: [
      { trimBefore: 0, durationInFrames: 90, playbackRate: 1, zoomFrom: 1.0, zoomTo: 1.04 },
      { trimBefore: 90, durationInFrames: 60, playbackRate: 0.5, zoomFrom: 1.04, zoomTo: 1.14 },
      { trimBefore: 120, durationInFrames: 281, playbackRate: 1, zoomFrom: 1.14, zoomTo: 1.22 },
    ],
  },
  {
    file: "clip2.mov",
    segments: [
      { trimBefore: 0, durationInFrames: 290, playbackRate: 1, zoomFrom: 1.0, zoomTo: 1.05 },
      { trimBefore: 290, durationInFrames: 60, playbackRate: 0.5, zoomFrom: 1.05, zoomTo: 1.16 },
      { trimBefore: 320, durationInFrames: 71, playbackRate: 1, zoomFrom: 1.16, zoomTo: 1.2 },
    ],
  },
  {
    file: "clip3.mov",
    segments: [
      { trimBefore: 0, durationInFrames: 100, playbackRate: 1, zoomFrom: 1.0, zoomTo: 1.05 },
      { trimBefore: 100, durationInFrames: 60, playbackRate: 0.5, zoomFrom: 1.05, zoomTo: 1.16 },
      { trimBefore: 130, durationInFrames: 154, playbackRate: 1, zoomFrom: 1.16, zoomTo: 1.2 },
    ],
  },
];

type FlatSegment = Segment & { file: string; from: number };

const flattenTimeline = (defs: ClipDef[]): FlatSegment[] => {
  const flat: FlatSegment[] = [];
  let cursor = 0;
  for (const clip of defs) {
    for (const segment of clip.segments) {
      flat.push({ ...segment, file: clip.file, from: cursor });
      cursor += segment.durationInFrames;
    }
  }
  return flat;
};

const timeline = flattenTimeline(clips);
const totalDurationInFrames = timeline.reduce((sum, s) => sum + s.durationInFrames, 0);

const ZoomedVideo: React.FC<{ segment: FlatSegment }> = ({ segment }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, segment.durationInFrames], [segment.zoomFrom, segment.zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`source-clips/${segment.file}`)}
        trimBefore={segment.trimBefore}
        playbackRate={segment.playbackRate}
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
      {timeline.map((segment, i) => (
        <Sequence key={i} from={segment.from} durationInFrames={segment.durationInFrames}>
          <ZoomedVideo segment={segment} />
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
