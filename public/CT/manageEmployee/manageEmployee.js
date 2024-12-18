document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử cần thiết
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const pageInput = document.getElementById('pageInput');
    const totalPagesElement = document.getElementById('totalPages');
    const tableBody = document.querySelector('.employee-table tbody');
    const branchSelect = document.getElementById('branch-select'); // Lấy phần tử chọn chi nhánh
    const searchInput = document.querySelector('.search-input'); // Lấy phần tử tìm kiếm
    const searchBtn = document.getElementById('search-btn'); // Nút tìm kiếm
    const addEmployeeBtn = document.querySelector('.add-employee-btn'); // Nút mở modal
    const modal = document.getElementById('add-employee-modal'); // Modal popup
    const cancelBtn = document.querySelector('.cancel-btn'); // Nút hủy trong modal
    const form = document.getElementById('add-employee-form'); // Form trong modal
    const saveBtn = document.getElementById('save-employee-btn'); // Nút lưu trong modal

    let maxPage = 1; // Khởi tạo biến maxPage, bạn có thể lấy giá trị này từ dữ liệu trả về từ API

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

    // Gọi API thêm nhân viên
    async function addEmployee(data) {
        try {
            console.log("create")
            console.log(data)
            const response = await fetch('/company/employee/created', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add employee');
            }

            const result = await response.json();
            alert('Employee added successfully!');
            modal.style.display = "none";
            form.reset();
            fetchData(rowsPerPageSelect.value, pageInput.value, branchSelect.value, searchInput.value.trim());
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add employee: ' + error.message);
        }
    }

    // Xử lý sự kiện khi nhấn nút "Save"
    saveBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const employeeData = {
            HoTen: form.querySelector('#full-name').value.trim(),
            NgaySinh: form.querySelector('#birth-date').value,
            GioiTinh: form.querySelector('#gender').value,
            SoNha: form.querySelector('#house-number').value.trim(),
            Duong: form.querySelector('#street').value.trim(),
            Quan: form.querySelector('#district').value.trim(),
            ThanhPho: form.querySelector('#city').value.trim(),
            SoDienThoai: form.querySelector('#phone').value.trim(),
            NgayVaoLam: form.querySelector('#start-date').value,
            NgayNghiViec: form.querySelector('#end-date').value || null,
            MaChiNhanh: form.querySelector('#branch-code').value,
            BoPhanLamViec: form.querySelector('#work-department').value,
        };

        if (!employeeData.HoTen || !employeeData.SoDienThoai || !employeeData.NgaySinh || !employeeData.NgayVaoLam) {
            alert('Please fill in all required fields.');
            return;
        }

        addEmployee(employeeData);
    });

    // Hàm gọi API với rowsPerPage, page, branch và search
    async function fetchData(rowsPerPage, page, branch, search) {
        try {
            const response = await fetch(`/company/employee/getAllEmployee?rowsPerPage=${rowsPerPage}&page=${page}&branch=${branch}&search=${search}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cập nhật nội dung bảng với dữ liệu mới
            tableBody.innerHTML = data.employees.map((employee, index) => `
                <tr>
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

            addEditEventListeners(); // Thêm sự kiện cho nút Edit

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Lắng nghe sự kiện nhấn nút "Search"
    searchBtn.addEventListener("click", function () {
        const branch = branchSelect.value; // Lấy giá trị của branch
        const search = searchInput.value.trim(); // Lấy giá trị của search và loại bỏ khoảng trắng thừa

        // Gọi hàm fetchData khi nút search được nhấn
        fetchData(rowsPerPageSelect.value, pageInput.value, branch, search);
    });

    // Lắng nghe sự thay đổi của Rows Per Page và Page
    rowsPerPageSelect.addEventListener("change", function () {
        fetchData(rowsPerPageSelect.value, pageInput.value, branchSelect.value, searchInput.value.trim());
    });

    pageInput.addEventListener('input', function () {
        let page = parseInt(this.value);

        // Nếu người dùng nhập giá trị không hợp lệ (NaN hoặc ngoài phạm vi), sửa lại
        if (isNaN(page) || page < 1) {
            page = 1; // Nếu nhỏ hơn 1, set thành 1
        } else if (page > maxPage) {
            page = maxPage; // Nếu lớn hơn maxPage, set thành maxPage
        }

        this.value = page; // Cập nhật giá trị của input để phản ánh page hợp lệ

        fetchData(rowsPerPageSelect.value, page, branchSelect.value, searchInput.value.trim());
    });

    // Lần đầu tiên gọi API khi trang tải
    // fetchData(rowsPerPageSelect.value, pageInput.value, branchSelect.value, searchInput.value.trim());
});
