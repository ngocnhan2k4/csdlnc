
const app = new Vue({
  el: "#app", // Gắn vào phần tử có id "app"
  data: {
    area: [],
  },
  methods: {
    async fetchAreas() {
      try {
        const response = await axios.get("/company/area"); // Gọi API
        this.area = response.data; // Gán dữ liệu trả về vào area
        console.log(this.area);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    },
    goToArea(idArea) {
      //console.log(tenKhuVuc);
        // Chuyển hướng đến trang khác
       window.location.href = `/company/dish/byarea/${idArea+1}?index=Hotpot&page=1&limit=3`;
    }
  },
  mounted() {
    this.fetchAreas(); // Tự động gọi API khi ứng dụng được mount
  },
});
