/**
 * Custom Audio Player Component - Exact CodeSamplez Style
 */

export class CustomAudioPlayer {
  constructor() {
    this.audio = null;
    this.container = null;
    this.playButton = null;
    this.prevButton = null;
    this.nextButton = null;
    this.progressContainer = null;
    this.progressBar = null;
    this.currentTimeSpan = null;
    this.durationSpan = null;
    this.volumeSlider = null;
    this.autoPlayCheckbox = null;
    this.isPlaying = false;
    this.onPrev = null;
    this.onNext = null;
    this.autoPlayEnabled = false;
    this.autoPlayTimer = null;
    this.minAutoPlayDelay = 3000; // 3 seconds minimum
  }

  create() {
    // Create main container with dark glassy background
    this.container = document.createElement('div');
    this.container.className = 'custom-player';
    this.container.style.cssText = `
      width: auto;
      padding: 10px 15px;
      background: rgba(30, 30, 30, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: block;
      cursor: move;
      user-select: none;
      font-family: Arial, sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    `;

    // Create hidden audio element
    this.audio = document.createElement('audio');
    this.audio.id = 'myAudio';
    this.audio.preload = 'metadata';

    // Create single row container for all controls
    const controlsRow = document.createElement('div');
    controlsRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 15px;
    `;

    // Create previous slide button (yellow) - flat design
    this.prevButton = document.createElement('button');
    this.prevButton.textContent = 'PREV';
    this.prevButton.title = '';
    this.prevButton.style.cssText = `
      background: #f1c40f;
      color: #2c3e50;
      border: none;
      padding: 8px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      outline: none;
      width: 75px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      user-select: none;
    `;
    
    // Add flat hover and active states for prev button
    this.prevButton.addEventListener('mouseenter', () => {
      if (!this.prevButton.disabled) {
        this.prevButton.style.background = '#f39c12';
        this.prevButton.style.transform = 'scale(1.05)';
      }
    });
    this.prevButton.addEventListener('mouseleave', () => {
      if (!this.prevButton.disabled) {
        this.prevButton.style.background = '#f1c40f';
        this.prevButton.style.transform = 'scale(1)';
      }
    });
    this.prevButton.addEventListener('mousedown', () => {
      if (!this.prevButton.disabled) {
        this.prevButton.style.transform = 'scale(0.95)';
      }
    });
    this.prevButton.addEventListener('mouseup', () => {
      if (!this.prevButton.disabled) {
        this.prevButton.style.transform = 'scale(1.05)';
      }
    });

    // Create blue play button - flat design
    this.playButton = document.createElement('button');
    this.playButton.id = 'playButton';
    this.playButton.textContent = '▶';
    this.playButton.title = ''; // Remove tooltip
    this.playButton.style.cssText = `
      background: #3498db;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      outline: none;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      user-select: none;
    `;
    
    // Add flat hover and active states for play button
    this.playButton.addEventListener('mouseenter', () => {
      if (!this.playButton.disabled) {
        this.playButton.style.background = '#5dade2';
        this.playButton.style.transform = 'scale(1.1)';
      }
    });
    this.playButton.addEventListener('mouseleave', () => {
      if (!this.playButton.disabled) {
        this.playButton.style.background = '#3498db';
        this.playButton.style.transform = 'scale(1)';
      }
    });
    this.playButton.addEventListener('mousedown', () => {
      if (!this.playButton.disabled) {
        this.playButton.style.transform = 'scale(0.95)';
      }
    });
    this.playButton.addEventListener('mouseup', () => {
      if (!this.playButton.disabled) {
        this.playButton.style.transform = 'scale(1.1)';
      }
    });

    // Create next slide button (light green) - flat design
    this.nextButton = document.createElement('button');
    this.nextButton.textContent = 'NEXT';
    this.nextButton.title = '';
    this.nextButton.style.cssText = `
      background: #2ecc71;
      color: black;
      border: none;
      padding: 8px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
      outline: none;
      width: 75px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      user-select: none;
    `;
    
    // Add flat hover and active states for next button
    this.nextButton.addEventListener('mouseenter', () => {
      if (!this.nextButton.disabled) {
        this.nextButton.style.background = '#58d68d';
        this.nextButton.style.transform = 'scale(1.05)';
      }
    });
    this.nextButton.addEventListener('mouseleave', () => {
      if (!this.nextButton.disabled) {
        this.nextButton.style.background = '#2ecc71';
        this.nextButton.style.transform = 'scale(1)';
      }
    });
    this.nextButton.addEventListener('mousedown', () => {
      if (!this.nextButton.disabled) {
        this.nextButton.style.transform = 'scale(0.95)';
      }
    });
    this.nextButton.addEventListener('mouseup', () => {
      if (!this.nextButton.disabled) {
        this.nextButton.style.transform = 'scale(1.05)';
      }
    });

    // Audio track removed - keeping references for compatibility but hidden
    this.currentTimeSpan = document.createElement('span');
    this.currentTimeSpan.style.display = 'none';

    this.progressContainer = document.createElement('div');
    this.progressContainer.style.display = 'none';

    this.progressBar = document.createElement('div');
    this.progressBar.style.display = 'none';

    this.progressHandle = document.createElement('div');
    this.progressHandle.style.display = 'none';

    this.progressBar.appendChild(this.progressHandle);

    this.durationSpan = document.createElement('span');
    this.durationSpan.style.display = 'none';

    // Create volume control
    const volumeContainer = document.createElement('div');
    volumeContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
    `;

    const volumeIcon = document.createElement('div');
    volumeIcon.innerHTML = '♪';
    volumeIcon.style.cssText = `
      color: #ecf0f1;
      font-size: 20px;
      font-weight: bold;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = '80';
    this.volumeSlider.style.cssText = `
      width: 60px;
      height: 4px;
      background: #34495e;
      outline: none;
      border-radius: 2px;
      cursor: pointer;
    `;

    // Create auto-play toggle switch container
    const autoPlayContainer = document.createElement('div');
    autoPlayContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 10px;
    `;

    // Hidden checkbox
    this.autoPlayCheckbox = document.createElement('input');
    this.autoPlayCheckbox.type = 'checkbox';
    this.autoPlayCheckbox.id = 'autoPlayCheckbox';
    this.autoPlayCheckbox.style.cssText = `
      display: none;
    `;

    // Toggle switch track
    const toggleSwitch = document.createElement('label');
    toggleSwitch.htmlFor = 'autoPlayCheckbox';
    toggleSwitch.style.cssText = `
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    `;

    // Toggle switch thumb
    const toggleThumb = document.createElement('span');
    toggleThumb.style.cssText = `
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    `;

    toggleSwitch.appendChild(toggleThumb);

    // Store references for state updates
    this.toggleSwitch = toggleSwitch;
    this.toggleThumb = toggleThumb;

    // Update switch appearance on checkbox change (combined with auto-play logic)
    this.autoPlayCheckbox.addEventListener('change', (e) => {
      e.stopPropagation();

      // Update toggle switch appearance
      if (this.autoPlayCheckbox.checked) {
        toggleSwitch.style.background = '#2ecc71';
        toggleSwitch.style.borderColor = '#27ae60';
        toggleThumb.style.left = '22px';
      } else {
        toggleSwitch.style.background = 'rgba(255, 255, 255, 0.2)';
        toggleSwitch.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        toggleThumb.style.left = '2px';
      }

      // Handle auto-play logic
      this.autoPlayEnabled = e.target.checked;
      if (this.autoPlayEnabled) {
        this.scheduleAutoAdvance();
      } else {
        this.clearAutoAdvance();
      }
    });

    const autoPlayLabel = document.createElement('span');
    autoPlayLabel.textContent = 'Auto-Play';
    autoPlayLabel.style.cssText = `
      color: #ecf0f1;
      font-size: 12px;
      user-select: none;
      font-weight: 500;
    `;

    autoPlayContainer.appendChild(this.autoPlayCheckbox);
    autoPlayContainer.appendChild(toggleSwitch);
    autoPlayContainer.appendChild(autoPlayLabel);

    // Assemble all controls in single row
    this.progressContainer.appendChild(this.progressBar);
    volumeContainer.appendChild(volumeIcon);
    volumeContainer.appendChild(this.volumeSlider);

    // Add all controls directly to the row (simplified layout)
    controlsRow.appendChild(this.prevButton);
    controlsRow.appendChild(this.playButton);
    controlsRow.appendChild(this.nextButton);
    controlsRow.appendChild(volumeContainer);
    controlsRow.appendChild(autoPlayContainer);

    this.container.appendChild(this.audio);
    this.container.appendChild(controlsRow);

    // Setup event listeners
    this.setupEventListeners();

    return this.container;
  }

  setupEventListeners() {
    // Previous button
    this.prevButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.prevButton.disabled && this.onPrev) this.onPrev();
    });

    // Play/Pause button
    this.playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.playButton.disabled) {
        if (this.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      }
    });

    // Next button
    this.nextButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.nextButton.disabled && this.onNext) this.onNext();
    });

    // Progress bar click to seek
    this.progressContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = this.progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = this.audio.duration * percent;
    });

    // Progress handle drag functionality
    let isDraggingProgress = false;
    
    this.progressHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDraggingProgress = true;
      document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDraggingProgress) return;
      e.preventDefault();
      
      const rect = this.progressContainer.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audio.currentTime = this.audio.duration * percent;
    });

    document.addEventListener('mouseup', () => {
      if (isDraggingProgress) {
        isDraggingProgress = false;
        document.body.style.cursor = 'default';
      }
    });

    // Audio events
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSpan.textContent = this.formatTime(this.audio.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressBar.style.width = percent + '%';
      this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
      
      // Show/hide handle based on progress
      if (percent > 0) {
        this.progressHandle.style.display = 'block';
      } else {
        this.progressHandle.style.display = 'none';
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.playButton.textContent = '⏸';
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.playButton.textContent = '▶';
    });

    // Audio ended event - handle UI reset and auto-play
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.playButton.textContent = '▶';
      this.playButton.style.background = '#3498db';
      this.progressBar.style.width = '0%';
      this.currentTimeSpan.textContent = '0:00';

      // Trigger auto-advance if enabled
      if (this.autoPlayEnabled) {
        this.scheduleAutoAdvance();
      }
    });

    // Volume slider event
    this.volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.audio.volume = e.target.value / 100;
    });
  }

  /**
   * Schedule auto-advance to next slide/fragment
   * Waits for max(audioDuration, 3 seconds)
   */
  scheduleAutoAdvance() {
    // Clear any existing timer
    this.clearAutoAdvance();

    if (!this.autoPlayEnabled) return;

    // Calculate delay: max of audio duration or 3 seconds
    let delay = this.minAutoPlayDelay;

    // If audio is playing and has duration
    if (this.audio && !this.audio.paused && this.audio.duration > 0) {
      // Calculate remaining audio time
      const remainingTime = (this.audio.duration - this.audio.currentTime) * 1000;
      delay = Math.max(remainingTime, this.minAutoPlayDelay);
    }

    console.log(`Auto-play scheduled in ${delay}ms`);

    // Set timer to advance
    this.autoPlayTimer = setTimeout(() => {
      if (this.autoPlayEnabled && this.onNext) {
        console.log('Auto-advancing to next slide/fragment');
        this.onNext();
      }
    }, delay);
  }

  /**
   * Clear any pending auto-advance timer
   */
  clearAutoAdvance() {
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
      console.log('Auto-advance timer cleared');
    }
  }

  play() {
    this.audio.play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  }

  pause() {
    this.audio.pause();
  }

  loadAudio(src) {
    this.audio.src = src;
    this.audio.currentTime = 0;
  }

  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
    this.pause();
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  setNavigationCallbacks(onPrev, onNext) {
    this.onPrev = onPrev;
    this.onNext = onNext;
  }

  disablePlayButton() {
    this.playButton.disabled = true;
    this.playButton.style.background = '#7f8c8d';
    this.playButton.style.cursor = 'not-allowed';
  }

  enablePlayButton() {
    this.playButton.disabled = false;
    this.playButton.style.background = '#3498db';
    this.playButton.style.cursor = 'pointer';
  }

  updateNavigationStates(isFirstSlide, isLastSlide) {
    // Update previous button state
    if (isFirstSlide) {
      this.prevButton.disabled = true;
      this.prevButton.style.background = '#95a5a6';
      this.prevButton.style.cursor = 'not-allowed';
      this.prevButton.style.opacity = '0.5';
      this.prevButton.style.transform = 'translateY(0)';
      this.prevButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    } else {
      this.prevButton.disabled = false;
      this.prevButton.style.background = '#f1c40f';
      this.prevButton.style.cursor = 'pointer';
      this.prevButton.style.opacity = '1';
      this.prevButton.style.transform = 'translateY(0)';
      this.prevButton.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
    }
    
    // Update next button state
    if (isLastSlide) {
      this.nextButton.disabled = true;
      this.nextButton.style.background = '#95a5a6';
      this.nextButton.style.cursor = 'not-allowed';
      this.nextButton.style.opacity = '0.5';
      this.nextButton.style.transform = 'translateY(0)';
      this.nextButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    } else {
      this.nextButton.disabled = false;
      this.nextButton.style.background = '#2ecc71';
      this.nextButton.style.cursor = 'pointer';
      this.nextButton.style.opacity = '1';
      this.nextButton.style.transform = 'translateY(0)';
      this.nextButton.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
    }
  }

  // Drag functionality
  setupDragFunctionality() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    this.container.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on interactive elements
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'INPUT' || 
          e.target === this.progressContainer || 
          e.target === this.progressBar ||
          e.target === this.progressHandle ||
          e.target === this.volumeSlider) {
        return;
      }
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Get current position
      const rect = this.container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      // Remove transform and set absolute position
      this.container.style.transform = 'none';
      this.container.style.left = initialLeft + 'px';
      this.container.style.top = initialTop + 'px';
      this.container.style.bottom = 'auto';
      
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      this.container.style.left = (initialLeft + deltaX) + 'px';
      this.container.style.top = (initialTop + deltaY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
      }
    });
  }
}