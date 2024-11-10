import Home from './components/pages/home/home';
import SignIn from "./components/pages/login/login";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Circle from './components/pages/circle/circle';


const App = () => {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/sign-in" element={<SignIn />}></Route>
          <Route path="/circle/:circleId" element={<Circle />}></Route>
        </Routes>
      </main>
    </Router>
  );
}


export default App;
