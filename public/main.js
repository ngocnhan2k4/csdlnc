document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.querySelector('.nav'); // Thẻ <nav> chứa các liên kết
    const logoutButton = document.getElementById("logoutButton");

    // Gọi API checkAuth để lấy userRole
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

                // Tạo navigation dựa trên userRole
                const navData = {
                    admin: [
                        { text: 'Home', href: '/home' },
                        { text: 'Revenue', href: '/company/revenue' },
                        { text: 'Dish Revenue', href: '/company/revenue/dish' },
                        { text: 'Manage Dish', href: '/company' },
                        { text: 'Manage Order', href: '/company/order' },
                        { text: 'Manage Employee', href: '/company/employee' }
                    ],
                    branch: [
                        { text: 'Home', href: '/home' },
                        { text: 'Manage Employee', href: '/company/employee' }
                    ],
                    default: [
                        { text: 'Home', href: '/home' },
                        { text: 'Special Offers', href: '/' },
                        { text: 'Restaurants', href: '/' },
                        { text: 'Track Order', href: '/' }
                    ]
                };

                const roleLinks = navData[userRole] || navData.default;

                // Làm sạch nội dung <nav>
                navContainer.innerHTML = '';

                // Tạo liên kết động
                roleLinks.forEach(linkData => {
                    const link = document.createElement('a');
                    link.textContent = linkData.text;
                    link.href = linkData.href;
                    link.classList.add('nav-link');
                    navContainer.appendChild(link);
                });

                // Cập nhật trạng thái active
                const savedActiveLink = localStorage.getItem('activeLink') || '/home';
                console.log(savedActiveLink);
                updateActiveLink(navContainer.querySelectorAll('.nav-link'), savedActiveLink);
            } else {
                // Nếu chưa đăng nhập, ẩn nút Logout
                logoutButton.style.display = "none";

                // Thiết lập liên kết mặc định khi chưa đăng nhập
                const defaultLinks = [
                    { text: 'Home', href: '/home' },
                    { text: 'Special Offers', href: '/' },
                    { text: 'Restaurants', href: '/' },
                    { text: 'Track Order', href: '/' }
                ];

                navContainer.innerHTML = ''; // Làm sạch nội dung <nav>

                // Tạo liên kết động cho trạng thái chưa đăng nhập
                defaultLinks.forEach(linkData => {
                    const link = document.createElement('a');
                    link.textContent = linkData.text;
                    link.href = linkData.href;
                    link.classList.add('nav-link');
                    navContainer.appendChild(link);
                });

                // Thiết lập trạng thái active ban đầu là "/home"
                updateActiveLink(navContainer.querySelectorAll('.nav-link'), '/home');
            }
        })
        .catch(error => {
            console.error("Error checking authentication:", error);
            logoutButton.style.display = "none"; // Ẩn nút nếu xảy ra lỗi
        });

    // Lắng nghe sự kiện click trên navigation
    navContainer.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('nav-link')) {
            event.preventDefault();

            // Lưu link được bấm vào localStorage
            const href = target.getAttribute('href');
            localStorage.setItem('activeLink', href);

            // Chuyển hướng tới link
            window.location.href = href;
        }
    });

    // Khi tải lại trang, thiết lập trạng thái active từ localStorage
    const savedActiveLink = localStorage.getItem('activeLink') || '/home';
    updateActiveLink(navContainer.querySelectorAll('.nav-link'), savedActiveLink);
});

// Hàm cập nhật trạng thái 'active'
function updateActiveLink(navLinks, savedPath = '/home') {
    navLinks.forEach(link => {
        // Xóa lớp 'active' khỏi tất cả các liên kết
        link.classList.remove('active');

        // Thêm lớp 'active' nếu đường dẫn khớp
        if (link.getAttribute('href') === savedPath) {
            link.classList.add('active');
        }
    });
}
