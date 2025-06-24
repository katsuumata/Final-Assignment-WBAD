const mobilData = [
    { id: 'avanza', nama: 'Toyota Avanza', price: 500000, img: './assets/avanza.png' },
    { id: 'innova', nama: 'Toyota Kijang Innova', price: 700000, img: './assets/innova.png' },
    { id: 'hrv', nama: 'Honda HRV', price: 600000, img: './assets/hrv.png' },
    { id: 'sigra', nama: 'Daihatsu Sigra', price: 450000, img: './assets/sigra.png' }
];

let booking = null;

const formatCurrency = n => 'Rp ' + n.toLocaleString('id-ID');

const displayMobil = () => {
    const mobilContainer = document.querySelector('.mobil-container');
    mobilContainer.innerHTML = '';
    mobilData.forEach(car => {
        mobilContainer.innerHTML += `
            <div class="mobil-card">
                <img class="mobil-img" src="${car.img}" alt="${car.nama}">
                <h3 class="mobil-nama">${car.nama}</h3>
                <h4 class="mobil-price">${formatCurrency(car.price)} / Hari</h4>
                <div class="mobil-check">
                    <input type="checkbox" id="car-${car.id}">
                    <label for="car-${car.id}">Pilih Mobil Ini</label>
                </div>
                <div class="mobil-date">
                    <input type="date" id="date-${car.id}">
                    <input type="number" id="duration-${car.id}" placeholder="Durasi (min 1)" min="1">
                </div>
            </div>
        `;
    });
};

const calculateTotal = () => {
    const customerNameInput = document.getElementById('nama-pelanggan');
    const customerName = customerNameInput.value.trim();
    if (!customerName) {
        alert("Nama Pelanggan harus diisi");
        return;
    }

    let grandTotal = 0;
    const selectedCars = [];
    let validationError = false;

    mobilData.forEach(car => {
        const checkbox = document.getElementById(`car-${car.id}`);
        if (checkbox.checked) {
            const startDate = document.getElementById(`date-${car.id}`).value;
            const duration = parseInt(document.getElementById(`duration-${car.id}`).value, 10);

            if (!startDate || !duration || duration < 1) {
                alert(`Harap isi tanggal dan durasi yang valid untuk ${car.nama}`);
                validationError = true;
                return;
            }

            const subTotal = car.price * duration;
            grandTotal += subTotal;
            selectedCars.push({ ...car, startDate, duration, subTotal });
        }
    });

    if (validationError) return;
    if (selectedCars.length === 0) {
        alert("Anda belum memilih mobil.");
        return;
    }

    booking = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('id-ID'),
        customerName,
        cars: selectedCars,
        grandTotal
    };

    displaySummary(booking);
    document.querySelector('.btn2').disabled = false;
    document.querySelector('.summary').style.display = 'block';
};

const displaySummary = (data) => {
    const summaryContainer = document.querySelector('.summary-container');
    const carListHTML = data.cars.map(car => `
        <li>
            <span>${car.nama} (${car.duration} hari)</span>
            <span>${formatCurrency(car.subTotal)}</span>
        </li>
    `).join('');

    summaryContainer.innerHTML = `
        <div class="summary-card">
            <p><strong>Nama Pelanggan:</strong> ${data.customerName}</p>
            <p><strong>Waktu Pesan:</strong> ${data.timestamp}</p>
            <hr>
            <ul>${carListHTML}</ul>
            <div class="summary-total">
                <span>TOTAL</span>
                <span>${formatCurrency(data.grandTotal)}</span>
            </div>
        </div>
    `;
};

const saveBooking = () => {
    if (!booking) {
        alert("Hitung total dulu sebelum menyimpan.");
        return;
    }
    const savedBookings = JSON.parse(localStorage.getItem('carBookings')) || [];
    savedBookings.push(booking);
    localStorage.setItem('carBookings', JSON.stringify(savedBookings));
    alert("Pemesanan berhasil disimpan!");
    resetForm();
    displaySavedBookings();
};

const resetForm = () => {
    document.getElementById('nama-pelanggan').value = '';
    document.querySelectorAll('.mobil-container input').forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });
    document.querySelector('.btn2').disabled = true;
    document.querySelector('.summary').style.display = 'none';
    booking = null;
};

const displaySavedBookings = () => {
    const savedContainer = document.querySelector('.saved-container');
    const bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
    savedContainer.innerHTML = '';

    if (bookings.length === 0) {
        savedContainer.innerHTML = '<p>Belum ada riwayat pemesanan.</p>';
        return;
    }

    bookings.reverse().forEach(b => {
        const detailHTML = b.cars.map(car =>
            `<li><span>- ${car.nama} (${car.duration} hari)</span> <span>${formatCurrency(car.subTotal)}</span></li>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'saved-card';
        card.innerHTML = `
            <p><strong>Nama:</strong> ${b.customerName}</p>
            <p><small>Waktu: ${b.timestamp}</small></p>
            <ul>${detailHTML}</ul>
            <div class="saved-total">
                <span>Total Bayar</span>
                <span>${formatCurrency(b.grandTotal)}</span>
            </div>
            <button class="btn-delete" data-id="${b.id}">Hapus</button>
        `;
        savedContainer.appendChild(card);
    });
};

const deleteBooking = (id) => {
    const bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
    const updated = bookings.filter(b => b.id !== id);
    localStorage.setItem('carBookings', JSON.stringify(updated));
    displaySavedBookings();
};

document.addEventListener('DOMContentLoaded', () => {
    displayMobil();
    displaySavedBookings();
    document.querySelector('.btn').addEventListener('click', calculateTotal);
    document.querySelector('.btn2').addEventListener('click', saveBooking);
    document.querySelector('.saved-container').addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete')) {
            const id = parseInt(e.target.dataset.id);
            if (confirm("Hapus pemesanan ini?")) deleteBooking(id);
        }
    });
});
