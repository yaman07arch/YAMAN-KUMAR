// Local database using localStorage
const DOCTORS_KEY = 'doctors';
const PATIENTS_KEY = 'patients';

// Grab DOM elements
const doctorForm = document.getElementById('doctorForm');
const patientForm = document.getElementById('patientForm');
const tableBody = document.getElementById('tableBody');
const patientTableBody = document.getElementById('patientTableBody');
const successfulTableBody = document.getElementById('successfulTableBody');
const ongoingTableBody = document.getElementById('ongoingTableBody');
const unsuccessfulTableBody = document.getElementById('unsuccessfulTableBody');
const statusMessage = document.getElementById('statusMessage');
const patientStatusMessage = document.getElementById('patientStatusMessage');
const navLinks = Array.from(document.querySelectorAll('.nav__link'));
const pages = Array.from(document.querySelectorAll('.page'));
const doctorCount = document.getElementById('doctorCount');
const patientCount = document.getElementById('patientCount');
const successCount = document.getElementById('successCount');
const outcomeChartCtx = document.getElementById('outcomeChart');

let outcomeChart = null;

function showStatus(message, isError = false, target = statusMessage) {
    target.textContent = message;
    target.style.color = isError ? '#e74c3c' : '#27ae60';
    target.classList.add('visible');

    window.clearTimeout(showStatus._timeout);
    showStatus._timeout = window.setTimeout(() => {
        target.classList.remove('visible');
    }, 2400);
}

function setActivePage(targetId) {
    pages.forEach((page) => {
        const isActive = page.id === targetId;
        page.classList.toggle('active', isActive);
    });

    navLinks.forEach((button) => {
        button.classList.toggle('active', button.dataset.target === targetId);
    });

    if (targetId === 'dashboardPage') {
        refreshDashboard();
    }

    if (targetId === 'patientsPage') {
        refreshPatients();
    }

    if (targetId === 'successfulPage') {
        refreshOutcomePage('successful', successfulTableBody, 'No successful patients yet.');
    }

    if (targetId === 'ongoingPage') {
        refreshOutcomePage('ongoing', ongoingTableBody, 'No ongoing patients yet.');
    }

    if (targetId === 'unsuccessfulPage') {
        refreshOutcomePage('unsuccessful', unsuccessfulTableBody, 'No unsuccessful patients yet.');
    }

    if (targetId === 'addPage') {
        focusFirstInput();
    }
}

function navigateTo(targetId) {
    if (!document.getElementById(targetId)) {
        targetId = 'dashboardPage';
    }

    window.location.hash = `#${targetId}`;
    setActivePage(targetId);
}

navLinks.forEach((btn) => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.target);
    });
});

window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.replace('#', '') || 'dashboardPage';
    setActivePage(targetId);
});

function focusFirstInput() {
    const firstInput = document.querySelector('.page.active input, .page.active select');
    if (firstInput) firstInput.focus();
}

function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function buildChart() {
    const baseline = {
        labels: ['Successful', 'Unsuccessful', 'Ongoing'],
        datasets: [{
            label: 'Outcomes',
            data: [0, 0, 0],
            backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
            borderWidth: 0
        }]
    };

    outcomeChart = new Chart(outcomeChartCtx, {
        type: 'doughnut',
        data: baseline,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}` } }
            }
        }
    });
}

function updateChartsAndStats() {
    const doctors = loadFromStorage(DOCTORS_KEY);
    const patients = loadFromStorage(PATIENTS_KEY);

    doctorCount.textContent = doctors.length;
    patientCount.textContent = patients.length;
    doctorCount.classList.add('pulse');
    patientCount.classList.add('pulse');

    const counts = patients.reduce(
        (acc, p) => {
            acc[p.outcome] = (acc[p.outcome] || 0) + 1;
            return acc;
        },
        { successful: 0, unsuccessful: 0, ongoing: 0 }
    );

    successCount.textContent = counts.successful;
    successCount.classList.add('pulse');

    window.clearTimeout(updateChartsAndStats._pulseTimer);
    updateChartsAndStats._pulseTimer = window.setTimeout(() => {
        doctorCount.classList.remove('pulse');
        patientCount.classList.remove('pulse');
        successCount.classList.remove('pulse');
    }, 550);

    if (!outcomeChart) {
        buildChart();
    }

    outcomeChart.data.datasets[0].data = [counts.successful, counts.unsuccessful, counts.ongoing];
    outcomeChart.update();
}

// Doctors
function refreshDoctors() {
    const doctors = loadFromStorage(DOCTORS_KEY);
    tableBody.innerHTML = '';

    if (doctors.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" style="text-align: center;">No doctors registered yet.</td>';
        tableBody.appendChild(row);
        return;
    }

    doctors.forEach((doctor, index) => {
        const row = document.createElement('tr');
        row.classList.add('enter');
        row.innerHTML = `
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${doctor.contact}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderPatientTable(bodyEl, patients, emptyMessage = 'No patients to show.') {
    bodyEl.innerHTML = '';

    if (patients.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">${emptyMessage}</td>`;
        bodyEl.appendChild(row);
        return;
    }

    patients.forEach((patient) => {
        const row = document.createElement('tr');
        row.classList.add('enter');
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.condition}</td>
            <td>${capitalize(patient.outcome)}</td>
            <td>
                <button class="mini-btn" data-action="toggle" data-index="${patient._idx}">Toggle</button>
                <button class="mini-btn danger" data-action="delete" data-index="${patient._idx}">Delete</button>
            </td>
        `;
        bodyEl.appendChild(row);
    });
}

function refreshPatients() {
    const patients = loadFromStorage(PATIENTS_KEY).map((p, i) => ({ ...p, _idx: i }));
    renderPatientTable(patientTableBody, patients, 'No patients registered yet.');
}

function refreshOutcomePage(outcome, bodyEl, emptyMessage) {
    const patients = loadFromStorage(PATIENTS_KEY)
        .map((p, i) => ({ ...p, _idx: i }))
        .filter((p) => p.outcome === outcome);
    renderPatientTable(bodyEl, patients, emptyMessage);
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function refreshActivePage() {
    const current = window.location.hash.replace('#', '') || 'dashboardPage';
    setActivePage(current);
}

function togglePatientOutcome(index) {
    const patients = loadFromStorage(PATIENTS_KEY);
    if (!patients[index]) return;

    const order = ['ongoing', 'successful', 'unsuccessful'];
    const current = patients[index].outcome;
    const next = order[(order.indexOf(current) + 1) % order.length];
    patients[index].outcome = next;

    saveToStorage(PATIENTS_KEY, patients);
    refreshActivePage();
    updateChartsAndStats();
}

function deletePatient(index) {
    const patients = loadFromStorage(PATIENTS_KEY);
    patients.splice(index, 1);
    saveToStorage(PATIENTS_KEY, patients);
    refreshActivePage();
    updateChartsAndStats();
    showStatus('Patient removed.', false, patientStatusMessage);
}

// Doctor form handling
doctorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('docName').value.trim();
    const specialty = document.getElementById('docSpecialty').value.trim();
    const contact = document.getElementById('docContact').value.trim();

    if (!name || !specialty || !contact) {
        showStatus('Please fill in all fields.', true);
        return;
    }

    const doctors = loadFromStorage(DOCTORS_KEY);
    doctors.push({ name, specialty, contact });
    saveToStorage(DOCTORS_KEY, doctors);

    doctorForm.reset();
    showStatus('Doctor added to local database!');
    refreshDoctors();
    updateChartsAndStats();
    navigateTo('dashboardPage');
});

// Patient form handling
patientForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('patientName').value.trim();
    const age = parseInt(document.getElementById('patientAge').value, 10);
    const condition = document.getElementById('patientCondition').value.trim();
    const outcome = document.getElementById('patientOutcome').value;

    if (!name || !age || !condition) {
        showStatus('Please fill in all fields.', true, patientStatusMessage);
        return;
    }

    const patients = loadFromStorage(PATIENTS_KEY);
    patients.push({ name, age, condition, outcome });
    saveToStorage(PATIENTS_KEY, patients);

    patientForm.reset();
    showStatus('Patient added successfully!', false, patientStatusMessage);
    refreshPatients();
    updateChartsAndStats();
    navigateTo('dashboardPage');
});

function setupOutcomePageForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const outcome = form.dataset.outcome;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.elements.name.value.trim();
        const age = parseInt(form.elements.age.value, 10);
        const condition = form.elements.condition.value.trim();

        if (!name || !age || !condition) {
            showStatus('Please fill in all fields.', true, patientStatusMessage);
            return;
        }

        const patients = loadFromStorage(PATIENTS_KEY);
        patients.push({ name, age, condition, outcome });
        saveToStorage(PATIENTS_KEY, patients);

        form.reset();
        showStatus('Patient added successfully!', false, patientStatusMessage);
        refreshActivePage();
        updateChartsAndStats();
        navigateTo('dashboardPage');
    });
}

setupOutcomePageForm('successfulForm');
setupOutcomePageForm('ongoingForm');
setupOutcomePageForm('unsuccessfulForm');

// Patient table interaction (delegated)
function attachTableHandlers(bodyEl) {
    bodyEl.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const index = Number(button.dataset.index);

        if (action === 'toggle') {
            togglePatientOutcome(index);
            showStatus('Outcome updated.', false, patientStatusMessage);
        }

        if (action === 'delete') {
            deletePatient(index);
        }
    });
}

attachTableHandlers(patientTableBody);
attachTableHandlers(successfulTableBody);
attachTableHandlers(ongoingTableBody);
attachTableHandlers(unsuccessfulTableBody);

function refreshDashboard() {
    refreshDoctors();
    updateChartsAndStats();
}

// Load on start
window.addEventListener('DOMContentLoaded', () => {
    const initial = window.location.hash.replace('#', '') || 'dashboardPage';
    setActivePage(initial);
    refreshDashboard();
});