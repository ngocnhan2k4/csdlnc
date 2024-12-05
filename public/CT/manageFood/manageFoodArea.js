
const app = new Vue({
    el: "#app", // Gắn vào phần tử có id "app"
    data: {
      listFoodArea: [],
    },
    methods: {
      async fetchAreas() {
        try {
          const response = await axios.get("/company/dish/byarea/1?page=1&limit=3"); // Gọi API
          this.listFoodArea = response.data; // Gán dữ liệu trả về vào area
          console.log(this.foodArea);
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        }
      },
      goToArea(tenKhuVuc) {
        console.log(tenKhuVuc);
          // Chuyển hướng đến trang khác
          // window.location.href = `/company/dish/byarea/tenKhuVuc?page=2&limit=3`;
      }
    },
    mounted() {
      this.fetchAreas(); // Tự động gọi API khi ứng dụng được mount
    },
  });
  