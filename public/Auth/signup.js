// Lắng nghe sự kiện input trên các trường first-name và last-name
document.getElementById('first-name').addEventListener('input', updateUsername);
document.getElementById('last-name').addEventListener('input', updateUsername);

// Hàm để tạo username và hiển thị
function updateUsername() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();

    // Tạo username từ firstName và lastName
    const username = `${firstName} ${lastName}`;

    // Cập nhật giá trị của input username và hiển thị dưới dạng text
    document.getElementById('username').value = username;
}

document.querySelector('.form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn chặn trang reload khi submit

    // Lấy giá trị của các trường trong form
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const cid = document.getElementById('cid').value.trim();

    // Kiểm tra xem tất cả các trường có được điền đầy đủ không
    if (!firstName || !lastName || !gender || !email || !username  || !password || !cid) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    // Gửi yêu cầu POST đến server
    try {
        const response = await fetch('/Auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, gender, username, password, cid , email}), // Dữ liệu được gửi dưới dạng JSON
        });

        const result = await response.json();
        
        // Xử lý kết quả trả về từ server
        if (response.ok) {
            alert(result.message); // Thông báo thành công
            // Redirect hoặc xử lý thành công ở đây (Ví dụ: chuyển đến trang đăng nhập)
            window.location.href = '/auth/signin';
        } else {
            alert(result.message); // Thông báo lỗi nếu có
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Không thể kết nối đến server!');
    }
});

// Toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    if (passwordField.type === 'password') {
        passwordField.type = 'text'; // Hiển thị số điện thoại
        eyeIcon.src = '/images/showPassword.jpg'; // Đổi icon thành "mắt mở"
    } else {
        passwordField.type = 'password'; // Ẩn số điện thoại
        eyeIcon.src = '/images/hidePassword.jpg'; // Đổi icon thành "mắt đóng"
    }
}