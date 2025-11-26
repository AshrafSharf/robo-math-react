import React, { useState, useEffect, useRef } from 'react';
import CommandEditor from './components/CommandEditor';
import './App.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const canvasRef = useRef(null);

  const handleExecute = (command) => {
    console.log('Execute command:', command);
  };

  const handleExecuteAll = (commands) => {
    console.log('Execute all commands:', commands);
  };

  const handleStop = () => {
    console.log('Stop execution');
  };

  const handlePause = () => {
    console.log('Pause execution');
  };

  const handleResume = () => {
    console.log('Resume execution');
  };

  const handleChange = (commands) => {
    console.log('Commands updated:', commands);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Draw circle on canvas whenever it resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      // Set canvas size to match container
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circle in center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 4;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#3366CC';
      ctx.fill();
      ctx.strokeStyle = '#DC3912';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw text showing canvas size
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, centerX, 30);
    };

    resizeCanvas();

    // Redraw on window resize
    window.addEventListener('resize', resizeCanvas);

    // Redraw when sidebar toggles (use a small delay for transition)
    const timeout = setTimeout(resizeCanvas, 250);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timeout);
    };
  }, [isSidebarCollapsed]);

  return (
    <div id="robo" className="robo-compass-div">
      {/* Top Header */}
      <div className="robo-compass-header navbar navbar-inverse">
        <div className="navbar-header robo-logo">
          <a className="navbar-brand" href="/">
            <h3 style={{ margin: 0, color: 'white', display: 'inline-block' }}>Robo Math</h3>
          </a>
        </div>
      </div>

      {/* Main Shell */}
      <div className="robo-shell-main">
        {/* Command Editor */}
        <CommandEditor
          onExecute={handleExecute}
          onExecuteAll={handleExecuteAll}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onChange={handleChange}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Play Surface */}
        <div className={`robo-shell-main-playsurface ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              background: '#fafafa'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
