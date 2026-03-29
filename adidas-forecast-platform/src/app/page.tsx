import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Challenge from "./components/Challenge";
import PlatformModules from "./components/PlatformModules";
import Architecture from "./components/Architecture";
import DataSources from "./components/DataSources";
import ModelStrategy from "./components/ModelStrategy";
import Governance from "./components/Governance";
import Roadmap from "./components/Roadmap";
import KPIs from "./components/KPIs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Challenge />
      <PlatformModules />
      <Architecture />
      <DataSources />
      <ModelStrategy />
      <Governance />
      <Roadmap />
      <KPIs />
      <Footer />
    </main>
  );
}
