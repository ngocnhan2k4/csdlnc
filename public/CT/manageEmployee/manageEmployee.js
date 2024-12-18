document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử cần thiết
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const pageInput = document.getElementById('pageInput');
    const totalPagesElement = document.getElementById('totalPages');
    const tableBody = document.querySelector('.employee-table tbody');

    const addEmployeeBtn = document.querySelector('.add-employee-btn'); // Nút mở modal
    const modal = document.getElementById('add-employee-modal'); // Modal popup
    const cancelBtn = document.querySelector('.cancel-btn'); // Nút hủy trong modal
    const form = document.getElementById('add-employee-form'); // Form trong modal

    let maxPage = 1; // Khởi tạo biến maxPage, bạn có thể lấy giá trị này từ dữ liệu trả về từ API (sẽ cập nhật sau)

    // Kiểm tra nếu các phần tử tồn tại
    if (!addEmployeeBtn || !modal || !cancelBtn || !form || !tableBody) {
        console.error("Some elements are missing. Check your HTML structure.");
        return;
    }

    // Đảm bảo modal bắt đầu ở trạng thái ẩn khi tải trang
    modal.style.display = "none"; // Ẩn modal khi trang tải xong

    // Hiển thị modal khi nhấn nút "Add employee"
    addEmployeeBtn.addEventListener("click", function () {
        form.reset();
        modal.style.display = "flex"; // Hiển thị modal khi nhấn nút "Add employee"
    });

    function addEditEventListeners() {
        const editBtns = document.querySelectorAll('.edit-btn'); // Tìm lại các nút Edit sau khi bảng được cập nhật

        editBtns.forEach(button => {
            button.addEventListener('click', function () {
                modal.style.display = "flex"; // Hiển thị modal khi nhấn nút Edit
            });
        });
    }

    // Đóng modal khi nhấn nút "Cancel"
    cancelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        modal.style.display = "none"; // Ẩn modal khi nhấn nút "Cancel"
    });

    // Đóng modal khi click ra ngoài phần nội dung của modal
    modal.addEventListener("click", function (event) {
        if (event.target === modal) { // Nếu click vào nền tối
            modal.style.display = "none"; // Ẩn modal khi click ra ngoài
        }
    });

    // Hàm gọi API với rowsPerPage và page
    async function fetchData(rowsPerPage, page) {
        try {
            const response = await fetch(`/company/employee/getAllEmployee?rowsPerPage=${rowsPerPage}&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cập nhật nội dung bảng với dữ liệu mới
            tableBody.innerHTML = data.employees.map((employee, index) => `
                <tr>
                    <td><input type="checkbox" class="row-checkbox" data-id="${employee.id}"></td>
                    <td>${index + 1}</td> <!-- Bắt đầu từ 1 -->
                    <td>${employee.MaNhanVien}</td>
                    <td>${employee.HoTen}</td>
                    <td>${employee.TenBoPhan}</td>
                    <td>${employee.NgayVaoLam}</td>
                    <td>${employee.NgayNghiViec}</td>
                    <td><button class="edit-btn">Edit</button></td>
                </tr>
            `).join('');

            // Cập nhật số trang tổng cộng và maxPage
            maxPage = data.totalPages; // Cập nhật maxPage từ API
            totalPagesElement.textContent = maxPage;

            addEditEventListeners();

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Lắng nghe sự thay đổi của rowsPerPage
    rowsPerPageSelect.addEventListener('change', function () {
        const rowsPerPage = this.value;
        const page = pageInput.value || 1; // Đảm bảo page bắt đầu từ 1
        fetchData(rowsPerPage, page);
    });

    // Lắng nghe sự thay đổi của page
    pageInput.addEventListener('input', function () {
        let page = parseInt(this.value);

        // Nếu người dùng nhập giá trị không hợp lệ (NaN hoặc ngoài phạm vi), sửa lại
        if (isNaN(page) || page < 1) {
            page = 1; // Nếu nhỏ hơn 1, set thành 1
        } else if (page > maxPage) {
            page = maxPage; // Nếu lớn hơn maxPage, set thành maxPage
        }

        this.value = page; // Cập nhật giá trị của input để phản ánh page hợp lệ

        const rowsPerPage = rowsPerPageSelect.value;
        fetchData(rowsPerPage, page);
    });

    // Gọi fetchData lần đầu với giá trị mặc định
    fetchData(rowsPerPageSelect.value, pageInput.value);
});
