// Employee Management Page Scripts

function toggleRoom(roomClass) {
  const rows = document.querySelectorAll('.' + roomClass);
  rows.forEach(row => row.classList.toggle('hidden'));

  const icon = document.getElementById('icon-' + roomClass);
  if (icon) {
    icon.classList.toggle('rotate-180');
  }
}

function closeEditModal() {
  const editModal = document.getElementById('editModal');
  if (editModal) {
    editModal.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const editModal = document.getElementById('editModal');

  document.querySelectorAll('.btn-edit-employee').forEach(btn => {
    btn.addEventListener('click', function () {
      const email = this.getAttribute('data-email');
      const fullname = this.getAttribute('data-fullname');
      const phone = this.getAttribute('data-phone');
      const room = this.getAttribute('data-room');
      const position = this.getAttribute('data-position');
      const role = this.getAttribute('data-role');

      document.getElementById('edit_email').value = email;
      document.getElementById('edit_full_name').value = fullname;
      document.getElementById('edit_password').value = '';
      document.getElementById('edit_phone').value = phone;
      document.getElementById('edit_room').value = room;
      document.getElementById('edit_position').value = position;

      const roleSelect = document.getElementById('edit_role');
      if (role == '2') {
        roleSelect.value = '2';
      } else {
        roleSelect.value = '1';
      }

      if (editModal) editModal.classList.remove('hidden');
    });
  });

  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = new URLSearchParams(formData).toString();

      try {
        const response = await fetch('/employ/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: data
        });

        if (response.ok) {
          window.location.reload();
        } else {
          const errorText = await response.text();
          alert('Cập nhật thất bại: ' + errorText);
        }
      } catch (error) {
        alert('Lỗi kết nối: ' + error.message);
      }
    });
  }

  // tsParticles Configuration
  const particlesConfig = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { value: 300, density: { enable: true, value_area: 800 } },
      color: { value: "#29348f" },
      shape: { type: "circle" },
      opacity: { value: 0.6, random: true },
      size: { value: 2, random: true },
      move: {
        enable: true,
        speed: 1.5,
        direction: "right",
        random: true,
        straight: false,
        outModes: { default: "out" }
      }
    },
    detectRetina: true
  };

  document.querySelectorAll('.particles-container').forEach(container => {
    if (window.tsParticles) {
      tsParticles.load(container.id, particlesConfig);
    }
  });

  // Table hover header highlight
  const table = document.querySelector('table');
  if (table) {
    const ths = table.querySelectorAll('thead th');

    table.addEventListener('mouseover', (e) => {
      const td = e.target.closest('td');
      if (!td || td.hasAttribute('colspan')) return;

      const tr = td.closest('tr');
      if (!tr) return;
      
      const index = Array.from(tr.children).indexOf(td);

      ths.forEach(th => th.classList.remove('text-orange-600'));

      if (index >= 0 && index < ths.length) {
        ths[index].classList.add('text-orange-600');
      }
    });

    table.addEventListener('mouseout', (e) => {
      ths.forEach(th => th.classList.remove('text-orange-600'));
    });
  }
});
