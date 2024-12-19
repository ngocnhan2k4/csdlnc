$(document).ready(function () {
    // Sử dụng event delegation để gắn sự kiện cho các phần tử mới được render
    $(document).on("change", ".check-box-service", function () {
      const maMonAn = $(this).data("id");
      const maChiNhanh = $(this).data("branch");
      console.log("Ma chi nhanh:", maChiNhanh);
      const tinhTrang = $(this).is(":checked")
        ? "N'Có phục vụ'"
        : "N'Không phục vụ'"; // Xác định trạng thái
  
      // Gửi yêu cầu cập nhật tới server
      $.ajax({
        url: "/company/dish/updateStatusDish",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          maMonAn: maMonAn,
          tinhTrang: tinhTrang,
          maChiNhanh: maChiNhanh,
        }),
  
        success: function (data) {
          if (data.success) {
            alert(
              `Cập nhật trạng thái món ăn chi nhánh ${maChiNhanh} thành ${tinhTrang} thành công`
            );
          } else {
            console.error("Cập nhật thất bại:", data.message);
          }
        },
        error: function (xhr, status, error) {
          console.error("Lỗi:", error);
        },
      });
    });
  });
  

$(document).ready(function () {
    var resultsArray = [];
  
    $("#search-input").on("submit", function (e) {
      e.preventDefault();
  
      var query = $('input[name="query"]').val();
      const branchID = $('input[name="query"]').data("chinhanh");
  
      var page = 1;
      var limit = 10;
  
      var url = "/company/dish/searchDishInBranch?nameDish=" + query + "&branch=" + branchID + "&page=" + page + "&limit=" + limit;
  
      console.log(url);
      $.ajax({
        url: url,
        method: "GET",
        success: function (response) {
  
          // Kiểm tra nếu dữ liệu trả về là mảng
          if (response && Array.isArray(response)) {
            resultsArray = response; // Cập nhật mảng với dữ liệu trả về

            if (resultsArray.length > 0) {
                document.getElementById('listDish').style.display = 'none';
                document.getElementById('pagi-hbs').style.display = 'none';
                // Nếu mảng có dữ liệu, render trực tiếp lên HTML
                var htmlContent = '';
          
                resultsArray.forEach(function(dish) {
                  htmlContent += `
                    <div class="flex-dish">
                      <div class="dish">
                        <div>
                          <h2>${dish.TenMonAn}</h2>
                          <p>${dish.MoTa}</p>
                          <p class="price">Giá: ${dish.GiaHienTai}</p>
                        </div>
                        <div>
                          <img src="${dish.HinhAnh}" alt="${dish.TenMonAn}" />
                        </div>
                      </div>
                      <input 
                        class="check-box-service" 
                        type="checkbox" 
                        id="check-${dish.MaMonAn}" 
                        data-id="${dish.MaMonAn}"
                        data-branch="${dish.MaChiNhanh}"
                        ${dish.TinhTrangPhucVu === "Có phục vụ" ? 'checked' : ''}
                      >
                    </div>
                  `;
                });
          
                // Chèn HTML vào phần tử listDish
                document.getElementById("list-by-query").innerHTML = htmlContent;
              } else {
                // Nếu mảng không có dữ liệu, có thể hiển thị thông báo
                document.getElementById("list-by-query").innerHTML = '<p>Không tìm thấy món ăn.</p>';
              }

          } else {
            console.error("Dữ liệu trả về không phải dạng mảng");
          }
        },
        error: function (xhr, status, error) {
          console.error(error);
        }
      });
    });
  });
  
