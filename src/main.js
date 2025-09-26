import './style.css';

// Force rebuild to fix deployment issues

class CircularPomodoroTimer {
    constructor() {
        this.workDuration = 25; // minutes
        this.shortBreakDuration = 5; // minutes
        this.longBreakDuration = 15; // minutes
        this.longBreakInterval = 4; // long break every 4 sessions
        
        // Deep work settings
        this.focusedWorkDuration = 50; // minutes
        this.focusedBreakDuration = 10; // minutes
        this.ultradianDuration = 90; // minutes
        this.ultradianBreakDuration = 25; // minutes (20-30 min range)
        this.lightWorkDuration = 15; // minutes
        this.lightBreakDuration = 3; // minutes
        
        // Current mode (pomodoro or deepWork)
        this.currentMode = 'pomodoro';
        this.currentTime = this.workDuration * 60; // seconds
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.sessionCount = 0;
        this.totalSessionsCompleted = 0;
        this.timerInterval = null;
        this.audioContext = null;
        this.currentTask = '';
        this.currentProject = '';
        this.notificationsEnabled = true;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.autoStartNext = true;
        this.focusMode = false;
        this.bellEnabled = true;
        this.selectedSound = 'chime'; // Default to chime sound
        this.dailyStats = this.loadDailyStats();
        this.weeklyStats = this.loadWeeklyStats();
        
        this.init();
    }

    init() {
        this.createUI();
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.bindEvents();
            this.createClockFace();
            this.loadSettings();
            this.loadBellSettings();
            this.updateDisplay();
            this.updateProgress();
            this.initAudio();
            
            // Set work mode as active by default
            document.getElementById('work-mode-btn').classList.add('active');
            
            // Set initial timer durations for each page
            this.currentTime = this.workDuration * 60; // 25 minutes for work
            
            // Check if timer pages exist
            const workPage = document.getElementById('work-timer-page');
            const shortBreakPage = document.getElementById('shortBreak-timer-page');
            const longBreakPage = document.getElementById('longBreak-timer-page');
            
            
            if (workPage) {
                document.getElementById('work-timer-display').textContent = '25:00';
            }
            if (shortBreakPage) {
                document.getElementById('shortBreak-timer-display').textContent = '05:00';
            }
            if (longBreakPage) {
                document.getElementById('longBreak-timer-display').textContent = '15:00';
            }
            
            // Set deep work timer displays
            const focusedWorkPage = document.getElementById('focusedWork-timer-page');
            const ultradianPage = document.getElementById('ultradian-timer-page');
            const lightWorkPage = document.getElementById('lightWork-timer-page');
            
            if (focusedWorkPage) {
                document.getElementById('focusedWork-timer-display').textContent = '50:00';
            }
            if (ultradianPage) {
                document.getElementById('ultradian-timer-display').textContent = '90:00';
            }
            if (lightWorkPage) {
                document.getElementById('lightWork-timer-display').textContent = '15:00';
            }
            
            // Start the glow animation for the default timer
            this.startGlowAnimation();
        }, 10);
    }

    createUI() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Mode Slider -->
            <div class="mode-slider-container">
                <div class="mode-slider">
                    <div class="slider-track">
                        <div class="slider-dot active" id="pomodoro-dot" data-mode="pomodoro">
                            <span class="dot-label">Pomodoro</span>
                        </div>
                        <div class="slider-dot" id="deep-work-dot" data-mode="deepWork">
                            <span class="dot-label">Deep Work</span>
                        </div>
                    </div>
                </div>
                
                <!-- Bell Toggle -->
                <div class="bell-toggle-container">
                    <button class="bell-toggle-btn" id="bell-toggle-btn" title="Toggle notification sound">
                        <span class="bell-icon">🔔</span>
                    </button>
                </div>
            </div>

            <!-- Time Mode Buttons -->
            <div class="time-modes" id="pomodoro-modes">
                <button class="time-mode-btn" id="work-mode-btn" data-mode="work">Work Session<br><span class="mode-duration">25 min</span></button>
                <button class="time-mode-btn" id="short-break-mode-btn" data-mode="shortBreak">Short Break<br><span class="mode-duration">5 min</span></button>
                <button class="time-mode-btn" id="long-break-mode-btn" data-mode="longBreak">Long Break<br><span class="mode-duration">15 min</span></button>
            </div>

            <!-- Deep Work Mode Buttons -->
            <div class="time-modes" id="deep-work-modes" style="display: none;">
                <button class="time-mode-btn" id="focused-work-mode-btn" data-mode="focusedWork">Focused Work<br><span class="mode-duration">50 min</span></button>
                <button class="time-mode-btn" id="ultradian-mode-btn" data-mode="ultradian">Ultradian<br><span class="mode-duration">90 min</span></button>
                <button class="time-mode-btn" id="light-work-mode-btn" data-mode="lightWork">Light Work<br><span class="mode-duration">15 min</span></button>
            </div>


            <!-- Work Session Timer Page -->
            <div class="timer-page" id="work-timer-page">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="work-progress-ring"></div>
                        <div class="timer-progress-dot" id="work-progress-dot"></div>
                        <div class="clock-face" id="work-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Focus</div>
                            <div class="timer-display" id="work-timer-display">25:00</div>
                            <div class="timer-status" id="work-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Short Break Timer Page -->
            <div class="timer-page" id="shortBreak-timer-page" style="display: none;">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="shortBreak-progress-ring"></div>
                        <div class="timer-progress-dot" id="shortBreak-progress-dot"></div>
                        <div class="clock-face" id="shortBreak-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Short Break</div>
                            <div class="timer-display" id="shortBreak-timer-display">5:00</div>
                            <div class="timer-status" id="shortBreak-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Long Break Timer Page -->
            <div class="timer-page" id="longBreak-timer-page" style="display: none;">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="longBreak-progress-ring"></div>
                        <div class="timer-progress-dot" id="longBreak-progress-dot"></div>
                        <div class="clock-face" id="longBreak-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Long Break</div>
                            <div class="timer-display" id="longBreak-timer-display">15:00</div>
                            <div class="timer-status" id="longBreak-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Focused Work Timer Page -->
            <div class="timer-page" id="focusedWork-timer-page" style="display: none;">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="focusedWork-progress-ring"></div>
                        <div class="timer-progress-dot" id="focusedWork-progress-dot"></div>
                        <div class="clock-face" id="focusedWork-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Focused Work</div>
                            <div class="timer-display" id="focusedWork-timer-display">50:00</div>
                            <div class="timer-status" id="focusedWork-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ultradian Timer Page -->
            <div class="timer-page" id="ultradian-timer-page" style="display: none;">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="ultradian-progress-ring"></div>
                        <div class="timer-progress-dot" id="ultradian-progress-dot"></div>
                        <div class="clock-face" id="ultradian-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Ultradian</div>
                            <div class="timer-display" id="ultradian-timer-display">90:00</div>
                            <div class="timer-status" id="ultradian-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Light Work Timer Page -->
            <div class="timer-page" id="lightWork-timer-page" style="display: none;">
                <div class="timer-container">
                    <div class="timer-circle">
                        <div class="timer-progress-ring" id="lightWork-progress-ring"></div>
                        <div class="timer-progress-dot" id="lightWork-progress-dot"></div>
                        <div class="clock-face" id="lightWork-clock-face"></div>
                        <div class="timer-inner">
                            <div class="timer-mode">Light Work</div>
                            <div class="timer-display" id="lightWork-timer-display">15:00</div>
                            <div class="timer-status" id="lightWork-timer-status">Ready to start</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Control Buttons -->
            <div class="controls">
                <button class="control-btn secondary" id="start-btn">Start</button>
                <button class="control-btn secondary" id="reset-btn">Reset</button>
            </div>


        `;
    }

    createClockFace() {
        // Create clock faces for all timer pages
        const clockFaces = [
            'work-clock-face', 'shortBreak-clock-face', 'longBreak-clock-face',
            'focusedWork-clock-face', 'ultradian-clock-face', 'lightWork-clock-face'
        ];
        
        clockFaces.forEach(clockFaceId => {
            const clockFace = document.getElementById(clockFaceId);
            
            // Create 60 tick marks (one for each minute)
            for (let i = 0; i < 60; i++) {
                const tick = document.createElement('div');
                tick.className = 'clock-tick';
                
                // Major ticks every 5 minutes
                if (i % 5 === 0) {
                    tick.classList.add('major');
                } else {
                    tick.classList.add('minor');
                }
                
                // Rotate each tick to its position (starting from 12 o'clock)
                tick.style.transform = `rotate(${i * 6}deg)`;
                clockFace.appendChild(tick);
            }
        });
    }

    bindEvents() {
        // Timer controls
        document.getElementById('start-btn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetTimer());

        // Mode slider - check if elements exist
        const pomodoroDot = document.getElementById('pomodoro-dot');
        const deepWorkDot = document.getElementById('deep-work-dot');
        
        console.log('Slider elements found:', {
            pomodoroDot: pomodoroDot,
            deepWorkDot: deepWorkDot
        });
        
        if (pomodoroDot) {
            pomodoroDot.addEventListener('click', () => {
                console.log('Pomodoro dot clicked');
                this.switchMode('pomodoro');
            });
        } else {
            console.error('Pomodoro dot not found!');
        }
        
        if (deepWorkDot) {
            deepWorkDot.addEventListener('click', () => {
                console.log('Deep work dot clicked');
                this.switchMode('deepWork');
            });
        } else {
            console.error('Deep work dot not found!');
        }

        // Pomodoro mode buttons
        document.getElementById('work-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('work');
        });
        document.getElementById('short-break-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('shortBreak');
        });
        document.getElementById('long-break-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('longBreak');
        });

        // Deep work mode buttons
        document.getElementById('focused-work-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('focusedWork');
        });
        document.getElementById('ultradian-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('ultradian');
        });
        document.getElementById('light-work-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('lightWork');
        });

        // Bell toggle
        document.getElementById('bell-toggle-btn').addEventListener('click', () => {
            this.toggleBell();
        });
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            
            // Handle resuming from pause
            if (this.pausedTime) {
                const pauseDuration = Date.now() - this.pausedTime;
                this.startTime += pauseDuration; // Adjust start time to account for pause
                this.pausedTime = null;
            } else {
                // Fresh start
                this.startTime = Date.now();
                this.initialTime = this.currentTime;
            }
            
            this.timerInterval = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                
                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
            
            // Update progress more frequently for smooth animation
            this.progressInterval = setInterval(() => {
                this.updateProgressSmooth();
            }, 50);

            this.updateButtons();
            this.updateStatus('Running...');
            this.showNotification('Timer started! Focus time begins now.', 'info');
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.pausedTime = Date.now();
            clearInterval(this.timerInterval);
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
            this.updateButtons();
            this.updateStatus('Paused');
            this.showNotification('Timer paused', 'info');
        }
    }

    endSession() {
        if (this.isRunning) {
            this.pauseTimer();
        }
        this.resetTimer();
        this.showNotification('Session ended', 'info');
    }

    completeSession() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        if (this.currentSession === 'work') {
            this.sessionCount++;
            this.totalSessionsCompleted++;
            
            if (this.sessionCount % this.longBreakInterval === 0) {
                this.currentSession = 'longBreak';
                this.showNotification(`Great work! Time for a long break (${this.longBreakDuration} minutes)`, 'success');
                this.showDesktopNotification('Long Break Time!', `You've completed ${this.sessionCount} focus sessions. Time for a ${this.longBreakDuration}-minute break!`);
            } else {
                this.currentSession = 'shortBreak';
                this.showNotification(`Session complete! Take a short break (${this.shortBreakDuration} minutes)`, 'success');
                this.showDesktopNotification('Short Break Time!', `Focus session complete. Time for a ${this.shortBreakDuration}-minute break!`);
            }
        } else {
            this.currentSession = 'work';
            this.showNotification('Break time over! Ready for another focus session?', 'info');
            this.showDesktopNotification('Back to Work!', 'Break time is over. Ready for another focus session?');
        }
        
        this.currentTime = this.getSessionDuration() * 60;
        this.updateDisplay();
        this.updateProgress();
        this.updateButtons();
        this.updateSessionInfo();
        this.updateCycleInfo();
        this.updateDailyStats();
        this.playNotificationSound();
        this.vibrate();
        this.playBellSound();
        
        // Auto-start break sessions
        if (this.currentSession !== 'work') {
            setTimeout(() => {
                this.startTimer();
            }, 2000);
        }
    }

    skipSession() {
        if (this.isRunning) {
            this.pauseTimer();
        }
        
        if (this.currentSession === 'work') {
            this.showNotification('Work session skipped', 'info');
        } else {
            this.showNotification('Break skipped', 'info');
        }
        
        this.completeSession();
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        this.currentTime = this.getSessionDuration() * 60;
        this.updateDisplay();
        this.updateProgress();
        this.updateButtons();
        this.updateStatus('Ready to start');
        
        // Restart the glow animation after reset
        this.startGlowAnimation();
    }

    getSessionDuration() {
        switch (this.currentSession) {
            case 'work': return this.workDuration;
            case 'shortBreak': return this.shortBreakDuration;
            case 'longBreak': return this.longBreakDuration;
            case 'focusedWork': return this.focusedWorkDuration;
            case 'ultradian': return this.ultradianDuration;
            case 'lightWork': return this.lightWorkDuration;
            default: return this.workDuration;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update the display for the current active timer page
        const timerDisplayElement = document.getElementById(`${this.currentSession}-timer-display`);
        if (timerDisplayElement) {
            timerDisplayElement.textContent = display;
        }
    }

    updateProgress() {
        const totalTime = this.getSessionDuration() * 60;
        const progress = ((totalTime - this.currentTime) / totalTime) * 100;
        const angle = (progress / 100) * 360;
        
        const progressRing = document.getElementById(`${this.currentSession}-progress-ring`);
        const progressDot = document.getElementById(`${this.currentSession}-progress-dot`);
        
        if (progressRing && progressDot) {
            progressRing.style.setProperty('--progress-angle', `${angle}deg`);
            progressDot.style.setProperty('--progress-angle', `${angle}deg`);
        }
    }

    updateProgressSmooth() {
        if (!this.isRunning || !this.startTime) {
            // If timer is not running, show 0% progress
            const progressRing = document.getElementById(`${this.currentSession}-progress-ring`);
            const progressDot = document.getElementById(`${this.currentSession}-progress-dot`);
            
            if (progressRing && progressDot) {
                progressRing.style.setProperty('--progress-angle', '0deg');
                progressDot.style.setProperty('--progress-angle', '0deg');
            }
            return;
        }
        
        const totalTime = this.getSessionDuration() * 60;
        const elapsed = (Date.now() - this.startTime) / 1000; // elapsed time in seconds
        const remaining = Math.max(0, this.initialTime - elapsed);
        const progress = ((totalTime - remaining) / totalTime) * 100;
        const angle = Math.min(360, (progress / 100) * 360);
        
        const progressRing = document.getElementById(`${this.currentSession}-progress-ring`);
        const progressDot = document.getElementById(`${this.currentSession}-progress-dot`);
        
        if (progressRing && progressDot) {
            progressRing.style.setProperty('--progress-angle', `${angle}deg`);
            progressDot.style.setProperty('--progress-angle', `${angle}deg`);
        }
    }

    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        
        if (this.isRunning) {
            startBtn.textContent = 'Pause';
            startBtn.className = 'control-btn secondary';
        } else if (this.isPaused) {
            startBtn.textContent = 'Resume';
            startBtn.className = 'control-btn secondary';
        } else {
            startBtn.textContent = 'Start';
            startBtn.className = 'control-btn secondary';
        }
    }

    updateStatus(status) {
        const statusElement = document.getElementById(`${this.currentSession}-timer-status`);
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateSessionInfo() {
        // Session info is now handled by the separate timer pages
        // Each page has its own mode text that doesn't need updating
    }

    updateTaskInfo() {
        // Task info elements removed - method kept for compatibility
    }

    updateCycleInfo() {
        // Cycle info elements removed - method kept for compatibility
    }

    updateDailyStats() {
        // Daily stats functionality removed - method kept for compatibility
    }

    playNotificationSound() {
        // Sound notification functionality removed - method kept for compatibility
    }

    vibrate() {
        // Vibration functionality removed - method kept for compatibility
    }

    showNotification(message, type) {
        // Notification functionality removed - method kept for compatibility
    }

    switchMode(mode) {
        console.log(`Switching to mode: ${mode}`);
        
        // Update current mode
        this.currentMode = mode;
        
        // Update slider dots
        document.querySelectorAll('.slider-dot').forEach(dot => dot.classList.remove('active'));
        
        // Map mode names to correct dot IDs
        let targetDotId;
        if (mode === 'pomodoro') {
            targetDotId = 'pomodoro-dot';
        } else if (mode === 'deepWork') {
            targetDotId = 'deep-work-dot';
        }
        
        const targetDot = document.getElementById(targetDotId);
        console.log(`Target dot element:`, targetDot);
        if (targetDot) {
            targetDot.classList.add('active');
            console.log(`Activated ${mode} dot`);
        } else {
            console.error(`Dot element ${targetDotId} not found!`);
        }
        
        // Show/hide mode button groups
        if (mode === 'pomodoro') {
            document.getElementById('pomodoro-modes').style.display = 'flex';
            document.getElementById('deep-work-modes').style.display = 'none';
            // Set default to work session
            this.switchTimeMode('work');
        } else if (mode === 'deepWork') {
            document.getElementById('pomodoro-modes').style.display = 'none';
            document.getElementById('deep-work-modes').style.display = 'flex';
            // Set default to focused work session
            this.switchTimeMode('focusedWork');
        }
    }

    switchTimeMode(mode) {
        // Remove active class from all time mode buttons
        document.querySelectorAll('.time-mode-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        let buttonId;
        if (mode === 'work') {
            buttonId = 'work-mode-btn';
        } else if (mode === 'shortBreak') {
            buttonId = 'short-break-mode-btn';
        } else if (mode === 'longBreak') {
            buttonId = 'long-break-mode-btn';
        } else if (mode === 'focusedWork') {
            buttonId = 'focused-work-mode-btn';
        } else if (mode === 'ultradian') {
            buttonId = 'ultradian-mode-btn';
        } else if (mode === 'lightWork') {
            buttonId = 'light-work-mode-btn';
        }
        
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('active');
        }
        
        // Update the current session mode
        this.currentSession = mode;
        
        // Set the correct timer duration based on mode
        if (mode === 'work') {
            this.currentTime = this.workDuration * 60; // 25 minutes
        } else if (mode === 'shortBreak') {
            this.currentTime = this.shortBreakDuration * 60; // 5 minutes
        } else if (mode === 'longBreak') {
            this.currentTime = this.longBreakDuration * 60; // 15 minutes
        } else if (mode === 'focusedWork') {
            this.currentTime = this.focusedWorkDuration * 60; // 50 minutes
        } else if (mode === 'ultradian') {
            this.currentTime = this.ultradianDuration * 60; // 90 minutes
        } else if (mode === 'lightWork') {
            this.currentTime = this.lightWorkDuration * 60; // 15 minutes
        }
        
        // Hide all timer pages
        document.querySelectorAll('.timer-page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Show the selected timer page
        const pageId = `${mode}-timer-page`;
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
        }
        
        // Update the display to show the correct time
        this.updateDisplay();
        
        // Reset progress to 0% when switching modes
        this.updateProgress();
        
        // Start the glow animation for the selected timer
        this.startGlowAnimation();
        
        // Stop the timer if it's running and reset state
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = false;
            this.pausedTime = null;
        }
        
        // Force clear any existing interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // Update buttons and status to show the timer is ready
        this.updateButtons();
        this.updateStatus('Ready to start');
    }

    startPulseAnimation() {
        const timerCircle = document.querySelector(`#${this.currentSession}-timer-page .timer-circle`);
        if (timerCircle) {
            // Calculate animation duration based on current session duration
            const sessionDuration = this.getSessionDuration();
            const animationDuration = sessionDuration * 2; // 2 seconds per minute for slow rhythm
            
            timerCircle.style.animation = `pulseSlow ${animationDuration}s ease-in-out infinite`;
        }
    }

    stopPulseAnimation() {
        const timerCircle = document.querySelector(`#${this.currentSession}-timer-page .timer-circle`);
        if (timerCircle) {
            timerCircle.style.animation = 'none';
        }
    }

    startGlowAnimation() {
        const timerCircle = document.querySelector(`#${this.currentSession}-timer-page .timer-circle`);
        if (timerCircle) {
            // Calculate animation duration based on current session duration
            const sessionDuration = this.getSessionDuration();
            const animationDuration = sessionDuration * 2; // 2 seconds per minute for slow rhythm
            
            timerCircle.style.animation = `pulseSlow ${animationDuration}s ease-in-out infinite`;
        }
    }

    addTask() {
        // Simple task addition - in a real app, this would open a modal or form
        const task = prompt('Enter task description:');
        if (task) {
            this.currentTask = task;
            this.updateTaskInfo();
            this.showNotification('Task added successfully!', 'success');
        }
    }

    openSettings() {
        document.getElementById('settings-panel').classList.add('open');
        document.getElementById('overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        document.getElementById('settings-panel').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    updateSettings() {
        this.workDuration = parseInt(document.getElementById('work-duration').value) || 25;
        this.shortBreakDuration = parseInt(document.getElementById('short-break-duration').value) || 5;
        this.longBreakDuration = parseInt(document.getElementById('long-break-duration').value) || 15;
        this.longBreakInterval = parseInt(document.getElementById('long-break-interval').value) || 4;
        
        // Update current time if not running
        if (!this.isRunning) {
            this.currentTime = this.getSessionDuration() * 60;
            this.updateDisplay();
            this.updateProgress();
        }
        
        this.updateCycleInfo();
    }

    saveSettings() {
        this.updateSettings();
        localStorage.setItem('pomodoro-settings', JSON.stringify({
            workDuration: this.workDuration,
            shortBreakDuration: this.shortBreakDuration,
            longBreakDuration: this.longBreakDuration,
            longBreakInterval: this.longBreakInterval,
            currentTask: this.currentTask,
            currentProject: this.currentProject,
            soundEnabled: this.soundEnabled,
            notificationsEnabled: this.notificationsEnabled,
            vibrationEnabled: this.vibrationEnabled
        }));
        this.closeSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoro-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.workDuration = settings.workDuration || 25;
                this.shortBreakDuration = settings.shortBreakDuration || 5;
                this.longBreakDuration = settings.longBreakDuration || 15;
                this.longBreakInterval = settings.longBreakInterval || 4;
                this.currentTask = settings.currentTask || '';
                this.currentProject = settings.currentProject || '';
                this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
                this.notificationsEnabled = settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : true;
                this.vibrationEnabled = settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true;
                
                // Settings elements removed - values loaded but not displayed
                
                this.updateTaskInfo();
                this.updateCycleInfo();
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }


    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized successfully');
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.audioContext = null;
        }
    }

    playNotificationSound() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    showDesktopNotification(title, body) {
        if (!this.notificationsEnabled || !('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.svg',
                badge: '/favicon.svg'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: body,
                        icon: '/favicon.svg',
                        badge: '/favicon.svg'
                    });
                }
            });
        }
    }

    vibrate() {
        if (!this.vibrationEnabled || !('vibrate' in navigator)) return;
        
        // Vibration pattern: short, pause, short, pause, long
        navigator.vibrate([200, 100, 200, 100, 400]);
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }



    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        const focusBtn = document.getElementById('focus-mode-btn');
        
        if (this.focusMode) {
            focusBtn.style.background = 'rgba(225, 98, 89, 0.1)';
            focusBtn.style.color = '#e16259';
            document.body.classList.add('focus-mode');
            this.showNotification('Focus mode activated - distractions minimized', 'info');
        } else {
            focusBtn.style.background = '';
            focusBtn.style.color = '';
            document.body.classList.remove('focus-mode');
            this.showNotification('Focus mode deactivated', 'info');
        }
    }

    loadDailyStats() {
        const today = new Date().toDateString();
        const saved = localStorage.getItem('pomodoro-daily-stats');
        if (saved) {
            const stats = JSON.parse(saved);
            if (stats.date === today) {
                return stats;
            }
        }
        return {
            date: today,
            sessions: 0,
            focusTime: 0,
            streak: 0
        };
    }

    loadWeeklyStats() {
        const saved = localStorage.getItem('pomodoro-weekly-stats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            week: this.getWeekNumber(),
            sessions: 0,
            focusTime: 0
        };
    }

    getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + start.getDay() + 1) / 7);
    }

    updateDailyStats() {
        this.dailyStats.sessions = this.totalSessionsCompleted;
        this.dailyStats.focusTime = this.totalSessionsCompleted * this.workDuration;
        this.dailyStats.streak = this.calculateStreak();
        
        localStorage.setItem('pomodoro-daily-stats', JSON.stringify(this.dailyStats));
        this.updateStatsDisplay();
    }

    calculateStreak() {
        // Simple streak calculation - in a real app, you'd check consecutive days
        return this.dailyStats.streak + (this.totalSessionsCompleted > 0 ? 1 : 0);
    }

    updateStatsDisplay() {
        // Update any stats display elements if they exist
        const sessionsEl = document.getElementById('sessions-completed');
        const focusTimeEl = document.getElementById('focus-time');
        const streakEl = document.getElementById('streak-count');
        const weeklyEl = document.getElementById('weekly-sessions');
        
        if (sessionsEl) sessionsEl.textContent = this.dailyStats.sessions;
        if (focusTimeEl) focusTimeEl.textContent = `${this.dailyStats.focusTime}m`;
        if (streakEl) streakEl.textContent = this.dailyStats.streak;
        if (weeklyEl) weeklyEl.textContent = this.weeklyStats.sessions;
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    toggleBell() {
        this.bellEnabled = !this.bellEnabled;
        const bellBtn = document.getElementById('bell-toggle-btn');
        const bellIcon = bellBtn.querySelector('.bell-icon');
        
        if (this.bellEnabled) {
            bellIcon.textContent = '🔔';
            bellBtn.classList.add('active');
            bellBtn.title = 'Sound enabled - click to disable';
            this.showNotification('🔔 Sound notifications enabled', 'success');
            // Play a preview sound when enabling
            this.playBellSound(true);
        } else {
            bellIcon.textContent = '🔕';
            bellBtn.classList.remove('active');
            bellBtn.title = 'Sound disabled - click to enable';
            this.showNotification('🔕 Sound notifications disabled', 'info');
        }
        
        this.saveBellSettings();
    }

    saveBellSettings() {
        localStorage.setItem('pomodoro-bell-settings', JSON.stringify({
            bellEnabled: this.bellEnabled
        }));
    }

    loadBellSettings() {
        const saved = localStorage.getItem('pomodoro-bell-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.bellEnabled = settings.bellEnabled !== undefined ? settings.bellEnabled : true;
                
                // Update UI
                const bellBtn = document.getElementById('bell-toggle-btn');
                const bellIcon = bellBtn.querySelector('.bell-icon');
                
                if (this.bellEnabled) {
                    bellIcon.textContent = '🔔';
                    bellBtn.classList.add('active');
                    bellBtn.title = 'Sound enabled - click to disable';
                } else {
                    bellIcon.textContent = '🔕';
                    bellBtn.classList.remove('active');
                    bellBtn.title = 'Sound disabled - click to enable';
                }
            } catch (e) {
                console.error('Error loading bell settings:', e);
            }
        }
    }


    playBellSound(preview = false) {
        if (!this.bellEnabled && !preview) return;
        if (!this.audioContext) {
            console.warn('Audio context not available');
            return;
        }
        
        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create a pleasant chime with multiple frequencies
            const frequencies = [600, 750, 900]; // Chime frequencies
            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
                gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
                osc.start(this.audioContext.currentTime + index * 0.1);
                osc.stop(this.audioContext.currentTime + 0.8);
            });
            
            console.log('Bell sound played successfully');
        } catch (e) {
            console.error('Error playing bell sound:', e);
        }
    }

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CircularPomodoroTimer();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}