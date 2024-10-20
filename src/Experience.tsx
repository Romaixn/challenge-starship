import { Center, Environment, OrbitControls } from "@react-three/drei"
import Spaceship from "./components/Spaceship"

const Experience = () => {
    return (
        <>
            <color attach='background' args={['#0B192C']} />

            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Environment preset='night' />

            <OrbitControls makeDefault />

            <Center>
                <Spaceship />
            </Center>
        </>
    )
}

export default Experience
