const app = new Vue({
    el: "#app", // Gắn Vue.js vào phần tử có id "app"
    data: {
        revenue: [], // Dữ liệu doanh thu từ API
    },
    methods: {
        async fetchRevenue(type) {
            try {
                // Gửi yêu cầu GET đến API
                const response = await axios.get(`/company/revenue/${type}`);
                // Gán dữ liệu nhận được vào revenue
                this.revenue = response.data;
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        },
    },
    mounted() {
        // Gọi API khi ứng dụng được mount, ví dụ với type mặc định là "yearly"
        this.fetchRevenue("year");
    },
});
