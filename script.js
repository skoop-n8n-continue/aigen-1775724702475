document.addEventListener('DOMContentLoaded', () => {
    const eventContent = document.getElementById('event-content');
    const dateReadout = document.getElementById('current-date-readout');

    let events = [];
    let currentIndex = 0;
    const CYCLE_INTERVAL = 15000; // 15 seconds per event

    async function init() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        updateDateReadout(now);
        await fetchEvents(month, day);

        if (events.length > 0) {
            displayNextEvent();
            setInterval(displayNextEvent, CYCLE_INTERVAL);
        } else {
            eventContent.innerHTML = '<div class="event-description">Searching for temporal anomalies... (No events found)</div>';
        }
    }

    function updateDateReadout(date) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        dateReadout.querySelector('.month').textContent = months[date.getMonth()];
        dateReadout.querySelector('.day').textContent = date.getDate().toString().padStart(2, '0');
        dateReadout.querySelector('.year').textContent = date.getFullYear();
    }

    async function fetchEvents(month, day) {
        try {
            // Wikipedia API for events on this day
            // Using cache: 'no-store' as per requirements for live data
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`, {
                cache: 'no-store'
            });

            if (!response.ok) throw new Error('Temporal link failed');

            const data = await response.json();
            events = data.selected || [];

            // Shuffle events for variety
            events = events.sort(() => Math.random() - 0.5);

            // Backup to localStorage for offline support
            localStorage.setItem('last_time_machine_events', JSON.stringify({
                timestamp: Date.now(),
                events: events,
                month: month,
                day: day
            }));

        } catch (error) {
            console.error('Time flux error:', error);

            // Try to load from fallback
            const fallback = localStorage.getItem('last_time_machine_events');
            if (fallback) {
                const parsed = JSON.parse(fallback);
                // Only use if same day
                if (parsed.month === month && parsed.day === day) {
                    events = parsed.events;
                }
            }
        }
    }

    function displayNextEvent() {
        if (events.length === 0) return;

        const event = events[currentIndex];

        // Out transition
        eventContent.classList.remove('active');

        setTimeout(() => {
            // Update content
            eventContent.innerHTML = `
                <div class="event-year">${event.year}</div>
                <div class="event-description">${event.text}</div>
            `;

            // In transition
            eventContent.classList.add('active');

            currentIndex = (currentIndex + 1) % events.length;
        }, 1000);
    }

    init();
});
