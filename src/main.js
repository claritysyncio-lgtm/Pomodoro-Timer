import './style.css';

class CircularPomodoroTimer {
    constructor() {
        this.workDuration = 25; // minutes
        this.shortBreakDuration = 5; // minutes
        this.longBreakDuration = 15; // minutes
        this.longBreakInterval = 4; // long break every 4 sessions
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
        }, 10);
    }

    createUI() {
        const app = document.getElementById('app');
        app.innerHTML = `

            <!-- Time Mode Buttons -->
            <div class="time-modes">
                <button class="time-mode-btn" id="work-mode-btn" data-mode="work">Work Session<br><span class="mode-duration">25 min</span></button>
                <button class="time-mode-btn" id="short-break-mode-btn" data-mode="shortBreak">Short Break<br><span class="mode-duration">5 min</span></button>
                <button class="time-mode-btn" id="long-break-mode-btn" data-mode="longBreak">Long Break<br><span class="mode-duration">15 min</span></button>
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

            <!-- Control Buttons -->
            <div class="controls">
                <button class="control-btn secondary" id="start-btn">Start</button>
            </div>


        `;
    }

    createClockFace() {
        // Create clock faces for all three timer pages
        const clockFaces = ['work-clock-face', 'shortBreak-clock-face', 'longBreak-clock-face'];
        
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

        // Time mode buttons
        document.getElementById('work-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('work');
        });
        document.getElementById('short-break-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('shortBreak');
        });
        document.getElementById('long-break-mode-btn').addEventListener('click', () => {
            this.switchTimeMode('longBreak');
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
    }

    getSessionDuration() {
        switch (this.currentSession) {
            case 'work': return this.workDuration;
            case 'shortBreak': return this.shortBreakDuration;
            case 'longBreak': return this.longBreakDuration;
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
        if (!this.isRunning || !this.startTime) return;
        
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
        this.updateProgress();
        
        // Stop the timer if it's running
        if (this.isRunning) {
            this.pauseTimer();
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
        } catch (e) {
            console.warn('Audio not supported');
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