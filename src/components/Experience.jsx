import {
  Float,
  Line,
  OrbitControls,
  PerspectiveCamera,
  Text,
  useScroll,
} from "@react-three/drei";
import Background from "./Background";
import { Airplane } from "./Airplane";
import { Cloud } from "./Cloud";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Euler,
  Group,
  Quaternion,
  Shape,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";

const LINE_NB_POINTS = 12000;
const CURVE_DISTANCE = 250;
const CURVE_AHEAD_CAMERA = 0.0008;
const CURVE_AHEAD_AIRPLANE = 0.02;
const AIRPLANE_MAX_ANGLE = 35;

export const Experience = () => {
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      [
        new Vector3(0, 0, 0),
        new Vector3(0, 0, -CURVE_DISTANCE),
        new Vector3(100, 0, -2 * CURVE_DISTANCE),
        new Vector3(-100, 0, -3 * CURVE_DISTANCE),
        new Vector3(100, 0, -4 * CURVE_DISTANCE),
        new Vector3(0, 0, -5 * CURVE_DISTANCE),
        new Vector3(0, 0, -6 * CURVE_DISTANCE),
        new Vector3(0, 0, -7 * CURVE_DISTANCE),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  const linePoints = useMemo(() => {
    return curve.getPoints(LINE_NB_POINTS);
  }, [curve]);

  const shape = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, -0.2);
    shape.lineTo(0, 0.2);

    return shape;
  }, [curve]);

  const cameraGroup = useRef();
  const scroll = useScroll();

  useFrame((_state, delta) => {
    const scrollOffset = Math.max(0, scroll.offset);

    const curPoint = curve.getPoint(scrollOffset);

    // Follow the curve points
    cameraGroup.current.position.lerp(curPoint, delta * 24);

    // Make the group look ahead on the curve
    const lookAtPoint = curve.getPoint(
      Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1)
    );

    const currentLookAt = cameraGroup.current.getWorldDirection(new Vector3());
    const targetLookAt = new Vector3()
      .subVectors(curPoint, lookAtPoint)
      .normalize();

    const lookAt = currentLookAt.lerp(targetLookAt, delta * 24);
    cameraGroup.current.lookAt(
      cameraGroup.current.position.clone().add(lookAt)
    );

    // Airplane rotation
    const tangent = curve.getTangent(scrollOffset + CURVE_AHEAD_AIRPLANE);

    const nonLerpLookAt = new Group();
    nonLerpLookAt.position.copy(curPoint);
    nonLerpLookAt.lookAt(nonLerpLookAt.position.clone().add(targetLookAt));

    tangent.applyAxisAngle(new Vector3(0, 1, 0), -nonLerpLookAt.rotation.y);

    let angle = Math.atan2(-tangent.z, tangent.x);
    angle = -Math.PI / 2 + angle;

    let angleDegrees = (angle * 180) / Math.PI;
    angleDegrees *= 2.4; // stronger angle

    // LIMIT PLANE ANGLE
    if (angleDegrees < 0) {
      angleDegrees = Math.max(angleDegrees, -AIRPLANE_MAX_ANGLE);
    }
    if (angleDegrees > 0) {
      angleDegrees = Math.min(angleDegrees, AIRPLANE_MAX_ANGLE);
    }

    // SET BACK ANGLE
    angle = (angleDegrees * Math.PI) / 180;

    const targetAirplaneQuaternion = new Quaternion().setFromEuler(
      new Euler(airplane.current.rotation.x, airplane.current.rotation.y, angle)
    );
    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);
  });

  const airplane = useRef();

  return (
    <>
      {/* <OrbitControls enableZoom={false} /> */}
      <group ref={cameraGroup}>
        <Background />
        <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
        <group ref={airplane}>
          <Float floatIntensity={1} speed={1.5} rotationIntensity={0.5}>
            <Airplane
              rotation-y={Math.PI / 2}
              scale={[0.2, 0.2, 0.2]}
              position-y={0.1}
            />
          </Float>
        </group>
      </group>
      {/* LINE */}
      <group position-y={-2}>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve,
              },
            ]}
          />
          <meshStandardMaterial
            color={"white"}
            opacity={0.7}
            transparent
            // envMapIntensity={2}
          />
        </mesh>
      </group>

      {/* TEXT */}
      <group position={[-3, 0, -100]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY={"middle"}
          fontSize={0.22}
          maxWidth={2.5}
          font="./fonts/DMSerifDisplay-Regular.ttf"
        >
          Welcome to Grin!{"\n"}
          Have a seat and enjoy the ride!
        </Text>
      </group>

      <group position={[-10, 1, -200]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY={"middle"}
          fontSize={0.52}
          maxWidth={2.5}
          font="./fonts/DMSerifDisplay-Regular.ttf"
        >
          Services
        </Text>
        <Text
          color="white"
          anchorX={"left"}
          anchorY={"top"}
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font="./fonts/DMSerifDisplay-Regular.ttf"
        >
          Do you want a drink?{"\n"}
          We have a wide range of beverages!
        </Text>
      </group>

      <Cloud scale={[1, 1, 1.5]} position={[-3.5, -1.2, -7]} />
      <Cloud scale={[1, 1, 2]} position={[3.5, -1, -10]} rotation-y={Math.PI} />
      <Cloud
        scale={[1, 1, 1]}
        position={[-3.5, 0.2, -12]}
        rotation-y={Math.PI / 3}
      />
      <Cloud scale={[1, 1, 1]} position={[3.5, 0.2, -12]} />
      <Cloud scale={[0.4, 0.4, 0.4]} position={[1, -0.2, -12]} />
      <Cloud scale={[0.3, 0.5, 2]} position={[-4, -0.5, -53]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-1, -1.5, -100]} />
    </>
  );
};
