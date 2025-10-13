import React from 'react';

const worldClockHtml = `
<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital & World Clock</title>
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    
    <!-- ========================= CSS Styles ========================= -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #333;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        /* Top Navigation */
        .top-nav {
            background-color: #2c3e50;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .top-nav a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
        }
        .settings-icon i {
            font-size: 1.2em;
            cursor: pointer;
        }

        /* Main Container */
        .main-container {
            display: flex;
            flex-grow: 1;
        }

        /* Sidebar */
        .sidebar {
            width: 220px;
            background-color: #34495e;
            padding: 20px 0;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }
        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .sidebar li {
            padding: 15px 20px;
            color: #ecf0f1;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.3s;
        }
        .sidebar li i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        .sidebar li:hover, .sidebar li.active {
            background-color: #2c3e50;
        }

        /* Content Area */
        .content {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Changed to align-start for better grid layout */
            padding: 40px;
            overflow-y: auto;
        }
        .view {
            display: none;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
        }
        .view.active {
            display: flex;
        }

        /* Main Clock Card */
        .time-card {
            background-color: #ffffff;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }

        /* Digital Clock View */
        .digital-time {
            font-size: 5em;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .date {
            font-size: 1.5em;
            color: #555;
            margin-bottom: 40px;
        }
        .set-alarm-btn {
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 1.2em;
            font-weight: bold;
            border-radius: 50px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
        }
        .set-alarm-btn:hover {
            background-color: #229954;
            transform: translateY(-3px);
        }

        /* Alarm View */
        .alarm-form {
            margin-bottom: 20px;
        }
        .alarm-form input {
            padding: 10px;
            font-size: 1em;
            margin-right: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
        .alarm-form button {
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            border-radius: 5px;
            border: 1px solid #27ae60;
            background-color: #27ae60;
            color: white;
        }
        #alarm-list {
            list-style: none;
            padding: 0;
            width: 300px;
        }
        #alarm-list li {
            background: #e0e0e0;
            padding: 10px;
            margin-top: 5px;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
        }

        /* Stopwatch View */
        .stopwatch-display {
            font-size: 4em;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .stopwatch-controls button {
            padding: 10px 20px;
            font-size: 1em;
            margin: 0 5px;
            cursor: pointer;
            border-radius: 5px;
            border: 1px solid #3498db;
            background-color: #3498db;
            color: white;
        }
        
        /* World Clock View */
        .world-clock-grid {
            display: grid;
            /* Updated for a 3-column layout */
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            width: 100%;
            max-width: 1400px; /* Increased max-width for more space */
        }
        .world-digital-clock {
            background-color: #fff;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .world-digital-clock:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .world-digital-clock h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #2c3e50;
            font-size: 1.3em; /* Slightly smaller font for more cities */
        }
        .world-digital-clock .digital-time {
            font-size: 2.2em; /* Slightly smaller font for more cities */
            margin-bottom: 5px;
        }
        .world-digital-clock .date {
            font-size: 0.9em;
            margin-bottom: 0;
        }

        /* Footer Ad */
        .ad-footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }
        .ad-footer img {
            height: 40px;
        }

        /* Alarm Notification */
        .alarm-notification {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #e74c3c;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 2000;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: slideDown 0.5s ease-out;
        }
        .alarm-notification button {
            background-color: #c0392b;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 0.8em;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 20px;
            transition: background-color 0.3s;
        }
        .alarm-notification button:hover {
            background-color: #a93226;
        }
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
    </style>
</head>
<body>

    <!-- Alarm Sound Element -->
    <audio id="alarm-sound" src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" loop></audio>

    <!-- Alarm Notification Bar -->
    <div id="alarm-notification" class="alarm-notification">
        <span>Alarm! It's <span id="ringing-alarm-time"></span></span>
        <button id="stop-alarm-notification-btn">Stop Alarm</button>
    </div>

    <header class="top-nav">
        <div class="nav-items">
            <a href="#">Holidays</a>
            <a href="#">Tools</a>
        </div>
        <div class="settings-icon">
            <i class="fas fa-cog"></i>
        </div>
    </header>

    <div class="main-container">
        <nav class="sidebar">
            <ul>
                <li class="nav-item active" data-view="time-view"><i class="fas fa-clock"></i> Time</li>
                <li class="nav-item" data-view="alarm-view"><i class="fas fa-bell"></i> Alarm Clock</li>
                <li class="nav-item" data-view="stopwatch-view"><i class="fas fa-stopwatch"></i> Stopwatch</li>
                <li class="nav-item" data-view="world-clock-view"><i class="fas fa-globe-americas"></i> World Clock</li>
            </ul>
        </nav>

        <main class="content">
            <!-- Digital Time View -->
            <section id="time-view" class="view active">
                <div class="time-card">
                    <div class="digital-time" id="main-digital-time">3:12:44 PM</div>
                    <div class="date" id="main-date">THU - JAN 16, 2025</div>
                    <button class="set-alarm-btn" id="open-alarm-btn">Set Alarm</button>
                </div>
            </section>

            <!-- Alarm View -->
            <section id="alarm-view" class="view">
                <h2>Set an Alarm</h2>
                <div class="alarm-form">
                    <input type="time" id="alarm-time">
                    <button id="set-alarm-btn">Set Alarm</button>
                </div>
                <ul id="alarm-list"></ul>
            </section>

            <!-- Stopwatch View -->
            <section id="stopwatch-view" class="view">
                <h2>Stopwatch</h2>
                <div class="stopwatch-display" id="stopwatch-display">00:00:00</div>
                <div class="stopwatch-controls">
                    <button id="start-stopwatch">Start</button>
                    <button id="stop-stopwatch">Stop</button>
                    <button id="reset-stopwatch">Reset</button>
                </div>
            </section>

            <!-- World Clock View -->
            <section id="world-clock-view" class="view">
                <h2>World Clocks</h2>
                <div class="world-clock-grid" id="world-clock-grid">
                    <!-- Clocks will be generated by JavaScript -->
                </div>
            </section>
        </main>
    </div>

    <footer class="ad-footer">
        <img src="https://via.placeholder.com/150x50.png?text=Mazda+Logo" alt="Mazda Logo">
        <p>THE BEAUTIFULLY CAPABLE MAZDA CX-50</p>
    </footer>

    <!-- ========================= JavaScript Logic ========================= -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {

            // --- DATA FOR WORLD CLOCKS (Updated to 20 cities) ---
            const cities = [
                { name: 'لوس أنجلوس', nameEn: 'Los Angeles', timezone: 'America/Los_Angeles' },
                { name: 'نيويورك', nameEn: 'New York', timezone: 'America/New_York' },
                { name: 'مكسيكو سيتي', nameEn: 'Mexico City', timezone: 'America/Mexico_City' },
                { name: 'ريو دي جانيرو', nameEn: 'Rio de Janeiro', timezone: 'America/Sao_Paulo' },
                { name: 'لندن', nameEn: 'London', timezone: 'Europe/London' },
                { name: 'باريس', nameEn: 'Paris', timezone: 'Europe/Paris' },
                { name: 'موسكو', nameEn: 'Moscow', timezone: 'Europe/Moscow' },
                { name: 'القاهرة', nameEn: 'Cairo', timezone: 'Africa/Cairo' },
                { name: 'كيب تاون', nameEn: 'Cape Town', timezone: 'Africa/Johannesburg' },
                { name: 'إسطنبول', nameEn: 'Istanbul', timezone: 'Europe/Istanbul' },
                { name: 'دبي', nameEn: 'Dubai', timezone: 'Asia/Dubai' },
                { name: 'مومباي', nameEn: 'Mumbai', timezone: 'Asia/Kolkata' },
                { name: 'بانكوك', nameEn: 'Bangkok', timezone: 'Asia/Bangkok' },
                { name: 'سنغافورة', nameEn: 'Singapore', timezone: 'Asia/Singapore' },
                { name: 'بكين', nameEn: 'Beijing', timezone: 'Asia/Shanghai' },
                { name: 'طوكيو', nameEn: 'Tokyo', timezone: 'Asia/Tokyo' },
                { name: 'سيدني', nameEn: 'Sydney', timezone: 'Australia/Sydney' },
                { name: 'بيرث', nameEn: 'Perth', timezone: 'Australia/Perth' },
                { name: 'أوكلاند', nameEn: 'Auckland', timezone: 'Pacific/Auckland' },
                { name: 'ريكيافيك', nameEn: 'Reykjavik', timezone: 'Atlantic/Reykjavik' },
            ];

            // --- CLOCK FUNCTIONALITY ---
            const updateClock = (clockId, date) => {
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

                // Update Digital Clock
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                const digitalTimeEl = document.getElementById(\`\${clockId}-digital-time\`);
                if (digitalTimeEl) {
                    digitalTimeEl.textContent = 
                        \`\${String(displayHours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')} \${ampm}\`;
                }

                // Update Date
                const dateEl = document.getElementById(\`\${clockId}-date\`);
                if (dateEl) {
                    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                    dateEl.textContent = date.toLocaleDateString('en-US', options).toUpperCase();
                }
            };
            
            // --- WORLD CLOCK RENDER & UPDATE ---
            const renderWorldClocks = () => {
                const grid = document.getElementById('world-clock-grid');
                grid.innerHTML = ''; // Clear previous clocks

                cities.forEach((city, index) => {
                    const clockId = \`world-clock-\${index}\`;
                    const clockItem = document.createElement('div');
                    clockItem.className = 'world-digital-clock';
                    clockItem.innerHTML = \`
                        <h3>\${city.name} (\${city.nameEn})</h3>
                        <div class="digital-time" id="\${clockId}-digital-time"></div>
                        <div class="date" id="\${clockId}-date"></div>
                    \`;
                    grid.appendChild(clockItem);
                });
            };

            const updateAllClocks = () => {
                // Update main clock
                updateClock('main', new Date());

                // Update world clocks if the view is active
                if (document.getElementById('world-clock-view').classList.contains('active')) {
                    const now = new Date();
                    cities.forEach((city, index) => {
                        const clockId = \`world-clock-\${index}\`;
                        
                        const timeOptions = { timeZone: city.timezone, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
                        const dateOptions = { timeZone: city.timezone, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                        
                        const timeString = now.toLocaleTimeString('en-US', timeOptions);
                        const dateString = now.toLocaleDateString('en-US', dateOptions).toUpperCase();

                        const digitalTimeEl = document.getElementById(\`\${clockId}-digital-time\`);
                        const dateEl = document.getElementById(\`\${clockId}-date\`);
                        
                        if (digitalTimeEl) digitalTimeEl.textContent = timeString;
                        if (dateEl) dateEl.textContent = dateString;
                    });
                }
            };
            
            setInterval(updateAllClocks, 1000);
            updateAllClocks(); // Initial call
            renderWorldClocks(); // Initial render for world clocks

            // --- NAVIGATION ---
            const navItems = document.querySelectorAll('.nav-item');
            const views = document.querySelectorAll('.view');

            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const targetViewId = item.dataset.view;

                    navItems.forEach(nav => nav.classList.remove('active'));
                    views.forEach(view => view.classList.remove('active'));

                    item.classList.add('active');
                    document.getElementById(targetViewId).classList.add('active');
                });
            });

            // --- ALARM FUNCTIONALITY ---
            const alarmSound = document.getElementById('alarm-sound');
            const alarmNotification = document.getElementById('alarm-notification');
            const ringingAlarmTimeEl = document.getElementById('ringing-alarm-time');
            const stopAlarmBtn = document.getElementById('stop-alarm-notification-btn');

            const openAlarmBtn = document.getElementById('open-alarm-btn');
            const alarmViewNav = document.querySelector('[data-view="alarm-view"]');
            
            openAlarmBtn.addEventListener('click', () => {
                alarmViewNav.click();
            });

            const setAlarmBtn = document.getElementById('set-alarm-btn');
            const alarmTimeInput = document.getElementById('alarm-time');
            const alarmList = document.getElementById('alarm-list');
            let alarms = [];

            setAlarmBtn.addEventListener('click', () => {
                const alarmTime = alarmTimeInput.value;
                if (alarmTime) {
                    alarms.push(alarmTime);
                    renderAlarms();
                    alarmTimeInput.value = '';
                }
            });

            const renderAlarms = () => {
                alarmList.innerHTML = '';
                alarms.forEach((alarm, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = \`
                        <span>\${alarm}</span>
                        <button data-index="\${index}" class="delete-alarm">Delete</button>
                    \`;
                    alarmList.appendChild(li);
                });
            };
            
            alarmList.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-alarm')) {
                    alarms.splice(e.target.dataset.index, 1);
                    renderAlarms();
                }
            });

            // Check for alarms every second
            setInterval(() => {
                const now = new Date();
                const currentTime = \`\${String(now.getHours()).padStart(2, '0')}:\${String(now.getMinutes()).padStart(2, '0')}\`;
                
                if (alarms.includes(currentTime)) {
                    const ringingAlarm = alarms.find(alarm => alarm === currentTime);
                    
                    ringingAlarmTimeEl.textContent = ringingAlarm;
                    alarmNotification.style.display = 'block';
                    alarmSound.play();

                    alarms = alarms.filter(alarm => alarm !== currentTime);
                    renderAlarms();
                }
            }, 1000);

            // Stop alarm button functionality
            stopAlarmBtn.addEventListener('click', () => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                alarmNotification.style.display = 'none';
            });


            // --- STOPWATCH FUNCTIONALITY ---
            const stopwatchDisplay = document.getElementById('stopwatch-display');
            const startBtn = document.getElementById('start-stopwatch');
            const stopBtn = document.getElementById('stop-stopwatch');
            const resetBtn = document.getElementById('reset-stopwatch');

            let stopwatchInterval;
            let stopwatchTime = 0;

            const formatTime = (time) => {
                const date = new Date(time);
                const minutes = date.getUTCMinutes();
                const seconds = date.getUTCSeconds();
                const milliseconds = date.getUTCMilliseconds();
                return \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}:\${String(Math.floor(milliseconds / 10)).padStart(2, '0')}\`;
            };

            startBtn.addEventListener('click', () => {
                if (!stopwatchInterval) {
                    const startTime = Date.now() - stopwatchTime;
                    stopwatchInterval = setInterval(() => {
                        stopwatchTime = Date.now() - startTime;
                        stopwatchDisplay.textContent = formatTime(stopwatchTime);
                    }, 10);
                }
            });

            stopBtn.addEventListener('click', () => {
                clearInterval(stopwatchInterval);
                stopwatchInterval = null;
            });

            resetBtn.addEventListener('click', () => {
                clearInterval(stopwatchInterval);
                stopwatchInterval = null;
                stopwatchTime = 0;
                stopwatchDisplay.textContent = '00:00:00';
            });
        });
    </script>
</body>
</html>
`;

const WorldClockTool: React.FC = () => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">ساعات العالم</h2>
            <p className="text-brand-light mb-6">اعرض الوقت الحالي في مدن مختلفة حول العالم.</p>
            <iframe
                srcDoc={worldClockHtml}
                title="World Clock"
                className="w-full h-full flex-grow border-0 rounded-lg bg-white"
                style={{ minHeight: '80vh' }}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
};

export default WorldClockTool;
