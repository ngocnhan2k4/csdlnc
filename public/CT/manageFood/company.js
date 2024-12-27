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


// Khai báo biến toàn cục để lưu dữ liệu
let orderData = {};
let branchID = 0;
let type ="";

// Lắng nghe sự kiện submit
document.getElementById('view-order').addEventListener('submit', function (event) {
    event.preventDefault(); 

    const branchCode = document.getElementById('branch').value;
    branchID = branchCode;

    
    const url = `/company/order/branch/${encodeURIComponent(branchCode)}?page=1&limit=20`;

   
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Giả sử API trả về JSON
        })
        .then(data => {
            // Lưu dữ liệu vào đối tượng orderData
            orderData = data;
            // Hiển thị dữ liệu hoặc thực hiện các thao tác
            renderOrders(orderData.orders); // Hiển thị danh sách orders
            minOfmax(orderData.min, orderData.max, orderData.totalOrders, orderData.currentPage, orderData.totalPage,data.branchCode);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});


// Hàm để render dữ liệu lên HTML
function renderOrders(data) {
    const resultsContainer = document.getElementById('order-results');
    resultsContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

    if (Array.isArray(data) && data.length > 0) {
        data.forEach((order, index) => {
            const orderElement = document.createElement('div');
            orderElement.classList.add('order-item');

            // Tạo nội dung HTML cho từng đơn hàng
            orderElement.innerHTML = `
                <div class="order">
                <div class="header-col-1">${index + 1}</div>
                <div class="header-col-2">${order.MaHoaDon}</div>
                <div class="header-col-3">${new Date(order.NgayLap).toLocaleDateString()}</div>
                <div class="header-col-5">${order.TongTien}</div>
                <div class="header-col-6">${order.HoTen}</div>
                <div class="header-col-7">
                    <a href="/company/order/evaluation/${order.MaHoaDon}">
                    <button class="btn-view">View</button></a></div>
                </div>
                <hr />
            `;

            resultsContainer.appendChild(orderElement); // Chèn nội dung vào container
        });
    } else {
        resultsContainer.innerHTML = '<p>Không có dữ liệu đơn hàng.</p>';
    }
}


function minOfmax(min, max, total, currentPage, totalPage, branchCode) {
    const resultsContainer = document.getElementById('minOfmax');
    resultsContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

    const orderElement = document.createElement('div');
    orderElement.classList.add('order-current');

    // Tạo nội dung HTML
    orderElement.innerHTML = `
        <div class="of">
            <div>${min} - ${max}</div> 
            <div> of </div> 
            <div>${total}</div>
        </div>
        
        <div class="pagination">
            <a
                data-url="/company/order/branch/${encodeURIComponent(branchCode)}?page=${currentPage - 1}&limit=20"
                id="prev-btn"
                class="prev-btn"
            >&#60;</a>
            <span class="pagination-info">
                ${currentPage} / ${totalPage}
            </span>
            <a
                data-url="/company/order/branch/${encodeURIComponent(branchCode)}?page=${currentPage + 1}&limit=20"
                id="next-btn"
                class="next-btn"
            >&#62;</a>
        </div>
    `;

    resultsContainer.appendChild(orderElement); // Chèn nội dung vào container

    // Thêm sự kiện click cho các nút
    document.getElementById('prev-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const url = this.getAttribute('data-url'); // Lấy đường dẫn từ data-url
        fetchOrders(url); // Gọi hàm fetchOrders để lấy dữ liệu mới
    });

    document.getElementById('next-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const url = this.getAttribute('data-url'); // Lấy đường dẫn từ data-url
        fetchOrders(url); // Gọi hàm fetchOrders để lấy dữ liệu mới
    });
}

function minOfmaxType(min, max, total, currentPage, totalPage, branchCode,type) {
    console.log('vao ham type:');

    const resultsContainer = document.getElementById('minOfmax');
    resultsContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

    const orderElement = document.createElement('div');
    orderElement.classList.add('order-current');

    // Tạo nội dung HTML
    orderElement.innerHTML = `
        <div class="of">
            <div>${min} - ${max}</div> 
            <div> of </div> 
            <div>${total}</div>
        </div>
        
        <div class="pagination">
            <a
                data-url="/company/order/branch/type/${encodeURIComponent(branchCode)}?Loai=${type}&page=${currentPage - 1}&limit=20"
                id="prev-btn"
                class="prev-btn"
            >&#60;
            </a>
            <span class="pagination-info">
                ${currentPage} / ${totalPage}
            </span>
            <a
                data-url="/company/order/branch/type/${encodeURIComponent(branchCode)}?Loai=${type}&page=${currentPage + 1}&limit=20"
                id="next-btn"
                class="next-btn"
            >&#62;
            </a>
        </div>
    `;

    resultsContainer.appendChild(orderElement); // Chèn nội dung vào container

    // Thêm sự kiện click cho các nút
    document.getElementById('prev-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const url = this.getAttribute('data-url'); // Lấy đường dẫn từ data-url
        console.log(url);
        fetchOrdersType(url); // Gọi hàm fetchOrders để lấy dữ liệu mới
    });

    document.getElementById('next-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const url = this.getAttribute('data-url'); // Lấy đường dẫn từ data-url
        console.log(url);
        fetchOrdersType(url); // Gọi hàm fetchOrders để lấy dữ liệu mới
    });
}

function fetchOrders(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Lưu dữ liệu mới vào orderData
            orderData = data;

            // Hiển thị lại dữ liệu với trang mới
            renderOrders(orderData.orders); 
            minOfmax(
                orderData.min,
                orderData.max,
                orderData.totalOrders,
                orderData.currentPage,
                orderData.totalPage,
                orderData.branchCode
            );
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
function fetchOrdersType(url) {
    console.log('goi ham fetch type:');
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Lưu dữ liệu mới vào orderData
            orderData = data;

            // Hiển thị lại dữ liệu với trang mới
            renderOrders(orderData.orders); 
            minOfmaxType(
                orderData.min,
                orderData.max,
                orderData.totalOrders,
                orderData.currentPage,
                orderData.totalPage,
                orderData.branchCode,
                type
            );
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

$(document).ready(function () {
    // Gắn sự kiện click cho các phần tử trong .manage-order-title
    $(".manage-order-title div").on("click", function () {
      // Lấy ID của phần tử được click
      const clickedId = $(this).attr("id");
      console.log("Clicked element ID:", clickedId);
  
      // Thực hiện hành động tùy theo ID
      if (clickedId === "tructiep") {
        const branchCode = branchID;
        type='T';

        if (branchCode){
            console.log('chi nhanh hien tai:',branchCode)

            const url = `/company/order/branch/type/${branchCode}?Loai=T&page=1&limit=20`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Giả sử API trả về JSON
            })
            .then(data => {
                // Lưu dữ liệu vào đối tượng orderData
                orderData = data;
                // Hiển thị dữ liệu hoặc thực hiện các thao tác
                renderOrders(orderData.orders); // Hiển thị danh sách orders
                minOfmaxType(orderData.min, orderData.max, orderData.totalOrders, orderData.currentPage, orderData.totalPage,data.branchCode,type);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
        else{
            alert('Nhập chi nhánh bạn muốn tìm trước!');
        }
        

      } else if (clickedId === "online") {
        type='O';
        const branchCode = branchID;
        if (branchCode){
            console.log('chi nhanh hien tai:',branchCode)

            const url = `/company/order/branch/type/${branchCode}?Loai=O&page=1&limit=20`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Giả sử API trả về JSON
            })
            .then(data => {
                // Lưu dữ liệu vào đối tượng orderData
                orderData = data;
                // Hiển thị dữ liệu hoặc thực hiện các thao tác
                renderOrders(orderData.orders); // Hiển thị danh sách orders
                minOfmaxType(orderData.min, orderData.max, orderData.totalOrders, orderData.currentPage, orderData.totalPage,data.branchCode,type);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
        else{
            alert('Nhập chi nhánh bạn muốn tìm trước!');
        }
        
      } else if (clickedId === "giaohang") {
        type='G';
        const branchCode = branchID;
        if (branchCode){
            console.log('chi nhanh hien tai:',branchCode)

            const url = `/company/order/branch/type/${branchCode}?Loai=G&page=1&limit=20`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Giả sử API trả về JSON
            })
            .then(data => {
                // Lưu dữ liệu vào đối tượng orderData
                orderData = data;
                // Hiển thị dữ liệu hoặc thực hiện các thao tác
                renderOrders(orderData.orders); // Hiển thị danh sách orders
                minOfmaxType(orderData.min, orderData.max, orderData.totalOrders, orderData.currentPage, orderData.totalPage,data.branchCode,type);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
        else{
            alert('Nhập chi nhánh bạn muốn tìm trước!');
        }
        
      } else {
        alert("Unknown action!");
      }
  
      // Thêm hiệu ứng highlight cho phần tử được click (tùy chọn)
      $(".manage-order-title div").removeClass("active"); // Xóa lớp active cũ
      $(this).addClass("active"); // Thêm lớp active cho phần tử được click
    });
  });