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
import { CatmullRomCurve3, Euler, Quaternion, Shape, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

const LINE_NB_POINTS = 12000;

export const Experience = () => {
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      [
        new Vector3(0, 0, 0),
        new Vector3(0, 0, -10),
        new Vector3(-2, 0, -20),
        new Vector3(-3, 0, -30),
        new Vector3(0, 0, -40),
        new Vector3(5, 0, -50),
        new Vector3(7, 0, -60),
        new Vector3(5, 0, -70),
        new Vector3(0, 0, -80),
        new Vector3(0, 0, -90),
        new Vector3(0, 0, -100),
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
    const curPointIndex = Math.min(
      Math.round(scroll.offset * linePoints.length),
      linePoints.length - 1
    );

    const curPoint = linePoints[curPointIndex];
    const pointAhead =
      linePoints[Math.min(curPointIndex + 1, linePoints.length - 1)];
    const xDisplacement = (pointAhead.x - curPoint.x) * 80;

    // Math.PI / 2 ==> LEFT
    // -Math.PI / 2 ==> RIGHT

    const angleRotation =
      (xDisplacement < 0 ? 1 : -1) *
      Math.min(Math.abs(xDisplacement), Math.PI / 3);

    const targetAirplaneQuaternion = new Quaternion().setFromEuler(
      new Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angleRotation
      )
    );

    const targetCameraQuaternion = new Quaternion().setFromEuler(
      new Euler(
        cameraGroup.current.rotation.x,
        angleRotation,
        cameraGroup.current.rotation.z
      )
    );

    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);
    cameraGroup.current.quaternion.slerp(targetCameraQuaternion, delta * 2);

    cameraGroup.current.position.lerp(curPoint, delta * 24);
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
