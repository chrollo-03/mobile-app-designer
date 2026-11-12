import { Composition } from "remotion";
import { DURATION, Walkthrough } from "./Walkthrough";
import { MAKING_OF_DURATION, MakingOf } from "./MakingOf";
import { TL_DURATION, Timelapse } from "./Timelapse";
import { BRAG_DURATION, Brag } from "./Brag";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="BarwiseWalkthrough"
        component={Walkthrough}
        durationInFrames={DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Brag"
        component={Brag}
        durationInFrames={BRAG_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BarwiseTimelapse"
        component={Timelapse}
        durationInFrames={TL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BarwiseMakingOf"
        component={MakingOf}
        durationInFrames={MAKING_OF_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
