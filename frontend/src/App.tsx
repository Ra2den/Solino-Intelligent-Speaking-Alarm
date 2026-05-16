import BgSimulator from "./components/BgSimulator";
import { HomeScreen } from "./components/HomeScreen";
import { PhaseProvider } from "./contexts/phase.context";

function App() {
  return (
    <PhaseProvider>
      <BgSimulator>
        <HomeScreen />
      </BgSimulator>
    </PhaseProvider>
  );
}

export default App;