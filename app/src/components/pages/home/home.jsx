import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../../ui/header/header';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../ui/footer/footer';

const BOX_WIDTH = 200;
const BOX_HEIGHT = 200;


function generateRandomPositionInBox(circles, size) {
  let top, left;
  const attempts = 100;
  let validPosition = false;

  for (let attempt = 0; attempt < attempts; attempt++) {
    top = Math.floor(Math.random() * (BOX_HEIGHT - size));
    left = Math.floor(Math.random() * (BOX_WIDTH - size));

    validPosition = !circles.some(circle => {
      const distX = Math.abs(circle.left - left);
      const distY = Math.abs(circle.top - top);
      const combinedRadius = (circle.size + size) / 2;
      return distX < combinedRadius && distY < combinedRadius;
    });

    if (validPosition) break;
  }

  return { top, left };
}

function generateRandomSize() {
  return Math.floor(Math.random() * (160 - 60 + 1)) + 60;
}


function to2DArray(arr) {
  const result = [];
  let i = 0;

  while (i < arr.length) {
    const rowSize = Math.floor(Math.random() * (4 - 3 + 1)) + 3;
    result.push(arr.slice(i, i + rowSize));
    i += rowSize;
  }

  return result;
}

function generateRandomDuration() {
  return 6 + Math.random() * 4;
}

function PulsatingButton({ id, text, size, position }) {
  const [isHovered, setIsHovered] = useState(false);

  const wiggleX = Array(5).fill().map(() => Math.random() * 10 - 5);
  const wiggleY = Array(5).fill().map(() => Math.random() * 10 - 5);

  return (
    <Link to={`/circle/${id}`}>
      <motion.button
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          width: size,
          height: size,
          borderRadius: '50%',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          backgroundColor: isHovered ? '#152474' : '#1E3A8A',
        }}
        animate={{
          scale: isHovered ? 1.15 : 1,
          x: isHovered ? 0 : wiggleX,
          y: isHovered ? 0 : wiggleY,
        }}
        transition={{
          scale: { duration: 0.4, ease: 'easeInOut' },
          x: {
            duration: generateRandomDuration(),
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
            delay: isHovered ? 0 : 0.2,
          },
          y: {
            duration: generateRandomDuration(),
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
            delay: isHovered ? 0 : 0.2,
          },
          transitionEnd: {
            x: {
              duration: 0.5,
              ease: 'easeInOut',
            },
            y: {
              duration: 0.5,
              ease: 'easeInOut',
            },
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {text}
      </motion.button>
    </Link>
  );
}

const Hero = () => {
  const [circles, setCircles] = useState([]);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  const addCircle = (id, circleName) => {
    if (circleName) {
      const randomSize = generateRandomSize();
      const position = generateRandomPositionInBox(circles, randomSize);

      return { id: id, name: circleName, size: randomSize, ...position }
    }
  };

  const getRows = async (searchParam) => {
    let temp = [];

    try {
      const token = localStorage.getItem('authToken');

      let endPoint = "";

      if (searchParam.trim() === "") {
        endPoint = `${process.env.REACT_APP_API_BASE_URL}/api/home`;
      } else {
        endPoint = `${process.env.REACT_APP_API_BASE_URL}/api/home?q=${searchParam}`
      }

      const response = await fetch(endPoint, {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + token,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        let data = await response.json();

        data = data?.data;

        data.forEach(element => {
          temp.push(addCircle(element.id, element.name));
        });
      } else {
        return [];
      }
    } catch (err) {
      return [];
    };

    let out = to2DArray(temp)

    setRows(out);
  };

  const handleInputChange = (e) => {
    getRows(e.target.value)
  };

  const handleButtonClick = async (e) => {
    const token = localStorage.getItem('authToken');

    const title = prompt("How would you like to name a circle?")

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/circle/create`, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title
      }),
    });

    const data = await response.json();

    navigate(`/circle/${data.id}/`);
  }

  useEffect(() => { getRows("") }, [])

  return (
    <section style={{ width: '100%', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
        <form className="w-2/5 mt-8">
          <label htmlFor="default-search" className="mb-2 text-sm font-medium text-slate-50 sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full px-4 py-3 ps-10 text-sm text-slate-50 rounded-lg bg-blue-950 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search circles"
              onChange={handleInputChange}
            />
          </div>
        </form>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
        id='circle-container'
      >
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              width: '100%',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: rowIndex * 0.2 }}
          >
            {row.map((circle) => (
              <div
                key={circle.id}
                style={{
                  position: 'relative',
                  width: BOX_WIDTH,
                  height: BOX_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PulsatingButton id={circle.id} text={circle.name} name={circle.name} size={circle.size} position={{ top: circle.top, left: circle.left }} />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <motion.button
          className='mb-8'
          onClick={handleButtonClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#152474',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Add Circle
        </motion.button>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <Footer />
    </>
  );
};

export default Home;
