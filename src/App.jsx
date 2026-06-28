import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Work from './components/Work';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import Feedback from './components/Feedback';
import Footer from './components/Footer';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Work />
        <Experience />
        <Education />
        <Contact />
        <Feedback />
      </main>
      <Footer />
    </>
  );
}
