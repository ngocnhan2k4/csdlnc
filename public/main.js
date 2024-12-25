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

document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");

    // Gọi API checkAuth
    axios.get('/auth/checkAuth')
        .then(response => {
            const { code, userRole } = response.data;

            if (code === 1) {
                // Nếu đã đăng nhập, hiển thị nút Logout
                logoutButton.style.display = "inline-flex";

                // Thêm sự kiện click cho nút Logout
                logoutButton.addEventListener("click", () => {
                    axios.post('/auth/logout')
                        .then(() => {
                            window.location.href = "/auth/signin"; // Chuyển hướng sau khi logout
                        })
                        .catch(error => {
                            console.error("Error during logout:", error);
                        });
                });
            } else {
                // Nếu chưa đăng nhập, ẩn nút Logout
                logoutButton.style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error checking authentication:", error);
            logoutButton.style.display = "none"; // Ẩn nút nếu xảy ra lỗi
        });
});
