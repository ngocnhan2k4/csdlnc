document.getElementById("addDishForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn form reload trang

    const formData = {
        TenMonAn: document.getElementById("TenMonAn").value,
        Muc: document.getElementById("Muc").value,
        MoTa: document.getElementById("MoTa").value,
        HinhAnh: document.getElementById("HinhAnh").value,
        GiaHienTai: document.getElementById("GiaHienTai").value,
    };

    console.log('Dữ liệu gửi đi:',formData);
    try {
        // Gửi dữ liệu bằng Fetch API
        const response = await fetch("/company/dish/createdish", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
            alert("Món ăn đã được thêm thành công!");
            document.getElementById("addDishForm").reset();
        } else {
            alert("Lỗi khi thêm món ăn!");
            console.error("Error:", result);
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resultMessage").innerText = "Đã xảy ra lỗi!";
    }
});



document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form (reload trang)
    
    const tuKhoa = document.getElementById("TuKhoa").value;
    console.log('Từ khóa: ', tuKhoa);
    
    // Gửi yêu cầu tìm kiếm đến server
    fetch(`/company/dish/searchdish?TuKhoa=${encodeURIComponent(tuKhoa)}`, {  // Sử dụng GET và thêm tham số vào URL
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())  // Parse kết quả trả về từ server
    .then(data => {

        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = ''; 

        if (data.length === 0) {
            resultsList.innerHTML = '<li>No dishes found</li>';
        } else {
            data.forEach(dish => {
                const listItem = document.createElement('li');
                listItem.textContent = `${dish.TenMonAn} - ${dish.Muc} - ${dish.GiaHienTai}`;
                resultsList.appendChild(listItem);
            });
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    });
});

// Xóa kết quả tìm kiếm khi click ra ngoài màn hình
document.addEventListener('click', function(event) {
    const searchForm = document.getElementById("searchForm");
    const deleteForm = document.getElementById("deleteForm");
    const resultsList = document.getElementById("searchResults");
    const inputField = document.getElementById("TuKhoa");  // Lấy ô input từ khóa tìm kiếm
    const deleteField = document.getElementById("MaMonAn");  // Lấy ô input từ khóa tìm kiếm

    // Kiểm tra nếu click ra ngoài form tìm kiếm và danh sách kết quả
    if (!searchForm.contains(event.target) && !resultsList.contains(event.target)) {
        resultsList.innerHTML = '';  // Xóa kết quả tìm kiếm
        inputField.value = '';  // Xóa nội dung ô input
    }
    if( !deleteForm.contains(event.target)){
        deleteField.value='';
    }
});


document.getElementById("deleteForm").addEventListener("submit", function(event) {
    event.preventDefault();  // Ngăn chặn hành vi mặc định của form (reload trang)

    const maMonAn = document.getElementById("MaMonAn").value;
    console.log('Mã món ăn cần xóa:', maMonAn);

    // Gửi yêu cầu xóa món ăn đến server
    fetch('/company/dish/deletedish', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ MaMonAn: maMonAn })  // Truyền mã món ăn trong body
    })
    .then(response => response.json())  // Parse kết quả trả về từ server
    .then(data => {
        if (data.message) {
            alert(data.message);  // Hiển thị thông báo từ server (ví dụ: "Xóa món ăn thành công")
        } else {
            alert('Xóa món ăn thành công!');
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    });
});


document.getElementById("updateDishForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn form reload trang

    const formData = {
        MaMonAn: document.getElementById("a").value,
        TenMon: document.getElementById("b").value,
        Muc: document.getElementById("c").value,
        MoTa: document.getElementById("d").value,
        HinhAnh: document.getElementById("e").value,
        GiaHienTai: document.getElementById("f").value,
    };

try {
    // Gửi yêu cầu PUT để cập nhật món ăn
    const response = await fetch('/company/dish/updatedish', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
        alert("Cập nhật món ăn thành công.");
    } else {
        alert("Đã xảy ra lỗi khi cập nhật món ăn.");
        console.error("Error:", result);
    }
} catch (error) {
    console.error("Error:", error);
    document.getElementById("updateResult").innerText = "Đã xảy ra lỗi!";
}
});


