import { Composition } from "remotion";
import { DURATION, Walkthrough } from "./Walkthrough";

export const MyComposition = () => {
  return (
    <Composition
      id="BarwiseWalkthrough"
      component={Walkthrough}
      durationInFrames={DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
