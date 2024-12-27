document.querySelector('.form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    // console.log(username)

    try {
        const response = await fetch('/Auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        console.log(result);
        if (response.ok) {
            alert(result.message);

            let userRole = result.userRole;
            if (userRole) {
                if (userRole === 'admin') {
                    window.location.href = '/home';
                }
                else if (userRole === 'branch') {
                    window.location.href = '/home';
                }
                else {
                    window.location.href = '/home';
                }
            }
        } else {
            alert(result.message);
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
