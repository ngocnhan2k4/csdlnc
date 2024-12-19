// Lấy tất cả các liên kết trong navigation
const navLinks = document.querySelectorAll('.nav-link');

// Lấy đường dẫn hiện tại
const currentPath = window.location.pathname;

// Kiểm tra và thêm lớp 'active' dựa trên URL
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});

// Lặp qua từng liên kết và thêm sự kiện click
navLinks.forEach(link => {
    link.addEventListener('click', function () {
        // Xóa lớp 'active' khỏi tất cả các liên kết
        navLinks.forEach(nav => nav.classList.remove('active'));

        // Thêm lớp 'active' cho liên kết được nhấn
        this.classList.add('active');
    });
});
