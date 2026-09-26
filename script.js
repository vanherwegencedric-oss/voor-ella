// ⚙️ HIER pas je jouw eigen planning per dag aan.
// De sleutel is de datum zoals die in de day-card staat (bv. "28 sep").
// Laat leeg ("") als je niets wil tonen voor die dag.
const cedricPlanning = {
    "28 sep": "Les tot 19u maar daarna zolang als je wilt.",
    "29 sep": "Les tot 17u30 maar daarna zolang als je wilt.",
    "30 sep": "Heel de dag vrij.",
    "1 okt": "Heb les tot 14u15 maar heb training om 19u dus kan tussen 14u15 en 17u45.",
    "2 okt": "Heb les tot 16u en moet op wedstrijd zijn om 19u dan kies jij of je mee wilt.",
    "3 okt": "Moet werken tot 12u15 daarna zolang je wilt.",
    "4 okt": "Ben vrij tot 17u want ga daarna naar Oma."
};
// ⚙️ Pas deze aan naar jouw gegevens:
const CEDRIC_INSTAGRAM = "cedric2007_vhw";   // zonder @
// ⚙️ Pas hier jouw persoonlijke boodschap aan.
// Elk item in de array is één paragraaf.
const PERSONAL_MESSAGE = [
    "Hey Ella,",
    "Effe iets persoonlijks. Ik heb je verteld over het meisje dat ineens stopte met mij vlak voor de examens, en eerlijk gezegd heeft me dat toen best veel pijn gedaan.",
    "Maar sinds ik jou ken, is alles eigenlijk een stuk leuker geworden. 💗 Ik merk ook dat ik graag meer bij jou wil zijn en meer tijd met je wil doorbrengen. Natuurlijk weet ik dat je zelf ook druk bent, dus ik wil absoluut niet dat je het gevoel krijgt dat ik te veel van je vraag.",
    "Ik wil je gewoon laten weten dat ik je echt heel erg leuk vind en je graag zie. Ik weet ook een beetje hoe je over jongens en relaties denkt, en daarom wil ik je nergens toe pushen.",
    "Ik wil er gewoon voor je zijn, met je lachen, leuke dingen met je doen en je vooral een goed gevoel geven. 💗",
    "Dus ja... al bij al vind ik je echt heel erg leuk, en ik hoop natuurlijk dat jij dat misschien ook een beetje zo voelt. 💗"
];

const PERSONAL_SIGNATURE = "— Cédric 💗";
let selectedDaysData = [];
let selectedTimesData = {};
let availabilityNotes = {};
let selectedLocationData = {};
let currentLocationDate = "";
let selectedFood = [];
let selectedFoodData = {};
let selectedActivity = "";
let selectedActivitiesData = {};
let customActivity = "";
let selectedExtras = [];
let footballMatch = false;
// ── LocalStorage ──
const STORAGE_KEY = "ella_date_state_v1";
let currentPage = "start";

function saveState() {
    const state = {
        selectedDaysData,
        selectedTimesData,
        availabilityNotes,
        selectedLocationData,
        selectedFoodData,
        selectedActivitiesData,
        selectedActivity,
        customActivity,
        selectedExtras,
        footballMatch,
        skipActivitiesForDay,
        currentLocationDate,
        currentPage
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;

        const s = JSON.parse(raw);

        selectedDaysData = s.selectedDaysData || [];
        selectedTimesData = s.selectedTimesData || {};
        availabilityNotes = s.availabilityNotes || {};
        selectedLocationData = s.selectedLocationData || {};
        selectedFoodData = s.selectedFoodData || {};
        selectedActivitiesData = s.selectedActivitiesData || {};
        selectedActivity = s.selectedActivity || "";
        customActivity = s.customActivity || "";
        selectedExtras = s.selectedExtras || [];
        footballMatch = !!s.footballMatch;
        skipActivitiesForDay = s.skipActivitiesForDay || {};
        currentLocationDate = s.currentLocationDate || "";
        currentPage = s.currentPage || "start";

        return true;
    } catch (e) {
        return false;
    }
}

function clearState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
}

function setCurrentPage(page) {
    currentPage = page;
    saveState();
}

const foodDurations = {
    "Pizza": 60,
    "Pasta": 60,
    "Burger": 60,
    "Kebab": 60,
    "Tacos": 60,
    "Mexicaans": 90,
    "Chinees": 90,
    "Japans": 90,
    "Indisch": 90,
    "Grieks": 90,
    "Spaans": 90,
    "Kleine snacks": 30,
    "Desserts": 30,
    "All you can eat": 120,
    "Maakt mij niet uit": 0,
    "Ik heb geen honger": 0
};

const MAX_FOOD_MINUTES_PER_DAY = 180;
const MIN_ACTIVITY_MINUTES = 30;
let skipActivitiesForDay = {};

const activityDurations = {
    "Pool": 60,
    "Bowlen": 90,
    "Minigolf": 60,
    "Arcade": 60,
    "Sieraden maken": 120,
    "Museum": 90,
    "Stadswandeling": 60,
    "Begijnhof bezoeken": 45,
    "Kruidtuin": 60,
    "Picknick": 90,
    "Zonsondergang": 60,
    "Shoppen": 90,
    "Samen koken/bakken": 120,
    "Snack gaan eten": 30,
    "Film": 120,
    "Gewoon samen zijn/praten": 60,
    "Naar mijn wedstrijd kijken": 120,
    "Dierentuin": 180,
    "Uitstap stad": 180,
    "Pretpark": 240,
    "Andere": 60,
    "Ik weet het niet — kies jij": 60
};
window.addEventListener("load", () => {
    const hasSaved = loadState();
    const shouldResume = hasSaved && currentPage !== "start";

    const delay = shouldResume ? 400 : 2000;

    setTimeout(() => {
        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.opacity = "0";

        setTimeout(() => {
            loadingScreen.style.display = "none";

            if (shouldResume) {
                resumePage();
            }
        }, 500);
    }, delay);
});

function resumePage() {
    const container = document.querySelector(".container");
    container.style.opacity = "1";

    switch (currentPage) {
        case "days":       renderDaysPage(); break;
        case "times":      goToTimes(); break;
        case "locations":  goToLocations(); break;
        case "food":       goToFood(); break;
        case "activities": goToActivities(); break;
        case "personal":   showPersonalMessage(); break;
        case "summary":    showSummaryPage(); break;
    }
}

function renderDaysPage() {
    const container = document.querySelector(".container");

    container.innerHTML = `
        <button class="back-button" onclick="goBackToStart()">
            ← Opnieuw beginnen
        </button>

        <p>Made for Ella 💗</p>
        <h1>Wanneer kan je? 💗</h1>
        <p>Kies alle dagen die voor jou goed uitkomen.</p>

        <div class="date-layout">
            <div class="days-grid">
                ${[
                    ["MA", "28 sep"],
                    ["DI", "29 sep"],
                    ["WO", "30 sep"],
                    ["DO", "1 okt"],
                    ["VR", "2 okt"],
                    ["ZA", "3 okt"],
                    ["ZO", "4 okt"]
                ].map(([d, date]) => `
                    <button class="day-card" onclick="toggleDay(this)">
                        <strong>${d}</strong>
                        <span>${date}</span>
                    </button>
                `).join("")}
            </div>

            <aside class="agenda-panel">
                <h3>📅 Mijn agenda</h3>
                <ul class="agenda-list">
                    ${[
                        ["MA", "28 sep"],
                        ["DI", "29 sep"],
                        ["WO", "30 sep"],
                        ["DO", "1 okt"],
                        ["VR", "2 okt"],
                        ["ZA", "3 okt"],
                        ["ZO", "4 okt"]
                    ].map(([d, date]) => {
                        const note = cedricPlanning[date] || "";
                        const isFree = !note;
                        return `
                            <li class="agenda-item ${isFree ? "agenda-item--free" : ""}">
                                <span class="agenda-day">
                                    <strong>${d}</strong>
                                    <small>${date}</small>
                                </span>
                                <span class="agenda-note">
                                    ${isFree ? "Vrij 🌿" : note}
                                </span>
                            </li>
                        `;
                    }).join("")}
                </ul>
            </aside>
        </div>

        <button id="next-days" onclick="goToTimes()" disabled>
            Verder →
        </button>
    `;

    // Herstel selecties
    document.querySelectorAll(".day-card").forEach(day => {
        const dayName = day.querySelector("strong").textContent;
        const date = day.querySelector("span").textContent;

        const alreadySelected = selectedDaysData.some(selected =>
            selected.day === dayName &&
            selected.date === date
        );

        if (alreadySelected) day.classList.add("selected");
    });

    document.getElementById("next-days").disabled =
        selectedDaysData.length === 0;
}

function sayYes() {
    const container = document.querySelector(".container");
    container.style.opacity = "0";
    createHeartExplosion();

    setTimeout(() => {
        renderDaysPage();
        container.style.opacity = "1";
        setCurrentPage("days");
    }, 2000);
}

function moveNoButton() {
    const noButton = document.getElementById("no");

    const maxX = window.innerWidth - noButton.offsetWidth - 20;
    const maxY = window.innerHeight - noButton.offsetHeight - 20;

    const x = Math.max(20, Math.random() * maxX);
    const y = Math.max(20, Math.random() * maxY);

    noButton.style.position = "fixed";
    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;
}

function createHeart() {
    const heart = document.createElement("div");

    heart.className = "heart";
    heart.textContent = "💗";

    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (15 + Math.random() * 20) + "px";
    heart.style.animationDuration = (4 + Math.random() * 4) + "s";

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 8000);
}

setInterval(createHeart, 500);

function createHeartExplosion() {
    const hearts = ["💗", "💕", "💖", "💞", "💓"];

    for (let i = 0; i < 35; i++) {
        const heart = document.createElement("div");

        heart.textContent =
            hearts[Math.floor(Math.random() * hearts.length)];

        heart.style.position = "fixed";
        heart.style.left = "50%";
        heart.style.top = "50%";
        heart.style.fontSize = `${18 + Math.random() * 25}px`;
        heart.style.pointerEvents = "none";
        heart.style.zIndex = "2000";

        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 250;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        heart.animate(
            [
                {
                    transform: "translate(-50%, -50%) scale(0.3)",
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.2)`,
                    opacity: 0
                }
            ],
            {
                duration: 1600,
                easing: "cubic-bezier(.2,.8,.3,1)"
            }
        );

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1700);
    }
}

function toggleDay(button) {
    button.classList.toggle("selected");

    selectedDaysData = [];

    document.querySelectorAll(".day-card.selected").forEach(day => {
        selectedDaysData.push({
            day: day.querySelector("strong").textContent,
            date: day.querySelector("span").textContent
        });
    });

    const nextButton = document.getElementById("next-days");

    nextButton.disabled = selectedDaysData.length === 0;

     saveState();

}

function goToTimes() {
    let daysHTML = "";

    selectedDaysData.forEach((selectedDay) => {
        const dayName = selectedDay.day;
        const date = selectedDay.date;

        if (!selectedTimesData[date]) {
    selectedTimesData[date] = {
        type: "full",
        from: "10:00",
        to: "22:00"
    };
}

const savedTime = selectedTimesData[date];

const fromTime = savedTime.from;
        const toTime = savedTime.to;
const isCustom = savedTime.type === "custom";

        const fromOptions = [
            "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30",
            "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30",
            "18:00", "18:30", "19:00", "19:30",
            "20:00"
        ];

        const toOptions = [
            "12:00", "12:30", "13:00", "13:30",
            "14:00", "14:30", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30",
            "18:00", "18:30", "19:00", "19:30",
            "20:00", "20:30", "21:00", "21:30",
            "22:00"
        ];

        const fromHTML = fromOptions.map(time =>
            `<option value="${time}" ${time === fromTime ? "selected" : ""}>${time}</option>`
        ).join("");

        const toHTML = toOptions.map(time =>
            `<option value="${time}" ${time === toTime ? "selected" : ""}>${time}</option>`
        ).join("");

        daysHTML += `
            <div class="time-card">

                <div class="time-card-header">
                    <strong>${dayName}</strong>
                    <span>${date}</span>
                </div>

                <button
                    class="full-day-button ${!isCustom ? "selected" : ""}"
                    onclick="selectFullDay(this)">
                    <span>Hele dag</span>
                    <small>10:00 – 22:00 ✓</small>
                </button>

                <button
                    class="custom-time-button ${isCustom ? "selected" : ""}"
                    onclick="showTimeOptions(this)">
                    Tijden aanpassen
                </button>

                <div
                    class="custom-times"
                    style="display: ${isCustom ? "grid" : "none"};">

                    <label>
                        Vanaf
                        <select onchange="saveCustomTime(this)">
                            ${fromHTML}
                        </select>
                    </label>

                    <label>
                        Tot
                        <select onchange="saveCustomTime(this)">
                            ${toHTML}
                        </select>
                    </label>

                </div>

                <textarea
                    class="availability-note"
                    placeholder="Bijv. ik kan vanaf 16:00 tot 21:00..."
                    oninput="saveAvailabilityNote(this)"
                >${availabilityNotes[date] || ""}</textarea>

            </div>
        `;
    });

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goBackToDays()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>

        <h1>Hoe laat kan je? ⏰</h1>

        <p>Je kunt per dag je tijden aanpassen.</p>

        <div class="times-list">
            ${daysHTML}
        </div>

               <button id="next-times" onclick="goToLocations()">
            Verder →
        </button>
    `;

    setCurrentPage("times");
}

function saveCustomTime(select) {
    const card = select.closest(".time-card");

    const date =
        card.querySelector(".time-card-header span").textContent;

    const selects = card.querySelectorAll("select");

    selectedTimesData[date] = {
        type: "custom",
        from: selects[0].value,
        to: selects[1].value
    };

     saveState();
}
function selectFullDay(button) {
    const card = button.closest(".time-card");
    const date =
        card.querySelector(".time-card-header span").textContent;

    selectedTimesData[date] = {
        type: "full",
        from: "10:00",
        to: "22:00"
    };

    button.classList.add("selected");

    card.querySelector(".custom-time-button")
        .classList.remove("selected");

    card.querySelector(".custom-times").style.display = "none";

     saveState();
}

function showTimeOptions(button) {
    const card = button.closest(".time-card");

    const date =
        card.querySelector(".time-card-header span").textContent;

    const selects = card.querySelectorAll("select");

    selectedTimesData[date] = {
        type: "custom",
        from: selects[0].value,
        to: selects[1].value
    };

    button.classList.add("selected");

    const fullDayButton =
        card.querySelector(".full-day-button");

    const customTimes =
        card.querySelector(".custom-times");

    fullDayButton.classList.remove("selected");
    customTimes.style.display = "grid";

     saveState();
}

function goToLocations() {
       selectedDaysData.forEach(day => {
        if (!selectedLocationData[day.date]) {
            selectedLocationData[day.date] = {
                type: "",
                city: "",
                customCity: ""
            };
        }
    });

    if (!currentLocationDate ||
        !selectedDaysData.find(d => d.date === currentLocationDate)) {
        currentLocationDate = selectedDaysData[0]?.date || "";
    }

    const loc = selectedLocationData[currentLocationDate];
    const showCityOptions = loc.type === "Andere stad";

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goBackToTimes()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>
        <h1>Waar zullen we afspreken? 📍</h1>
        <p>Kies per dag. Op weekdagen spreken we automatisch af in Leuven.</p>

        <div class="activity-day-selector">
           ${selectedDaysData.map(day => {
    const loc = selectedLocationData[day.date];
    const filled = loc && loc.type;
    return `
        <button
            class="activity-day-button ${
                day.date === currentLocationDate ? "selected" : ""
            } ${filled ? "location-filled" : "location-empty"}"
            onclick="selectLocationDay('${day.date}')">
            <strong>${day.day}</strong>
            <span>${day.date}</span>
            <small>${filled ? "✓" : "!"}</small>
        </button>
    `;
}).join("")}
        </div>

        <div class="location-options">
            <button class="location-card ${loc.type === "Leuven" ? "selected" : ""}"
                    onclick="selectLocationType('Leuven')">
                <span class="location-icon">🏛️</span>
                <strong>Leuven</strong>
                <small>Gezellig in het centrum</small>
            </button>

            <button class="location-card ${loc.type === "Andere stad" ? "selected" : ""}"
                    onclick="selectLocationType('Andere stad')">
                <span class="location-icon">🌆</span>
                <strong>Andere stad</strong>
                <small>Ik kies zelf een stad</small>
            </button>

            <button class="location-card ${loc.type === "Maakt mij niet uit" ? "selected" : ""}"
                    onclick="selectLocationType('Maakt mij niet uit')">
                <span class="location-icon">💗</span>
                <strong>Maakt mij niet uit</strong>
                <small>Kies jij maar</small>
            </button>
        </div>

        <div id="city-options" style="display: ${showCityOptions ? "block" : "none"};">
            ${showCityOptions ? renderCityOptions() : ""}
        </div>

        <button id="next-location" onclick="goToFood()" disabled>
            Verder →
        </button>
    `;

                refreshLocationState();

    // Event listeners voor de stad-knoppen
    document.querySelectorAll(".city-card").forEach(card => {
        card.addEventListener("click", function() {
            selectCityForDay(this.dataset.city);
        });
    });

    setCurrentPage("locations");
}

function renderCityOptions() {
    const cities = [
        ["🏛️", "Antwerpen"],
        ["🌆", "Brussel"],
        ["🏰", "Gent"],
        ["🌊", "Brugge"],
        ["🏙️", "Mechelen"],
        ["🌳", "Hasselt"],
        ["✨", "Andere stad"]
    ];

    const loc = selectedLocationData[currentLocationDate];
    const selectedCity = loc.city || "";

    return `
        <p style="margin-top: 20px;">Welke stad?</p>

        <div class="activity-grid" id="city-grid">
            ${cities.map(([icon, city]) => `
                <button
                    type="button"
                    class="activity-card city-card ${selectedCity === city ? "selected" : ""}"
                    data-city="${city}">
                    <span>${icon}</span>
                    <strong>${city}</strong>
                </button>
            `).join("")}
        </div>

        ${selectedCity === "Andere stad" ? `
            <textarea
                id="custom-city-input"
                class="availability-note"
                placeholder="Typ een stad..."
                oninput="saveCustomCityForDay(this)"
            >${loc.customCity || ""}</textarea>
        ` : ""}
    `;
}

function selectLocationDay(date) {
    currentLocationDate = date;
    goToLocations();
}

function selectLocationType(type) {
    const loc = selectedLocationData[currentLocationDate];
    loc.type = type;

    if (type !== "Andere stad") {
        loc.city = "";
        loc.customCity = "";
    }

    saveState();
    goToLocations();
}

function selectCityForDay(city) {
    const loc = selectedLocationData[currentLocationDate];
    loc.type = "Andere stad";
    loc.city = city;

    if (city !== "Andere stad") {
        loc.customCity = "";
    }

    saveState();
    goToLocations();
}

function saveCustomCityForDay(textarea) {
    const loc = selectedLocationData[currentLocationDate];
    loc.customCity = textarea.value.trim();
    refreshLocationState();
}

function refreshLocationState() {
    const allFilled = selectedDaysData.every(day => {
        const loc = selectedLocationData[day.date];

        if (!loc || !loc.type) return false;

        if (loc.type === "Leuven" || loc.type === "Maakt mij niet uit") {
            return true;
        }

        if (loc.type === "Andere stad") {
            if (!loc.city) return false;
            if (loc.city === "Andere stad") {
                return !!loc.customCity;
            }
            return true;
        }

        return false;
    });

    const nextButton = document.getElementById("next-location");
    if (nextButton) nextButton.disabled = !allFilled;
}

function goToFood() {
    const foods = [
        ["🍕", "Pizza"],
        ["🍝", "Pasta"],
        ["🍔", "Burger"],
        ["🥙", "Kebab"],
        ["🌮", "Tacos"],
        ["🌯", "Mexicaans"],
        ["🥡", "Chinees"],
        ["🍣", "Japans"],
        ["🍛", "Indisch"],
        ["🥙", "Grieks"],
        ["🥘", "Spaans"],
        ["🍟", "Kleine snacks"],
        ["🍰", "Desserts"],
        ["🍽️", "All you can eat"],
        ["💗", "Maakt mij niet uit"],
        ["🙅‍♀️", "Ik heb geen honger"]
    ];

    const firstDay = selectedDaysData[0];
    const activeDate = firstDay ? firstDay.date : "";

    // Zorg dat elke dag een entry heeft
    selectedDaysData.forEach(day => {
        if (!selectedFoodData[day.date]) {
            selectedFoodData[day.date] = [];
        }
    });

    const foodHTML = foods.map(([icon, name]) => {
        const duration = foodDurations[name] ?? 0;
        return `
            <button
                class="food-card"
                data-food="${name}"
                onclick="toggleFood(this)">
                <span>${icon}</span>
                <strong>${name}</strong>
                <small>${duration > 0 ? `⏱️ ${duration} minuten` : "⏱️ Geen extra tijd"}</small>
            </button>
        `;
    }).join("");

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goToLocations()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>

        <h1>Heb je zin om iets te eten? 🍕</h1>

        <p>Kies per dag. Max 3u eten per dag.</p>

        <div class="activity-day-selector">
            ${selectedDaysData.map(day => `
                <button
                    class="activity-day-button ${
                        day.date === activeDate ? "selected" : ""
                    }"
                    onclick="selectFoodDay('${day.date}', this)">
                    <strong>${day.day}</strong>
                    <span>${day.date}</span>
                </button>
            `).join("")}
        </div>

        <p id="food-time-info"></p>

        <div class="food-grid">
            ${foodHTML}
        </div>

       <button
    id="next-food"
    onclick="goFromFoodToActivities()"
    disabled>
    Verder →
</button>
    `;

     refreshFoodCards(activeDate);

    setCurrentPage("food");
}

function selectFoodDay(date, button) {
    document.querySelectorAll(".activity-day-button")
        .forEach(day => day.classList.remove("selected"));

    button.classList.add("selected");

    refreshFoodCards(date);

    saveState();
}

function getFoodMinutes(date) {
    const foods = selectedFoodData[date] || [];
    return foods.reduce(
        (total, name) => total + (foodDurations[name] || 0),
        0
    );
}

function toggleFood(button) {
    const selectedDayButton =
        document.querySelector(".activity-day-button.selected");

    if (!selectedDayButton) return;

    const date =
        selectedDayButton.querySelector("span").textContent;

    const food =
        button.querySelector("strong").textContent;

    if (!selectedFoodData[date]) {
        selectedFoodData[date] = [];
    }

    const foods = selectedFoodData[date];
    const index = foods.indexOf(food);

    const isSpecial =
        food === "Ik heb geen honger" || food === "Maakt mij niet uit";

    if (index !== -1) {
        foods.splice(index, 1);
    } else if (isSpecial) {
        // Vervangt alle andere keuzes
        selectedFoodData[date] = [food];
    } else {
        // Verwijder speciale keuzes als er écht eten gekozen wordt
        const specialIdx = foods.findIndex(f =>
            f === "Ik heb geen honger" || f === "Maakt mij niet uit"
        );
        if (specialIdx !== -1) foods.splice(specialIdx, 1);

        const usedMinutes = getFoodMinutes(date);
        const duration = foodDurations[food] || 0;
        const availableMinutes = getAvailableMinutes(date);
        const cap = Math.min(MAX_FOOD_MINUTES_PER_DAY, availableMinutes);

        if (usedMinutes + duration > cap) return;

        foods.push(food);
    }

        // Als ze eten aanpast → skip opnieuw laten berekenen
    delete skipActivitiesForDay[date];

    refreshFoodCards(date);

    saveState();
}

function refreshFoodCards(date) {
    const totalAvailableMinutes = getAvailableMinutes(date);
    const cap = Math.min(MAX_FOOD_MINUTES_PER_DAY, totalAvailableMinutes);
    const usedMinutes = getFoodMinutes(date);
    const remainingMinutes = Math.max(0, cap - usedMinutes);

    const timeInfo = document.getElementById("food-time-info");
    if (timeInfo) {
        timeInfo.textContent =
            `Max: ${Math.floor(cap / 60)}u ${cap % 60}min · ` +
            `Gekozen: ${Math.floor(usedMinutes / 60)}u ${usedMinutes % 60}min · ` +
            `Nog over: ${Math.floor(remainingMinutes / 60)}u ${remainingMinutes % 60}min`;
    }

    const selectedFoods = selectedFoodData[date] || [];

    document.querySelectorAll(".food-card").forEach(card => {
        const name = card.querySelector("strong").textContent;
        const duration = foodDurations[name] || 0;
        const isSelected = selectedFoods.includes(name);

        const fits = isSelected || duration <= remainingMinutes;

        card.classList.toggle("selected", isSelected);
        card.classList.toggle("too-long", !fits);
        card.disabled = !fits;
        card.onclick = fits ? () => toggleFood(card) : null;

        const oldWarning = card.querySelector(".time-warning");
        if (oldWarning) oldWarning.remove();

        if (!fits) {
            const warning = document.createElement("small");
            warning.className = "time-warning";
            warning.textContent = "Te weinig tijd";
            card.appendChild(warning);
        }
    });

    // Verder-knop aan als ELKE dag minstens 1 ding heeft
    const allFilled = selectedDaysData.every(day => {
        const foods = selectedFoodData[day.date] || [];
        return foods.length > 0;
    });

    const nextButton = document.getElementById("next-food");
    if (nextButton) {
        nextButton.disabled = !allFilled;
    }
}

function goFromFoodToActivities() {
    const problemDays = selectedDaysData.filter(day => {
        if (skipActivitiesForDay[day.date]) return false;

        const foods = selectedFoodData[day.date] || [];
        const hasRealFood = foods.some(f =>
            f !== "Ik heb geen honger" && f !== "Maakt mij niet uit"
        );
        if (!hasRealFood) return false;

        const avail = getAvailableMinutes(day.date);
        const food = getFoodMinutes(day.date);
        return (avail - food) < MIN_ACTIVITY_MINUTES;
    });

    if (problemDays.length > 0) {
        showFoodOrActivityChoice(problemDays);
        return;
    }

    goToActivities();
}

function showFoodOrActivityChoice(days) {
    const day = days[0];
    const moreDays = days.length - 1;

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goToFood()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>

        <h1>Even kiezen... 🤔</h1>

        <p>
            Op <strong>${day.day} ${day.date}</strong> is er geen tijd meer
            over voor een activiteit na het eten.
            ${moreDays > 0 ? `<br><small>(Nog ${moreDays} dag(en) te gaan)</small>` : ""}
        </p>

        <p>Wat wil je liever doen?</p>

        <div class="location-options">
            <button class="location-card"
                    onclick="chooseFoodOnly('${day.date}')">
                <span class="location-icon">🍽️</span>
                <strong>Alleen eten</strong>
                <small>Dan slaan we de activiteit over</small>
            </button>

            <button class="location-card"
                    onclick="chooseActivityInstead()">
                <span class="location-icon">🎳</span>
                <strong>Liever iets doen</strong>
                <small>Pas dan het eten aan</small>
            </button>
        </div>
    `;
}

function chooseFoodOnly(date) {
    skipActivitiesForDay[date] = true;
    goFromFoodToActivities();
}

function chooseActivityInstead() {
    alert(
        "Ga terug naar het eten en kies 'Ik heb geen honger' of 'Maakt mij niet uit' of kies 1 optie minder. " +
        "Dan is er tijd voor een activiteit. 💗"
    );
    goToFood();
}

function getAvailableMinutes(date) {
    const time = selectedTimesData[date];

    if (!time) {
        return 0;
    }

    const [fromHour, fromMinute] = time.from.split(":").map(Number);
    const [toHour, toMinute] = time.to.split(":").map(Number);

    const from = fromHour * 60 + fromMinute;
    const to = toHour * 60 + toMinute;

    return Math.max(0, to - from);
}

function goToActivities() {
        const activities = [
        ["🎱", "Pool"],
        ["🎳", "Bowlen"],
        ["⛳", "Minigolf"],
        ["🕹️", "Arcade"],
        ["💎", "Sieraden maken"],
        ["🏛️", "Museum"],
        ["🚶", "Stadswandeling"],
        ["🏘️", "Begijnhof bezoeken"],
        ["🌿", "Kruidtuin"],
        ["🧺", "Picknick"],
        ["🌅", "Zonsondergang"],
        ["🛍️", "Shoppen"],
        ["🧁", "Samen koken/bakken"],
        ["🍟", "Snack gaan eten"],
        ["🎬", "Film"],
        ["💬", "Gewoon samen zijn/praten"],
        ["🦁", "Dierentuin"],
        ["🏙️", "Uitstap stad"],
        ["🎢", "Pretpark"],
        ["✨", "Andere"],
        ["🎲", "Ik weet het niet — kies jij"]
    ];

    const hasFriday = selectedDaysData.some(
        day => day.date === "2 okt"
    );

    if (hasFriday) {
        activities.splice(
            activities.length - 2,
            0,
            ["⚽", "Naar mijn wedstrijd kijken"]
        );
    }

    const firstActive = selectedDaysData.find(d => !skipActivitiesForDay[d.date]);
const activeDate = firstActive
    ? firstActive.date
    : (selectedDaysData[0] ? selectedDaysData[0].date : "");

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goToFood()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>
        <h1>Wat zullen we doen? 🎀</h1>
        <p>Kies eerst een dag. Je mag meerdere activiteiten kiezen.</p>

        <div class="activity-day-selector">
            ${selectedDaysData.map(day => `
    <button
        class="activity-day-button ${
            day.date === activeDate ? "selected" : ""
        }"
        onclick="selectActivityDay('${day.date}', this)">
        <strong>${day.day}</strong>
        <span>${day.date}</span>
        ${skipActivitiesForDay[day.date] ? "<small>🍽️</small>" : ""}
    </button>
`).join("")}
        </div>

        <p id="activity-time-info"></p>

        <div class="activity-grid">
            ${activities.map(([icon, name]) => `
                <button
                    class="activity-card"
                    data-activity="${name}"
                    onclick="selectActivity(this)">
                    <span>${icon}</span>
                    <strong>${name}</strong>
                    <small>${activityDurations[name] || 60} min</small>
                </button>
            `).join("")}
        </div>

        <button
            id="next-activity"
            onclick="goToNextStep()"
            disabled>
            Verder →
        </button>
    `;

       refreshActivityCards(activeDate);

    setCurrentPage("activities");
}

function selectActivityDay(date, button) {
    document.querySelectorAll(".activity-day-button")
        .forEach(day => day.classList.remove("selected"));

    button.classList.add("selected");

    selectedActivity =
        (selectedActivitiesData[date] || [])[0] || "";

    refreshActivityCards(date);

    saveState();
}


function selectActivity(button) {
    const selectedDayButton =
        document.querySelector(".activity-day-button.selected");

    if (!selectedDayButton) {
        return;
    }

    const date =
        selectedDayButton.querySelector("span").textContent;

    const activity =
        button.querySelector("strong").textContent;

    if (!selectedActivitiesData[date]) {
        selectedActivitiesData[date] = [];
    }

    const activities = selectedActivitiesData[date];
    const index = activities.indexOf(activity);

    if (index !== -1) {
        // Verwijder de activiteit
        activities.splice(index, 1);
        } else {
        // Controleer eerst of de activiteit nog past
        const usedMinutes = activities.reduce(
            (total, name) =>
                total + (activityDurations[name] || 60),
            0
        );

        const foodMinutes = getFoodMinutes(date);

        const remainingMinutes =
            getAvailableMinutes(date) - foodMinutes - usedMinutes;

        const duration = activityDurations[activity] || 60;

        if (duration > remainingMinutes) {
            return;
        }

        activities.push(activity);
    }

    selectedActivity =
        activities.length > 0 ? activities[0] : "";

    refreshActivityCards(date);
}

function refreshActivityCards(date) {
    const isSkipped = skipActivitiesForDay[date] === true;

    const timeInfo = document.getElementById("activity-time-info");
    const nextButton = document.getElementById("next-activity");

    // ── Dag is overgeslagen (alleen eten) ──
    if (isSkipped) {
        if (timeInfo) {
            timeInfo.textContent =
                "🍽️ Deze dag doen we alleen eten — geen activiteit.";
        }

        document.querySelectorAll(".activity-card").forEach(card => {
            card.classList.remove("selected");
            card.classList.add("too-long");
            card.disabled = true;
            card.onclick = null;

            const oldWarning = card.querySelector(".time-warning");
            if (oldWarning) oldWarning.remove();
        });

        if (nextButton) {
            nextButton.disabled = !allDaysHaveActivityOrSkip();
        }
        return;
    }

    // ── Normale dag ──
    const totalAvailableMinutes = getAvailableMinutes(date);
    const foodMinutes = getFoodMinutes(date);
    const availableMinutes = Math.max(0, totalAvailableMinutes - foodMinutes);

    const selectedActivities = selectedActivitiesData[date] || [];
    const usedMinutes = selectedActivities.reduce(
        (total, name) => total + (activityDurations[name] || 60),
        0
    );
    const remainingMinutes = Math.max(0, availableMinutes - usedMinutes);

    if (timeInfo) {
        timeInfo.textContent =
            `Totale tijd: ${Math.floor(totalAvailableMinutes / 60)}u ${totalAvailableMinutes % 60}min · ` +
            `Eten: ${foodMinutes} min · ` +
            `Activiteiten: ${Math.floor(usedMinutes / 60)}u ${usedMinutes % 60}min · ` +
            `Nog over: ${Math.floor(remainingMinutes / 60)}u ${remainingMinutes % 60}min`;
    }

        const loc = selectedLocationData[date] || { type: "Leuven" };
    const isOtherCity = loc.type === "Andere stad";
    const hiddenNames = isOtherCity
        ? ["Kruidtuin", "Begijnhof bezoeken"]
        : [];

    document.querySelectorAll(".activity-card").forEach(card => {
        const name = card.querySelector("strong").textContent;

        // Verberg kaarten die niet passen bij "Andere stad"
        if (hiddenNames.includes(name)) {
            card.style.display = "none";

            // Als ze al geselecteerd waren → uit selectie halen
            const acts = selectedActivitiesData[date] || [];
            const idx = acts.indexOf(name);
            if (idx !== -1) acts.splice(idx, 1);

            return;
        }

        card.style.display = "";

        const duration = activityDurations[name] || 60;
        const isSelected = selectedActivities.includes(name);
        const fits = isSelected || duration <= remainingMinutes;

        card.classList.toggle("selected", isSelected);
        card.classList.toggle("too-long", !fits);
        card.disabled = !fits;
        card.onclick = fits ? () => selectActivity(card) : null;

        const oldWarning = card.querySelector(".time-warning");
        if (oldWarning) oldWarning.remove();

        if (!fits) {
            const warning = document.createElement("small");
            warning.className = "time-warning";
            warning.textContent = "Te weinig tijd";
            card.appendChild(warning);
        }
    });

    if (nextButton) {
        nextButton.disabled = !allDaysHaveActivityOrSkip();
    }
}

function allDaysHaveActivityOrSkip() {
    return selectedDaysData.every(day => {
        if (skipActivitiesForDay[day.date]) return true;
        const acts = selectedActivitiesData[day.date] || [];
        return acts.length > 0;
    });
}

function goToNextStep() {
    // → persoonlijke boodschap → samenvatting
    showPersonalMessage();
}

function showPersonalMessage() {
    const paragraphsHTML = PERSONAL_MESSAGE
        .map(p => `<p>${p}</p>`)
        .join("");

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goToActivities()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>

        <h1>Even iets persoonlijk... 💌</h1>

        <div class="personal-message">
            ${paragraphsHTML}
            <p class="signature">${PERSONAL_SIGNATURE}</p>
        </div>

               <button id="to-summary" onclick="showSummaryPage()">
            Bekijk jouw keuzes →
        </button>
    `;

    setCurrentPage("personal");
}

function showSummaryPage() {
    const daysHTML = selectedDaysData.map(day => {
        const time = selectedTimesData[day.date];
        const timeText = time.type === "full"
            ? "Hele dag (10:00 – 22:00)"
            : `${time.from} – ${time.to}`;

        const foods = selectedFoodData[day.date] || [];
        const foodText = foods.length > 0 ? foods.join(", ") : "—";

        const isSkipped = skipActivitiesForDay[day.date];
        const acts = selectedActivitiesData[day.date] || [];
        const actsText = isSkipped
            ? "🍽️ Alleen eten"
            : (acts.length > 0 ? acts.join(", ") : "—");

        const note = availabilityNotes[day.date] || "";
const loc = selectedLocationData[day.date] || { type: "Leuven" };
const locText = getLocationText(loc);

return `
    <div class="time-card">
        <div class="time-card-header">
            <strong>${day.day} ${day.date}</strong>
        </div>
        <p style="margin: 8px 0; font-size: 0.95rem;">
            <strong>📍 Locatie:</strong> ${locText}
        </p>
        <p style="margin: 8px 0; font-size: 0.95rem;">
            <strong>⏰ Tijd:</strong> ${timeText}
        </p>
        <p style="margin: 8px 0; font-size: 0.95rem;">
            <strong>🍽️ Eten:</strong> ${foodText}
        </p>
        <p style="margin: 8px 0; font-size: 0.95rem;">
            <strong>🎀 Doen:</strong> ${actsText}
        </p>
        ${note ? `
            <p style="margin: 8px 0; font-size: 0.85rem; opacity: 0.8; font-style: italic;">
                📝 "${note}"
            </p>
        ` : ""}
    </div>
`;
    }).join("");

    document.querySelector(".container").innerHTML = `
        <button class="back-button" onclick="goToActivities()">
            ← Terug
        </button>

        <p>Made for Ella 💗</p>

        <h1>Jouw keuzes ✨</h1>

                <div class="times-list">
            ${daysHTML}
        </div>

                       <button id="confirm-date" onclick="sendToCedric()">
            📸 Verstuur naar Cédric via Instagram
        </button>

        <div class="paste-info">
            <p><strong>💡 Wat gebeurt er als je klikt?</strong></p>
            <p style="margin: 8px 0;">Je bericht wordt automatisch <strong>gekopieerd</strong>. Daarna opent Instagram. Daar moet je het nog even <strong>plakken</strong>.</p>
            <p style="margin: 8px 0;"><strong>Zo doe je het:</strong></p>
            <p style="margin: 4px 0 4px 15px; font-size: 0.9rem;">
                1️⃣ Instagram opent<br>
                2️⃣ Ga naar de chat met Cédric<br>
                3️⃣ <strong>Tik in het tekstvak</strong><br>
                4️⃣ <strong>Houd je vinger ingedrukt</strong><br>
                5️⃣ Kies <strong>"Plakken"</strong><br>
                6️⃣ Verzenden 💗
            </p>
        </div>
    `;

    setCurrentPage("summary");
}

let lastSummaryMessage = "";

function buildSummaryMessage() {
    let msg = "Hey Cédric! 💗 Hier zijn mijn keuzes:\n\n";

    selectedDaysData.forEach(day => {
        msg += `📅 ${day.day} ${day.date}\n`;

        const loc = selectedLocationData[day.date] || { type: "Leuven" };
        msg += `   📍 ${getLocationText(loc)}\n`;

        const time = selectedTimesData[day.date];
        const timeText = time.type === "full"
            ? "Hele dag (10:00 – 22:00)"
            : `${time.from} – ${time.to}`;
        msg += `   ⏰ ${timeText}\n`;

        const foods = selectedFoodData[day.date] || [];
        msg += `   🍽️ ${foods.join(", ") || "—"}\n`;

        const isSkipped = skipActivitiesForDay[day.date];
        const acts = selectedActivitiesData[day.date] || [];
        const actsText = isSkipped
            ? "Alleen eten"
            : (acts.join(", ") || "—");
        msg += `   🎀 ${actsText}\n`;

        const note = availabilityNotes[day.date] || "";
        if (note) msg += `   📝 "${note}"\n`;

        msg += "\n";
    });

    msg += "Tot dan! 🥰";
    return msg;
}

function sendToCedric() {
    lastSummaryMessage = buildSummaryMessage();

    // Robuust kopiëren
    copyToClipboard(lastSummaryMessage);

    // Toon bevestigingspagina
    showConfirmationPage();
}

function copyToClipboard(text) {
    // Eerst moderne API proberen
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    try {
        document.execCommand("copy");
    } catch (e) {
        // Laatste redmiddel: prompt
        prompt("Kopieer handmatig:", text);
    }

    document.body.removeChild(textarea);
}

function showConfirmationPage() {
    launchConfetti();
    createHeartExplosion();

    document.querySelector(".container").innerHTML = `
        <div class="confirmation-heart">💗</div>

        <p>Made for Ella 💗</p>

        <h1>Klaar! 🥰</h1>

                     <p>
            Je bericht is <strong>gekopieerd</strong>! 📋<br>
            Klik hieronder om verder te gaan.
        </p>

        <div class="paste-info">
            <p><strong>📸 Op Instagram:</strong></p>
            <p style="margin-left: 15px; font-size: 0.9rem;">
                1️⃣ Je komt op Cédric zijn <strong>profiel</strong><br>
                2️⃣ Klik op de knop <strong>"Message"</strong><br>
                3️⃣ <strong>Tik in het tekstvak</strong><br>
                4️⃣ <strong>Houd vast</strong> → kies <strong>"Plakken"</strong><br>
                5️⃣ Verzenden 💗
            </p>
        </div>

        <div class="share-buttons">

            <button id="send-cedric" onclick="openCedricInstagram()">
                📸 Open Instagram van Cédric
            </button>

            <button id="copy-message" onclick="copySummaryAgain()">
                📋 Kopieer bericht (opnieuw)
            </button>

            <button id="share-whatsapp" onclick="shareWhatsApp()">
                💬 Liever via WhatsApp
            </button>

        </div>

        <button id="close-page" onclick="resetAll()">
            ↺ Opnieuw beginnen
        </button>
    `;
}


function openCedricInstagram() {
    copyToClipboard(lastSummaryMessage);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const url = `https://www.instagram.com/${CEDRIC_INSTAGRAM}/`;

    if (isMobile) {
        window.location.href = `instagram://user?username=${CEDRIC_INSTAGRAM}`;
        setTimeout(() => {
            window.location.href = url;
        }, 1200);
    } else {
        // PC: gebruik location.href ipv window.open (geen popup-blocker)
        window.location.href = url;
    }
}

function shareWhatsApp() {
    const msg = encodeURIComponent(lastSummaryMessage);
    window.location.href = `https://wa.me/?text=${msg}`;
}

function shareInstagram() {
    copyToClipboard(lastSummaryMessage);

    setTimeout(() => {
        alert("📋 Bericht gekopieerd!\n\nOpen Instagram en plak het in de chat waar je het wil delen.");
    }, 200);
}

function copySummaryAgain() {
    copyToClipboard(lastSummaryMessage);

    setTimeout(() => {
        alert("📋 Bericht gekopieerd! (" + lastSummaryMessage.length + " tekens)");
    }, 200);
}

function launchConfetti() {
    const items = ["💗", "💕", "💖", "💞", "💓", "✨", "🎉", "🌸"];
    const count = 60;

    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.textContent = items[Math.floor(Math.random() * items.length)];

        el.style.position = "fixed";
        el.style.left = (Math.random() * 100) + "vw";
        el.style.top = "-40px";
        el.style.fontSize = (16 + Math.random() * 22) + "px";
        el.style.pointerEvents = "none";
        el.style.zIndex = "3000";
        el.style.willChange = "transform, opacity";

        document.body.appendChild(el);

        const duration = 2500 + Math.random() * 2000;
        const drift = (Math.random() - 0.5) * 200;
        const rotate = (Math.random() - 0.5) * 720;

        el.animate(
            [
                { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
                { transform: `translate(${drift}px, 110vh) rotate(${rotate}deg)`, opacity: 0 }
            ],
            {
                duration: duration,
                easing: "cubic-bezier(.25,.7,.4,1)"
            }
        );

        setTimeout(() => el.remove(), duration + 100);
    }
}

function resetAll() {
    clearState();
    window.location.reload();
}

function getLocationText(loc) {
    if (loc.type === "Andere stad") {
        const city = loc.city === "Andere stad"
            ? loc.customCity
            : loc.city;
        return `Uitstap naar ${city || "?"}`;
    }
    return loc.type;
}

function goBackToStart() {
    const ok = confirm(
        "Wil je helemaal opnieuw beginnen? Alle keuzes worden gewist. 💗"
    );
    if (!ok) return;

    clearState();
    window.location.reload();
}

function goBackToDays() {
    sayYes();
}

function goBackToTimes() {
    goToTimes();
}

function saveAvailabilityNote(textarea) {
    const card = textarea.closest(".time-card");

    const date =
        card.querySelector(".time-card-header span").textContent;

    availabilityNotes[date] = textarea.value;

    saveState();
}
